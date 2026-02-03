/**
 * Benford's Law Analysis
 * Statistical analysis for detecting manipulation in financial data
 */

import { Transaction, LedgerEntry, Finding } from '../../core/types';
import { generateId } from '../../core/normalize';

// ============================================================================
// BENFORD'S LAW EXPECTED DISTRIBUTION
// ============================================================================

export const BENFORD_EXPECTED: Record<number, number> = {
  1: 0.301,
  2: 0.176,
  3: 0.125,
  4: 0.097,
  5: 0.079,
  6: 0.067,
  7: 0.058,
  8: 0.051,
  9: 0.046,
};

// Chi-square critical values (df=8, various alpha levels)
const CHI_SQUARE_CRITICAL = {
  0.05: 15.507,  // 95% confidence
  0.01: 20.090,  // 99% confidence
  0.001: 26.125, // 99.9% confidence
};

// ============================================================================
// BENFORD ANALYSIS RESULT
// ============================================================================

export interface BenfordResult {
  sample_size: number;
  observed: Record<number, number>;
  expected: Record<number, number>;
  chi_square: number;
  p_value_range: string;
  mad: number;  // Mean Absolute Deviation
  conformity: 'acceptable' | 'marginal' | 'nonconforming';
  digit_analysis: {
    digit: number;
    expected_pct: number;
    observed_pct: number;
    deviation: number;
    z_score: number;
  }[];
}

// ============================================================================
// FIRST DIGIT EXTRACTION
// ============================================================================

function getFirstDigit(value: number): number | null {
  if (value === 0) return null;
  const abs = Math.abs(value);
  const str = abs.toExponential();
  const firstChar = str.charAt(0);
  const digit = parseInt(firstChar);
  return digit >= 1 && digit <= 9 ? digit : null;
}

// ============================================================================
// BENFORD ANALYSIS
// ============================================================================

export function analyzeBenford(amounts: number[]): BenfordResult {
  // Filter valid amounts and extract first digits
  const firstDigits = amounts
    .filter(a => a !== 0 && Math.abs(a) >= 10)  // Benford works best with amounts >= 10
    .map(getFirstDigit)
    .filter((d): d is number => d !== null);

  const sampleSize = firstDigits.length;

  // Count occurrences
  const observed: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  firstDigits.forEach(d => {
    observed[d]++;
  });

  // Calculate expected counts
  const expected: Record<number, number> = {};
  for (let d = 1; d <= 9; d++) {
    expected[d] = BENFORD_EXPECTED[d] * sampleSize;
  }

  // Chi-square test
  let chiSquare = 0;
  for (let d = 1; d <= 9; d++) {
    const diff = observed[d] - expected[d];
    chiSquare += (diff * diff) / expected[d];
  }

  // Determine p-value range
  let pValueRange: string;
  if (chiSquare < CHI_SQUARE_CRITICAL[0.05]) {
    pValueRange = 'p > 0.05';
  } else if (chiSquare < CHI_SQUARE_CRITICAL[0.01]) {
    pValueRange = '0.01 < p < 0.05';
  } else if (chiSquare < CHI_SQUARE_CRITICAL[0.001]) {
    pValueRange = '0.001 < p < 0.01';
  } else {
    pValueRange = 'p < 0.001';
  }

  // Mean Absolute Deviation
  let mad = 0;
  for (let d = 1; d <= 9; d++) {
    const observedPct = observed[d] / sampleSize;
    mad += Math.abs(observedPct - BENFORD_EXPECTED[d]);
  }
  mad = mad / 9;

  // Conformity assessment based on MAD
  let conformity: BenfordResult['conformity'];
  if (mad <= 0.006) {
    conformity = 'acceptable';
  } else if (mad <= 0.012) {
    conformity = 'marginal';
  } else {
    conformity = 'nonconforming';
  }

  // Digit-by-digit analysis
  const digitAnalysis = [];
  for (let d = 1; d <= 9; d++) {
    const observedPct = observed[d] / sampleSize;
    const expectedPct = BENFORD_EXPECTED[d];
    const deviation = observedPct - expectedPct;

    // Z-score for proportion
    const se = Math.sqrt((expectedPct * (1 - expectedPct)) / sampleSize);
    const zScore = se > 0 ? deviation / se : 0;

    digitAnalysis.push({
      digit: d,
      expected_pct: expectedPct * 100,
      observed_pct: observedPct * 100,
      deviation: deviation * 100,
      z_score: zScore,
    });
  }

  return {
    sample_size: sampleSize,
    observed,
    expected,
    chi_square: chiSquare,
    p_value_range: pValueRange,
    mad,
    conformity,
    digit_analysis: digitAnalysis,
  };
}

// ============================================================================
// BENFORD FINDINGS
// ============================================================================

export function generateBenfordFindings(
  result: BenfordResult,
  dataType: string,
  evidenceRefs: string[]
): Finding[] {
  const findings: Finding[] = [];

  // Overall conformity finding
  if (result.conformity === 'nonconforming') {
    findings.push({
      id: generateId('FND'),
      module: 'statistical_anomalies',
      category: 'benford_nonconformity',
      title: `Benford's Law Non-Conformity in ${dataType}`,
      description: `Analysis of ${result.sample_size} ${dataType} shows significant deviation from Benford's Law expected distribution (MAD: ${(result.mad * 100).toFixed(2)}%, Chi-square: ${result.chi_square.toFixed(2)}, ${result.p_value_range}).`,
      severity: result.mad > 0.02 ? 'high' : 'medium',
      status: 'open',
      confidence: 0.7,
      rationale: `Benford's Law states that first digits in naturally occurring data follow a predictable distribution. Significant deviation may indicate data manipulation, fabrication, or rounding.`,
      evidence_refs: evidenceRefs,
      related_entity_ids: [],
      related_transaction_ids: [],
      related_account_ids: [],
      counter_hypotheses: [
        {
          hypothesis: 'Data constraints limiting natural variation',
          likelihood: 'medium',
          evidence_for: ['Fixed price contracts', 'Regulated amounts'],
          evidence_against: ['Diverse transaction types'],
        },
        {
          hypothesis: 'Small sample size affecting distribution',
          likelihood: result.sample_size < 500 ? 'medium' : 'low',
          evidence_for: result.sample_size < 500 ? ['Sample < 500'] : [],
          evidence_against: result.sample_size >= 500 ? ['Adequate sample size'] : [],
        },
      ],
      methodology: `Benford's Law analysis with Chi-square goodness-of-fit test (df=8) and Mean Absolute Deviation assessment.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        chi_square: result.chi_square,
        mad: result.mad,
        sample_size: result.sample_size,
      },
    });
  }

  // Specific digit anomalies
  result.digit_analysis.forEach(digit => {
    if (Math.abs(digit.z_score) > 3) {  // Highly significant
      const direction = digit.deviation > 0 ? 'over-represented' : 'under-represented';

      findings.push({
        id: generateId('FND'),
        module: 'statistical_anomalies',
        category: 'benford_digit_anomaly',
        title: `Digit ${digit.digit} ${direction} in ${dataType}`,
        description: `First digit ${digit.digit} appears in ${digit.observed_pct.toFixed(1)}% of ${dataType} vs expected ${digit.expected_pct.toFixed(1)}% (Z-score: ${digit.z_score.toFixed(2)}).`,
        severity: Math.abs(digit.z_score) > 4 ? 'high' : 'medium',
        status: 'open',
        confidence: 0.65,
        rationale: `Significant deviation (>${Math.abs(digit.z_score).toFixed(1)} standard deviations) from expected Benford distribution for digit ${digit.digit}.`,
        evidence_refs: evidenceRefs,
        related_entity_ids: [],
        related_transaction_ids: [],
        related_account_ids: [],
        counter_hypotheses: [
          {
            hypothesis: 'Business-specific pricing patterns',
            likelihood: 'medium',
            evidence_for: ['Standard pricing tiers'],
            evidence_against: ['Random transaction mix'],
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          digit: digit.digit,
          z_score: digit.z_score,
          deviation_pct: digit.deviation,
        },
      });
    }
  });

  return findings;
}

// ============================================================================
// SEGMENTED BENFORD ANALYSIS
// ============================================================================

export function analyzeBySegment(
  transactions: Transaction[],
  segmentBy: 'vendor' | 'account' | 'month'
): Map<string, BenfordResult> {
  const segments = new Map<string, number[]>();

  transactions.forEach(txn => {
    let key: string;

    switch (segmentBy) {
      case 'vendor':
        key = txn.to_entity_id || 'unknown';
        break;
      case 'account':
        key = txn.from_account_id || txn.to_account_id || 'unknown';
        break;
      case 'month':
        key = txn.transaction_date.substring(0, 7);  // YYYY-MM
        break;
      default:
        key = 'all';
    }

    const amounts = segments.get(key) || [];
    amounts.push(txn.amount);
    segments.set(key, amounts);
  });

  const results = new Map<string, BenfordResult>();

  segments.forEach((amounts, key) => {
    if (amounts.length >= 100) {  // Minimum sample for meaningful analysis
      results.set(key, analyzeBenford(amounts));
    }
  });

  return results;
}

// ============================================================================
// SECOND DIGIT ANALYSIS
// ============================================================================

export const BENFORD_SECOND_DIGIT: Record<number, number> = {
  0: 0.120,
  1: 0.114,
  2: 0.109,
  3: 0.104,
  4: 0.100,
  5: 0.097,
  6: 0.093,
  7: 0.090,
  8: 0.088,
  9: 0.085,
};

function getSecondDigit(value: number): number | null {
  if (value === 0 || Math.abs(value) < 10) return null;

  const abs = Math.abs(value);
  const str = abs.toString().replace('.', '').replace(/^0+/, '');

  if (str.length < 2) return null;
  return parseInt(str.charAt(1));
}

export function analyzeSecondDigit(amounts: number[]): {
  observed: Record<number, number>;
  chi_square: number;
  anomalies: number[];
} {
  const secondDigits = amounts
    .filter(a => Math.abs(a) >= 10)
    .map(getSecondDigit)
    .filter((d): d is number => d !== null);

  const observed: Record<number, number> = {};
  for (let d = 0; d <= 9; d++) {
    observed[d] = 0;
  }

  secondDigits.forEach(d => {
    observed[d]++;
  });

  const n = secondDigits.length;

  // Chi-square
  let chiSquare = 0;
  for (let d = 0; d <= 9; d++) {
    const expected = BENFORD_SECOND_DIGIT[d] * n;
    const diff = observed[d] - expected;
    chiSquare += (diff * diff) / expected;
  }

  // Find anomalous digits
  const anomalies: number[] = [];
  for (let d = 0; d <= 9; d++) {
    const observedPct = observed[d] / n;
    const expectedPct = BENFORD_SECOND_DIGIT[d];
    if (Math.abs(observedPct - expectedPct) > 0.03) {
      anomalies.push(d);
    }
  }

  return { observed, chi_square: chiSquare, anomalies };
}
