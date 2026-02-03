/**
 * Input Validation Module
 * Validates data against canonical schema with detailed error reporting
 */

import {
  Entity,
  Account,
  Transaction,
  LedgerEntry,
  Document,
  EvidenceRef,
  Finding,
  Score,
  TestimonyEvent,
  MatterConfig,
  PipelineConfig,
} from './types';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  value: unknown;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  record_count: number;
  valid_count: number;
  invalid_count: number;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
const CURRENCY_REGEX = /^[A-Z]{3}$/;
const COUNTRY_REGEX = /^[A-Z]{2}$/;
const PERIOD_REGEX = /^\d{4}-\d{2}$/;
const HASH_REGEX = /^[a-f0-9]{64}$/;

function isValidDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function isValidDateTime(value: string): boolean {
  if (!DATETIME_REGEX.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function isValidEnum<T>(value: unknown, validValues: T[]): value is T {
  return validValues.includes(value as T);
}

// ============================================================================
// ENTITY VALIDATION
// ============================================================================

export function validateEntity(entity: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!entity || typeof entity !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'entity', value: entity, message: 'Entity must be an object', severity: 'error' }],
      warnings: [],
      record_count: 1,
      valid_count: 0,
      invalid_count: 1,
    };
  }

  const e = entity as Partial<Entity>;

  // Required fields
  if (!isNonEmptyString(e.id)) {
    errors.push({ field: 'id', value: e.id, message: 'Entity ID is required and must be non-empty string', severity: 'error' });
  }

  const validTypes = ['individual', 'corporation', 'partnership', 'trust', 'government', 'unknown'];
  if (!isValidEnum(e.type, validTypes)) {
    errors.push({ field: 'type', value: e.type, message: `Entity type must be one of: ${validTypes.join(', ')}`, severity: 'error' });
  }

  if (!Array.isArray(e.names) || e.names.length === 0) {
    errors.push({ field: 'names', value: e.names, message: 'Entity must have at least one name', severity: 'error' });
  }

  if (!Array.isArray(e.evidence_refs)) {
    errors.push({ field: 'evidence_refs', value: e.evidence_refs, message: 'evidence_refs must be an array', severity: 'error' });
  }

  // Warnings for optional but recommended fields
  if (!Array.isArray(e.identifiers) || e.identifiers.length === 0) {
    warnings.push({ field: 'identifiers', value: e.identifiers, message: 'Entity has no identifiers', severity: 'warning' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record_count: 1,
    valid_count: errors.length === 0 ? 1 : 0,
    invalid_count: errors.length > 0 ? 1 : 0,
  };
}

// ============================================================================
// ACCOUNT VALIDATION
// ============================================================================

export function validateAccount(account: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!account || typeof account !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'account', value: account, message: 'Account must be an object', severity: 'error' }],
      warnings: [],
      record_count: 1,
      valid_count: 0,
      invalid_count: 1,
    };
  }

  const a = account as Partial<Account>;

  if (!isNonEmptyString(a.id)) {
    errors.push({ field: 'id', value: a.id, message: 'Account ID is required', severity: 'error' });
  }

  if (!isNonEmptyString(a.account_number)) {
    errors.push({ field: 'account_number', value: a.account_number, message: 'Account number is required', severity: 'error' });
  }

  if (!isNonEmptyString(a.account_name)) {
    errors.push({ field: 'account_name', value: a.account_name, message: 'Account name is required', severity: 'error' });
  }

  const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense', 'bank', 'unknown'];
  if (!isValidEnum(a.account_type, validTypes)) {
    errors.push({ field: 'account_type', value: a.account_type, message: `Account type must be one of: ${validTypes.join(', ')}`, severity: 'error' });
  }

  if (!isNonEmptyString(a.entity_id)) {
    errors.push({ field: 'entity_id', value: a.entity_id, message: 'Entity ID is required', severity: 'error' });
  }

  if (!a.currency || !CURRENCY_REGEX.test(a.currency)) {
    errors.push({ field: 'currency', value: a.currency, message: 'Currency must be 3-letter ISO code', severity: 'error' });
  }

  const validStatuses = ['active', 'closed', 'frozen', 'unknown'];
  if (!isValidEnum(a.status, validStatuses)) {
    errors.push({ field: 'status', value: a.status, message: `Status must be one of: ${validStatuses.join(', ')}`, severity: 'error' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record_count: 1,
    valid_count: errors.length === 0 ? 1 : 0,
    invalid_count: errors.length > 0 ? 1 : 0,
  };
}

// ============================================================================
// TRANSACTION VALIDATION
// ============================================================================

export function validateTransaction(transaction: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!transaction || typeof transaction !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'transaction', value: transaction, message: 'Transaction must be an object', severity: 'error' }],
      warnings: [],
      record_count: 1,
      valid_count: 0,
      invalid_count: 1,
    };
  }

  const t = transaction as Partial<Transaction>;

  if (!isNonEmptyString(t.id)) {
    errors.push({ field: 'id', value: t.id, message: 'Transaction ID is required', severity: 'error' });
  }

  if (!t.transaction_date || !isValidDate(t.transaction_date)) {
    errors.push({ field: 'transaction_date', value: t.transaction_date, message: 'Valid transaction date is required (YYYY-MM-DD)', severity: 'error' });
  }

  if (!isNumber(t.amount)) {
    errors.push({ field: 'amount', value: t.amount, message: 'Amount must be a valid number', severity: 'error' });
  }

  if (!t.currency || !CURRENCY_REGEX.test(t.currency)) {
    errors.push({ field: 'currency', value: t.currency, message: 'Currency must be 3-letter ISO code', severity: 'error' });
  }

  const validDirections = ['debit', 'credit', 'unknown'];
  if (!isValidEnum(t.direction, validDirections)) {
    errors.push({ field: 'direction', value: t.direction, message: `Direction must be one of: ${validDirections.join(', ')}`, severity: 'error' });
  }

  const validMethods = ['wire', 'ach', 'check', 'cash', 'card', 'journal', 'internal', 'unknown'];
  if (!isValidEnum(t.method, validMethods)) {
    errors.push({ field: 'method', value: t.method, message: `Method must be one of: ${validMethods.join(', ')}`, severity: 'error' });
  }

  if (!isNonEmptyString(t.source_file)) {
    errors.push({ field: 'source_file', value: t.source_file, message: 'Source file is required', severity: 'error' });
  }

  if (t.source_row_id === undefined || t.source_row_id === null) {
    errors.push({ field: 'source_row_id', value: t.source_row_id, message: 'Source row ID is required', severity: 'error' });
  }

  if (!Array.isArray(t.evidence_refs)) {
    errors.push({ field: 'evidence_refs', value: t.evidence_refs, message: 'evidence_refs must be an array', severity: 'error' });
  }

  // Warnings
  if (!t.from_account_id && !t.to_account_id) {
    warnings.push({ field: 'accounts', value: null, message: 'Transaction has no linked accounts', severity: 'warning' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record_count: 1,
    valid_count: errors.length === 0 ? 1 : 0,
    invalid_count: errors.length > 0 ? 1 : 0,
  };
}

// ============================================================================
// LEDGER ENTRY VALIDATION
// ============================================================================

export function validateLedgerEntry(entry: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!entry || typeof entry !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'ledger_entry', value: entry, message: 'Ledger entry must be an object', severity: 'error' }],
      warnings: [],
      record_count: 1,
      valid_count: 0,
      invalid_count: 1,
    };
  }

  const e = entry as Partial<LedgerEntry>;

  if (!isNonEmptyString(e.id)) {
    errors.push({ field: 'id', value: e.id, message: 'Ledger entry ID is required', severity: 'error' });
  }

  if (!e.entry_date || !isValidDate(e.entry_date)) {
    errors.push({ field: 'entry_date', value: e.entry_date, message: 'Valid entry date is required', severity: 'error' });
  }

  if (!e.posting_date || !isValidDate(e.posting_date)) {
    errors.push({ field: 'posting_date', value: e.posting_date, message: 'Valid posting date is required', severity: 'error' });
  }

  if (!e.period || !PERIOD_REGEX.test(e.period)) {
    errors.push({ field: 'period', value: e.period, message: 'Period must be in YYYY-MM format', severity: 'error' });
  }

  if (!isNonEmptyString(e.account_id)) {
    errors.push({ field: 'account_id', value: e.account_id, message: 'Account ID is required', severity: 'error' });
  }

  if (!isNonEmptyString(e.account_number)) {
    errors.push({ field: 'account_number', value: e.account_number, message: 'Account number is required', severity: 'error' });
  }

  // Must have either debit or credit amount
  const hasDebit = isNumber(e.debit_amount) && e.debit_amount > 0;
  const hasCredit = isNumber(e.credit_amount) && e.credit_amount > 0;
  if (!hasDebit && !hasCredit) {
    errors.push({ field: 'amount', value: { debit: e.debit_amount, credit: e.credit_amount }, message: 'Entry must have either debit or credit amount', severity: 'error' });
  }

  if (hasDebit && hasCredit) {
    warnings.push({ field: 'amount', value: { debit: e.debit_amount, credit: e.credit_amount }, message: 'Entry has both debit and credit amounts', severity: 'warning' });
  }

  if (!e.currency || !CURRENCY_REGEX.test(e.currency)) {
    errors.push({ field: 'currency', value: e.currency, message: 'Currency must be 3-letter ISO code', severity: 'error' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record_count: 1,
    valid_count: errors.length === 0 ? 1 : 0,
    invalid_count: errors.length > 0 ? 1 : 0,
  };
}

// ============================================================================
// FINDING VALIDATION
// ============================================================================

export function validateFinding(finding: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!finding || typeof finding !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'finding', value: finding, message: 'Finding must be an object', severity: 'error' }],
      warnings: [],
      record_count: 1,
      valid_count: 0,
      invalid_count: 1,
    };
  }

  const f = finding as Partial<Finding>;

  if (!isNonEmptyString(f.id)) {
    errors.push({ field: 'id', value: f.id, message: 'Finding ID is required', severity: 'error' });
  }

  if (!isNonEmptyString(f.module)) {
    errors.push({ field: 'module', value: f.module, message: 'Module is required', severity: 'error' });
  }

  if (!isNonEmptyString(f.title)) {
    errors.push({ field: 'title', value: f.title, message: 'Title is required', severity: 'error' });
  }

  if (!isNonEmptyString(f.rationale)) {
    errors.push({ field: 'rationale', value: f.rationale, message: 'Rationale is required', severity: 'error' });
  }

  const validSeverities = ['critical', 'high', 'medium', 'low', 'info'];
  if (!isValidEnum(f.severity, validSeverities)) {
    errors.push({ field: 'severity', value: f.severity, message: `Severity must be one of: ${validSeverities.join(', ')}`, severity: 'error' });
  }

  if (!isNumber(f.confidence) || !isInRange(f.confidence, 0, 1)) {
    errors.push({ field: 'confidence', value: f.confidence, message: 'Confidence must be a number between 0 and 1', severity: 'error' });
  }

  // CRITICAL: Findings must have evidence refs
  if (!Array.isArray(f.evidence_refs) || f.evidence_refs.length === 0) {
    errors.push({ field: 'evidence_refs', value: f.evidence_refs, message: 'Findings must have at least one evidence reference', severity: 'error' });
  }

  if (!Array.isArray(f.counter_hypotheses)) {
    warnings.push({ field: 'counter_hypotheses', value: f.counter_hypotheses, message: 'Counter hypotheses should be documented', severity: 'warning' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record_count: 1,
    valid_count: errors.length === 0 ? 1 : 0,
    invalid_count: errors.length > 0 ? 1 : 0,
  };
}

// ============================================================================
// SCORE VALIDATION
// ============================================================================

export function validateScore(score: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!score || typeof score !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'score', value: score, message: 'Score must be an object', severity: 'error' }],
      warnings: [],
      record_count: 1,
      valid_count: 0,
      invalid_count: 1,
    };
  }

  const s = score as Partial<Score>;

  if (!isNonEmptyString(s.module)) {
    errors.push({ field: 'module', value: s.module, message: 'Module is required', severity: 'error' });
  }

  if (!isNumber(s.value) || !isInRange(s.value, 0, 100)) {
    errors.push({ field: 'value', value: s.value, message: 'Score value must be between 0 and 100', severity: 'error' });
  }

  if (!isNumber(s.confidence) || !isInRange(s.confidence, 0, 1)) {
    errors.push({ field: 'confidence', value: s.confidence, message: 'Confidence must be between 0 and 1', severity: 'error' });
  }

  if (!Array.isArray(s.drivers) || s.drivers.length === 0) {
    errors.push({ field: 'drivers', value: s.drivers, message: 'Score must have at least one driver', severity: 'error' });
  }

  if (!Array.isArray(s.evidence_refs)) {
    errors.push({ field: 'evidence_refs', value: s.evidence_refs, message: 'evidence_refs must be an array', severity: 'error' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record_count: 1,
    valid_count: errors.length === 0 ? 1 : 0,
    invalid_count: errors.length > 0 ? 1 : 0,
  };
}

// ============================================================================
// TESTIMONY EVENT VALIDATION
// ============================================================================

export function validateTestimonyEvent(event: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!event || typeof event !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'event', value: event, message: 'Testimony event must be an object', severity: 'error' }],
      warnings: [],
      record_count: 1,
      valid_count: 0,
      invalid_count: 1,
    };
  }

  const e = event as Partial<TestimonyEvent>;

  if (!e.timestamp || !isValidDateTime(e.timestamp)) {
    errors.push({ field: 'timestamp', value: e.timestamp, message: 'Valid timestamp is required', severity: 'error' });
  }

  const validRoles = ['witness', 'attorney', 'judge'];
  if (!isValidEnum(e.speaker_role, validRoles)) {
    errors.push({ field: 'speaker_role', value: e.speaker_role, message: `Speaker role must be one of: ${validRoles.join(', ')}`, severity: 'error' });
  }

  if (!isNonEmptyString(e.speaker_name)) {
    errors.push({ field: 'speaker_name', value: e.speaker_name, message: 'Speaker name is required', severity: 'error' });
  }

  const validPhases = ['direct', 'cross', 'redirect', 'recross', 'opening', 'closing', 'sidebar'];
  if (!isValidEnum(e.phase, validPhases)) {
    errors.push({ field: 'phase', value: e.phase, message: `Phase must be one of: ${validPhases.join(', ')}`, severity: 'error' });
  }

  if (!isNonEmptyString(e.text)) {
    errors.push({ field: 'text', value: e.text, message: 'Text content is required', severity: 'error' });
  }

  const validSignals = ['neutral', 'helpful', 'harmful'];
  if (!isValidEnum(e.credibility_signal, validSignals)) {
    errors.push({ field: 'credibility_signal', value: e.credibility_signal, message: `Credibility signal must be one of: ${validSignals.join(', ')}`, severity: 'error' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record_count: 1,
    valid_count: errors.length === 0 ? 1 : 0,
    invalid_count: errors.length > 0 ? 1 : 0,
  };
}

// ============================================================================
// PIPELINE CONFIG VALIDATION
// ============================================================================

export function validatePipelineConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'config', value: config, message: 'Config must be an object', severity: 'error' }],
      warnings: [],
      record_count: 1,
      valid_count: 0,
      invalid_count: 1,
    };
  }

  const c = config as Partial<PipelineConfig>;

  if (!c.matter || typeof c.matter !== 'object') {
    errors.push({ field: 'matter', value: c.matter, message: 'Matter configuration is required', severity: 'error' });
  } else {
    const m = c.matter as Partial<MatterConfig>;
    if (!isNonEmptyString(m.matter_id)) {
      errors.push({ field: 'matter.matter_id', value: m.matter_id, message: 'Matter ID is required', severity: 'error' });
    }
    if (!m.period_start || !isValidDate(m.period_start)) {
      errors.push({ field: 'matter.period_start', value: m.period_start, message: 'Valid period start date is required', severity: 'error' });
    }
    if (!m.period_end || !isValidDate(m.period_end)) {
      errors.push({ field: 'matter.period_end', value: m.period_end, message: 'Valid period end date is required', severity: 'error' });
    }
  }

  if (!isNonEmptyString(c.input_dir)) {
    errors.push({ field: 'input_dir', value: c.input_dir, message: 'Input directory is required', severity: 'error' });
  }

  if (!isNonEmptyString(c.output_dir)) {
    errors.push({ field: 'output_dir', value: c.output_dir, message: 'Output directory is required', severity: 'error' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record_count: 1,
    valid_count: errors.length === 0 ? 1 : 0,
    invalid_count: errors.length > 0 ? 1 : 0,
  };
}

// ============================================================================
// BATCH VALIDATION
// ============================================================================

export function validateBatch<T>(
  items: T[],
  validator: (item: T) => ValidationResult
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < items.length; i++) {
    const result = validator(items[i]);

    result.errors.forEach(err => {
      allErrors.push({
        ...err,
        field: `[${i}].${err.field}`,
      });
    });

    result.warnings.forEach(warn => {
      allWarnings.push({
        ...warn,
        field: `[${i}].${warn.field}`,
      });
    });

    if (result.valid) {
      validCount++;
    } else {
      invalidCount++;
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    record_count: items.length,
    valid_count: validCount,
    invalid_count: invalidCount,
  };
}
