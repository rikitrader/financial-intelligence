/**
 * Forensic Detection Rules
 * Rule-based fraud detection algorithms
 */

import { Finding, Transaction, LedgerEntry, Entity } from '../../core/types';
import { generateId } from '../../core/normalize';

// ============================================================================
// ROUND DOLLAR DETECTION
// ============================================================================

export function detectRoundDollarAmounts(
  transactions: Transaction[],
  materialityThreshold: number = 10000
): Finding[] {
  const findings: Finding[] = [];

  // Filter material transactions that are round amounts
  const roundTransactions = transactions.filter(txn => {
    if (txn.amount < materialityThreshold) return false;
    // Check if amount is a round number (ends in 000 or 00)
    return txn.amount % 1000 === 0 || txn.amount % 100 === 0;
  });

  // Group by similar amounts
  const amountGroups = new Map<number, Transaction[]>();
  roundTransactions.forEach(txn => {
    const rounded = Math.round(txn.amount / 1000) * 1000;
    const group = amountGroups.get(rounded) || [];
    group.push(txn);
    amountGroups.set(rounded, group);
  });

  // Flag groups with multiple transactions
  amountGroups.forEach((group, amount) => {
    if (group.length >= 3) {
      findings.push({
        id: generateId('FND'),
        module: 'forensic',
        category: 'round_dollar',
        title: `Multiple Round Dollar Transactions at $${amount.toLocaleString()}`,
        description: `${group.length} transactions detected at approximately $${amount.toLocaleString()}. Round dollar amounts may indicate estimated or fabricated transactions.`,
        severity: group.length >= 5 ? 'high' : 'medium',
        status: 'open',
        confidence: 0.6 + (group.length * 0.05),
        rationale: `Pattern of ${group.length} round-dollar transactions at similar amounts suggests potential manipulation or estimation rather than actual business transactions.`,
        evidence_refs: group.flatMap(t => t.evidence_refs),
        related_entity_ids: [],
        related_transaction_ids: group.map(t => t.id),
        related_account_ids: [],
        counter_hypotheses: [
          {
            hypothesis: 'Legitimate bulk pricing or standard fees',
            likelihood: 'medium',
            evidence_for: ['Consistent vendor pricing', 'Industry standard amounts'],
            evidence_against: ['Unusual frequency', 'Timing patterns'],
          },
        ],
        financial_impact: {
          amount_low: amount * group.length * 0.1,
          amount_high: amount * group.length,
          amount_best_estimate: amount * group.length * 0.5,
          currency: 'USD',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: { transaction_count: group.length },
      });
    }
  });

  return findings;
}

// ============================================================================
// WEEKEND/HOLIDAY ACTIVITY DETECTION
// ============================================================================

const US_HOLIDAYS = [
  '01-01', // New Year
  '07-04', // Independence Day
  '12-25', // Christmas
  '11-28', // Thanksgiving (approximate)
  '12-31', // New Year's Eve
];

export function detectWeekendHolidayActivity(transactions: Transaction[]): Finding[] {
  const findings: Finding[] = [];

  const suspiciousTransactions = transactions.filter(txn => {
    const date = new Date(txn.transaction_date);
    const dayOfWeek = date.getDay();
    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Weekend (Saturday = 6, Sunday = 0)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Holiday
    const isHoliday = US_HOLIDAYS.includes(monthDay);

    return (isWeekend || isHoliday) && txn.method !== 'internal';
  });

  if (suspiciousTransactions.length > 5) {
    const totalAmount = suspiciousTransactions.reduce((sum, t) => sum + t.amount, 0);

    findings.push({
      id: generateId('FND'),
      module: 'forensic',
      category: 'unusual_timing',
      title: 'Significant Weekend/Holiday Transaction Activity',
      description: `${suspiciousTransactions.length} transactions totaling $${totalAmount.toLocaleString()} occurred on weekends or holidays. This pattern may indicate backdating or unauthorized activity.`,
      severity: suspiciousTransactions.length >= 20 ? 'high' : 'medium',
      status: 'open',
      confidence: 0.65,
      rationale: 'Business transactions typically occur during normal business hours. Weekend and holiday activity may indicate manipulation of transaction dates.',
      evidence_refs: suspiciousTransactions.flatMap(t => t.evidence_refs),
      related_entity_ids: [],
      related_transaction_ids: suspiciousTransactions.map(t => t.id),
      related_account_ids: [],
      counter_hypotheses: [
        {
          hypothesis: 'International business with different holiday schedules',
          likelihood: 'medium',
          evidence_for: ['Foreign counterparties'],
          evidence_against: ['Domestic accounts only'],
        },
        {
          hypothesis: 'Automated scheduled transactions',
          likelihood: 'medium',
          evidence_for: ['Recurring patterns', 'ACH transactions'],
          evidence_against: ['Manual transaction types'],
        },
      ],
      financial_impact: {
        amount_low: 0,
        amount_high: totalAmount,
        amount_best_estimate: totalAmount * 0.3,
        currency: 'USD',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { transaction_count: suspiciousTransactions.length },
    });
  }

  return findings;
}

// ============================================================================
// DUPLICATE TRANSACTION DETECTION
// ============================================================================

export function detectDuplicateTransactions(transactions: Transaction[]): Finding[] {
  const findings: Finding[] = [];

  // Create fingerprints for potential duplicates
  const fingerprints = new Map<string, Transaction[]>();

  transactions.forEach(txn => {
    // Create multiple fingerprints at different specificity levels
    const fp1 = `${txn.transaction_date}|${txn.amount}|${txn.description.substring(0, 20)}`;
    const fp2 = `${txn.amount}|${txn.description}`;

    [fp1, fp2].forEach(fp => {
      const group = fingerprints.get(fp) || [];
      group.push(txn);
      fingerprints.set(fp, group);
    });
  });

  // Find duplicates
  const reportedPairs = new Set<string>();

  fingerprints.forEach((group, fp) => {
    if (group.length >= 2) {
      // Avoid reporting same pair multiple times
      const pairKey = group.map(t => t.id).sort().join('-');
      if (reportedPairs.has(pairKey)) return;
      reportedPairs.add(pairKey);

      const totalAmount = group.reduce((sum, t) => sum + t.amount, 0);

      if (totalAmount >= 5000) {  // Only material duplicates
        findings.push({
          id: generateId('FND'),
          module: 'forensic',
          category: 'duplicate_transaction',
          title: `Potential Duplicate Transactions Detected`,
          description: `${group.length} transactions with matching characteristics found. Total amount: $${totalAmount.toLocaleString()}.`,
          severity: totalAmount >= 50000 ? 'high' : totalAmount >= 10000 ? 'medium' : 'low',
          status: 'open',
          confidence: 0.75,
          rationale: 'Transactions share same date, amount, and similar descriptions, indicating potential duplicate payments.',
          evidence_refs: group.flatMap(t => t.evidence_refs),
          related_entity_ids: [],
          related_transaction_ids: group.map(t => t.id),
          related_account_ids: [],
          counter_hypotheses: [
            {
              hypothesis: 'Legitimate recurring transactions',
              likelihood: 'medium',
              evidence_for: ['Monthly patterns', 'Contract terms'],
              evidence_against: ['Same day occurrence'],
            },
          ],
          financial_impact: {
            amount_low: group[0].amount,
            amount_high: totalAmount - group[0].amount,
            amount_best_estimate: (totalAmount - group[0].amount) * 0.8,
            currency: 'USD',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            fingerprint: fp.substring(0, 50),
            match_count: group.length,
          },
        });
      }
    }
  });

  return findings;
}

// ============================================================================
// UNUSUAL TIMING DETECTION (PERIOD END)
// ============================================================================

export function detectUnusualTiming(entries: LedgerEntry[]): Finding[] {
  const findings: Finding[] = [];

  // Group by period
  const byPeriod = new Map<string, LedgerEntry[]>();
  entries.forEach(entry => {
    const group = byPeriod.get(entry.period) || [];
    group.push(entry);
    byPeriod.set(entry.period, group);
  });

  byPeriod.forEach((periodEntries, period) => {
    // Find entries in last 3 days of month
    const lastDayEntries = periodEntries.filter(entry => {
      const date = new Date(entry.posting_date);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      return date.getDate() >= lastDay - 2;
    });

    const totalPeriodAmount = periodEntries.reduce((sum, e) =>
      sum + (e.debit_amount || 0) + (e.credit_amount || 0), 0
    );

    const lastDayAmount = lastDayEntries.reduce((sum, e) =>
      sum + (e.debit_amount || 0) + (e.credit_amount || 0), 0
    );

    // If >40% of period activity in last 3 days, flag it
    if (totalPeriodAmount > 0 && lastDayAmount / totalPeriodAmount > 0.4) {
      findings.push({
        id: generateId('FND'),
        module: 'forensic',
        category: 'period_end_concentration',
        title: `Period-End Journal Entry Concentration - ${period}`,
        description: `${((lastDayAmount / totalPeriodAmount) * 100).toFixed(1)}% of period ${period} activity (${lastDayEntries.length} entries, $${lastDayAmount.toLocaleString()}) occurred in the last 3 days.`,
        severity: lastDayAmount / totalPeriodAmount > 0.6 ? 'high' : 'medium',
        status: 'open',
        confidence: 0.7,
        rationale: 'Concentration of journal entries at period-end may indicate earnings management or late recording of transactions.',
        evidence_refs: lastDayEntries.flatMap(e => e.evidence_refs),
        related_entity_ids: [],
        related_transaction_ids: [],
        related_account_ids: lastDayEntries.map(e => e.account_id),
        counter_hypotheses: [
          {
            hypothesis: 'Normal month-end close processes',
            likelihood: 'medium',
            evidence_for: ['Accrual adjustments', 'Standard close entries'],
            evidence_against: ['Unusual entry types', 'Revenue adjustments'],
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          period,
          concentration_pct: lastDayAmount / totalPeriodAmount,
          entry_count: lastDayEntries.length,
        },
      });
    }
  });

  return findings;
}

// ============================================================================
// JOURNAL ENTRY ANOMALIES
// ============================================================================

export function detectJournalEntryAnomalies(entries: LedgerEntry[]): Finding[] {
  const findings: Finding[] = [];

  // Detect journal entries without proper approval
  const unapprovedEntries = entries.filter(e =>
    !e.approved_by && (e.debit_amount || 0) + (e.credit_amount || 0) >= 10000
  );

  if (unapprovedEntries.length > 0) {
    const totalAmount = unapprovedEntries.reduce((sum, e) =>
      sum + (e.debit_amount || 0) + (e.credit_amount || 0), 0
    );

    findings.push({
      id: generateId('FND'),
      module: 'forensic',
      category: 'journal_entry_controls',
      title: 'Material Journal Entries Without Documented Approval',
      description: `${unapprovedEntries.length} journal entries totaling $${totalAmount.toLocaleString()} lack documented approval.`,
      severity: totalAmount >= 100000 ? 'high' : 'medium',
      status: 'open',
      confidence: 0.8,
      rationale: 'Material journal entries should have documented approval as part of internal controls.',
      evidence_refs: unapprovedEntries.flatMap(e => e.evidence_refs),
      related_entity_ids: [],
      related_transaction_ids: [],
      related_account_ids: unapprovedEntries.map(e => e.account_id),
      counter_hypotheses: [
        {
          hypothesis: 'Approval documented outside of system',
          likelihood: 'medium',
          evidence_for: ['Paper approval records'],
          evidence_against: ['No supporting documentation'],
          testing_required: 'Review physical approval documentation',
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { entry_count: unapprovedEntries.length },
    });
  }

  // Detect entries with unusual account combinations
  const unusualCombos = entries.filter(e => {
    // Revenue account with debit (unusual)
    if (e.account_number.startsWith('4') && e.debit_amount && e.debit_amount > 10000) {
      return true;
    }
    // Expense account with credit (unusual)
    if (e.account_number.startsWith('5') && e.credit_amount && e.credit_amount > 10000) {
      return true;
    }
    return false;
  });

  if (unusualCombos.length > 0) {
    findings.push({
      id: generateId('FND'),
      module: 'forensic',
      category: 'unusual_account_activity',
      title: 'Unusual Account Direction in Journal Entries',
      description: `${unusualCombos.length} entries have unusual debit/credit direction for their account type (e.g., revenue debits, expense credits).`,
      severity: 'medium',
      status: 'open',
      confidence: 0.65,
      rationale: 'Revenue accounts typically receive credits; expense accounts typically receive debits. Opposite entries may indicate corrections, reversals, or manipulation.',
      evidence_refs: unusualCombos.flatMap(e => e.evidence_refs),
      related_entity_ids: [],
      related_transaction_ids: [],
      related_account_ids: unusualCombos.map(e => e.account_id),
      counter_hypotheses: [
        {
          hypothesis: 'Legitimate reversing entries',
          likelihood: 'medium',
          evidence_for: ['Corresponding original entry'],
          evidence_against: ['No reversal reference'],
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: { entry_count: unusualCombos.length },
    });
  }

  return findings;
}

// ============================================================================
// VENDOR FRAUD INDICATORS
// ============================================================================

export function detectVendorFraudIndicators(
  transactions: Transaction[],
  entities: Entity[]
): Finding[] {
  const findings: Finding[] = [];

  // Build vendor payment map
  const vendorPayments = new Map<string, Transaction[]>();
  transactions.forEach(txn => {
    if (txn.to_entity_id) {
      const payments = vendorPayments.get(txn.to_entity_id) || [];
      payments.push(txn);
      vendorPayments.set(txn.to_entity_id, payments);
    }
  });

  // Look for shell company indicators
  entities.forEach(entity => {
    if (entity.type === 'corporation') {
      const payments = vendorPayments.get(entity.id) || [];
      const riskFlags: string[] = [];

      // No physical address
      if (entity.addresses.length === 0) {
        riskFlags.push('no_address');
      }

      // Only PO Box
      if (entity.addresses.every(a => a.line1.toLowerCase().includes('po box'))) {
        riskFlags.push('po_box_only');
      }

      // Recent formation (if we had that data)
      // Single identifier
      if (entity.identifiers.length === 1) {
        riskFlags.push('single_identifier');
      }

      if (riskFlags.length >= 2 && payments.length > 0) {
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

        findings.push({
          id: generateId('FND'),
          module: 'forensic',
          category: 'vendor_fraud',
          title: `Potential Shell Company: ${entity.names[0]}`,
          description: `Vendor shows multiple fraud indicators: ${riskFlags.join(', ')}. Total payments: $${totalPaid.toLocaleString()}.`,
          severity: totalPaid >= 100000 ? 'high' : totalPaid >= 25000 ? 'medium' : 'low',
          status: 'open',
          confidence: 0.55 + (riskFlags.length * 0.1),
          rationale: 'Multiple indicators associated with fraudulent shell companies detected.',
          evidence_refs: payments.flatMap(p => p.evidence_refs),
          related_entity_ids: [entity.id],
          related_transaction_ids: payments.map(p => p.id),
          related_account_ids: [],
          counter_hypotheses: [
            {
              hypothesis: 'Legitimate new vendor with incomplete records',
              likelihood: 'medium',
              evidence_for: ['Recent onboarding'],
              evidence_against: ['Long payment history'],
              testing_required: 'Verify vendor legitimacy through independent sources',
            },
          ],
          financial_impact: {
            amount_low: 0,
            amount_high: totalPaid,
            amount_best_estimate: totalPaid * 0.5,
            currency: 'USD',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            risk_flags: riskFlags,
            payment_count: payments.length,
          },
        });
      }
    }
  });

  return findings;
}

// ============================================================================
// FUNNEL PATTERN ANALYSIS
// ============================================================================

export function analyzeFunnelPatterns(transactions: Transaction[]): Finding[] {
  const findings: Finding[] = [];

  // Look for funneling: many small deposits followed by large withdrawal
  // Group by account
  const byAccount = new Map<string, Transaction[]>();
  transactions.forEach(txn => {
    if (txn.from_account_id) {
      const group = byAccount.get(txn.from_account_id) || [];
      group.push(txn);
      byAccount.set(txn.from_account_id, group);
    }
    if (txn.to_account_id) {
      const group = byAccount.get(txn.to_account_id) || [];
      group.push(txn);
      byAccount.set(txn.to_account_id, group);
    }
  });

  byAccount.forEach((accountTxns, accountId) => {
    // Sort by date
    const sorted = accountTxns.sort((a, b) =>
      a.transaction_date.localeCompare(b.transaction_date)
    );

    // Look for pattern: multiple credits followed by single large debit
    let creditRun = 0;
    let creditAmount = 0;

    sorted.forEach((txn, i) => {
      if (txn.direction === 'credit' && txn.amount < 10000) {
        creditRun++;
        creditAmount += txn.amount;
      } else if (txn.direction === 'debit' && creditRun >= 5) {
        // Check if debit is close to accumulated credits
        if (txn.amount >= creditAmount * 0.8 && txn.amount <= creditAmount * 1.2) {
          findings.push({
            id: generateId('FND'),
            module: 'forensic',
            category: 'funnel_pattern',
            title: 'Potential Funneling Pattern Detected',
            description: `Account ${accountId} shows pattern of ${creditRun} small credits ($${creditAmount.toLocaleString()}) followed by aggregated withdrawal ($${txn.amount.toLocaleString()}).`,
            severity: creditAmount >= 50000 ? 'high' : 'medium',
            status: 'open',
            confidence: 0.6,
            rationale: 'Pattern of small deposits aggregated into single withdrawal may indicate structuring or fund consolidation for fraudulent purposes.',
            evidence_refs: [...sorted.slice(i - creditRun, i + 1).flatMap(t => t.evidence_refs)],
            related_entity_ids: [],
            related_transaction_ids: sorted.slice(i - creditRun, i + 1).map(t => t.id),
            related_account_ids: [accountId],
            counter_hypotheses: [
              {
                hypothesis: 'Normal business cash management',
                likelihood: 'medium',
                evidence_for: ['Regular payroll patterns'],
                evidence_against: ['Unusual timing', 'New accounts'],
              },
            ],
            financial_impact: {
              amount_low: 0,
              amount_high: creditAmount,
              amount_best_estimate: creditAmount * 0.3,
              currency: 'USD',
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              credit_count: creditRun,
              credit_total: creditAmount,
              withdrawal_amount: txn.amount,
            },
          });
        }
        creditRun = 0;
        creditAmount = 0;
      } else {
        creditRun = 0;
        creditAmount = 0;
      }
    });
  });

  return findings;
}
