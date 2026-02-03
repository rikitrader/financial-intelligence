/**
 * Risk Scoring Engine
 * Computes weighted, explainable risk scores across all modules
 */

import {
  Score,
  ScoreDriver,
  CompositeScore,
  Finding,
  FindingSeverity,
} from './types';

// ============================================================================
// SCORE THRESHOLDS
// ============================================================================

export const DEFAULT_THRESHOLDS = {
  critical: 80,
  high: 60,
  medium: 40,
  low: 20,
};

export const SEVERITY_WEIGHTS: Record<FindingSeverity, number> = {
  critical: 1.0,
  high: 0.75,
  medium: 0.5,
  low: 0.25,
  info: 0.1,
};

// ============================================================================
// MODULE SCORING WEIGHTS
// ============================================================================

export const MODULE_WEIGHTS: Record<string, number> = {
  cfo: 0.10,
  sec: 0.12,
  forensic: 0.15,
  fincen_aml: 0.12,
  records_intelligence: 0.05,
  reconciliation: 0.08,
  controls_sox: 0.10,
  ap_procurement: 0.07,
  payroll_forensics: 0.06,
  statistical_anomalies: 0.05,
  asset_tracing: 0.05,
  litigation_finance: 0.05,
};

// ============================================================================
// SCORE CALCULATION
// ============================================================================

export interface ScoreInput {
  module: string;
  scoreType: string;
  drivers: {
    factor: string;
    weight: number;
    rawScore: number;
    evidenceRefs: string[];
    explanation: string;
  }[];
  thresholds?: typeof DEFAULT_THRESHOLDS;
}

export function calculateScore(input: ScoreInput): Score {
  const drivers: ScoreDriver[] = input.drivers.map(d => ({
    factor: d.factor,
    weight: d.weight,
    raw_score: d.rawScore,
    weighted_contribution: d.rawScore * d.weight,
    evidence_refs: d.evidenceRefs,
    explanation: d.explanation,
  }));

  // Normalize weights to sum to 1
  const totalWeight = drivers.reduce((sum, d) => sum + d.weight, 0);
  if (totalWeight > 0) {
    drivers.forEach(d => {
      d.weight = d.weight / totalWeight;
      d.weighted_contribution = d.raw_score * d.weight;
    });
  }

  const value = drivers.reduce((sum, d) => sum + d.weighted_contribution, 0);
  const confidence = calculateConfidence(drivers);
  const thresholds = input.thresholds || DEFAULT_THRESHOLDS;

  return {
    module: input.module,
    score_type: input.scoreType,
    value: Math.round(value * 100) / 100,
    confidence,
    drivers,
    thresholds,
    interpretation: interpretScore(value, thresholds),
    recommendations: generateRecommendations(drivers, thresholds),
    calculated_at: new Date().toISOString(),
    evidence_refs: drivers.flatMap(d => d.evidence_refs),
  };
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

function calculateConfidence(drivers: ScoreDriver[]): number {
  if (drivers.length === 0) return 0;

  // Base confidence from evidence coverage
  const evidenceCoverage = drivers.filter(d => d.evidence_refs.length > 0).length / drivers.length;

  // Confidence penalty for extreme scores with low evidence
  const avgEvidence = drivers.reduce((sum, d) => sum + d.evidence_refs.length, 0) / drivers.length;
  const evidenceBonus = Math.min(avgEvidence / 5, 1) * 0.2;  // Max 0.2 bonus for 5+ evidence per driver

  // Weight concentration factor (penalize if one driver dominates)
  const weights = drivers.map(d => d.weight);
  const maxWeight = Math.max(...weights);
  const concentrationPenalty = maxWeight > 0.5 ? (maxWeight - 0.5) * 0.2 : 0;

  const confidence = Math.max(0, Math.min(1,
    0.5 + (evidenceCoverage * 0.3) + evidenceBonus - concentrationPenalty
  ));

  return Math.round(confidence * 100) / 100;
}

// ============================================================================
// SCORE INTERPRETATION
// ============================================================================

function interpretScore(value: number, thresholds: typeof DEFAULT_THRESHOLDS): string {
  if (value >= thresholds.critical) {
    return 'CRITICAL: Immediate attention required. Multiple high-severity indicators detected.';
  } else if (value >= thresholds.high) {
    return 'HIGH: Significant concerns identified requiring prompt investigation.';
  } else if (value >= thresholds.medium) {
    return 'MEDIUM: Notable indicators present warranting further review.';
  } else if (value >= thresholds.low) {
    return 'LOW: Minor concerns detected, routine monitoring recommended.';
  } else {
    return 'MINIMAL: No significant concerns identified based on available data.';
  }
}

function generateRecommendations(drivers: ScoreDriver[], thresholds: typeof DEFAULT_THRESHOLDS): string[] {
  const recommendations: string[] = [];

  // Sort drivers by weighted contribution
  const sortedDrivers = [...drivers].sort((a, b) => b.weighted_contribution - a.weighted_contribution);

  // Top contributors get specific recommendations
  sortedDrivers.slice(0, 3).forEach(driver => {
    if (driver.raw_score >= thresholds.high) {
      recommendations.push(`Address ${driver.factor}: ${driver.explanation}`);
    } else if (driver.raw_score >= thresholds.medium) {
      recommendations.push(`Monitor ${driver.factor}: ${driver.explanation}`);
    }
  });

  // Low evidence recommendations
  const lowEvidenceDrivers = drivers.filter(d => d.evidence_refs.length < 2 && d.raw_score > thresholds.low);
  if (lowEvidenceDrivers.length > 0) {
    recommendations.push(`Gather additional evidence for: ${lowEvidenceDrivers.map(d => d.factor).join(', ')}`);
  }

  return recommendations;
}

// ============================================================================
// FINDING-BASED SCORING
// ============================================================================

export function scoreFromFindings(
  module: string,
  scoreType: string,
  findings: Finding[],
  baselineScore: number = 20
): Score {
  if (findings.length === 0) {
    return calculateScore({
      module,
      scoreType,
      drivers: [{
        factor: 'No findings',
        weight: 1,
        rawScore: baselineScore,
        evidenceRefs: [],
        explanation: 'No significant findings identified',
      }],
    });
  }

  // Group findings by category
  const byCategory = new Map<string, Finding[]>();
  findings.forEach(f => {
    const existing = byCategory.get(f.category) || [];
    existing.push(f);
    byCategory.set(f.category, existing);
  });

  const drivers: ScoreInput['drivers'] = [];

  byCategory.forEach((categoryFindings, category) => {
    // Calculate category score based on findings
    let categoryScore = 0;
    let totalWeight = 0;

    categoryFindings.forEach(finding => {
      const severityWeight = SEVERITY_WEIGHTS[finding.severity];
      const confidenceAdjusted = severityWeight * finding.confidence;
      categoryScore += confidenceAdjusted * 100;
      totalWeight += confidenceAdjusted;
    });

    const avgScore = totalWeight > 0 ? categoryScore / totalWeight : baselineScore;

    drivers.push({
      factor: category,
      weight: categoryFindings.length / findings.length,
      rawScore: Math.min(100, avgScore),
      evidenceRefs: categoryFindings.flatMap(f => f.evidence_refs),
      explanation: `${categoryFindings.length} finding(s): ${categoryFindings.map(f => f.title).join('; ')}`,
    });
  });

  return calculateScore({ module, scoreType, drivers });
}

// ============================================================================
// COMPOSITE SCORING
// ============================================================================

export function calculateCompositeScore(
  moduleScores: Score[],
  weights: Record<string, number> = MODULE_WEIGHTS
): CompositeScore {
  const components: CompositeScore['component_scores'] = [];
  const drivers: ScoreInput['drivers'] = [];

  let totalWeight = 0;

  moduleScores.forEach(score => {
    const weight = weights[score.module] || 0.05;
    totalWeight += weight;

    components.push({
      module: score.module,
      score: score.value,
      weight,
      confidence: score.confidence,
    });

    drivers.push({
      factor: `${score.module} (${score.score_type})`,
      weight,
      rawScore: score.value,
      evidenceRefs: score.evidence_refs,
      explanation: score.interpretation,
    });
  });

  // Normalize weights
  components.forEach(c => c.weight = c.weight / totalWeight);

  const baseScore = calculateScore({
    module: 'composite',
    scoreType: 'Financial Risk Index',
    drivers,
  });

  // Confidence propagation: composite confidence is weighted average of component confidences
  const propagatedConfidence = components.reduce(
    (sum, c) => sum + c.confidence * c.weight, 0
  );

  return {
    ...baseScore,
    confidence: Math.round(propagatedConfidence * 100) / 100,
    component_scores: components,
  };
}

// ============================================================================
// SCORE COMPARISON
// ============================================================================

export interface ScoreComparison {
  prior: Score;
  current: Score;
  delta: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  significantChanges: {
    driver: string;
    priorValue: number;
    currentValue: number;
    delta: number;
  }[];
}

export function compareScores(prior: Score, current: Score): ScoreComparison {
  const delta = current.value - prior.value;

  let trend: ScoreComparison['trend'];
  if (Math.abs(delta) < 5) {
    trend = 'stable';
  } else if (delta < 0) {
    trend = 'improving';  // Lower risk score = improving
  } else {
    trend = 'deteriorating';
  }

  // Find significant driver changes
  const significantChanges: ScoreComparison['significantChanges'] = [];

  current.drivers.forEach(currentDriver => {
    const priorDriver = prior.drivers.find(d => d.factor === currentDriver.factor);
    if (priorDriver) {
      const driverDelta = currentDriver.raw_score - priorDriver.raw_score;
      if (Math.abs(driverDelta) >= 10) {
        significantChanges.push({
          driver: currentDriver.factor,
          priorValue: priorDriver.raw_score,
          currentValue: currentDriver.raw_score,
          delta: driverDelta,
        });
      }
    }
  });

  return {
    prior,
    current,
    delta,
    trend,
    significantChanges,
  };
}

// ============================================================================
// LITIGATION SCORES
// ============================================================================

export function calculateLitigationStrengthScore(
  evidenceStrength: number,  // 0-100
  findingConfidence: number,  // 0-1
  crossExamVulnerability: number,  // 0-100
  juryPersuasion: number  // 0-100
): Score {
  return calculateScore({
    module: 'litigation',
    scoreType: 'Litigation Strength',
    drivers: [
      {
        factor: 'Evidence Strength',
        weight: 0.35,
        rawScore: evidenceStrength,
        evidenceRefs: [],
        explanation: `Evidence quality and completeness: ${evidenceStrength >= 70 ? 'Strong' : evidenceStrength >= 40 ? 'Moderate' : 'Weak'}`,
      },
      {
        factor: 'Finding Confidence',
        weight: 0.25,
        rawScore: findingConfidence * 100,
        evidenceRefs: [],
        explanation: `Overall confidence in findings: ${(findingConfidence * 100).toFixed(0)}%`,
      },
      {
        factor: 'Cross-Exam Resilience',
        weight: 0.20,
        rawScore: 100 - crossExamVulnerability,
        evidenceRefs: [],
        explanation: crossExamVulnerability <= 30 ? 'Highly defensible' : crossExamVulnerability <= 60 ? 'Some vulnerabilities' : 'Significant exposure',
      },
      {
        factor: 'Jury Persuasion',
        weight: 0.20,
        rawScore: juryPersuasion,
        evidenceRefs: [],
        explanation: `Narrative clarity and persuasiveness: ${juryPersuasion >= 70 ? 'Compelling' : juryPersuasion >= 40 ? 'Adequate' : 'Needs work'}`,
      },
    ],
  });
}

export function calculateSettlementLeverageScore(
  litigationStrength: number,
  damagesRange: { low: number; high: number },
  regulatoryRisk: number,
  timeToTrial: number  // months
): Score {
  // Normalize damages to score (log scale for large amounts)
  const avgDamages = (damagesRange.low + damagesRange.high) / 2;
  const damagesScore = Math.min(100, Math.log10(avgDamages + 1) * 15);

  // Time pressure (closer to trial = more pressure)
  const timePressure = Math.max(0, 100 - timeToTrial * 5);

  return calculateScore({
    module: 'settlement',
    scoreType: 'Settlement Leverage',
    drivers: [
      {
        factor: 'Litigation Strength',
        weight: 0.40,
        rawScore: litigationStrength,
        evidenceRefs: [],
        explanation: `Case strength: ${litigationStrength >= 70 ? 'Strong position' : litigationStrength >= 40 ? 'Moderate position' : 'Weak position'}`,
      },
      {
        factor: 'Damages Exposure',
        weight: 0.25,
        rawScore: damagesScore,
        evidenceRefs: [],
        explanation: `Potential exposure: $${damagesRange.low.toLocaleString()} - $${damagesRange.high.toLocaleString()}`,
      },
      {
        factor: 'Regulatory Risk',
        weight: 0.20,
        rawScore: regulatoryRisk,
        evidenceRefs: [],
        explanation: regulatoryRisk >= 60 ? 'High regulatory scrutiny risk' : 'Manageable regulatory exposure',
      },
      {
        factor: 'Time Pressure',
        weight: 0.15,
        rawScore: timePressure,
        evidenceRefs: [],
        explanation: `${timeToTrial} months to trial`,
      },
    ],
  });
}

// ============================================================================
// TRIAL MOMENTUM SCORE
// ============================================================================

export function calculateTrialMomentumScore(
  helpfulSignals: number,
  harmfulSignals: number,
  contradictionsExploited: number,
  contradictionsMissed: number,
  judgeInterventions: number,
  narrativeClarity: number  // 0-100
): Score {
  const signalRatio = helpfulSignals / Math.max(1, helpfulSignals + harmfulSignals);
  const contradictionScore = contradictionsExploited / Math.max(1, contradictionsExploited + contradictionsMissed);

  return calculateScore({
    module: 'realtime_trial',
    scoreType: 'Trial Momentum',
    drivers: [
      {
        factor: 'Testimony Signals',
        weight: 0.30,
        rawScore: signalRatio * 100,
        evidenceRefs: [],
        explanation: `${helpfulSignals} helpful vs ${harmfulSignals} harmful signals`,
      },
      {
        factor: 'Contradiction Exploitation',
        weight: 0.25,
        rawScore: contradictionScore * 100,
        evidenceRefs: [],
        explanation: `${contradictionsExploited} exploited, ${contradictionsMissed} remaining`,
      },
      {
        factor: 'Judge Favorability',
        weight: 0.20,
        rawScore: Math.max(0, 100 - judgeInterventions * 10),
        evidenceRefs: [],
        explanation: `${judgeInterventions} adverse interventions`,
      },
      {
        factor: 'Narrative Clarity',
        weight: 0.25,
        rawScore: narrativeClarity,
        evidenceRefs: [],
        explanation: narrativeClarity >= 70 ? 'Clear, compelling narrative' : 'Narrative needs strengthening',
      },
    ],
  });
}
