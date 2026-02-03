/**
 * Forensic Module Scoring
 * Fraud risk score calculation
 */

import { Score, Finding } from '../../core/types';
import { calculateScore, scoreFromFindings, SEVERITY_WEIGHTS } from '../../core/scoring';

// ============================================================================
// FRAUD RISK SCORE
// ============================================================================

export function calculateFraudRiskScore(findings: Finding[]): Score {
  if (findings.length === 0) {
    return calculateScore({
      module: 'forensic',
      scoreType: 'Fraud Risk',
      drivers: [{
        factor: 'No fraud indicators',
        weight: 1,
        rawScore: 10,
        evidenceRefs: [],
        explanation: 'No fraud indicators detected in analyzed data',
      }],
    });
  }

  // Calculate score based on findings by category
  const categories = [
    'round_dollar',
    'unusual_timing',
    'duplicate_transaction',
    'period_end_concentration',
    'journal_entry_controls',
    'unusual_account_activity',
    'vendor_fraud',
    'funnel_pattern',
  ];

  const drivers = categories.map(category => {
    const categoryFindings = findings.filter(f => f.category === category);

    if (categoryFindings.length === 0) {
      return {
        factor: formatCategoryName(category),
        weight: 1 / categories.length,
        rawScore: 0,
        evidenceRefs: [],
        explanation: 'No indicators detected',
      };
    }

    // Calculate weighted severity score
    const severityScore = categoryFindings.reduce((sum, f) => {
      return sum + (SEVERITY_WEIGHTS[f.severity] * f.confidence * 100);
    }, 0) / categoryFindings.length;

    return {
      factor: formatCategoryName(category),
      weight: 1 / categories.length,
      rawScore: Math.min(100, severityScore),
      evidenceRefs: categoryFindings.flatMap(f => f.evidence_refs),
      explanation: `${categoryFindings.length} finding(s): ${categoryFindings.map(f => f.title).join('; ').substring(0, 100)}`,
    };
  });

  return calculateScore({
    module: 'forensic',
    scoreType: 'Fraud Risk',
    drivers,
    thresholds: {
      critical: 75,
      high: 55,
      medium: 35,
      low: 15,
    },
  });
}

// ============================================================================
// CATEGORY SCORING
// ============================================================================

export function calculateCategoryScore(
  category: string,
  findings: Finding[]
): number {
  const categoryFindings = findings.filter(f => f.category === category);

  if (categoryFindings.length === 0) return 0;

  // Weight by severity and confidence
  const totalWeight = categoryFindings.reduce((sum, f) => {
    return sum + SEVERITY_WEIGHTS[f.severity] * f.confidence;
  }, 0);

  // Normalize to 0-100
  return Math.min(100, (totalWeight / categoryFindings.length) * 100);
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

export interface FraudTrendAnalysis {
  current_score: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  key_changes: string[];
  risk_trajectory: 'increasing' | 'decreasing' | 'stable';
}

export function analyzeFraudTrend(
  currentFindings: Finding[],
  priorFindings: Finding[]
): FraudTrendAnalysis {
  const currentScore = calculateFraudRiskScore(currentFindings);
  const priorScore = priorFindings.length > 0
    ? calculateFraudRiskScore(priorFindings)
    : null;

  const keyChanges: string[] = [];

  // Compare finding counts by category
  const currentCategories = new Map<string, number>();
  const priorCategories = new Map<string, number>();

  currentFindings.forEach(f => {
    currentCategories.set(f.category, (currentCategories.get(f.category) || 0) + 1);
  });

  priorFindings.forEach(f => {
    priorCategories.set(f.category, (priorCategories.get(f.category) || 0) + 1);
  });

  // Identify significant changes
  currentCategories.forEach((count, category) => {
    const priorCount = priorCategories.get(category) || 0;
    if (count > priorCount + 2) {
      keyChanges.push(`Increased ${formatCategoryName(category)} findings (+${count - priorCount})`);
    } else if (count < priorCount - 2) {
      keyChanges.push(`Decreased ${formatCategoryName(category)} findings (-${priorCount - count})`);
    }
  });

  // Determine trend
  let trend: FraudTrendAnalysis['trend'] = 'stable';
  let riskTrajectory: FraudTrendAnalysis['risk_trajectory'] = 'stable';

  if (priorScore) {
    const delta = currentScore.value - priorScore.value;
    if (delta > 10) {
      trend = 'deteriorating';
      riskTrajectory = 'increasing';
    } else if (delta < -10) {
      trend = 'improving';
      riskTrajectory = 'decreasing';
    }
  }

  return {
    current_score: currentScore.value,
    trend,
    key_changes,
    risk_trajectory: riskTrajectory,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// CONFIDENCE ADJUSTMENT
// ============================================================================

export function adjustConfidenceForEvidence(
  baseConfidence: number,
  evidenceCount: number,
  hasCorroboration: boolean
): number {
  let adjusted = baseConfidence;

  // Adjust based on evidence count
  if (evidenceCount >= 5) {
    adjusted += 0.1;
  } else if (evidenceCount >= 3) {
    adjusted += 0.05;
  } else if (evidenceCount === 1) {
    adjusted -= 0.1;
  }

  // Boost for corroboration
  if (hasCorroboration) {
    adjusted += 0.15;
  }

  return Math.max(0, Math.min(1, adjusted));
}
