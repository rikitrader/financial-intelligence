/**
 * IRS Tax Defense Scoring Module
 */

import { Score, Finding } from '../../core/types';

export function calculateTaxDefenseScore(findings: Finding[]): Score {
  // Separate findings by category
  const auditFindings = findings.filter(f => f.tags?.includes('audit'));
  const penaltyFindings = findings.filter(f => f.tags?.includes('penalty'));
  const secFindings = findings.filter(f => f.tags?.includes('sec'));
  const criminalFindings = findings.filter(f => f.tags?.includes('criminal'));

  // Calculate component scores
  const auditScore = calculateComponentScore(auditFindings);
  const penaltyScore = calculateComponentScore(penaltyFindings);
  const secScore = calculateComponentScore(secFindings);
  const criminalScore = calculateComponentScore(criminalFindings);

  // Weighted composite
  const weights = {
    audit: 0.25,
    penalty: 0.25,
    sec: 0.20,
    criminal: 0.30, // Higher weight for criminal
  };

  const compositeScore =
    auditScore * weights.audit +
    penaltyScore * weights.penalty +
    secScore * weights.sec +
    criminalScore * weights.criminal;

  // Determine risk level
  const riskLevel = compositeScore >= 80 ? 'CRITICAL' :
                    compositeScore >= 60 ? 'HIGH' :
                    compositeScore >= 40 ? 'MEDIUM' : 'LOW';

  return {
    module: 'irs_tax_defense',
    score_type: 'IRS Tax Defense Risk',
    value: Math.round(compositeScore),
    confidence: calculateConfidence(findings),
    drivers: [
      { factor: 'Audit Selection Risk', weight: weights.audit, score: auditScore },
      { factor: 'Penalty Exposure', weight: weights.penalty, score: penaltyScore },
      { factor: 'SEC Compliance Risk', weight: weights.sec, score: secScore },
      { factor: 'Criminal Exposure Risk', weight: weights.criminal, score: criminalScore },
    ],
    thresholds: {
      critical: 80,
      high: 60,
      medium: 40,
      low: 20,
    },
    interpretation: generateInterpretation(riskLevel, compositeScore),
    recommendations: generateRecommendations(riskLevel, findings),
    calculated_at: new Date().toISOString(),
    evidence_refs: findings.flatMap(f => f.evidence_refs),
  };
}

function calculateComponentScore(findings: Finding[]): number {
  if (findings.length === 0) return 20; // Base low risk

  const severityScores: Record<string, number> = {
    critical: 90,
    high: 70,
    medium: 50,
    low: 30,
    info: 10,
  };

  const totalScore = findings.reduce((sum, f) => {
    const baseScore = severityScores[f.severity] || 50;
    return sum + baseScore * f.confidence;
  }, 0);

  const avgScore = totalScore / findings.length;
  return Math.min(avgScore, 100);
}

function calculateConfidence(findings: Finding[]): number {
  if (findings.length === 0) return 0.5;

  const avgConfidence = findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length;
  return Math.round(avgConfidence * 100) / 100;
}

function generateInterpretation(level: string, score: number): string {
  const interpretations: Record<string, string> = {
    CRITICAL: `CRITICAL RISK (${score}/100): Immediate action required. Multiple severe risk factors detected. ` +
      'Consider engaging specialized counsel immediately.',
    HIGH: `HIGH RISK (${score}/100): Significant risk factors identified. Proactive defense strategy essential. ` +
      'Professional representation strongly recommended.',
    MEDIUM: `MEDIUM RISK (${score}/100): Moderate risk factors present. Careful attention to defense preparation needed. ` +
      'Document all positions thoroughly.',
    LOW: `LOW RISK (${score}/100): Limited risk factors identified. Standard defense procedures should be adequate. ` +
      'Continue monitoring and documentation.',
  };

  return interpretations[level] || `Risk assessment: ${score}/100`;
}

function generateRecommendations(level: string, findings: Finding[]): string[] {
  const recommendations: string[] = [];

  // Universal recommendations
  recommendations.push('Maintain complete documentation of all positions');
  recommendations.push('Preserve all relevant records');

  // Level-specific recommendations
  switch (level) {
    case 'CRITICAL':
      recommendations.push('IMMEDIATELY engage specialized tax controversy counsel');
      recommendations.push('Consider Kovel arrangement for privilege protection');
      recommendations.push('Do not communicate with IRS without counsel present');
      recommendations.push('Evaluate Fifth Amendment implications');
      break;

    case 'HIGH':
      recommendations.push('Engage experienced tax controversy professional');
      recommendations.push('Develop comprehensive defense strategy');
      recommendations.push('Prepare detailed response to all issues');
      recommendations.push('Consider preemptive penalty relief requests');
      break;

    case 'MEDIUM':
      recommendations.push('Ensure adequate professional representation');
      recommendations.push('Prepare substantiation for all issues');
      recommendations.push('Review penalty relief eligibility');
      recommendations.push('Consider appeals strategy');
      break;

    case 'LOW':
      recommendations.push('Continue compliance best practices');
      recommendations.push('Document business purpose for all deductions');
      recommendations.push('Maintain organized records for future reference');
      break;
  }

  // Add specific recommendations based on findings
  const criticalFindings = findings.filter(f => f.severity === 'critical');
  criticalFindings.forEach(f => {
    if (f.recommended_actions && f.recommended_actions.length > 0) {
      recommendations.push(f.recommended_actions[0]);
    }
  });

  return recommendations.slice(0, 10); // Limit to top 10
}
