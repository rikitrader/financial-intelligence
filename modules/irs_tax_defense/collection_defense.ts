/**
 * IRS COLLECTION DEFENSE MODULE
 *
 * Defends taxpayers facing IRS collection actions including:
 * - Wage garnishment
 * - Bank levies
 * - Tax liens
 * - Asset seizure
 * - Revenue Officer enforcement
 *
 * TRIGGER COMMAND: /collection-defense
 *
 * Legal Authorities:
 * - IRC § 6330 - Collection Due Process (CDP)
 * - IRC § 6343 - Levy release
 * - IRC § 6159 - Installment Agreements
 * - IRC § 7122 - Offer in Compromise
 * - IRM 5.11 - Levies
 * - IRM 5.12 - Liens
 * - IRM 5.16 - Currently Not Collectible
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NoticeType = 'LT11' | 'Letter1058' | 'CP90' | 'CP91' | 'CP504' | 'CP523' | 'LT16' | 'other' | 'none';
export type EnforcementStage = 'pre_notice' | 'notice_issued' | 'cdp_period' | 'post_cdp' | 'active_collection' | 'seizure_imminent';
export type CollectionRisk = 'low' | 'medium' | 'high' | 'critical';

export interface CollectionCaseInput {
  // Case identification
  taxpayer_name: string;
  taxpayer_ssn_last4?: string;

  // Collection status
  levy_received: boolean;
  levy_type?: 'wage' | 'bank' | 'receivables' | 'property' | 'none';
  lien_filed: boolean;
  notice_type: NoticeType;
  notice_date?: string;
  days_since_notice?: number;

  // Financial situation
  monthly_income: number;
  monthly_expenses: number;
  assets: number;
  equity_in_assets?: number;
  tax_debt_amount: number;

  // Status
  hardship_status: boolean;
  compliance_status: 'all_filed' | 'missing_returns' | 'unfiled';
  estimated_payments_current?: boolean;

  // Additional context
  revenue_officer_assigned?: boolean;
  prior_agreements_defaulted?: boolean;
  tax_years_involved: string[];
}

// ============================================================================
// LEGAL FRAMEWORK
// ============================================================================

export const COLLECTION_LEGAL_FRAMEWORK = {
  CDP_RIGHTS: {
    section: 'IRC § 6330',
    title: 'Collection Due Process',
    url: 'https://www.law.cornell.edu/uscode/text/26/6330',
    key_rights: [
      'Right to hearing before levy action',
      '30 days to request hearing from notice date',
      'Collection suspended during CDP period',
      'Can challenge liability if not previously contested',
      'Can propose collection alternatives (IA, OIC, CNC)',
      'Right to judicial review in Tax Court',
    ],
    deadline: '30 days from date of CDP notice',
    form: 'Form 12153 - Request for Collection Due Process Hearing',
  },

  LEVY_RELEASE: {
    section: 'IRC § 6343',
    title: 'Authority to Release Levy',
    url: 'https://www.law.cornell.edu/uscode/text/26/6343',
    release_conditions: [
      'Liability satisfied or unenforceable',
      'Release will facilitate collection',
      'Installment agreement entered',
      'Levy creates economic hardship',
      'Fair market value exceeds liability',
    ],
  },

  INSTALLMENT_AGREEMENTS: {
    section: 'IRC § 6159',
    title: 'Installment Agreements',
    url: 'https://www.law.cornell.edu/uscode/text/26/6159',
    types: [
      { name: 'Guaranteed IA', threshold: 10000, term: '36 months', form: 'Online or 9465' },
      { name: 'Streamlined IA', threshold: 50000, term: '72 months', form: 'Online or 9465' },
      { name: 'Non-Streamlined IA', threshold: 'Over $50,000', term: 'Negotiated', form: '9465 + 433-F' },
      { name: 'Partial Pay IA', threshold: 'Cannot full pay in CSED', term: 'Based on RCP', form: '9465 + 433-A' },
    ],
  },

  OIC: {
    section: 'IRC § 7122',
    title: 'Offer in Compromise',
    url: 'https://www.law.cornell.edu/uscode/text/26/7122',
    grounds: [
      'Doubt as to Liability (DAL)',
      'Doubt as to Collectibility (DATC)',
      'Effective Tax Administration (ETA)',
    ],
    requirements: [
      'All returns filed',
      'Current with estimated payments',
      'Not in bankruptcy',
      '$205 application fee (waiver available)',
      '20% initial payment (lump sum) or first payment (periodic)',
    ],
    form: 'Form 656 + Form 433-A (OIC)',
  },

  CNC: {
    section: 'IRM 5.16',
    title: 'Currently Not Collectible',
    key_points: [
      'Account placed in hardship status',
      'Collection suspended but not cancelled',
      'Interest and penalties continue',
      'Tax lien typically remains',
      'Annual review by IRS',
      'Can lead to statute expiration',
    ],
    criteria: [
      'Allowable expenses exceed income',
      'No significant assets',
      'Demonstrated financial hardship',
    ],
    form: 'Form 433-A or 433-F',
  },

  IRM_REFERENCES: {
    levies: 'IRM 5.11 - Levy',
    liens: 'IRM 5.12 - Liens',
    cnc: 'IRM 5.16 - Currently Not Collectible',
    installment: 'IRM 5.14 - Installment Agreements',
    oic: 'IRM 5.8 - Offer in Compromise',
    seizure: 'IRM 5.10 - Seizure and Sale',
    appeals: 'IRM 8.22 - Collection Appeals',
  },
};

// ============================================================================
// IRS NOTICE TYPES
// ============================================================================

export const COLLECTION_NOTICES = {
  LT11: {
    code: 'LT11',
    title: 'Final Notice of Intent to Levy and Notice of Your Right to a Hearing',
    urgency: 'critical' as CollectionRisk,
    cdp_eligible: true,
    deadline: '30 days',
    action: 'Request CDP Hearing IMMEDIATELY using Form 12153',
  },
  Letter1058: {
    code: 'Letter1058',
    title: 'Final Notice - Intent to Levy',
    urgency: 'critical' as CollectionRisk,
    cdp_eligible: true,
    deadline: '30 days',
    action: 'Request CDP Hearing IMMEDIATELY using Form 12153',
  },
  CP90: {
    code: 'CP90',
    title: 'Final Notice of Intent to Levy',
    urgency: 'critical' as CollectionRisk,
    cdp_eligible: true,
    deadline: '30 days',
    action: 'Request CDP Hearing IMMEDIATELY using Form 12153',
  },
  CP91: {
    code: 'CP91',
    title: 'Final Notice Before Levy on Social Security Benefits',
    urgency: 'critical' as CollectionRisk,
    cdp_eligible: true,
    deadline: '30 days',
    action: 'Request CDP Hearing - Social Security levy imminent',
  },
  CP504: {
    code: 'CP504',
    title: 'Notice of Intent to Seize Your Property or Rights to Property',
    urgency: 'high' as CollectionRisk,
    cdp_eligible: false,
    deadline: 'Immediate action needed',
    action: 'Contact IRS immediately - state refund seizure likely',
  },
  CP523: {
    code: 'CP523',
    title: 'Notice of Intent to Levy - Default on Agreement',
    urgency: 'high' as CollectionRisk,
    cdp_eligible: false,
    deadline: 'Before levy execution',
    action: 'Request reinstatement of agreement or new agreement',
  },
  LT16: {
    code: 'LT16',
    title: 'Notice of Federal Tax Lien Filing',
    urgency: 'high' as CollectionRisk,
    cdp_eligible: true,
    deadline: '30 days for CDP (if first lien)',
    action: 'Request CDP Hearing if eligible; request lien withdrawal if appropriate',
  },
};

// ============================================================================
// ENFORCEMENT STAGE DETERMINATION
// ============================================================================

export function determineEnforcementStage(input: CollectionCaseInput): {
  stage: EnforcementStage;
  description: string;
  immediate_actions: string[];
  time_critical: boolean;
} {
  const daysSinceNotice = input.days_since_notice || 0;

  // Active levy in place
  if (input.levy_received && input.levy_type !== 'none') {
    return {
      stage: 'active_collection',
      description: `Active ${input.levy_type} levy in effect. Collection is ongoing.`,
      immediate_actions: [
        'Request levy release for hardship (Form 12153 if eligible)',
        'Submit financial information to negotiate release',
        'Propose alternative collection method',
        'Consider Taxpayer Advocate if emergency',
      ],
      time_critical: true,
    };
  }

  // CDP notice received
  if (['LT11', 'Letter1058', 'CP90', 'CP91'].includes(input.notice_type)) {
    if (daysSinceNotice < 30) {
      return {
        stage: 'cdp_period',
        description: `Within 30-day CDP period. ${30 - daysSinceNotice} days remaining to request hearing.`,
        immediate_actions: [
          'FILE CDP HEARING REQUEST IMMEDIATELY (Form 12153)',
          'This is a statutory deadline - missing it waives rights',
          'Prepare collection alternative proposal',
          'Gather financial documentation',
        ],
        time_critical: true,
      };
    } else {
      return {
        stage: 'post_cdp',
        description: 'CDP period expired. Levy can proceed at any time.',
        immediate_actions: [
          'Request Equivalent Hearing (no collection suspension)',
          'File missing returns if any',
          'Submit collection alternative immediately',
          'Consider Taxpayer Advocate for imminent hardship',
        ],
        time_critical: true,
      };
    }
  }

  // Lien filed
  if (input.lien_filed) {
    return {
      stage: 'active_collection',
      description: 'Tax lien filed. Credit affected, but no active levy.',
      immediate_actions: [
        'Request CDP hearing if first lien and within 30 days',
        'Request lien withdrawal if appropriate',
        'Propose collection alternative',
        'Consider OIC for lien release',
      ],
      time_critical: false,
    };
  }

  // Pre-notice stage
  if (input.notice_type === 'none' || input.notice_type === 'CP504') {
    return {
      stage: input.notice_type === 'CP504' ? 'notice_issued' : 'pre_notice',
      description: 'Collection is pending but no final levy notice yet.',
      immediate_actions: [
        'File all missing returns immediately',
        'Proactively contact IRS to propose resolution',
        'Apply for installment agreement before escalation',
        'Document hardship if applicable',
      ],
      time_critical: false,
    };
  }

  return {
    stage: 'notice_issued',
    description: 'Collection notice issued. Action required.',
    immediate_actions: [
      'Review notice type and deadline',
      'Request CDP if eligible',
      'Propose collection alternative',
    ],
    time_critical: true,
  };
}

// ============================================================================
// COLLECTION ALTERNATIVE RECOMMENDATION
// ============================================================================

export interface CollectionAlternative {
  name: string;
  eligibility: 'eligible' | 'likely_eligible' | 'possibly_eligible' | 'not_eligible';
  reason: string;
  form: string;
  estimated_payment?: string;
  pros: string[];
  cons: string[];
}

export function recommendCollectionAlternatives(input: CollectionCaseInput): CollectionAlternative[] {
  const alternatives: CollectionAlternative[] = [];
  const netIncome = input.monthly_income - input.monthly_expenses;
  const rcpMonthly = Math.max(0, netIncome);
  const rcp = rcpMonthly * 12 + (input.equity_in_assets || 0);

  // Pay in Full
  if (input.assets >= input.tax_debt_amount) {
    alternatives.push({
      name: 'Pay in Full',
      eligibility: 'eligible',
      reason: 'Assets appear sufficient to cover debt',
      form: 'Direct payment',
      estimated_payment: `$${input.tax_debt_amount.toLocaleString()}`,
      pros: ['Immediate resolution', 'Stops all penalties', 'Lien released', 'No ongoing obligation'],
      cons: ['Requires full payment ability', 'May require asset liquidation'],
    });
  }

  // Streamlined Installment Agreement
  if (input.tax_debt_amount <= 50000 && input.compliance_status === 'all_filed') {
    const monthlyPayment = Math.ceil(input.tax_debt_amount / 72);
    alternatives.push({
      name: 'Streamlined Installment Agreement',
      eligibility: monthlyPayment <= rcpMonthly * 1.2 ? 'eligible' : 'possibly_eligible',
      reason: 'Debt under $50,000 and returns filed',
      form: 'Form 9465 or Online Payment Agreement',
      estimated_payment: `$${monthlyPayment.toLocaleString()}/month for 72 months`,
      pros: ['No financial statement required', 'Quick approval', 'Stops enforcement', 'Direct debit reduces fee'],
      cons: ['Interest continues', 'FTP penalty continues (reduced rate)', 'Lien may remain'],
    });
  }

  // Non-Streamlined Installment Agreement
  if (input.tax_debt_amount > 50000 && rcpMonthly > 0) {
    const monthlyPayment = Math.ceil(input.tax_debt_amount / 84);
    alternatives.push({
      name: 'Non-Streamlined Installment Agreement',
      eligibility: monthlyPayment <= rcpMonthly ? 'likely_eligible' : 'possibly_eligible',
      reason: 'Debt over $50,000 - financial statement required',
      form: 'Form 9465 + Form 433-F',
      estimated_payment: `Approximately $${monthlyPayment.toLocaleString()}/month`,
      pros: ['Stops enforcement', 'Manageable payments', 'Based on ability to pay'],
      cons: ['Requires full financial disclosure', 'IRS may request documentation', 'Longer processing'],
    });
  }

  // Currently Not Collectible
  if (input.hardship_status || rcpMonthly <= 0) {
    alternatives.push({
      name: 'Currently Not Collectible (CNC)',
      eligibility: rcpMonthly <= 0 ? 'eligible' : 'likely_eligible',
      reason: 'Expenses equal or exceed income',
      form: 'Form 433-A or 433-F',
      estimated_payment: '$0 (no payment required)',
      pros: ['No payments required', 'Stops collection', 'Debt may expire at CSED', 'Breathing room'],
      cons: ['Interest/penalties continue', 'Lien typically remains', 'Annual review', 'Debt not cancelled'],
    });
  }

  // Offer in Compromise
  if (rcp < input.tax_debt_amount && input.compliance_status === 'all_filed') {
    const offerAmount = Math.max(rcp, 1000);
    alternatives.push({
      name: 'Offer in Compromise (DATC)',
      eligibility: 'possibly_eligible',
      reason: 'Reasonable Collection Potential less than debt',
      form: 'Form 656 + Form 433-A (OIC)',
      estimated_payment: `Estimated offer: $${offerAmount.toLocaleString()}`,
      pros: ['Settles for less than owed', 'Fresh start', 'Lien released after payment', 'Permanent resolution'],
      cons: ['Long process (12-24 months)', 'Application fee', 'Initial payment required', '5-year compliance period'],
    });
  } else if (input.compliance_status !== 'all_filed') {
    alternatives.push({
      name: 'Offer in Compromise',
      eligibility: 'not_eligible',
      reason: 'All returns must be filed before OIC application',
      form: 'Form 656',
      pros: [],
      cons: ['Must file all returns first'],
    });
  }

  // Partial Pay Installment Agreement
  if (rcpMonthly > 0 && rcp < input.tax_debt_amount) {
    alternatives.push({
      name: 'Partial Pay Installment Agreement',
      eligibility: 'possibly_eligible',
      reason: 'Cannot full pay within CSED',
      form: 'Form 9465 + Form 433-A',
      estimated_payment: `Based on RCP: approximately $${rcpMonthly.toLocaleString()}/month`,
      pros: ['Payments based on ability', 'May result in partial forgiveness', 'Stops collection'],
      cons: ['Full financial disclosure required', 'IRS review every 2 years', 'Complex qualification'],
    });
  }

  return alternatives;
}

// ============================================================================
// RISK ASSESSMENT
// ============================================================================

export interface CollectionRiskAssessment {
  overall_risk: CollectionRisk;
  seizure_risk: CollectionRisk;
  garnishment_risk: CollectionRisk;
  lien_expansion_risk: CollectionRisk;
  factors: string[];
  mitigating_factors: string[];
}

export function assessCollectionRisk(input: CollectionCaseInput): CollectionRiskAssessment {
  let seizureScore = 0;
  let garnishmentScore = 0;
  let lienScore = 0;
  const factors: string[] = [];
  const mitigating: string[] = [];

  // Active levy
  if (input.levy_received) {
    garnishmentScore += 4;
    factors.push('Active levy in effect - garnishment ongoing');
  }

  // CDP notice
  if (['LT11', 'Letter1058', 'CP90', 'CP91'].includes(input.notice_type)) {
    if ((input.days_since_notice || 0) > 30) {
      seizureScore += 3;
      garnishmentScore += 3;
      factors.push('CDP period expired - levy can proceed at any time');
    } else {
      factors.push('Within CDP period - request hearing immediately');
    }
  }

  // Lien filed
  if (input.lien_filed) {
    lienScore += 2;
    factors.push('Federal tax lien filed - affects credit and property sales');
  }

  // Debt amount
  if (input.tax_debt_amount >= 100000) {
    seizureScore += 2;
    lienScore += 2;
    factors.push('High debt amount increases IRS collection priority');
  } else if (input.tax_debt_amount >= 50000) {
    seizureScore += 1;
    lienScore += 1;
  }

  // Revenue Officer
  if (input.revenue_officer_assigned) {
    seizureScore += 2;
    garnishmentScore += 2;
    factors.push('Revenue Officer assigned - active field collection');
  }

  // Prior defaults
  if (input.prior_agreements_defaulted) {
    seizureScore += 1;
    garnishmentScore += 1;
    factors.push('Prior agreement defaulted - less flexibility expected');
  }

  // Compliance status
  if (input.compliance_status !== 'all_filed') {
    seizureScore += 1;
    factors.push('Missing returns must be filed before resolution');
    mitigating.push('File missing returns immediately');
  }

  // Significant assets
  if (input.assets > 50000 && input.equity_in_assets && input.equity_in_assets > 25000) {
    seizureScore += 2;
    factors.push('Significant equity in assets makes seizure more attractive to IRS');
  }

  // Mitigating factors
  if (input.hardship_status) {
    seizureScore -= 1;
    garnishmentScore -= 1;
    mitigating.push('Hardship status may support levy release or CNC');
  }

  if (input.monthly_expenses >= input.monthly_income) {
    mitigating.push('No disposable income supports CNC status');
  }

  const getLevel = (score: number): CollectionRisk => {
    if (score >= 5) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  };

  return {
    overall_risk: getLevel(Math.max(seizureScore, garnishmentScore, lienScore)),
    seizure_risk: getLevel(seizureScore),
    garnishment_risk: getLevel(garnishmentScore),
    lien_expansion_risk: getLevel(lienScore),
    factors,
    mitigating_factors: mitigating,
  };
}

// ============================================================================
// TIMELINE GENERATOR
// ============================================================================

export interface CollectionTimelinePhase {
  phase: string;
  timeframe: string;
  actions: {
    action: string;
    priority: 'critical' | 'high' | 'medium';
    form?: string;
    deadline?: string;
  }[];
}

export function generateCollectionTimeline(input: CollectionCaseInput): CollectionTimelinePhase[] {
  const timeline: CollectionTimelinePhase[] = [];
  const stage = determineEnforcementStage(input);

  // IMMEDIATE PHASE
  const immediateActions: {
    action: string;
    priority: 'critical' | 'high' | 'medium';
    form?: string;
    deadline?: string;
  }[] = [];

  // CDP hearing if applicable
  if (['LT11', 'Letter1058', 'CP90', 'CP91', 'LT16'].includes(input.notice_type) &&
      (input.days_since_notice || 0) < 30) {
    immediateActions.push({
      action: 'FILE CDP HEARING REQUEST IMMEDIATELY',
      priority: 'critical',
      form: 'Form 12153',
      deadline: `${30 - (input.days_since_notice || 0)} days remaining`,
    });
  }

  // Stop levy if active
  if (input.levy_received) {
    immediateActions.push({
      action: 'Request levy release for hardship',
      priority: 'critical',
      form: 'Form 12153 or written request citing IRC § 6343',
    });
  }

  // File missing returns
  if (input.compliance_status !== 'all_filed') {
    immediateActions.push({
      action: 'File all missing tax returns',
      priority: 'critical',
      deadline: 'Immediately',
    });
  }

  immediateActions.push({
    action: 'Gather complete financial information',
    priority: 'high',
    form: 'Form 433-A or 433-F preparation',
  });

  timeline.push({
    phase: 'PHASE 1 - IMMEDIATE (STOP LEVY)',
    timeframe: '0-7 days',
    actions: immediateActions,
  });

  // PHASE 2: SUBMIT FINANCIALS
  timeline.push({
    phase: 'PHASE 2 - SUBMIT FINANCIALS',
    timeframe: '7-30 days',
    actions: [
      {
        action: 'Complete Collection Information Statement',
        priority: 'critical',
        form: 'Form 433-A (individuals) or 433-B (businesses)',
      },
      {
        action: 'Gather 6 months bank statements',
        priority: 'high',
      },
      {
        action: 'Document all monthly expenses',
        priority: 'high',
      },
      {
        action: 'Submit financials to IRS or Revenue Officer',
        priority: 'critical',
        deadline: 'Within 30 days',
      },
    ],
  });

  // PHASE 3: PROPOSE RESOLUTION
  const alternatives = recommendCollectionAlternatives(input);
  const topAlternative = alternatives.find(a => a.eligibility === 'eligible') ||
                         alternatives.find(a => a.eligibility === 'likely_eligible');

  timeline.push({
    phase: 'PHASE 3 - PROPOSE RESOLUTION',
    timeframe: '30-90 days',
    actions: [
      {
        action: `Apply for ${topAlternative?.name || 'collection alternative'}`,
        priority: 'critical',
        form: topAlternative?.form || 'Appropriate form',
      },
      {
        action: 'Negotiate terms with IRS',
        priority: 'high',
      },
      {
        action: 'Attend CDP hearing if requested',
        priority: 'critical',
      },
      {
        action: 'Provide any additional documentation requested',
        priority: 'high',
      },
    ],
  });

  // PHASE 4: FINALIZATION
  timeline.push({
    phase: 'PHASE 4 - FINALIZATION',
    timeframe: '3-12 months',
    actions: [
      {
        action: 'Obtain final determination on collection alternative',
        priority: 'critical',
      },
      {
        action: 'If denied, appeal through Collection Appeals Program (CAP)',
        priority: 'high',
        form: 'Form 9423',
      },
      {
        action: 'Consider OIC if IA denied and eligible',
        priority: 'medium',
        form: 'Form 656',
      },
      {
        action: 'Maintain compliance with any agreement',
        priority: 'critical',
      },
    ],
  });

  return timeline;
}

// ============================================================================
// LETTER TEMPLATES
// ============================================================================

export function generateLevyReleaseRequest(input: CollectionCaseInput): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `${today}

Internal Revenue Service
${input.revenue_officer_assigned ? 'Attention: [REVENUE OFFICER NAME]' : 'Collections Division'}
[ADDRESS]

Re: Request for Levy Release - Economic Hardship
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_involved.join(', ')}

Dear ${input.revenue_officer_assigned ? '[Revenue Officer Name]' : 'Sir or Madam'}:

Pursuant to IRC § 6343(a)(1)(D), I respectfully request immediate release of the levy currently in effect against my [wages/bank account/property].

LEGAL BASIS FOR RELEASE:

Under IRC § 6343(a)(1)(D), the IRS is required to release a levy if it determines that the levy is creating an economic hardship due to the financial condition of the taxpayer.

DEMONSTRATION OF ECONOMIC HARDSHIP:

Current Monthly Income:    $${input.monthly_income.toLocaleString()}
Necessary Monthly Expenses: $${input.monthly_expenses.toLocaleString()}
Net Available:              $${(input.monthly_income - input.monthly_expenses).toLocaleString()}

The current levy [has reduced my income below the amount necessary for basic living expenses / has seized funds necessary for essential household bills].

SPECIFIC HARDSHIP IMPACTS:

• [Housing: Unable to pay rent/mortgage]
• [Utilities: Risk of shutoff]
• [Medical: Unable to pay for necessary medications/treatment]
• [Food: Insufficient funds for basic nutrition]
• [Transportation: Unable to maintain transportation for work]

PROPOSED RESOLUTION:

I am committed to resolving my tax liability and request the opportunity to:
${input.hardship_status ?
`• Be placed in Currently Not Collectible status pending financial recovery` :
`• Enter into an installment agreement based on my ability to pay`}

I have attached:
• Completed Form 433-A (Collection Information Statement)
• Last 3 months bank statements
• Proof of income
• Documentation of monthly expenses

REQUEST:

I respectfully request that the IRS:
1. Immediately release the current levy
2. Consider my financial circumstances in determining collection alternatives
3. Allow me to propose a resolution that accounts for my limited ability to pay

Contact Information: [PHONE] | [ADDRESS]

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures: Form 433-A, Bank Statements, Proof of Income, Expense Documentation`;
}

export function generateCDPHearingRequest(input: CollectionCaseInput): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `${today}

Internal Revenue Service
[ADDRESS FROM NOTICE]

Re: REQUEST FOR COLLECTION DUE PROCESS HEARING
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_involved.join(', ')}
    Notice Type: ${input.notice_type}
    Notice Date: [INSERT NOTICE DATE]

Dear Sir or Madam:

Pursuant to IRC § 6330, I hereby request a Collection Due Process hearing regarding the above-referenced notice.

THIS REQUEST IS TIMELY FILED WITHIN 30 DAYS OF THE NOTICE DATE.

ISSUES TO BE ADDRESSED AT HEARING:

1. COLLECTION ALTERNATIVES

I wish to discuss the following collection alternatives:
${input.hardship_status ? '☐ Currently Not Collectible status due to economic hardship' : ''}
☐ Installment Agreement
☐ Offer in Compromise
☐ Other: ________________

2. APPROPRIATENESS OF COLLECTION ACTION

I believe the proposed collection action is not appropriate because:
[  ] The collection action creates economic hardship
[  ] Other collection alternatives should be considered
[  ] [Other reasons]

${input.compliance_status !== 'all_filed' ? `
3. COMPLIANCE STATUS

I acknowledge that returns for the following years may be outstanding: [YEARS]
I am actively working to file these returns and will submit them [before the hearing / with this request].
` : ''}

FINANCIAL INFORMATION:

I have attached Form 433-A (Collection Information Statement) documenting my current financial situation.

HEARING PREFERENCE:

☐ Face-to-face conference
☐ Telephone conference
☐ Correspondence (written submissions only)

RELIEF REQUESTED:

I request that the IRS Appeals Office:
1. Suspend collection action during the CDP process
2. Consider my proposed collection alternative
3. Provide a fair and impartial review

Contact Information:
Phone: [PHONE]
Address: [ADDRESS]
Best time to reach: [TIME]

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures:
- Form 433-A (Collection Information Statement)
- Supporting financial documentation
- Copy of CDP Notice (${input.notice_type})`;
}

export function generateCNCRequest(input: CollectionCaseInput): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const netIncome = input.monthly_income - input.monthly_expenses;

  return `${today}

Internal Revenue Service
Collections Division
[ADDRESS]

Re: Request for Currently Not Collectible Status
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_involved.join(', ')}
    Total Liability: $${input.tax_debt_amount.toLocaleString()}

Dear Sir or Madam:

Pursuant to IRM 5.16, I respectfully request that my account be placed in Currently Not Collectible (CNC) status due to demonstrated financial hardship.

FINANCIAL ANALYSIS:

| Category | Amount |
|----------|--------|
| Monthly Gross Income | $${input.monthly_income.toLocaleString()} |
| Allowable Monthly Expenses | $${input.monthly_expenses.toLocaleString()} |
| Net Monthly Available | $${netIncome.toLocaleString()} |
| Total Assets | $${input.assets.toLocaleString()} |
| Equity in Assets | $${(input.equity_in_assets || 0).toLocaleString()} |

HARDSHIP DEMONSTRATION:

My current financial situation demonstrates that any collection action would constitute economic hardship:

1. My necessary living expenses equal or exceed my income
2. I have no significant equity in assets to liquidate
3. Collection would deprive me of basic necessities

SPECIFIC CIRCUMSTANCES:

[  ] Unemployment/underemployment
[  ] Medical condition limiting earning capacity
[  ] Fixed income (Social Security, disability, pension)
[  ] Supporting dependents
[  ] Other: ________________

COMPLIANCE STATUS:

${input.compliance_status === 'all_filed' ?
`All required tax returns have been filed. I am in full compliance with current filing obligations.` :
`I am working to file all outstanding returns and will submit them within [TIMEFRAME].`}

UNDERSTANDING:

I understand that:
• Interest and penalties will continue to accrue
• The IRS may file or maintain a tax lien
• My status will be reviewed periodically
• The collection statute continues to run

REQUEST:

I respectfully request that:
1. My account be designated Currently Not Collectible (Hardship)
2. All collection activity be suspended
3. I be allowed to make voluntary payments when possible

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures:
- Form 433-A or 433-F (Collection Information Statement)
- 3 months bank statements
- Proof of all income sources
- Proof of all monthly expenses`;
}

export function generateInstallmentAgreementRequest(input: CollectionCaseInput): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const netIncome = input.monthly_income - input.monthly_expenses;
  const proposedPayment = Math.min(netIncome * 0.8, Math.ceil(input.tax_debt_amount / 72));

  return `${today}

Internal Revenue Service
[ADDRESS]

Re: Request for Installment Agreement
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_involved.join(', ')}
    Total Balance Due: $${input.tax_debt_amount.toLocaleString()}

Dear Sir or Madam:

Pursuant to IRC § 6159, I respectfully request an installment agreement to pay my outstanding tax liability.

PROPOSED PAYMENT TERMS:

• Monthly Payment Amount: $${proposedPayment.toLocaleString()}
• Payment Date: 15th of each month
• Payment Method: Direct Debit from checking account
• Estimated Full Payment: ${Math.ceil(input.tax_debt_amount / proposedPayment)} months

FINANCIAL SUMMARY:

| Category | Amount |
|----------|--------|
| Monthly Gross Income | $${input.monthly_income.toLocaleString()} |
| Monthly Expenses | $${input.monthly_expenses.toLocaleString()} |
| Net Available | $${netIncome.toLocaleString()} |
| Proposed Payment | $${proposedPayment.toLocaleString()} |

COMPLIANCE CERTIFICATION:

${input.compliance_status === 'all_filed' ?
`I certify that all required tax returns have been filed.` :
`I am filing all outstanding returns with this request.`}

I understand and agree to:
• Make payments on time each month
• File all future returns timely
• Pay all future taxes when due
• Provide updated financial information if requested

INSTALLMENT AGREEMENT TYPE:

${input.tax_debt_amount <= 50000 ?
`☐ Streamlined Installment Agreement (debt under $50,000)` :
`☐ Non-Streamlined Installment Agreement (Form 433-F attached)`}

REQUEST:

I respectfully request approval of this installment agreement. I am committed to maintaining compliance and making all scheduled payments.

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures:
- Form 9465 (Installment Agreement Request)
${input.tax_debt_amount > 50000 ? '- Form 433-F (Collection Information Statement)' : ''}
- Voided check for direct debit`;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export interface CollectionCaseAnalysis {
  case_summary: string;
  enforcement_stage: ReturnType<typeof determineEnforcementStage>;
  collection_alternatives: CollectionAlternative[];
  risk_assessment: CollectionRiskAssessment;
  timeline: CollectionTimelinePhase[];
  strategy_report: string;
  generated_letters: { name: string; content: string }[];
}

export function analyzeCollectionCase(input: CollectionCaseInput): CollectionCaseAnalysis {
  const stage = determineEnforcementStage(input);
  const alternatives = recommendCollectionAlternatives(input);
  const risk = assessCollectionRisk(input);
  const timeline = generateCollectionTimeline(input);

  // Generate letters based on situation
  const letters: { name: string; content: string }[] = [];

  // CDP hearing if applicable
  if (['LT11', 'Letter1058', 'CP90', 'CP91', 'LT16'].includes(input.notice_type) &&
      (input.days_since_notice || 0) < 30) {
    letters.push({
      name: 'CDP Hearing Request',
      content: generateCDPHearingRequest(input),
    });
  }

  // Levy release if active
  if (input.levy_received) {
    letters.push({
      name: 'Levy Release Request',
      content: generateLevyReleaseRequest(input),
    });
  }

  // CNC if hardship
  if (input.hardship_status || (input.monthly_income - input.monthly_expenses) <= 0) {
    letters.push({
      name: 'CNC Status Request',
      content: generateCNCRequest(input),
    });
  }

  // Installment Agreement
  if ((input.monthly_income - input.monthly_expenses) > 0) {
    letters.push({
      name: 'Installment Agreement Request',
      content: generateInstallmentAgreementRequest(input),
    });
  }

  // Strategy report
  const topAlternative = alternatives.find(a =>
    a.eligibility === 'eligible' || a.eligibility === 'likely_eligible'
  );

  const strategyReport = `
## COLLECTION STRATEGY REPORT

### Current Enforcement Stage
**${stage.stage.replace('_', ' ').toUpperCase()}**

${stage.description}

### Immediate Actions Required
${stage.immediate_actions.map(a => `- ${a}`).join('\n')}

### Best Protection Tool
**${topAlternative?.name || 'Collection Alternative'}**

${topAlternative?.reason || 'Based on financial analysis'}

### Required Forms
${topAlternative ? `- ${topAlternative.form}` : '- Form 433-A or 433-F (Collection Information Statement)'}
- Proof of income (pay stubs, tax returns)
- 6 months bank statements
- Proof of expenses (bills, receipts)

### Key Deadlines
${['LT11', 'Letter1058', 'CP90', 'CP91'].includes(input.notice_type) ?
`⚠️ CDP HEARING: ${30 - (input.days_since_notice || 0)} days remaining` :
'No statutory deadline, but act promptly'}

### Expected Outcome
${topAlternative?.name === 'Currently Not Collectible (CNC)' ?
'Account placed in hardship status, no payments required, debt may expire at CSED' :
topAlternative?.name?.includes('Installment') ?
'Manageable monthly payments, enforcement stopped, eventual full payment' :
topAlternative?.name === 'Offer in Compromise (DATC)' ?
'Potential settlement for less than full balance, fresh start after payment' :
'Resolution of collection threat through appropriate alternative'}
`;

  // Case summary
  const caseSummary = `
# COLLECTION DEFENSE CASE ANALYSIS
## ${input.taxpayer_name}

**Tax Debt:** $${input.tax_debt_amount.toLocaleString()}
**Tax Years:** ${input.tax_years_involved.join(', ')}
**Levy Active:** ${input.levy_received ? `Yes (${input.levy_type})` : 'No'}
**Lien Filed:** ${input.lien_filed ? 'Yes' : 'No'}
**Notice Type:** ${input.notice_type}
**Days Since Notice:** ${input.days_since_notice || 'N/A'}

---

## ENFORCEMENT STAGE

**${stage.stage.replace('_', ' ').toUpperCase()}**

${stage.description}

**Time Critical:** ${stage.time_critical ? 'YES - IMMEDIATE ACTION REQUIRED' : 'No, but act promptly'}

---

## RISK ASSESSMENT

| Risk Type | Level |
|-----------|-------|
| Overall Risk | ${risk.overall_risk.toUpperCase()} |
| Seizure Risk | ${risk.seizure_risk.toUpperCase()} |
| Garnishment Risk | ${risk.garnishment_risk.toUpperCase()} |
| Lien Expansion Risk | ${risk.lien_expansion_risk.toUpperCase()} |

**Risk Factors:**
${risk.factors.map(f => `- ${f}`).join('\n')}

**Mitigating Factors:**
${risk.mitigating_factors.map(f => `- ${f}`).join('\n')}

---

## COLLECTION ALTERNATIVES

${alternatives.map(a => `
### ${a.name}
- **Eligibility:** ${a.eligibility.replace('_', ' ').toUpperCase()}
- **Reason:** ${a.reason}
- **Form:** ${a.form}
${a.estimated_payment ? `- **Estimated Payment:** ${a.estimated_payment}` : ''}
`).join('\n')}

${strategyReport}
`;

  return {
    case_summary: caseSummary,
    enforcement_stage: stage,
    collection_alternatives: alternatives,
    risk_assessment: risk,
    timeline,
    strategy_report: strategyReport,
    generated_letters: letters,
  };
}

// ============================================================================
// WORKFLOW COMMAND
// ============================================================================

export const COLLECTION_DEFENSE_WORKFLOW = {
  command: '/collection-defense',
  description: 'IRS Collection Defense - Levies, Liens, Garnishments',
  workflow_type: 'collection_defense',
  module_path: '../modules/irs_tax_defense/collection_defense',
  entry_function: 'analyzeCollectionCase',
  required_data: ['collection_notices', 'financial_info'],
  generates_outputs: [
    'case_summary',
    'enforcement_stage',
    'collection_alternatives',
    'risk_assessment',
    'timeline',
    'strategy_report',
    'defense_letters',
  ],
  estimated_phases: 7,
};
