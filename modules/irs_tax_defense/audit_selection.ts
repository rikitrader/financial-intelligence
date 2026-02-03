/**
 * Audit Selection Engine
 * Analyzes risk factors that trigger IRS audit selection
 */

import { Finding } from '../../core/types';
import { generateId } from '../../core/normalize';
import { TaxDefenseContext } from './index';

// DIF Score Factors (Discriminant Index Function)
const DIF_RISK_FACTORS = [
  { factor: 'high_income', weight: 0.15, description: 'High gross income' },
  { factor: 'schedule_c_loss', weight: 0.20, description: 'Schedule C with losses' },
  { factor: 'cash_business', weight: 0.18, description: 'Cash-intensive business' },
  { factor: 'large_deductions', weight: 0.15, description: 'Deductions exceeding norms' },
  { factor: 'foreign_accounts', weight: 0.12, description: 'Foreign accounts/income' },
  { factor: 'crypto_transactions', weight: 0.10, description: 'Cryptocurrency transactions' },
  { factor: 'rental_losses', weight: 0.08, description: 'Rental losses' },
  { factor: 'charity_outliers', weight: 0.07, description: 'Charitable deductions outliers' },
];

export async function runAuditSelectionEngine(context: TaxDefenseContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Analyze transactions for audit triggers
  const triggers = analyzeAuditTriggers(context);

  triggers.forEach(trigger => {
    findings.push({
      id: generateId('AUD'),
      module: 'irs_tax_defense',
      title: `Audit Selection Risk: ${trigger.factor}`,
      description: `${trigger.description}. This factor increases DIF score and audit selection probability. ` +
        `IRM Reference: ${trigger.irm_ref || 'IRM 4.10.2'}`,
      severity: trigger.severity,
      confidence: trigger.confidence,
      detected_at: new Date().toISOString(),
      evidence_refs: trigger.evidence_refs || [],
      tags: ['audit', 'dif', 'selection', trigger.factor],
      recommended_actions: trigger.recommended_actions,
    });
  });

  // Add overall audit risk assessment
  const overallRisk = calculateOverallAuditRisk(triggers);
  findings.push({
    id: generateId('AUD'),
    module: 'irs_tax_defense',
    title: 'Overall Audit Selection Risk Assessment',
    description: `Combined DIF risk score indicates ${overallRisk.level} audit selection probability. ` +
      `Key factors: ${overallRisk.top_factors.join(', ')}.`,
    severity: overallRisk.level === 'HIGH' ? 'high' : overallRisk.level === 'MEDIUM' ? 'medium' : 'low',
    confidence: overallRisk.confidence,
    detected_at: new Date().toISOString(),
    evidence_refs: [],
    tags: ['audit', 'dif', 'overall'],
    recommended_actions: [
      'Document business purpose for all large deductions',
      'Ensure adequate substantiation exists',
      'Consider protective positions in filing',
    ],
  });

  return findings;
}

interface AuditTrigger {
  factor: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  irm_ref?: string;
  evidence_refs?: any[];
  recommended_actions?: string[];
}

function analyzeAuditTriggers(context: TaxDefenseContext): AuditTrigger[] {
  const triggers: AuditTrigger[] = [];
  const transactions = Array.from(context.transactions.values());

  // Check for cash-intensive patterns
  const cashTransactions = transactions.filter(t =>
    t.description?.toLowerCase().includes('cash') ||
    t.payment_method === 'cash'
  );

  if (cashTransactions.length > transactions.length * 0.3) {
    triggers.push({
      factor: 'cash_business',
      description: 'High proportion of cash transactions detected (>30%)',
      severity: 'high',
      confidence: 0.85,
      irm_ref: 'IRM 4.10.4.3.3',
      recommended_actions: [
        'Implement cash handling controls',
        'Maintain daily cash logs',
        'Document source of all cash receipts',
      ],
    });
  }

  // Check for round dollar amounts (estimation indicator)
  const roundDollarCount = transactions.filter(t =>
    t.amount === Math.round(t.amount) && t.amount > 1000
  ).length;

  if (roundDollarCount > transactions.length * 0.5) {
    triggers.push({
      factor: 'round_dollar_amounts',
      description: 'High proportion of round dollar amounts suggests estimation',
      severity: 'medium',
      confidence: 0.70,
      irm_ref: 'IRM 4.10.4.6.2',
      recommended_actions: [
        'Review source documents for actual amounts',
        'Prepare explanation for round amounts',
        'Document methodology for any estimates',
      ],
    });
  }

  // Check for large deductions relative to income
  const totalDebits = transactions
    .filter(t => t.direction === 'debit' || t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCredits = transactions
    .filter(t => t.direction === 'credit' || t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  if (totalDebits > totalCredits * 0.85) {
    triggers.push({
      factor: 'expense_ratio',
      description: 'Expense ratio exceeds 85% of income - potential DIF trigger',
      severity: 'high',
      confidence: 0.80,
      irm_ref: 'IRM 4.10.4.3.2',
      recommended_actions: [
        'Prepare substantiation for all major expense categories',
        'Document business necessity',
        'Consider timing adjustments for future periods',
      ],
    });
  }

  // Check for foreign transactions
  const foreignTransactions = transactions.filter(t =>
    t.description?.toLowerCase().includes('foreign') ||
    t.description?.toLowerCase().includes('international') ||
    t.description?.toLowerCase().includes('wire') &&
    t.counterparty_country && t.counterparty_country !== 'US'
  );

  if (foreignTransactions.length > 0) {
    triggers.push({
      factor: 'foreign_transactions',
      description: `${foreignTransactions.length} foreign transactions detected`,
      severity: 'medium',
      confidence: 0.75,
      irm_ref: 'IRM 4.26.16',
      recommended_actions: [
        'Ensure FBAR filing compliance',
        'Review Form 8938 requirements',
        'Document foreign account ownership',
      ],
    });
  }

  return triggers;
}

function calculateOverallAuditRisk(triggers: AuditTrigger[]): {
  level: string;
  score: number;
  confidence: number;
  top_factors: string[];
} {
  if (triggers.length === 0) {
    return {
      level: 'LOW',
      score: 20,
      confidence: 0.70,
      top_factors: ['No significant triggers identified'],
    };
  }

  // Weight by severity
  const severityWeights: Record<string, number> = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 5,
  };

  let totalScore = 0;
  triggers.forEach(t => {
    totalScore += severityWeights[t.severity] * t.confidence;
  });

  const score = Math.min(totalScore, 100);
  const level = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

  const topFactors = triggers
    .sort((a, b) => severityWeights[b.severity] - severityWeights[a.severity])
    .slice(0, 3)
    .map(t => t.factor);

  return {
    level,
    score,
    confidence: triggers.reduce((sum, t) => sum + t.confidence, 0) / triggers.length,
    top_factors: topFactors,
  };
}
