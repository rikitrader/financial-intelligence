/**
 * IRS SUBSTITUTE FOR RETURN (SFR) ATTACK MODULE
 *
 * Handles cases where IRS has prepared a Substitute for Return under IRC §6020(b).
 * Goal: REVERSE, REDUCE, or REPLACE the SFR assessment with properly filed taxpayer return.
 *
 * TRIGGER COMMAND: /sfr-attack
 *
 * IMPORTANT: This module focuses on COMPLIANCE and legal procedure, NOT tax evasion.
 *
 * Legal Authorities:
 * - IRC § 6020(b) - Substitute for Return authority
 * - IRC § 6651 - Failure to File/Pay penalties
 * - IRC § 6212/6213 - Deficiency procedures
 * - IRM 4.12.1 - SFR Program
 * - IRM 5.1.11 - Delinquent Returns
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RecordsStatus = 'full' | 'partial' | 'missing';
export type ProceduralPath = 'tax_court' | 'audit_reconsideration' | 'amended_return' | 'collection_alternative';

export interface SFRCaseInput {
  // Case identification
  taxpayer_name: string;
  taxpayer_ssn_last4?: string;
  filing_status: 'single' | 'mfj' | 'mfs' | 'hoh' | 'qw';

  // SFR details
  tax_years: string[];
  income_sources: ('w2' | '1099' | 'self_employment' | 'investments' | 'rental' | 'other')[];
  has_irs_sfr_assessment: boolean;
  sfr_assessed_amount?: number;
  actual_estimated_liability?: number;

  // Deficiency notice status
  notice_of_deficiency_received: boolean;
  notice_date?: string;
  days_since_notice?: number;

  // Ability to respond
  ability_to_prepare_original_return: boolean;
  records_status: RecordsStatus;

  // Financial situation
  hardship_status: boolean;
  ability_to_pay: 'none' | 'low' | 'moderate' | 'full';

  // Compliance
  prior_compliance: 'good' | 'mixed' | 'poor';
  other_years_filed: boolean;
}

// ============================================================================
// LEGAL FRAMEWORK
// ============================================================================

export const SFR_LEGAL_FRAMEWORK = {
  IRC_6020b: {
    section: 'IRC § 6020(b)',
    title: 'Substitute for Return Authority',
    url: 'https://www.law.cornell.edu/uscode/text/26/6020',
    key_points: [
      'IRS may prepare return for non-filer based on available information',
      'SFR is NOT a return filed by the taxpayer',
      'Typically overstates liability (no deductions, exemptions, or credits applied)',
      'Taxpayer can file original return at any time to replace SFR',
      'SFR starts 10-year collection statute from date of assessment',
      'SFR does NOT start statute for refund claims',
    ],
    taxpayer_rights: [
      'Right to file original return at any time',
      'Right to contest SFR through deficiency procedures',
      'Right to audit reconsideration after assessment',
      'Right to deductions and credits not claimed in SFR',
    ],
  },

  IRC_6212_6213: {
    section: 'IRC §§ 6212/6213',
    title: 'Deficiency Procedures',
    url: 'https://www.law.cornell.edu/uscode/text/26/6212',
    key_points: [
      'Notice of Deficiency (90-day letter) required before assessment',
      '90 days to petition Tax Court (150 days if outside US)',
      'Assessment prohibited during 90-day period',
      'Tax Court has jurisdiction to redetermine deficiency',
      'Filing Tax Court petition suspends collection',
    ],
  },

  IRM_4_12_1: {
    section: 'IRM 4.12.1',
    title: 'Substitute for Return Program',
    key_points: [
      'SFR prepared using third-party information (W-2s, 1099s)',
      'Filing status defaulted (usually Single or MFS)',
      'Standard deduction may not be applied',
      'No itemized deductions, credits, or exemptions',
      'Taxpayer-filed return supersedes SFR',
    ],
  },

  AUDIT_RECONSIDERATION: {
    section: 'IRM 4.13',
    title: 'Audit Reconsideration',
    key_points: [
      'Available after assessment if taxpayer has new information',
      'Submit original return with supporting documentation',
      'No time limit to request (but refund statute applies)',
      'Must show: new information not previously considered',
      'Can reduce assessed liability',
    ],
    required_elements: [
      'Copy of original return for the tax year',
      'Supporting documentation for income/deductions',
      'Written explanation of why reconsideration warranted',
      'Form 12661 (optional) - Disputed Issue Verification',
    ],
  },
};

// ============================================================================
// PROCEDURAL PATH DECISION
// ============================================================================

export interface ProceduralDecision {
  path: ProceduralPath;
  deadline?: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  explanation: string;
  required_actions: string[];
  forms_needed: string[];
}

export function determineProceduralPath(input: SFRCaseInput): ProceduralDecision {
  const daysSinceNotice = input.days_since_notice || 0;

  // Path 1: Tax Court Petition (if within 90 days of deficiency notice)
  if (input.notice_of_deficiency_received && daysSinceNotice < 90) {
    const daysRemaining = 90 - daysSinceNotice;
    return {
      path: 'tax_court',
      deadline: `${daysRemaining} days remaining to file Tax Court petition`,
      urgency: daysRemaining < 30 ? 'critical' : daysRemaining < 60 ? 'high' : 'medium',
      explanation: `Notice of Deficiency received. You have ${daysRemaining} days to petition the U.S. Tax Court. This is a JURISDICTIONAL DEADLINE - missing it waives your right to contest in Tax Court before paying.`,
      required_actions: [
        'Prepare and file Tax Court petition immediately',
        'Simultaneously prepare original return to replace SFR',
        'Gather all supporting documentation',
        'Consider engaging Tax Court practitioner',
      ],
      forms_needed: [
        'Tax Court Petition (Form 2 - Simplified or Full)',
        'Original Form 1040 for affected year(s)',
        'Statement of Taxpayer Identification Number',
        '$60 filing fee (waiver available for low income)',
      ],
    };
  }

  // Path 2: Post-Assessment Audit Reconsideration
  if (input.has_irs_sfr_assessment && (!input.notice_of_deficiency_received || daysSinceNotice >= 90)) {
    return {
      path: 'audit_reconsideration',
      deadline: 'No strict deadline, but act promptly',
      urgency: 'medium',
      explanation: 'The SFR has been assessed. You must pursue Audit Reconsideration to replace the SFR with your original return. This is an administrative process with the IRS.',
      required_actions: [
        'Prepare accurate original return for all SFR years',
        'Compile comprehensive supporting documentation',
        'Submit Audit Reconsideration request package',
        'Monitor case and respond to IRS requests promptly',
      ],
      forms_needed: [
        'Original Form 1040 for each SFR year',
        'Form 12661 - Disputed Issue Verification (recommended)',
        'Written explanation/cover letter',
        'All supporting schedules and documentation',
      ],
    };
  }

  // Path 3: Pre-Assessment Response
  if (!input.has_irs_sfr_assessment) {
    return {
      path: 'amended_return',
      deadline: 'Before Notice of Deficiency issued',
      urgency: 'high',
      explanation: 'SFR has been prepared but not yet assessed. Filing your original return NOW can prevent the deficiency process entirely.',
      required_actions: [
        'File original returns IMMEDIATELY',
        'Include all deductions, credits, and exemptions',
        'Respond to any pending IRS correspondence',
        'Monitor for Notice of Deficiency',
      ],
      forms_needed: [
        'Original Form 1040 for each year',
        'All supporting schedules',
        'Cover letter explaining voluntary compliance',
      ],
    };
  }

  // Path 4: Collection Alternative (if hardship)
  return {
    path: 'collection_alternative',
    deadline: 'Ongoing - pursue immediately',
    urgency: input.hardship_status ? 'high' : 'medium',
    explanation: 'SFR assessment exists. While pursuing reconsideration, also address collection through appropriate relief options.',
    required_actions: [
      'File original returns to replace SFR',
      'Request audit reconsideration',
      'Simultaneously apply for collection relief',
      'Document hardship if applicable',
    ],
    forms_needed: [
      'Original Form 1040(s)',
      'Form 433-A or 433-F (Collection Information)',
      'Collection relief application (IA, OIC, or CNC)',
    ],
  };
}

// ============================================================================
// SFR RECONSIDERATION ARGUMENT
// ============================================================================

export interface SFRReconsiderationArgument {
  key_points: string[];
  legal_basis: string[];
  expected_adjustments: {
    category: string;
    sfr_amount: string;
    correct_amount: string;
    difference: string;
  }[];
  supporting_documentation: string[];
}

export function buildReconsiderationArgument(input: SFRCaseInput): SFRReconsiderationArgument {
  const keyPoints = [
    'The SFR prepared by the IRS under IRC § 6020(b) significantly overstates the taxpayer\'s actual tax liability',
    'The SFR did not include deductions, exemptions, and credits to which the taxpayer is entitled',
    'Taxpayer has now prepared an accurate original return based on actual income and allowable deductions',
    'The taxpayer-filed return should supersede the SFR per IRM 4.12.1',
  ];

  const legalBasis = [
    'IRC § 6020(b) permits the IRS to prepare an SFR, but does not preclude taxpayer from filing original return',
    'IRM 4.12.1 provides that taxpayer-filed returns supersede SFR assessments',
    'Taxpayer has constitutional right to claim all lawful deductions (see INDOPCO, Inc. v. Commissioner)',
    'Audit Reconsideration procedures (IRM 4.13) allow correction of SFR assessments with new information',
  ];

  const expectedAdjustments = [
    {
      category: 'Filing Status',
      sfr_amount: 'Single/MFS (default)',
      correct_amount: input.filing_status.toUpperCase(),
      difference: 'May significantly affect tax brackets and deductions',
    },
    {
      category: 'Standard/Itemized Deduction',
      sfr_amount: '$0 or minimal',
      correct_amount: 'Full standard or itemized deduction',
      difference: 'Reduces taxable income substantially',
    },
    {
      category: 'Dependent Exemptions/Credits',
      sfr_amount: 'None claimed',
      correct_amount: 'All qualifying dependents',
      difference: 'Child Tax Credit, EITC if applicable',
    },
    {
      category: 'Business Expenses (if self-employed)',
      sfr_amount: 'None deducted',
      correct_amount: 'Actual business expenses',
      difference: 'Reduces net self-employment income',
    },
    {
      category: 'Retirement Contributions',
      sfr_amount: 'None considered',
      correct_amount: 'IRA, SEP, 401(k) contributions',
      difference: 'Above-the-line deduction',
    },
    {
      category: 'Credits',
      sfr_amount: 'None applied',
      correct_amount: 'All applicable credits',
      difference: 'Direct reduction of tax liability',
    },
  ];

  const supportingDocumentation = [
    'Original Form 1040 for each SFR year',
    'W-2s and 1099s (to verify income matches SFR)',
    'Documentation of deductions claimed',
    'Proof of filing status (marriage certificate, custody documents)',
    'Dependent documentation (SSN, birth certificates, residency proof)',
    'Business expense records (if self-employed)',
    'Retirement contribution statements',
    'Charitable contribution receipts',
    'Mortgage interest statement (Form 1098)',
    'State/local tax payment records',
  ];

  return {
    key_points: keyPoints,
    legal_basis: legalBasis,
    expected_adjustments: expectedAdjustments,
    supporting_documentation: supportingDocumentation,
  };
}

// ============================================================================
// TIMELINE GENERATOR
// ============================================================================

export interface SFRTimelinePhase {
  phase: string;
  timeframe: string;
  actions: {
    action: string;
    priority: 'critical' | 'high' | 'medium';
    form_or_resource?: string;
    deadline?: string;
  }[];
}

export function generateSFRTimeline(input: SFRCaseInput): SFRTimelinePhase[] {
  const timeline: SFRTimelinePhase[] = [];
  const proceduralPath = determineProceduralPath(input);

  // PHASE 1: IMMEDIATE
  const immediateActions = [
    {
      action: 'Order IRS transcripts (Wage & Income, Account, Record of Account)',
      priority: 'critical' as const,
      form_or_resource: 'Form 4506-T or IRS Online Account',
      deadline: 'Day 1-3',
    },
    {
      action: 'Identify exact SFR assessment amounts and dates',
      priority: 'critical' as const,
      deadline: 'Day 1-7',
    },
    {
      action: 'Gather all available financial records for SFR years',
      priority: 'high' as const,
      deadline: 'Day 1-14',
    },
    {
      action: 'Determine if Notice of Deficiency deadline applies',
      priority: 'critical' as const,
      deadline: 'Immediately',
    },
  ];

  // Add Tax Court deadline if applicable
  if (proceduralPath.path === 'tax_court') {
    immediateActions.unshift({
      action: 'FILE TAX COURT PETITION - JURISDICTIONAL DEADLINE',
      priority: 'critical' as const,
      form_or_resource: 'Tax Court Petition + $60 fee',
      deadline: proceduralPath.deadline,
    });
  }

  timeline.push({
    phase: 'PHASE 1 - IMMEDIATE',
    timeframe: '0-30 days',
    actions: immediateActions,
  });

  // PHASE 2: COMPLIANCE (30-90 days)
  timeline.push({
    phase: 'PHASE 2 - COMPLIANCE',
    timeframe: '30-90 days',
    actions: [
      {
        action: 'Prepare accurate original tax returns for all SFR years',
        priority: 'critical',
        deadline: 'Day 30-60',
      },
      {
        action: 'Include all deductions, credits, and proper filing status',
        priority: 'critical',
      },
      {
        action: 'Compile comprehensive supporting documentation',
        priority: 'high',
      },
      {
        action: 'File original returns with IRS',
        priority: 'critical',
        deadline: 'Day 60-75',
      },
      {
        action: 'Submit SFR Reconsideration/Replacement request',
        priority: 'critical',
        form_or_resource: 'Cover letter + Form 12661',
        deadline: 'Day 60-90',
      },
      {
        action: 'Request penalty abatement (reasonable cause or FTA)',
        priority: 'high',
        form_or_resource: 'Form 843 or written request',
      },
    ],
  });

  // PHASE 3: RESOLUTION (3-12 months)
  timeline.push({
    phase: 'PHASE 3 - RESOLUTION',
    timeframe: '3-12 months',
    actions: [
      {
        action: 'Monitor reconsideration case status',
        priority: 'high',
        form_or_resource: 'Call IRS or check online account',
      },
      {
        action: 'Respond promptly to any IRS information requests',
        priority: 'critical',
      },
      {
        action: 'Appeal if reconsideration denied',
        priority: 'high',
        form_or_resource: 'Form 12203 - Request for Appeals Review',
      },
      {
        action: 'Address collection on any remaining balance',
        priority: 'medium',
        form_or_resource: 'Form 9465 (IA), 433-A (CNC/OIC)',
      },
      {
        action: 'Verify account updated after reconsideration',
        priority: 'high',
      },
    ],
  });

  // PHASE 4: PROTECTION
  timeline.push({
    phase: 'PHASE 4 - PROTECTION',
    timeframe: 'Ongoing',
    actions: [
      {
        action: 'Maintain filing compliance going forward',
        priority: 'critical',
      },
      {
        action: 'Adjust withholding or estimated payments',
        priority: 'high',
        form_or_resource: 'Form W-4 or 1040-ES',
      },
      {
        action: 'Monitor account for accurate penalty recalculation',
        priority: 'medium',
      },
      {
        action: 'Keep records organized for future years',
        priority: 'medium',
      },
    ],
  });

  return timeline;
}

// ============================================================================
// RISK ANALYSIS
// ============================================================================

export interface SFRRiskAnalysis {
  levy_risk: 'low' | 'medium' | 'high' | 'critical';
  lien_risk: 'low' | 'medium' | 'high' | 'critical';
  collection_risk: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  mitigating_actions: string[];
}

export function analyzeSFRRisk(input: SFRCaseInput): SFRRiskAnalysis {
  let levyScore = 0;
  let lienScore = 0;
  let collectionScore = 0;
  const factors: string[] = [];
  const mitigatingActions: string[] = [];

  // SFR already assessed increases all risks
  if (input.has_irs_sfr_assessment) {
    levyScore += 2;
    lienScore += 2;
    collectionScore += 2;
    factors.push('SFR already assessed - IRS has established tax debt');
  }

  // Amount of assessment
  if (input.sfr_assessed_amount) {
    if (input.sfr_assessed_amount >= 50000) {
      levyScore += 2;
      lienScore += 3;
      collectionScore += 2;
      factors.push(`High assessment amount ($${input.sfr_assessed_amount.toLocaleString()}) increases IRS collection priority`);
    } else if (input.sfr_assessed_amount >= 25000) {
      levyScore += 1;
      lienScore += 2;
      collectionScore += 1;
      factors.push('Moderate assessment amount may trigger lien filing');
    }
  }

  // Multiple years
  if (input.tax_years.length >= 3) {
    collectionScore += 1;
    factors.push('Multiple years of SFR indicates pattern - increases scrutiny');
  }

  // Notice of deficiency received
  if (input.notice_of_deficiency_received) {
    if (input.days_since_notice && input.days_since_notice > 90) {
      levyScore += 1;
      lienScore += 2;
      factors.push('90-day period expired - IRS can now assess and collect');
      mitigatingActions.push('File original return and request audit reconsideration immediately');
    } else {
      factors.push('Within 90-day deficiency period - Tax Court option available');
      mitigatingActions.push('Consider Tax Court petition to preserve rights');
    }
  }

  // Prior compliance
  if (input.prior_compliance === 'poor') {
    collectionScore += 2;
    factors.push('Poor prior compliance history increases IRS scrutiny');
  } else if (input.prior_compliance === 'good') {
    collectionScore -= 1;
    factors.push('Good prior compliance history may support favorable treatment');
  }

  // Ability to prepare return
  if (input.ability_to_prepare_original_return) {
    mitigatingActions.push('Prepare and file original returns to replace SFR - typically reduces liability');
  } else {
    factors.push('Difficulty preparing returns may delay resolution');
    mitigatingActions.push('Request IRS transcripts to reconstruct income records');
  }

  // Hardship status
  if (input.hardship_status) {
    mitigatingActions.push('Document hardship for potential CNC status or levy release');
  }

  const getLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (score >= 5) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  };

  return {
    levy_risk: getLevel(levyScore),
    lien_risk: getLevel(lienScore),
    collection_risk: getLevel(collectionScore),
    factors,
    mitigating_actions: mitigatingActions,
  };
}

// ============================================================================
// LETTER TEMPLATES
// ============================================================================

export function generateSFRResponseLetter(input: SFRCaseInput): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `${today}

Internal Revenue Service
[ADDRESS FROM NOTICE]

Re: Response to Substitute for Return - Intent to File Original Returns
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years.join(', ')}

Dear Sir or Madam:

I am writing in response to the Substitute for Return (SFR) prepared by the IRS under IRC § 6020(b) for the above-referenced tax year(s). I acknowledge that I failed to timely file my tax return(s) and am taking immediate steps to come into full compliance.

NOTICE OF INTENT TO FILE ORIGINAL RETURNS:

I am hereby providing notice that I intend to prepare and file accurate original tax returns for all SFR years. I understand that pursuant to IRM 4.12.1, my original returns will supersede the SFR assessments.

SFR OVERSTATEMENT:

The SFR prepared by the IRS overstates my actual tax liability because:

1. Filing Status: The SFR used [Single/MFS] filing status. My correct filing status is ${input.filing_status.toUpperCase()}.

2. Deductions: The SFR did not include [standard/itemized] deductions to which I am entitled under the Internal Revenue Code.

3. Exemptions/Credits: The SFR failed to account for [dependent exemptions/tax credits] for which I qualify.

4. Expenses: ${input.income_sources.includes('self_employment') ? 'The SFR did not include legitimate business expenses that reduce my net self-employment income.' : 'The SFR may not have properly accounted for above-the-line deductions.'}

PROPOSED TIMELINE:

I am actively working to prepare my original returns and expect to file them within [30/60] days. Upon filing, I respectfully request:

1. That the SFR assessment be replaced with my original return figures
2. That penalties be recalculated based on the correct liability
3. That any overpayment be applied to remaining balance or refunded

${input.hardship_status ? `
FINANCIAL CIRCUMSTANCES:

I am currently experiencing financial hardship and request that the IRS refrain from enforced collection action while I work to resolve this matter through proper channels.
` : ''}

I am committed to resolving this matter and maintaining compliance going forward. Please contact me at [PHONE] if you require additional information.

Respectfully submitted,


_________________________
${input.taxpayer_name}`;
}

export function generateAuditReconsiderationRequest(input: SFRCaseInput): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const argument = buildReconsiderationArgument(input);

  return `${today}

Internal Revenue Service
[RECONSIDERATION UNIT ADDRESS]

Re: Request for Audit Reconsideration - SFR Replacement
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years.join(', ')}
    SFR Assessment Date: [DATE]

Dear Sir or Madam:

Pursuant to IRM 4.13 (Audit Reconsideration), I respectfully request reconsideration of the Substitute for Return (SFR) assessments for the above tax year(s). Enclosed please find my original tax returns, which should supersede the SFR per IRM 4.12.1.

GROUNDS FOR RECONSIDERATION:

${argument.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

LEGAL BASIS:

${argument.legal_basis.map((b, i) => `${i + 1}. ${b}`).join('\n\n')}

EXPECTED ADJUSTMENTS:

| Category | SFR Amount | Correct Amount | Impact |
|----------|------------|----------------|--------|
${argument.expected_adjustments.map(a =>
  `| ${a.category} | ${a.sfr_amount} | ${a.correct_amount} | ${a.difference} |`
).join('\n')}

DOCUMENTATION ENCLOSED:

${argument.supporting_documentation.map(d => `• ${d}`).join('\n')}

REQUEST:

I respectfully request that:
1. The enclosed original returns be accepted and processed
2. The SFR assessments be vacated and replaced with accurate figures
3. All penalties be recalculated based on corrected liability
4. Any resulting overpayment be applied or refunded

If you require additional information or documentation, please contact me at [PHONE].

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures:
- Original Form 1040 (${input.tax_years.join(', ')})
- Form 12661 - Disputed Issue Verification
- Supporting schedules and documentation
- IRS transcripts
- Cover sheet listing all documents`;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export interface SFRCaseAnalysis {
  case_summary: string;
  procedural_path: ProceduralDecision;
  reconsideration_argument: SFRReconsiderationArgument;
  timeline: SFRTimelinePhase[];
  risk_analysis: SFRRiskAnalysis;
  outcome_strategy: string;
  generated_letters: { name: string; content: string }[];
}

export function analyzeSFRCase(input: SFRCaseInput): SFRCaseAnalysis {
  const proceduralPath = determineProceduralPath(input);
  const argument = buildReconsiderationArgument(input);
  const timeline = generateSFRTimeline(input);
  const risk = analyzeSFRRisk(input);

  // Generate letters
  const generatedLetters = [
    { name: 'SFR Response Letter', content: generateSFRResponseLetter(input) },
    { name: 'Audit Reconsideration Request', content: generateAuditReconsiderationRequest(input) },
  ];

  // Determine outcome strategy
  const potentialReduction = input.sfr_assessed_amount && input.actual_estimated_liability
    ? input.sfr_assessed_amount - input.actual_estimated_liability
    : null;

  const outcomeStrategy = `
## OUTCOME STRATEGY

### Step 1: Replace SFR with Original Returns
- File accurate original returns for all SFR years
- Include all deductions, credits, and proper filing status
- ${potentialReduction ? `Potential liability reduction: $${potentialReduction.toLocaleString()}` : 'Expected significant reduction from SFR amount'}

### Step 2: Reduce Tax Liability
- Challenge any remaining disputed items
- Document all deductions thoroughly
- Request reconsideration of any items not accepted

### Step 3: Penalty Relief
- Request First Time Penalty Abatement if eligible
- Submit reasonable cause argument for penalty abatement
- Expected penalty reduction after liability correction

### Step 4: Payment Arrangement
${input.ability_to_pay === 'full' ? '- Pay corrected balance in full' :
  input.ability_to_pay === 'moderate' || input.ability_to_pay === 'low' ? '- Apply for Installment Agreement on remaining balance' :
  '- Request Currently Not Collectible status due to hardship'}

### Expected Outcome
- SFR replaced with accurate taxpayer return
- Significant liability reduction (typically 50-80% from SFR)
- Penalty recalculation on corrected figures
- Resolution of collection threat
`;

  // Build case summary
  const caseSummary = `
# SFR ATTACK CASE ANALYSIS
## ${input.taxpayer_name}

**Tax Years Affected:** ${input.tax_years.join(', ')}
**SFR Assessed:** ${input.has_irs_sfr_assessment ? 'Yes' : 'No'}
**SFR Amount:** ${input.sfr_assessed_amount ? `$${input.sfr_assessed_amount.toLocaleString()}` : 'Unknown'}
**Estimated Actual Liability:** ${input.actual_estimated_liability ? `$${input.actual_estimated_liability.toLocaleString()}` : 'To be determined'}
**Notice of Deficiency:** ${input.notice_of_deficiency_received ? `Yes (${input.days_since_notice} days ago)` : 'No'}

---

## PROCEDURAL PATH

**Recommended Path:** ${proceduralPath.path.replace('_', ' ').toUpperCase()}
**Urgency:** ${proceduralPath.urgency.toUpperCase()}
**Deadline:** ${proceduralPath.deadline || 'No strict deadline'}

${proceduralPath.explanation}

**Required Actions:**
${proceduralPath.required_actions.map(a => `- ${a}`).join('\n')}

**Forms Needed:**
${proceduralPath.forms_needed.map(f => `- ${f}`).join('\n')}

---

## RISK ASSESSMENT

| Risk Type | Level |
|-----------|-------|
| Levy Risk | ${risk.levy_risk.toUpperCase()} |
| Lien Risk | ${risk.lien_risk.toUpperCase()} |
| Collection Risk | ${risk.collection_risk.toUpperCase()} |

**Risk Factors:**
${risk.factors.map(f => `- ${f}`).join('\n')}

**Mitigating Actions:**
${risk.mitigating_actions.map(a => `- ${a}`).join('\n')}

${outcomeStrategy}
`;

  return {
    case_summary: caseSummary,
    procedural_path: proceduralPath,
    reconsideration_argument: argument,
    timeline,
    risk_analysis: risk,
    outcome_strategy: outcomeStrategy,
    generated_letters: generatedLetters,
  };
}

// ============================================================================
// WORKFLOW COMMAND
// ============================================================================

export const SFR_ATTACK_WORKFLOW = {
  command: '/sfr-attack',
  description: 'Substitute for Return Attack & Reconsideration System',
  workflow_type: 'sfr_attack',
  module_path: '../modules/irs_tax_defense/sfr_attack',
  entry_function: 'analyzeSFRCase',
  required_data: ['sfr_assessment', 'tax_records', 'notice_info'],
  generates_outputs: [
    'case_summary',
    'procedural_path',
    'reconsideration_argument',
    'timeline',
    'risk_analysis',
    'outcome_strategy',
    'sfr_letters',
  ],
  estimated_phases: 6,
};
