/**
 * Strategy Engine
 * Generates real-time strategic actions based on trial state
 */

import { TestimonyEvent, TrialAction, TrialState } from '../../core/types';

// ============================================================================
// STRATEGY GENERATION
// ============================================================================

export interface StrategyConfig {
  posture: 'aggressive' | 'balanced' | 'defensive';
  riskTolerance: 'low' | 'medium' | 'high';
  priorities: ('impeachment' | 'narrative' | 'evidence' | 'credibility')[];
}

const DEFAULT_STRATEGY: StrategyConfig = {
  posture: 'balanced',
  riskTolerance: 'medium',
  priorities: ['credibility', 'narrative', 'evidence', 'impeachment'],
};

export function generateStrategyActions(
  state: TrialState,
  event: TestimonyEvent,
  config: StrategyConfig = DEFAULT_STRATEGY
): TrialAction[] {
  const actions: TrialAction[] = [];

  // Analyze current situation
  const momentum = state.momentum_score;
  const trend = state.momentum_trend;
  const unexploitedContradictions = state.contradictions_found.filter(c => !c.exploited);

  // Momentum-based strategy
  if (momentum < 40 && trend === 'declining') {
    actions.push(...generateRecoveryActions(state, event, config));
  } else if (momentum > 70 && trend === 'improving') {
    actions.push(...generatePressureActions(state, event, config));
  } else {
    actions.push(...generateMaintenanceActions(state, event, config));
  }

  // Phase-specific strategies
  if (event.phase === 'cross') {
    actions.push(...generateCrossExamStrategies(state, event, config));
  } else if (event.phase === 'redirect') {
    actions.push(...generateRedirectStrategies(state, event, config));
  }

  // Prioritize based on config
  return prioritizeActions(actions, config);
}

// ============================================================================
// RECOVERY STRATEGIES
// ============================================================================

function generateRecoveryActions(
  state: TrialState,
  event: TestimonyEvent,
  config: StrategyConfig
): TrialAction[] {
  const actions: TrialAction[] = [];

  // When losing momentum, focus on regaining control
  if (event.speaker_role === 'witness' && event.credibility_signal === 'harmful') {
    actions.push({
      priority: 'P0',
      type: 'reframe',
      target: 'narrative',
      suggested_language: 'Consider reframing: redirect focus to established facts and documented evidence',
      rationale: 'Harmful testimony detected during declining momentum; need to regain narrative control',
      evidence_refs: [],
      risk_tradeoff: 'Reframing may appear defensive; balance with confident delivery',
      confidence: 0.7,
    });
  }

  // If we have unexploited contradictions, now is the time
  const unexploited = state.contradictions_found.filter(c => !c.exploited);
  if (unexploited.length > 0 && config.posture !== 'defensive') {
    actions.push({
      priority: 'P1',
      type: 'impeachment',
      target: unexploited[0].evidence_ref,
      suggested_language: `Address contradiction: ${unexploited[0].contradicts}`,
      rationale: 'Unexploited contradiction available during recovery phase',
      evidence_refs: [unexploited[0].evidence_ref],
      risk_tradeoff: 'Impeachment during recovery may appear desperate; ensure strong foundation',
      confidence: 0.65,
    });
  }

  // Consider exhibit introduction
  if (event.exhibit_refs.length > 0) {
    actions.push({
      priority: 'P2',
      type: 'exhibit',
      target: event.exhibit_refs[0],
      suggested_language: `Direct attention to documentary evidence: ${event.exhibit_refs[0]}`,
      rationale: 'Documentary evidence can anchor testimony and rebuild credibility',
      evidence_refs: event.exhibit_refs,
      risk_tradeoff: 'Ensure exhibit is favorable before highlighting',
      confidence: 0.6,
    });
  }

  return actions;
}

// ============================================================================
// PRESSURE STRATEGIES
// ============================================================================

function generatePressureActions(
  state: TrialState,
  event: TestimonyEvent,
  config: StrategyConfig
): TrialAction[] {
  const actions: TrialAction[] = [];

  // When momentum is strong, consider pressing advantage
  if (config.posture === 'aggressive') {
    // Look for concession opportunities
    if (event.speaker_role === 'witness') {
      actions.push({
        priority: 'P1',
        type: 'reframe',
        target: 'closing_theme',
        suggested_language: 'Consider locking in favorable testimony for closing argument',
        rationale: 'Strong momentum presents opportunity to solidify key points',
        evidence_refs: [],
        risk_tradeoff: 'Over-reaching may allow recovery; know when to consolidate',
        confidence: 0.7,
      });
    }

    // Exploit remaining contradictions
    const unexploited = state.contradictions_found.filter(c => !c.exploited);
    if (unexploited.length > 0) {
      actions.push({
        priority: 'P0',
        type: 'impeachment',
        target: unexploited[0].evidence_ref,
        suggested_language: 'Press advantage with remaining contradiction',
        rationale: 'Strong position increases impeachment impact',
        evidence_refs: [unexploited[0].evidence_ref],
        risk_tradeoff: 'Aggressive impeachment may generate sympathy; calibrate intensity',
        confidence: 0.75,
      });
    }
  }

  return actions;
}

// ============================================================================
// MAINTENANCE STRATEGIES
// ============================================================================

function generateMaintenanceActions(
  state: TrialState,
  event: TestimonyEvent,
  config: StrategyConfig
): TrialAction[] {
  const actions: TrialAction[] = [];

  // Standard monitoring and opportunity detection
  if (event.topic_tags.length > 0) {
    // Check if topic aligns with key themes
    const keyTopics = ['revenue', 'fraud', 'control', 'disclosure'];
    const relevantTopics = event.topic_tags.filter(t => keyTopics.includes(t.toLowerCase()));

    if (relevantTopics.length > 0) {
      actions.push({
        priority: 'P2',
        type: 'reframe',
        target: relevantTopics[0],
        suggested_language: `Testimony touching on key theme: ${relevantTopics.join(', ')}. Consider emphasis.`,
        rationale: 'Relevant topic detected; opportunity for theme reinforcement',
        evidence_refs: [],
        risk_tradeoff: 'Minimal risk; standard practice',
        confidence: 0.5,
      });
    }
  }

  return actions;
}

// ============================================================================
// CROSS-EXAMINATION STRATEGIES
// ============================================================================

function generateCrossExamStrategies(
  state: TrialState,
  event: TestimonyEvent,
  config: StrategyConfig
): TrialAction[] {
  const actions: TrialAction[] = [];

  // During cross, focus on control and impeachment
  if (event.speaker_role === 'witness') {
    // Check for non-responsive answers
    if (event.text.length > 200) {  // Long answers may be evasive
      actions.push({
        priority: 'P1',
        type: 'objection',
        target: 'non-responsive',
        suggested_language: 'Your Honor, the witness is being non-responsive. I would ask that the answer be stricken and the witness instructed to answer the question.',
        rationale: 'Long, potentially evasive answer detected',
        evidence_refs: [],
        risk_tradeoff: 'Judge may allow explanation; be prepared for follow-up',
        confidence: 0.6,
      });
    }

    // Look for admission opportunities
    if (event.credibility_signal === 'helpful') {
      actions.push({
        priority: 'P0',
        type: 'reframe',
        target: 'admission',
        suggested_language: 'Lock in this admission: repeat or emphasize before moving on',
        rationale: 'Favorable admission detected; secure before witness reconsiders',
        evidence_refs: [],
        risk_tradeoff: 'Over-emphasis may alert witness; be subtle',
        confidence: 0.8,
      });
    }
  }

  return actions;
}

// ============================================================================
// REDIRECT STRATEGIES
// ============================================================================

function generateRedirectStrategies(
  state: TrialState,
  event: TestimonyEvent,
  config: StrategyConfig
): TrialAction[] {
  const actions: TrialAction[] = [];

  // During redirect, focus on rehabilitation and clarification
  const recentNegative = state.key_moments
    .slice(-5)
    .filter(m => m.impact === 'negative');

  if (recentNegative.length > 0) {
    actions.push({
      priority: 'P1',
      type: 'reframe',
      target: 'rehabilitation',
      suggested_language: 'Address recent negative impression through clarifying questions',
      rationale: `${recentNegative.length} recent negative moment(s) need rehabilitation`,
      evidence_refs: [],
      risk_tradeoff: 'Rehabilitation may re-emphasize negative points; be strategic',
      confidence: 0.65,
    });
  }

  return actions;
}

// ============================================================================
// ACTION PRIORITIZATION
// ============================================================================

function prioritizeActions(
  actions: TrialAction[],
  config: StrategyConfig
): TrialAction[] {
  // Sort by priority first
  const sorted = [...actions].sort((a, b) => {
    const priorityOrder = { P0: 0, P1: 1, P2: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Apply config priorities
  const typeOrder = config.priorities.reduce((acc, type, idx) => {
    acc[type] = idx;
    return acc;
  }, {} as Record<string, number>);

  // Within same priority, sort by configured type preference
  return sorted.sort((a, b) => {
    if (a.priority !== b.priority) return 0;

    const aOrder = typeOrder[a.type] ?? 10;
    const bOrder = typeOrder[b.type] ?? 10;
    return aOrder - bOrder;
  });
}

// ============================================================================
// CONCESSION STRATEGY
// ============================================================================

export function evaluateConcession(
  state: TrialState,
  point: string
): TrialAction | null {
  // Sometimes strategic concession strengthens overall position
  if (state.momentum_score < 30) {
    // When very weak, concession may be necessary
    return {
      priority: 'P2',
      type: 'concession',
      target: point,
      suggested_language: `Consider conceding: "${point}" to preserve credibility on stronger points`,
      rationale: 'Weak position on this point; concession may strengthen overall credibility',
      evidence_refs: [],
      risk_tradeoff: 'Concession admits weakness; ensure it does not undermine key elements',
      confidence: 0.5,
    };
  }

  return null;
}

// ============================================================================
// END-OF-DAY STRATEGY
// ============================================================================

export function generateEndOfDayStrategy(state: TrialState): string[] {
  const recommendations: string[] = [];

  if (state.momentum_score < 50) {
    recommendations.push('Review testimony transcript for rehabilitation opportunities');
    recommendations.push('Prepare exhibits that counter negative impressions');
  }

  const unexploited = state.contradictions_found.filter(c => !c.exploited);
  if (unexploited.length > 0) {
    recommendations.push(`Prepare ${unexploited.length} impeachment point(s) for tomorrow`);
  }

  if (state.momentum_trend === 'declining') {
    recommendations.push('Consider witness order adjustments if possible');
    recommendations.push('Review opening theme alignment with evidence presented');
  }

  recommendations.push('Update settlement position based on trial developments');

  return recommendations;
}
