/**
 * Real-Time Trial Module - Scoring
 */

import { Score, Finding, TrialState, TestimonyEvent } from '../../core/types';
import { calculateTrialMomentumScore } from '../../core/scoring';

export function calculateTrialScore(state: TrialState): Score {
  const momentum = calculateTrialMomentumScore(state);

  return {
    module: 'realtime_trial',
    score_type: 'Trial Momentum',
    value: momentum,
    confidence: calculateConfidence(state),
    drivers: extractDrivers(state),
    thresholds: {
      critical: 80,
      high: 60,
      medium: 40,
      low: 20,
    },
    interpretation: interpretMomentum(momentum),
    recommendations: generateRecommendations(state, momentum),
    calculated_at: new Date().toISOString(),
    evidence_refs: [],
  };
}

function calculateConfidence(state: TrialState): number {
  // Confidence increases with more events processed
  const eventFactor = Math.min(state.events_processed / 50, 1);

  // Confidence is higher when trend is stable
  const trendFactor = state.momentum_trend === 'stable' ? 1.0 :
                      state.momentum_trend === 'improving' ? 0.9 : 0.85;

  return Math.round((eventFactor * 0.6 + trendFactor * 0.4) * 100) / 100;
}

function extractDrivers(state: TrialState): Array<{factor: string; weight: number; score: number}> {
  const drivers: Array<{factor: string; weight: number; score: number}> = [];

  // Contradiction exploitation
  const exploitedContradictions = state.contradictions.filter(c => c.exploited).length;
  const totalContradictions = state.contradictions.length;

  if (totalContradictions > 0) {
    drivers.push({
      factor: 'Contradiction Exploitation',
      weight: 0.30,
      score: (exploitedContradictions / totalContradictions) * 100,
    });
  }

  // Witness credibility damage
  if (state.witness_credibility) {
    const avgCredibility = Object.values(state.witness_credibility)
      .reduce((a, b) => a + b, 0) / Object.keys(state.witness_credibility).length;

    drivers.push({
      factor: 'Witness Credibility Status',
      weight: 0.25,
      score: 100 - avgCredibility, // Lower credibility = higher score for us
    });
  }

  // Helpful vs harmful testimony ratio
  const helpful = state.key_admissions.length;
  const harmful = state.objections_log.filter(o => o.result === 'overruled').length;
  const ratio = helpful / Math.max(helpful + harmful, 1);

  drivers.push({
    factor: 'Testimony Balance',
    weight: 0.25,
    score: ratio * 100,
  });

  // Pending actions quality
  const p0Actions = state.pending_actions.filter(a => a.priority === 'P0').length;

  drivers.push({
    factor: 'Available Opportunities',
    weight: 0.20,
    score: Math.min(p0Actions * 20, 100),
  });

  return drivers;
}

function interpretMomentum(momentum: number): string {
  if (momentum >= 80) return 'Strong advantage - press forward aggressively';
  if (momentum >= 60) return 'Favorable position - maintain momentum';
  if (momentum >= 40) return 'Neutral position - look for opportunities';
  if (momentum >= 20) return 'Unfavorable position - implement recovery strategy';
  return 'Critical position - focus on damage control';
}

function generateRecommendations(state: TrialState, momentum: number): string[] {
  const recommendations: string[] = [];

  if (momentum >= 70) {
    recommendations.push('Consider pushing for settlement discussion');
    recommendations.push('Lock in key admissions before redirect');
  } else if (momentum >= 50) {
    recommendations.push('Focus on unexploited contradictions');
    recommendations.push('Maintain steady pressure');
  } else if (momentum >= 30) {
    recommendations.push('Prioritize credibility rehabilitation');
    recommendations.push('Consider strategic objections');
  } else {
    recommendations.push('Request sidebar for strategy discussion');
    recommendations.push('Evaluate witness order changes');
    recommendations.push('Consider settlement to limit exposure');
  }

  // Specific recommendations based on state
  const unexploitedContradictions = state.contradictions.filter(c => !c.exploited);
  if (unexploitedContradictions.length > 0) {
    recommendations.push(`Exploit ${unexploitedContradictions.length} remaining contradiction(s)`);
  }

  return recommendations;
}

export function scoreCredibilityImpact(
  startingCredibility: number,
  currentCredibility: number
): number {
  const damage = startingCredibility - currentCredibility;

  // Score based on how much credibility we've damaged
  if (damage >= 50) return 95;
  if (damage >= 40) return 85;
  if (damage >= 30) return 70;
  if (damage >= 20) return 55;
  if (damage >= 10) return 40;
  if (damage > 0) return 25;
  return 10; // No damage or witness gained credibility
}

export function scoreImpeachmentSuccess(
  attempted: number,
  successful: number
): number {
  if (attempted === 0) return 50; // Neutral if no attempts

  const successRate = successful / attempted;

  if (successRate >= 0.9) return 95;
  if (successRate >= 0.75) return 80;
  if (successRate >= 0.5) return 60;
  if (successRate >= 0.25) return 35;
  return 15;
}

export function scoreObjectionBattle(
  ourSuccesses: number,
  ourFailures: number,
  theirSuccesses: number,
  theirFailures: number
): number {
  const ourRate = ourSuccesses / Math.max(ourSuccesses + ourFailures, 1);
  const theirRate = theirSuccesses / Math.max(theirSuccesses + theirFailures, 1);

  // Combine our success rate with inverse of their success rate
  const combined = (ourRate * 0.5) + ((1 - theirRate) * 0.5);

  return Math.round(combined * 100);
}
