/**
 * Objection Mapping Module
 * Maps transcript patterns to potential objection types
 */

import { TestimonyEvent, TrialAction } from '../../core/types';

// ============================================================================
// OBJECTION TYPES
// ============================================================================

export interface ObjectionPattern {
  type: string;
  patterns: RegExp[];
  basis: string;
  suggested_language: string;
  applicability: 'direct' | 'cross' | 'both';
  risk_level: 'low' | 'medium' | 'high';
}

const OBJECTION_PATTERNS: ObjectionPattern[] = [
  {
    type: 'hearsay',
    patterns: [
      /(?:he|she|they)\s+(?:said|told|mentioned|stated)/i,
      /I\s+(?:heard|was told)\s+that/i,
      /(?:someone|another person)\s+(?:said|told)/i,
      /according\s+to\s+(?:him|her|them|someone)/i,
    ],
    basis: 'Hearsay - FRE 802',
    suggested_language: 'Objection, hearsay. The witness is testifying to an out-of-court statement offered for the truth of the matter asserted.',
    applicability: 'both',
    risk_level: 'low',
  },
  {
    type: 'speculation',
    patterns: [
      /I\s+(?:think|believe|assume|guess|suppose)/i,
      /(?:probably|maybe|perhaps|possibly)/i,
      /I\s+would\s+(?:imagine|assume|guess)/i,
      /it\s+seems?\s+(?:like|to\s+me)/i,
    ],
    basis: 'Speculation/Lack of foundation - FRE 602',
    suggested_language: 'Objection, speculation. The witness is speculating rather than testifying to personal knowledge.',
    applicability: 'both',
    risk_level: 'low',
  },
  {
    type: 'leading',
    patterns: [
      /isn't\s+it\s+true\s+that/i,
      /wouldn't\s+you\s+agree/i,
      /you\s+(?:did|would|should),?\s+(?:didn't|wouldn't|shouldn't)\s+you/i,
      /that's\s+correct,?\s+isn't\s+it/i,
    ],
    basis: 'Leading question - FRE 611(c)',
    suggested_language: 'Objection, leading. Counsel is testifying for the witness.',
    applicability: 'direct',
    risk_level: 'medium',
  },
  {
    type: 'relevance',
    patterns: [
      // These are context-dependent, use topic_tags to determine
    ],
    basis: 'Relevance - FRE 401/402',
    suggested_language: 'Objection, relevance. This testimony has no bearing on any issue in this case.',
    applicability: 'both',
    risk_level: 'medium',
  },
  {
    type: 'compound',
    patterns: [
      /\?\s*(?:and|or)\s+(?:did|was|were|is|are|have|has)/i,
      /(?:did|was|were|is|are|have|has)[^?]*(?:and|or)[^?]*(?:did|was|were|is|are|have|has)[^?]*\?/i,
    ],
    basis: 'Compound question',
    suggested_language: 'Objection, compound question. The question contains multiple questions that should be asked separately.',
    applicability: 'both',
    risk_level: 'low',
  },
  {
    type: 'argumentative',
    patterns: [
      /isn't\s+it\s+(?:really|actually|true)\s+that\s+you're/i,
      /you're\s+(?:just|simply|only)\s+(?:lying|making)/i,
      /so\s+(?:basically|essentially)\s+you(?:'re|'ve)/i,
    ],
    basis: 'Argumentative',
    suggested_language: 'Objection, argumentative. Counsel is arguing rather than asking a question.',
    applicability: 'cross',
    risk_level: 'medium',
  },
  {
    type: 'asked_and_answered',
    patterns: [
      // Would need to track prior questions
    ],
    basis: 'Asked and answered - FRE 611(a)',
    suggested_language: 'Objection, asked and answered. This question has already been posed and answered.',
    applicability: 'both',
    risk_level: 'medium',
  },
  {
    type: 'assumes_facts',
    patterns: [
      /after\s+you\s+(?:stole|lied|cheated|defrauded)/i,
      /when\s+you\s+(?:committed|perpetrated)/i,
      /the\s+(?:fraud|theft|crime)\s+you\s+committed/i,
    ],
    basis: 'Assumes facts not in evidence',
    suggested_language: 'Objection, assumes facts not in evidence. The question assumes a fact that has not been established.',
    applicability: 'cross',
    risk_level: 'low',
  },
  {
    type: 'beyond_scope',
    patterns: [
      // Context-dependent, needs tracking of direct examination topics
    ],
    basis: 'Beyond scope of direct - FRE 611(b)',
    suggested_language: 'Objection, beyond the scope of direct examination.',
    applicability: 'cross',
    risk_level: 'medium',
  },
  {
    type: 'narrative',
    patterns: [
      /tell\s+(?:us|the\s+jury|me)\s+(?:everything|all\s+about|the\s+whole)/i,
      /describe\s+(?:everything|all\s+that|what\s+happened)/i,
    ],
    basis: 'Calls for narrative response',
    suggested_language: 'Objection, calls for a narrative response.',
    applicability: 'direct',
    risk_level: 'low',
  },
  {
    type: 'opinion',
    patterns: [
      /what\s+do\s+you\s+think\s+(?:caused|happened|motivated)/i,
      /in\s+your\s+opinion/i,
      /would\s+you\s+say\s+that/i,
    ],
    basis: 'Opinion - FRE 701/702',
    suggested_language: 'Objection. The witness is being asked for an opinion beyond their expertise or the scope of lay opinion.',
    applicability: 'both',
    risk_level: 'medium',
  },
];

// ============================================================================
// OBJECTION MAPPING
// ============================================================================

export function mapObjections(event: TestimonyEvent): TrialAction[] {
  const actions: TrialAction[] = [];

  // Only suggest objections when attorney is speaking (asking questions)
  if (event.speaker_role !== 'attorney') {
    return actions;
  }

  OBJECTION_PATTERNS.forEach(objPattern => {
    // Check phase applicability
    if (objPattern.applicability === 'direct' && event.phase !== 'direct') return;
    if (objPattern.applicability === 'cross' && event.phase !== 'cross') return;

    // Check patterns
    const matched = objPattern.patterns.some(pattern => pattern.test(event.text));

    if (matched) {
      actions.push({
        priority: objPattern.risk_level === 'low' ? 'P1' : 'P2',
        type: 'objection',
        target: objPattern.type,
        suggested_language: objPattern.suggested_language,
        rationale: `Potential ${objPattern.type} objection. Basis: ${objPattern.basis}`,
        evidence_refs: [],
        risk_tradeoff: getObjectionRiskAssessment(objPattern),
        confidence: 0.6,
      });
    }
  });

  // Special handling for hearsay exceptions
  const hearsayAction = actions.find(a => a.target === 'hearsay');
  if (hearsayAction) {
    hearsayAction.risk_tradeoff += ' Note: Multiple hearsay exceptions may apply (business records, excited utterance, present sense impression, etc.)';
  }

  return actions;
}

function getObjectionRiskAssessment(pattern: ObjectionPattern): string {
  switch (pattern.risk_level) {
    case 'low':
      return 'Low risk - standard objection likely to be sustained if pattern applies';
    case 'medium':
      return 'Medium risk - may require foundation or argument; judge discretion applies';
    case 'high':
      return 'High risk - may appear obstructive; use strategically';
    default:
      return 'Assess based on judge and context';
  }
}

// ============================================================================
// OBJECTION TRACKING
// ============================================================================

export interface ObjectionRecord {
  timestamp: string;
  type: string;
  basis: string;
  ruling: 'sustained' | 'overruled' | 'pending';
  notes?: string;
}

export class ObjectionTracker {
  private objections: ObjectionRecord[] = [];
  private judgePatterns: Map<string, { sustained: number; overruled: number }> = new Map();

  record(objection: ObjectionRecord): void {
    this.objections.push(objection);

    // Track judge ruling patterns by objection type
    const pattern = this.judgePatterns.get(objection.type) || { sustained: 0, overruled: 0 };
    if (objection.ruling === 'sustained') {
      pattern.sustained++;
    } else if (objection.ruling === 'overruled') {
      pattern.overruled++;
    }
    this.judgePatterns.set(objection.type, pattern);
  }

  getSuccessRate(type: string): number {
    const pattern = this.judgePatterns.get(type);
    if (!pattern) return 0.5;  // No data, assume neutral

    const total = pattern.sustained + pattern.overruled;
    if (total === 0) return 0.5;

    return pattern.sustained / total;
  }

  getRecommendation(type: string): string {
    const rate = this.getSuccessRate(type);

    if (rate >= 0.7) {
      return `${type} objections have been successful (${(rate * 100).toFixed(0)}%). Consider making this objection.`;
    } else if (rate >= 0.4) {
      return `${type} objections have mixed results (${(rate * 100).toFixed(0)}%). Use strategically.`;
    } else {
      return `${type} objections have been unsuccessful (${(rate * 100).toFixed(0)}%). Consider alternative approach.`;
    }
  }

  getAllRecords(): ObjectionRecord[] {
    return [...this.objections];
  }
}

// ============================================================================
// SPEAKING OBJECTION DETECTION
// ============================================================================

export function detectSpeakingObjection(event: TestimonyEvent): boolean {
  // Detect if opposing counsel is making speaking objection (improper)
  if (event.speaker_role !== 'attorney') return false;

  const text = event.text.toLowerCase();

  // Speaking objections often include argument beyond the basis
  const hasObjection = text.includes('objection');
  const wordCount = text.split(/\s+/).length;

  // Simple heuristic: speaking objections tend to be verbose
  return hasObjection && wordCount > 20;
}

// ============================================================================
// SIDEBAR REQUEST EVALUATION
// ============================================================================

export function evaluateSidebarNeed(
  context: {
    objectionsPending: number;
    evidenceIssue: boolean;
    juryPrejudice: boolean;
    witnessIssue: boolean;
  }
): TrialAction | null {
  if (context.objectionsPending >= 3 || context.evidenceIssue || context.juryPrejudice) {
    return {
      priority: 'P1',
      type: 'sidebar_request',
      target: 'court',
      suggested_language: 'Your Honor, may we approach the bench?',
      rationale: context.juryPrejudice
        ? 'Need to address potential jury prejudice outside their presence'
        : context.evidenceIssue
        ? 'Complex evidentiary issue requires discussion'
        : 'Multiple pending objections require resolution',
      evidence_refs: [],
      risk_tradeoff: 'Sidebars interrupt flow but may be necessary for complex issues',
      confidence: 0.7,
    };
  }

  return null;
}
