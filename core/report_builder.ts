/**
 * Master Report Builder
 * Generates comprehensive SUMMARY_REPORT.md and supporting outputs
 */

import {
  Report,
  ReportSection,
  ReportTable,
  Finding,
  Score,
  CompositeScore,
  MatterConfig,
  DamagesBand,
  SettlementZone,
} from './types';
import { generateId } from './normalize';
import { EvidenceStore, summarizeEvidence } from './evidence_refs';
import { explainCompositeScore, explainScore } from './explain';

// ============================================================================
// REPORT BUILDER CLASS
// ============================================================================

export class ReportBuilder {
  private sections: ReportSection[] = [];
  private matter: MatterConfig;
  private findings: Finding[] = [];
  private scores: Score[] = [];
  private compositeScore?: CompositeScore;
  private evidenceStore: EvidenceStore;

  constructor(matter: MatterConfig, evidenceStore: EvidenceStore) {
    this.matter = matter;
    this.evidenceStore = evidenceStore;
  }

  addFindings(findings: Finding[]): void {
    this.findings.push(...findings);
  }

  addScores(scores: Score[]): void {
    this.scores.push(...scores);
  }

  setCompositeScore(score: CompositeScore): void {
    this.compositeScore = score;
  }

  build(): Report {
    this.sections = [];

    // Build standard sections
    this.buildExecutiveSummary();
    this.buildRiskDashboard();
    this.buildKeyFindingsByModule();
    this.buildCrossModulePatterns();
    this.buildDamagesExposure();
    this.buildExpertAnalysis();
    this.buildJurySettlementAnalysis();
    this.buildDataLimitations();
    this.buildRecommendedNextSteps();

    return {
      id: generateId('RPT'),
      type: 'summary',
      title: `Financial Intelligence Summary Report - ${this.matter.matter_name}`,
      generated_at: new Date().toISOString(),
      matter: this.matter,
      sections: this.sections,
      findings_summary: this.computeFindingsSummary(),
      scores: this.scores,
      composite_score: this.compositeScore,
      evidence_refs: this.findings.flatMap(f => f.evidence_refs),
      chain_of_custody: [],
    };
  }

  // ============================================================================
  // SECTION BUILDERS
  // ============================================================================

  private buildExecutiveSummary(): void {
    const criticalFindings = this.findings.filter(f => f.severity === 'critical');
    const highFindings = this.findings.filter(f => f.severity === 'high');

    const compositeText = this.compositeScore
      ? `**Composite Financial Risk Index: ${this.compositeScore.value.toFixed(1)}/100** (Confidence: ${(this.compositeScore.confidence * 100).toFixed(0)}%)`
      : 'Composite score not calculated.';

    const lines = [
      `**Matter:** ${this.matter.matter_name}`,
      `**Client:** ${this.matter.client_name}`,
      `**Period Analyzed:** ${this.matter.period_start} to ${this.matter.period_end}`,
      `**Investigation Type:** ${this.matter.investigation_type}`,
      '',
      compositeText,
      '',
      '### Key Metrics',
      '',
      `- **Total Findings:** ${this.findings.length}`,
      `- **Critical Issues:** ${criticalFindings.length}`,
      `- **High-Priority Issues:** ${highFindings.length}`,
      '',
      '### Entities in Scope',
      '',
      this.matter.entities_in_scope.length > 0
        ? this.matter.entities_in_scope.map(e => `- ${e}`).join('\n')
        : '- All entities in provided data',
    ];

    this.addSection('EXECUTIVE SUMMARY', lines.join('\n'), 1);
  }

  private buildRiskDashboard(): void {
    const rows = this.scores.map(s => {
      const status = this.getScoreStatus(s.value, s.thresholds);
      const topDriver = s.drivers.length > 0
        ? s.drivers.sort((a, b) => b.weighted_contribution - a.weighted_contribution)[0].factor
        : 'N/A';

      return [
        s.module,
        s.value.toFixed(1),
        `${(s.confidence * 100).toFixed(0)}%`,
        status,
        topDriver,
      ];
    });

    const table: ReportTable = {
      title: 'Module Risk Scores',
      headers: ['Module', 'Score', 'Confidence', 'Status', 'Top Driver'],
      rows,
    };

    const content = this.compositeScore
      ? explainCompositeScore(this.compositeScore)
      : 'No composite score available.';

    this.addSection('RISK DASHBOARD', content, 2, [], [table]);
  }

  private buildKeyFindingsByModule(): void {
    const byModule = new Map<string, Finding[]>();
    this.findings.forEach(f => {
      const existing = byModule.get(f.module) || [];
      existing.push(f);
      byModule.set(f.module, existing);
    });

    const lines: string[] = [];

    byModule.forEach((moduleFindings, module) => {
      lines.push(`### ${module.toUpperCase()}`);
      lines.push('');

      // Sort by severity
      const sorted = moduleFindings.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

      sorted.slice(0, 5).forEach((f, i) => {
        lines.push(`**${i + 1}. ${f.title}**`);
        lines.push(`- Severity: ${f.severity.toUpperCase()} | Confidence: ${(f.confidence * 100).toFixed(0)}%`);
        lines.push(`- ${f.rationale}`);
        lines.push(`- Evidence: ${f.evidence_refs.length} reference(s)`);

        if (f.counter_hypotheses.length > 0) {
          lines.push(`- Alternative explanations considered: ${f.counter_hypotheses.length}`);
        }

        if (f.suggested_strengthening && f.suggested_strengthening.length > 0) {
          lines.push(`- Strengthening evidence needed: ${f.suggested_strengthening[0]}`);
        }

        lines.push('');
      });

      if (sorted.length > 5) {
        lines.push(`*...and ${sorted.length - 5} additional findings*`);
        lines.push('');
      }
    });

    this.addSection('KEY FINDINGS BY MODULE', lines.join('\n'), 3);
  }

  private buildCrossModulePatterns(): void {
    const patterns = this.detectCrossModulePatterns();

    const lines: string[] = [
      'Analysis of correlations and patterns across multiple modules:',
      '',
    ];

    if (patterns.length === 0) {
      lines.push('No significant cross-module patterns detected.');
    } else {
      patterns.forEach((pattern, i) => {
        lines.push(`**${i + 1}. ${pattern.title}**`);
        lines.push(`- Modules involved: ${pattern.modules.join(', ')}`);
        lines.push(`- Description: ${pattern.description}`);
        lines.push(`- Strength: ${pattern.strength}`);
        lines.push('');
      });
    }

    this.addSection('CROSS-MODULE PATTERNS', lines.join('\n'), 4);
  }

  private buildDamagesExposure(): void {
    const damagesFindings = this.findings.filter(f => f.financial_impact);

    if (damagesFindings.length === 0) {
      this.addSection('DAMAGES & EXPOSURE SUMMARY', 'No quantified damages identified.', 5);
      return;
    }

    let totalLow = 0;
    let totalHigh = 0;
    let totalBest = 0;

    const lines: string[] = ['### Quantified Damages by Finding', ''];

    damagesFindings.forEach(f => {
      if (f.financial_impact) {
        totalLow += f.financial_impact.amount_low;
        totalHigh += f.financial_impact.amount_high;
        totalBest += f.financial_impact.amount_best_estimate;

        lines.push(`**${f.title}**`);
        lines.push(`- Range: $${f.financial_impact.amount_low.toLocaleString()} - $${f.financial_impact.amount_high.toLocaleString()}`);
        lines.push(`- Best Estimate: $${f.financial_impact.amount_best_estimate.toLocaleString()}`);
        lines.push('');
      }
    });

    lines.push('### Total Exposure Summary');
    lines.push('');
    lines.push(`| Scenario | Amount |`);
    lines.push(`|----------|--------|`);
    lines.push(`| Low | $${totalLow.toLocaleString()} |`);
    lines.push(`| Best Estimate | $${totalBest.toLocaleString()} |`);
    lines.push(`| High | $${totalHigh.toLocaleString()} |`);

    this.addSection('DAMAGES & EXPOSURE SUMMARY', lines.join('\n'), 5);
  }

  private buildExpertAnalysis(): void {
    const avgConfidence = this.findings.length > 0
      ? this.findings.reduce((sum, f) => sum + f.confidence, 0) / this.findings.length
      : 0;

    const criticalCount = this.findings.filter(f => f.severity === 'critical').length;
    const highCount = this.findings.filter(f => f.severity === 'high').length;

    const evidenceSummary = summarizeEvidence(this.evidenceStore);

    const lines = [
      '### Expert Opinion Summary',
      '',
      `Based on the analysis of ${evidenceSummary.total} pieces of evidence across ${Object.keys(evidenceSummary.by_source).length} source files, ` +
      `this investigation identified ${this.findings.length} findings with an average confidence of ${(avgConfidence * 100).toFixed(0)}%.`,
      '',
      '### Evidence Strength Assessment',
      '',
      `| Metric | Value |`,
      `|--------|-------|`,
      `| Total Evidence Items | ${evidenceSummary.total} |`,
      `| With Hash Verification | ${evidenceSummary.integrity.with_hash} |`,
      `| Complete Chain of Custody | ${evidenceSummary.integrity.complete_custody} |`,
      '',
      '### Cross-Examination Vulnerability Assessment',
      '',
      this.assessCrossExamVulnerability(),
      '',
      '### Findings Requiring Strengthening',
      '',
      ...this.findings
        .filter(f => f.confidence < 0.7 || (f.counter_hypotheses.some(ch => ch.likelihood === 'high')))
        .slice(0, 5)
        .map(f => `- **${f.title}**: ${f.suggested_strengthening?.[0] || 'Additional corroboration recommended'}`),
    ];

    this.addSection('EXPERT ANALYSIS & COURT READINESS', lines.join('\n'), 6);
  }

  private buildJurySettlementAnalysis(): void {
    const lines = [
      '### Narrative Themes',
      '',
      this.generateNarrativeThemes(),
      '',
      '### Persuasion Considerations',
      '',
      this.generatePersuasionConsiderations(),
      '',
      '### Settlement Analysis',
      '',
      this.generateSettlementAnalysis(),
    ];

    this.addSection('JURY & SETTLEMENT ANALYSIS', lines.join('\n'), 7);
  }

  private buildDataLimitations(): void {
    const limitations: string[] = [];

    // Check for data gaps
    const evidenceSummary = summarizeEvidence(this.evidenceStore);

    if (evidenceSummary.total < 100) {
      limitations.push('- Limited transaction volume may affect pattern detection accuracy');
    }

    if (evidenceSummary.integrity.with_hash < evidenceSummary.total * 0.9) {
      limitations.push('- Some evidence items lack hash verification');
    }

    const lowConfidenceFindings = this.findings.filter(f => f.confidence < 0.5);
    if (lowConfidenceFindings.length > 0) {
      limitations.push(`- ${lowConfidenceFindings.length} finding(s) have confidence below 50%`);
    }

    // Period limitations
    limitations.push(`- Analysis limited to period ${this.matter.period_start} to ${this.matter.period_end}`);

    // Methodology notes
    limitations.push('- Statistical analysis assumes data completeness');
    limitations.push('- Entity resolution may have false positives/negatives');

    this.addSection('DATA LIMITATIONS', limitations.length > 0
      ? limitations.join('\n')
      : 'No significant data limitations identified.', 8);
  }

  private buildRecommendedNextSteps(): void {
    const steps: string[] = [];

    // Based on critical findings
    const criticalFindings = this.findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length > 0) {
      steps.push('### Immediate Actions');
      steps.push('');
      criticalFindings.slice(0, 3).forEach(f => {
        steps.push(`1. Investigate: ${f.title}`);
      });
      steps.push('');
    }

    // Based on low confidence findings
    const lowConfidence = this.findings.filter(f => f.confidence < 0.6 && f.severity !== 'info');
    if (lowConfidence.length > 0) {
      steps.push('### Evidence Strengthening');
      steps.push('');
      lowConfidence.slice(0, 3).forEach(f => {
        const strengthening = f.suggested_strengthening?.[0] || 'Gather additional corroborating evidence';
        steps.push(`- ${f.title}: ${strengthening}`);
      });
      steps.push('');
    }

    // Standard recommendations
    steps.push('### Standard Follow-up');
    steps.push('');
    steps.push('- Review findings with legal counsel');
    steps.push('- Prepare detailed exhibits for key findings');
    steps.push('- Schedule expert witness preparation if litigation anticipated');
    steps.push('- Consider regulatory notification requirements');

    this.addSection('RECOMMENDED NEXT STEPS', steps.join('\n'), 9);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private addSection(
    title: string,
    content: string,
    order: number,
    findings?: Finding[],
    tables?: ReportTable[]
  ): void {
    this.sections.push({
      id: generateId('SEC'),
      title,
      order,
      content,
      findings,
      tables,
    });
  }

  private getScoreStatus(value: number, thresholds: Score['thresholds']): string {
    if (value >= thresholds.critical) return 'CRITICAL';
    if (value >= thresholds.high) return 'HIGH';
    if (value >= thresholds.medium) return 'MEDIUM';
    if (value >= thresholds.low) return 'LOW';
    return 'MINIMAL';
  }

  private computeFindingsSummary(): Report['findings_summary'] {
    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    const byModule: Record<string, number> = {};

    this.findings.forEach(f => {
      bySeverity[f.severity]++;
      byModule[f.module] = (byModule[f.module] || 0) + 1;
    });

    return {
      total: this.findings.length,
      by_severity: bySeverity as any,
      by_module: byModule,
    };
  }

  private detectCrossModulePatterns(): {
    title: string;
    modules: string[];
    description: string;
    strength: string;
  }[] {
    const patterns: any[] = [];

    // Example pattern detection
    const payrollFindings = this.findings.filter(f => f.module === 'payroll_forensics');
    const apFindings = this.findings.filter(f => f.module === 'ap_procurement');

    if (payrollFindings.length > 0 && apFindings.length > 0) {
      patterns.push({
        title: 'Payroll-AP Correlation',
        modules: ['payroll_forensics', 'ap_procurement'],
        description: 'Anomalies detected in both payroll and vendor payments may indicate coordinated fraud',
        strength: 'Medium',
      });
    }

    const amlFindings = this.findings.filter(f => f.module === 'fincen_aml');
    const assetFindings = this.findings.filter(f => f.module === 'asset_tracing');

    if (amlFindings.length > 0 && assetFindings.length > 0) {
      patterns.push({
        title: 'AML-Asset Tracing Correlation',
        modules: ['fincen_aml', 'asset_tracing'],
        description: 'Suspicious transaction patterns correlate with complex ownership structures',
        strength: 'High',
      });
    }

    return patterns;
  }

  private assessCrossExamVulnerability(): string {
    const vulnerabilities: string[] = [];

    const lowConfidence = this.findings.filter(f => f.confidence < 0.6);
    if (lowConfidence.length > 0) {
      vulnerabilities.push(`- ${lowConfidence.length} findings have confidence below 60% and may face credibility challenges`);
    }

    const highLikelihoodAlts = this.findings.filter(f =>
      f.counter_hypotheses.some(ch => ch.likelihood === 'high')
    );
    if (highLikelihoodAlts.length > 0) {
      vulnerabilities.push(`- ${highLikelihoodAlts.length} findings have high-likelihood alternative explanations`);
    }

    if (vulnerabilities.length === 0) {
      return 'Findings appear well-supported with limited cross-examination vulnerability.';
    }

    return vulnerabilities.join('\n');
  }

  private generateNarrativeThemes(): string {
    const themes: string[] = [];

    const fraudFindings = this.findings.filter(f => f.module === 'forensic');
    if (fraudFindings.length > 0) {
      themes.push('- **Financial Misconduct**: Evidence suggests intentional manipulation of financial records');
    }

    const controlFindings = this.findings.filter(f => f.module === 'controls_sox');
    if (controlFindings.length > 0) {
      themes.push('- **Control Failures**: Internal controls were inadequate to prevent or detect issues');
    }

    if (themes.length === 0) {
      themes.push('- Narrative themes to be developed based on case theory');
    }

    return themes.join('\n');
  }

  private generatePersuasionConsiderations(): string {
    return [
      '- Simplify complex financial concepts for lay understanding',
      '- Use visual exhibits to demonstrate transaction flows',
      '- Establish credibility through methodology transparency',
      '- Anticipate and address alternative explanations proactively',
    ].join('\n');
  }

  private generateSettlementAnalysis(): string {
    const totalDamages = this.findings
      .filter(f => f.financial_impact)
      .reduce((sum, f) => sum + (f.financial_impact?.amount_best_estimate || 0), 0);

    if (totalDamages === 0) {
      return 'Insufficient data to calculate settlement range. Damages quantification recommended.';
    }

    const lowRange = totalDamages * 0.3;
    const highRange = totalDamages * 0.8;
    const recommended = totalDamages * 0.5;

    return [
      `Based on quantified damages of $${totalDamages.toLocaleString()}:`,
      '',
      `| Settlement Zone | Amount |`,
      `|-----------------|--------|`,
      `| Floor (walk-away) | $${lowRange.toLocaleString()} |`,
      `| Recommended | $${recommended.toLocaleString()} |`,
      `| Ceiling | $${highRange.toLocaleString()} |`,
      '',
      '*Note: Settlement analysis is preliminary and should be refined with legal counsel.*',
    ].join('\n');
  }
}

// ============================================================================
// MARKDOWN GENERATOR
// ============================================================================

export function generateSummaryReportMarkdown(report: Report): string {
  const lines: string[] = [
    `# ${report.title}`,
    '',
    `**Generated:** ${new Date(report.generated_at).toLocaleString()}`,
    `**Report ID:** ${report.id}`,
    '',
    '---',
    '',
  ];

  // Sort sections by order
  const sortedSections = [...report.sections].sort((a, b) => a.order - b.order);

  sortedSections.forEach(section => {
    lines.push(`# ${section.title}`);
    lines.push('');
    lines.push(section.content);
    lines.push('');

    if (section.tables) {
      section.tables.forEach(table => {
        lines.push(`### ${table.title}`);
        lines.push('');
        lines.push(`| ${table.headers.join(' | ')} |`);
        lines.push(`| ${table.headers.map(() => '---').join(' | ')} |`);
        table.rows.forEach(row => {
          lines.push(`| ${row.join(' | ')} |`);
        });
        lines.push('');

        if (table.footnotes) {
          table.footnotes.forEach(fn => {
            lines.push(`*${fn}*`);
          });
          lines.push('');
        }
      });
    }

    lines.push('---');
    lines.push('');
  });

  // Footer
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*This report was generated by the Financial Intelligence System.*');
  lines.push('*All findings are based on the data provided and methodologies documented herein.*');
  lines.push('*This report does not constitute legal advice.*');

  return lines.join('\n');
}
