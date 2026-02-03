/**
 * SEC Compliance & Financial Reporting Risk Module
 */

import { Finding } from '../../core/types';
import { generateId } from '../../core/normalize';
import { TaxDefenseContext } from './index';

export async function runSECComplianceEngine(context: TaxDefenseContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Only run for corporations
  if (context.taxpayer_type !== 'corporation') {
    return findings;
  }

  // Analyze SEC risk areas
  const riskAreas = analyzeSECRisks(context);

  riskAreas.forEach(risk => {
    findings.push({
      id: generateId('SEC'),
      module: 'irs_tax_defense',
      title: `SEC Risk: ${risk.title}`,
      description: risk.description,
      severity: risk.severity,
      confidence: risk.confidence,
      detected_at: new Date().toISOString(),
      evidence_refs: [],
      tags: ['sec', 'compliance', risk.category],
      recommended_actions: risk.recommended_actions,
    });
  });

  // Add SEC risk summary
  findings.push({
    id: generateId('SEC'),
    module: 'irs_tax_defense',
    title: 'SEC Compliance Risk Summary',
    description: generateSECSummary(riskAreas),
    severity: calculateOverallSECRisk(riskAreas) > 60 ? 'high' : 'medium',
    confidence: 0.80,
    detected_at: new Date().toISOString(),
    evidence_refs: [],
    tags: ['sec', 'summary'],
  });

  return findings;
}

interface SECRisk {
  title: string;
  description: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  score: number;
  recommended_actions: string[];
}

function analyzeSECRisks(context: TaxDefenseContext): SECRisk[] {
  const risks: SECRisk[] = [];
  const transactions = Array.from(context.transactions.values());
  const ledger = Array.from(context.ledger_entries.values());

  // Revenue Recognition (ASC 606)
  const revenueEntries = ledger.filter(e =>
    e.account_name?.toLowerCase().includes('revenue') ||
    e.account_number?.startsWith('4')
  );

  if (revenueEntries.length > 0) {
    // Check for period-end concentrations
    const periodEndRevenue = revenueEntries.filter(e => {
      const day = new Date(e.date).getDate();
      return day >= 28;
    });

    if (periodEndRevenue.length > revenueEntries.length * 0.4) {
      risks.push({
        title: 'Revenue Recognition Timing',
        description: 'High concentration of revenue recognized at period-end (>40%). ' +
          'May indicate premature revenue recognition or channel stuffing. ' +
          'Review ASC 606 five-step model compliance.',
        category: 'revenue',
        severity: 'high',
        confidence: 0.75,
        score: 70,
        recommended_actions: [
          'Review revenue recognition policy',
          'Test cutoff procedures',
          'Analyze customer contracts for performance obligations',
          'Consider disclosure implications',
        ],
      });
    }
  }

  // Related Party Transactions
  const relatedPartyIndicators = transactions.filter(t =>
    t.counterparty?.toLowerCase().includes('related') ||
    t.description?.toLowerCase().includes('affiliate') ||
    t.description?.toLowerCase().includes('shareholder') ||
    t.description?.toLowerCase().includes('officer')
  );

  if (relatedPartyIndicators.length > 0) {
    const totalRelatedParty = relatedPartyIndicators.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    risks.push({
      title: 'Related Party Transaction Disclosure',
      description: `${relatedPartyIndicators.length} potential related party transactions identified ` +
        `totaling $${totalRelatedParty.toLocaleString()}. ` +
        'Regulation S-K Item 404 requires disclosure of material related party transactions.',
      category: 'disclosure',
      severity: 'high',
      confidence: 0.70,
      score: 65,
      recommended_actions: [
        'Identify all related parties',
        'Document terms and business purpose',
        'Compare to arm\'s length terms',
        'Prepare Item 404 disclosures',
      ],
    });
  }

  // Large Adjustments (Restatement Risk)
  const adjustingEntries = ledger.filter(e =>
    e.description?.toLowerCase().includes('adjust') ||
    e.description?.toLowerCase().includes('correction') ||
    e.description?.toLowerCase().includes('reclass')
  );

  if (adjustingEntries.length > 0) {
    const totalAdjustments = adjustingEntries.reduce((sum, e) => sum + Math.abs(e.debit || 0), 0);

    risks.push({
      title: 'Restatement Risk - Adjusting Entries',
      description: `${adjustingEntries.length} adjusting entries totaling $${totalAdjustments.toLocaleString()}. ` +
        'Large or unusual adjustments may indicate material weaknesses or potential restatement.',
      category: 'restatement',
      severity: 'medium',
      confidence: 0.65,
      score: 50,
      recommended_actions: [
        'Document business rationale for all adjustments',
        'Assess materiality individually and in aggregate',
        'Evaluate control implications',
        'Consider SAB 99 qualitative factors',
      ],
    });
  }

  // Internal Control over Financial Reporting (ICFR)
  risks.push({
    title: 'SOX 404 Internal Control Assessment',
    description: 'IRS audit findings may indicate weaknesses in internal control over financial reporting. ' +
      'Management certifications under SOX 302/404 require assessment of control effectiveness.',
    category: 'controls',
    severity: 'medium',
    confidence: 0.70,
    score: 55,
    recommended_actions: [
      'Map IRS findings to ICFR assertions',
      'Evaluate control deficiency severity',
      'Document remediation plans',
      'Consider disclosure obligations',
    ],
  });

  // Earnings Management Indicators
  const quarterEndEntries = ledger.filter(e => {
    const month = new Date(e.date).getMonth();
    return month === 2 || month === 5 || month === 8 || month === 11; // Quarter-end months
  });

  const quarterEndAdjustments = quarterEndEntries.filter(e =>
    e.description?.toLowerCase().includes('adjust')
  );

  if (quarterEndAdjustments.length > quarterEndEntries.length * 0.3) {
    risks.push({
      title: 'Earnings Management Indicators',
      description: 'High proportion of adjustments at quarter-end. ' +
        'Pattern may indicate earnings management to meet targets.',
      category: 'fraud_risk',
      severity: 'high',
      confidence: 0.60,
      score: 60,
      recommended_actions: [
        'Analyze adjustment patterns across periods',
        'Review reserve methodology',
        'Test for bias in estimates',
        'Consider SEC enforcement risk factors',
      ],
    });
  }

  return risks;
}

function generateSECSummary(risks: SECRisk[]): string {
  const totalScore = calculateOverallSECRisk(risks);
  const level = totalScore >= 70 ? 'HIGH' : totalScore >= 40 ? 'MEDIUM' : 'LOW';

  return `# SEC Compliance Risk Assessment

## Overall Risk Score: ${totalScore}/100 (${level})

## Risk Areas Identified

${risks.map(r => `### ${r.title}
- **Category:** ${r.category}
- **Severity:** ${r.severity.toUpperCase()}
- **Score:** ${r.score}/100
`).join('\n')}

## Key Regulatory References

- Securities Act of 1933
- Securities Exchange Act of 1934
- Sarbanes-Oxley Act (SOX 302, 404)
- Regulation S-K (Items 303, 404)
- ASC 606 (Revenue Recognition)
- ASC 855 (Subsequent Events)

## Disclosure Considerations

1. **MD&A (Item 303):** Discuss material uncertainties
2. **Risk Factors (Item 1A):** Update for tax controversy
3. **Legal Proceedings (Item 3):** If material
4. **Critical Accounting Policies:** Tax provision estimates

## Enforcement Risk Factors

- Significant restatements
- Material weakness in ICFR
- Whistleblower complaints
- Related party issues
- Revenue recognition irregularities`;
}

function calculateOverallSECRisk(risks: SECRisk[]): number {
  if (risks.length === 0) return 20;

  const totalScore = risks.reduce((sum, r) => sum + r.score, 0);
  return Math.min(Math.round(totalScore / risks.length), 100);
}
