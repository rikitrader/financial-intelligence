/**
 * Statistical Anomalies Module - Scoring
 */

import { Score, Finding } from '../../core/types';
import { scoreFromFindings } from '../../core/scoring';

export function calculateStatisticalScore(findings: Finding[]): Score {
  return scoreFromFindings(
    findings,
    'statistical_anomalies',
    'Statistical Anomaly Risk'
  );
}

export function scoreBenfordDeviation(
  chiSquare: number,
  criticalValue: number,
  mad: number
): number {
  // Base score from chi-square test
  let score = 0;

  if (chiSquare > criticalValue * 2) {
    score = 90; // Extreme deviation
  } else if (chiSquare > criticalValue * 1.5) {
    score = 75; // Significant deviation
  } else if (chiSquare > criticalValue) {
    score = 60; // Notable deviation
  } else if (chiSquare > criticalValue * 0.75) {
    score = 40; // Minor deviation
  } else {
    score = 20; // Within normal range
  }

  // Adjust based on MAD (Mean Absolute Deviation)
  // MAD > 0.015 is concerning, > 0.022 is significant
  if (mad > 0.022) {
    score = Math.min(100, score + 15);
  } else if (mad > 0.015) {
    score = Math.min(100, score + 8);
  }

  return score;
}

export function scoreOutlierDensity(
  outlierCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;

  const ratio = outlierCount / totalCount;

  // Expected outlier ratio is about 0.3% for 3-sigma
  if (ratio > 0.10) return 90; // >10% outliers
  if (ratio > 0.05) return 75; // 5-10% outliers
  if (ratio > 0.02) return 55; // 2-5% outliers
  if (ratio > 0.01) return 35; // 1-2% outliers
  return 15; // <1% outliers (normal)
}

export function scoreClusteringAnomaly(
  clusterCount: number,
  expectedClusters: number
): number {
  // More clusters than expected suggests fragmentation
  // Fewer suggests concentration (potentially suspicious)

  const ratio = clusterCount / expectedClusters;

  if (ratio < 0.5) return 70; // High concentration
  if (ratio > 2.0) return 60; // High fragmentation
  if (ratio < 0.75 || ratio > 1.5) return 40;
  return 20; // Normal
}

export function scoreTimeSeriesAnomaly(
  anomalyCount: number,
  periodCount: number
): number {
  if (periodCount === 0) return 0;

  const ratio = anomalyCount / periodCount;

  if (ratio > 0.30) return 85;
  if (ratio > 0.20) return 65;
  if (ratio > 0.10) return 45;
  if (ratio > 0.05) return 30;
  return 15;
}
