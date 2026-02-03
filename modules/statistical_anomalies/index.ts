/**
 * Statistical Anomalies Module
 * Benford's Law, outlier detection, and clustering analysis
 */

import {
  ModuleResult,
  ModuleContext,
  Finding,
  Transaction,
  LedgerEntry,
} from '../../core/types';
import { scoreFromFindings } from '../../core/scoring';
import { analyzeBenford, generateBenfordFindings } from './benford';
import { detectOutliers, detectClusters } from './outliers';

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

  try {
    // Benford's Law analysis on transactions
    if (transactions.length >= 100) {
      const txnAmounts = transactions.map(t => t.amount);
      const benfordResult = analyzeBenford(txnAmounts);
      const benfordFindings = generateBenfordFindings(
        benfordResult,
        'transactions',
        transactions.slice(0, 10).flatMap(t => t.evidence_refs)
      );
      findings.push(...benfordFindings);
    } else {
      warnings.push('Insufficient transactions for Benford analysis (need 100+)');
    }

    // Benford analysis on GL entries
    if (ledgerEntries.length >= 100) {
      const glAmounts = ledgerEntries.map(e => (e.debit_amount || 0) + (e.credit_amount || 0));
      const glBenford = analyzeBenford(glAmounts);
      const glFindings = generateBenfordFindings(
        glBenford,
        'ledger entries',
        ledgerEntries.slice(0, 10).flatMap(e => e.evidence_refs)
      );
      findings.push(...glFindings);
    }

    // Outlier detection
    const outlierFindings = detectOutliers(transactions, 3);  // 3 sigma threshold
    findings.push(...outlierFindings);

    // Cluster analysis
    const clusterFindings = detectClusters(transactions);
    findings.push(...clusterFindings);

  } catch (err) {
    errors.push(`Statistical analysis error: ${(err as Error).message}`);
  }

  const score = scoreFromFindings('statistical_anomalies', 'Statistical Anomaly Risk', findings, 10);

  return {
    module: 'statistical_anomalies',
    executed_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    findings,
    score,
    artifacts: [],
    errors,
    warnings,
    metadata: {
      transactions_analyzed: transactions.length,
      ledger_entries_analyzed: ledgerEntries.length,
    },
  };
}

export * from './benford';
export * from './outliers';
