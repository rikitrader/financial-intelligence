/**
 * Appeals Protest Drafting Engine
 * Generates appeals protests per IRM 8 and Pub 5
 */

import { Finding } from '../../core/types';
import { generateId } from '../../core/normalize';
import { TaxDefenseContext, TaxIssue } from './index';

export async function runAppealsEngine(context: TaxDefenseContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  // This would be triggered when entering appeals phase
  // For now, provide guidance on appeals preparation

  findings.push({
    id: generateId('APP'),
    module: 'irs_tax_defense',
    title: 'Appeals Rights and Process Overview',
    description: generateAppealsOverview(),
    severity: 'info',
    confidence: 0.95,
    detected_at: new Date().toISOString(),
    evidence_refs: [],
    tags: ['appeals', 'process', 'rights'],
  });

  return findings;
}

function generateAppealsOverview(): string {
  return `# IRS Appeals Process Overview

## Taxpayer Rights in Appeals

Under Publication 5 and IRM 8, taxpayers have the right to:
- An independent review by Appeals
- Present new evidence and arguments
- Settlement discussions in good faith
- Conference with Appeals Officer

## Types of Appeals Requests

### Small Case Request (Form 12203)
- For cases with total amount (tax, penalties, interest) ≤ $25,000
- Brief written statement of disagreement
- Less formal process

### Formal Written Protest
- Required for amounts > $25,000
- Must include specific elements
- More detailed analysis required

## Formal Protest Requirements (IRM 8.6.1.4)

1. **Statement of Intent** - "I want to appeal the findings"
2. **Taxpayer Information** - Name, address, SSN/EIN
3. **Date and Symbols** - From 30-day letter
4. **Tax Years/Periods** - All periods at issue
5. **List of Changes** - Each adjustment disputed
6. **Statement of Facts** - For each issue
7. **Statement of Law** - IRC, Regs, case law
8. **Arguments** - Why taxpayer is correct
9. **Penalty Statement** - If penalties disputed
10. **Perjury Statement** - Required declaration

## Settlement Considerations

Appeals considers "hazards of litigation":
- Strength of IRS position
- Strength of taxpayer position
- Likelihood of success at trial
- Cost/benefit analysis

## Timeline

- 30 days from notice to request Appeals
- Appeals typically 6-12 months
- Can request expedited handling
- Can request early referral from Exam

## Best Practices

1. Respond timely to 30-day letter
2. Include all documentation upfront
3. Be prepared to negotiate
4. Know your BATNA (Tax Court)
5. Consider Fast Track Settlement`;
}

export function generateProtestDocument(
  context: TaxDefenseContext,
  issues: TaxIssue[]
): string {
  const date = new Date().toLocaleDateString();

  return `# FORMAL WRITTEN PROTEST

**Date:** ${date}
**Case ID:** ${context.case_id}

---

## I. STATEMENT OF INTENT

The undersigned taxpayer hereby protests the proposed adjustments set forth in the examination report dated [DATE] and requests consideration by the IRS Independent Office of Appeals.

## II. TAXPAYER INFORMATION

**Name:** [TAXPAYER NAME]
**Address:** [ADDRESS]
**SSN/EIN:** [NUMBER]
**Tax Years:** ${context.tax_years.join(', ')}

## III. STATEMENT OF UNAGREED ADJUSTMENTS

The taxpayer disagrees with the following proposed adjustments:

${issues.map((issue, i) => `
### Issue ${i + 1}: ${issue.description}

**IRC Section:** ${issue.irc_section}
**Amount at Issue:** $${issue.amount_at_issue.toLocaleString()}
**Tax Years:** ${issue.tax_years_affected.join(', ')}

#### Statement of Facts

[INSERT FACTS SUPPORTING TAXPAYER POSITION]

#### Statement of Law

[INSERT APPLICABLE IRC SECTIONS, REGULATIONS, CASE LAW]

#### Argument

[INSERT ARGUMENT WHY TAXPAYER POSITION IS CORRECT]

**IRS Position:** ${issue.irs_position || 'As stated in examination report'}
**Taxpayer Position:** ${issue.taxpayer_position || 'Adjustment is incorrect'}
`).join('\n---\n')}

## IV. PENALTY PROTEST

[IF APPLICABLE - INSERT PENALTY RELIEF ARGUMENTS]

## V. CONCLUSION

For the reasons stated above, the taxpayer respectfully requests that the proposed adjustments be withdrawn in full, or in the alternative, that Appeals consider settlement of the disputed issues.

## VI. PERJURY STATEMENT

Under penalties of perjury, I declare that I examined the facts stated in this protest, including any accompanying documents, and to the best of my knowledge and belief, they are true, correct, and complete.

**Signature:** _______________________
**Date:** ${date}
**Title:** [IF APPLICABLE]

---

## ATTACHMENTS

- [ ] Copy of 30-Day Letter
- [ ] Copy of Examination Report
- [ ] Supporting Documentation
- [ ] Power of Attorney (Form 2848)
`;
}
