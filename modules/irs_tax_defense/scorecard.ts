/**
 * Scorecard Report Generator
 * Generates comprehensive scorecard markdown reports
 */

import { RedFlagScorecard } from './red_flags';

export function generateScorecardReport(scorecard: RedFlagScorecard, config: any): string {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return '🔴 CRITICAL';
    if (score >= 60) return '🟠 HIGH';
    if (score >= 40) return '🟡 MEDIUM';
    return '🟢 LOW';
  };

  const getRiskBar = (score: number) => {
    const filled = Math.round(score / 5);
    const empty = 20 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  };

  return `# IRS TAX DEFENSE SCORECARD

**Generated:** ${scorecard.generated_at}
**Taxpayer:** ${config.taxpayer_name || 'N/A'}
**Type:** ${config.taxpayer_type || 'N/A'}
**Tax Years:** ${config.tax_years?.join(', ') || 'N/A'}

---

## RISK SCORE SUMMARY

\`\`\`
╔══════════════════════════════════════════════════════════════════╗
║                         RISK DASHBOARD                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  IRS AUDIT RISK        ${scorecard.irs_risk_score.toString().padStart(3)}/100  ${getRiskBar(scorecard.irs_risk_score)}  ║
║  ${getRiskLevel(scorecard.irs_risk_score).padEnd(64)}║
║                                                                   ║
║  FRAUD INDICATORS      ${scorecard.fraud_score.toString().padStart(3)}/100  ${getRiskBar(scorecard.fraud_score)}  ║
║  ${getRiskLevel(scorecard.fraud_score).padEnd(64)}║
║                                                                   ║
║  PENALTY EXPOSURE      ${scorecard.penalty_score.toString().padStart(3)}/100  ${getRiskBar(scorecard.penalty_score)}  ║
║  ${getRiskLevel(scorecard.penalty_score).padEnd(64)}║
║                                                                   ║
║  SEC COMPLIANCE        ${scorecard.sec_score.toString().padStart(3)}/100  ${getRiskBar(scorecard.sec_score)}  ║
║  ${getRiskLevel(scorecard.sec_score).padEnd(64)}║
║                                                                   ║
║  CRIMINAL RISK         ${scorecard.criminal_score.toString().padStart(3)}/100  ${getRiskBar(scorecard.criminal_score)}  ║
║  ${getRiskLevel(scorecard.criminal_score).padEnd(64)}║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  OVERALL RISK          ${scorecard.overall_score.toString().padStart(3)}/100  ${getRiskBar(scorecard.overall_score)}  ║
║  ${getRiskLevel(scorecard.overall_score).padEnd(64)}║
╚══════════════════════════════════════════════════════════════════╝
\`\`\`

---

## RISK MATRIX

| Category | Score | Level | Status |
|----------|-------|-------|--------|
| IRS Audit Risk | ${scorecard.irs_risk_score}/100 | ${getRiskLevel(scorecard.irs_risk_score)} | ${scorecard.irs_risk_score >= 60 ? '⚠️ ACTION REQUIRED' : '✓'} |
| Fraud Indicators | ${scorecard.fraud_score}/100 | ${getRiskLevel(scorecard.fraud_score)} | ${scorecard.fraud_score >= 60 ? '⚠️ ACTION REQUIRED' : '✓'} |
| Penalty Exposure | ${scorecard.penalty_score}/100 | ${getRiskLevel(scorecard.penalty_score)} | ${scorecard.penalty_score >= 60 ? '⚠️ ACTION REQUIRED' : '✓'} |
| SEC Compliance | ${scorecard.sec_score}/100 | ${getRiskLevel(scorecard.sec_score)} | ${scorecard.sec_score >= 60 ? '⚠️ ACTION REQUIRED' : '✓'} |
| Criminal Risk | ${scorecard.criminal_score}/100 | ${getRiskLevel(scorecard.criminal_score)} | ${scorecard.criminal_score >= 60 ? '🛑 STOP - COUNSEL REQUIRED' : '✓'} |

---

## RED FLAGS SUMMARY

**Total Red Flags:** ${scorecard.red_flags.length}
**Flagged Transactions:** ${scorecard.flagged_transactions?.length || 0}

### By Severity

| Severity | Count | Percentage |
|----------|-------|------------|
| 🔴 Critical | ${scorecard.red_flags.filter(f => f.severity === 'critical').length} | ${((scorecard.red_flags.filter(f => f.severity === 'critical').length / Math.max(scorecard.red_flags.length, 1)) * 100).toFixed(0)}% |
| 🟠 High | ${scorecard.red_flags.filter(f => f.severity === 'high').length} | ${((scorecard.red_flags.filter(f => f.severity === 'high').length / Math.max(scorecard.red_flags.length, 1)) * 100).toFixed(0)}% |
| 🟡 Medium | ${scorecard.red_flags.filter(f => f.severity === 'medium').length} | ${((scorecard.red_flags.filter(f => f.severity === 'medium').length / Math.max(scorecard.red_flags.length, 1)) * 100).toFixed(0)}% |
| 🟢 Low | ${scorecard.red_flags.filter(f => f.severity === 'low').length} | ${((scorecard.red_flags.filter(f => f.severity === 'low').length / Math.max(scorecard.red_flags.length, 1)) * 100).toFixed(0)}% |

### By Category

${Object.entries(groupByCategory(scorecard.red_flags)).map(([cat, flags]) =>
  `| ${cat} | ${flags.length} | $${flags.reduce((sum, f) => sum + (f.amount_involved || 0), 0).toLocaleString()} |`
).join('\n') || '| None | 0 | $0 |'}

---

## CRITICAL FINDINGS

${scorecard.red_flags.filter(f => f.severity === 'critical').map((f, i) => `
### ${i + 1}. ${f.title}

**Severity:** 🔴 CRITICAL
**Category:** ${f.category}
**Confidence:** ${(f.confidence * 100).toFixed(0)}%
${f.amount_involved ? `**Amount Involved:** $${f.amount_involved.toLocaleString()}` : ''}
${f.irc_section ? `**IRC Reference:** ${f.irc_section}` : ''}

${f.description}

**Risk Factors:**
${f.risk_factors?.map(r => `- ${r}`).join('\n') || '- See description'}

**Required Actions:**
${f.recommended_actions?.map((a, j) => `${j + 1}. ${a}`).join('\n') || '1. Engage professional counsel'}

---
`).join('\n') || '*No critical findings*'}

---

## RECOMMENDED ACTIONS

### Immediate (7 Days)

${scorecard.overall_score >= 60 ? `
1. **ENGAGE PROFESSIONAL COUNSEL**
   - Tax controversy attorney for IRS issues
   - Criminal defense if criminal score ≥ 60
   - SEC counsel if SEC score ≥ 60

2. **DOCUMENT PRESERVATION**
   - Issue litigation hold
   - Preserve all electronic records
   - Secure physical documents

3. **STOP SELF-INCRIMINATION**
   - Do not communicate with IRS without counsel
   - Do not destroy any documents
   - Do not discuss case with third parties
` : `
1. Review all flagged transactions
2. Prepare documentation for identified issues
3. Consult with tax professional
`}

### Short-Term (30 Days)

${scorecard.red_flags.filter(f => f.severity === 'high').slice(0, 5).map((f, i) =>
  `${i + 1}. Address: ${f.title}\n   - ${f.recommended_actions?.[0] || 'Review and document'}`
).join('\n') || '1. Complete documentation review'}

### Long-Term (90 Days)

1. Implement control improvements
2. Review compliance procedures
3. Consider voluntary disclosure if applicable
4. Prepare for potential audit

---

## LEGAL REFERENCES

${scorecard.legal_references?.map(r => `- ${r}`).join('\n') || `
- Internal Revenue Code (IRC)
- Treasury Regulations
- Internal Revenue Manual (IRM)
- Bank Secrecy Act (31 USC 5311-5332)
- FBAR Requirements (31 CFR 1010.350)
`}

---

## DISCLAIMER

This scorecard is for informational purposes only and does not constitute legal or tax advice. All findings require professional review. Criminal indicators require immediate engagement of qualified criminal defense counsel.

---

*Generated by IRS Tax Defense & Regulatory Controversy System v3.0*
`;
}

function groupByCategory(flags: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  flags.forEach(f => {
    if (!groups[f.category]) groups[f.category] = [];
    groups[f.category].push(f);
  });
  return groups;
}
