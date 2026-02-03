/**
 * Real-Time Trial Response Module
 * Live testimony analysis and strategy adjustment
 */

import {
  ModuleResult,
  ModuleContext,
  TestimonyEvent,
  TrialAction,
  TrialState,
  Finding,
  Score,
} from '../../core/types';
import { generateId } from '../../core/normalize';
import { calculateTrialMomentumScore } from '../../core/scoring';
import { processTestimonyEvent, updateTrialState } from './live_updates';
import { generateStrategyActions } from './strategy_engine';
import { mapObjections } from './objections';
import { detectContradictions, generateImpeachmentActions } from './impeachment';

// ============================================================================
// MODULE ENTRY POINT
// ============================================================================

export async function run(context: ModuleContext): Promise<ModuleResult> {
  const startTime = Date.now();
  const findings: Finding[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.trial_state) {
    // Initialize new trial state
    context.trial_state = initializeTrialState();
  }

  // Process would typically happen event-by-event in live mode
  // For batch processing, we can analyze the full state

  const score = calculateTrialMomentumScore(
    context.trial_state.key_moments.filter(m => m.impact === 'positive').length,
    context.trial_state.key_moments.filter(m => m.impact === 'negative').length,
    context.trial_state.contradictions_found.filter(c => c.exploited).length,
    context.trial_state.contradictions_found.filter(c => !c.exploited).length,
    0,  // judge interventions
    70   // narrative clarity baseline
  );

  return {
    module: 'realtime_trial',
    executed_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    findings,
    score,
    artifacts: [
      {
        name: 'realtime_trial_dashboard.md',
        path: 'realtime_trial_dashboard.md',
        type: 'markdown',
      },
      {
        name: 'realtime_trial_actions.json',
        path: 'realtime_trial_actions.json',
        type: 'json',
      },
    ],
    errors,
    warnings,
    metadata: {
      events_processed: context.trial_state.events_processed,
      momentum_score: context.trial_state.momentum_score,
    },
  };
}

// ============================================================================
// STATE INITIALIZATION
// ============================================================================

export function initializeTrialState(): TrialState {
  return {
    session_id: generateId('TRL'),
    started_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString(),
    events_processed: 0,
    current_phase: 'opening',
    momentum_score: 50,  // Neutral starting position
    momentum_trend: 'stable',
    key_moments: [],
    contradictions_found: [],
    pending_actions: [],
    completed_actions: [],
    scores: {
      cross_exam_vulnerability: createInitialScore('cross_exam_vulnerability'),
      jury_persuasion: createInitialScore('jury_persuasion'),
      settlement_leverage: createInitialScore('settlement_leverage'),
    },
  };
}

function createInitialScore(scoreType: string): Score {
  return {
    module: 'realtime_trial',
    score_type: scoreType,
    value: 50,
    confidence: 0.5,
    drivers: [],
    thresholds: { critical: 80, high: 60, medium: 40, low: 20 },
    interpretation: 'Initial baseline score',
    recommendations: [],
    calculated_at: new Date().toISOString(),
    evidence_refs: [],
  };
}

// ============================================================================
// LIVE EVENT PROCESSING
// ============================================================================

export function processLiveEvent(
  event: TestimonyEvent,
  state: TrialState,
  priorFindings: Finding[]
): {
  updatedState: TrialState;
  newActions: TrialAction[];
  stateChanges: string[];
} {
  const stateChanges: string[] = [];
  const newActions: TrialAction[] = [];

  // Update event count
  state.events_processed++;
  state.last_updated_at = new Date().toISOString();

  // Update phase
  if (event.phase !== state.current_phase) {
    stateChanges.push(`Phase changed: ${state.current_phase} -> ${event.phase}`);
    state.current_phase = event.phase;
  }

  // Update witness
  if (event.speaker_role === 'witness' && event.speaker_name !== state.current_witness) {
    stateChanges.push(`Witness changed: ${state.current_witness || 'none'} -> ${event.speaker_name}`);
    state.current_witness = event.speaker_name;
  }

  // Process credibility signal
  if (event.credibility_signal === 'helpful') {
    state.key_moments.push({
      timestamp: event.timestamp,
      description: `Helpful testimony: "${event.text.substring(0, 50)}..."`,
      impact: 'positive',
    });
    state.momentum_score = Math.min(100, state.momentum_score + 2);
  } else if (event.credibility_signal === 'harmful') {
    state.key_moments.push({
      timestamp: event.timestamp,
      description: `Harmful testimony: "${event.text.substring(0, 50)}..."`,
      impact: 'negative',
    });
    state.momentum_score = Math.max(0, state.momentum_score - 3);
  }

  // Check for contradictions
  const contradictions = detectContradictions(event, priorFindings, state.contradictions_found);
  if (contradictions.length > 0) {
    state.contradictions_found.push(...contradictions.map(c => ({
      statement: event.text.substring(0, 100),
      contradicts: c.contradicts,
      evidence_ref: c.evidence_ref,
      exploited: false,
    })));

    // Generate impeachment actions
    const impeachmentActions = generateImpeachmentActions(contradictions, event);
    newActions.push(...impeachmentActions);
    stateChanges.push(`${contradictions.length} contradiction(s) detected`);
  }

  // Map potential objections
  const objectionSuggestions = mapObjections(event);
  newActions.push(...objectionSuggestions);

  // Generate strategy actions
  const strategyActions = generateStrategyActions(state, event);
  newActions.push(...strategyActions);

  // Update momentum trend
  const recentMoments = state.key_moments.slice(-10);
  const positiveCount = recentMoments.filter(m => m.impact === 'positive').length;
  const negativeCount = recentMoments.filter(m => m.impact === 'negative').length;

  if (positiveCount > negativeCount + 2) {
    state.momentum_trend = 'improving';
  } else if (negativeCount > positiveCount + 2) {
    state.momentum_trend = 'declining';
  } else {
    state.momentum_trend = 'stable';
  }

  // Add new actions to pending
  state.pending_actions.push(...newActions.filter(a => a.priority === 'P0'));

  return {
    updatedState: state,
    newActions,
    stateChanges,
  };
}

// ============================================================================
// DASHBOARD GENERATION
// ============================================================================

export function generateDashboard(state: TrialState): string {
  const lines: string[] = [
    '# Real-Time Trial Dashboard',
    '',
    `**Session ID:** ${state.session_id}`,
    `**Last Updated:** ${state.last_updated_at}`,
    `**Events Processed:** ${state.events_processed}`,
    '',
    '---',
    '',
    '## Trial Momentum',
    '',
    `**Score:** ${state.momentum_score}/100`,
    `**Trend:** ${state.momentum_trend.toUpperCase()}`,
    `**Current Phase:** ${state.current_phase}`,
    state.current_witness ? `**Current Witness:** ${state.current_witness}` : '',
    '',
    generateMomentumBar(state.momentum_score),
    '',
    '---',
    '',
    '## Recent Key Moments',
    '',
  ];

  // Last 5 key moments
  state.key_moments.slice(-5).reverse().forEach(moment => {
    const icon = moment.impact === 'positive' ? '✓' : moment.impact === 'negative' ? '✗' : '•';
    lines.push(`${icon} **${moment.timestamp.split('T')[1]?.substring(0, 8) || ''}** - ${moment.description}`);
  });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Pending Actions');
  lines.push('');

  // Priority actions
  const p0Actions = state.pending_actions.filter(a => a.priority === 'P0');
  const p1Actions = state.pending_actions.filter(a => a.priority === 'P1');

  if (p0Actions.length > 0) {
    lines.push('### Immediate (P0)');
    p0Actions.forEach(action => {
      lines.push(`- **${action.type.toUpperCase()}**: ${action.suggested_language}`);
      lines.push(`  - Target: ${action.target}`);
      lines.push(`  - Rationale: ${action.rationale}`);
    });
    lines.push('');
  }

  if (p1Actions.length > 0) {
    lines.push('### High Priority (P1)');
    p1Actions.slice(0, 3).forEach(action => {
      lines.push(`- **${action.type}**: ${action.suggested_language}`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Contradictions Found');
  lines.push('');

  const unexploited = state.contradictions_found.filter(c => !c.exploited);
  if (unexploited.length > 0) {
    unexploited.forEach(c => {
      lines.push(`- "${c.statement.substring(0, 50)}..." contradicts ${c.evidence_ref}`);
    });
  } else {
    lines.push('No unexploited contradictions.');
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Score Summary');
  lines.push('');
  lines.push('| Metric | Score | Confidence |');
  lines.push('|--------|-------|------------|');
  lines.push(`| Cross-Exam Vulnerability | ${state.scores.cross_exam_vulnerability.value.toFixed(1)} | ${(state.scores.cross_exam_vulnerability.confidence * 100).toFixed(0)}% |`);
  lines.push(`| Jury Persuasion | ${state.scores.jury_persuasion.value.toFixed(1)} | ${(state.scores.jury_persuasion.confidence * 100).toFixed(0)}% |`);
  lines.push(`| Settlement Leverage | ${state.scores.settlement_leverage.value.toFixed(1)} | ${(state.scores.settlement_leverage.confidence * 100).toFixed(0)}% |`);

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*This dashboard provides strategy suggestions, not legal advice.*');

  return lines.join('\n');
}

function generateMomentumBar(score: number): string {
  const filled = Math.round(score / 5);
  const empty = 20 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${score}%`;
}

// ============================================================================
// ACTIONS OUTPUT
// ============================================================================

export function generateActionsOutput(
  state: TrialState,
  newActions: TrialAction[]
): object {
  return {
    generated_at: new Date().toISOString(),
    trial_momentum_score: state.momentum_score,
    actions: newActions.map(a => ({
      priority: a.priority,
      type: a.type,
      target: a.target,
      suggested_language: a.suggested_language,
      rationale: a.rationale,
      evidence_refs: a.evidence_refs,
      risk_tradeoff: a.risk_tradeoff,
      confidence: a.confidence,
    })),
    updated_scores: {
      cross_exam_vulnerability: {
        score: state.scores.cross_exam_vulnerability.value,
        confidence: state.scores.cross_exam_vulnerability.confidence,
        drivers: state.scores.cross_exam_vulnerability.drivers,
      },
      jury_persuasion: {
        score: state.scores.jury_persuasion.value,
        confidence: state.scores.jury_persuasion.confidence,
        drivers: state.scores.jury_persuasion.drivers,
      },
      settlement_leverage: {
        score: state.scores.settlement_leverage.value,
        confidence: state.scores.settlement_leverage.confidence,
        drivers: state.scores.settlement_leverage.drivers,
      },
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './live_updates';
export * from './strategy_engine';
export * from './objections';
export * from './impeachment';
