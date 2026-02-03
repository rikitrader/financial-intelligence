/**
 * IRS NON-FILER DEFENSE & COMPLIANCE RESPONSE SYSTEM
 *
 * Professional-grade defense system for taxpayers who did not file tax returns.
 * Generates defense letters, strategies, procedural roadmaps, and compliance plans.
 *
 * TRIGGER COMMAND: /non-filer
 *
 * IMPORTANT: This module is for COMPLIANCE and DEFENSE purposes only.
 * It does NOT encourage or assist with illegal tax evasion.
 * Focus is on: compliance, defense, damage control, and procedural rights.
 *
 * Legal Framework:
 * - IRC § 6012 - Filing requirements
 * - IRC § 6651(a)(1) - Failure to file penalty
 * - IRC § 6651(a)(2) - Failure to pay penalty
 * - IRC § 6654 - Estimated tax penalties
 * - IRC § 6020(b) - Substitute for Return authority
 * - IRM 5.1.11 - Delinquent Return Investigations
 * - IRM 20.1 - Penalty Handbook
 * - IRM 1.2.14 - Taxpayer Bill of Rights
 */

// ============================================================================
// INPUT VARIABLES & TYPES
// ============================================================================

export type IncomeType = 'w2' | '1099' | 'self_employed' | 'crypto' | 'foreign' | 'rental' | 'investment' | 'mixed' | 'unknown';
export type IRSNotice = 'CP59' | 'CP515' | 'CP516' | 'CP518' | 'CP2000' | 'LT11' | 'Letter1058' | 'LT16' | 'CP504' | 'none';
export type AbilityToPay = 'none' | 'low' | 'moderate' | 'full';
export type ComplianceHistory = 'good' | 'mixed' | 'poor' | 'first_time';
export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qw';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface NonFilerCaseInput {
  // Case identification
  taxpayer_name: string;
  taxpayer_ssn_last4?: string;
  filing_status: FilingStatus;
  state_of_residence: string;

  // Non-filing details
  tax_years_missing: string[];
  income_type: IncomeType;
  estimated_income_per_year?: Record<string, number>;

  // IRS status
  irs_notice_received: IRSNotice;
  is_sfr_assessed: 'yes' | 'no' | 'unknown';
  irs_contact_date?: string;
  assigned_revenue_officer?: boolean;

  // Financial situation
  ability_to_pay: AbilityToPay;
  estimated_liability?: number;
  current_assets?: number;
  monthly_income?: number;
  monthly_expenses?: number;

  // Mitigating factors
  hardship_status: boolean;
  medical_issues: boolean;
  natural_disaster: boolean;
  mental_health_issues: boolean;
  records_available: 'full' | 'partial' | 'lost';
  was_relying_on_advisor: boolean;
  advisor_name?: string;

  // History
  prior_compliance_history: ComplianceHistory;
  prior_penalty_abatements?: number;

  // Additional context
  special_circumstances?: string;
}

// ============================================================================
// LEGAL FRAMEWORK KNOWLEDGE BASE
// ============================================================================

export const LEGAL_FRAMEWORK = {
  // Filing Requirements
  IRC_6012: {
    section: 'IRC § 6012',
    title: 'Persons Required to Make Returns of Income',
    url: 'https://www.law.cornell.edu/uscode/text/26/6012',
    summary: 'Defines who must file an income tax return based on gross income thresholds',
    thresholds_2024: {
      single_under_65: 14600,
      single_65_plus: 16550,
      mfj_both_under_65: 29200,
      mfj_one_65_plus: 30750,
      mfj_both_65_plus: 32300,
      hoh_under_65: 21900,
      hoh_65_plus: 23850,
      self_employed: 400,
    },
  },

  // Failure to File Penalty
  IRC_6651_a1: {
    section: 'IRC § 6651(a)(1)',
    title: 'Failure to File Tax Return',
    url: 'https://www.law.cornell.edu/uscode/text/26/6651',
    penalty: '5% of unpaid tax per month, maximum 25%',
    minimum_penalty: 'Lesser of $485 or 100% of tax (2024)',
    reasonable_cause: 'Penalty may be abated for reasonable cause and not willful neglect',
  },

  // Failure to Pay Penalty
  IRC_6651_a2: {
    section: 'IRC § 6651(a)(2)',
    title: 'Failure to Pay Tax',
    url: 'https://www.law.cornell.edu/uscode/text/26/6651',
    penalty: '0.5% of unpaid tax per month, maximum 25%',
    combined_max: 'FTF + FTP combined max is 47.5% (25% + 22.5%)',
  },

  // Estimated Tax Penalty
  IRC_6654: {
    section: 'IRC § 6654',
    title: 'Failure to Pay Estimated Income Tax',
    url: 'https://www.law.cornell.edu/uscode/text/26/6654',
    penalty: 'Interest-based penalty on underpayment',
    exceptions: ['Prior year safe harbor', 'Annualized income installment method'],
  },

  // Substitute for Return
  IRC_6020b: {
    section: 'IRC § 6020(b)',
    title: 'Substitute for Return (SFR)',
    url: 'https://www.law.cornell.edu/uscode/text/26/6020',
    summary: 'IRS authority to prepare return for non-filer',
    key_points: [
      'SFR is NOT a return filed by taxpayer',
      'SFR typically overstates liability (no deductions, exemptions)',
      'Taxpayer can file original return to replace SFR',
      'SFR starts statute of limitations for collection (10 years from assessment)',
      'Does NOT start statute for refund claims',
    ],
  },

  // Fraud Penalty
  IRC_6663: {
    section: 'IRC § 6663',
    title: 'Imposition of Fraud Penalty',
    url: 'https://www.law.cornell.edu/uscode/text/26/6663',
    penalty: '75% of underpayment due to fraud',
    burden: 'IRS must prove fraud by clear and convincing evidence',
  },

  // Criminal - Willful Failure to File
  IRC_7203: {
    section: 'IRC § 7203',
    title: 'Willful Failure to File Return',
    url: 'https://www.law.cornell.edu/uscode/text/26/7203',
    penalty: 'Misdemeanor: Up to 1 year imprisonment and/or $25,000 fine',
    elements: ['Required to file', 'Willfully failed to file', 'At or near time required'],
  },

  // Criminal - Tax Evasion
  IRC_7201: {
    section: 'IRC § 7201',
    title: 'Attempt to Evade or Defeat Tax',
    url: 'https://www.law.cornell.edu/uscode/text/26/7201',
    penalty: 'Felony: Up to 5 years imprisonment and/or $250,000 fine',
    elements: ['Tax deficiency', 'Affirmative act of evasion', 'Willfulness'],
  },

  // Hardship Relief
  IRC_6343: {
    section: 'IRC § 6343',
    title: 'Authority to Release Levy',
    url: 'https://www.law.cornell.edu/uscode/text/26/6343',
    summary: 'IRS must release levy if it creates economic hardship',
  },

  // Offer in Compromise
  IRC_7122: {
    section: 'IRC § 7122',
    title: 'Compromises',
    url: 'https://www.law.cornell.edu/uscode/text/26/7122',
    grounds: ['Doubt as to liability', 'Doubt as to collectibility', 'Effective tax administration'],
  },

  // Collection Due Process
  IRC_6330: {
    section: 'IRC § 6330',
    title: 'Notice and Opportunity for Hearing Before Levy',
    url: 'https://www.law.cornell.edu/uscode/text/26/6330',
    rights: [
      'Right to CDP hearing before levy',
      'Right to challenge liability if not previously contested',
      'Right to propose collection alternatives',
      'Right to appeal to Tax Court',
    ],
  },

  // IRM References
  IRM_REFERENCES: {
    delinquent_returns: 'IRM 5.1.11 - Delinquent Return Investigations',
    penalty_handbook: 'IRM 20.1 - Penalty Handbook',
    taxpayer_rights: 'IRM 1.2.14 - Taxpayer Bill of Rights',
    reasonable_cause: 'IRM 20.1.1.3 - Reasonable Cause',
    first_time_abatement: 'IRM 20.1.1.3.6.1 - First Time Abate (FTA)',
    currently_not_collectible: 'IRM 5.16 - Currently Not Collectible',
    installment_agreements: 'IRM 5.14 - Installment Agreements',
    offers_in_compromise: 'IRM 5.8 - Offer in Compromise',
  },
};

// ============================================================================
// REASONABLE CAUSE CATEGORIES
// ============================================================================

export interface ReasonableCauseCategory {
  id: string;
  name: string;
  irm_reference: string;
  description: string;
  required_documentation: string[];
  strength: 'strong' | 'moderate' | 'weak';
  sample_language: string;
}

export const REASONABLE_CAUSE_CATEGORIES: ReasonableCauseCategory[] = [
  {
    id: 'serious_illness',
    name: 'Serious Illness or Incapacity',
    irm_reference: 'IRM 20.1.1.3.2.2',
    description: 'Taxpayer or immediate family member suffered serious illness preventing compliance',
    required_documentation: [
      'Medical records or doctor letter',
      'Hospital admission records',
      'Documentation of incapacity period',
      'Proof illness prevented compliance',
    ],
    strength: 'strong',
    sample_language: `During the tax year(s) in question, the taxpayer suffered from [CONDITION] which rendered them unable to attend to their tax filing obligations. The taxpayer was incapacitated from [START DATE] to [END DATE], a period which encompassed the filing deadline(s). Medical documentation is attached demonstrating the severity and duration of this condition. The taxpayer exercised ordinary business care and prudence by filing promptly upon recovery.`,
  },
  {
    id: 'death_in_family',
    name: 'Death of Immediate Family Member',
    irm_reference: 'IRM 20.1.1.3.2.2',
    description: 'Death of spouse, child, parent, or other close family member',
    required_documentation: [
      'Death certificate',
      'Documentation of relationship',
      'Evidence of taxpayer involvement in arrangements',
    ],
    strength: 'strong',
    sample_language: `The taxpayer experienced the death of [RELATIONSHIP] on [DATE], which occurred [before/around] the filing deadline. The taxpayer was responsible for funeral arrangements, estate matters, and caring for surviving family members. This tragedy understandably diverted the taxpayer's attention from tax compliance matters. The taxpayer acted with ordinary business care by filing as soon as circumstances permitted.`,
  },
  {
    id: 'natural_disaster',
    name: 'Natural Disaster or Casualty',
    irm_reference: 'IRM 20.1.1.3.2.2.4',
    description: 'Fire, flood, hurricane, or other disaster affecting records or ability to file',
    required_documentation: [
      'FEMA declaration (if applicable)',
      'Insurance claims',
      'Police/fire reports',
      'Photos of damage',
    ],
    strength: 'strong',
    sample_language: `On [DATE], the taxpayer's [home/business/records] were [destroyed/severely damaged] by [DISASTER TYPE]. This disaster resulted in the loss of financial records necessary to prepare the tax return(s) and/or prevented the taxpayer from accessing professional tax preparation services. The IRS has recognized this area as a federally declared disaster zone [if applicable]. The taxpayer exercised ordinary care by filing promptly once records could be reconstructed and circumstances permitted.`,
  },
  {
    id: 'records_destroyed',
    name: 'Unavailable or Destroyed Records',
    irm_reference: 'IRM 20.1.1.3.2.2.6',
    description: 'Records necessary for filing were unavailable through no fault of taxpayer',
    required_documentation: [
      'Police report (theft)',
      'Fire/disaster report',
      'IRS transcript request showing attempts',
      'Third-party correspondence showing records requests',
    ],
    strength: 'moderate',
    sample_language: `The taxpayer's financial records necessary for preparing the tax return(s) were [lost/stolen/destroyed] on or about [DATE]. This loss occurred through no fault of the taxpayer. The taxpayer made diligent efforts to reconstruct records by [ACTIONS TAKEN], including requesting transcripts from the IRS and obtaining duplicate records from financial institutions. The return(s) were filed as promptly as possible once sufficient records were obtained.`,
  },
  {
    id: 'reliance_on_professional',
    name: 'Reliance on Tax Professional',
    irm_reference: 'IRM 20.1.1.3.2.2.5',
    description: 'Reasonable reliance on advice of tax professional who failed to file',
    required_documentation: [
      'Engagement letter with preparer',
      'Proof of payment to preparer',
      'Communication with preparer',
      'Evidence taxpayer provided all information',
    ],
    strength: 'moderate',
    sample_language: `The taxpayer engaged [PREPARER NAME], a licensed tax professional, to prepare and file the tax return(s) for the year(s) in question. The taxpayer provided all necessary documentation and paid the required fees. The taxpayer reasonably relied on this professional to fulfill their obligations. Unbeknownst to the taxpayer, the preparer failed to [file the returns/file timely]. Upon discovering this failure on [DATE], the taxpayer immediately took corrective action by filing the return(s).`,
  },
  {
    id: 'mental_health',
    name: 'Mental Health Impairment',
    irm_reference: 'IRM 20.1.1.3.2.2',
    description: 'Depression, anxiety, or other mental health condition affecting ability to comply',
    required_documentation: [
      'Mental health professional letter',
      'Treatment records',
      'Prescription records',
      'Evidence of how condition affected compliance',
    ],
    strength: 'moderate',
    sample_language: `During the relevant period, the taxpayer suffered from [CONDITION], a recognized mental health condition that significantly impaired their ability to manage daily affairs, including tax compliance obligations. The taxpayer was under the care of [PROVIDER] and receiving treatment including [TREATMENT]. This condition prevented the taxpayer from exercising normal judgment and organizational abilities necessary to meet filing deadlines. Medical documentation supporting this claim is attached.`,
  },
  {
    id: 'financial_hardship',
    name: 'Severe Financial Hardship',
    irm_reference: 'IRM 20.1.1.3.2.2.7',
    description: 'Extreme financial circumstances preventing payment (not filing)',
    required_documentation: [
      'Bank statements',
      'Proof of unemployment',
      'Eviction notices',
      'Utility shutoff notices',
    ],
    strength: 'weak',
    sample_language: `The taxpayer experienced severe financial hardship during the period in question, including [CIRCUMSTANCES]. While the taxpayer acknowledges that inability to pay does not excuse failure to file, these extreme circumstances created barriers to accessing professional assistance and focusing on compliance matters. The taxpayer is now requesting consideration of their circumstances in evaluating penalties.`,
  },
  {
    id: 'first_time_penalty',
    name: 'First Time Penalty Abatement (FTA)',
    irm_reference: 'IRM 20.1.1.3.6.1',
    description: 'Administrative waiver for taxpayers with clean compliance history',
    required_documentation: [
      'Compliance history showing 3 clean years',
      'All current returns filed',
      'Any taxes owed are paid or in payment plan',
    ],
    strength: 'strong',
    sample_language: `The taxpayer requests First Time Penalty Abatement pursuant to IRM 20.1.1.3.6.1. The taxpayer has maintained a clean compliance history for the three tax years preceding the year(s) for which penalties are assessed. All required returns have now been filed and any balance due has been paid or is subject to an approved payment arrangement. The taxpayer meets all criteria for this administrative relief.`,
  },
  {
    id: 'erroneous_irs_advice',
    name: 'Erroneous IRS Advice',
    irm_reference: 'IRM 20.1.1.3.2.2.3',
    description: 'Taxpayer received incorrect advice from IRS that caused failure',
    required_documentation: [
      'Written IRS communication',
      'Notes of IRS conversations with dates/employee IDs',
      'Evidence taxpayer followed advice',
    ],
    strength: 'strong',
    sample_language: `The taxpayer received erroneous advice from the IRS on [DATE] indicating that [INCORRECT ADVICE]. In reasonable reliance on this official guidance from the IRS, the taxpayer [ACTION TAKEN]. This reliance on incorrect IRS advice directly caused the failure to [file/pay] timely. Attached is documentation of this communication.`,
  },
  {
    id: 'ignorance_of_law',
    name: 'Ignorance of Filing Requirements',
    irm_reference: 'IRM 20.1.1.3.2.2.8',
    description: 'Limited circumstances where taxpayer genuinely did not know of obligation',
    required_documentation: [
      'Evidence of circumstances (new to workforce, immigrant, etc.)',
      'No prior filing history',
      'Low income history',
    ],
    strength: 'weak',
    sample_language: `The taxpayer was genuinely unaware of the requirement to file a tax return due to [CIRCUMSTANCES]. The taxpayer had [never earned sufficient income/recently immigrated/other]. Upon learning of this obligation, the taxpayer immediately took steps to come into compliance. While ignorance of the law is generally not an excuse, the taxpayer's particular circumstances warrant consideration.`,
  },
];

// ============================================================================
// IRS NOTICE PROGRESSION
// ============================================================================

export interface IRSNoticeInfo {
  code: IRSNotice;
  title: string;
  stage: number;
  description: string;
  response_deadline: string;
  consequence_if_ignored: string;
  recommended_action: string[];
  urgency: RiskLevel;
}

export const IRS_NOTICE_PROGRESSION: IRSNoticeInfo[] = [
  {
    code: 'CP59',
    title: 'First Notice - No Tax Return Filed',
    stage: 1,
    description: 'Initial notice that IRS has no record of a filed return',
    response_deadline: '30 days',
    consequence_if_ignored: 'Escalation to CP515',
    recommended_action: [
      'Order wage and income transcripts',
      'Determine if return is actually required',
      'Begin preparing return if required',
      'File return or respond explaining why not required',
    ],
    urgency: 'low',
  },
  {
    code: 'CP515',
    title: 'Second Notice - Request for Tax Return',
    stage: 2,
    description: 'Second request for unfiled return with stronger language',
    response_deadline: '30 days',
    consequence_if_ignored: 'Escalation to CP516, potential SFR',
    recommended_action: [
      'Immediately begin return preparation',
      'Consider requesting filing extension',
      'Respond to IRS acknowledging receipt',
      'Request additional time if needed with explanation',
    ],
    urgency: 'medium',
  },
  {
    code: 'CP516',
    title: 'Third Notice - Final Request Before SFR',
    stage: 3,
    description: 'Final warning before IRS prepares Substitute for Return',
    response_deadline: '30 days',
    consequence_if_ignored: 'IRS will file SFR under IRC § 6020(b)',
    recommended_action: [
      'File return IMMEDIATELY - this is urgent',
      'Even partial return is better than SFR',
      'Call IRS to request brief hold on SFR',
      'Provide any documentation of progress',
    ],
    urgency: 'high',
  },
  {
    code: 'CP518',
    title: 'Final Notice Before SFR Assessment',
    stage: 4,
    description: 'Last chance to file before SFR is processed',
    response_deadline: '10 days',
    consequence_if_ignored: 'SFR will be assessed, Notice of Deficiency may follow',
    recommended_action: [
      'FILE IMMEDIATELY - days matter',
      'Fax return if possible for fastest processing',
      'Call IRS to confirm receipt',
      'Request SFR reconsideration if already assessed',
    ],
    urgency: 'critical',
  },
  {
    code: 'CP2000',
    title: 'Proposed Changes to Return',
    stage: 0,
    description: 'IRS matching program found unreported income',
    response_deadline: '30 days',
    consequence_if_ignored: 'Assessment of proposed changes',
    recommended_action: [
      'Review all items in CP2000 carefully',
      'Gather documentation for any disputed items',
      'Respond with agreement or disagreement',
      'Request meeting with examiner if complex',
    ],
    urgency: 'medium',
  },
  {
    code: 'LT11',
    title: 'Final Notice of Intent to Levy',
    stage: 5,
    description: 'Notice of intent to levy with CDP rights',
    response_deadline: '30 days for CDP hearing request',
    consequence_if_ignored: 'Levy action, loss of CDP rights',
    recommended_action: [
      'REQUEST CDP HEARING IMMEDIATELY',
      'Form 12153 - Request for CDP Hearing',
      'Propose collection alternative',
      'File missing returns before hearing',
    ],
    urgency: 'critical',
  },
  {
    code: 'Letter1058',
    title: 'Final Notice of Intent to Levy',
    stage: 5,
    description: 'Alternative version of levy notice (LT11)',
    response_deadline: '30 days for CDP hearing request',
    consequence_if_ignored: 'Levy action, loss of CDP rights',
    recommended_action: [
      'Same as LT11 - request CDP hearing',
      'Do not ignore - levy is imminent',
      'Consider Taxpayer Advocate if emergency',
      'File all missing returns',
    ],
    urgency: 'critical',
  },
  {
    code: 'LT16',
    title: 'Notice of Federal Tax Lien Filing',
    stage: 4,
    description: 'Tax lien has been filed, affecting credit',
    response_deadline: '30 days for CDP hearing (if first lien)',
    consequence_if_ignored: 'Lien remains, credit damaged',
    recommended_action: [
      'Request CDP hearing if eligible',
      'Pay in full if possible for lien release',
      'Request lien withdrawal if appropriate',
      'Consider subordination for specific transactions',
    ],
    urgency: 'high',
  },
  {
    code: 'CP504',
    title: 'Notice of Intent to Seize Property',
    stage: 4,
    description: 'Intent to seize state tax refund or property',
    response_deadline: 'Varies',
    consequence_if_ignored: 'State refund seizure, potential property levy',
    recommended_action: [
      'Contact IRS immediately',
      'Propose payment plan',
      'File any missing returns',
      'Document any hardship',
    ],
    urgency: 'high',
  },
  {
    code: 'none',
    title: 'No Notice Received',
    stage: 0,
    description: 'Taxpayer proactively seeking compliance',
    response_deadline: 'N/A',
    consequence_if_ignored: 'N/A',
    recommended_action: [
      'Order transcripts to verify IRS records',
      'Begin voluntary compliance process',
      'Prepare all missing returns',
      'Consider voluntary disclosure if warranted',
    ],
    urgency: 'low',
  },
];

// ============================================================================
// RESOLUTION PATHS
// ============================================================================

export interface ResolutionPath {
  id: string;
  name: string;
  description: string;
  eligibility_criteria: string[];
  required_forms: string[];
  timeline: string;
  pros: string[];
  cons: string[];
  best_for: string;
}

export const RESOLUTION_PATHS: ResolutionPath[] = [
  {
    id: 'file_only',
    name: 'File Returns Only (Pay in Full)',
    description: 'File all missing returns and pay balance in full',
    eligibility_criteria: [
      'Ability to pay full balance',
      'All returns can be prepared',
      'No complex collection issues',
    ],
    required_forms: ['Missing tax returns', 'Payment'],
    timeline: '1-3 months',
    pros: [
      'Cleanest resolution',
      'Stops all penalties immediately',
      'No ongoing payment obligations',
      'Eligible for penalty abatement',
    ],
    cons: [
      'Requires full payment ability',
      'May need significant funds',
    ],
    best_for: 'Taxpayers with ability to pay who want clean resolution',
  },
  {
    id: 'installment_agreement',
    name: 'Installment Agreement (IA)',
    description: 'File returns and pay over time with monthly payments',
    eligibility_criteria: [
      'Balance under $50,000 for streamlined',
      'Ability to make monthly payments',
      'All returns filed or about to be filed',
    ],
    required_forms: ['Form 9465 or Online Payment Agreement', 'Form 433-D (Direct Debit)'],
    timeline: '3-6 months setup, 72 months payment',
    pros: [
      'Manageable monthly payments',
      'Stops enforced collection',
      'Can be done online for smaller balances',
      'Penalty continues but collection stops',
    ],
    cons: [
      'Interest continues to accrue',
      'FTP penalty continues (reduced rate)',
      'Default can restart collection',
    ],
    best_for: 'Taxpayers who can pay but need time',
  },
  {
    id: 'cnc',
    name: 'Currently Not Collectible (CNC)',
    description: 'IRS temporarily suspends collection due to hardship',
    eligibility_criteria: [
      'Expenses exceed income',
      'No significant assets',
      'Demonstrated financial hardship',
    ],
    required_forms: ['Form 433-A/433-F (Collection Information Statement)'],
    timeline: 'Reviewed annually, can last until CSED',
    pros: [
      'No payments required',
      'Stops enforced collection',
      'Can last until statute expires',
      'Provides breathing room',
    ],
    cons: [
      'Debt remains',
      'Interest and penalties continue',
      'Tax lien typically remains',
      'Annual review by IRS',
    ],
    best_for: 'Taxpayers with genuine hardship, no payment ability',
  },
  {
    id: 'oic_doubt_collectibility',
    name: 'Offer in Compromise (Doubt as to Collectibility)',
    description: 'Settle tax debt for less than full amount owed',
    eligibility_criteria: [
      'All returns filed',
      'Current with estimated taxes',
      'Not in bankruptcy',
      'Reasonable collection potential less than liability',
    ],
    required_forms: ['Form 656', 'Form 433-A (OIC)', '$205 application fee', '20% initial payment'],
    timeline: '12-24 months for decision',
    pros: [
      'Can settle for pennies on dollar',
      'Fresh start after acceptance',
      'Collection suspended during review',
      'Tax liens released after payment',
    ],
    cons: [
      'Long process',
      'Application fee and initial payment',
      'Must stay compliant for 5 years after',
      'Refunds applied to offer for compliance period',
    ],
    best_for: 'Taxpayers with large debt, limited collection potential',
  },
  {
    id: 'penalty_abatement',
    name: 'Penalty Abatement Request',
    description: 'Request removal of penalties due to reasonable cause or FTA',
    eligibility_criteria: [
      'Returns now filed',
      'Reasonable cause exists OR clean compliance history (FTA)',
      'Tax and interest paid or in payment plan',
    ],
    required_forms: ['Form 843 or written request', 'Supporting documentation'],
    timeline: '1-3 months for decision',
    pros: [
      'Can remove significant penalties',
      'FTA is administrative (no cause needed)',
      'Multiple years can be requested',
      'Can be combined with other relief',
    ],
    cons: [
      'Interest not abated',
      'Must have valid reason or FTA eligibility',
      'Requires documentation for reasonable cause',
    ],
    best_for: 'All non-filers with good excuse or clean prior history',
  },
  {
    id: 'appeals',
    name: 'IRS Appeals',
    description: 'Appeal disputed assessments or denials to IRS Appeals Office',
    eligibility_criteria: [
      'Disagreement with IRS determination',
      'Not yet in Tax Court',
      'Requested within timeframe',
    ],
    required_forms: ['Form 12203 (Request for Appeals Review)', 'Written protest if over $25,000'],
    timeline: '6-12 months',
    pros: [
      'Independent review',
      'Settlement authority',
      'Less formal than court',
      'Collection on hold during appeal',
    ],
    cons: [
      'Can be lengthy',
      'Interest continues',
      'May not resolve in your favor',
    ],
    best_for: 'Taxpayers with legitimate disputes on liability or penalties',
  },
  {
    id: 'cdp_hearing',
    name: 'Collection Due Process (CDP) Hearing',
    description: 'Formal hearing before Appeals to challenge collection action',
    eligibility_criteria: [
      'Received LT11, Letter 1058, or first lien notice',
      'Request within 30 days of notice',
      'Not previously had CDP hearing for same periods',
    ],
    required_forms: ['Form 12153 - Request for Collection Due Process Hearing'],
    timeline: '6-18 months',
    pros: [
      'Stops collection during hearing',
      'Can challenge liability (if not previously contested)',
      'Can propose alternatives',
      'Right to Tax Court review',
    ],
    cons: [
      'Strict 30-day deadline',
      'Only one CDP hearing per tax period',
      'Interest continues',
    ],
    best_for: 'Taxpayers facing imminent levy who need time and options',
  },
];

// ============================================================================
// RISK ASSESSMENT
// ============================================================================

export interface RiskAssessment {
  overall_risk: RiskLevel;
  enforcement_risk: RiskLevel;
  sfr_risk: RiskLevel;
  levy_risk: RiskLevel;
  criminal_risk: RiskLevel;
  factors: string[];
  recommendations: string[];
}

export function assessRisk(input: NonFilerCaseInput): RiskAssessment {
  const factors: string[] = [];
  const recommendations: string[] = [];

  let enforcementScore = 0;
  let sfrScore = 0;
  let levyScore = 0;
  let criminalScore = 0;

  // Number of years missing
  const yearsMissing = input.tax_years_missing.length;
  if (yearsMissing >= 6) {
    enforcementScore += 3;
    sfrScore += 3;
    factors.push(`${yearsMissing} years of unfiled returns is extremely concerning`);
  } else if (yearsMissing >= 3) {
    enforcementScore += 2;
    sfrScore += 2;
    factors.push(`${yearsMissing} years of unfiled returns is significant`);
  } else {
    enforcementScore += 1;
    sfrScore += 1;
    factors.push(`${yearsMissing} year(s) of unfiled returns`);
  }

  // Income type risk
  if (input.income_type === 'w2') {
    enforcementScore += 2;
    factors.push('W-2 income is fully reported to IRS - they know you earned income');
    sfrScore += 2;
  } else if (input.income_type === '1099') {
    enforcementScore += 2;
    factors.push('1099 income is reported to IRS');
    sfrScore += 2;
  } else if (input.income_type === 'self_employed') {
    factors.push('Self-employment income may not be fully visible to IRS');
  } else if (input.income_type === 'crypto') {
    factors.push('Crypto income increasingly tracked by IRS');
    enforcementScore += 1;
  } else if (input.income_type === 'foreign') {
    factors.push('Foreign income has additional reporting requirements');
    criminalScore += 1;
  }

  // IRS notice stage
  const noticeInfo = IRS_NOTICE_PROGRESSION.find(n => n.code === input.irs_notice_received);
  if (noticeInfo) {
    if (noticeInfo.stage >= 5) {
      levyScore += 4;
      factors.push(`CRITICAL: ${noticeInfo.title} - Levy action imminent`);
      recommendations.push('REQUEST CDP HEARING IMMEDIATELY using Form 12153');
    } else if (noticeInfo.stage >= 3) {
      sfrScore += 3;
      levyScore += 2;
      factors.push(`${noticeInfo.title} - IRS actively pursuing`);
      recommendations.push('File returns immediately to avoid SFR assessment');
    } else if (noticeInfo.stage >= 1) {
      enforcementScore += 1;
      factors.push(`${noticeInfo.title} - Early stage, time to act`);
      recommendations.push('Respond promptly to IRS correspondence');
    }
  }

  // SFR status
  if (input.is_sfr_assessed === 'yes') {
    sfrScore += 3;
    levyScore += 2;
    factors.push('SFR already assessed - liability likely overstated');
    recommendations.push('File original returns to replace SFR and potentially reduce liability');
  }

  // Revenue Officer assigned
  if (input.assigned_revenue_officer) {
    enforcementScore += 3;
    levyScore += 3;
    factors.push('Revenue Officer assigned - active enforcement case');
    recommendations.push('Maintain contact with RO and provide requested information promptly');
  }

  // Estimated liability
  if (input.estimated_liability) {
    if (input.estimated_liability >= 100000) {
      enforcementScore += 3;
      levyScore += 2;
      criminalScore += 1;
      factors.push(`High estimated liability ($${input.estimated_liability.toLocaleString()})`);
    } else if (input.estimated_liability >= 25000) {
      enforcementScore += 2;
      levyScore += 1;
      factors.push(`Moderate estimated liability ($${input.estimated_liability.toLocaleString()})`);
    }
  }

  // Criminal risk factors
  if (yearsMissing >= 6 && input.ability_to_pay !== 'none') {
    criminalScore += 1;
    factors.push('Pattern of non-filing with ability to pay increases criminal risk');
  }

  if (input.income_type === 'foreign' && yearsMissing >= 3) {
    criminalScore += 1;
    factors.push('Unreported foreign income can trigger criminal investigation');
  }

  // Mitigating factors
  if (input.hardship_status) {
    enforcementScore -= 1;
    factors.push('Financial hardship may support CNC status or OIC');
    recommendations.push('Document hardship thoroughly for collection alternatives');
  }

  if (input.medical_issues || input.mental_health_issues) {
    enforcementScore -= 1;
    factors.push('Medical/mental health issues support reasonable cause');
    recommendations.push('Obtain medical documentation for penalty abatement request');
  }

  if (input.prior_compliance_history === 'good') {
    enforcementScore -= 1;
    factors.push('Good prior compliance history supports FTA request');
    recommendations.push('Request First Time Penalty Abatement');
  }

  // Calculate risk levels
  const getLevel = (score: number): RiskLevel => {
    if (score >= 6) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  };

  return {
    overall_risk: getLevel(Math.max(enforcementScore, sfrScore, levyScore)),
    enforcement_risk: getLevel(enforcementScore),
    sfr_risk: getLevel(sfrScore),
    levy_risk: getLevel(levyScore),
    criminal_risk: getLevel(criminalScore),
    factors,
    recommendations,
  };
}

// ============================================================================
// TIMELINE GENERATOR
// ============================================================================

export interface TimelinePhase {
  phase: string;
  timeframe: string;
  actions: TimelineAction[];
}

export interface TimelineAction {
  action: string;
  deadline: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  form_or_resource?: string;
  notes?: string;
}

export function generateTimeline(input: NonFilerCaseInput): TimelinePhase[] {
  const timeline: TimelinePhase[] = [];
  const risk = assessRisk(input);

  // PHASE 1: IMMEDIATE (0-30 days)
  const immediateActions: TimelineAction[] = [
    {
      action: 'Stop ignoring IRS notices - acknowledge the situation',
      deadline: 'Day 1',
      priority: 'critical',
      notes: 'Avoidance makes everything worse',
    },
    {
      action: 'Order IRS transcripts for all missing years',
      deadline: 'Day 1-3',
      priority: 'critical',
      form_or_resource: 'Form 4506-T or IRS Online Account',
      notes: 'Request Wage & Income Transcripts and Account Transcripts',
    },
    {
      action: 'Gather available financial records',
      deadline: 'Day 1-7',
      priority: 'high',
      notes: 'Bank statements, 1099s, W-2s, expense records',
    },
    {
      action: 'Determine if returns are actually required',
      deadline: 'Day 7-14',
      priority: 'high',
      notes: 'Compare income to filing thresholds',
    },
  ];

  // Add urgent actions based on notice stage
  const noticeInfo = IRS_NOTICE_PROGRESSION.find(n => n.code === input.irs_notice_received);
  if (noticeInfo && noticeInfo.stage >= 5) {
    immediateActions.unshift({
      action: 'REQUEST CDP HEARING IMMEDIATELY',
      deadline: 'Within 30 days of notice date',
      priority: 'critical',
      form_or_resource: 'Form 12153',
      notes: 'This is a statutory deadline - missing it waives important rights',
    });
  }

  if (input.is_sfr_assessed === 'yes') {
    immediateActions.push({
      action: 'Order SFR assessment details',
      deadline: 'Day 1-7',
      priority: 'critical',
      form_or_resource: 'Request via IRS phone or transcript',
      notes: 'Need to know exactly what IRS assessed to file corrected return',
    });
  }

  timeline.push({
    phase: 'PHASE 1 - IMMEDIATE',
    timeframe: '0-30 days',
    actions: immediateActions,
  });

  // PHASE 2: COMPLIANCE (30-90 days)
  const complianceActions: TimelineAction[] = [
    {
      action: 'Prepare all missing tax returns',
      deadline: 'Day 30-60',
      priority: 'critical',
      notes: 'Use transcripts to verify income; include all deductions',
    },
    {
      action: 'File all missing returns',
      deadline: 'Day 60-75',
      priority: 'critical',
      notes: 'File all at once or in order from oldest to newest',
    },
    {
      action: 'Submit penalty abatement request',
      deadline: 'Day 75-90',
      priority: 'high',
      form_or_resource: 'Form 843 or written request',
      notes: 'Include reasonable cause documentation or request FTA',
    },
  ];

  if (input.is_sfr_assessed === 'yes') {
    complianceActions.push({
      action: 'Request SFR reconsideration with original returns',
      deadline: 'With return filing',
      priority: 'critical',
      notes: 'Original return supersedes SFR - likely reduces liability',
    });
  }

  if (input.irs_notice_received !== 'none') {
    complianceActions.push({
      action: 'Respond to most recent IRS notice',
      deadline: 'Per notice deadline',
      priority: 'critical',
      notes: 'Acknowledge receipt and provide update on compliance progress',
    });
  }

  timeline.push({
    phase: 'PHASE 2 - COMPLIANCE',
    timeframe: '30-90 days',
    actions: complianceActions,
  });

  // PHASE 3: RESOLUTION (3-12 months)
  const resolutionActions: TimelineAction[] = [];

  if (input.ability_to_pay === 'full') {
    resolutionActions.push({
      action: 'Pay balance in full',
      deadline: 'Upon receiving accurate assessment',
      priority: 'high',
      notes: 'Cleanest resolution; stops all penalties and interest',
    });
  } else if (input.ability_to_pay === 'moderate' || input.ability_to_pay === 'low') {
    resolutionActions.push({
      action: 'Apply for Installment Agreement',
      deadline: 'After returns filed',
      priority: 'high',
      form_or_resource: 'Form 9465 or Online Payment Agreement',
      notes: 'Streamlined IA available for balances under $50,000',
    });
  } else if (input.ability_to_pay === 'none') {
    resolutionActions.push({
      action: 'Request Currently Not Collectible status',
      deadline: 'After returns filed',
      priority: 'high',
      form_or_resource: 'Form 433-A or 433-F',
      notes: 'Document hardship thoroughly',
    });
    resolutionActions.push({
      action: 'Evaluate Offer in Compromise eligibility',
      deadline: 'After CNC determination',
      priority: 'medium',
      form_or_resource: 'IRS Pre-Qualifier Tool, then Form 656',
      notes: 'OIC may provide permanent resolution',
    });
  }

  resolutionActions.push({
    action: 'Appeal if penalty abatement denied',
    deadline: '30 days from denial',
    priority: 'medium',
    form_or_resource: 'Form 12203 or written protest',
  });

  resolutionActions.push({
    action: 'Monitor account for accurate posting of returns',
    deadline: 'Ongoing',
    priority: 'medium',
    notes: 'Verify penalties recalculated after returns filed',
  });

  timeline.push({
    phase: 'PHASE 3 - RESOLUTION',
    timeframe: '3-12 months',
    actions: resolutionActions,
  });

  // PHASE 4: LONG-TERM PROTECTION
  const longTermActions: TimelineAction[] = [
    {
      action: 'Maintain filing compliance going forward',
      deadline: 'Ongoing',
      priority: 'critical',
      notes: 'File all future returns timely to protect FTA eligibility',
    },
    {
      action: 'Adjust withholding or make estimated payments',
      deadline: 'Immediately',
      priority: 'high',
      form_or_resource: 'Form W-4 or 1040-ES',
      notes: 'Prevent future balance due situations',
    },
    {
      action: 'Establish recordkeeping system',
      deadline: 'Within 30 days',
      priority: 'medium',
      notes: 'Maintain organized records to simplify future filings',
    },
    {
      action: 'Calendar all tax deadlines',
      deadline: 'Within 30 days',
      priority: 'medium',
      notes: 'Set reminders for estimated payments and filing deadlines',
    },
    {
      action: 'Consider engaging tax professional for ongoing compliance',
      deadline: 'Before next filing season',
      priority: 'medium',
      notes: 'Professional help prevents future non-filing situations',
    },
  ];

  if (input.ability_to_pay === 'low' || input.ability_to_pay === 'none') {
    longTermActions.push({
      action: 'Monitor Collection Statute Expiration Date (CSED)',
      deadline: 'Ongoing',
      priority: 'medium',
      notes: 'Debt expires 10 years from assessment date',
    });
  }

  timeline.push({
    phase: 'PHASE 4 - LONG-TERM PROTECTION',
    timeframe: 'Ongoing',
    actions: longTermActions,
  });

  return timeline;
}

// ============================================================================
// LETTER TEMPLATES
// ============================================================================

export interface LetterTemplate {
  id: string;
  name: string;
  purpose: string;
  recipient: string;
  generate: (input: NonFilerCaseInput) => string;
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'non_filer_response',
    name: 'Non-Filer Response Letter',
    purpose: 'Initial response to IRS notice about unfiled returns',
    recipient: 'IRS Service Center or Assigned Agent',
    generate: (input: NonFilerCaseInput) => {
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const noticeInfo = IRS_NOTICE_PROGRESSION.find(n => n.code === input.irs_notice_received);

      return `${today}

Internal Revenue Service
[ADDRESS FROM NOTICE]

Re: Response to ${noticeInfo?.title || 'Notice of Unfiled Returns'}
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_missing.join(', ')}
    Notice Date: [INSERT NOTICE DATE]

Dear Sir or Madam:

This letter is in response to the above-referenced notice regarding unfiled tax returns for the tax year(s) listed above. I acknowledge receipt of this notice and am writing to inform you that I am taking immediate steps to come into full compliance with my federal tax filing obligations.

CURRENT STATUS:

I am currently in the process of gathering the necessary documentation to prepare and file the required return(s). I have requested wage and income transcripts from the IRS and am working to compile all required information.

${input.records_available === 'lost' ? `
RECORDS AVAILABILITY:

Unfortunately, my financial records for the period(s) in question were [lost/destroyed] due to [CIRCUMSTANCES]. I am working to reconstruct these records using IRS transcripts and third-party records. This process may require additional time, but I am committed to filing accurate returns as soon as possible.
` : ''}

${input.hardship_status ? `
FINANCIAL CIRCUMSTANCES:

I am currently experiencing significant financial hardship, which has contributed to my inability to address this matter sooner. I intend to apply for appropriate collection relief once the returns are filed.
` : ''}

PROPOSED TIMELINE:

I expect to file the required return(s) within the next [30/60/90] days. I respectfully request that the IRS refrain from taking enforcement action during this period while I work to come into compliance.

I understand my obligation to file tax returns and am committed to maintaining full compliance going forward. I appreciate your patience and cooperation as I work to resolve this matter.

If you have any questions or require additional information, please contact me at [PHONE] or [ADDRESS].

Respectfully submitted,


_________________________
${input.taxpayer_name}
Date: ${today}`;
    },
  },

  {
    id: 'reasonable_cause_abatement',
    name: 'Reasonable Cause Penalty Abatement Letter',
    purpose: 'Request abatement of failure to file/pay penalties based on reasonable cause',
    recipient: 'IRS Penalty Abatement Unit',
    generate: (input: NonFilerCaseInput) => {
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Determine applicable reasonable causes
      const causes: string[] = [];
      if (input.medical_issues) causes.push('serious_illness');
      if (input.mental_health_issues) causes.push('mental_health');
      if (input.natural_disaster) causes.push('natural_disaster');
      if (input.records_available === 'lost') causes.push('records_destroyed');
      if (input.was_relying_on_advisor) causes.push('reliance_on_professional');
      if (input.hardship_status) causes.push('financial_hardship');
      if (input.prior_compliance_history === 'good') causes.push('first_time_penalty');

      const causeDetails = causes.map(c => REASONABLE_CAUSE_CATEGORIES.find(cat => cat.id === c));

      return `${today}

Internal Revenue Service
Penalty Abatement Unit
[ADDRESS FROM NOTICE]

Re: Request for Penalty Abatement Under IRC § 6651
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_missing.join(', ')}
    Penalty Type: Failure to File / Failure to Pay

Dear Sir or Madam:

I respectfully request abatement of penalties assessed under IRC § 6651(a)(1) (failure to file) and/or IRC § 6651(a)(2) (failure to pay) for the tax year(s) listed above. This request is made pursuant to IRM 20.1.1.3 (Reasonable Cause) and applicable provisions.

GROUNDS FOR ABATEMENT:

${input.prior_compliance_history === 'good' ? `
1. FIRST TIME PENALTY ABATEMENT (IRM 20.1.1.3.6.1)

I request First Time Penalty Abatement based on my clean compliance history. Prior to the year(s) in question:
   • I filed all required returns timely
   • I paid all taxes owed or had acceptable payment arrangements
   • I have not previously received penalty abatement under this provision

I meet all criteria for administrative relief under the FTA policy.
` : ''}

${causeDetails.filter(c => c && c.id !== 'first_time_penalty').map((cause, idx) => `
${idx + 1}. ${cause!.name.toUpperCase()} (${cause!.irm_reference})

${cause!.sample_language}

Required Documentation: ${cause!.required_documentation.map(d => `\n   • ${d}`).join('')}
`).join('\n')}

COMPLIANCE STATUS:

I have now filed all required returns and [have paid the tax in full / am current on an installment agreement / have applied for collection alternative]. I am committed to maintaining full compliance going forward.

LEGAL BASIS:

Under IRC § 6651(a), penalties may be abated upon showing reasonable cause and absence of willful neglect. The IRM provides that circumstances beyond the taxpayer's control that prevented compliance constitute reasonable cause. The factors cited above demonstrate that my failure to [file/pay] timely was due to circumstances beyond my control, not willful neglect.

RELIEF REQUESTED:

I respectfully request that all failure to file and failure to pay penalties for tax year(s) ${input.tax_years_missing.join(', ')} be abated in full.

Supporting documentation is attached. If you require any additional information, please contact me at [PHONE].

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures:
${causeDetails.flatMap(c => c?.required_documentation || []).map(d => `- ${d}`).join('\n')}`;
    },
  },

  {
    id: 'sfr_reconsideration',
    name: 'SFR Reconsideration Letter',
    purpose: 'Request reconsideration of Substitute for Return assessment',
    recipient: 'IRS Examination Division',
    generate: (input: NonFilerCaseInput) => {
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      return `${today}

Internal Revenue Service
[ADDRESS FROM NOTICE / REVENUE OFFICER]

Re: Request for Reconsideration of Substitute for Return
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_missing.join(', ')}

Dear Sir or Madam:

I am writing to request reconsideration of the Substitute for Return (SFR) prepared by the IRS under IRC § 6020(b) for the tax year(s) listed above. Enclosed please find my original return(s) for these period(s), which I request supersede the SFR assessment.

BACKGROUND:

The IRS prepared Substitute for Return(s) for the above tax year(s) due to my failure to file timely returns. I acknowledge this failure and have now prepared accurate original returns based on my actual income, deductions, and credits.

REASON FOR ORIGINAL RETURN FILING:

The SFR prepared by the IRS [does not include / incorrectly states] the following items:

1. Filing Status: The SFR used [INCORRECT STATUS]. My correct filing status is ${input.filing_status.toUpperCase()}.

2. Deductions: The SFR did not include [standard/itemized] deductions to which I am entitled.

3. Exemptions/Credits: The SFR did not include [applicable exemptions/credits].

4. Income Adjustments: [If applicable, describe any income adjustments]

CORRECTED LIABILITY:

Based on my original return(s):
   • Gross Income: $[AMOUNT]
   • Adjusted Gross Income: $[AMOUNT]
   • Taxable Income: $[AMOUNT]
   • Tax Liability: $[AMOUNT]
   • Credits: $[AMOUNT]
   • Tax Due: $[AMOUNT]

This represents a [reduction/confirmation] of $[AMOUNT] from the SFR assessment.

REQUEST:

I respectfully request that:
1. The enclosed original return(s) be accepted and processed
2. The SFR assessment(s) be adjusted to reflect the correct liability
3. Penalties be recalculated based on the corrected liability
4. I be provided with an updated account transcript upon processing

I understand that interest and penalties will continue to apply to any unpaid balance, and I [have enclosed payment / am requesting an installment agreement / am requesting collection alternative consideration].

If you have questions or require additional documentation, please contact me at [PHONE].

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures:
- Original Form 1040 for tax year ${input.tax_years_missing.join('\n- Original Form 1040 for tax year ')}
- Supporting schedules and documentation
- Wage and income transcript verification`;
    },
  },

  {
    id: 'enforcement_delay',
    name: 'Request to Delay Enforcement',
    purpose: 'Request temporary hold on collection while coming into compliance',
    recipient: 'IRS Collections or Assigned Revenue Officer',
    generate: (input: NonFilerCaseInput) => {
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      return `${today}

Internal Revenue Service
${input.assigned_revenue_officer ? 'Attention: [REVENUE OFFICER NAME]' : '[COLLECTION ADDRESS FROM NOTICE]'}

Re: Request for Temporary Delay of Enforcement Action
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_missing.join(', ')}

Dear ${input.assigned_revenue_officer ? '[Revenue Officer Name]' : 'Sir or Madam'}:

I am writing to request a temporary delay of enforcement action while I work to come into full compliance with my federal tax obligations. I understand the seriousness of my situation and am actively taking steps to resolve this matter.

CURRENT COMPLIANCE EFFORTS:

I am currently:
   ☐ Gathering financial records for return preparation
   ☐ Working with a tax professional to prepare missing returns
   ☐ Reconstructing records using IRS transcripts
   ☐ [Other specific actions being taken]

PROPOSED TIMELINE:

I propose the following compliance schedule:
   • [DATE]: Complete record gathering
   • [DATE]: Complete return preparation
   • [DATE]: File all missing returns
   • [DATE]: Address payment arrangements

REQUEST:

I respectfully request that the IRS:
   1. Delay any levy or seizure action for [30/60/90] days
   2. Not file additional tax liens during this period
   3. Allow me to complete voluntary compliance

${input.hardship_status ? `
HARDSHIP CIRCUMSTANCES:

Enforcement action at this time would cause significant hardship because [DESCRIBE CIRCUMSTANCES]. I request that this be considered in determining whether to proceed with collection activity.
` : ''}

I am committed to resolving this matter and maintaining full compliance. I will provide updates on my progress and respond promptly to any IRS requests.

Contact Information: [PHONE] | [EMAIL] | [ADDRESS]

Respectfully submitted,


_________________________
${input.taxpayer_name}`;
    },
  },

  {
    id: 'hardship_status',
    name: 'Hardship Status Letter',
    purpose: 'Request Currently Not Collectible status due to hardship',
    recipient: 'IRS Collections',
    generate: (input: NonFilerCaseInput) => {
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      return `${today}

Internal Revenue Service
Collections Division
[ADDRESS]

Re: Request for Currently Not Collectible Status (Hardship)
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_missing.join(', ')}

Dear Sir or Madam:

I am writing to request that my account be placed in Currently Not Collectible (CNC) status pursuant to IRM 5.16 due to demonstrated financial hardship. I cannot pay my tax liability without causing significant economic hardship to myself and my family.

CURRENT FINANCIAL SITUATION:

Monthly Income:    $${input.monthly_income?.toLocaleString() || '[AMOUNT]'}
Monthly Expenses:  $${input.monthly_expenses?.toLocaleString() || '[AMOUNT]'}
Net Available:     $${((input.monthly_income || 0) - (input.monthly_expenses || 0)).toLocaleString() || '[AMOUNT]'}

Assets:            $${input.current_assets?.toLocaleString() || '[AMOUNT]'}
Total Liability:   $${input.estimated_liability?.toLocaleString() || '[AMOUNT]'}

HARDSHIP FACTORS:

${input.medical_issues ? '• Significant medical expenses / ongoing medical treatment\n' : ''}${input.hardship_status ? '• Income insufficient to meet basic living expenses\n' : ''}${input.ability_to_pay === 'none' ? '• No ability to make any payment toward liability\n' : ''}• [Additional factors specific to taxpayer]

COMPLIANCE STATUS:

I have filed all required returns and am current with my filing obligations. I am committed to maintaining compliance going forward.

LEGAL BASIS:

Under IRC § 6343 and IRM 5.16, the IRS must consider whether collection would cause economic hardship. When a taxpayer's allowable expenses equal or exceed income, collection is generally not pursued.

REQUEST:

I respectfully request:
   1. That my account be designated Currently Not Collectible
   2. That enforced collection action be suspended
   3. Annual review rather than active collection

I understand that:
   • Interest and penalties will continue to accrue
   • The IRS may retain existing tax liens
   • My status may be reviewed annually
   • The collection statute continues to run

Enclosed is Form 433-A (Collection Information Statement) with supporting documentation.

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures:
- Form 433-A (Collection Information Statement)
- Last 3 months bank statements
- Proof of income
- Proof of expenses
- Medical documentation (if applicable)`;
    },
  },

  {
    id: 'records_reconstruction',
    name: 'Records Reconstruction Explanation Letter',
    purpose: 'Explain reconstructed records methodology to IRS',
    recipient: 'IRS Examination or Collections',
    generate: (input: NonFilerCaseInput) => {
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      return `${today}

Internal Revenue Service
[ADDRESS]

Re: Explanation of Reconstructed Records
    Taxpayer: ${input.taxpayer_name}
    SSN: XXX-XX-${input.taxpayer_ssn_last4 || 'XXXX'}
    Tax Year(s): ${input.tax_years_missing.join(', ')}

Dear Sir or Madam:

The enclosed tax return(s) have been prepared using reconstructed records due to the unavailability of original documentation. This letter explains the methodology used to ensure the accuracy of the reported figures.

REASON FOR RECORD UNAVAILABILITY:

${input.records_available === 'lost' ?
`My original financial records for the tax year(s) in question were [lost/destroyed] due to [CIRCUMSTANCES, e.g., fire, flood, theft, computer failure]. This occurred on or about [DATE].` :
`Original records were only partially available. The following reconstruction methodology was used to complete the return(s) accurately.`}

RECONSTRUCTION METHODOLOGY:

1. IRS TRANSCRIPTS
   I obtained Wage and Income Transcripts (Form 4506-T) from the IRS, which provided:
   • W-2 information from employers
   • 1099 information from payers
   • Other information returns filed with the IRS

2. THIRD-PARTY RECORDS
   I obtained records from the following sources:
   • Bank statements from [INSTITUTION(S)]
   • Credit card statements from [ISSUER(S)]
   • Mortgage/rent records from [LENDER/LANDLORD]
   • [Other third-party sources]

3. RECONSTRUCTION APPROACH
   For each category of income and expense:

   INCOME:
   • Wages: Verified through IRS transcript and bank deposit analysis
   • Self-Employment: Reconstructed from bank deposits matching business activity
   • Interest/Dividends: Obtained from IRS transcript and financial institution records

   EXPENSES/DEDUCTIONS:
   • [Category]: Reconstructed from [source]
   • [Category]: Estimated based on [methodology]

4. CONSERVATIVE ESTIMATES
   Where exact figures could not be determined, I have used conservative estimates that:
   • Understate deductions where uncertain
   • Include all verifiable income
   • Are supported by available documentation

VERIFICATION:

The attached return reconciles with:
   • IRS Wage and Income Transcript: [Yes/Difference explained]
   • Bank deposit analysis: [Yes/Difference explained]
   • Available third-party records: [Yes/No]

I certify that the reconstructed records represent my best efforts to accurately report my tax liability for the year(s) in question. I have erred on the side of caution where documentation was unavailable.

If you require additional information or have questions about the reconstruction methodology, please contact me.

Respectfully submitted,


_________________________
${input.taxpayer_name}

Enclosures:
- IRS Wage and Income Transcripts
- Bank statements (available periods)
- Third-party verifications
- Reconstruction workpapers`;
    },
  },
];

// ============================================================================
// CASE ANALYZER - MAIN FUNCTION
// ============================================================================

export interface NonFilerCaseAnalysis {
  case_summary: string;
  risk_assessment: RiskAssessment;
  reasonable_cause_analysis: {
    applicable_causes: ReasonableCauseCategory[];
    strength_assessment: string;
    recommended_approach: string;
  };
  procedural_strategy: {
    current_stage: string;
    irs_next_likely_action: string;
    recommended_response: string[];
  };
  timeline: TimelinePhase[];
  best_resolution_path: ResolutionPath;
  generated_letters: { name: string; content: string }[];
}

export function analyzeNonFilerCase(input: NonFilerCaseInput): NonFilerCaseAnalysis {
  // Risk Assessment
  const risk = assessRisk(input);

  // Identify applicable reasonable causes
  const applicableCauses: ReasonableCauseCategory[] = [];
  if (input.medical_issues) {
    applicableCauses.push(REASONABLE_CAUSE_CATEGORIES.find(c => c.id === 'serious_illness')!);
  }
  if (input.mental_health_issues) {
    applicableCauses.push(REASONABLE_CAUSE_CATEGORIES.find(c => c.id === 'mental_health')!);
  }
  if (input.natural_disaster) {
    applicableCauses.push(REASONABLE_CAUSE_CATEGORIES.find(c => c.id === 'natural_disaster')!);
  }
  if (input.records_available === 'lost') {
    applicableCauses.push(REASONABLE_CAUSE_CATEGORIES.find(c => c.id === 'records_destroyed')!);
  }
  if (input.was_relying_on_advisor) {
    applicableCauses.push(REASONABLE_CAUSE_CATEGORIES.find(c => c.id === 'reliance_on_professional')!);
  }
  if (input.prior_compliance_history === 'good') {
    applicableCauses.push(REASONABLE_CAUSE_CATEGORIES.find(c => c.id === 'first_time_penalty')!);
  }

  // Determine procedural stage
  const noticeInfo = IRS_NOTICE_PROGRESSION.find(n => n.code === input.irs_notice_received);
  const currentStage = noticeInfo ? noticeInfo.title : 'Pre-Notice / Voluntary Compliance';
  const irsNextAction = noticeInfo
    ? noticeInfo.consequence_if_ignored
    : 'IRS may initiate delinquent return investigation';

  // Determine best resolution path
  let bestPath: ResolutionPath;
  if (input.ability_to_pay === 'full') {
    bestPath = RESOLUTION_PATHS.find(p => p.id === 'file_only')!;
  } else if (input.ability_to_pay === 'moderate') {
    bestPath = RESOLUTION_PATHS.find(p => p.id === 'installment_agreement')!;
  } else if (input.ability_to_pay === 'low') {
    if (input.estimated_liability && input.estimated_liability > 25000) {
      bestPath = RESOLUTION_PATHS.find(p => p.id === 'oic_doubt_collectibility')!;
    } else {
      bestPath = RESOLUTION_PATHS.find(p => p.id === 'installment_agreement')!;
    }
  } else {
    bestPath = RESOLUTION_PATHS.find(p => p.id === 'cnc')!;
  }

  // Generate timeline
  const timeline = generateTimeline(input);

  // Generate relevant letters
  const generatedLetters: { name: string; content: string }[] = [];

  // Always generate response letter if notice received
  if (input.irs_notice_received !== 'none') {
    const responseTemplate = LETTER_TEMPLATES.find(t => t.id === 'non_filer_response')!;
    generatedLetters.push({
      name: responseTemplate.name,
      content: responseTemplate.generate(input),
    });
  }

  // Generate penalty abatement if causes exist
  if (applicableCauses.length > 0) {
    const abatementTemplate = LETTER_TEMPLATES.find(t => t.id === 'reasonable_cause_abatement')!;
    generatedLetters.push({
      name: abatementTemplate.name,
      content: abatementTemplate.generate(input),
    });
  }

  // Generate SFR letter if applicable
  if (input.is_sfr_assessed === 'yes') {
    const sfrTemplate = LETTER_TEMPLATES.find(t => t.id === 'sfr_reconsideration')!;
    generatedLetters.push({
      name: sfrTemplate.name,
      content: sfrTemplate.generate(input),
    });
  }

  // Generate hardship letter if applicable
  if (input.hardship_status || input.ability_to_pay === 'none') {
    const hardshipTemplate = LETTER_TEMPLATES.find(t => t.id === 'hardship_status')!;
    generatedLetters.push({
      name: hardshipTemplate.name,
      content: hardshipTemplate.generate(input),
    });
  }

  // Generate records reconstruction letter if applicable
  if (input.records_available === 'lost' || input.records_available === 'partial') {
    const reconstructionTemplate = LETTER_TEMPLATES.find(t => t.id === 'records_reconstruction')!;
    generatedLetters.push({
      name: reconstructionTemplate.name,
      content: reconstructionTemplate.generate(input),
    });
  }

  // Build case summary
  const caseSummary = `
# NON-FILER CASE ANALYSIS
## ${input.taxpayer_name}

**Tax Years Missing:** ${input.tax_years_missing.join(', ')}
**Income Type:** ${input.income_type.toUpperCase()}
**IRS Notice Received:** ${noticeInfo?.title || 'None'}
**SFR Assessed:** ${input.is_sfr_assessed}
**Ability to Pay:** ${input.ability_to_pay.toUpperCase()}
**Prior Compliance:** ${input.prior_compliance_history.toUpperCase()}

---

## RISK ASSESSMENT

| Risk Category | Level |
|--------------|-------|
| **Overall Risk** | ${risk.overall_risk.toUpperCase()} |
| Enforcement Risk | ${risk.enforcement_risk.toUpperCase()} |
| SFR Risk | ${risk.sfr_risk.toUpperCase()} |
| Levy Risk | ${risk.levy_risk.toUpperCase()} |
| Criminal Risk | ${risk.criminal_risk.toUpperCase()} |

### Key Factors:
${risk.factors.map(f => `- ${f}`).join('\n')}

### Immediate Recommendations:
${risk.recommendations.map(r => `- ${r}`).join('\n')}

---

## PROCEDURAL STATUS

**Current Stage:** ${currentStage}
**IRS Likely Next Action:** ${irsNextAction}

---

## RECOMMENDED RESOLUTION PATH

**${bestPath.name}**

${bestPath.description}

**Timeline:** ${bestPath.timeline}

**Pros:**
${bestPath.pros.map(p => `- ${p}`).join('\n')}

**Cons:**
${bestPath.cons.map(c => `- ${c}`).join('\n')}

---

## PENALTY ABATEMENT STRATEGY

${applicableCauses.length > 0
  ? `**Applicable Grounds:**
${applicableCauses.map(c => `- ${c.name} (${c.irm_reference}) - Strength: ${c.strength.toUpperCase()}`).join('\n')}

**Recommended Approach:** ${applicableCauses.some(c => c.id === 'first_time_penalty')
    ? 'Lead with First Time Penalty Abatement request (administrative), with reasonable cause as backup.'
    : 'Submit comprehensive reasonable cause argument with supporting documentation.'}`
  : 'No strong reasonable cause factors identified. Focus on compliance and payment arrangements.'}

---

## ACTION TIMELINE

${timeline.map(phase => `
### ${phase.phase} (${phase.timeframe})

${phase.actions.map(a => `- [ ] **${a.priority.toUpperCase()}**: ${a.action}
      Deadline: ${a.deadline}${a.form_or_resource ? `\n      Form: ${a.form_or_resource}` : ''}${a.notes ? `\n      Note: ${a.notes}` : ''}`).join('\n')}`).join('\n')}
`;

  return {
    case_summary: caseSummary,
    risk_assessment: risk,
    reasonable_cause_analysis: {
      applicable_causes: applicableCauses,
      strength_assessment: applicableCauses.length > 0
        ? applicableCauses.some(c => c.strength === 'strong')
          ? 'Strong grounds for penalty abatement exist'
          : 'Moderate grounds for penalty abatement - documentation critical'
        : 'Limited penalty abatement grounds - focus on compliance',
      recommended_approach: applicableCauses.some(c => c.id === 'first_time_penalty')
        ? 'Request FTA first, reasonable cause as backup'
        : applicableCauses.length > 0
          ? 'Submit comprehensive reasonable cause request'
          : 'Focus on compliance and negotiate payment terms',
    },
    procedural_strategy: {
      current_stage: currentStage,
      irs_next_likely_action: irsNextAction,
      recommended_response: noticeInfo?.recommended_action || ['Begin voluntary compliance process'],
    },
    timeline,
    best_resolution_path: bestPath,
    generated_letters: generatedLetters,
  };
}

// ============================================================================
// WORKFLOW COMMAND
// ============================================================================

export const NON_FILER_WORKFLOW = {
  command: '/non-filer',
  description: 'IRS Non-Filer Defense & Compliance Response System',
  workflow_type: 'non_filer_defense',
  module_path: '../modules/irs_tax_defense/non_filer_defense',
  entry_function: 'analyzeNonFilerCase',
  required_data: ['taxpayer_info', 'unfiled_years', 'irs_notices'],
  generates_outputs: [
    'case_summary',
    'risk_assessment',
    'defense_letters',
    'reasonable_cause_analysis',
    'procedural_strategy',
    'timeline',
    'resolution_recommendation',
  ],
  estimated_phases: 7,
};
