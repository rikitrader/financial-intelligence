/**
 * Outlier Detection Module
 * Z-score, IQR, and clustering-based anomaly detection
 */

import { Transaction, Finding } from '../../core/types';
import { generateId } from '../../core/normalize';

// ============================================================================
// STATISTICAL HELPERS
// ============================================================================

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateStdDev(values: number[], mean?: number): number {
  if (values.length < 2) return 0;
  const m = mean ?? calculateMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - m, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateQuartiles(values: number[]): { q1: number; q2: number; q3: number; iqr: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q2 = calculateMedian(sorted);

  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const upperHalf = sorted.slice(Math.ceil(n / 2));

  const q1 = calculateMedian(lowerHalf);
  const q3 = calculateMedian(upperHalf);

  return { q1, q2, q3, iqr: q3 - q1 };
}

// ============================================================================
// Z-SCORE OUTLIER DETECTION
// ============================================================================

export interface ZScoreResult {
  value: number;
  z_score: number;
  is_outlier: boolean;
  transaction_id: string;
}

export function calculateZScores(
  transactions: Transaction[],
  threshold: number = 3
): ZScoreResult[] {
  const amounts = transactions.map(t => t.amount);
  const mean = calculateMean(amounts);
  const stdDev = calculateStdDev(amounts, mean);

  if (stdDev === 0) {
    return transactions.map(t => ({
      value: t.amount,
      z_score: 0,
      is_outlier: false,
      transaction_id: t.id,
    }));
  }

  return transactions.map(t => {
    const zScore = (t.amount - mean) / stdDev;
    return {
      value: t.amount,
      z_score: zScore,
      is_outlier: Math.abs(zScore) > threshold,
      transaction_id: t.id,
    };
  });
}

// ============================================================================
// IQR OUTLIER DETECTION
// ============================================================================

export interface IQRResult {
  value: number;
  is_outlier: boolean;
  outlier_type: 'mild' | 'extreme' | null;
  transaction_id: string;
}

export function detectIQROutliers(
  transactions: Transaction[],
  multiplier: number = 1.5
): IQRResult[] {
  const amounts = transactions.map(t => t.amount);
  const { q1, q3, iqr } = calculateQuartiles(amounts);

  const lowerFence = q1 - multiplier * iqr;
  const upperFence = q3 + multiplier * iqr;
  const extremeLower = q1 - 3 * iqr;
  const extremeUpper = q3 + 3 * iqr;

  return transactions.map(t => {
    let isOutlier = false;
    let outlierType: IQRResult['outlier_type'] = null;

    if (t.amount < extremeLower || t.amount > extremeUpper) {
      isOutlier = true;
      outlierType = 'extreme';
    } else if (t.amount < lowerFence || t.amount > upperFence) {
      isOutlier = true;
      outlierType = 'mild';
    }

    return {
      value: t.amount,
      is_outlier: isOutlier,
      outlier_type: outlierType,
      transaction_id: t.id,
    };
  });
}

// ============================================================================
// OUTLIER FINDINGS
// ============================================================================

export function detectOutliers(
  transactions: Transaction[],
  zThreshold: number = 3
): Finding[] {
  const findings: Finding[] = [];

  if (transactions.length < 30) {
    return findings;  // Need sufficient data for meaningful outlier detection
  }

  // Z-score outliers
  const zResults = calculateZScores(transactions, zThreshold);
  const zOutliers = zResults.filter(r => r.is_outlier);

  if (zOutliers.length > 0 && zOutliers.length < transactions.length * 0.1) {
    const outlierTxns = transactions.filter(t =>
      zOutliers.some(o => o.transaction_id === t.id)
    );

    const totalAmount = outlierTxns.reduce((sum, t) => sum + t.amount, 0);
    const maxZScore = Math.max(...zOutliers.map(o => Math.abs(o.z_score)));

    findings.push({
      id: generateId('FND'),
      module: 'statistical_anomalies',
      category: 'z_score_outlier',
      title: `${zOutliers.length} Statistical Outliers Detected (Z-Score Method)`,
      description: `${zOutliers.length} transactions (${(zOutliers.length / transactions.length * 100).toFixed(1)}%) have amounts more than ${zThreshold} standard deviations from the mean. Total outlier amount: $${totalAmount.toLocaleString()}. Maximum Z-score: ${maxZScore.toFixed(2)}.`,
      severity: maxZScore > 5 ? 'high' : maxZScore > 4 ? 'medium' : 'low',
      status: 'open',
      confidence: 0.7,
      rationale: 'Transactions with amounts significantly different from the population mean may indicate errors, fraud, or unusual business activity.',
      evidence_refs: outlierTxns.flatMap(t => t.evidence_refs),
      related_entity_ids: [],
      related_transaction_ids: outlierTxns.map(t => t.id),
      related_account_ids: [],
      counter_hypotheses: [
        {
          hypothesis: 'Legitimate large transactions',
          likelihood: 'medium',
          evidence_for: ['Supporting documentation', 'Proper approval'],
          evidence_against: ['No documentation', 'Unusual patterns'],
        },
      ],
      financial_impact: {
        amount_low: 0,
        amount_high: totalAmount,
        amount_best_estimate: totalAmount * 0.2,
        currency: 'USD',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        outlier_count: zOutliers.length,
        max_z_score: maxZScore,
        method: 'z-score',
      },
    });
  }

  // IQR outliers
  const iqrResults = detectIQROutliers(transactions);
  const extremeOutliers = iqrResults.filter(r => r.outlier_type === 'extreme');

  if (extremeOutliers.length > 0) {
    const extremeTxns = transactions.filter(t =>
      extremeOutliers.some(o => o.transaction_id === t.id)
    );

    findings.push({
      id: generateId('FND'),
      module: 'statistical_anomalies',
      category: 'iqr_outlier',
      title: `${extremeOutliers.length} Extreme Outliers (IQR Method)`,
      description: `${extremeOutliers.length} transactions are extreme outliers (beyond 3×IQR from quartiles), indicating highly unusual amounts.`,
      severity: 'medium',
      status: 'open',
      confidence: 0.65,
      rationale: 'Interquartile Range method identifies extreme values that are robust to non-normal distributions.',
      evidence_refs: extremeTxns.flatMap(t => t.evidence_refs),
      related_entity_ids: [],
      related_transaction_ids: extremeTxns.map(t => t.id),
      related_account_ids: [],
      counter_hypotheses: [
        {
          hypothesis: 'Valid one-time large transactions',
          likelihood: 'medium',
          evidence_for: ['Contract support', 'Management approval'],
          evidence_against: [],
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        outlier_count: extremeOutliers.length,
        method: 'iqr',
      },
    });
  }

  return findings;
}

// ============================================================================
// CLUSTER DETECTION
// ============================================================================

export function detectClusters(transactions: Transaction[]): Finding[] {
  const findings: Finding[] = [];

  if (transactions.length < 50) {
    return findings;
  }

  // Simple clustering by amount ranges
  const ranges: [number, number][] = [
    [0, 1000],
    [1000, 5000],
    [5000, 10000],
    [10000, 50000],
    [50000, 100000],
    [100000, 500000],
    [500000, Infinity],
  ];

  const clusters = ranges.map(([min, max]) => {
    const inRange = transactions.filter(t => t.amount >= min && t.amount < max);
    return {
      range: `$${min.toLocaleString()} - $${max === Infinity ? '∞' : max.toLocaleString()}`,
      count: inRange.length,
      percentage: (inRange.length / transactions.length) * 100,
      total: inRange.reduce((sum, t) => sum + t.amount, 0),
      transactions: inRange,
    };
  });

  // Check for unusual concentrations
  clusters.forEach(cluster => {
    // Flag if >50% of transactions in a single range (unusual concentration)
    if (cluster.percentage > 50 && cluster.count > 10) {
      findings.push({
        id: generateId('FND'),
        module: 'statistical_anomalies',
        category: 'amount_clustering',
        title: `High Concentration of Transactions in ${cluster.range}`,
        description: `${cluster.percentage.toFixed(1)}% of transactions (${cluster.count}) fall within ${cluster.range}. This concentration may warrant investigation.`,
        severity: 'low',
        status: 'open',
        confidence: 0.5,
        rationale: 'Unusual concentration in specific amount ranges may indicate systematic patterns or constraints.',
        evidence_refs: cluster.transactions.slice(0, 10).flatMap(t => t.evidence_refs),
        related_entity_ids: [],
        related_transaction_ids: cluster.transactions.slice(0, 20).map(t => t.id),
        related_account_ids: [],
        counter_hypotheses: [
          {
            hypothesis: 'Normal business pricing structure',
            likelihood: 'high',
            evidence_for: ['Standard product pricing', 'Service tiers'],
            evidence_against: [],
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          range: cluster.range,
          count: cluster.count,
          percentage: cluster.percentage,
        },
      });
    }
  });

  // Detect just-below-threshold clustering (potential structuring)
  const thresholds = [10000, 5000, 3000, 1000];

  thresholds.forEach(threshold => {
    const justBelow = transactions.filter(t =>
      t.amount >= threshold * 0.9 && t.amount < threshold
    );

    const expectedInRange = transactions.length * 0.1;  // Expect ~10% in any 10% range

    if (justBelow.length > expectedInRange * 2 && justBelow.length >= 5) {
      findings.push({
        id: generateId('FND'),
        module: 'statistical_anomalies',
        category: 'threshold_clustering',
        title: `Suspicious Clustering Just Below $${threshold.toLocaleString()} Threshold`,
        description: `${justBelow.length} transactions cluster just below $${threshold.toLocaleString()} (${((threshold * 0.9)).toLocaleString()} - ${threshold.toLocaleString()}). This pattern may indicate intentional structuring to avoid reporting thresholds.`,
        severity: threshold === 10000 ? 'high' : 'medium',  // $10K is CTR threshold
        status: 'open',
        confidence: 0.6,
        rationale: 'Transactions intentionally structured below reporting thresholds (e.g., $10,000 CTR) may indicate money laundering or fraud.',
        evidence_refs: justBelow.flatMap(t => t.evidence_refs),
        related_entity_ids: [],
        related_transaction_ids: justBelow.map(t => t.id),
        related_account_ids: [],
        counter_hypotheses: [
          {
            hypothesis: 'Natural pricing around common amounts',
            likelihood: 'medium',
            evidence_for: ['Standard pricing'],
            evidence_against: ['Concentration pattern'],
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          threshold,
          count: justBelow.length,
          expected: expectedInRange,
        },
      });
    }
  });

  return findings;
}
