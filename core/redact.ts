/**
 * PII Redaction Module
 * Provides privacy-safe data handling and redaction capabilities
 */

import { Entity, Transaction, Finding, EvidenceRef } from './types';

// ============================================================================
// REDACTION PATTERNS
// ============================================================================

const PII_PATTERNS: { name: string; pattern: RegExp; replacement: string }[] = [
  // SSN
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN-REDACTED]' },
  { name: 'ssn_no_dash', pattern: /\b\d{9}\b/g, replacement: '[SSN-REDACTED]' },

  // EIN
  { name: 'ein', pattern: /\b\d{2}-\d{7}\b/g, replacement: '[EIN-REDACTED]' },

  // Credit Card
  { name: 'cc', pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, replacement: '[CC-REDACTED]' },
  { name: 'cc_amex', pattern: /\b\d{4}[- ]?\d{6}[- ]?\d{5}\b/g, replacement: '[CC-REDACTED]' },

  // Bank Account (basic pattern - may need refinement)
  { name: 'bank_account', pattern: /\b\d{8,17}\b/g, replacement: '[ACCT-REDACTED]' },

  // Routing Number
  { name: 'routing', pattern: /\b\d{9}\b/g, replacement: '[RTN-REDACTED]' },

  // Phone Numbers
  { name: 'phone_us', pattern: /\b(\+1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE-REDACTED]' },
  { name: 'phone_intl', pattern: /\b\+\d{1,3}[-.]?\d{1,4}[-.]?\d{1,4}[-.]?\d{1,9}\b/g, replacement: '[PHONE-REDACTED]' },

  // Email
  { name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL-REDACTED]' },

  // IP Address
  { name: 'ip', pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replacement: '[IP-REDACTED]' },

  // Dates of Birth (common formats)
  { name: 'dob', pattern: /\b(DOB|Date of Birth|Born)[:\s]+\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi, replacement: '[DOB-REDACTED]' },
];

const NAME_PATTERNS: { name: string; pattern: RegExp }[] = [
  // Common name prefixes
  { name: 'mr', pattern: /\bMr\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g },
  { name: 'mrs', pattern: /\bMrs\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g },
  { name: 'ms', pattern: /\bMs\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g },
  { name: 'dr', pattern: /\bDr\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g },
];

// ============================================================================
// REDACTION CONFIG
// ============================================================================

export interface RedactionConfig {
  redact_ssn: boolean;
  redact_ein: boolean;
  redact_credit_card: boolean;
  redact_bank_account: boolean;
  redact_phone: boolean;
  redact_email: boolean;
  redact_ip: boolean;
  redact_dob: boolean;
  redact_names: boolean;
  custom_patterns?: { pattern: RegExp; replacement: string }[];
  preserve_list?: string[];  // Specific values to NOT redact
}

export const DEFAULT_REDACTION_CONFIG: RedactionConfig = {
  redact_ssn: true,
  redact_ein: true,
  redact_credit_card: true,
  redact_bank_account: false,  // Often needed for tracing
  redact_phone: true,
  redact_email: true,
  redact_ip: true,
  redact_dob: true,
  redact_names: false,  // Can break reports
  custom_patterns: [],
  preserve_list: [],
};

// ============================================================================
// REDACTION FUNCTIONS
// ============================================================================

export interface RedactionResult {
  original: string;
  redacted: string;
  redactions: {
    type: string;
    original: string;
    replacement: string;
    position: number;
  }[];
}

export function redactString(text: string, config: RedactionConfig = DEFAULT_REDACTION_CONFIG): RedactionResult {
  const redactions: RedactionResult['redactions'] = [];
  let result = text;

  // Check preserve list
  const shouldPreserve = (value: string): boolean => {
    return config.preserve_list?.some(p => value.includes(p)) || false;
  };

  // Apply patterns based on config
  const activePatterns = PII_PATTERNS.filter(p => {
    if (p.name.startsWith('ssn') && !config.redact_ssn) return false;
    if (p.name === 'ein' && !config.redact_ein) return false;
    if (p.name.startsWith('cc') && !config.redact_credit_card) return false;
    if (p.name === 'bank_account' && !config.redact_bank_account) return false;
    if (p.name === 'routing' && !config.redact_bank_account) return false;
    if (p.name.startsWith('phone') && !config.redact_phone) return false;
    if (p.name === 'email' && !config.redact_email) return false;
    if (p.name === 'ip' && !config.redact_ip) return false;
    if (p.name === 'dob' && !config.redact_dob) return false;
    return true;
  });

  // Apply each pattern
  activePatterns.forEach(({ name, pattern, replacement }) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (!shouldPreserve(match[0])) {
        redactions.push({
          type: name,
          original: match[0],
          replacement,
          position: match.index,
        });
      }
    }

    if (!config.preserve_list?.length) {
      result = result.replace(pattern, replacement);
    } else {
      // More careful replacement when preserve list exists
      result = result.replace(pattern, (matched) => {
        return shouldPreserve(matched) ? matched : replacement;
      });
    }
  });

  // Apply custom patterns
  config.custom_patterns?.forEach(({ pattern, replacement }) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      if (!shouldPreserve(match[0])) {
        redactions.push({
          type: 'custom',
          original: match[0],
          replacement,
          position: match.index,
        });
      }
    }

    result = result.replace(pattern, (matched) => {
      return shouldPreserve(matched) ? matched : replacement;
    });
  });

  // Redact names if enabled
  if (config.redact_names) {
    NAME_PATTERNS.forEach(({ name, pattern }) => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);

      while ((match = regex.exec(text)) !== null) {
        if (!shouldPreserve(match[0])) {
          redactions.push({
            type: 'name',
            original: match[0],
            replacement: '[NAME-REDACTED]',
            position: match.index,
          });
        }
      }

      result = result.replace(pattern, (matched) => {
        return shouldPreserve(matched) ? matched : '[NAME-REDACTED]';
      });
    });
  }

  return {
    original: text,
    redacted: result,
    redactions,
  };
}

// ============================================================================
// OBJECT REDACTION
// ============================================================================

export function redactObject<T extends Record<string, unknown>>(
  obj: T,
  config: RedactionConfig = DEFAULT_REDACTION_CONFIG,
  sensitiveFields: string[] = ['ssn', 'ein', 'tax_id', 'account_number', 'routing_number', 'card_number', 'phone', 'email', 'address']
): T {
  const result = { ...obj };

  for (const [key, value] of Object.entries(result)) {
    // Check if field name suggests sensitive data
    const isSensitiveField = sensitiveFields.some(sf =>
      key.toLowerCase().includes(sf.toLowerCase())
    );

    if (typeof value === 'string') {
      if (isSensitiveField) {
        (result as any)[key] = '[FIELD-REDACTED]';
      } else {
        (result as any)[key] = redactString(value, config).redacted;
      }
    } else if (Array.isArray(value)) {
      (result as any)[key] = value.map(item => {
        if (typeof item === 'string') {
          return redactString(item, config).redacted;
        } else if (typeof item === 'object' && item !== null) {
          return redactObject(item as Record<string, unknown>, config, sensitiveFields);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      (result as any)[key] = redactObject(value as Record<string, unknown>, config, sensitiveFields);
    }
  }

  return result;
}

// ============================================================================
// ENTITY REDACTION
// ============================================================================

export function redactEntity(entity: Entity, config: RedactionConfig = DEFAULT_REDACTION_CONFIG): Entity {
  const redacted = { ...entity };

  // Redact names if configured
  if (config.redact_names) {
    redacted.names = entity.names.map((_, i) => `[ENTITY-${i + 1}]`);
  }

  // Always redact sensitive identifiers
  redacted.identifiers = entity.identifiers.map(id => {
    const sensitive = ['ssn', 'ein', 'tin'].includes(id.type);
    return {
      ...id,
      value: sensitive ? `[${id.type.toUpperCase()}-REDACTED]` : id.value,
    };
  });

  // Redact addresses if email/phone redaction is on (treat as similar sensitivity)
  if (config.redact_email || config.redact_phone) {
    redacted.addresses = entity.addresses.map((addr, i) => ({
      ...addr,
      line1: `[ADDRESS-${i + 1}-LINE1]`,
      line2: addr.line2 ? `[ADDRESS-${i + 1}-LINE2]` : undefined,
      postal_code: '[ZIP-REDACTED]',
    }));
  }

  return redacted;
}

// ============================================================================
// TRANSACTION REDACTION
// ============================================================================

export function redactTransaction(txn: Transaction, config: RedactionConfig = DEFAULT_REDACTION_CONFIG): Transaction {
  const redacted = { ...txn };

  // Redact description
  redacted.description = redactString(txn.description, config).redacted;

  // Redact memo if present
  if (txn.memo) {
    redacted.memo = redactString(txn.memo, config).redacted;
  }

  // Optionally mask account info
  if (config.redact_bank_account) {
    if (txn.from_account_id) {
      redacted.from_account_id = maskAccountId(txn.from_account_id);
    }
    if (txn.to_account_id) {
      redacted.to_account_id = maskAccountId(txn.to_account_id);
    }
  }

  // Redact metadata
  if (txn.metadata) {
    redacted.metadata = redactObject(txn.metadata as Record<string, unknown>, config);
  }

  return redacted;
}

function maskAccountId(accountId: string): string {
  if (accountId.length <= 4) return '****';
  return '****' + accountId.slice(-4);
}

// ============================================================================
// FINDING REDACTION
// ============================================================================

export function redactFinding(finding: Finding, config: RedactionConfig = DEFAULT_REDACTION_CONFIG): Finding {
  const redacted = { ...finding };

  redacted.title = redactString(finding.title, config).redacted;
  redacted.description = redactString(finding.description, config).redacted;
  redacted.rationale = redactString(finding.rationale, config).redacted;

  if (finding.methodology) {
    redacted.methodology = redactString(finding.methodology, config).redacted;
  }

  redacted.counter_hypotheses = finding.counter_hypotheses.map(ch => ({
    ...ch,
    hypothesis: redactString(ch.hypothesis, config).redacted,
  }));

  if (finding.suggested_strengthening) {
    redacted.suggested_strengthening = finding.suggested_strengthening.map(s =>
      redactString(s, config).redacted
    );
  }

  return redacted;
}

// ============================================================================
// LOGGING SANITIZATION
// ============================================================================

export interface SanitizedLogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: Record<string, unknown>;
}

export function sanitizeForLogging(
  level: string,
  message: string,
  data?: Record<string, unknown>,
  config: RedactionConfig = DEFAULT_REDACTION_CONFIG
): SanitizedLogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message: redactString(message, config).redacted,
    data: data ? redactObject(data, config) : undefined,
  };
}

// ============================================================================
// BATCH REDACTION
// ============================================================================

export interface BatchRedactionResult {
  items_processed: number;
  redactions_applied: number;
  processing_time_ms: number;
}

export function redactTransactionBatch(
  transactions: Transaction[],
  config: RedactionConfig = DEFAULT_REDACTION_CONFIG
): { transactions: Transaction[]; result: BatchRedactionResult } {
  const start = Date.now();
  let totalRedactions = 0;

  const redactedTxns = transactions.map(txn => {
    const redacted = redactTransaction(txn, config);
    // Count redactions (simplified)
    if (redacted.description !== txn.description) totalRedactions++;
    if (redacted.memo !== txn.memo) totalRedactions++;
    return redacted;
  });

  return {
    transactions: redactedTxns,
    result: {
      items_processed: transactions.length,
      redactions_applied: totalRedactions,
      processing_time_ms: Date.now() - start,
    },
  };
}

export function redactFindingBatch(
  findings: Finding[],
  config: RedactionConfig = DEFAULT_REDACTION_CONFIG
): { findings: Finding[]; result: BatchRedactionResult } {
  const start = Date.now();
  let totalRedactions = 0;

  const redactedFindings = findings.map(finding => {
    const redacted = redactFinding(finding, config);
    if (redacted.title !== finding.title) totalRedactions++;
    if (redacted.description !== finding.description) totalRedactions++;
    return redacted;
  });

  return {
    findings: redactedFindings,
    result: {
      items_processed: findings.length,
      redactions_applied: totalRedactions,
      processing_time_ms: Date.now() - start,
    },
  };
}
