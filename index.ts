/**
 * Financial Intelligence System v5.0
 * Main Entry Point
 *
 * Elite Financial Intelligence & Litigation System for forensic accounting,
 * fraud detection, AML compliance, SEC disclosure analysis, expert witness
 * support, and real-time trial response.
 */

// Core Types
export type {
  Entity,
  Account,
  Transaction,
  LedgerEntry,
  Document,
  EvidenceRef,
  Finding,
  Score,
  CompositeScore,
  ModuleResult,
  PipelineConfig,
  MatterContext,
  TestimonyEvent,
  TrialAction,
  TrialState,
} from './core/types';

// Core Functions
export {
  loadBankTransactions,
  loadGLEntries,
  loadInvoices,
  loadWires,
  loadPayroll,
  loadTestimonyStream,
  loadTrialState,
  saveTrialState,
  loadPipelineConfig,
  createDefaultConfig,
  writeJSON,
  writeFile,
  ensureDirectory,
  fileExists,
} from './core/io';

export {
  normalizeBankTransaction,
  normalizeGLEntry,
  normalizeInvoice,
  normalizeWire,
  normalizePayroll,
} from './core/normalize';

export {
  calculateScore,
  scoreFromFindings,
  calculateCompositeScore,
  calculateTrialMomentumScore,
  MODULE_WEIGHTS,
} from './core/scoring';

export {
  EvidenceStore,
  createEvidenceRef,
} from './core/evidence_refs';

export {
  generateFindingExplanation,
  generateScoreExplanation,
  generateRecommendations,
} from './core/explain';

export {
  redactPII,
  redactSSN,
  redactAccountNumber,
  redactName,
  redactText,
} from './core/redact';

export {
  ReportBuilder,
  generateSummaryReportMarkdown,
} from './core/report_builder';

// Pipeline
export {
  runPipeline,
  PipelineResult,
} from './workflows/pipeline';

// Forensic Module
export { run as runForensicModule } from './modules/forensic';
export {
  detectRoundDollarAmounts,
  detectWeekendHolidayActivity,
  detectDuplicateTransactions,
  detectUnusualTiming,
  detectJournalEntryAnomalies,
  detectVendorFraudIndicators,
  analyzeFunnelPatterns,
} from './modules/forensic/rules';

// Statistical Anomalies Module
export { run as runStatisticalAnomaliesModule } from './modules/statistical_anomalies';
export {
  analyzeBenford,
  generateBenfordFindings,
  analyzeSecondDigit,
} from './modules/statistical_anomalies/benford';
export {
  detectOutliersByZScore,
  detectOutliersByIQR,
  detectClustering,
  analyzeTimeSeries,
} from './modules/statistical_anomalies/outliers';

// Real-Time Trial Module
export {
  initializeTrialState,
  processLiveEvent,
  generateDashboard,
  generateActionsOutput,
} from './modules/realtime_trial';
export {
  detectContradictions,
  generateImpeachmentAction,
  scoreContradiction,
} from './modules/realtime_trial/impeachment';
export {
  detectObjectionPatterns,
  generateObjection,
} from './modules/realtime_trial/objections';
export {
  processRealTimeUpdate,
  updateMomentum,
  generateLiveInsights,
} from './modules/realtime_trial/live_updates';
export {
  evaluateStrategy,
  suggestTactics,
  assessRisk,
} from './modules/realtime_trial/strategy_engine';

// IRS Tax Defense Module
export { run as runTaxDefenseModule } from './modules/irs_tax_defense';
export {
  // Non-Filer Defense
  analyzeNonFilerCase,
  NON_FILER_LEGAL_FRAMEWORK,
  REASONABLE_CAUSE_CATEGORIES,
  NON_FILER_WORKFLOW,
  // SFR Attack
  analyzeSFRCase,
  SFR_LEGAL_FRAMEWORK,
  SFR_ATTACK_WORKFLOW,
  // Collection Defense
  analyzeCollectionCase,
  COLLECTION_LEGAL_FRAMEWORK,
  COLLECTION_DEFENSE_WORKFLOW,
  // Advanced Modules
  generateAppealsProtest,
  assessCriminalRisk,
  optimizePenaltyReduction,
  analyzeTranscript,
  buildAuditDefenseStrategy,
  buildOICStrategy,
  packageEvidence,
  // Litigation Modules
  analyzeForm433,
  buildTaxCourtPetition,
  calculateSettlementProbability,
  buildTrialStrategy,
  detectProcedureViolations,
  manageCaseMemory,
  buildDOJLitigationStrategy,
  buildRefundSuit,
  // Case Router & Orchestrator
  routeTaxCase,
  orchestrateTaxCase,
  MASTER_ORCHESTRATOR_WORKFLOW,
  // Tax Deadlines
  ANNUAL_INCOME_TAX_DEADLINES,
  getDeadlinesForEntity,
  getUpcomingDeadlines,
  generateDeadlineSummary,
  // Tax Law Reference
  TAX_LAW_SOURCES,
  IRC_SECTIONS_BY_CATEGORY,
  lookupIRCSection,
  lookupPenalty,
  generateLegalCitation,
} from './modules/irs_tax_defense';

// Workflow Intake
export {
  WORKFLOW_COMMANDS,
  WORKFLOW_REGISTRY,
  INTAKE_QUESTIONS,
  ACCOUNTING_SOFTWARE_FORMATS,
  processIntakeAnswers,
  getWorkflowRouting,
  triggerWorkflow,
  runMasterIntake,
  generateIntakeSummaryReport,
  type WorkflowType,
  type WorkflowConfig,
  type WorkflowRouting,
  type IntakeQuestion,
  type IntakeAnswer,
  type MasterIntakeResult,
} from './workflows/workflow_intake';

// Version Info
export const VERSION = '5.0.0';
export const BUILD_DATE = '2025-02-02';

/**
 * Main entry point for programmatic usage
 */
export async function analyze(
  inputDir: string,
  outputDir: string,
  matterId: string = 'DEFAULT'
): Promise<import('./workflows/pipeline').PipelineResult> {
  const { runPipeline } = await import('./workflows/pipeline');
  const { createDefaultConfig } = await import('./core/io');

  const config = createDefaultConfig(matterId, inputDir, outputDir);
  return runPipeline(config);
}

/**
 * Initialize real-time trial session
 */
export function initializeTrialSession(): import('./core/types').TrialState {
  const { initializeTrialState } = require('./modules/realtime_trial');
  return initializeTrialState();
}

/**
 * Process a single testimony event
 */
export function processTestimonyEvent(
  event: import('./core/types').TestimonyEvent,
  state: import('./core/types').TrialState,
  priorFindings: import('./core/types').Finding[] = []
): {
  updatedState: import('./core/types').TrialState;
  newActions: import('./core/types').TrialAction[];
  stateChanges: string[];
} {
  const { processLiveEvent } = require('./modules/realtime_trial');
  return processLiveEvent(event, state, priorFindings);
}
