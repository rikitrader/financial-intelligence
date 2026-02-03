/**
 * Forensic Module Prompts
 * Investigation guidance and analysis prompts
 */

export const FORENSIC_PROMPTS = {
  investigation_guidance: `
# Forensic Investigation Framework

## Initial Assessment
1. Review data completeness and quality
2. Identify period under investigation
3. Establish materiality thresholds
4. Document scope limitations

## Transaction Analysis Approach
- Examine round dollar transactions for estimation patterns
- Review weekend/holiday activity for backdating
- Identify duplicate payments
- Analyze period-end concentrations

## Red Flag Categories
- Timing anomalies
- Amount patterns
- Relationship irregularities
- Document inconsistencies
- Control override indicators

## Evidence Standards
- Every finding requires evidence_refs
- Document counter-hypotheses
- Maintain chain of custody
- Preserve source data integrity
`,

  round_dollar_analysis: `
# Round Dollar Analysis

Round dollar amounts may indicate:
- Estimated rather than actual transactions
- Fabricated invoices
- Kickback arrangements
- Padding schemes

Investigation steps:
1. Filter transactions ending in 000 or 00
2. Group by similar amounts
3. Analyze vendor/timing patterns
4. Compare to legitimate business reasons
5. Document exceptions and anomalies
`,

  duplicate_detection: `
# Duplicate Transaction Detection

Duplicate detection criteria:
- Same date and amount
- Same vendor/payee
- Similar description
- Sequential reference numbers

False positive considerations:
- Legitimate recurring payments
- Split shipments
- Multiple invoices same day
- Installment payments

Validation steps:
1. Review supporting documentation
2. Verify unique invoice numbers
3. Confirm goods/services received
4. Check approval signatures
`,

  vendor_fraud_indicators: `
# Vendor Fraud Red Flags

Shell company indicators:
- PO Box only address
- Recently incorporated
- No web presence
- Generic company name
- Single employee/officer

Payment pattern indicators:
- Payments just below approval limits
- Round dollar amounts
- Increasing payment frequency
- Payments to dormant vendors
- Rush payment requests

Relationship indicators:
- Employee-vendor address match
- Same bank account as employee
- Vendor owned by employee relative
- No competitive bidding
`,

  journal_entry_review: `
# Journal Entry Analysis

High-risk entry characteristics:
- Period-end entries
- Manual/non-standard entries
- Round amounts
- Unusual account combinations
- Missing descriptions
- Single user entries

Revenue recognition risks:
- Revenue debits (reversals)
- Bill-and-hold entries
- Channel stuffing patterns
- Premature revenue recognition

Expense manipulation:
- Expense credits (reversals)
- Capitalization of expenses
- Reserve releases
- Accrual manipulations
`,

  findings_template: `
# Finding Documentation Template

## Required Elements
- Title: Clear, specific description
- Category: Classification for analysis
- Severity: critical/high/medium/low/info
- Confidence: 0-1 based on evidence strength
- Rationale: Why this is significant

## Evidence Requirements
- Specific transaction/entry references
- Source file and row citations
- Hash verification if available
- Chain of custody documentation

## Counter-Hypotheses
- Document alternative explanations
- Assess likelihood of each
- Note evidence for/against
- Identify additional testing needed

## Financial Impact
- Low estimate (conservative)
- High estimate (maximum exposure)
- Best estimate (most likely)
- Methodology explanation
`,
};

export function getPrompt(key: keyof typeof FORENSIC_PROMPTS): string {
  return FORENSIC_PROMPTS[key];
}

export function formatFindingPrompt(finding: {
  title: string;
  description: string;
  evidence_count: number;
}): string {
  return `
Analyze the following forensic finding:

Title: ${finding.title}
Description: ${finding.description}
Evidence Items: ${finding.evidence_count}

Please evaluate:
1. Severity assessment (critical/high/medium/low)
2. Confidence level based on evidence
3. Potential counter-hypotheses
4. Recommended follow-up actions
5. Financial impact estimation methodology
`;
}
