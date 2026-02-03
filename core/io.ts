/**
 * Input/Output Module
 * File handling, data loading, and export functionality
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Transaction,
  LedgerEntry,
  Finding,
  Score,
  CompositeScore,
  PipelineConfig,
  EvidenceRef,
  TestimonyEvent,
  TrialState,
  Report,
} from './types';
import {
  parseCSV,
  normalizeBankTransaction,
  normalizeGLEntry,
  normalizeInvoice,
  normalizeWire,
  normalizePayroll,
  hashData,
} from './normalize';
import { EvidenceStore } from './evidence_refs';

// ============================================================================
// FILE OPERATIONS
// ============================================================================

export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function readFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

export function writeFile(filePath: string, content: string): void {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

export function writeJSON(filePath: string, data: unknown, pretty: boolean = true): void {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  writeFile(filePath, content);
}

export function readJSON<T>(filePath: string): T {
  const content = readFile(filePath);
  return JSON.parse(content) as T;
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function listFiles(dirPath: string, extension?: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  if (extension) {
    return files.filter(f => f.endsWith(extension));
  }

  return files;
}

// ============================================================================
// DATA LOADING
// ============================================================================

export interface LoadResult<T> {
  data: T[];
  evidence_refs: EvidenceRef[];
  errors: string[];
  stats: {
    total_rows: number;
    valid_rows: number;
    error_rows: number;
    file_hash: string;
  };
}

export function loadBankTransactions(
  filePath: string,
  actor: string = 'system'
): LoadResult<Transaction> {
  const content = readFile(filePath);
  const fileHash = hashData(content);
  const rows = parseCSV(content);

  const data: Transaction[] = [];
  const evidenceRefs: EvidenceRef[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    try {
      const { transaction, evidenceRef } = normalizeBankTransaction(
        row,
        path.basename(filePath),
        index + 2,  // +2 for 1-indexed and header row
        actor
      );
      data.push(transaction);
      evidenceRefs.push(evidenceRef);
    } catch (err) {
      errors.push(`Row ${index + 2}: ${(err as Error).message}`);
    }
  });

  return {
    data,
    evidence_refs: evidenceRefs,
    errors,
    stats: {
      total_rows: rows.length,
      valid_rows: data.length,
      error_rows: errors.length,
      file_hash: fileHash,
    },
  };
}

export function loadGLEntries(
  filePath: string,
  actor: string = 'system'
): LoadResult<LedgerEntry> {
  const content = readFile(filePath);
  const fileHash = hashData(content);
  const rows = parseCSV(content);

  const data: LedgerEntry[] = [];
  const evidenceRefs: EvidenceRef[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    try {
      const { entry, evidenceRef } = normalizeGLEntry(
        row,
        path.basename(filePath),
        index + 2,
        actor
      );
      data.push(entry);
      evidenceRefs.push(evidenceRef);
    } catch (err) {
      errors.push(`Row ${index + 2}: ${(err as Error).message}`);
    }
  });

  return {
    data,
    evidence_refs: evidenceRefs,
    errors,
    stats: {
      total_rows: rows.length,
      valid_rows: data.length,
      error_rows: errors.length,
      file_hash: fileHash,
    },
  };
}

export function loadInvoices(
  filePath: string,
  actor: string = 'system'
): LoadResult<Transaction> {
  const content = readFile(filePath);
  const fileHash = hashData(content);
  const rows = parseCSV(content);

  const data: Transaction[] = [];
  const evidenceRefs: EvidenceRef[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    try {
      const { transaction, evidenceRef } = normalizeInvoice(
        row,
        path.basename(filePath),
        index + 2,
        actor
      );
      data.push(transaction);
      evidenceRefs.push(evidenceRef);
    } catch (err) {
      errors.push(`Row ${index + 2}: ${(err as Error).message}`);
    }
  });

  return {
    data,
    evidence_refs: evidenceRefs,
    errors,
    stats: {
      total_rows: rows.length,
      valid_rows: data.length,
      error_rows: errors.length,
      file_hash: fileHash,
    },
  };
}

export function loadWires(
  filePath: string,
  actor: string = 'system'
): LoadResult<Transaction> {
  const content = readFile(filePath);
  const fileHash = hashData(content);
  const rows = parseCSV(content);

  const data: Transaction[] = [];
  const evidenceRefs: EvidenceRef[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    try {
      const { transaction, evidenceRef } = normalizeWire(
        row,
        path.basename(filePath),
        index + 2,
        actor
      );
      data.push(transaction);
      evidenceRefs.push(evidenceRef);
    } catch (err) {
      errors.push(`Row ${index + 2}: ${(err as Error).message}`);
    }
  });

  return {
    data,
    evidence_refs: evidenceRefs,
    errors,
    stats: {
      total_rows: rows.length,
      valid_rows: data.length,
      error_rows: errors.length,
      file_hash: fileHash,
    },
  };
}

export function loadPayroll(
  filePath: string,
  actor: string = 'system'
): LoadResult<Transaction> {
  const content = readFile(filePath);
  const fileHash = hashData(content);
  const rows = parseCSV(content);

  const data: Transaction[] = [];
  const evidenceRefs: EvidenceRef[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    try {
      const { transaction, evidenceRef } = normalizePayroll(
        row,
        path.basename(filePath),
        index + 2,
        actor
      );
      data.push(transaction);
      evidenceRefs.push(evidenceRef);
    } catch (err) {
      errors.push(`Row ${index + 2}: ${(err as Error).message}`);
    }
  });

  return {
    data,
    evidence_refs: evidenceRefs,
    errors,
    stats: {
      total_rows: rows.length,
      valid_rows: data.length,
      error_rows: errors.length,
      file_hash: fileHash,
    },
  };
}

// ============================================================================
// TESTIMONY STREAM LOADING
// ============================================================================

export function loadTestimonyStream(filePath: string): TestimonyEvent[] {
  const content = readFile(filePath);
  const lines = content.split('\n').filter(line => line.trim());

  const events: TestimonyEvent[] = [];

  lines.forEach((line, index) => {
    try {
      const event = JSON.parse(line) as TestimonyEvent;
      events.push(event);
    } catch (err) {
      console.warn(`Invalid testimony event at line ${index + 1}: ${(err as Error).message}`);
    }
  });

  return events;
}

export function* streamTestimonyEvents(filePath: string): Generator<TestimonyEvent> {
  const content = readFile(filePath);
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      yield JSON.parse(line) as TestimonyEvent;
    } catch {
      // Skip invalid lines
    }
  }
}

// ============================================================================
// CONFIG LOADING
// ============================================================================

export function loadPipelineConfig(filePath: string): PipelineConfig {
  const config = readJSON<PipelineConfig>(filePath);

  // Apply defaults
  config.modules_enabled = config.modules_enabled || [
    'records_intelligence',
    'reconciliation',
    'cfo',
    'sec',
    'forensic',
    'fincen_aml',
    'controls_sox',
    'ap_procurement',
    'payroll_forensics',
    'statistical_anomalies',
    'asset_tracing',
    'litigation_finance',
    'expert_witness',
    'jury_narrative',
    'settlement_engine',
  ];

  config.scoring_weights = config.scoring_weights || {};
  config.thresholds = config.thresholds || {
    risk_score_alert: 60,
    confidence_minimum: 0.5,
    materiality: 10000,
  };

  config.options = config.options || {
    redact_pii: false,
    include_raw_data: false,
    generate_visualizations: true,
    parallel_processing: true,
  };

  return config;
}

export function createDefaultConfig(
  matterId: string,
  inputDir: string,
  outputDir: string
): PipelineConfig {
  return {
    matter: {
      matter_id: matterId,
      matter_name: 'Financial Investigation',
      client_name: 'Client',
      period_start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      entities_in_scope: [],
      investigation_type: 'fraud',
      currency: 'USD',
      confidentiality_level: 'confidential',
      team: {
        lead: 'System',
        members: [],
      },
      metadata: {},
    },
    input_dir: inputDir,
    output_dir: outputDir,
    modules_enabled: [
      'records_intelligence',
      'reconciliation',
      'cfo',
      'sec',
      'forensic',
      'fincen_aml',
      'controls_sox',
      'ap_procurement',
      'payroll_forensics',
      'statistical_anomalies',
      'asset_tracing',
      'litigation_finance',
      'expert_witness',
      'jury_narrative',
      'settlement_engine',
    ],
    scoring_weights: {},
    thresholds: {
      risk_score_alert: 60,
      confidence_minimum: 0.5,
      materiality: 10000,
    },
    options: {
      redact_pii: false,
      include_raw_data: false,
      generate_visualizations: true,
      parallel_processing: true,
    },
  };
}

// ============================================================================
// OUTPUT EXPORT
// ============================================================================

export interface ExportOptions {
  format: 'json' | 'csv' | 'md';
  pretty: boolean;
  include_evidence: boolean;
}

export function exportFindings(
  findings: Finding[],
  filePath: string,
  options: ExportOptions = { format: 'json', pretty: true, include_evidence: true }
): void {
  if (options.format === 'json') {
    const data = options.include_evidence
      ? findings
      : findings.map(f => ({ ...f, evidence_refs: [`${f.evidence_refs.length} refs`] }));
    writeJSON(filePath, data, options.pretty);
  } else if (options.format === 'csv') {
    const headers = ['id', 'module', 'category', 'severity', 'confidence', 'title', 'description'];
    const rows = findings.map(f => [
      f.id,
      f.module,
      f.category,
      f.severity,
      f.confidence.toString(),
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.description.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    writeFile(filePath, csv);
  } else if (options.format === 'md') {
    const lines = findings.map(f => [
      `## ${f.title}`,
      '',
      `**Severity:** ${f.severity} | **Confidence:** ${(f.confidence * 100).toFixed(0)}%`,
      '',
      f.description,
      '',
      `**Rationale:** ${f.rationale}`,
      '',
    ].join('\n'));
    writeFile(filePath, lines.join('\n---\n\n'));
  }
}

export function exportScores(
  scores: Score[],
  filePath: string,
  options: ExportOptions = { format: 'json', pretty: true, include_evidence: true }
): void {
  if (options.format === 'json') {
    writeJSON(filePath, scores, options.pretty);
  } else if (options.format === 'csv') {
    const headers = ['module', 'score_type', 'value', 'confidence', 'interpretation'];
    const rows = scores.map(s => [
      s.module,
      s.score_type,
      s.value.toString(),
      s.confidence.toString(),
      `"${s.interpretation.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    writeFile(filePath, csv);
  } else if (options.format === 'md') {
    const lines = [
      '| Module | Score | Confidence | Status |',
      '|--------|-------|------------|--------|',
      ...scores.map(s => {
        const status = s.value >= 80 ? 'CRITICAL' : s.value >= 60 ? 'HIGH' : s.value >= 40 ? 'MEDIUM' : 'LOW';
        return `| ${s.module} | ${s.value.toFixed(1)} | ${(s.confidence * 100).toFixed(0)}% | ${status} |`;
      }),
    ];
    writeFile(filePath, lines.join('\n'));
  }
}

// ============================================================================
// TRIAL STATE PERSISTENCE
// ============================================================================

export function saveTrialState(state: TrialState, filePath: string): void {
  writeJSON(filePath, state, true);
}

export function loadTrialState(filePath: string): TrialState | null {
  if (!fileExists(filePath)) {
    return null;
  }
  return readJSON<TrialState>(filePath);
}

// ============================================================================
// REPORT EXPORT
// ============================================================================

export function exportReport(report: Report, outputDir: string): void {
  ensureDirectory(outputDir);

  // Main markdown report
  const mdPath = path.join(outputDir, 'SUMMARY_REPORT.md');
  const mdContent = formatReportMarkdown(report);
  writeFile(mdPath, mdContent);

  // JSON version
  const jsonPath = path.join(outputDir, 'report.json');
  writeJSON(jsonPath, report, true);
}

function formatReportMarkdown(report: Report): string {
  const lines: string[] = [
    `# ${report.title}`,
    '',
    `Generated: ${report.generated_at}`,
    `Report ID: ${report.id}`,
    '',
  ];

  report.sections.forEach(section => {
    lines.push(`## ${section.title}`);
    lines.push('');
    lines.push(section.content);
    lines.push('');

    if (section.tables) {
      section.tables.forEach(table => {
        lines.push(`### ${table.title}`);
        lines.push('');
        lines.push(`| ${table.headers.join(' | ')} |`);
        lines.push(`| ${table.headers.map(() => '---').join(' | ')} |`);
        table.rows.forEach(row => {
          lines.push(`| ${row.join(' | ')} |`);
        });
        lines.push('');
      });
    }
  });

  return lines.join('\n');
}
