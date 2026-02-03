/**
 * IRS ADVANCED DEFENSE MODULES
 *
 * This file contains additional specialized modules for IRS defense:
 * 1. Appeals Protest Generator
 * 2. Criminal Exposure Risk Detector
 * 3. Penalty Reduction Optimizer
 * 4. IRS Transcript Analyzer
 * 5. Audit Defense Strategy Engine
 * 6. Offer in Compromise Builder
 * 7. Evidence Packaging System
 *
 * TRIGGER COMMANDS:
 * - /appeals-protest
 * - /criminal-risk
 * - /penalty-optimizer
 * - /transcript-analysis
 * - /audit-defense
 * - /oic-builder
 * - /evidence-package
 */

// ============================================================================
// 1. APPEALS PROTEST GENERATOR
// ============================================================================

export type IssueType = 'audit' | 'sfr' | 'penalty' | 'collection' | 'disallowance' | 'fraud_penalty';

export interface AppealsProtestInput {
  taxpayer_name: string;
  taxpayer_ssn_last4?: string;
  issue_type: IssueType;
  tax_years: string[];
  amount_in_dispute: number;
  irs_determination_summary: string;
  taxpayer_arguments: string[];
  evidence_available: string[];
  prior_contact_with_irs: boolean;
  settlement_authority_desired: boolean;
}

export interface AppealsProtestOutput {
  formal_protest_letter: string;
  legal_argument_section: string;
  settlement_strategy: {
    hazards_of_litigation: string;
    recommended_position: 'full_concession_irs' | 'partial_settlement' | 'full_contest' | 'litigation';
    justification: string;
  };
  timeline: {
    phase: string;
    timeframe: string;
    actions: string[];
  }[];
  risk_analysis: {
    success_likelihood: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

export const APPEALS_LEGAL_FRAMEWORK = {
  CDP_APPEALS: {
    sections: ['IRC § 6320', 'IRC § 6330'],
    title: 'Collection Due Process Appeals',
    deadline: '30 days from notice',
  },
  AUDIT_APPEALS: {
    section: 'IRM 8.6',
    title: 'Examination Appeals',
    deadline: '30 days from 30-day letter',
  },
  PROTEST_REQUIREMENTS: {
    section: 'Treas. Reg. § 601.106',
    required_elements: [
      'Taxpayer name, address, SSN',
      'Date and symbols from IRS letter',
      'Tax years involved',
      'Statement of disputed issues',
      'Statement of facts supporting position',
      'Statement of law supporting position',
      'Penalties of perjury statement',
      'Signature',
    ],
  },
};

export function generateAppealsProtest(input: AppealsProtestInput): AppealsProtestOutput {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Determine if small case or formal protest needed
  const isSmallCase = input.amount_in_dispute <= 25000;

  const formalProtestLetter = `${today}

Internal Revenue Service
Office of Appeals
[ADDRESS FROM IRS CORRESPONDENCE]

Re: FORMAL PROTEST
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years.join(', ')}
    Amount in Dispute: $${input.amount_in_dispute.toLocaleString()}
    Issue: ${input.issue_type.replace('_', ' ').toUpperCase()}

Dear Appeals Officer:

Pursuant to ${input.issue_type === 'collection' ? 'IRC §§ 6320/6330' : 'Treasury Regulation § 601.106'}, the undersigned taxpayer hereby submits this formal protest of the IRS determination dated [DATE OF IRS LETTER].

I. STATEMENT OF DISPUTED ISSUES

The taxpayer disputes the following:

${input.irs_determination_summary}

Total amount in controversy: $${input.amount_in_dispute.toLocaleString()}

II. STATEMENT OF FACTS

The following facts are relevant to this matter:

${input.taxpayer_arguments.map((arg, i) => `${i + 1}. ${arg}`).join('\n\n')}

III. STATEMENT OF LAW

The taxpayer's position is supported by the following legal authorities:

[LEGAL AUTHORITIES TO BE INSERTED BASED ON ISSUE TYPE]

For ${input.issue_type} matters, the following provisions apply:
${input.issue_type === 'audit' ? '• IRC § 7491 - Burden of proof shifts to IRS when taxpayer maintains records\n• IRC § 6001 - Recordkeeping requirements\n• Cohan v. Commissioner - Estimation of expenses' : ''}
${input.issue_type === 'penalty' ? '• IRC § 6651 - Reasonable cause exception\n• IRC § 6664 - Reasonable cause and good faith\n• IRM 20.1.1.3 - Penalty administration' : ''}
${input.issue_type === 'collection' ? '• IRC § 6330 - CDP hearing rights\n• IRC § 6343 - Levy release for hardship\n• IRM 5.1.9 - Collection alternatives' : ''}

IV. ARGUMENT

${input.taxpayer_arguments.map((arg, i) => `
Argument ${i + 1}:
${arg}

Legal Support: [CITE APPLICABLE LAW]
Evidence: ${input.evidence_available[i] || 'Documentation attached'}
`).join('\n')}

V. RELIEF REQUESTED

The taxpayer respectfully requests that the Office of Appeals:

1. Reverse/reduce the proposed adjustment of $${input.amount_in_dispute.toLocaleString()}
2. Abate any associated penalties
3. [Additional relief as applicable]

VI. PENALTIES OF PERJURY STATEMENT

Under penalties of perjury, I declare that the facts presented in this protest and any accompanying documents are true, correct, and complete to the best of my knowledge and belief.

VII. CONFERENCE REQUEST

The taxpayer requests ${input.settlement_authority_desired ? 'a conference with an Appeals Officer who has full settlement authority' : 'an Appeals conference'}.

Preferred method: ☐ In-person ☐ Telephone ☐ Video conference

Respectfully submitted,


_________________________
${input.taxpayer_name}
Date: ${today}

Enclosures:
${input.evidence_available.map(e => `- ${e}`).join('\n')}
- Copy of IRS determination letter
- Supporting documentation`;

  const legalArgumentSection = `
## LEGAL ARGUMENT ANALYSIS

### Issue: ${input.issue_type.replace('_', ' ').toUpperCase()}

#### Taxpayer Position
${input.taxpayer_arguments.join('\n\n')}

#### Legal Authorities

**Primary Authority:**
${input.issue_type === 'audit' ? `
- IRC § 6001: Taxpayer met recordkeeping requirements
- IRC § 7491: Burden of proof shifts where records maintained
- Cohan v. Commissioner, 39 F.2d 540 (2d Cir. 1930): Estimation permitted
` : input.issue_type === 'penalty' ? `
- IRC § 6651(a): Penalty provisions
- IRC § 6664(c): Reasonable cause and good faith defense
- IRM 20.1.1.3: Reasonable cause factors
- First Time Abatement policy (IRM 20.1.1.3.6.1)
` : input.issue_type === 'collection' ? `
- IRC § 6330: Collection Due Process rights
- IRC § 6343: Levy release authority
- IRC § 7122: Offer in Compromise
` : `
- [Applicable IRC sections]
- [Relevant Treasury Regulations]
- [IRM provisions]
`}

#### Evidence Summary
${input.evidence_available.map((e, i) => `${i + 1}. ${e}`).join('\n')}

#### Strength Assessment
${input.evidence_available.length >= 3 ? 'Strong' : input.evidence_available.length >= 1 ? 'Moderate' : 'Weak'} evidentiary support
`;

  // Settlement strategy
  const hasStrongEvidence = input.evidence_available.length >= 3;
  const hasMultipleArguments = input.taxpayer_arguments.length >= 2;

  let recommendedPosition: 'full_concession_irs' | 'partial_settlement' | 'full_contest' | 'litigation';
  let justification: string;

  if (hasStrongEvidence && hasMultipleArguments) {
    recommendedPosition = 'full_contest';
    justification = 'Strong evidence and legal arguments support full contest of IRS position';
  } else if (hasStrongEvidence || hasMultipleArguments) {
    recommendedPosition = 'partial_settlement';
    justification = 'Mixed strength suggests negotiating partial concession';
  } else {
    recommendedPosition = 'partial_settlement';
    justification = 'Limited evidence may warrant settlement to avoid litigation costs';
  }

  return {
    formal_protest_letter: formalProtestLetter,
    legal_argument_section: legalArgumentSection,
    settlement_strategy: {
      hazards_of_litigation: `IRS hazards: ${hasStrongEvidence ? '40-60%' : '20-40%'}; Taxpayer hazards: ${hasStrongEvidence ? '40-60%' : '60-80%'}`,
      recommended_position: recommendedPosition,
      justification,
    },
    timeline: [
      {
        phase: 'Protest Submission',
        timeframe: '0-30 days',
        actions: ['Submit formal protest', 'Organize evidence', 'Prepare legal arguments'],
      },
      {
        phase: 'Appeals Conference',
        timeframe: '3-6 months',
        actions: ['Attend Appeals conference', 'Present evidence', 'Negotiate settlement'],
      },
      {
        phase: 'Resolution',
        timeframe: '6-12 months',
        actions: ['Receive Appeals determination', 'Accept or proceed to Tax Court'],
      },
    ],
    risk_analysis: {
      success_likelihood: hasStrongEvidence && hasMultipleArguments ? 'high' : hasStrongEvidence || hasMultipleArguments ? 'medium' : 'low',
      factors: [
        hasStrongEvidence ? 'Strong documentary evidence' : 'Limited documentary support',
        hasMultipleArguments ? 'Multiple valid legal arguments' : 'Limited legal arguments',
        input.prior_contact_with_irs ? 'Prior IRS contact may affect credibility' : 'No adverse prior history',
      ],
    },
  };
}

// ============================================================================
// 2. CRIMINAL EXPOSURE RISK DETECTOR
// ============================================================================

export type CriminalRiskLevel = 'low' | 'moderate' | 'elevated' | 'severe';

export interface CriminalRiskInput {
  years_unfiled: number;
  income_amount: number;
  income_sources: ('cash' | 'crypto' | 'offshore' | 'w2' | '1099' | 'illegal')[];
  false_documents_used: boolean;
  unreported_foreign_accounts: boolean;
  prior_irs_contact: boolean;
  false_statements_to_irs: boolean;
  pattern_of_noncompliance: 'isolated' | 'repeated';
  destruction_of_records: boolean;
  use_of_shell_entities: boolean;
  tax_loss_estimate: number;
  affirmative_acts_of_concealment: boolean;
}

export interface CriminalRiskOutput {
  risk_level: CriminalRiskLevel;
  risk_score: number;
  risk_factors: {
    factor: string;
    weight: number;
    present: boolean;
    legal_reference: string;
  }[];
  civil_vs_criminal_analysis: string;
  defensive_strategy: string[];
  risk_escalation_timeline: string;
  red_flags: string[];
  immediate_recommendations: string[];
}

export const CRIMINAL_LEGAL_FRAMEWORK = {
  IRC_7201: {
    section: 'IRC § 7201',
    title: 'Tax Evasion',
    elements: ['Tax deficiency', 'Affirmative act of evasion', 'Willfulness'],
    penalty: 'Felony: Up to 5 years, $250,000 fine ($500,000 corp)',
  },
  IRC_7203: {
    section: 'IRC § 7203',
    title: 'Willful Failure to File',
    elements: ['Required to file', 'Willfully failed', 'At required time'],
    penalty: 'Misdemeanor: Up to 1 year, $25,000 fine',
  },
  IRC_7206: {
    section: 'IRC § 7206',
    title: 'Fraud and False Statements',
    elements: ['False material statement', 'Under penalties of perjury', 'Willfully'],
    penalty: 'Felony: Up to 3 years, $250,000 fine',
  },
  IRC_7212: {
    section: 'IRC § 7212',
    title: 'Obstruction',
    elements: ['Corruptly obstructed', 'IRS administration of tax law'],
    penalty: 'Felony: Up to 3 years',
  },
};

export function assessCriminalRisk(input: CriminalRiskInput): CriminalRiskOutput {
  let riskScore = 0;
  const riskFactors: CriminalRiskOutput['risk_factors'] = [];
  const redFlags: string[] = [];
  const recommendations: string[] = [];

  // Factor: Years Unfiled
  const yearsFactor = input.years_unfiled >= 6 ? 15 : input.years_unfiled >= 3 ? 10 : 5;
  riskScore += yearsFactor;
  riskFactors.push({
    factor: `${input.years_unfiled} years unfiled`,
    weight: yearsFactor,
    present: input.years_unfiled > 0,
    legal_reference: 'IRC § 7203',
  });
  if (input.years_unfiled >= 3) {
    redFlags.push('Pattern of non-filing exceeds 3 years');
  }

  // Factor: False Documents
  if (input.false_documents_used) {
    riskScore += 25;
    riskFactors.push({
      factor: 'False documents used',
      weight: 25,
      present: true,
      legal_reference: 'IRC § 7206',
    });
    redFlags.push('CRITICAL: Use of false documents is a felony indicator');
  }

  // Factor: False Statements to IRS
  if (input.false_statements_to_irs) {
    riskScore += 20;
    riskFactors.push({
      factor: 'False statements to IRS',
      weight: 20,
      present: true,
      legal_reference: 'IRC § 7206(1)',
    });
    redFlags.push('CRITICAL: False statements under penalty of perjury');
  }

  // Factor: Unreported Foreign Accounts
  if (input.unreported_foreign_accounts) {
    riskScore += 20;
    riskFactors.push({
      factor: 'Unreported foreign accounts',
      weight: 20,
      present: true,
      legal_reference: 'FBAR / 31 USC § 5321',
    });
    redFlags.push('Foreign account non-disclosure carries severe penalties');
    recommendations.push('Consider Streamlined Filing Compliance or Voluntary Disclosure');
  }

  // Factor: Affirmative Acts of Concealment
  if (input.affirmative_acts_of_concealment) {
    riskScore += 25;
    riskFactors.push({
      factor: 'Affirmative acts of concealment',
      weight: 25,
      present: true,
      legal_reference: 'IRC § 7201 (evasion element)',
    });
    redFlags.push('CRITICAL: Concealment acts transform civil matter to criminal');
  }

  // Factor: Destruction of Records
  if (input.destruction_of_records) {
    riskScore += 20;
    riskFactors.push({
      factor: 'Destruction of records',
      weight: 20,
      present: true,
      legal_reference: 'IRC § 7212 (obstruction)',
    });
    redFlags.push('Record destruction may constitute obstruction');
  }

  // Factor: Shell Entities
  if (input.use_of_shell_entities) {
    riskScore += 15;
    riskFactors.push({
      factor: 'Use of shell entities',
      weight: 15,
      present: true,
      legal_reference: 'Badges of fraud',
    });
    redFlags.push('Shell entities suggest intent to conceal');
  }

  // Factor: Cash/Crypto/Offshore Income
  const highRiskIncome = input.income_sources.filter(s =>
    ['cash', 'crypto', 'offshore', 'illegal'].includes(s)
  );
  if (highRiskIncome.length > 0) {
    const incomeWeight = highRiskIncome.includes('illegal') ? 25 : 10;
    riskScore += incomeWeight;
    riskFactors.push({
      factor: `High-risk income sources: ${highRiskIncome.join(', ')}`,
      weight: incomeWeight,
      present: true,
      legal_reference: 'Various',
    });
    if (highRiskIncome.includes('illegal')) {
      redFlags.push('CRITICAL: Illegal source income dramatically increases criminal exposure');
    }
  }

  // Factor: Tax Loss Amount
  if (input.tax_loss_estimate >= 100000) {
    riskScore += 15;
    riskFactors.push({
      factor: `High tax loss: $${input.tax_loss_estimate.toLocaleString()}`,
      weight: 15,
      present: true,
      legal_reference: 'DOJ prosecution guidelines',
    });
    redFlags.push('Tax loss exceeds DOJ prosecution threshold');
  }

  // Factor: Pattern
  if (input.pattern_of_noncompliance === 'repeated') {
    riskScore += 10;
    riskFactors.push({
      factor: 'Repeated pattern of noncompliance',
      weight: 10,
      present: true,
      legal_reference: 'Willfulness indicator',
    });
  }

  // Determine risk level
  let riskLevel: CriminalRiskLevel;
  if (riskScore >= 60) riskLevel = 'severe';
  else if (riskScore >= 40) riskLevel = 'elevated';
  else if (riskScore >= 20) riskLevel = 'moderate';
  else riskLevel = 'low';

  // Civil vs Criminal Analysis
  const civilVsCriminalAnalysis = `
## CIVIL VS. CRIMINAL DISTINCTION

### When Cases Remain Civil Only:
- Simple failure to file without badges of fraud
- Good faith errors in reporting
- Reliance on professional advice
- No affirmative acts of concealment
- Cooperation with IRS

### When Cases May Become Criminal:
${input.affirmative_acts_of_concealment ? '✗ Affirmative acts of concealment PRESENT\n' : '✓ No affirmative acts of concealment\n'}
${input.false_documents_used ? '✗ False documents USED\n' : '✓ No false documents\n'}
${input.false_statements_to_irs ? '✗ False statements to IRS MADE\n' : '✓ No false statements\n'}
${input.destruction_of_records ? '✗ Record destruction OCCURRED\n' : '✓ Records intact\n'}
${input.tax_loss_estimate >= 100000 ? '✗ Tax loss exceeds prosecution threshold\n' : '✓ Tax loss below threshold\n'}

### Current Assessment:
This case appears ${riskLevel === 'low' || riskLevel === 'moderate' ? 'LIKELY CIVIL ONLY' : 'AT RISK OF CRIMINAL REFERRAL'}
based on the factors present.
`;

  // Defensive Strategy
  const defensiveStrategy = [
    'IMMEDIATE: Do not make any additional statements to IRS without counsel',
    'IMMEDIATE: Preserve all records - do not destroy anything',
    riskLevel === 'severe' || riskLevel === 'elevated' ?
      'CRITICAL: Consult criminal tax defense attorney before taking any action' :
      'RECOMMENDED: Consult tax attorney before voluntary disclosure',
    'Consider voluntary compliance to demonstrate lack of willfulness',
    input.unreported_foreign_accounts ?
      'Evaluate Streamlined Filing Compliance Procedures or IRS Voluntary Disclosure' : null,
    'Avoid communications that could be used to show willfulness',
    'Document any good faith basis for positions taken',
  ].filter(Boolean) as string[];

  // Risk Escalation Timeline
  const riskEscalationTimeline = `
## CIVIL TO CRIMINAL ESCALATION PATH

### Stage 1: Civil Non-Filer Investigation (IRM 5.1.11)
- IRS identifies non-filing through W-2/1099 matching
- CP59/CP515/CP516 notices sent
- Delinquent Return Investigation opened

### Stage 2: Examination Referral
- If badges of fraud identified during civil exam
- Case referred to Fraud Technical Advisor
- Additional scrutiny of transactions

### Stage 3: Criminal Investigation (CI) Referral
- Fraud indicators documented
- Referral to IRS Criminal Investigation Division
- Administrative investigation begins

### Stage 4: Grand Jury / DOJ Referral
- CI recommends prosecution
- DOJ Tax Division reviews
- Grand jury convened if approved

### Current Position: ${riskLevel === 'low' ? 'Stage 1 - Civil matter likely' :
  riskLevel === 'moderate' ? 'Stage 1-2 - Civil with monitoring' :
  riskLevel === 'elevated' ? 'Stage 2-3 - Elevated scrutiny expected' :
  'Stage 3+ - Criminal referral possible'}
`;

  // Recommendations
  if (riskLevel === 'severe') {
    recommendations.unshift('URGENT: Retain criminal tax defense counsel BEFORE any IRS contact');
    recommendations.push('Do NOT participate in voluntary disclosure without counsel');
    recommendations.push('Evaluate Fifth Amendment implications');
  } else if (riskLevel === 'elevated') {
    recommendations.unshift('STRONGLY RECOMMENDED: Consult criminal tax attorney');
    recommendations.push('Consider controlled voluntary compliance approach');
  } else {
    recommendations.push('Pursue voluntary compliance promptly');
    recommendations.push('File all missing returns with accurate information');
    recommendations.push('Document reasonable cause for any failures');
  }

  return {
    risk_level: riskLevel,
    risk_score: riskScore,
    risk_factors: riskFactors,
    civil_vs_criminal_analysis: civilVsCriminalAnalysis,
    defensive_strategy: defensiveStrategy,
    risk_escalation_timeline: riskEscalationTimeline,
    red_flags: redFlags,
    immediate_recommendations: recommendations,
  };
}

// ============================================================================
// 3. PENALTY REDUCTION OPTIMIZER
// ============================================================================

export type PenaltyType = 'failure_to_file' | 'failure_to_pay' | 'accuracy' | 'fraud' | 'estimated_tax' | 'information_return';

export interface PenaltyReductionInput {
  penalty_types: PenaltyType[];
  tax_years: string[];
  penalty_amounts: Record<string, number>;
  prior_penalty_history: 'clean' | 'one_prior' | 'multiple_prior';
  medical_issues: boolean;
  natural_disaster: boolean;
  records_lost: boolean;
  reliance_on_professional: boolean;
  financial_hardship: boolean;
  mental_health: boolean;
  first_time_offender: boolean;
  other_circumstances?: string;
}

export interface PenaltyReductionOutput {
  eligibility_matrix: {
    abatement_type: string;
    eligible: boolean;
    reason: string;
    strength: 'strong' | 'moderate' | 'weak';
  }[];
  best_defense_type: string;
  argument_generator: string;
  reduction_estimate: {
    total_penalties: number;
    potential_reduction: number;
    reduction_percentage: number;
  };
  submission_strategy: string;
  timeline: { phase: string; timeframe: string; actions: string[] }[];
}

export function optimizePenaltyReduction(input: PenaltyReductionInput): PenaltyReductionOutput {
  const totalPenalties = Object.values(input.penalty_amounts).reduce((a, b) => a + b, 0);
  const eligibilityMatrix: PenaltyReductionOutput['eligibility_matrix'] = [];

  // First Time Abatement
  const ftaEligible = input.prior_penalty_history === 'clean' && input.first_time_offender;
  eligibilityMatrix.push({
    abatement_type: 'First Time Penalty Abatement (FTA)',
    eligible: ftaEligible,
    reason: ftaEligible ?
      'Clean compliance history for 3 prior years qualifies for administrative relief' :
      'Prior penalties or compliance issues disqualify from FTA',
    strength: ftaEligible ? 'strong' : 'weak',
  });

  // Reasonable Cause - Medical
  eligibilityMatrix.push({
    abatement_type: 'Reasonable Cause - Medical',
    eligible: input.medical_issues,
    reason: input.medical_issues ?
      'Serious illness can establish reasonable cause per IRM 20.1.1.3.2.2' :
      'No medical issues documented',
    strength: input.medical_issues ? 'strong' : 'weak',
  });

  // Reasonable Cause - Natural Disaster
  eligibilityMatrix.push({
    abatement_type: 'Reasonable Cause - Natural Disaster',
    eligible: input.natural_disaster,
    reason: input.natural_disaster ?
      'Federally declared disaster supports reasonable cause' :
      'No natural disaster circumstances',
    strength: input.natural_disaster ? 'strong' : 'weak',
  });

  // Reasonable Cause - Records Lost
  eligibilityMatrix.push({
    abatement_type: 'Reasonable Cause - Lost Records',
    eligible: input.records_lost,
    reason: input.records_lost ?
      'Records destroyed through no fault of taxpayer' :
      'Records were available',
    strength: input.records_lost ? 'moderate' : 'weak',
  });

  // Reasonable Cause - Reliance on Professional
  eligibilityMatrix.push({
    abatement_type: 'Reasonable Cause - Reliance on Advisor',
    eligible: input.reliance_on_professional,
    reason: input.reliance_on_professional ?
      'Reasonable reliance on competent tax professional' :
      'Did not rely on professional advice',
    strength: input.reliance_on_professional ? 'moderate' : 'weak',
  });

  // Reasonable Cause - Mental Health
  eligibilityMatrix.push({
    abatement_type: 'Reasonable Cause - Mental Health',
    eligible: input.mental_health,
    reason: input.mental_health ?
      'Mental health condition affected ability to comply' :
      'No mental health issues documented',
    strength: input.mental_health ? 'moderate' : 'weak',
  });

  // Determine best defense
  const strongDefenses = eligibilityMatrix.filter(e => e.eligible && e.strength === 'strong');
  const moderateDefenses = eligibilityMatrix.filter(e => e.eligible && e.strength === 'moderate');

  let bestDefenseType: string;
  if (ftaEligible) {
    bestDefenseType = 'First Time Penalty Abatement (administrative - no reasonable cause required)';
  } else if (strongDefenses.length > 0) {
    bestDefenseType = `Reasonable Cause: ${strongDefenses.map(d => d.abatement_type).join(', ')}`;
  } else if (moderateDefenses.length > 0) {
    bestDefenseType = `Reasonable Cause: ${moderateDefenses.map(d => d.abatement_type).join(', ')}`;
  } else {
    bestDefenseType = 'Limited options - consider appeals or administrative waiver request';
  }

  // Estimate reduction
  const eligibleDefenses = eligibilityMatrix.filter(e => e.eligible);
  let reductionPercentage = 0;
  if (ftaEligible) reductionPercentage = 100;
  else if (strongDefenses.length >= 2) reductionPercentage = 80;
  else if (strongDefenses.length >= 1) reductionPercentage = 60;
  else if (moderateDefenses.length >= 2) reductionPercentage = 40;
  else if (moderateDefenses.length >= 1) reductionPercentage = 25;
  else reductionPercentage = 10;

  // Generate argument
  const argumentGenerator = `
## PENALTY ABATEMENT ARGUMENT

### Statement of Facts

The taxpayer, ${input.first_time_offender ? 'who has never previously been assessed penalties' : ''}, failed to [file/pay] timely for tax year(s) ${input.tax_years.join(', ')} due to the following circumstances:

${input.medical_issues ? '1. The taxpayer experienced serious medical issues that prevented compliance.\n' : ''}
${input.natural_disaster ? '2. The taxpayer was affected by a natural disaster.\n' : ''}
${input.records_lost ? '3. The taxpayer\'s records were lost/destroyed through no fault of their own.\n' : ''}
${input.reliance_on_professional ? '4. The taxpayer reasonably relied on a tax professional who failed to perform.\n' : ''}
${input.mental_health ? '5. The taxpayer suffered from mental health conditions affecting their ability to comply.\n' : ''}
${input.financial_hardship ? '6. The taxpayer experienced severe financial hardship.\n' : ''}
${input.other_circumstances ? `7. ${input.other_circumstances}\n` : ''}

### Statement of Law

${ftaEligible ? `
**First Time Penalty Abatement (IRM 20.1.1.3.6.1)**
The taxpayer qualifies for First Time Penalty Abatement because:
- The taxpayer has not been required to file returns in the prior 3 years, OR
- The taxpayer has no penalties assessed in the prior 3 years
- All currently required returns have been filed
- Any balance due is paid or in an approved payment arrangement
` : ''}

**Reasonable Cause (IRM 20.1.1.3)**
Under IRC § 6651(a), penalties shall not apply if the failure is due to reasonable cause and not willful neglect. The IRM provides that reasonable cause exists when the taxpayer exercised ordinary business care and prudence but nevertheless failed to comply.

### Application

The circumstances described above demonstrate that the taxpayer's failure was not due to willful neglect. [SPECIFIC APPLICATION TO EACH FACTOR]

### Relief Requested

Based on the foregoing, the taxpayer respectfully requests abatement of all penalties assessed for tax year(s) ${input.tax_years.join(', ')}, totaling $${totalPenalties.toLocaleString()}.
`;

  return {
    eligibility_matrix: eligibilityMatrix,
    best_defense_type: bestDefenseType,
    argument_generator: argumentGenerator,
    reduction_estimate: {
      total_penalties: totalPenalties,
      potential_reduction: Math.round(totalPenalties * reductionPercentage / 100),
      reduction_percentage: reductionPercentage,
    },
    submission_strategy: ftaEligible ?
      'Request FTA by phone (1-800-829-1040) or submit Form 843' :
      'Submit written reasonable cause statement with Form 843 and supporting documentation',
    timeline: [
      {
        phase: 'Preparation',
        timeframe: '0-30 days',
        actions: ['Gather supporting documentation', 'Prepare written statement', 'Complete Form 843'],
      },
      {
        phase: 'Submission',
        timeframe: '30-60 days',
        actions: ['Submit abatement request', 'Fax/mail to appropriate IRS unit', 'Retain proof of submission'],
      },
      {
        phase: 'IRS Response',
        timeframe: '3-6 months',
        actions: ['Monitor for IRS response', 'Provide additional info if requested', 'Appeal if denied'],
      },
    ],
  };
}

// ============================================================================
// 4. IRS TRANSCRIPT ANALYZER
// ============================================================================

export interface TranscriptAnalysisInput {
  transcript_type: 'account' | 'wage_income' | 'record_of_account' | 'return';
  tax_year: string;
  transaction_codes: string[];
  collection_statute_date?: string;
  current_balance?: number;
}

export const TRANSACTION_CODES = {
  '150': { meaning: 'Return Filed', stage: 'Assessment', significance: 'Tax return posted to account' },
  '290': { meaning: 'Additional Tax Assessed', stage: 'Assessment', significance: 'IRS made adjustment increasing tax' },
  '291': { meaning: 'Abatement of Prior Tax', stage: 'Assessment', significance: 'IRS reduced previously assessed tax' },
  '300': { meaning: 'Additional Tax Assessed by Exam', stage: 'Examination', significance: 'Audit resulted in additional tax' },
  '420': { meaning: 'Examination Started', stage: 'Examination', significance: 'Audit opened on return' },
  '421': { meaning: 'Examination Closed', stage: 'Examination', significance: 'Audit completed' },
  '424': { meaning: 'Examination Request', stage: 'Examination', significance: 'Case referred for examination' },
  '520': { meaning: 'IRS Litigation', stage: 'Litigation', significance: 'Collection suspended for litigation' },
  '521': { meaning: 'Litigation Resolved', stage: 'Litigation', significance: 'Litigation hold removed' },
  '530': { meaning: 'Currently Not Collectible', stage: 'Collection', significance: 'Account placed in CNC status' },
  '531': { meaning: 'CNC Reinstated', stage: 'Collection', significance: 'Collection resumed from CNC' },
  '560': { meaning: 'Installment Agreement', stage: 'Collection', significance: 'IA established' },
  '582': { meaning: 'Federal Tax Lien Filed', stage: 'Collection', significance: 'Lien recorded against taxpayer' },
  '583': { meaning: 'Lien Released', stage: 'Collection', significance: 'Tax lien released' },
  '670': { meaning: 'Payment Posted', stage: 'Payment', significance: 'Payment credited to account' },
  '680': { meaning: 'Designated Payment', stage: 'Payment', significance: 'Payment designated to specific liability' },
  '700': { meaning: 'Credit to Account', stage: 'Credit', significance: 'Credit applied from various sources' },
  '706': { meaning: 'Refund Issued', stage: 'Refund', significance: 'Refund check issued' },
  '846': { meaning: 'Refund Scheduled', stage: 'Refund', significance: 'Refund approved and scheduled' },
  '898': { meaning: 'Refund Offset', stage: 'Offset', significance: 'Refund applied to other debt' },
  '971': { meaning: 'Notice Issued', stage: 'Notice', significance: 'IRS issued notice to taxpayer' },
  '976': { meaning: 'Duplicate Return Filed', stage: 'Return', significance: 'Amended or duplicate return posted' },
};

export interface TranscriptAnalysisOutput {
  summary: string;
  code_interpretations: { code: string; interpretation: string; action_needed?: string }[];
  enforcement_stage: string;
  statute_analysis: string;
  strategy_recommendation: string[];
  risk_flags: string[];
}

export function analyzeTranscript(input: TranscriptAnalysisInput): TranscriptAnalysisOutput {
  const interpretations: TranscriptAnalysisOutput['code_interpretations'] = [];
  const riskFlags: string[] = [];
  let enforcementStage = 'Unknown';

  for (const code of input.transaction_codes) {
    const codeInfo = TRANSACTION_CODES[code as keyof typeof TRANSACTION_CODES];
    if (codeInfo) {
      interpretations.push({
        code,
        interpretation: `${codeInfo.meaning} - ${codeInfo.significance}`,
        action_needed: getActionForCode(code),
      });

      // Determine enforcement stage
      if (codeInfo.stage === 'Collection') {
        enforcementStage = 'Collections';
        if (code === '582') riskFlags.push('Federal Tax Lien Filed - affects credit');
        if (code === '530') enforcementStage = 'Currently Not Collectible';
      } else if (codeInfo.stage === 'Examination' && code === '420') {
        enforcementStage = 'Under Examination';
        riskFlags.push('Active audit - respond to all IRS requests promptly');
      } else if (codeInfo.stage === 'Litigation') {
        enforcementStage = 'Litigation/Tax Court';
      }
    } else {
      interpretations.push({
        code,
        interpretation: 'Unknown code - may require further research',
      });
    }
  }

  // Statute analysis
  let statuteAnalysis = 'Unable to determine collection statute.';
  if (input.collection_statute_date) {
    const csed = new Date(input.collection_statute_date);
    const today = new Date();
    const daysRemaining = Math.floor((csed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining > 0) {
      statuteAnalysis = `Collection Statute Expiration Date (CSED): ${input.collection_statute_date}\n` +
        `Time remaining: ${Math.floor(daysRemaining / 365)} years, ${daysRemaining % 365} days\n` +
        `After this date, IRS can no longer collect the debt.`;
    } else {
      statuteAnalysis = `Collection statute may have expired on ${input.collection_statute_date}.\n` +
        `Verify with IRS before making any payments on expired debt.`;
      riskFlags.push('Collection statute may have expired - verify before paying');
    }
  }

  // Strategy recommendations
  const strategies: string[] = [];
  if (input.transaction_codes.includes('420')) {
    strategies.push('Audit in progress - cooperate but control information flow');
    strategies.push('Consider engaging enrolled agent or tax attorney for audit representation');
  }
  if (input.transaction_codes.includes('582')) {
    strategies.push('Lien filed - consider requesting lien withdrawal after resolution');
    strategies.push('Lien affects credit and property sales - prioritize resolution');
  }
  if (input.transaction_codes.includes('530')) {
    strategies.push('Account in CNC status - no payments required currently');
    strategies.push('Monitor for annual review and update financial information if requested');
  }
  if (input.current_balance && input.current_balance > 0) {
    strategies.push('Balance due exists - consider collection alternatives (IA, OIC, CNC)');
  }

  return {
    summary: `
## TRANSCRIPT SUMMARY - Tax Year ${input.tax_year}

**Transcript Type:** ${input.transcript_type.replace('_', ' ').toUpperCase()}
**Current Balance:** ${input.current_balance ? `$${input.current_balance.toLocaleString()}` : 'Unknown'}
**Transaction Codes Found:** ${input.transaction_codes.length}
**Enforcement Stage:** ${enforcementStage}
`,
    code_interpretations: interpretations,
    enforcement_stage: enforcementStage,
    statute_analysis: statuteAnalysis,
    strategy_recommendation: strategies,
    risk_flags: riskFlags,
  };
}

function getActionForCode(code: string): string | undefined {
  const actions: Record<string, string> = {
    '420': 'Respond to all audit requests; consider representation',
    '582': 'Consider lien withdrawal request after resolution',
    '530': 'Maintain records; respond to annual review requests',
    '560': 'Maintain installment payments; avoid default',
    '971': 'Review notice received; respond if action required',
  };
  return actions[code];
}

// ============================================================================
// 5. AUDIT DEFENSE STRATEGY ENGINE
// ============================================================================

export type AuditType = 'correspondence' | 'office' | 'field';

export interface AuditDefenseInput {
  audit_type: AuditType;
  issues_examined: ('income' | 'deductions' | 'credits' | 'crypto' | 'business' | 'foreign')[];
  documentation_status: 'complete' | 'partial' | 'missing';
  industry_type: string;
  prior_audit_history: 'none' | 'one_prior' | 'multiple' | 'repeat_issue';
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
}

export interface AuditDefenseOutput {
  strategy_plan: string;
  issue_defense_map: {
    issue: string;
    irs_position: string;
    defense_argument: string;
    evidence_required: string[];
  }[];
  idr_response_rules: string[];
  negotiation_strategy: string;
  timeline: { phase: string; timeframe: string; actions: string[] }[];
  risk_assessment: { adjustment_likelihood: string; factors: string[] };
}

export function buildAuditDefenseStrategy(input: AuditDefenseInput): AuditDefenseOutput {
  const issueDefenseMap = input.issues_examined.map(issue => ({
    issue: issue.toUpperCase(),
    irs_position: getIRSPosition(issue),
    defense_argument: getDefenseArgument(issue),
    evidence_required: getEvidenceRequired(issue),
  }));

  return {
    strategy_plan: `
## AUDIT DEFENSE STRATEGY PLAN

### Audit Type: ${input.audit_type.toUpperCase()}
### Issues Under Examination: ${input.issues_examined.join(', ')}
### Documentation Status: ${input.documentation_status.toUpperCase()}

### SCOPE CONTROL STRATEGY

1. **Limit Information Exposure**
   - Provide ONLY documents specifically requested
   - Do not volunteer additional information
   - Answer questions directly without elaboration

2. **Document Production Strategy**
   - Organize documents by issue
   - Provide copies, never originals
   - Create index of documents provided
   - Document what was provided and when

3. **Communication Protocol**
   - Designate single point of contact
   - All communication in writing when possible
   - Request all requests in writing
   - Document all verbal communications

### DEFENSE APPROACH: ${input.risk_tolerance.toUpperCase()}
${input.risk_tolerance === 'conservative' ?
  'Prioritize quick resolution; consider concessions on weak positions' :
  input.risk_tolerance === 'moderate' ?
  'Defend strong positions vigorously; negotiate weak positions' :
  'Contest all adjustments; prepare for potential Appeals/Tax Court'}
`,
    issue_defense_map: issueDefenseMap,
    idr_response_rules: [
      'Request clarification if IDR is vague or overbroad',
      'Respond within deadline but request extensions if needed',
      'Provide exactly what is requested - no more',
      'Object to irrelevant or overly burdensome requests',
      'Keep copies of all documents provided',
      'Create transmittal letter documenting what was provided',
    ],
    negotiation_strategy: `
### When to Concede
- Clear documentation gap with no reconstruction possible
- IRS position clearly supported by law
- Cost of contest exceeds potential benefit

### When to Contest
- Strong documentary support exists
- Legal authority supports taxpayer position
- Cohan rule applies for estimated expenses
- Prior court cases support position

### Recommended Approach
${input.documentation_status === 'complete' ? 'Strong defense recommended - documentation supports position' :
  input.documentation_status === 'partial' ? 'Selective defense - strong on documented items, consider Cohan for gaps' :
  'Focus on reconstruction and reasonable estimates under Cohan doctrine'}
`,
    timeline: [
      { phase: 'Organization', timeframe: '0-30 days', actions: ['Gather all records', 'Organize by issue', 'Identify gaps'] },
      { phase: 'Audit Meetings', timeframe: '30-90 days', actions: ['Attend scheduled meetings', 'Respond to IDRs', 'Present documentation'] },
      { phase: 'Report Stage', timeframe: '3-6 months', actions: ['Review proposed adjustments', 'Negotiate changes', 'Request manager conference'] },
      { phase: 'Appeals (if needed)', timeframe: '6-12 months', actions: ['File formal protest', 'Present to Appeals', 'Consider settlement'] },
    ],
    risk_assessment: {
      adjustment_likelihood: input.documentation_status === 'complete' ? 'Low' :
        input.documentation_status === 'partial' ? 'Moderate' : 'High',
      factors: [
        `Documentation: ${input.documentation_status}`,
        `Audit history: ${input.prior_audit_history}`,
        `Issues examined: ${input.issues_examined.length}`,
        `Industry: ${input.industry_type} (may have specific rules)`,
      ],
    },
  };
}

function getIRSPosition(issue: string): string {
  const positions: Record<string, string> = {
    income: 'All income must be reported; bank deposits presumed income unless explained',
    deductions: 'Deductions require substantiation per IRC § 6001',
    credits: 'Credits require documentation of eligibility',
    crypto: 'Virtual currency transactions are taxable events',
    business: 'Business expenses must be ordinary, necessary, and documented',
    foreign: 'Foreign income and accounts must be reported; FBAR/FATCA compliance required',
  };
  return positions[issue] || 'IRS position to be determined';
}

function getDefenseArgument(issue: string): string {
  const arguments_map: Record<string, string> = {
    income: 'Bank deposits include non-taxable items (transfers, loans, gifts); burden shifts to IRS per § 7491',
    deductions: 'Expenses properly substantiated per regulations; Cohan rule applies for estimated amounts',
    credits: 'All eligibility requirements met and documented',
    crypto: 'Basis properly calculated; losses offset gains; like-kind exchange (if applicable)',
    business: 'Expenses ordinary and necessary for business; proper documentation maintained',
    foreign: 'All foreign income reported; accounts disclosed; any failures were non-willful',
  };
  return arguments_map[issue] || 'Defense argument to be developed based on facts';
}

function getEvidenceRequired(issue: string): string[] {
  const evidence: Record<string, string[]> = {
    income: ['Bank statements', 'Loan documents', 'Gift letters', 'Transfer records'],
    deductions: ['Receipts', 'Canceled checks', 'Credit card statements', 'Mileage logs'],
    credits: ['Birth certificates', 'Residency proof', 'School records', 'Eligibility documentation'],
    crypto: ['Exchange records', 'Wallet history', 'Cost basis calculations', 'Transaction logs'],
    business: ['Receipts', 'Invoices', 'Business records', 'Mileage logs', 'Travel records'],
    foreign: ['FBAR filings', 'Foreign bank statements', 'Tax returns', 'Foreign tax paid'],
  };
  return evidence[issue] || ['Supporting documentation'];
}

// ============================================================================
// 6. OFFER IN COMPROMISE BUILDER
// ============================================================================

export interface OICInput {
  total_tax_debt: number;
  monthly_income: number;
  monthly_expenses: number;
  asset_equity: number;
  cash_on_hand: number;
  retirement_accounts: number;
  hardship_factors: string[];
  liability_dispute: boolean;
  future_income_stability: 'stable' | 'declining' | 'variable';
  months_remaining_csed: number;
}

export interface OICOutput {
  eligibility_assessment: {
    datc_eligible: boolean;
    datl_eligible: boolean;
    eta_eligible: boolean;
    reason: string;
  };
  rcp_calculation: {
    asset_equity: number;
    future_income: number;
    total_rcp: number;
    calculation_explanation: string;
  };
  offer_amount_strategy: {
    recommended_offer: number;
    lump_sum_amount: number;
    periodic_amount: number;
    recommendation: 'lump_sum' | 'periodic';
    justification: string;
  };
  hardship_narrative: string;
  document_checklist: string[];
  timeline: { phase: string; timeframe: string; actions: string[] }[];
  acceptance_likelihood: 'low' | 'moderate' | 'high';
}

export function buildOICStrategy(input: OICInput): OICOutput {
  // Calculate Reasonable Collection Potential (RCP)
  const netMonthlyIncome = Math.max(0, input.monthly_income - input.monthly_expenses);

  // Future income multiplier based on months remaining on CSED
  let futureIncomeMultiplier: number;
  if (input.months_remaining_csed <= 48) {
    futureIncomeMultiplier = 12; // Lump sum offer
  } else {
    futureIncomeMultiplier = 24; // Periodic offer uses 24 months
  }

  const futureIncome = netMonthlyIncome * futureIncomeMultiplier;
  const totalRCP = input.asset_equity + input.cash_on_hand + (input.retirement_accounts * 0.8) + futureIncome;

  // Eligibility assessment
  const datcEligible = totalRCP < input.total_tax_debt;
  const datl_eligible = input.liability_dispute;
  const etaEligible = input.hardship_factors.length >= 2 && !datcEligible;

  // Offer amount strategy
  const recommendedOffer = Math.max(totalRCP, Math.round(input.total_tax_debt * 0.05), 1000);
  const lumpSumOffer = Math.round(recommendedOffer * 1.0); // Lump sum within 5 months
  const periodicOffer = Math.round(recommendedOffer * 1.0); // Paid over 24 months

  // Hardship narrative
  const hardshipNarrative = input.hardship_factors.length > 0 ? `
## HARDSHIP NARRATIVE (For ETA Consideration)

The taxpayer requests consideration under the Effective Tax Administration ground for the following reasons:

${input.hardship_factors.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Collection of the full tax liability would create economic hardship or be inequitable. The taxpayer has demonstrated:
- Limited income relative to necessary expenses
- ${input.future_income_stability === 'declining' ? 'Declining income trajectory' : 'Variable/uncertain income'}
- Significant hardship factors affecting ability to pay

Based on these circumstances, acceptance of this offer promotes effective tax administration.
` : 'No specific hardship factors identified. Focus on DATC grounds.';

  return {
    eligibility_assessment: {
      datc_eligible: datcEligible,
      datl_eligible: datl_eligible,
      eta_eligible: etaEligible,
      reason: datcEligible ?
        'Reasonable Collection Potential is less than total debt - DATC applies' :
        datl_eligible ?
        'Taxpayer disputes underlying liability - DATL may apply' :
        etaEligible ?
        'Hardship factors support ETA consideration' :
        'May not qualify - RCP exceeds or equals debt',
    },
    rcp_calculation: {
      asset_equity: input.asset_equity,
      future_income: futureIncome,
      total_rcp: totalRCP,
      calculation_explanation: `
Asset Equity: $${input.asset_equity.toLocaleString()}
Cash on Hand: $${input.cash_on_hand.toLocaleString()}
Retirement (80%): $${Math.round(input.retirement_accounts * 0.8).toLocaleString()}
Future Income (${futureIncomeMultiplier} months × $${netMonthlyIncome.toLocaleString()}): $${futureIncome.toLocaleString()}
--------------------------------------------
Total RCP: $${totalRCP.toLocaleString()}
Total Debt: $${input.total_tax_debt.toLocaleString()}
${totalRCP < input.total_tax_debt ? 'RCP < Debt: DATC Eligible' : 'RCP ≥ Debt: DATC May Not Apply'}
`,
    },
    offer_amount_strategy: {
      recommended_offer: recommendedOffer,
      lump_sum_amount: lumpSumOffer,
      periodic_amount: Math.round(periodicOffer / 24),
      recommendation: input.months_remaining_csed <= 48 ? 'lump_sum' : 'periodic',
      justification: input.months_remaining_csed <= 48 ?
        'Shorter CSED favors lump sum offer with 12-month multiplier' :
        'Longer collection period supports periodic payment offer',
    },
    hardship_narrative: hardshipNarrative,
    document_checklist: [
      'Form 656 - Offer in Compromise',
      'Form 433-A (OIC) - Collection Information Statement for Individuals',
      '$205 application fee (or Form 656-A fee waiver)',
      '20% initial payment (lump sum) or first month payment (periodic)',
      'Last 6 months bank statements (all accounts)',
      'Last 3 months pay stubs',
      'Most recent tax return',
      'Proof of all monthly expenses',
      'Asset valuations (property, vehicles, etc.)',
      'Retirement account statements',
      'Medical expense documentation (if applicable)',
      'Hardship documentation',
    ],
    timeline: [
      { phase: 'Preparation', timeframe: '30-60 days', actions: ['Gather documents', 'Complete forms', 'Calculate offer amount'] },
      { phase: 'Submission', timeframe: 'Day 60', actions: ['Submit OIC package', 'Include fee and initial payment'] },
      { phase: 'IRS Review', timeframe: '6-12 months', actions: ['Respond to IRS requests', 'Provide additional documentation'] },
      { phase: 'Decision', timeframe: '12-24 months', actions: ['Receive determination', 'Appeal if rejected', 'Pay if accepted'] },
    ],
    acceptance_likelihood: totalRCP < input.total_tax_debt * 0.5 ? 'high' :
      totalRCP < input.total_tax_debt * 0.8 ? 'moderate' : 'low',
  };
}

// ============================================================================
// 7. EVIDENCE PACKAGING SYSTEM
// ============================================================================

export interface EvidencePackagingInput {
  case_type: 'audit' | 'appeals' | 'oic' | 'collection';
  documents_available: string[];
  years_involved: string[];
  issue_categories: string[];
}

export interface EvidencePackagingOutput {
  evidence_inventory: Record<string, string[]>;
  evidence_gaps: string[];
  reconstruction_methods: string[];
  folder_structure: string;
  presentation_guidelines: string[];
  timeline: string;
}

export function packageEvidence(input: EvidencePackagingInput): EvidencePackagingOutput {
  // Categorize available documents
  const inventory: Record<string, string[]> = {
    income_proof: [],
    expense_proof: [],
    medical_hardship: [],
    business_records: [],
    bank_records: [],
    tax_documents: [],
    correspondence: [],
    other: [],
  };

  for (const doc of input.documents_available) {
    const lowerDoc = doc.toLowerCase();
    if (lowerDoc.includes('w-2') || lowerDoc.includes('1099') || lowerDoc.includes('income')) {
      inventory.income_proof.push(doc);
    } else if (lowerDoc.includes('receipt') || lowerDoc.includes('expense') || lowerDoc.includes('invoice')) {
      inventory.expense_proof.push(doc);
    } else if (lowerDoc.includes('medical') || lowerDoc.includes('hospital') || lowerDoc.includes('doctor')) {
      inventory.medical_hardship.push(doc);
    } else if (lowerDoc.includes('bank') || lowerDoc.includes('statement')) {
      inventory.bank_records.push(doc);
    } else if (lowerDoc.includes('return') || lowerDoc.includes('tax') || lowerDoc.includes('transcript')) {
      inventory.tax_documents.push(doc);
    } else if (lowerDoc.includes('letter') || lowerDoc.includes('notice') || lowerDoc.includes('irs')) {
      inventory.correspondence.push(doc);
    } else {
      inventory.other.push(doc);
    }
  }

  // Identify gaps
  const gaps: string[] = [];
  if (inventory.income_proof.length === 0) gaps.push('Income verification documents (W-2s, 1099s)');
  if (inventory.bank_records.length === 0) gaps.push('Bank statements');
  if (inventory.tax_documents.length === 0) gaps.push('Tax returns or transcripts');

  if (input.case_type === 'oic' || input.case_type === 'collection') {
    if (inventory.expense_proof.length < 5) gaps.push('Expense documentation (utilities, rent, medical)');
    if (inventory.medical_hardship.length === 0) gaps.push('Hardship documentation (if applicable)');
  }

  return {
    evidence_inventory: inventory,
    evidence_gaps: gaps,
    reconstruction_methods: [
      'Bank Deposit Method: Use bank statements to reconstruct income',
      'Cohan Rule: Estimate expenses where documentation unavailable',
      'Affidavits: Obtain sworn statements for undocumented items',
      'Third-party records: Request duplicates from banks, employers, vendors',
      'IRS Transcripts: Obtain Wage & Income transcripts for reported income',
    ],
    folder_structure: `
/Case_${input.years_involved.join('_')}/
├── /01_IRS_Notices/
│   └── [All IRS correspondence by date]
├── /02_Returns/
│   └── [Tax returns for all years]
├── /03_Transcripts/
│   └── [IRS transcripts - Account, W&I, Return]
├── /04_Evidence_By_Issue/
${input.issue_categories.map(issue => `│   ├── /${issue}/\n│   │   └── [Supporting documents for ${issue}]`).join('\n')}
├── /05_Hardship_Docs/
│   └── [Medical, financial hardship documentation]
├── /06_Correspondence/
│   └── [All written communications with IRS]
└── /07_Index/
    └── [Document index and cover sheets]
`,
    presentation_guidelines: [
      'Create cover sheet for each section',
      'Index all documents with page numbers',
      'Use tabs or dividers for each category',
      'Highlight key information in documents',
      'Include summary memo explaining documents',
      'Provide copies only - never originals',
      'Bates stamp if voluminous production',
      'Create chronological timeline if relevant',
    ],
    timeline: '1-2 weeks for basic assembly; 3-4 weeks for complex cases with reconstruction',
  };
}

// ============================================================================
// WORKFLOW COMMANDS EXPORT
// ============================================================================

export const ADVANCED_MODULE_WORKFLOWS = {
  appeals_protest: {
    command: '/appeals-protest',
    description: 'Generate formal IRS Appeals protest',
    workflow_type: 'appeals_protest',
    entry_function: 'generateAppealsProtest',
    estimated_phases: 5,
  },
  criminal_risk: {
    command: '/criminal-risk',
    description: 'Assess criminal tax exposure risk',
    workflow_type: 'criminal_exposure',
    entry_function: 'assessCriminalRisk',
    estimated_phases: 6,
  },
  penalty_optimizer: {
    command: '/penalty-optimizer',
    description: 'Optimize penalty reduction strategy',
    workflow_type: 'penalty_reduction',
    entry_function: 'optimizePenaltyReduction',
    estimated_phases: 4,
  },
  transcript_analysis: {
    command: '/transcript-analysis',
    description: 'Analyze IRS transcript codes',
    workflow_type: 'transcript_analyzer',
    entry_function: 'analyzeTranscript',
    estimated_phases: 3,
  },
  audit_defense: {
    command: '/audit-defense',
    description: 'Build audit defense strategy',
    workflow_type: 'audit_defense',
    entry_function: 'buildAuditDefenseStrategy',
    estimated_phases: 6,
  },
  oic_builder: {
    command: '/oic-builder',
    description: 'Build Offer in Compromise strategy',
    workflow_type: 'oic_builder',
    entry_function: 'buildOICStrategy',
    estimated_phases: 7,
  },
  evidence_package: {
    command: '/evidence-package',
    description: 'Package evidence for IRS case',
    workflow_type: 'evidence_packaging',
    entry_function: 'packageEvidence',
    estimated_phases: 2,
  },
};
