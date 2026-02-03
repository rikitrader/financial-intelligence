/**
 * Forensic Investigation Module
 * Core fraud detection and forensic analysis capabilities
 */

import {
  ModuleResult,
  ModuleContext,
  Finding,
  Score,
  Transaction,
  LedgerEntry,
} from '../../core/types';
import { generateId } from '../../core/normalize';
import { scoreFromFindings } from '../../core/scoring';
import {
  detectRoundDollarAmounts,
  detectWeekendHolidayActivity,
  detectDuplicateTransactions,
  detectUnusualTiming,
  detectJournalEntryAnomalies,
  detectVendorFraudIndicators,
  analyzeFunnelPatterns,
} from './rules';

// ============================================================================
// MODULE ENTRY POINT
// ============================================================================

export async function run(context: ModuleContext): Promise<ModuleResult> {
  const startTime = Date.now();
  const findings: Finding[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const transactions = Array.from(context.transactions.values());
  const ledgerEntries = Array.from(context.ledger_entries.values());
  const entities = Array.from(context.entities.values());

  try {
    // Run all forensic detection rules
    const roundDollarFindings = detectRoundDollarAmounts(
      transactions,
      context.config.thresholds.materiality
    );
    findings.push(...roundDollarFindings);

    const weekendFindings = detectWeekendHolidayActivity(transactions);
    findings.push(...weekendFindings);

    const duplicateFindings = detectDuplicateTransactions(transactions);
    findings.push(...duplicateFindings);

    const timingFindings = detectUnusualTiming(ledgerEntries);
    findings.push(...timingFindings);

    const journalFindings = detectJournalEntryAnomalies(ledgerEntries);
    findings.push(...journalFindings);

    const vendorFindings = detectVendorFraudIndicators(transactions, entities);
    findings.push(...vendorFindings);

    const funnelFindings = analyzeFunnelPatterns(transactions);
    findings.push(...funnelFindings);

  } catch (err) {
    errors.push(`Forensic analysis error: ${(err as Error).message}`);
  }

  // Calculate module score
  const score = scoreFromFindings('forensic', 'Fraud Risk', findings, 15);

  return {
    module: 'forensic',
    executed_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    findings,
    score,
    artifacts: [
      {
        name: 'fraud_findings.json',
        path: 'fraud_findings.json',
        type: 'json',
      },
    ],
    errors,
    warnings,
    metadata: {
      transactions_analyzed: transactions.length,
      ledger_entries_analyzed: ledgerEntries.length,
      detection_rules_applied: 7,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createForensicFinding(
  category: string,
  title: string,
  description: string,
  severity: Finding['severity'],
  confidence: number,
  evidenceRefs: string[],
  relatedTransactionIds: string[] = [],
  counterHypotheses: Finding['counter_hypotheses'] = []
): Finding {
  return {
    id: generateId('FND'),
    module: 'forensic',
    category,
    title,
    description,
    severity,
    status: 'open',
    confidence,
    rationale: description,
    evidence_refs: evidenceRefs,
    related_entity_ids: [],
    related_transaction_ids: relatedTransactionIds,
    related_account_ids: [],
    counter_hypotheses: counterHypotheses,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {},
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './rules';
export * from './prompts';
export * from './score';
