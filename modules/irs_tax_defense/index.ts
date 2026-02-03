/**
 * IRS Tax Defense and Regulatory Controversy Module
 * Master Skill V3 - Integrated regulatory defense system
 */

import {
  ModuleResult,
  Finding,
  Score,
  Transaction,
  LedgerEntry,
} from '../../core/types';
import { generateId } from '../../core/normalize';
import { runAuditSelectionEngine } from './audit_selection';
import { runExaminationEngine } from './examination';
import { runPenaltyReliefEngine } from './penalty_relief';
import { runAppealsEngine } from './appeals';
import { runCollectionDefense } from './collection';
import { runLitigationPrep } from './litigation';
import { runSECComplianceEngine } from './sec_compliance';
import { detectCriminalExposure } from './criminal_detection';
import { calculateTaxDefenseScore } from './score';

// ============================================================================
// TYPES
// ============================================================================

export interface TaxDefenseContext {
  case_id: string;
  taxpayer_type: 'individual' | 'corporation' | 'partnership' | 'trust';
  tax_years: string[];
  audit_type?: 'correspondence' | 'office' | 'field' | 'eggshell' | 'reverse_eggshell';
  issues: TaxIssue[];
  transactions: Map<string, Transaction>;
  ledger_entries: Map<string, LedgerEntry>;
  documents: Map<string, any>;
  prior_findings?: Finding[];
}

export interface TaxIssue {
  id: string;
  type: string;
  irc_section: string;
  description: string;
  amount_at_issue: number;
  tax_years_affected: string[];
  irs_position?: string;
  taxpayer_position?: string;
  burden_of_proof: 'taxpayer' | 'irs';
  penalty_exposure?: PenaltyExposure[];
}

export interface PenaltyExposure {
  type: string;
  irc_section: string;
  rate: number;
  amount: number;
  relief_available: boolean;
  relief_basis?: string[];
}

export interface TaxDefenseCase {
  case_id: string;
  status: 'intake' | 'examination' | 'protest' | 'appeals' | 'collection' | 'litigation';
  phase: number;
  issues: TaxIssue[];
  findings: Finding[];
  risk_scores: {
    irs: number;
    sec: number;
    criminal: number;
  };
  action_plan: ActionItem[];
}

export interface ActionItem {
  priority: '7_day' | '30_day' | '90_day';
  action: string;
  responsible: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'complete';
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export async function run(context: any): Promise<ModuleResult> {
  const startTime = Date.now();
  const findings: Finding[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const taxContext: TaxDefenseContext = {
    case_id: context.config?.matter || generateId('TAX'),
    taxpayer_type: 'corporation',
    tax_years: extractTaxYears(context),
    transactions: context.transactions || new Map(),
    ledger_entries: context.ledger_entries || new Map(),
    documents: context.documents || new Map(),
    issues: [],
  };

  // FAILSAFE: Check for criminal exposure first
  const criminalCheck = detectCriminalExposure(taxContext);
  if (criminalCheck.exposure_detected) {
    return {
      module: 'irs_tax_defense',
      executed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      findings: [{
        id: generateId('CRIMINAL'),
        module: 'irs_tax_defense',
        title: 'Potential Criminal Exposure Detected',
        description: 'STOP - Potential Criminal Exposure — Counsel Required. ' +
          `Indicators: ${criminalCheck.indicators.join(', ')}`,
        severity: 'critical',
        confidence: criminalCheck.confidence,
        detected_at: new Date().toISOString(),
        evidence_refs: [],
        tags: ['criminal', 'fraud', 'stop'],
      }],
      score: {
        module: 'irs_tax_defense',
        score_type: 'Criminal Risk',
        value: 100,
        confidence: criminalCheck.confidence,
        drivers: [],
        thresholds: { critical: 80, high: 60, medium: 40, low: 20 },
        interpretation: 'CRIMINAL EXPOSURE - STOP ALL WORK - COUNSEL REQUIRED',
        recommendations: ['Immediately engage criminal tax counsel', 'Preserve all documents', 'Do not provide any statements'],
        calculated_at: new Date().toISOString(),
        evidence_refs: [],
      },
      artifacts: [],
      errors: [],
      warnings: ['CRIMINAL EXPOSURE DETECTED - MODULE HALTED'],
      metadata: { criminal_exposure: true },
    };
  }

  // Phase 1: Audit Selection Analysis
  console.log('  [IRS] Phase 1: Audit Selection Analysis');
  const auditFindings = await runAuditSelectionEngine(taxContext);
  findings.push(...auditFindings);

  // Phase 2: Examination Issue Development
  console.log('  [IRS] Phase 2: Examination Issue Development');
  const examFindings = await runExaminationEngine(taxContext);
  findings.push(...examFindings);

  // Phase 3: Penalty Relief Analysis
  console.log('  [IRS] Phase 3: Penalty Relief Analysis');
  const penaltyFindings = await runPenaltyReliefEngine(taxContext);
  findings.push(...penaltyFindings);

  // Phase 4: SEC Compliance Check
  console.log('  [IRS] Phase 4: SEC Compliance Risk');
  const secFindings = await runSECComplianceEngine(taxContext);
  findings.push(...secFindings);

  // Calculate scores
  const score = calculateTaxDefenseScore(findings);

  return {
    module: 'irs_tax_defense',
    executed_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    findings,
    score,
    artifacts: [],
    errors,
    warnings,
    metadata: {
      case_id: taxContext.case_id,
      tax_years: taxContext.tax_years,
      issues_count: taxContext.issues.length,
    },
  };
}

// ============================================================================
// INTAKE WORKFLOW
// ============================================================================

export async function runIntake(intakeData: IntakeData): Promise<TaxDefenseCase> {
  const case_id = generateId('TAX');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('IRS TAX DEFENSE SYSTEM - INTAKE WORKFLOW');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Case ID: ${case_id}`);
  console.log(`Taxpayer: ${intakeData.taxpayer_name}`);
  console.log(`Type: ${intakeData.taxpayer_type}`);
  console.log(`Tax Years: ${intakeData.tax_years.join(', ')}`);
  console.log('═══════════════════════════════════════════════════════════════');

  // Phase 1: Scope & Rights
  console.log('\n▶ PHASE 1: Scope & Rights Assessment');
  const rightsAssessment = assessTaxpayerRights(intakeData);

  // Phase 2: Evidence Mapping
  console.log('▶ PHASE 2: Evidence Mapping');
  const evidenceMap = mapEvidence(intakeData);

  // Phase 3: Issue Development
  console.log('▶ PHASE 3: Issue Development');
  const issues = developIssues(intakeData);

  // Phase 4: Risk Scoring
  console.log('▶ PHASE 4: Risk Scoring');
  const riskScores = calculateRiskScores(intakeData, issues);

  // Phase 5: Action Plan
  console.log('▶ PHASE 5: Action Plan Generation');
  const actionPlan = generateActionPlan(intakeData, issues, riskScores);

  const taxCase: TaxDefenseCase = {
    case_id,
    status: 'intake',
    phase: 1,
    issues,
    findings: [],
    risk_scores: riskScores,
    action_plan: actionPlan,
  };

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('INTAKE COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`IRS Risk Score: ${riskScores.irs}/100`);
  console.log(`SEC Risk Score: ${riskScores.sec}/100`);
  console.log(`Criminal Risk Score: ${riskScores.criminal}/100`);
  console.log(`Issues Identified: ${issues.length}`);
  console.log(`Action Items: ${actionPlan.length}`);
  console.log('═══════════════════════════════════════════════════════════════');

  return taxCase;
}

export interface IntakeData {
  taxpayer_name: string;
  taxpayer_type: 'individual' | 'corporation' | 'partnership' | 'trust';
  ein_or_ssn: string;
  tax_years: string[];
  audit_trigger?: string;
  irs_contact_date?: string;
  irs_notice_type?: string;
  issues_identified?: string[];
  documents_available?: string[];
  prior_audit_history?: string;
  representation_status?: 'self' | 'cpa' | 'attorney' | 'enrolled_agent';
  urgency?: 'routine' | 'elevated' | 'urgent' | 'emergency';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractTaxYears(context: any): string[] {
  const transactions = context.transactions as Map<string, Transaction>;
  const years = new Set<string>();

  transactions.forEach(t => {
    const year = t.date.substring(0, 4);
    years.add(year);
  });

  return Array.from(years).sort();
}

function assessTaxpayerRights(data: IntakeData): any {
  return {
    pub_1_rights: [
      'Right to be informed',
      'Right to quality service',
      'Right to pay no more than correct amount',
      'Right to challenge IRS position and be heard',
      'Right to appeal in independent forum',
      'Right to finality',
      'Right to privacy',
      'Right to confidentiality',
      'Right to retain representation',
      'Right to fair and just tax system',
    ],
    representation_status: data.representation_status || 'self',
    power_of_attorney_needed: data.representation_status !== 'self',
    statute_of_limitations: calculateSOL(data.tax_years),
  };
}

function calculateSOL(taxYears: string[]): Record<string, string> {
  const sol: Record<string, string> = {};
  const currentYear = new Date().getFullYear();

  taxYears.forEach(year => {
    const yearNum = parseInt(year);
    // Generally 3 years from filing, assume April 15
    const solDate = new Date(yearNum + 4, 3, 15);
    sol[year] = solDate.toISOString().split('T')[0];
  });

  return sol;
}

function mapEvidence(data: IntakeData): any {
  return {
    documents_needed: [
      'Tax returns for all years at issue',
      'All IRS correspondence',
      'Supporting schedules and workpapers',
      'Bank statements',
      'General ledger and journal entries',
      'Invoices and receipts',
      'Contracts and agreements',
    ],
    documents_available: data.documents_available || [],
    gaps: [],
  };
}

function developIssues(data: IntakeData): TaxIssue[] {
  const issues: TaxIssue[] = [];

  if (data.issues_identified) {
    data.issues_identified.forEach((issue, i) => {
      issues.push({
        id: generateId('ISS'),
        type: 'identified',
        irc_section: 'TBD',
        description: issue,
        amount_at_issue: 0,
        tax_years_affected: data.tax_years,
        burden_of_proof: 'taxpayer',
      });
    });
  }

  return issues;
}

function calculateRiskScores(data: IntakeData, issues: TaxIssue[]): { irs: number; sec: number; criminal: number } {
  let irsScore = 30; // Base score
  let secScore = 20;
  let criminalScore = 10;

  // Adjust based on factors
  if (data.urgency === 'emergency') irsScore += 30;
  if (data.urgency === 'urgent') irsScore += 20;

  if (data.taxpayer_type === 'corporation') {
    secScore += 20;
  }

  if (issues.length > 5) {
    irsScore += 15;
    criminalScore += 5;
  }

  // Cap scores
  return {
    irs: Math.min(irsScore, 100),
    sec: Math.min(secScore, 100),
    criminal: Math.min(criminalScore, 100),
  };
}

function generateActionPlan(data: IntakeData, issues: TaxIssue[], scores: any): ActionItem[] {
  const actions: ActionItem[] = [];

  // 7-day actions
  actions.push({
    priority: '7_day',
    action: 'Complete document collection checklist',
    responsible: 'Client',
    status: 'pending',
  });

  actions.push({
    priority: '7_day',
    action: 'Review IRS correspondence and deadlines',
    responsible: 'Tax Counsel',
    status: 'pending',
  });

  if (data.representation_status === 'self') {
    actions.push({
      priority: '7_day',
      action: 'Execute Power of Attorney (Form 2848)',
      responsible: 'Client/Counsel',
      status: 'pending',
    });
  }

  // 30-day actions
  actions.push({
    priority: '30_day',
    action: 'Complete issue development memo',
    responsible: 'Tax Counsel',
    status: 'pending',
  });

  actions.push({
    priority: '30_day',
    action: 'Prepare initial IDR response strategy',
    responsible: 'Tax Counsel',
    status: 'pending',
  });

  if (scores.sec > 40) {
    actions.push({
      priority: '30_day',
      action: 'SEC risk assessment and disclosure review',
      responsible: 'SEC Counsel',
      status: 'pending',
    });
  }

  // 90-day actions
  actions.push({
    priority: '90_day',
    action: 'Prepare penalty relief arguments',
    responsible: 'Tax Counsel',
    status: 'pending',
  });

  actions.push({
    priority: '90_day',
    action: 'Develop appeals strategy if needed',
    responsible: 'Tax Counsel',
    status: 'pending',
  });

  return actions;
}

// ============================================================================
// RE-EXPORT ALL MODULES
// ============================================================================

// Non-Filer Defense
export {
  analyzeNonFilerCase,
  LEGAL_FRAMEWORK as NON_FILER_LEGAL_FRAMEWORK,
  REASONABLE_CAUSE_CATEGORIES,
  IRS_NOTICE_PROGRESSION,
  RESOLUTION_PATHS,
  NON_FILER_WORKFLOW,
} from './non_filer_defense';

// SFR Attack
export {
  analyzeSFRCase,
  SFR_LEGAL_FRAMEWORK,
  determineProceduralPath,
  buildReconsiderationArgument,
  SFR_ATTACK_WORKFLOW,
} from './sfr_attack';

// Collection Defense
export {
  analyzeCollectionCase,
  COLLECTION_LEGAL_FRAMEWORK,
  COLLECTION_NOTICES,
  determineEnforcementStage,
  recommendCollectionAlternatives,
  generateLevyReleaseRequest,
  generateCDPHearingRequest,
  generateCNCRequest,
  generateInstallmentAgreementRequest,
  COLLECTION_DEFENSE_WORKFLOW,
} from './collection_defense';

// Advanced Modules
export {
  generateAppealsProtest,
  assessCriminalRisk,
  optimizePenaltyReduction,
  analyzeTranscript,
  buildAuditDefenseStrategy,
  buildOICStrategy,
  packageEvidence,
  APPEALS_LEGAL_FRAMEWORK,
  CRIMINAL_LEGAL_FRAMEWORK,
  TRANSACTION_CODES,
} from './advanced_modules';

// Litigation Modules
export {
  analyzeForm433,
  buildTaxCourtPetition,
  calculateSettlementProbability,
  buildTrialStrategy,
  detectProcedureViolations,
  manageCaseMemory,
  buildDOJLitigationStrategy,
  buildRefundSuit,
  LITIGATION_MODULE_WORKFLOWS,
} from './litigation_modules';

// Case Router
export {
  routeTaxCase,
  generateCaseRouterReport,
  CASE_ROUTER_WORKFLOW,
} from './case_router';

// Master Orchestrator
export {
  orchestrateTaxCase,
  generateOrchestratorReport,
  AVAILABLE_MODULES,
  MASTER_ORCHESTRATOR_WORKFLOW,
} from './master_orchestrator';

// Tax Deadlines
export {
  ANNUAL_INCOME_TAX_DEADLINES,
  ESTIMATED_TAX_DEADLINES,
  PAYROLL_TAX_DEADLINES,
  INFORMATION_RETURN_DEADLINES,
  INTERNATIONAL_FILING_DEADLINES,
  SPECIAL_DEADLINES,
  ANNUAL_TAX_CALENDAR,
  getDeadlinesForEntity,
  getUpcomingDeadlines,
  getPenaltyInfo,
  generateDeadlineSummary,
} from './tax_deadlines';

// Tax Law Reference
export {
  TAX_LAW_SOURCES,
  IRC_STRUCTURE,
  IRC_SECTIONS_BY_CATEGORY,
  IRS_PUBLICATIONS,
  IRM_REFERENCES,
  getIRCSectionUrl,
  getTreasuryRegUrl,
  getIRMUrl,
  getIRSPubUrl,
  lookupIRCSection,
  lookupPenalty,
  generateLegalCitation,
} from './tax_law_reference';

// Score
export { calculateTaxDefenseScore } from './score';

// Scorecard
export { generateScorecardReport } from './scorecard';

// Red Flags
export {
  PENALTY_REFERENCE,
  runRedFlagAnalysis,
  type RedFlagScorecard,
  type RedFlag,
  type FlaggedTransaction,
  type RedFlagAnalysisInput,
} from './red_flags';
