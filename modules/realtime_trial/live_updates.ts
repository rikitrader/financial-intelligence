/**
 * Live Updates Module
 * Computes diffs and state changes between testimony events
 */

import { TestimonyEvent, TrialState, Score } from '../../core/types';

// ============================================================================
// STATE DIFF COMPUTATION
// ============================================================================

export interface StateDiff {
  timestamp: string;
  changes: {
    field: string;
    from: unknown;
    to: unknown;
    significance: 'high' | 'medium' | 'low';
  }[];
  momentum_delta: number;
  new_contradictions: number;
  new_key_moments: number;
  summary: string;
}

export function computeStateDiff(
  priorState: TrialState,
  currentState: TrialState
): StateDiff {
  const changes: StateDiff['changes'] = [];

  // Momentum change
  if (currentState.momentum_score !== priorState.momentum_score) {
    const delta = currentState.momentum_score - priorState.momentum_score;
    changes.push({
      field: 'momentum_score',
      from: priorState.momentum_score,
      to: currentState.momentum_score,
      significance: Math.abs(delta) >= 10 ? 'high' : Math.abs(delta) >= 5 ? 'medium' : 'low',
    });
  }

  // Phase change
  if (currentState.current_phase !== priorState.current_phase) {
    changes.push({
      field: 'current_phase',
      from: priorState.current_phase,
      to: currentState.current_phase,
      significance: 'high',
    });
  }

  // Witness change
  if (currentState.current_witness !== priorState.current_witness) {
    changes.push({
      field: 'current_witness',
      from: priorState.current_witness,
      to: currentState.current_witness,
      significance: 'high',
    });
  }

  // Trend change
  if (currentState.momentum_trend !== priorState.momentum_trend) {
    changes.push({
      field: 'momentum_trend',
      from: priorState.momentum_trend,
      to: currentState.momentum_trend,
      significance: 'medium',
    });
  }

  // Score changes
  Object.keys(currentState.scores).forEach(scoreKey => {
    const key = scoreKey as keyof typeof currentState.scores;
    const priorScore = priorState.scores[key];
    const currentScore = currentState.scores[key];

    if (priorScore && currentScore && Math.abs(currentScore.value - priorScore.value) >= 5) {
      changes.push({
        field: `scores.${key}`,
        from: priorScore.value,
        to: currentScore.value,
        significance: Math.abs(currentScore.value - priorScore.value) >= 10 ? 'high' : 'medium',
      });
    }
  });

  const newContradictions = currentState.contradictions_found.length - priorState.contradictions_found.length;
  const newKeyMoments = currentState.key_moments.length - priorState.key_moments.length;

  // Generate summary
  const summary = generateDiffSummary(changes, newContradictions, newKeyMoments);

  return {
    timestamp: new Date().toISOString(),
    changes,
    momentum_delta: currentState.momentum_score - priorState.momentum_score,
    new_contradictions: Math.max(0, newContradictions),
    new_key_moments: Math.max(0, newKeyMoments),
    summary,
  };
}

function generateDiffSummary(
  changes: StateDiff['changes'],
  newContradictions: number,
  newKeyMoments: number
): string {
  const parts: string[] = [];

  const highSigChanges = changes.filter(c => c.significance === 'high');
  if (highSigChanges.length > 0) {
    parts.push(`${highSigChanges.length} significant change(s)`);
  }

  if (newContradictions > 0) {
    parts.push(`${newContradictions} new contradiction(s) detected`);
  }

  if (newKeyMoments > 0) {
    const momentumChange = changes.find(c => c.field === 'momentum_score');
    if (momentumChange) {
      const direction = (momentumChange.to as number) > (momentumChange.from as number) ? 'positive' : 'negative';
      parts.push(`${newKeyMoments} ${direction} moment(s)`);
    }
  }

  if (parts.length === 0) {
    return 'No significant changes';
  }

  return parts.join('; ');
}

// ============================================================================
// TRIAL STATE UPDATE
// ============================================================================

export function updateTrialState(
  state: TrialState,
  event: TestimonyEvent
): TrialState {
  const updated = { ...state };

  updated.events_processed++;
  updated.last_updated_at = new Date().toISOString();

  // Update phase
  if (event.phase && event.phase !== state.current_phase) {
    updated.current_phase = event.phase;
  }

  // Update witness
  if (event.speaker_role === 'witness') {
    updated.current_witness = event.speaker_name;
  }

  // Process credibility signal
  if (event.credibility_signal === 'helpful') {
    updated.momentum_score = Math.min(100, state.momentum_score + 2);
    updated.key_moments = [
      ...state.key_moments,
      {
        timestamp: event.timestamp,
        description: `Helpful: ${event.text.substring(0, 50)}...`,
        impact: 'positive',
      },
    ];
  } else if (event.credibility_signal === 'harmful') {
    updated.momentum_score = Math.max(0, state.momentum_score - 3);
    updated.key_moments = [
      ...state.key_moments,
      {
        timestamp: event.timestamp,
        description: `Harmful: ${event.text.substring(0, 50)}...`,
        impact: 'negative',
      },
    ];
  }

  // Update trend
  updated.momentum_trend = calculateTrend(updated.key_moments);

  return updated;
}

function calculateTrend(moments: TrialState['key_moments']): TrialState['momentum_trend'] {
  const recent = moments.slice(-10);
  const positive = recent.filter(m => m.impact === 'positive').length;
  const negative = recent.filter(m => m.impact === 'negative').length;

  if (positive > negative + 2) return 'improving';
  if (negative > positive + 2) return 'declining';
  return 'stable';
}

// ============================================================================
// SCORE UPDATES
// ============================================================================

export function updateScoresFromState(state: TrialState): TrialState['scores'] {
  const contradictionsExploited = state.contradictions_found.filter(c => c.exploited).length;
  const contradictionsTotal = state.contradictions_found.length;
  const positiveCount = state.key_moments.filter(m => m.impact === 'positive').length;
  const negativeCount = state.key_moments.filter(m => m.impact === 'negative').length;

  // Update cross-exam vulnerability
  const crossExamScore = calculateCrossExamVulnerability(
    contradictionsTotal - contradictionsExploited,
    negativeCount,
    state.events_processed
  );

  // Update jury persuasion
  const juryScore = calculateJuryPersuasion(
    positiveCount,
    negativeCount,
    state.momentum_score
  );

  // Update settlement leverage
  const settlementScore = calculateSettlementLeverage(
    state.momentum_score,
    crossExamScore.value,
    juryScore.value
  );

  return {
    cross_exam_vulnerability: crossExamScore,
    jury_persuasion: juryScore,
    settlement_leverage: settlementScore,
  };
}

function calculateCrossExamVulnerability(
  unexploitedContradictions: number,
  negativeSignals: number,
  totalEvents: number
): Score {
  // Higher score = more vulnerable
  let value = 30;  // Baseline

  value += unexploitedContradictions * 10;  // Each unexploited contradiction increases vulnerability
  value += negativeSignals * 2;  // Each negative signal slightly increases

  if (totalEvents > 0) {
    const negativeRate = negativeSignals / totalEvents;
    if (negativeRate > 0.3) {
      value += 15;
    }
  }

  value = Math.min(100, Math.max(0, value));

  return {
    module: 'realtime_trial',
    score_type: 'Cross-Exam Vulnerability',
    value,
    confidence: Math.min(0.9, 0.5 + (totalEvents / 100)),
    drivers: [
      {
        factor: 'Unexploited Contradictions',
        weight: 0.5,
        raw_score: unexploitedContradictions * 20,
        weighted_contribution: unexploitedContradictions * 10,
        evidence_refs: [],
        explanation: `${unexploitedContradictions} contradiction(s) not yet addressed`,
      },
      {
        factor: 'Negative Testimony Signals',
        weight: 0.3,
        raw_score: negativeSignals * 5,
        weighted_contribution: negativeSignals * 1.5,
        evidence_refs: [],
        explanation: `${negativeSignals} harmful testimony moment(s)`,
      },
    ],
    thresholds: { critical: 70, high: 50, medium: 30, low: 15 },
    interpretation: value >= 70 ? 'High vulnerability - address contradictions urgently' :
                    value >= 50 ? 'Moderate vulnerability - monitor and prepare responses' :
                    'Low vulnerability - case holding up well',
    recommendations: unexploitedContradictions > 0
      ? ['Address remaining contradictions during cross/redirect']
      : [],
    calculated_at: new Date().toISOString(),
    evidence_refs: [],
  };
}

function calculateJuryPersuasion(
  positiveCount: number,
  negativeCount: number,
  momentum: number
): Score {
  let value = momentum;

  // Adjust based on positive/negative ratio
  const total = positiveCount + negativeCount;
  if (total > 0) {
    const positiveRatio = positiveCount / total;
    value = (value + positiveRatio * 100) / 2;
  }

  value = Math.min(100, Math.max(0, value));

  return {
    module: 'realtime_trial',
    score_type: 'Jury Persuasion',
    value,
    confidence: 0.6,
    drivers: [
      {
        factor: 'Testimony Momentum',
        weight: 0.6,
        raw_score: momentum,
        weighted_contribution: momentum * 0.6,
        evidence_refs: [],
        explanation: `Current momentum: ${momentum}`,
      },
      {
        factor: 'Signal Balance',
        weight: 0.4,
        raw_score: total > 0 ? (positiveCount / total) * 100 : 50,
        weighted_contribution: total > 0 ? (positiveCount / total) * 40 : 20,
        evidence_refs: [],
        explanation: `${positiveCount} positive vs ${negativeCount} negative signals`,
      },
    ],
    thresholds: { critical: 30, high: 40, medium: 50, low: 60 },
    interpretation: value >= 70 ? 'Strong jury appeal - narrative is compelling' :
                    value >= 50 ? 'Adequate jury appeal - maintain momentum' :
                    'Jury appeal at risk - strengthen narrative',
    recommendations: [],
    calculated_at: new Date().toISOString(),
    evidence_refs: [],
  };
}

function calculateSettlementLeverage(
  momentum: number,
  crossExamVulnerability: number,
  juryPersuasion: number
): Score {
  // Higher momentum and jury persuasion = more leverage
  // Higher cross-exam vulnerability = less leverage
  const value = (momentum * 0.3 + juryPersuasion * 0.4 + (100 - crossExamVulnerability) * 0.3);

  return {
    module: 'realtime_trial',
    score_type: 'Settlement Leverage',
    value: Math.min(100, Math.max(0, value)),
    confidence: 0.55,
    drivers: [
      {
        factor: 'Trial Momentum',
        weight: 0.3,
        raw_score: momentum,
        weighted_contribution: momentum * 0.3,
        evidence_refs: [],
        explanation: `Momentum score: ${momentum}`,
      },
      {
        factor: 'Jury Appeal',
        weight: 0.4,
        raw_score: juryPersuasion,
        weighted_contribution: juryPersuasion * 0.4,
        evidence_refs: [],
        explanation: `Jury persuasion score: ${juryPersuasion.toFixed(1)}`,
      },
      {
        factor: 'Cross-Exam Resilience',
        weight: 0.3,
        raw_score: 100 - crossExamVulnerability,
        weighted_contribution: (100 - crossExamVulnerability) * 0.3,
        evidence_refs: [],
        explanation: `Resilience score: ${(100 - crossExamVulnerability).toFixed(1)}`,
      },
    ],
    thresholds: { critical: 30, high: 40, medium: 50, low: 60 },
    interpretation: value >= 70 ? 'Strong settlement position - leverage favorable terms' :
                    value >= 50 ? 'Moderate leverage - standard negotiation' :
                    'Weak leverage - consider settlement terms carefully',
    recommendations: [],
    calculated_at: new Date().toISOString(),
    evidence_refs: [],
  };
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

export function processEventBatch(
  events: TestimonyEvent[],
  initialState: TrialState
): {
  finalState: TrialState;
  diffs: StateDiff[];
} {
  let currentState = initialState;
  const diffs: StateDiff[] = [];

  events.forEach(event => {
    const priorState = { ...currentState };
    currentState = updateTrialState(currentState, event);
    currentState.scores = updateScoresFromState(currentState);

    const diff = computeStateDiff(priorState, currentState);
    if (diff.changes.length > 0 || diff.new_contradictions > 0) {
      diffs.push(diff);
    }
  });

  return { finalState: currentState, diffs };
}
