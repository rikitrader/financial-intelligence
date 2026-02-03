/**
 * Explanation Generation Module
 * Produces human-readable explanations for findings and scores
 */

import {
  Finding,
  Score,
  CompositeScore,
  CounterHypothesis,
  EvidenceRef,
} from './types';
import { EvidenceStore, formatCitation } from './evidence_refs';

// ============================================================================
// FINDING EXPLANATION
// ============================================================================

export interface FindingExplanation {
  summary: string;
  detailed: string;
  evidence_summary: string;
  counter_hypotheses_summary: string;
  confidence_explanation: string;
  suggested_actions: string[];
}

export function explainFinding(
  finding: Finding,
  evidenceStore: EvidenceStore
): FindingExplanation {
  // Summary
  const summary = `${finding.severity.toUpperCase()}: ${finding.title}`;

  // Detailed explanation
  const detailed = [
    finding.description,
    '',
    `**Rationale:** ${finding.rationale}`,
    finding.methodology ? `**Methodology:** ${finding.methodology}` : '',
  ].filter(Boolean).join('\n');

  // Evidence summary
  const evidenceRefs = finding.evidence_refs
    .map(id => evidenceStore.get(id))
    .filter(Boolean) as EvidenceRef[];

  const evidenceSummary = evidenceRefs.length > 0
    ? `Based on ${evidenceRefs.length} piece(s) of evidence:\n${evidenceRefs.map(ref =>
        `  - ${formatCitation(ref, 'full')}`
      ).join('\n')}`
    : 'No direct evidence references available.';

  // Counter hypotheses
  const counterHypothesesSummary = finding.counter_hypotheses.length > 0
    ? formatCounterHypotheses(finding.counter_hypotheses)
    : 'No alternative explanations documented.';

  // Confidence explanation
  const confidenceExplanation = explainConfidence(finding.confidence, evidenceRefs.length);

  // Suggested actions
  const suggestedActions = generateSuggestedActions(finding);

  return {
    summary,
    detailed,
    evidence_summary: evidenceSummary,
    counter_hypotheses_summary: counterHypothesesSummary,
    confidence_explanation: confidenceExplanation,
    suggested_actions: suggestedActions,
  };
}

function formatCounterHypotheses(hypotheses: CounterHypothesis[]): string {
  return hypotheses.map(h => {
    const lines = [
      `**Alternative: ${h.hypothesis}** (Likelihood: ${h.likelihood})`,
    ];

    if (h.evidence_for.length > 0) {
      lines.push(`  - Supporting: ${h.evidence_for.join(', ')}`);
    }
    if (h.evidence_against.length > 0) {
      lines.push(`  - Against: ${h.evidence_against.join(', ')}`);
    }
    if (h.testing_required) {
      lines.push(`  - To resolve: ${h.testing_required}`);
    }

    return lines.join('\n');
  }).join('\n\n');
}

function explainConfidence(confidence: number, evidenceCount: number): string {
  let level: string;
  if (confidence >= 0.9) level = 'Very High';
  else if (confidence >= 0.75) level = 'High';
  else if (confidence >= 0.5) level = 'Moderate';
  else if (confidence >= 0.25) level = 'Low';
  else level = 'Very Low';

  const factors: string[] = [];

  if (evidenceCount >= 5) {
    factors.push('strong evidence base');
  } else if (evidenceCount >= 3) {
    factors.push('adequate evidence');
  } else if (evidenceCount >= 1) {
    factors.push('limited evidence');
  } else {
    factors.push('no direct evidence');
  }

  return `Confidence: ${(confidence * 100).toFixed(0)}% (${level}) - ${factors.join(', ')}`;
}

function generateSuggestedActions(finding: Finding): string[] {
  const actions: string[] = [];

  // Based on severity
  if (finding.severity === 'critical' || finding.severity === 'high') {
    actions.push('Prioritize for immediate review');
    actions.push('Consider escalation to management/legal');
  }

  // Based on confidence
  if (finding.confidence < 0.5) {
    actions.push('Gather additional corroborating evidence');
  }

  // Add any pre-defined strengthening steps
  if (finding.suggested_strengthening) {
    actions.push(...finding.suggested_strengthening);
  }

  // Based on counter hypotheses
  if (finding.counter_hypotheses.some(h => h.likelihood === 'high')) {
    actions.push('Investigate high-likelihood alternative explanations');
  }

  return actions;
}

// ============================================================================
// SCORE EXPLANATION
// ============================================================================

export interface ScoreExplanation {
  headline: string;
  summary: string;
  drivers_narrative: string;
  confidence_explanation: string;
  recommendations_narrative: string;
  trend_analysis?: string;
}

export function explainScore(score: Score, priorScore?: Score): ScoreExplanation {
  // Headline
  const headline = `${score.module}: ${score.score_type} Score = ${score.value.toFixed(1)}/100`;

  // Summary based on thresholds
  let riskLevel: string;
  if (score.value >= score.thresholds.critical) {
    riskLevel = 'CRITICAL';
  } else if (score.value >= score.thresholds.high) {
    riskLevel = 'HIGH';
  } else if (score.value >= score.thresholds.medium) {
    riskLevel = 'MODERATE';
  } else if (score.value >= score.thresholds.low) {
    riskLevel = 'LOW';
  } else {
    riskLevel = 'MINIMAL';
  }

  const summary = `Risk Level: ${riskLevel}. ${score.interpretation}`;

  // Drivers narrative
  const sortedDrivers = [...score.drivers].sort((a, b) => b.weighted_contribution - a.weighted_contribution);
  const driversNarrative = sortedDrivers.length > 0
    ? `Key factors:\n${sortedDrivers.slice(0, 5).map(d =>
        `  - ${d.factor}: ${d.raw_score.toFixed(1)} (${(d.weight * 100).toFixed(0)}% weight) - ${d.explanation}`
      ).join('\n')}`
    : 'No scoring factors available.';

  // Confidence
  const confidenceExplanation = `Confidence: ${(score.confidence * 100).toFixed(0)}% - ${
    score.confidence >= 0.75 ? 'High confidence based on evidence coverage' :
    score.confidence >= 0.5 ? 'Moderate confidence, some gaps in evidence' :
    'Lower confidence, additional evidence recommended'
  }`;

  // Recommendations
  const recommendationsNarrative = score.recommendations.length > 0
    ? `Recommendations:\n${score.recommendations.map(r => `  - ${r}`).join('\n')}`
    : 'No specific recommendations at this time.';

  // Trend analysis if prior score available
  let trendAnalysis: string | undefined;
  if (priorScore) {
    const delta = score.value - priorScore.value;
    const direction = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'unchanged';
    trendAnalysis = `Trend: Score has ${direction} by ${Math.abs(delta).toFixed(1)} points since ${priorScore.calculated_at.split('T')[0]}`;
  } else if (score.trend) {
    trendAnalysis = `Trend: ${score.trend.charAt(0).toUpperCase() + score.trend.slice(1)}`;
  }

  return {
    headline,
    summary,
    drivers_narrative: driversNarrative,
    confidence_explanation: confidenceExplanation,
    recommendations_narrative: recommendationsNarrative,
    trend_analysis: trendAnalysis,
  };
}

// ============================================================================
// COMPOSITE SCORE EXPLANATION
// ============================================================================

export function explainCompositeScore(composite: CompositeScore): string {
  const lines: string[] = [
    `# ${composite.score_type}`,
    '',
    `**Overall Score: ${composite.value.toFixed(1)}/100** (Confidence: ${(composite.confidence * 100).toFixed(0)}%)`,
    '',
    composite.interpretation,
    '',
    '## Component Breakdown',
    '',
  ];

  // Sort by contribution
  const sortedComponents = [...composite.component_scores].sort(
    (a, b) => (b.score * b.weight) - (a.score * a.weight)
  );

  lines.push('| Module | Score | Weight | Contribution | Confidence |');
  lines.push('|--------|-------|--------|--------------|------------|');

  sortedComponents.forEach(c => {
    const contribution = (c.score * c.weight).toFixed(1);
    lines.push(
      `| ${c.module} | ${c.score.toFixed(1)} | ${(c.weight * 100).toFixed(0)}% | ${contribution} | ${(c.confidence * 100).toFixed(0)}% |`
    );
  });

  lines.push('');
  lines.push('## Key Drivers');
  lines.push('');

  composite.drivers.slice(0, 5).forEach(d => {
    lines.push(`- **${d.factor}**: ${d.raw_score.toFixed(1)} - ${d.explanation}`);
  });

  if (composite.recommendations.length > 0) {
    lines.push('');
    lines.push('## Recommendations');
    lines.push('');
    composite.recommendations.forEach(r => {
      lines.push(`- ${r}`);
    });
  }

  return lines.join('\n');
}

// ============================================================================
// NARRATIVE GENERATION
// ============================================================================

export interface NarrativeConfig {
  audience: 'technical' | 'executive' | 'legal' | 'jury';
  detail_level: 'summary' | 'standard' | 'detailed';
  include_evidence: boolean;
  include_alternatives: boolean;
}

export function generateNarrative(
  findings: Finding[],
  scores: Score[],
  evidenceStore: EvidenceStore,
  config: NarrativeConfig
): string {
  const sections: string[] = [];

  // Opening
  sections.push(generateOpening(findings, scores, config.audience));

  // Findings by severity
  const criticalHigh = findings.filter(f => f.severity === 'critical' || f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');
  const low = findings.filter(f => f.severity === 'low' || f.severity === 'info');

  if (criticalHigh.length > 0) {
    sections.push(generateFindingsSection(
      'Critical and High-Priority Findings',
      criticalHigh,
      evidenceStore,
      config
    ));
  }

  if (medium.length > 0 && config.detail_level !== 'summary') {
    sections.push(generateFindingsSection(
      'Moderate Findings',
      medium,
      evidenceStore,
      config
    ));
  }

  if (low.length > 0 && config.detail_level === 'detailed') {
    sections.push(generateFindingsSection(
      'Minor Findings',
      low,
      evidenceStore,
      config
    ));
  }

  // Conclusion
  sections.push(generateConclusion(findings, scores, config.audience));

  return sections.join('\n\n---\n\n');
}

function generateOpening(findings: Finding[], scores: Score[], audience: NarrativeConfig['audience']): string {
  const critical = findings.filter(f => f.severity === 'critical').length;
  const high = findings.filter(f => f.severity === 'high').length;

  if (audience === 'jury') {
    return `The evidence in this case reveals ${findings.length} significant findings. ` +
      `${critical + high > 0 ? `Of particular importance are ${critical + high} findings that require careful attention.` : ''}`;
  }

  if (audience === 'executive') {
    return `## Executive Summary\n\n` +
      `This analysis identified **${findings.length} findings** across the review period. ` +
      `**${critical} critical** and **${high} high-severity** issues require immediate attention.`;
  }

  return `## Analysis Results\n\n` +
    `Total findings: ${findings.length}\n` +
    `- Critical: ${critical}\n` +
    `- High: ${high}\n` +
    `- Medium: ${findings.filter(f => f.severity === 'medium').length}\n` +
    `- Low/Info: ${findings.filter(f => f.severity === 'low' || f.severity === 'info').length}`;
}

function generateFindingsSection(
  title: string,
  findings: Finding[],
  evidenceStore: EvidenceStore,
  config: NarrativeConfig
): string {
  const lines: string[] = [`## ${title}`, ''];

  findings.forEach((finding, index) => {
    if (config.audience === 'jury') {
      lines.push(formatFindingForJury(finding, index + 1, evidenceStore, config));
    } else {
      lines.push(formatFindingStandard(finding, index + 1, evidenceStore, config));
    }
    lines.push('');
  });

  return lines.join('\n');
}

function formatFindingForJury(
  finding: Finding,
  num: number,
  evidenceStore: EvidenceStore,
  config: NarrativeConfig
): string {
  const lines: string[] = [];

  // Plain language description
  lines.push(`**${num}. ${finding.title}**`);
  lines.push('');
  lines.push(finding.description);

  if (config.include_evidence && finding.evidence_refs.length > 0) {
    lines.push('');
    lines.push(`*This is supported by ${finding.evidence_refs.length} piece(s) of documentary evidence.*`);
  }

  return lines.join('\n');
}

function formatFindingStandard(
  finding: Finding,
  num: number,
  evidenceStore: EvidenceStore,
  config: NarrativeConfig
): string {
  const lines: string[] = [];

  lines.push(`### ${num}. ${finding.title}`);
  lines.push('');
  lines.push(`**Severity:** ${finding.severity.toUpperCase()} | **Confidence:** ${(finding.confidence * 100).toFixed(0)}%`);
  lines.push('');
  lines.push(finding.description);
  lines.push('');
  lines.push(`**Rationale:** ${finding.rationale}`);

  if (config.include_evidence && finding.evidence_refs.length > 0) {
    lines.push('');
    lines.push('**Evidence:**');
    finding.evidence_refs.slice(0, 5).forEach(refId => {
      const ref = evidenceStore.get(refId);
      if (ref) {
        lines.push(`- ${formatCitation(ref, 'full')}`);
      }
    });
    if (finding.evidence_refs.length > 5) {
      lines.push(`- ... and ${finding.evidence_refs.length - 5} more`);
    }
  }

  if (config.include_alternatives && finding.counter_hypotheses.length > 0) {
    lines.push('');
    lines.push('**Alternative Explanations Considered:**');
    finding.counter_hypotheses.forEach(ch => {
      lines.push(`- ${ch.hypothesis} (${ch.likelihood} likelihood)`);
    });
  }

  return lines.join('\n');
}

function generateConclusion(
  findings: Finding[],
  scores: Score[],
  audience: NarrativeConfig['audience']
): string {
  const avgConfidence = findings.length > 0
    ? findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length
    : 0;

  if (audience === 'jury') {
    return `In conclusion, the evidence presented demonstrates a clear pattern of the issues identified above. ` +
      `These findings are based on documentary evidence and financial analysis.`;
  }

  if (audience === 'executive') {
    return `## Conclusion\n\n` +
      `The analysis reveals ${findings.length} findings with an average confidence of ${(avgConfidence * 100).toFixed(0)}%. ` +
      `Immediate action is recommended for critical and high-severity items.`;
  }

  return `## Conclusion\n\n` +
    `Total findings: ${findings.length}\n` +
    `Average confidence: ${(avgConfidence * 100).toFixed(0)}%\n\n` +
    `Please refer to the detailed findings above for specific evidence and recommendations.`;
}
