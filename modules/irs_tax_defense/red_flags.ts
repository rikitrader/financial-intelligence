/**
 * Red Flag Analysis Module
 * Comprehensive transaction and financial data red flag detection
 */

import { generateId } from '../../core/normalize';

// ============================================================================
// TYPES
// ============================================================================

export interface RedFlagScorecard {
  irs_risk_score: number;
  fraud_score: number;
  penalty_score: number;
  sec_score: number;
  criminal_score: number;
  overall_score: number;
  red_flags: RedFlag[];
  flagged_transactions: FlaggedTransaction[];
  legal_references: string[];
  generated_at: string;
}

export interface RedFlag {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  amount_involved?: number;
  irc_section?: string;
  law_violated?: string;
  penalty_civil?: string;
  penalty_criminal?: string;
  consequences?: string[];
  statute_of_limitations?: string;
  risk_factors?: string[];
  recommended_actions?: string[];
  transactions?: string[];
}

// ============================================================================
// COMPREHENSIVE PENALTY REFERENCE
// ============================================================================

export const PENALTY_REFERENCE: Record<string, {
  title: string;
  law: string;
  civil_penalty: string;
  criminal_penalty?: string;
  consequences: string[];
  statute_of_limitations: string;
  elements?: string[];
}> = {
  // Currency Structuring
  '31 USC 5324': {
    title: 'Structuring Currency Transactions',
    law: 'Bank Secrecy Act - 31 USC 5324',
    civil_penalty: 'Forfeiture of ALL funds involved in structuring (not just amounts over $10,000)',
    criminal_penalty: 'Felony: Up to 5 years imprisonment, $250,000 fine (or $500,000 for organizations)',
    consequences: [
      'Complete forfeiture of structured funds',
      'Seizure of bank accounts',
      'Currency Transaction Reports (CTRs) filed by bank',
      'Suspicious Activity Reports (SARs) filed',
      'Referral to FinCEN and IRS Criminal Investigation',
      'Enhanced scrutiny on all future financial activity',
      'Potential prosecution under money laundering statutes (18 USC 1956)',
    ],
    statute_of_limitations: '5 years from date of violation',
    elements: ['Breaking up transactions', 'Purpose to evade CTR filing', 'Knowledge of CTR requirement'],
  },

  // Tax Evasion
  'IRC 7201': {
    title: 'Attempted Tax Evasion',
    law: 'Internal Revenue Code Section 7201',
    civil_penalty: 'IRC 6663 fraud penalty: 75% of underpayment attributable to fraud',
    criminal_penalty: 'Felony: Up to 5 years imprisonment, $250,000 fine ($500,000 for corporations)',
    consequences: [
      'Criminal prosecution',
      '75% civil fraud penalty on understated tax',
      'No statute of limitations for fraud',
      'Personal liability for corporate officers',
      'Referral to IRS Criminal Investigation Division',
      'Potential collateral charges (perjury, false statements)',
      'Professional license revocation',
      'Disbarment from practice before IRS',
    ],
    statute_of_limitations: 'NONE for fraud; 6 years for substantial understatement',
    elements: ['Tax deficiency', 'Willfulness', 'Affirmative act of evasion'],
  },

  // Fraud and False Statements
  'IRC 7206': {
    title: 'Fraud and False Statements',
    law: 'Internal Revenue Code Section 7206(1) & (2)',
    civil_penalty: 'IRC 6663: 75% fraud penalty + interest from due date',
    criminal_penalty: 'Felony: Up to 3 years imprisonment, $250,000 fine per count',
    consequences: [
      'Criminal prosecution for each false statement',
      'Stacking of charges (each false return is separate count)',
      'Preparer penalties under IRC 6694 if assisted',
      'Professional license revocation',
      'Loss of CPA/attorney license',
      'Debarment from federal contracting',
    ],
    statute_of_limitations: '6 years from filing of false return',
    elements: ['Material false statement', 'Made under penalties of perjury', 'Willfulness'],
  },

  // Failure to File/Pay
  'IRC 7203': {
    title: 'Willful Failure to File or Pay',
    law: 'Internal Revenue Code Section 7203',
    civil_penalty: 'IRC 6651(a)(1): 5% per month up to 25% for failure to file; IRC 6651(a)(2): 0.5% per month up to 25% for failure to pay',
    criminal_penalty: 'Misdemeanor: Up to 1 year imprisonment, $100,000 fine ($200,000 for corporations)',
    consequences: [
      'Accruing failure to file penalty (5%/month, max 25%)',
      'Accruing failure to pay penalty (0.5%/month, max 25%)',
      'Interest compounding daily from due date',
      'Federal tax lien on all property',
      'Wage garnishment',
      'Bank account levy',
      'Passport revocation (if tax debt > $59,000)',
      'State income tax referral',
    ],
    statute_of_limitations: '3 years if filed; 10 years for collection; NONE if not filed',
    elements: ['Required to file/pay', 'Failure to do so', 'Willfulness'],
  },

  // Form 8300 Violations
  'IRC 6050I': {
    title: 'Cash Transaction Reporting (Form 8300)',
    law: 'Internal Revenue Code Section 6050I',
    civil_penalty: '$25,000 per failure to file; additional penalty if intentional disregard',
    criminal_penalty: 'Felony for intentional failure: Up to 5 years, $250,000 fine',
    consequences: [
      'Civil penalty: Greater of $25,000 or cash received up to $100,000',
      'Criminal prosecution for willful failure',
      'Enhanced IRS scrutiny',
      'FinCEN referral for money laundering investigation',
      'Potential structuring charges if pattern detected',
    ],
    statute_of_limitations: '6 years from transaction date',
  },

  // Accuracy-Related Penalties
  'IRC 6662': {
    title: 'Accuracy-Related Penalty',
    law: 'Internal Revenue Code Section 6662',
    civil_penalty: '20% of underpayment for negligence, substantial understatement, or valuation misstatement; 40% for gross valuation misstatement',
    consequences: [
      '20% penalty on underpayment amount',
      '40% penalty for gross valuation misstatement (200%+ overstatement)',
      'Interest from original due date',
      'Increased audit exposure for future years',
      'Potential referral for fraud examination',
    ],
    statute_of_limitations: '3 years from filing (6 years if substantial omission)',
  },

  // Civil Fraud Penalty
  'IRC 6663': {
    title: 'Civil Fraud Penalty',
    law: 'Internal Revenue Code Section 6663',
    civil_penalty: '75% of underpayment attributable to fraud',
    consequences: [
      '75% penalty on fraud-related underpayment',
      'Burden of proof shifts to taxpayer for non-fraud portion',
      'No statute of limitations',
      'Joint and several liability for joint filers',
      'Potential criminal referral',
      'IRS may assert fraud penalty before criminal prosecution',
    ],
    statute_of_limitations: 'NONE - fraud has no time limit',
  },

  // Related Party Transactions
  'IRC 267': {
    title: 'Related Party Transactions - Loss Disallowance',
    law: 'Internal Revenue Code Section 267',
    civil_penalty: 'Disallowance of loss deduction; IRC 6662 penalty if underpayment results',
    consequences: [
      'Complete disallowance of loss on related party sales',
      'Deferred deduction on unpaid accrued expenses',
      'Potential recharacterization of transactions',
      'Increased audit exposure',
      'Reconstructed income based on arm\'s length terms',
    ],
    statute_of_limitations: '3 years (6 years if substantial omission)',
  },

  // Transfer Pricing
  'IRC 482': {
    title: 'Transfer Pricing Adjustments',
    law: 'Internal Revenue Code Section 482',
    civil_penalty: 'IRC 6662(e): 20% transactional penalty for substantial valuation misstatement; 40% for gross misstatement; IRC 6662(h): net adjustment penalty',
    consequences: [
      '20% penalty if transfer pricing adjustment exceeds lesser of $5M or 10% of gross receipts',
      '40% penalty if adjustment exceeds lesser of $20M or 20% of gross receipts',
      'Competent authority relief may be available',
      'Correlative adjustments in foreign jurisdiction',
      'Documentation penalty avoidance requires contemporaneous documentation',
    ],
    statute_of_limitations: '3 years (6 years for substantial omissions)',
  },

  // FBAR Violations
  'FBAR': {
    title: 'Foreign Bank Account Report (FinCEN 114)',
    law: '31 USC 5314, 31 CFR 1010.350',
    civil_penalty: 'Non-willful: Up to $12,500 per violation; Willful: Greater of $100,000 or 50% of account balance PER YEAR',
    criminal_penalty: 'Willful: Up to 5 years imprisonment, $250,000 fine',
    consequences: [
      'Non-willful penalty up to $12,500 per account per year',
      'Willful penalty: 50% of highest balance OR $100,000, whichever is GREATER',
      'Penalties stack for each year and each account',
      'Criminal prosecution for willful violations',
      'Potential money laundering charges (18 USC 1956)',
      'IRS Criminal Investigation referral',
      'Enhanced audit scrutiny',
      'Streamlined/OVDP options may be foreclosed',
    ],
    statute_of_limitations: '6 years from June 30 of following year',
    elements: ['U.S. person', 'Financial interest or signature authority', 'Foreign account > $10,000'],
  },

  // FATCA Violations
  'FATCA': {
    title: 'Foreign Account Tax Compliance Act (Form 8938)',
    law: 'IRC 6038D',
    civil_penalty: '$10,000 for failure to file; up to $50,000 for continued non-filing; 40% accuracy penalty on undisclosed assets',
    consequences: [
      '$10,000 penalty for failure to file Form 8938',
      'Additional $10,000 per 30-day period of continued failure (max $50,000)',
      '40% accuracy-related penalty on underpayments from undisclosed assets',
      '6-year statute of limitations if 25%+ of gross income omitted',
      'Extended statute of limitations until 3 years after proper filing',
    ],
    statute_of_limitations: '3 years (extended until 3 years after filing if not filed)',
  },

  // Employment Tax Fraud
  'IRC 6672': {
    title: 'Trust Fund Recovery Penalty (100% Penalty)',
    law: 'Internal Revenue Code Section 6672',
    civil_penalty: '100% of unpaid employment taxes (trust fund portion)',
    criminal_penalty: 'Potential IRC 7202 prosecution: Felony, up to 5 years, $10,000 fine',
    consequences: [
      '100% personal liability for withheld taxes not remitted',
      'Joint and several liability for all responsible persons',
      'No discharge in bankruptcy (priority claim)',
      'IRS may pursue multiple individuals simultaneously',
      'Includes FICA, Medicare, and withheld income tax',
      'Personal assets at risk (home, savings, retirement)',
    ],
    statute_of_limitations: '3 years from later of due date or filing date',
    elements: ['Responsible person', 'Willfulness', 'Failure to pay over trust fund taxes'],
  },

  // Information Return Penalties
  'IRC 6721/6722': {
    title: 'Information Return Penalties',
    law: 'Internal Revenue Code Sections 6721 & 6722',
    civil_penalty: '$50-$290 per return (2024); maximum $3,532,500 per year; intentional disregard: $630 per return with no cap',
    consequences: [
      'Penalty per incorrect/late W-2, 1099, etc.',
      'Tiered penalties: $50/return if corrected within 30 days, $110 if by Aug 1, $290 after',
      'Intentional disregard: $630 per return, no maximum',
      'Lower maximums for small businesses (< $5M gross receipts)',
      'Increased backup withholding obligations',
    ],
    statute_of_limitations: '3 years from filing deadline',
  },

  // Records Maintenance
  'IRC 6001': {
    title: 'Records Maintenance Requirements',
    law: 'Internal Revenue Code Section 6001, Treas. Reg. 1.6001-1',
    civil_penalty: 'Indirect: Disallowance of deductions; IRC 6662 accuracy penalty; Cohan rule estimates disfavored',
    consequences: [
      'Burden of proof remains with taxpayer without records',
      'Deductions may be disallowed entirely',
      'Estimated deductions heavily scrutinized (Cohan rule limited)',
      'Bank Deposits Analysis method may overstate income',
      'Potential negligence penalty under IRC 6662',
      'Increased difficulty in audit defense',
    ],
    statute_of_limitations: 'Records must be kept for statute period (3-7 years minimum)',
  },

  // Estimated Tax Penalties
  'IRC 6654': {
    title: 'Underpayment of Estimated Tax (Individuals)',
    law: 'Internal Revenue Code Section 6654',
    civil_penalty: 'Interest-rate based penalty on underpaid amount for each quarter; currently ~8% annually',
    consequences: [
      'Penalty calculated at federal short-term rate + 3%',
      'No reasonable cause exception (with limited safe harbors)',
      'Safe harbors: 100% prior year tax, 90% current year tax',
      '110% prior year if AGI > $150,000',
    ],
    statute_of_limitations: '3 years from filing',
  },

  // Corporate Estimated Tax
  'IRC 6655': {
    title: 'Underpayment of Estimated Tax (Corporations)',
    law: 'Internal Revenue Code Section 6655',
    civil_penalty: 'Interest-rate based penalty; large corporations must use current year tax for third and fourth quarters',
    consequences: [
      'Penalty at federal short-term rate + 3%',
      'Large corporations (prior year tax > $1M) lose prior year safe harbor',
      'Annualized income method available for seasonal businesses',
    ],
    statute_of_limitations: '3 years from filing',
  },

  // ============================================================================
  // INCOME TAX RULES
  // ============================================================================

  'IRC 61': {
    title: 'Gross Income Defined',
    law: 'Internal Revenue Code Section 61',
    civil_penalty: 'IRC 6662: 20% accuracy penalty on unreported income; IRC 6663: 75% fraud penalty if willful',
    criminal_penalty: 'IRC 7201: Up to 5 years for willful tax evasion',
    consequences: [
      'All income from whatever source derived is taxable',
      'Unreported income triggers understatement penalties',
      'Form 1099 matching detects unreported amounts',
      'Bank deposits analysis may reconstruct unreported income',
    ],
    statute_of_limitations: '3 years; 6 years if 25%+ of gross income omitted; NONE for fraud',
  },

  'IRC 162': {
    title: 'Trade or Business Expenses',
    law: 'Internal Revenue Code Section 162',
    civil_penalty: 'Disallowance of deduction + IRC 6662 penalty if substantial understatement results',
    consequences: [
      'Expenses must be ordinary and necessary',
      'Must be paid or incurred during taxable year',
      'Must be directly connected to business',
      'Personal expenses are never deductible',
      'Lavish or extravagant expenses disallowed',
      'Entertainment expenses largely eliminated (TCJA)',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 183': {
    title: 'Hobby Loss Rules',
    law: 'Internal Revenue Code Section 183',
    civil_penalty: 'Disallowance of losses exceeding income; IRC 6662 accuracy penalty',
    consequences: [
      'Activity not engaged in for profit limits deductions to income',
      'Profit in 3 of 5 years presumption (horse activities: 2 of 7 years)',
      '9 factors test for profit motive (Treas. Reg. 1.183-2)',
      'All losses may be disallowed retroactively',
    ],
    statute_of_limitations: '3 years (IRS may assess all open years if hobby determined)',
  },

  'IRC 274': {
    title: 'Entertainment, Meals, and Travel',
    law: 'Internal Revenue Code Section 274',
    civil_penalty: 'Disallowance of deduction; substantiation penalties under IRC 6662',
    consequences: [
      'Entertainment expenses: 0% deductible (TCJA)',
      'Business meals: 50% deductible (100% during 2021-2022)',
      'Substantiation required: amount, time, place, business purpose, business relationship',
      'Per diem rates as alternative to actual expenses',
    ],
    statute_of_limitations: '3 years from filing',
  },

  // ============================================================================
  // CORPORATE TAX
  // ============================================================================

  'IRC 11': {
    title: 'Corporate Income Tax Rate',
    law: 'Internal Revenue Code Section 11',
    civil_penalty: 'IRC 6662 for understated tax; IRC 6655 for underpaid estimated tax',
    consequences: [
      'Flat 21% corporate rate (TCJA)',
      'Alternative Minimum Tax repealed for corporations',
      'Base Erosion and Anti-Abuse Tax (BEAT) may apply',
      'GILTI inclusion for CFCs',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 243': {
    title: 'Dividends Received Deduction',
    law: 'Internal Revenue Code Section 243',
    civil_penalty: 'Disallowance of DRD; IRC 6662 accuracy penalty',
    consequences: [
      '50% DRD for less than 20% ownership',
      '65% DRD for 20%-80% ownership',
      '100% DRD for 80%+ ownership (affiliated group)',
      'Holding period requirement: 46 days in 91-day period',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 301': {
    title: 'Corporate Distributions',
    law: 'Internal Revenue Code Section 301',
    civil_penalty: 'Recharacterization of distribution; IRC 6662 penalty if understatement',
    consequences: [
      'Dividend to extent of E&P (IRC 316)',
      'Return of capital to extent of basis',
      'Capital gain for excess over basis',
      'Constructive dividends for disguised distributions',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 351': {
    title: 'Transfer to Controlled Corporation',
    law: 'Internal Revenue Code Section 351',
    civil_penalty: 'Immediate recognition of gain if requirements not met; IRC 6662 penalty',
    consequences: [
      'Nonrecognition requires 80% control immediately after transfer',
      'Boot received triggers gain recognition',
      'Services do not count toward 80% control',
      'Liability assumption may trigger gain (IRC 357)',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 531': {
    title: 'Accumulated Earnings Tax',
    law: 'Internal Revenue Code Section 531',
    civil_penalty: '20% tax on accumulated taxable income beyond reasonable business needs',
    consequences: [
      '20% penalty tax on excess accumulation',
      '$250,000 safe harbor ($150,000 for PSCs)',
      'Specific, definite plans required for accumulation',
      'Bardahl formula for working capital needs',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 541': {
    title: 'Personal Holding Company Tax',
    law: 'Internal Revenue Code Section 541',
    civil_penalty: '20% PHC tax on undistributed PHC income',
    consequences: [
      '20% tax on undistributed personal holding company income',
      'PHC if 60%+ of income is PHCI and 5 or fewer own 50%+',
      'Deficiency dividends may eliminate tax',
      'Close scrutiny of investment companies',
    ],
    statute_of_limitations: '3 years from filing',
  },

  // ============================================================================
  // PARTNERSHIPS
  // ============================================================================

  'IRC 701': {
    title: 'Partnership Taxation - Pass-through',
    law: 'Internal Revenue Code Section 701',
    civil_penalty: 'Partner-level penalties for underreported distributive share',
    consequences: [
      'Partnership not subject to income tax',
      'Partners taxed on distributive share (IRC 702)',
      'Character of items flows through',
      'At-risk and passive activity limitations apply at partner level',
    ],
    statute_of_limitations: '3 years from partnership return filing',
  },

  'IRC 704(b)': {
    title: 'Partnership Allocations',
    law: 'Internal Revenue Code Section 704(b)',
    civil_penalty: 'Reallocation per partners\' economic interests; IRC 6662 penalty',
    consequences: [
      'Allocations must have substantial economic effect',
      'Failure results in reallocation based on partners\' interests',
      'Capital account maintenance required',
      'Deficit restoration obligation or qualified income offset needed',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 707': {
    title: 'Partnership Transactions with Partners',
    law: 'Internal Revenue Code Section 707',
    civil_penalty: 'Recharacterization; IRC 6662 penalty if understatement results',
    consequences: [
      'Disguised sales recharacterized as taxable transactions',
      'Guaranteed payments treated as ordinary income',
      'Services transactions may be recharacterized',
      '2-year presumption for disguised sales (7-year for contributed property)',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 6698': {
    title: 'Partnership Late Filing Penalty',
    law: 'Internal Revenue Code Section 6698',
    civil_penalty: '$235/month per partner (2024) for late/incomplete filing; max 12 months ($2,820/partner)',
    consequences: [
      '$235 per partner per month (2024, inflation adjusted)',
      'Maximum 12 months = $2,820 per partner',
      'No reasonable cause exception is available for some situations',
      'FTA (First Time Abatement) may be available',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 6226': {
    title: 'BBA Partnership Audit - Push-Out',
    law: 'Internal Revenue Code Section 6226',
    civil_penalty: 'Partnership-level assessment unless push-out elected; interest at partner rate + 2%',
    consequences: [
      'Centralized partnership audit regime (BBA)',
      'Partnership pays imputed underpayment at highest rate',
      'Push-out election shifts tax to reviewed year partners',
      'Interest rate is partner rate + 2% for pushed-out amounts',
    ],
    statute_of_limitations: '3 years from partnership return filing',
  },

  // ============================================================================
  // TRUSTS & ESTATES
  // ============================================================================

  'IRC 641': {
    title: 'Trust and Estate Taxation',
    law: 'Internal Revenue Code Section 641',
    civil_penalty: 'Entity-level penalties under IRC 6651, 6662; fiduciary personal liability',
    consequences: [
      'Trusts/estates taxed as separate entities',
      'Compressed rate brackets (37% at $14,450 in 2024)',
      'Distribution deduction for amounts distributed (IRC 651, 661)',
      'DNI limits deduction and beneficiary inclusion',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 671-679': {
    title: 'Grantor Trust Rules',
    law: 'Internal Revenue Code Sections 671-679',
    civil_penalty: 'Recharacterization of trust income to grantor; IRC 6662 penalty',
    consequences: [
      'Grantor taxed on all trust income if grantor trust',
      'Retained powers/interests trigger grantor trust status',
      'Foreign trust special rules (IRC 679)',
      'Intentional grantor trusts for estate planning',
    ],
    statute_of_limitations: '3 years from filing',
  },

  'IRC 2036': {
    title: 'Estate Tax - Retained Life Estate',
    law: 'Internal Revenue Code Section 2036',
    civil_penalty: 'Full inclusion in gross estate; IRC 6662 penalty on estate tax underpayment',
    consequences: [
      'Full FMV included in gross estate at death',
      'Applies if donor retained possession, enjoyment, or income',
      'Transfers with retained interests for life or period determinable by death',
      'Exception for bona fide sale for adequate consideration',
    ],
    statute_of_limitations: '3 years from filing Form 706 (6 years if 25%+ omission)',
  },

  'IRC 2501': {
    title: 'Gift Tax',
    law: 'Internal Revenue Code Section 2501',
    civil_penalty: 'IRC 6651 failure to file penalty; IRC 6662 accuracy penalty; 40% gross valuation misstatement penalty',
    consequences: [
      'Gift tax on transfers for less than full consideration',
      '$18,000 annual exclusion per donee (2024)',
      'Unlimited marital and charitable deductions',
      '$13.61M lifetime exemption (2024)',
      'Form 709 required for gifts over annual exclusion',
    ],
    statute_of_limitations: '3 years (NONE if adequate disclosure not made)',
  },

  'IRC 6166': {
    title: 'Estate Tax Installment Payments',
    law: 'Internal Revenue Code Section 6166',
    civil_penalty: 'Acceleration of full tax if requirements violated',
    consequences: [
      'Defer estate tax on closely-held business over 14 years',
      'Interest-only first 5 years, then 10 annual installments',
      '2% interest on first $1.75M (2024) of deferred tax',
      'Disposition of 50%+ of business accelerates remaining tax',
    ],
    statute_of_limitations: 'Duration of installment period',
  },

  // ============================================================================
  // PAYROLL TAXES
  // ============================================================================

  'IRC 3101': {
    title: 'FICA - Employee Share',
    law: 'Internal Revenue Code Section 3101',
    civil_penalty: 'IRC 6672: 100% Trust Fund Recovery Penalty for failure to remit',
    criminal_penalty: 'IRC 7202: Felony for willful failure to collect/pay, up to 5 years, $10,000 fine',
    consequences: [
      'Social Security: 6.2% on wages up to $168,600 (2024)',
      'Medicare: 1.45% on all wages',
      'Additional Medicare: 0.9% on wages over $200,000 ($250,000 MFJ)',
      'Employer must withhold and remit',
    ],
    statute_of_limitations: '3 years from Form 941 filing',
  },

  'IRC 3111': {
    title: 'FICA - Employer Share',
    law: 'Internal Revenue Code Section 3111',
    civil_penalty: 'IRC 6672: Trust Fund Recovery Penalty; IRC 6656: Failure to deposit penalty',
    consequences: [
      'Employer matches 6.2% Social Security + 1.45% Medicare',
      'Total FICA: 15.3% on first $168,600 (2024)',
      'No employer share on additional Medicare',
      'Must deposit semi-weekly or monthly based on liability',
    ],
    statute_of_limitations: '3 years from Form 941 filing',
  },

  'IRC 3301': {
    title: 'Federal Unemployment Tax (FUTA)',
    law: 'Internal Revenue Code Section 3301',
    civil_penalty: 'Failure to pay penalty under IRC 6651; state credit reduction',
    consequences: [
      '6.0% on first $7,000 of wages per employee',
      '5.4% credit for timely state unemployment tax payment',
      'Effective rate: 0.6% (0.006 x $7,000 = $42/employee)',
      'Credit reduction if state borrows from federal fund',
    ],
    statute_of_limitations: '3 years from Form 940 filing',
  },

  'IRC 3402': {
    title: 'Income Tax Withholding',
    law: 'Internal Revenue Code Section 3402',
    civil_penalty: 'IRC 6672: 100% Trust Fund Recovery Penalty; IRC 6656: Failure to deposit penalty',
    criminal_penalty: 'IRC 7202: Felony for willful failure, up to 5 years, $10,000 fine',
    consequences: [
      'Employer must withhold based on W-4',
      'Trust fund taxes - always paid first',
      'Personal liability for responsible persons',
      'No statute of limitations on assessment of trust fund penalty',
    ],
    statute_of_limitations: '3 years from Form 941 filing; 10 years for collection',
    elements: ['Duty to withhold', 'Failure to remit', 'Responsible person', 'Willfulness'],
  },

  'IRC 6656': {
    title: 'Failure to Deposit Penalty',
    law: 'Internal Revenue Code Section 6656',
    civil_penalty: '2% if 1-5 days late; 5% if 6-15 days late; 10% if 16+ days late; 15% if not deposited within 10 days of IRS demand',
    consequences: [
      'Tiered penalty based on days late',
      'Applies to payroll tax deposits',
      '15% penalty if deposit made after IRS notice demanding payment',
      'No reasonable cause abatement for FTD penalty',
    ],
    statute_of_limitations: '3 years from return filing',
  },

  // ============================================================================
  // IRS AUTHORITY
  // ============================================================================

  'IRC 7602': {
    title: 'IRS Examination Authority',
    law: 'Internal Revenue Code Section 7602',
    civil_penalty: 'N/A - IRS authority provision',
    consequences: [
      'IRS may examine books, records, and witnesses',
      'May issue summons for testimony and documents',
      'Third-party summons with notice to taxpayer',
      'John Doe summons for unknown taxpayers',
    ],
    statute_of_limitations: 'N/A - authority provision',
  },

  'IRC 7609': {
    title: 'Third-Party Summons',
    law: 'Internal Revenue Code Section 7609',
    civil_penalty: 'Contempt of court for failure to comply with enforced summons',
    consequences: [
      'Notice to taxpayer required for third-party summons',
      '23 days to intervene',
      'John Doe summons exception',
      'Motion to quash available',
    ],
    statute_of_limitations: 'N/A - procedural provision',
  },

  'IRC 6501': {
    title: 'Statute of Limitations - Assessment',
    law: 'Internal Revenue Code Section 6501',
    civil_penalty: 'N/A - procedural limitation',
    consequences: [
      'General rule: 3 years from filing',
      '6 years if 25%+ of gross income omitted (IRC 6501(e))',
      'NONE if fraud or no return filed',
      'Extensions (Form 872) available',
      'Special rules for foreign info returns',
    ],
    statute_of_limitations: 'Self-explanatory - defines SOL rules',
  },

  'IRC 6502': {
    title: 'Collection Statute',
    law: 'Internal Revenue Code Section 6502',
    civil_penalty: 'N/A - procedural limitation',
    consequences: [
      '10 years from assessment to collect',
      'Tolled during bankruptcy, CDP hearing, installment agreement',
      'May be extended by agreement (rarely done)',
      'Levy before expiration captures future right',
    ],
    statute_of_limitations: '10 years from assessment',
  },

  'IRC 6503': {
    title: 'Statute Suspension',
    law: 'Internal Revenue Code Section 6503',
    civil_penalty: 'N/A - procedural provision',
    consequences: [
      'Statute suspended during bankruptcy (plus 6 months)',
      'Suspended during CDP proceeding',
      'Suspended while taxpayer outside US (6+ months)',
      'Suspended for installment agreements',
    ],
    statute_of_limitations: 'N/A - describes suspensions',
  },

  // ============================================================================
  // TAX PROCEDURE
  // ============================================================================

  'IRC 6211': {
    title: 'Definition of Deficiency',
    law: 'Internal Revenue Code Section 6211',
    civil_penalty: 'N/A - definitional provision',
    consequences: [
      'Tax imposed minus amounts shown on return',
      'Minus prior assessments and plus prior credits/abatements',
      'Deficiency allows Tax Court jurisdiction',
      'Deficiency procedures protect prepayment forum choice',
    ],
    statute_of_limitations: 'N/A - definitional',
  },

  'IRC 6212': {
    title: 'Notice of Deficiency (90-Day Letter)',
    law: 'Internal Revenue Code Section 6212',
    civil_penalty: 'N/A - procedural provision',
    consequences: [
      'IRS must send notice before assessment',
      '90 days to petition Tax Court (150 if outside US)',
      'Last known address rule',
      'Invalid notice may be challenged',
    ],
    statute_of_limitations: '90 days to petition Tax Court',
  },

  'IRC 6213': {
    title: 'Tax Court Petition',
    law: 'Internal Revenue Code Section 6213',
    civil_penalty: 'N/A - procedural provision',
    consequences: [
      'Taxpayer may petition Tax Court within 90 days',
      'Assessment prohibited during 90-day period',
      'Tax Court has exclusive prepayment forum',
      '$60 filing fee ($60 for small tax case)',
    ],
    statute_of_limitations: '90 days from notice of deficiency',
  },

  'IRC 6320/6330': {
    title: 'Collection Due Process (CDP)',
    law: 'Internal Revenue Code Sections 6320 & 6330',
    civil_penalty: 'N/A - taxpayer rights provision',
    consequences: [
      'Notice required before lien or levy',
      '30 days to request CDP hearing',
      'May challenge underlying liability if no prior opportunity',
      'Collection suspended during CDP proceeding',
      'Tax Court review of CDP determination',
    ],
    statute_of_limitations: '30 days to request hearing; 30 days to petition Tax Court',
  },

  'IRC 7121': {
    title: 'Closing Agreements',
    law: 'Internal Revenue Code Section 7121',
    civil_penalty: 'N/A - procedural provision',
    consequences: [
      'Final determination of tax liability',
      'Binding on both IRS and taxpayer',
      'May be voided for fraud, malfeasance, or misrepresentation',
      'Used to resolve specific issues or entire liability',
    ],
    statute_of_limitations: 'N/A - agreement is final',
  },

  'IRC 7122': {
    title: 'Offers in Compromise',
    law: 'Internal Revenue Code Section 7122',
    civil_penalty: 'N/A - collection alternative',
    consequences: [
      'Settlement of tax liability for less than full amount',
      'Three grounds: doubt as to liability, doubt as to collectibility, effective tax administration',
      '$205 application fee (waived for low income)',
      'Must stay compliant for 5 years or offer reinstates',
      'Tax liens remain until offer paid in full',
    ],
    statute_of_limitations: 'Statute tolled during OIC consideration',
  },

  'IRC 7430': {
    title: 'Attorney Fees and Costs',
    law: 'Internal Revenue Code Section 7430',
    civil_penalty: 'N/A - fee shifting provision',
    consequences: [
      'Prevailing party may recover fees',
      'IRS position must not be substantially justified',
      'Net worth and income limitations',
      'Must exhaust administrative remedies',
      'Hourly rate capped (2024: approximately $250/hour)',
    ],
    statute_of_limitations: '30 days from final judgment',
  },
};

export interface FlaggedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  flag_type: string;
  flag_reason: string;
  severity: string;
}

export interface RedFlagAnalysisInput {
  transactions: any[];
  ledger_entries: any[];
  invoices: any[];
  taxpayer_type: string;
  tax_years: string[];
}

// ============================================================================
// RED FLAG DETECTION RULES
// ============================================================================

const RED_FLAG_RULES = {
  // Structuring / Currency Violations
  structuring: {
    name: 'Currency Structuring',
    irc_section: '31 USC 5324',
    threshold: 10000,
    window_days: 3,
    min_count: 3,
    severity: 'critical',
  },

  // Round dollar amounts (estimation indicator)
  round_dollars: {
    name: 'Round Dollar Amounts',
    irc_section: 'IRM 4.10.4.6.2',
    threshold_percent: 0.50,
    min_amount: 1000,
    severity: 'medium',
  },

  // Large cash transactions
  large_cash: {
    name: 'Large Cash Transactions',
    irc_section: 'IRC 6050I',
    threshold: 10000,
    severity: 'high',
  },

  // Unusual timing (weekend/holiday)
  unusual_timing: {
    name: 'Unusual Timing',
    irc_section: 'IRM 4.10.4.3.4',
    severity: 'medium',
  },

  // Vendor concentration
  vendor_concentration: {
    name: 'Vendor Concentration',
    irc_section: 'IRC 162',
    threshold_percent: 0.30,
    severity: 'high',
  },

  // Related party indicators
  related_party: {
    name: 'Related Party Transactions',
    irc_section: 'IRC 267, 482',
    keywords: ['related', 'affiliate', 'shareholder', 'officer', 'family'],
    severity: 'high',
  },

  // Ghost employee indicators
  ghost_employee: {
    name: 'Ghost Employee Indicators',
    irc_section: 'IRC 7206',
    severity: 'critical',
  },

  // Duplicate transactions
  duplicates: {
    name: 'Duplicate Transactions',
    irc_section: 'IRC 162',
    severity: 'medium',
  },

  // Missing documentation
  missing_docs: {
    name: 'Missing Documentation',
    irc_section: 'IRC 6001, Reg 1.6001-1',
    severity: 'high',
  },

  // Foreign transactions
  foreign: {
    name: 'Foreign Transactions',
    irc_section: 'FBAR, FATCA',
    keywords: ['foreign', 'international', 'offshore', 'cayman', 'swiss'],
    severity: 'high',
  },
};

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export async function runRedFlagAnalysis(input: RedFlagAnalysisInput): Promise<RedFlagScorecard> {
  const red_flags: RedFlag[] = [];
  const flagged_transactions: FlaggedTransaction[] = [];

  // 1. Check for Structuring
  const structuringFlags = detectStructuring(input.transactions);
  red_flags.push(...structuringFlags.flags);
  flagged_transactions.push(...structuringFlags.transactions);

  // 2. Check for Round Dollar Amounts
  const roundDollarFlags = detectRoundDollarAmounts(input.transactions);
  red_flags.push(...roundDollarFlags.flags);
  flagged_transactions.push(...roundDollarFlags.transactions);

  // 3. Check for Large Cash Transactions
  const largeCashFlags = detectLargeCashTransactions(input.transactions);
  red_flags.push(...largeCashFlags.flags);
  flagged_transactions.push(...largeCashFlags.transactions);

  // 4. Check for Unusual Timing
  const timingFlags = detectUnusualTiming(input.transactions);
  red_flags.push(...timingFlags.flags);
  flagged_transactions.push(...timingFlags.transactions);

  // 5. Check for Vendor Concentration
  const vendorFlags = detectVendorConcentration(input.transactions, input.invoices);
  red_flags.push(...vendorFlags.flags);

  // 6. Check for Related Party Indicators
  const relatedPartyFlags = detectRelatedParty(input.transactions, input.invoices);
  red_flags.push(...relatedPartyFlags.flags);
  flagged_transactions.push(...relatedPartyFlags.transactions);

  // 7. Check for Duplicates
  const duplicateFlags = detectDuplicates(input.transactions);
  red_flags.push(...duplicateFlags.flags);
  flagged_transactions.push(...duplicateFlags.transactions);

  // 8. Check for Foreign Transactions
  const foreignFlags = detectForeignTransactions(input.transactions);
  red_flags.push(...foreignFlags.flags);
  flagged_transactions.push(...foreignFlags.transactions);

  // 9. Check GL for Journal Entry Anomalies
  const jeFlags = detectJournalEntryAnomalies(input.ledger_entries);
  red_flags.push(...jeFlags.flags);

  // 10. Check for Ghost Employee Indicators (if payroll in transactions)
  const ghostFlags = detectGhostEmployeeIndicators(input.transactions);
  red_flags.push(...ghostFlags.flags);

  // Calculate scores
  const scores = calculateScores(red_flags, input);

  return {
    irs_risk_score: scores.irs,
    fraud_score: scores.fraud,
    penalty_score: scores.penalty,
    sec_score: scores.sec,
    criminal_score: scores.criminal,
    overall_score: scores.overall,
    red_flags,
    flagged_transactions,
    legal_references: [
      'Internal Revenue Code (IRC)',
      'Treasury Regulations',
      'Internal Revenue Manual (IRM)',
      'Bank Secrecy Act (31 USC 5311-5332)',
      'FBAR Requirements (31 CFR 1010.350)',
    ],
    generated_at: new Date().toISOString(),
  };
}

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

function detectStructuring(transactions: any[]): { flags: RedFlag[]; transactions: FlaggedTransaction[] } {
  const flags: RedFlag[] = [];
  const flaggedTxns: FlaggedTransaction[] = [];

  // Find cash transactions near $10,000
  const cashTransactions = transactions.filter(t =>
    t.description?.toLowerCase().includes('cash') ||
    t.payment_method === 'cash'
  );

  const nearThreshold = cashTransactions.filter(t =>
    Math.abs(t.amount) >= 9000 && Math.abs(t.amount) < 10000
  );

  // Check for patterns
  if (nearThreshold.length >= 3) {
    // Sort by date
    const sorted = nearThreshold.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Check for consecutive days
    for (let i = 0; i < sorted.length - 2; i++) {
      const date1 = new Date(sorted[i].date);
      const date2 = new Date(sorted[i + 1].date);
      const date3 = new Date(sorted[i + 2].date);

      const diff1 = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
      const diff2 = (date3.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);

      if (diff1 <= 3 && diff2 <= 3) {
        const totalAmount = sorted[i].amount + sorted[i + 1].amount + sorted[i + 2].amount;

        const penaltyRef = PENALTY_REFERENCE['31 USC 5324'];
        flags.push({
          id: generateId('STR'),
          title: 'Potential Currency Structuring Detected',
          description: `${nearThreshold.length} cash transactions just below $10,000 CTR threshold. ` +
            `Pattern of deposits on consecutive days totaling $${Math.abs(totalAmount).toLocaleString()}. ` +
            `This pattern is consistent with structuring under 31 USC 5324.`,
          category: 'structuring',
          severity: 'critical',
          confidence: 0.90,
          amount_involved: Math.abs(totalAmount),
          irc_section: '31 USC 5324',
          law_violated: penaltyRef.law,
          penalty_civil: penaltyRef.civil_penalty,
          penalty_criminal: penaltyRef.criminal_penalty,
          consequences: penaltyRef.consequences,
          statute_of_limitations: penaltyRef.statute_of_limitations,
          risk_factors: [
            'Multiple transactions just under $10,000',
            'Transactions on consecutive days',
            'Cash deposits',
            'Total exceeds CTR threshold',
            ...(penaltyRef.elements || []),
          ],
          recommended_actions: [
            'STOP - Engage criminal tax counsel immediately',
            'Do not discuss with IRS without counsel',
            'Preserve all deposit records',
            'Consider SAR filing obligations',
            'Evaluate voluntary disclosure options',
          ],
        });

        break;
      }
    }
  }

  // Flag individual transactions
  nearThreshold.forEach(t => {
    flaggedTxns.push({
      id: t.id || generateId('TXN'),
      date: t.date,
      description: t.description || '',
      amount: t.amount,
      flag_type: 'structuring',
      flag_reason: 'Cash transaction just below $10,000 CTR threshold',
      severity: 'critical',
    });
  });

  return { flags, transactions: flaggedTxns };
}

function detectRoundDollarAmounts(transactions: any[]): { flags: RedFlag[]; transactions: FlaggedTransaction[] } {
  const flags: RedFlag[] = [];
  const flaggedTxns: FlaggedTransaction[] = [];

  const roundTransactions = transactions.filter(t =>
    Math.abs(t.amount) >= 1000 &&
    t.amount === Math.round(t.amount) &&
    t.amount % 100 === 0
  );

  const ratio = roundTransactions.length / Math.max(transactions.length, 1);

  if (ratio > 0.50) {
    const penaltyRef = PENALTY_REFERENCE['IRC 6662'];
    flags.push({
      id: generateId('RND'),
      title: 'High Proportion of Round Dollar Amounts',
      description: `${(ratio * 100).toFixed(0)}% of transactions are round dollar amounts. ` +
        `Expected rate is approximately 5%. This pattern suggests estimation or manipulation.`,
      category: 'estimation',
      severity: 'medium',
      confidence: 0.75,
      irc_section: 'IRC 6662 (Accuracy-Related), IRM 4.10.4.6.2',
      law_violated: 'Internal Revenue Code Section 6662 - Accuracy-Related Penalty',
      penalty_civil: penaltyRef.civil_penalty,
      consequences: [
        'Disallowance of estimated deductions without supporting documentation',
        'Accuracy-related penalty of 20% on any resulting underpayment',
        'Increased audit scrutiny on all deduction categories',
        'Cohan rule may provide limited relief for reasonable estimates',
        ...penaltyRef.consequences,
      ],
      statute_of_limitations: penaltyRef.statute_of_limitations,
      risk_factors: [
        'Round amounts suggest estimation',
        'May indicate lack of supporting documentation',
        'Potential Schedule C audit trigger',
        'Heightened negligence analysis under IRC 6662(c)',
      ],
      recommended_actions: [
        'Review source documents for actual amounts',
        'Prepare explanations for round amounts',
        'Document estimation methodology if reconstructing records',
        'Consider reasonable cause defense under IRC 6664(c)',
      ],
    });

    roundTransactions.forEach(t => {
      flaggedTxns.push({
        id: t.id || generateId('TXN'),
        date: t.date,
        description: t.description || '',
        amount: t.amount,
        flag_type: 'round_dollar',
        flag_reason: 'Round dollar amount suggests estimation',
        severity: 'medium',
      });
    });
  }

  return { flags, transactions: flaggedTxns };
}

function detectLargeCashTransactions(transactions: any[]): { flags: RedFlag[]; transactions: FlaggedTransaction[] } {
  const flags: RedFlag[] = [];
  const flaggedTxns: FlaggedTransaction[] = [];

  const largeCash = transactions.filter(t =>
    (t.description?.toLowerCase().includes('cash') || t.payment_method === 'cash') &&
    Math.abs(t.amount) >= 10000
  );

  if (largeCash.length > 0) {
    const totalCash = largeCash.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const penaltyRef = PENALTY_REFERENCE['IRC 6050I'];

    flags.push({
      id: generateId('CSH'),
      title: 'Large Cash Transactions',
      description: `${largeCash.length} cash transactions over $10,000 totaling $${totalCash.toLocaleString()}. ` +
        `Form 8300 filing REQUIRED within 15 days of receipt. Failure to file carries severe penalties.`,
      category: 'cash',
      severity: 'high',
      confidence: 0.85,
      amount_involved: totalCash,
      irc_section: 'IRC 6050I',
      law_violated: penaltyRef.law,
      penalty_civil: penaltyRef.civil_penalty,
      penalty_criminal: penaltyRef.criminal_penalty,
      consequences: penaltyRef.consequences,
      statute_of_limitations: penaltyRef.statute_of_limitations,
      risk_factors: [
        'CTR filing requirement (bank files automatically)',
        'Form 8300 requirement for businesses (must file within 15 days)',
        'AML compliance concerns',
        'Pattern may trigger structuring analysis',
        'FinCEN cross-reference with bank CTRs',
      ],
      recommended_actions: [
        'Verify Form 8300 filed within 15 days of each cash receipt',
        'Document source of cash with contemporaneous records',
        'Maintain cash handling procedures and employee training',
        'Review for aggregation rules (related transactions count together)',
        'Provide customer copy of Form 8300 by January 31',
      ],
    });

    largeCash.forEach(t => {
      flaggedTxns.push({
        id: t.id || generateId('TXN'),
        date: t.date,
        description: t.description || '',
        amount: t.amount,
        flag_type: 'large_cash',
        flag_reason: 'Cash transaction over $10,000 - reporting required',
        severity: 'high',
      });
    });
  }

  return { flags, transactions: flaggedTxns };
}

function detectUnusualTiming(transactions: any[]): { flags: RedFlag[]; transactions: FlaggedTransaction[] } {
  const flags: RedFlag[] = [];
  const flaggedTxns: FlaggedTransaction[] = [];

  const weekendTransactions = transactions.filter(t => {
    const day = new Date(t.date).getDay();
    return day === 0 || day === 6;
  });

  if (weekendTransactions.length > 0) {
    flags.push({
      id: generateId('TMG'),
      title: 'Weekend/Holiday Transactions',
      description: `${weekendTransactions.length} transactions recorded on weekends. ` +
        `May indicate backdating or unauthorized activity.`,
      category: 'timing',
      severity: 'medium',
      confidence: 0.70,
      risk_factors: [
        'Transactions when business closed',
        'Potential backdating',
        'May indicate unauthorized access',
      ],
      recommended_actions: [
        'Verify authorization for weekend activity',
        'Check for automated transactions',
        'Document business justification',
      ],
    });

    weekendTransactions.forEach(t => {
      flaggedTxns.push({
        id: t.id || generateId('TXN'),
        date: t.date,
        description: t.description || '',
        amount: t.amount,
        flag_type: 'weekend',
        flag_reason: 'Transaction on weekend',
        severity: 'medium',
      });
    });
  }

  return { flags, transactions: flaggedTxns };
}

function detectVendorConcentration(transactions: any[], invoices: any[]): { flags: RedFlag[] } {
  const flags: RedFlag[] = [];

  // Group by vendor
  const vendorTotals: Record<string, number> = {};

  invoices.forEach(inv => {
    const vendor = inv.vendor_name || inv.counterparty || 'Unknown';
    vendorTotals[vendor] = (vendorTotals[vendor] || 0) + Math.abs(inv.amount || 0);
  });

  const totalSpend = Object.values(vendorTotals).reduce((a, b) => a + b, 0);

  Object.entries(vendorTotals).forEach(([vendor, amount]) => {
    const ratio = amount / Math.max(totalSpend, 1);
    if (ratio > 0.30) {
      flags.push({
        id: generateId('VND'),
        title: `Vendor Concentration: ${vendor}`,
        description: `${vendor} represents ${(ratio * 100).toFixed(0)}% of total vendor payments ($${amount.toLocaleString()}). ` +
          `High concentration may indicate related party or fictitious vendor scheme.`,
        category: 'vendor',
        severity: 'high',
        confidence: 0.75,
        amount_involved: amount,
        irc_section: 'IRC 162 (Ordinary & Necessary), IRC 267 (Related Party)',
        law_violated: 'IRC 162(a) - Trade or Business Expenses; IRC 267 - Related Party Rules',
        penalty_civil: 'IRC 6662: 20% accuracy penalty if deductions disallowed; IRC 6663: 75% fraud penalty if fictitious vendor scheme',
        penalty_criminal: 'IRC 7206: Up to 3 years if false invoices used; IRC 7201: Up to 5 years if tax evasion scheme',
        consequences: [
          'Full disallowance of payments if vendor is fictitious',
          'Related party limitations under IRC 267',
          'Potential fraud penalty (75%) under IRC 6663',
          'Criminal prosecution for fictitious vendor schemes',
          'Form 1099 penalties if payments not reported',
          'Embezzlement investigation if internal scheme',
        ],
        statute_of_limitations: '3 years standard; 6 years if 25%+ gross income omitted; NONE if fraud',
        risk_factors: [
          'Potential related party (IRC 267)',
          'Fictitious vendor risk - badges of fraud',
          'Lack of competitive bidding indicates collusion',
          'No evidence of goods/services received',
          'Payments to PO boxes or mail drops',
        ],
        recommended_actions: [
          'Verify vendor legitimacy with independent sources',
          'Obtain W-9 or W-8BEN from vendor',
          'Check for related party indicators (common ownership, family)',
          'Review contract terms and deliverables',
          'Confirm goods/services actually received',
          'Issue Form 1099 if over $600 and U.S. vendor',
        ],
      });
    }
  });

  return { flags };
}

function detectRelatedParty(transactions: any[], invoices: any[]): { flags: RedFlag[]; transactions: FlaggedTransaction[] } {
  const flags: RedFlag[] = [];
  const flaggedTxns: FlaggedTransaction[] = [];

  const keywords = ['related', 'affiliate', 'shareholder', 'officer', 'family', 'spouse', 'partner'];

  const relatedTxns = transactions.filter(t => {
    const desc = (t.description || '').toLowerCase();
    return keywords.some(kw => desc.includes(kw));
  });

  if (relatedTxns.length > 0) {
    const totalAmount = relatedTxns.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const penaltyRef267 = PENALTY_REFERENCE['IRC 267'];
    const penaltyRef482 = PENALTY_REFERENCE['IRC 482'];

    flags.push({
      id: generateId('REL'),
      title: 'Related Party Transaction Indicators',
      description: `${relatedTxns.length} transactions with potential related party indicators ` +
        `totaling $${totalAmount.toLocaleString()}. Subject to IRC 267 loss disallowance and IRC 482 transfer pricing rules.`,
      category: 'related_party',
      severity: 'high',
      confidence: 0.70,
      amount_involved: totalAmount,
      irc_section: 'IRC 267, 482',
      law_violated: 'IRC 267 (Loss Disallowance) and IRC 482 (Transfer Pricing)',
      penalty_civil: penaltyRef482.civil_penalty,
      consequences: [
        ...penaltyRef267.consequences,
        ...penaltyRef482.consequences,
        'Potential Schedule K-1 reporting issues',
        'Form 5472 filing requirement for foreign-owned corporations',
      ],
      statute_of_limitations: '3 years (6 years if substantial omission; indefinite if transfer pricing documentation penalty applies)',
      risk_factors: [
        'Related party loss limitations under IRC 267(a)(1) - losses DENIED',
        'Deferred deduction for accrued expenses under IRC 267(a)(2)',
        'Transfer pricing adjustment authority under IRC 482',
        'Constructive distribution if non-arm\'s length',
        'Disclosure requirements (Form 5472, Schedule M-3)',
      ],
      recommended_actions: [
        'Document arm\'s length terms with comparable transactions',
        'Prepare contemporaneous transfer pricing documentation',
        'Review IRC 267(b) for list of related parties',
        'File Form 5472 if foreign ownership involved',
        'Consider Advance Pricing Agreement for significant transactions',
      ],
    });

    relatedTxns.forEach(t => {
      flaggedTxns.push({
        id: t.id || generateId('TXN'),
        date: t.date,
        description: t.description || '',
        amount: t.amount,
        flag_type: 'related_party',
        flag_reason: 'Related party indicator in description',
        severity: 'high',
      });
    });
  }

  return { flags, transactions: flaggedTxns };
}

function detectDuplicates(transactions: any[]): { flags: RedFlag[]; transactions: FlaggedTransaction[] } {
  const flags: RedFlag[] = [];
  const flaggedTxns: FlaggedTransaction[] = [];

  // Group by date+amount+description
  const groups: Record<string, any[]> = {};

  transactions.forEach(t => {
    const key = `${t.date}|${t.amount}|${(t.description || '').toLowerCase()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const duplicates = Object.values(groups).filter(g => g.length > 1);

  if (duplicates.length > 0) {
    const totalDuplicates = duplicates.reduce((sum, g) => sum + g.length - 1, 0);
    const duplicateAmount = duplicates.reduce((sum, g) =>
      sum + (g.length - 1) * Math.abs(g[0].amount), 0);
    const penaltyRef = PENALTY_REFERENCE['IRC 6662'];

    flags.push({
      id: generateId('DUP'),
      title: 'Duplicate Transactions Detected',
      description: `${totalDuplicates} potential duplicate transactions totaling $${duplicateAmount.toLocaleString()}. ` +
        `Duplicate expense claims violate IRC 162 and may constitute fraud under IRC 6663.`,
      category: 'duplicates',
      severity: 'medium',
      confidence: 0.80,
      amount_involved: duplicateAmount,
      irc_section: 'IRC 162, 6662, 6663',
      law_violated: 'IRC 162(a) - Ordinary and Necessary Business Expenses; IRC 6662/6663 - Penalties',
      penalty_civil: `If negligence: ${penaltyRef.civil_penalty}. If intentional: 75% fraud penalty under IRC 6663.`,
      penalty_criminal: 'IRC 7206(1): Up to 3 years per false return if intentional duplicate claims',
      consequences: [
        'Disallowance of duplicate deductions',
        '20% accuracy-related penalty if negligence',
        '75% fraud penalty if intentional',
        'Potential criminal prosecution if pattern of fraud',
        'Restatement of prior year returns',
        ...penaltyRef.consequences,
      ],
      statute_of_limitations: '3 years; 6 years if substantial understatement; NONE if fraud',
      risk_factors: [
        'Double-counted expenses inflate deductions',
        'Data entry errors require correction',
        'Pattern of duplicates suggests intentional fraud',
        'Indicates weak internal controls (SOX 404 concern)',
      ],
      recommended_actions: [
        'Review each duplicate for validity against source documents',
        'Verify against bank statements and credit card records',
        'Remove invalid duplicates and amend returns if material',
        'Implement duplicate detection controls',
        'Document as data entry error if unintentional',
      ],
    });

    duplicates.forEach(group => {
      group.slice(1).forEach(t => {
        flaggedTxns.push({
          id: t.id || generateId('TXN'),
          date: t.date,
          description: t.description || '',
          amount: t.amount,
          flag_type: 'duplicate',
          flag_reason: 'Potential duplicate transaction',
          severity: 'medium',
        });
      });
    });
  }

  return { flags, transactions: flaggedTxns };
}

function detectForeignTransactions(transactions: any[]): { flags: RedFlag[]; transactions: FlaggedTransaction[] } {
  const flags: RedFlag[] = [];
  const flaggedTxns: FlaggedTransaction[] = [];

  const keywords = ['foreign', 'international', 'offshore', 'cayman', 'swiss', 'bvi', 'luxembourg'];

  const foreignTxns = transactions.filter(t => {
    const desc = (t.description || '').toLowerCase();
    return keywords.some(kw => desc.includes(kw)) ||
           (t.counterparty_country && t.counterparty_country !== 'US');
  });

  if (foreignTxns.length > 0) {
    const totalAmount = foreignTxns.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const fbarRef = PENALTY_REFERENCE['FBAR'];
    const fatcaRef = PENALTY_REFERENCE['FATCA'];

    flags.push({
      id: generateId('FOR'),
      title: 'Foreign Transaction Activity',
      description: `${foreignTxns.length} foreign transactions totaling $${totalAmount.toLocaleString()}. ` +
        `FBAR (FinCEN 114) and FATCA (Form 8938) compliance review REQUIRED. ` +
        `Willful FBAR violations carry penalties of 50% of account balance per year.`,
      category: 'foreign',
      severity: 'high',
      confidence: 0.80,
      amount_involved: totalAmount,
      irc_section: 'FBAR (31 USC 5314), FATCA (IRC 6038D)',
      law_violated: 'Bank Secrecy Act (31 USC 5314) - FBAR; IRC 6038D - FATCA (Form 8938)',
      penalty_civil: `FBAR Non-willful: ${fbarRef.civil_penalty}. FATCA: ${fatcaRef.civil_penalty}`,
      penalty_criminal: fbarRef.criminal_penalty,
      consequences: [
        ...fbarRef.consequences,
        ...fatcaRef.consequences,
        'Potential unreported foreign income (IRC 61)',
        'PFIC reporting if foreign mutual funds (Form 8621)',
        'Form 3520/3520-A for foreign trust interests',
        'Form 5471 for controlled foreign corporations',
      ],
      statute_of_limitations: `FBAR: ${fbarRef.statute_of_limitations}. FATCA: ${fatcaRef.statute_of_limitations}`,
      risk_factors: [
        'FBAR filing required if aggregate accounts > $10,000 any time during year',
        'Form 8938 thresholds: $50,000 (domestic) / $200,000 (foreign resident)',
        'PFIC rules may apply to foreign mutual funds',
        'Tax haven jurisdiction heightens scrutiny',
        'Unreported foreign income is criminal tax evasion',
      ],
      recommended_actions: [
        'File delinquent FBARs through Streamlined Procedures if non-willful',
        'File Form 8938 with tax return if threshold met',
        'Report all foreign income on Schedule B, E, or appropriate form',
        'Document foreign account ownership and signature authority',
        'Consider IRS Voluntary Disclosure Practice if willful non-compliance',
        'Engage international tax specialist immediately',
      ],
    });

    foreignTxns.forEach(t => {
      flaggedTxns.push({
        id: t.id || generateId('TXN'),
        date: t.date,
        description: t.description || '',
        amount: t.amount,
        flag_type: 'foreign',
        flag_reason: 'Foreign transaction indicator',
        severity: 'high',
      });
    });
  }

  return { flags, transactions: flaggedTxns };
}

function detectJournalEntryAnomalies(ledgerEntries: any[]): { flags: RedFlag[] } {
  const flags: RedFlag[] = [];

  // Check for period-end entries
  const periodEndEntries = ledgerEntries.filter(e => {
    const date = new Date(e.date);
    const day = date.getDate();
    const month = date.getMonth();
    return day >= 28 || (day === 1 && (month === 0 || month === 3 || month === 6 || month === 9));
  });

  if (periodEndEntries.length > ledgerEntries.length * 0.3) {
    flags.push({
      id: generateId('JEA'),
      title: 'High Period-End Journal Entry Concentration',
      description: `${(periodEndEntries.length / ledgerEntries.length * 100).toFixed(0)}% of entries at period-end. ` +
        `May indicate earnings management.`,
      category: 'journal_entries',
      severity: 'high',
      confidence: 0.70,
      risk_factors: [
        'Earnings management indicator',
        'SOX 404 concern',
        'Restatement risk',
      ],
      recommended_actions: [
        'Review business purpose for period-end entries',
        'Document management judgments',
        'Consider disclosure implications',
      ],
    });
  }

  // Check for entries to equity accounts
  const equityEntries = ledgerEntries.filter(e =>
    e.account_name?.toLowerCase().includes('equity') ||
    e.account_name?.toLowerCase().includes('retained') ||
    e.account_number?.startsWith('3')
  );

  if (equityEntries.length > 0) {
    const totalEquity = equityEntries.reduce((sum, e) => sum + Math.abs(e.debit || e.credit || 0), 0);

    if (totalEquity > 10000) {
      flags.push({
        id: generateId('EQU'),
        title: 'Direct Equity Account Entries',
        description: `${equityEntries.length} entries directly to equity accounts totaling $${totalEquity.toLocaleString()}. ` +
          `Unusual activity requiring review.`,
        category: 'journal_entries',
        severity: 'medium',
        confidence: 0.65,
        amount_involved: totalEquity,
        risk_factors: [
          'Bypass of income statement',
          'Prior period adjustment indicator',
          'Potential restatement',
        ],
        recommended_actions: [
          'Document business rationale',
          'Review for proper classification',
          'Consider disclosure requirements',
        ],
      });
    }
  }

  return { flags };
}

function detectGhostEmployeeIndicators(transactions: any[]): { flags: RedFlag[] } {
  const flags: RedFlag[] = [];

  // Check for suspicious payroll patterns
  const payrollTxns = transactions.filter(t =>
    t.description?.toLowerCase().includes('payroll') ||
    t.description?.toLowerCase().includes('salary') ||
    t.description?.toLowerCase().includes('wages')
  );

  // Check for unusual names
  const suspiciousNames = payrollTxns.filter(t => {
    const desc = (t.description || '').toLowerCase();
    return desc.includes('ghost') ||
           desc.includes('fictitious') ||
           desc.includes('test') ||
           /^[a-z]+ [a-z]$/i.test(desc);  // Single letter last name
  });

  if (suspiciousNames.length > 0) {
    const penaltyRef7206 = PENALTY_REFERENCE['IRC 7206'];
    const penaltyRef6672 = PENALTY_REFERENCE['IRC 6672'];

    flags.push({
      id: generateId('GHO'),
      title: 'Ghost Employee Indicators',
      description: `${suspiciousNames.length} payroll transactions with suspicious patterns indicating potential ghost employee scheme. ` +
        `This is a serious fraud indicator with criminal implications under IRC 7206.`,
      category: 'ghost_employee',
      severity: 'critical',
      confidence: 0.75,
      irc_section: 'IRC 7206 (False Statements), IRC 6672 (Trust Fund Recovery)',
      law_violated: 'IRC 7206(1) - Fraud and False Statements; IRC 7206(2) - Aiding False Return; 18 USC 1343 - Wire Fraud',
      penalty_civil: `${penaltyRef6672.civil_penalty}. Plus disallowance of all fraudulent deductions under IRC 162.`,
      penalty_criminal: `${penaltyRef7206.criminal_penalty}. Wire fraud: Up to 20 years. Embezzlement state charges also apply.`,
      consequences: [
        ...penaltyRef7206.consequences,
        'W-2 fraud (each false W-2 is separate felony count)',
        '100% Trust Fund Recovery Penalty for unpaid withholding',
        'Embezzlement/theft prosecution under state law',
        'Wire fraud charges if electronic transfers involved (18 USC 1343)',
        'Conspiracy charges if multiple people involved (18 USC 371)',
        'Responsible person liability for corporate officers',
        'Professional license revocation',
        'Debarment from federal contracting',
      ],
      statute_of_limitations: '6 years for tax crimes; 5 years for wire fraud; NONE for fraud penalty',
      risk_factors: [
        'Payroll fraud indicator - badges of fraud',
        'Criminal exposure under multiple statutes',
        'Embezzlement if funds diverted to insider',
        'False W-2s filed with SSA',
        'Fictitious identity fraud potential',
      ],
      recommended_actions: [
        'STOP - Engage criminal defense counsel immediately',
        'Issue litigation hold on all payroll records',
        'Verify all employees against HR records and I-9 forms',
        'Cross-check with badge access, email, and physical presence',
        'Review payroll authorization and approval chains',
        'Engage forensic accountant for full investigation',
        'Consider SAR filing if bank account diversion detected',
        'Preserve chain of custody for all evidence',
      ],
    });
  }

  return { flags };
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

function calculateScores(flags: RedFlag[], input: RedFlagAnalysisInput): {
  irs: number;
  fraud: number;
  penalty: number;
  sec: number;
  criminal: number;
  overall: number;
} {
  const severityWeights = {
    critical: 30,
    high: 20,
    medium: 10,
    low: 5,
  };

  // Group flags by category
  const byCategory: Record<string, RedFlag[]> = {};
  flags.forEach(f => {
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  });

  // Calculate IRS risk score
  let irsScore = 20; // Base
  ['structuring', 'cash', 'round_dollar', 'estimation', 'vendor', 'foreign', 'timing'].forEach(cat => {
    (byCategory[cat] || []).forEach(f => {
      irsScore += severityWeights[f.severity] * f.confidence;
    });
  });

  // Calculate fraud score
  let fraudScore = 15;
  ['structuring', 'ghost_employee', 'duplicates', 'related_party'].forEach(cat => {
    (byCategory[cat] || []).forEach(f => {
      fraudScore += severityWeights[f.severity] * f.confidence;
    });
  });

  // Calculate penalty score
  let penaltyScore = 20;
  flags.filter(f => f.severity === 'critical' || f.severity === 'high').forEach(f => {
    penaltyScore += 10;
  });

  // Calculate SEC score (only for corporations)
  let secScore = 20;
  if (input.taxpayer_type === 'corporation') {
    ['journal_entries', 'related_party', 'vendor'].forEach(cat => {
      (byCategory[cat] || []).forEach(f => {
        secScore += severityWeights[f.severity] * f.confidence * 0.8;
      });
    });
  }

  // Calculate criminal score
  let criminalScore = 10;
  ['structuring', 'ghost_employee'].forEach(cat => {
    (byCategory[cat] || []).forEach(f => {
      criminalScore += severityWeights[f.severity] * f.confidence * 1.5;
    });
  });

  // Cap and round scores
  irsScore = Math.min(Math.round(irsScore), 100);
  fraudScore = Math.min(Math.round(fraudScore), 100);
  penaltyScore = Math.min(Math.round(penaltyScore), 100);
  secScore = Math.min(Math.round(secScore), 100);
  criminalScore = Math.min(Math.round(criminalScore), 100);

  // Calculate overall (weighted average)
  const overall = Math.round(
    irsScore * 0.25 +
    fraudScore * 0.25 +
    penaltyScore * 0.15 +
    secScore * 0.10 +
    criminalScore * 0.25
  );

  return {
    irs: irsScore,
    fraud: fraudScore,
    penalty: penaltyScore,
    sec: secScore,
    criminal: criminalScore,
    overall: Math.min(overall, 100),
  };
}
