/**
 * Core Type Definitions for Financial Intelligence System
 * All modules share these canonical types for consistency and traceability
 */

// ============================================================================
// CHAIN OF CUSTODY & EVIDENCE
// ============================================================================

export interface ChainOfCustodyEvent {
  timestamp: string;
  actor: string;
  action: 'acquired' | 'transformed' | 'verified' | 'exported' | 'reviewed';
  source_hash: string;
  result_hash?: string;
  tool_version?: string;
  notes?: string;
}

export interface EvidenceRef {
  id: string;
  type: 'transaction' | 'document' | 'ledger_entry' | 'bank_record' | 'invoice' | 'wire' | 'payroll' | 'testimony' | 'exhibit';
  source_file: string;
  source_row_id: string | number;
  canonical_id: string;
  description: string;
  hash?: string;
  chain_of_custody: ChainOfCustodyEvent[];
}

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Entity {
  id: string;
  type: 'individual' | 'corporation' | 'partnership' | 'trust' | 'government' | 'unknown';
  names: string[];  // All known names/aliases
  identifiers: EntityIdentifier[];
  addresses: Address[];
  relationships: EntityRelationship[];
  risk_flags: string[];
  evidence_refs: string[];  // IDs linking to EvidenceRef
  metadata: Record<string, unknown>;
}

export interface EntityIdentifier {
  type: 'ein' | 'ssn' | 'tin' | 'duns' | 'lei' | 'account_number' | 'vendor_id' | 'employee_id' | 'other';
  value: string;
  verified: boolean;
  source: string;
}

export interface Address {
  type: 'registered' | 'mailing' | 'physical' | 'billing' | 'unknown';
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  valid_from?: string;
  valid_to?: string;
}

export interface EntityRelationship {
  target_entity_id: string;
  relationship_type: 'owns' | 'controls' | 'employs' | 'directs' | 'related_to' | 'vendor_of' | 'customer_of' | 'subsidiary_of' | 'parent_of';
  ownership_percentage?: number;
  effective_date?: string;
  end_date?: string;
  evidence_refs: string[];
}

// ============================================================================
// ACCOUNTS
// ============================================================================

export interface Account {
  id: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'bank' | 'unknown';
  sub_type?: string;  // e.g., 'cash', 'receivable', 'payable'
  entity_id: string;
  institution?: string;
  currency: string;
  status: 'active' | 'closed' | 'frozen' | 'unknown';
  opened_date?: string;
  closed_date?: string;
  evidence_refs: string[];
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export interface Transaction {
  id: string;
  transaction_date: string;
  posted_date?: string;
  amount: number;
  currency: string;
  direction: 'debit' | 'credit' | 'unknown';
  method: 'wire' | 'ach' | 'check' | 'cash' | 'card' | 'journal' | 'internal' | 'unknown';

  // Parties
  from_account_id?: string;
  from_entity_id?: string;
  to_account_id?: string;
  to_entity_id?: string;

  // Descriptors
  description: string;
  reference_number?: string;
  memo?: string;
  category?: string;

  // Traceability
  source_row_id: string | number;
  source_file: string;
  canonical_id: string;

  // Flags
  risk_flags: string[];
  matched_to?: string[];  // IDs of matched counterpart transactions

  evidence_refs: string[];
  metadata: Record<string, unknown>;
}

// ============================================================================
// LEDGER ENTRIES
// ============================================================================

export interface LedgerEntry {
  id: string;
  entry_date: string;
  posting_date: string;
  period: string;  // e.g., '2024-01'

  account_id: string;
  account_number: string;
  account_name: string;

  debit_amount?: number;
  credit_amount?: number;
  balance?: number;
  currency: string;

  journal_id?: string;
  description: string;
  reference?: string;
  created_by?: string;
  approved_by?: string;

  source_row_id: string | number;
  source_file: string;
  canonical_id: string;

  risk_flags: string[];
  evidence_refs: string[];
  metadata: Record<string, unknown>;
}

// ============================================================================
// DOCUMENTS
// ============================================================================

export interface Document {
  id: string;
  type: 'invoice' | 'contract' | 'bank_statement' | 'wire_confirmation' | 'check_image' | 'email' | 'report' | 'filing' | 'other';
  filename: string;
  file_path: string;
  file_hash: string;
  mime_type: string;

  document_date?: string;
  received_date?: string;

  title?: string;
  description?: string;

  related_entity_ids: string[];
  related_transaction_ids: string[];

  extracted_data?: Record<string, unknown>;

  chain_of_custody: ChainOfCustodyEvent[];
  evidence_refs: string[];
}

// ============================================================================
// FINDINGS
// ============================================================================

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingStatus = 'open' | 'confirmed' | 'refuted' | 'inconclusive';

export interface CounterHypothesis {
  hypothesis: string;
  likelihood: 'high' | 'medium' | 'low';
  evidence_for: string[];
  evidence_against: string[];
  testing_required?: string;
}

export interface Finding {
  id: string;
  module: string;
  category: string;
  title: string;
  description: string;

  severity: FindingSeverity;
  status: FindingStatus;
  confidence: number;  // 0-1

  rationale: string;
  methodology?: string;

  evidence_refs: string[];
  related_entity_ids: string[];
  related_transaction_ids: string[];
  related_account_ids: string[];

  counter_hypotheses: CounterHypothesis[];

  suggested_strengthening?: string[];  // Additional evidence that would strengthen finding

  financial_impact?: {
    amount_low: number;
    amount_high: number;
    amount_best_estimate: number;
    currency: string;
    period?: string;
  };

  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

// ============================================================================
// SCORING
// ============================================================================

export interface ScoreDriver {
  factor: string;
  weight: number;
  raw_score: number;
  weighted_contribution: number;
  evidence_refs: string[];
  explanation: string;
}

export interface Score {
  module: string;
  score_type: string;
  value: number;  // 0-100
  confidence: number;  // 0-1

  drivers: ScoreDriver[];

  trend?: 'improving' | 'stable' | 'deteriorating' | 'unknown';
  prior_value?: number;
  prior_date?: string;

  thresholds: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  interpretation: string;
  recommendations: string[];

  calculated_at: string;
  evidence_refs: string[];
}

export interface CompositeScore extends Score {
  component_scores: {
    module: string;
    score: number;
    weight: number;
    confidence: number;
  }[];
}

// ============================================================================
// REPORTS
// ============================================================================

export interface Report {
  id: string;
  type: 'summary' | 'expert' | 'findings' | 'risk' | 'damages' | 'settlement' | 'trial';
  title: string;
  generated_at: string;

  matter: MatterConfig;

  sections: ReportSection[];

  findings_summary: {
    total: number;
    by_severity: Record<FindingSeverity, number>;
    by_module: Record<string, number>;
  };

  scores: Score[];
  composite_score?: CompositeScore;

  evidence_refs: string[];
  chain_of_custody: ChainOfCustodyEvent[];
}

export interface ReportSection {
  id: string;
  title: string;
  order: number;
  content: string;
  findings?: Finding[];
  scores?: Score[];
  tables?: ReportTable[];
  charts?: ReportChart[];
}

export interface ReportTable {
  title: string;
  headers: string[];
  rows: string[][];
  footnotes?: string[];
}

export interface ReportChart {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  title: string;
  data: Record<string, unknown>;
  options?: Record<string, unknown>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface MatterConfig {
  matter_id: string;
  matter_name: string;
  client_name: string;

  period_start: string;
  period_end: string;

  entities_in_scope: string[];
  accounts_in_scope?: string[];

  investigation_type: 'fraud' | 'compliance' | 'litigation' | 'regulatory' | 'due_diligence' | 'internal_audit';

  jurisdiction?: string;
  regulatory_framework?: string[];

  materiality_threshold?: number;
  currency: string;

  confidentiality_level: 'public' | 'confidential' | 'privileged' | 'highly_restricted';

  team: {
    lead: string;
    members: string[];
    experts?: string[];
  };

  metadata: Record<string, unknown>;
}

export interface PipelineConfig {
  matter: MatterConfig;

  input_dir: string;
  output_dir: string;

  modules_enabled: string[];

  scoring_weights: Record<string, number>;

  thresholds: {
    risk_score_alert: number;
    confidence_minimum: number;
    materiality: number;
  };

  options: {
    redact_pii: boolean;
    include_raw_data: boolean;
    generate_visualizations: boolean;
    parallel_processing: boolean;
  };
}

// ============================================================================
// REAL-TIME TRIAL
// ============================================================================

export interface TestimonyEvent {
  timestamp: string;
  speaker_role: 'witness' | 'attorney' | 'judge';
  speaker_name: string;
  phase: 'direct' | 'cross' | 'redirect' | 'recross' | 'opening' | 'closing' | 'sidebar';
  text: string;
  exhibit_refs: string[];
  topic_tags: string[];
  credibility_signal: 'neutral' | 'helpful' | 'harmful';
}

export interface TrialAction {
  priority: 'P0' | 'P1' | 'P2';
  type: 'impeachment' | 'objection' | 'exhibit' | 'reframe' | 'concession' | 'sidebar_request';
  target: string;
  suggested_language: string;
  rationale: string;
  evidence_refs: string[];
  risk_tradeoff: string;
  confidence: number;
}

export interface TrialState {
  session_id: string;
  started_at: string;
  last_updated_at: string;

  events_processed: number;
  current_phase: string;
  current_witness?: string;

  momentum_score: number;
  momentum_trend: 'improving' | 'stable' | 'declining';

  key_moments: {
    timestamp: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];

  contradictions_found: {
    statement: string;
    contradicts: string;
    evidence_ref: string;
    exploited: boolean;
  }[];

  pending_actions: TrialAction[];
  completed_actions: TrialAction[];

  scores: {
    cross_exam_vulnerability: Score;
    jury_persuasion: Score;
    settlement_leverage: Score;
  };
}

// ============================================================================
// MODULE INTERFACES
// ============================================================================

export interface ModuleResult {
  module: string;
  executed_at: string;
  duration_ms: number;

  findings: Finding[];
  score: Score;

  artifacts: {
    name: string;
    path: string;
    type: string;
  }[];

  errors: string[];
  warnings: string[];

  metadata: Record<string, unknown>;
}

export interface ModuleSkill {
  name: string;
  version: string;
  description: string;

  inputs: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];

  outputs: {
    name: string;
    type: string;
    description: string;
  }[];

  dependencies: string[];

  run: (context: ModuleContext) => Promise<ModuleResult>;
}

export interface ModuleContext {
  config: PipelineConfig;

  // Canonical data stores
  entities: Map<string, Entity>;
  accounts: Map<string, Account>;
  transactions: Map<string, Transaction>;
  ledger_entries: Map<string, LedgerEntry>;
  documents: Map<string, Document>;
  evidence_refs: Map<string, EvidenceRef>;

  // Cross-module findings
  all_findings: Finding[];
  all_scores: Score[];

  // Trial state (for live mode)
  trial_state?: TrialState;

  // Utilities
  logger: Logger;
  hasher: Hasher;
}

export interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

export interface Hasher {
  hash: (data: string | Buffer) => string;
  verify: (data: string | Buffer, hash: string) => boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ReconciliationStatus = 'matched' | 'unmatched' | 'partial' | 'disputed';

export interface ReconciliationMatch {
  id: string;
  bank_transaction_id: string;
  gl_entry_id: string;
  status: ReconciliationStatus;
  match_confidence: number;
  variance_amount?: number;
  variance_reason?: string;
  evidence_refs: string[];
}

export interface DamagesBand {
  scenario: string;
  low: number;
  high: number;
  best_estimate: number;
  probability: number;
  methodology: string;
  evidence_refs: string[];
}

export interface SettlementZone {
  floor: number;
  ceiling: number;
  recommended: number;
  probability_of_acceptance: number;
  rationale: string;
  risk_factors: string[];
}
