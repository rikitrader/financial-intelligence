/**
 * Analysis Pipeline
 * Orchestrates the full forensic investigation workflow
 */

import {
  PipelineConfig,
  Finding,
  Score,
  CompositeScore,
  ModuleResult,
  Transaction,
  LedgerEntry,
  Entity,
  Account,
} from '../core/types';
import {
  loadBankTransactions,
  loadGLEntries,
  loadInvoices,
  loadWires,
  loadPayroll,
  writeJSON,
  writeFile,
  fileExists,
} from '../core/io';
import { EvidenceStore } from '../core/evidence_refs';
import { calculateCompositeScore, MODULE_WEIGHTS } from '../core/scoring';
import { ReportBuilder, generateSummaryReportMarkdown } from '../core/report_builder';
import { exportAllReportsAsMarkdown } from '../core/markdown_exporter';
import {
  generateBarChart,
  generatePieChart,
  generateTimeline,
  generateRiskGauge,
  generateBenfordChart,
  saveGraphic,
} from '../core/graphics';
import * as path from 'path';

// Module imports
import { run as runForensic } from '../modules/forensic';
import { run as runStatisticalAnomalies } from '../modules/statistical_anomalies';
// Additional modules would be imported here

// ============================================================================
// PIPELINE RESULT
// ============================================================================

export interface PipelineResult {
  success: boolean;
  findings: Finding[];
  scores: Score[];
  compositeScore?: CompositeScore;
  moduleResults: ModuleResult[];
  errors: string[];
  warnings: string[];
  duration_ms: number;
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

export async function runPipeline(config: PipelineConfig): Promise<PipelineResult> {
  const startTime = Date.now();
  const findings: Finding[] = [];
  const scores: Score[] = [];
  const moduleResults: ModuleResult[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Initialize stores
  const transactions = new Map<string, Transaction>();
  const ledgerEntries = new Map<string, LedgerEntry>();
  const entities = new Map<string, Entity>();
  const accounts = new Map<string, Account>();
  const evidenceStore = new EvidenceStore();

  console.log('Phase 1: Data Acquisition & Integrity');
  console.log('--------------------------------------');

  // Load data files
  try {
    await loadAllData(
      config,
      transactions,
      ledgerEntries,
      evidenceStore,
      errors,
      warnings
    );

    console.log(`  Loaded ${transactions.size} transactions`);
    console.log(`  Loaded ${ledgerEntries.size} ledger entries`);
    console.log(`  Created ${evidenceStore.size()} evidence references`);
  } catch (err) {
    errors.push(`Data loading failed: ${(err as Error).message}`);
    return createFailedResult(errors, startTime);
  }

  console.log('\nPhase 2: Analysis Modules');
  console.log('-------------------------');

  // Create module context
  const context = {
    config,
    entities,
    accounts,
    transactions,
    ledger_entries: ledgerEntries,
    documents: new Map(),
    evidence_refs: evidenceStore.toMap(),
    all_findings: findings,
    all_scores: scores,
    logger: createLogger(),
    hasher: {
      hash: (data: string | Buffer) => require('crypto').createHash('sha256').update(data).digest('hex'),
      verify: (data: string | Buffer, hash: string) => require('crypto').createHash('sha256').update(data).digest('hex') === hash,
    },
  };

  // Run enabled modules
  for (const moduleName of config.modules_enabled) {
    try {
      const result = await runModule(moduleName, context);
      if (result) {
        moduleResults.push(result);
        findings.push(...result.findings);
        scores.push(result.score);
        errors.push(...result.errors);
        warnings.push(...result.warnings);

        console.log(`  ${moduleName}: ${result.findings.length} findings, score ${result.score.value.toFixed(1)}`);
      }
    } catch (err) {
      errors.push(`Module ${moduleName} failed: ${(err as Error).message}`);
      console.log(`  ${moduleName}: ERROR - ${(err as Error).message}`);
    }
  }

  console.log('\nPhase 3: Composite Scoring');
  console.log('--------------------------');

  // Calculate composite score
  let compositeScore: CompositeScore | undefined;
  if (scores.length > 0) {
    compositeScore = calculateCompositeScore(scores, config.scoring_weights || MODULE_WEIGHTS);
    console.log(`  Composite Risk Index: ${compositeScore.value.toFixed(1)}/100`);
    console.log(`  Confidence: ${(compositeScore.confidence * 100).toFixed(0)}%`);
  }

  console.log('\nPhase 4: Report Generation');
  console.log('--------------------------');

  // Generate reports
  try {
    await generateReports(config, findings, scores, compositeScore, evidenceStore);
    console.log('  Reports generated successfully');
  } catch (err) {
    errors.push(`Report generation failed: ${(err as Error).message}`);
  }

  const duration = Date.now() - startTime;
  console.log(`\nPipeline completed in ${duration}ms`);

  return {
    success: errors.length === 0,
    findings,
    scores,
    compositeScore,
    moduleResults,
    errors,
    warnings,
    duration_ms: duration,
  };
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadAllData(
  config: PipelineConfig,
  transactions: Map<string, Transaction>,
  ledgerEntries: Map<string, LedgerEntry>,
  evidenceStore: EvidenceStore,
  errors: string[],
  warnings: string[]
): Promise<void> {
  const inputDir = config.input_dir;

  // Load bank transactions
  const bankFile = path.join(inputDir, 'bank.csv');
  if (fileExists(bankFile)) {
    const result = loadBankTransactions(bankFile, 'pipeline');
    result.data.forEach(t => transactions.set(t.id, t));
    result.evidence_refs.forEach(e => evidenceStore.add(e));
    errors.push(...result.errors.map(e => `bank.csv: ${e}`));
  } else {
    warnings.push('bank.csv not found');
  }

  // Load GL entries
  const glFile = path.join(inputDir, 'gl.csv');
  if (fileExists(glFile)) {
    const result = loadGLEntries(glFile, 'pipeline');
    result.data.forEach(e => ledgerEntries.set(e.id, e));
    result.evidence_refs.forEach(e => evidenceStore.add(e));
    errors.push(...result.errors.map(e => `gl.csv: ${e}`));
  } else {
    warnings.push('gl.csv not found');
  }

  // Load invoices
  const invoiceFile = path.join(inputDir, 'invoices.csv');
  if (fileExists(invoiceFile)) {
    const result = loadInvoices(invoiceFile, 'pipeline');
    result.data.forEach(t => transactions.set(t.id, t));
    result.evidence_refs.forEach(e => evidenceStore.add(e));
    errors.push(...result.errors.map(e => `invoices.csv: ${e}`));
  }

  // Load wires
  const wiresFile = path.join(inputDir, 'wires.csv');
  if (fileExists(wiresFile)) {
    const result = loadWires(wiresFile, 'pipeline');
    result.data.forEach(t => transactions.set(t.id, t));
    result.evidence_refs.forEach(e => evidenceStore.add(e));
    errors.push(...result.errors.map(e => `wires.csv: ${e}`));
  }

  // Load payroll
  const payrollFile = path.join(inputDir, 'payroll.csv');
  if (fileExists(payrollFile)) {
    const result = loadPayroll(payrollFile, 'pipeline');
    result.data.forEach(t => transactions.set(t.id, t));
    result.evidence_refs.forEach(e => evidenceStore.add(e));
    errors.push(...result.errors.map(e => `payroll.csv: ${e}`));
  }
}

// ============================================================================
// MODULE EXECUTION
// ============================================================================

async function runModule(moduleName: string, context: any): Promise<ModuleResult | null> {
  switch (moduleName) {
    case 'forensic':
      return runForensic(context);
    case 'statistical_anomalies':
      return runStatisticalAnomalies(context);
    // Add other modules here
    case 'records_intelligence':
    case 'reconciliation':
    case 'cfo':
    case 'sec':
    case 'fincen_aml':
    case 'controls_sox':
    case 'ap_procurement':
    case 'payroll_forensics':
    case 'asset_tracing':
    case 'litigation_finance':
    case 'expert_witness':
    case 'jury_narrative':
    case 'settlement_engine':
      // Placeholder - return minimal result
      return createPlaceholderResult(moduleName);
    default:
      return null;
  }
}

function createPlaceholderResult(moduleName: string): ModuleResult {
  return {
    module: moduleName,
    executed_at: new Date().toISOString(),
    duration_ms: 0,
    findings: [],
    score: {
      module: moduleName,
      score_type: `${moduleName} Risk`,
      value: 0,
      confidence: 0.5,
      drivers: [],
      thresholds: { critical: 80, high: 60, medium: 40, low: 20 },
      interpretation: 'Module not fully implemented',
      recommendations: [],
      calculated_at: new Date().toISOString(),
      evidence_refs: [],
    },
    artifacts: [],
    errors: [],
    warnings: [`Module ${moduleName} is a placeholder`],
    metadata: {},
  };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

async function generateReports(
  config: PipelineConfig,
  findings: Finding[],
  scores: Score[],
  compositeScore: CompositeScore | undefined,
  evidenceStore: EvidenceStore
): Promise<void> {
  const outputDir = config.output_dir;

  // Build main report
  const builder = new ReportBuilder(config.matter, evidenceStore);
  builder.addFindings(findings);
  builder.addScores(scores);
  if (compositeScore) {
    builder.setCompositeScore(compositeScore);
  }

  const report = builder.build();
  const markdown = generateSummaryReportMarkdown(report);

  // Write reports
  writeFile(path.join(outputDir, 'SUMMARY_REPORT.md'), markdown);
  writeJSON(path.join(outputDir, 'report.json'), report);

  // Write findings by type
  const fraudFindings = findings.filter(f => f.module === 'forensic');
  writeJSON(path.join(outputDir, 'fraud_findings.json'), fraudFindings);

  const amlFindings = findings.filter(f => f.module === 'fincen_aml');
  writeJSON(path.join(outputDir, 'aml_findings.json'), amlFindings);

  const secFindings = findings.filter(f => f.module === 'sec');
  writeJSON(path.join(outputDir, 'sec_disclosure_findings.json'), secFindings);

  // Write risk report
  const riskReport = {
    generated_at: new Date().toISOString(),
    composite_score: compositeScore,
    module_scores: scores,
    findings_summary: {
      total: findings.length,
      by_severity: {
        critical: findings.filter(f => f.severity === 'critical').length,
        high: findings.filter(f => f.severity === 'high').length,
        medium: findings.filter(f => f.severity === 'medium').length,
        low: findings.filter(f => f.severity === 'low').length,
        info: findings.filter(f => f.severity === 'info').length,
      },
      by_module: Object.fromEntries(
        config.modules_enabled.map(m => [m, findings.filter(f => f.module === m).length])
      ),
    },
  };
  writeJSON(path.join(outputDir, 'risk_report.json'), riskReport);

  // Write CFO health summary
  const cfoHealth = {
    generated_at: new Date().toISOString(),
    overall_risk: compositeScore?.value || 0,
    module_highlights: scores.slice(0, 5).map(s => ({
      module: s.module,
      score: s.value,
      status: s.value >= 80 ? 'CRITICAL' : s.value >= 60 ? 'HIGH' : s.value >= 40 ? 'MEDIUM' : 'LOW',
    })),
    key_concerns: findings
      .filter(f => f.severity === 'critical' || f.severity === 'high')
      .slice(0, 5)
      .map(f => f.title),
  };
  writeJSON(path.join(outputDir, 'cfo_health.json'), cfoHealth);
}

// ============================================================================
// HELPERS
// ============================================================================

function createFailedResult(errors: string[], startTime: number): PipelineResult {
  return {
    success: false,
    findings: [],
    scores: [],
    moduleResults: [],
    errors,
    warnings: [],
    duration_ms: Date.now() - startTime,
  };
}

function createLogger() {
  return {
    debug: (msg: string, data?: unknown) => {
      if (process.env.DEBUG) console.log(`[DEBUG] ${msg}`, data || '');
    },
    info: (msg: string, data?: unknown) => {
      console.log(`[INFO] ${msg}`, data || '');
    },
    warn: (msg: string, data?: unknown) => {
      console.warn(`[WARN] ${msg}`, data || '');
    },
    error: (msg: string, data?: unknown) => {
      console.error(`[ERROR] ${msg}`, data || '');
    },
  };
}
