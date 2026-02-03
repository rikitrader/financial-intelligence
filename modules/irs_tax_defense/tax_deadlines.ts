/**
 * IRS Tax Filing Deadlines & Compliance Calendar
 * Complete reference for all entity types and tax obligations
 *
 * Sources:
 * - IRS Publication 509 (Tax Calendars)
 * - IRC Sections 6072, 6081, 6651
 * - Treasury Regulations
 */

// ============================================================================
// ENTITY-BASED FILING DEADLINES
// ============================================================================

export interface TaxDeadline {
  form: string;
  form_name: string;
  entity_types: string[];
  original_due_date: string;
  extended_due_date: string;
  extension_form: string;
  penalty_for_late_filing: string;
  penalty_irc_section: string;
  notes: string[];
}

export interface QuarterlyDeadline {
  quarter: string;
  period_covered: string;
  due_date: string;
  forms: string[];
  applies_to: string[];
}

export interface PayrollDeadline {
  form: string;
  form_name: string;
  frequency: string;
  due_date: string;
  penalty_irc_section: string;
  notes: string[];
}

// ============================================================================
// ANNUAL INCOME TAX RETURN DEADLINES
// ============================================================================

export const ANNUAL_INCOME_TAX_DEADLINES: TaxDeadline[] = [
  // INDIVIDUALS
  {
    form: '1040',
    form_name: 'U.S. Individual Income Tax Return',
    entity_types: ['individual', 'sole_prop'],
    original_due_date: 'April 15',
    extended_due_date: 'October 15',
    extension_form: '4868',
    penalty_for_late_filing: '5% per month, max 25% of unpaid tax',
    penalty_irc_section: 'IRC § 6651(a)(1)',
    notes: [
      'If April 15 falls on weekend/holiday, due next business day',
      'Automatic 6-month extension available with Form 4868',
      'Extension is for filing, NOT for payment',
      'Combat zone service members get additional extensions',
    ],
  },

  // PARTNERSHIPS
  {
    form: '1065',
    form_name: 'U.S. Return of Partnership Income',
    entity_types: ['partnership', 'llc_multi'],
    original_due_date: 'March 15',
    extended_due_date: 'September 15',
    extension_form: '7004',
    penalty_for_late_filing: '$220/partner/month, max 12 months (2024)',
    penalty_irc_section: 'IRC § 6698',
    notes: [
      'Schedule K-1s must be provided to partners by March 15',
      'Automatic 6-month extension with Form 7004',
      'Small partnership exception may apply (<100 partners)',
      'Must file even if no income or activity',
    ],
  },

  // S CORPORATIONS
  {
    form: '1120-S',
    form_name: 'U.S. Income Tax Return for an S Corporation',
    entity_types: ['scorp'],
    original_due_date: 'March 15',
    extended_due_date: 'September 15',
    extension_form: '7004',
    penalty_for_late_filing: '$220/shareholder/month, max 12 months (2024)',
    penalty_irc_section: 'IRC § 6699',
    notes: [
      'Schedule K-1s must be provided to shareholders by March 15',
      'Built-in gains tax may apply (IRC § 1374)',
      'Passive investment income tax (IRC § 1375)',
      'Election termination rules apply',
    ],
  },

  // C CORPORATIONS
  {
    form: '1120',
    form_name: 'U.S. Corporation Income Tax Return',
    entity_types: ['ccorp'],
    original_due_date: 'April 15 (calendar year)',
    extended_due_date: 'October 15',
    extension_form: '7004',
    penalty_for_late_filing: '5% per month, max 25% of unpaid tax',
    penalty_irc_section: 'IRC § 6651(a)(1)',
    notes: [
      'Fiscal year corps: 15th day of 4th month after year end',
      'June 30 fiscal year: September 15 due date',
      'Automatic 6-month extension with Form 7004',
      'Estimated tax payments required quarterly',
    ],
  },

  // TRUSTS & ESTATES
  {
    form: '1041',
    form_name: 'U.S. Income Tax Return for Estates and Trusts',
    entity_types: ['trust', 'estate'],
    original_due_date: 'April 15 (calendar year)',
    extended_due_date: 'September 30',
    extension_form: '7004',
    penalty_for_late_filing: '5% per month, max 25% of unpaid tax',
    penalty_irc_section: 'IRC § 6651(a)(1)',
    notes: [
      'Estates may elect fiscal year ending within 12 months of death',
      'Schedule K-1s required for beneficiaries',
      'Grantor trusts may require different reporting',
      '5.5-month extension available with Form 7004',
    ],
  },

  // NONPROFIT ORGANIZATIONS
  {
    form: '990',
    form_name: 'Return of Organization Exempt From Income Tax',
    entity_types: ['nonprofit'],
    original_due_date: '15th day of 5th month after year end',
    extended_due_date: '15th day of 11th month after year end',
    extension_form: '8868',
    penalty_for_late_filing: '$20/day, max $10,000 (small orgs)',
    penalty_irc_section: 'IRC § 6652(c)(1)(A)',
    notes: [
      'Calendar year orgs: May 15',
      '990-N (e-Postcard) for gross receipts ≤ $50,000',
      '990-EZ for gross receipts < $200,000 and assets < $500,000',
      'Failure to file 3 consecutive years = loss of exempt status',
    ],
  },

  // NONPROFIT - PF
  {
    form: '990-PF',
    form_name: 'Return of Private Foundation',
    entity_types: ['nonprofit'],
    original_due_date: '15th day of 5th month after year end',
    extended_due_date: '15th day of 11th month after year end',
    extension_form: '8868',
    penalty_for_late_filing: '$20/day, max lesser of $10,000 or 5% of gross receipts',
    penalty_irc_section: 'IRC § 6652(c)(1)(A)',
    notes: [
      'Required for all private foundations regardless of size',
      'Excise tax on investment income (IRC § 4940)',
      'Minimum distribution requirements apply',
      'Self-dealing rules (IRC § 4941)',
    ],
  },
];

// ============================================================================
// ESTIMATED TAX PAYMENT DEADLINES
// ============================================================================

export const ESTIMATED_TAX_DEADLINES: QuarterlyDeadline[] = [
  {
    quarter: 'Q1',
    period_covered: 'January 1 - March 31',
    due_date: 'April 15',
    forms: ['1040-ES', '1120-W'],
    applies_to: ['individual', 'sole_prop', 'ccorp', 'trust', 'estate'],
  },
  {
    quarter: 'Q2',
    period_covered: 'April 1 - May 31',
    due_date: 'June 15',
    forms: ['1040-ES', '1120-W'],
    applies_to: ['individual', 'sole_prop', 'ccorp', 'trust', 'estate'],
  },
  {
    quarter: 'Q3',
    period_covered: 'June 1 - August 31',
    due_date: 'September 15',
    forms: ['1040-ES', '1120-W'],
    applies_to: ['individual', 'sole_prop', 'ccorp', 'trust', 'estate'],
  },
  {
    quarter: 'Q4',
    period_covered: 'September 1 - December 31',
    due_date: 'January 15 (following year)',
    forms: ['1040-ES', '1120-W'],
    applies_to: ['individual', 'sole_prop', 'ccorp', 'trust', 'estate'],
  },
];

// ============================================================================
// PAYROLL TAX DEADLINES
// ============================================================================

export const PAYROLL_TAX_DEADLINES: PayrollDeadline[] = [
  // FORM 941 - Quarterly
  {
    form: '941',
    form_name: 'Employer\'s Quarterly Federal Tax Return',
    frequency: 'Quarterly',
    due_date: 'Last day of month following quarter end (Apr 30, Jul 31, Oct 31, Jan 31)',
    penalty_irc_section: 'IRC § 6651, § 6656',
    notes: [
      'Reports wages, tips, federal income tax withheld',
      'Reports Social Security and Medicare taxes',
      'Deposit schedules: Monthly or Semi-weekly based on liability',
      'Electronic filing required for 10+ employees',
    ],
  },

  // FORM 940 - Annual
  {
    form: '940',
    form_name: 'Employer\'s Annual Federal Unemployment (FUTA) Tax Return',
    frequency: 'Annual',
    due_date: 'January 31 (February 10 if all deposits made timely)',
    penalty_irc_section: 'IRC § 6651, § 6656',
    notes: [
      'FUTA tax rate: 6.0% on first $7,000 of wages per employee',
      'Credit up to 5.4% for state unemployment taxes paid',
      'Quarterly deposits required if liability > $500',
      'Credit reduction states may affect rate',
    ],
  },

  // FORM 944 - Annual (Small Employers)
  {
    form: '944',
    form_name: 'Employer\'s Annual Federal Tax Return',
    frequency: 'Annual',
    due_date: 'January 31',
    penalty_irc_section: 'IRC § 6651, § 6656',
    notes: [
      'For employers with annual liability ≤ $1,000',
      'Must be notified by IRS to use Form 944',
      'Reports same info as Form 941 but annually',
      'Can request to file 941 instead',
    ],
  },

  // FORM 943 - Agricultural
  {
    form: '943',
    form_name: 'Employer\'s Annual Federal Tax Return for Agricultural Employees',
    frequency: 'Annual',
    due_date: 'January 31',
    penalty_irc_section: 'IRC § 6651, § 6656',
    notes: [
      'For employers of agricultural workers',
      'Different deposit rules than Form 941',
      'Social Security/Medicare same as other employers',
      'H-2A visa workers have special rules',
    ],
  },
];

// ============================================================================
// INFORMATION RETURN DEADLINES
// ============================================================================

export interface InformationReturnDeadline {
  form: string;
  form_name: string;
  recipient_due_date: string;
  irs_paper_due_date: string;
  irs_electronic_due_date: string;
  penalty_per_return: string;
  penalty_irc_section: string;
  notes: string[];
}

export const INFORMATION_RETURN_DEADLINES: InformationReturnDeadline[] = [
  // W-2
  {
    form: 'W-2',
    form_name: 'Wage and Tax Statement',
    recipient_due_date: 'January 31',
    irs_paper_due_date: 'January 31',
    irs_electronic_due_date: 'January 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'No automatic extension available',
      'W-3 transmittal due same date',
      'Electronic filing required if 10+ forms',
      'Copies to state agencies may also be required',
    ],
  },

  // 1099-NEC
  {
    form: '1099-NEC',
    form_name: 'Nonemployee Compensation',
    recipient_due_date: 'January 31',
    irs_paper_due_date: 'January 31',
    irs_electronic_due_date: 'January 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'Required for payments ≥ $600 to non-employees',
      'Replaced Box 7 of 1099-MISC for nonemployee compensation',
      'No extension available',
      'Used for independent contractors, attorneys fees, etc.',
    ],
  },

  // 1099-MISC
  {
    form: '1099-MISC',
    form_name: 'Miscellaneous Information',
    recipient_due_date: 'January 31 (most boxes) / February 15 (substitute payments)',
    irs_paper_due_date: 'February 28',
    irs_electronic_due_date: 'March 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'Rents, royalties, prizes, awards, etc.',
      'Gross proceeds to attorneys',
      'Crop insurance proceeds',
      'Fish purchases for cash',
    ],
  },

  // 1099-INT
  {
    form: '1099-INT',
    form_name: 'Interest Income',
    recipient_due_date: 'January 31',
    irs_paper_due_date: 'February 28',
    irs_electronic_due_date: 'March 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'Required for interest payments ≥ $10',
      'Includes interest on savings, CDs, bonds',
      'Tax-exempt interest also reported',
      'Early withdrawal penalties reported separately',
    ],
  },

  // 1099-DIV
  {
    form: '1099-DIV',
    form_name: 'Dividends and Distributions',
    recipient_due_date: 'January 31',
    irs_paper_due_date: 'February 28',
    irs_electronic_due_date: 'March 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'Required for dividends ≥ $10',
      'Qualified vs. ordinary dividends',
      'Capital gain distributions',
      'Return of capital distributions',
    ],
  },

  // 1099-B
  {
    form: '1099-B',
    form_name: 'Proceeds from Broker and Barter Exchange Transactions',
    recipient_due_date: 'February 15',
    irs_paper_due_date: 'February 28',
    irs_electronic_due_date: 'March 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'Reports sales of stocks, bonds, commodities',
      'Cost basis reporting required for covered securities',
      'Short-term vs. long-term holding periods',
      'Wash sale adjustments may be reported',
    ],
  },

  // 1099-K
  {
    form: '1099-K',
    form_name: 'Payment Card and Third Party Network Transactions',
    recipient_due_date: 'January 31',
    irs_paper_due_date: 'February 28',
    irs_electronic_due_date: 'March 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'Threshold: $600 (per IRS 2024 transition rule)',
      'Issued by payment settlement entities (PayPal, Stripe, etc.)',
      'Gross amount reported (not net of fees)',
      'State thresholds may differ',
    ],
  },

  // 1099-R
  {
    form: '1099-R',
    form_name: 'Distributions From Pensions, Annuities, Retirement Plans, IRAs',
    recipient_due_date: 'January 31',
    irs_paper_due_date: 'February 28',
    irs_electronic_due_date: 'March 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'All distributions from retirement plans',
      'Distribution codes indicate type/taxability',
      'Early withdrawal penalties noted',
      'Roth vs. traditional distributions',
    ],
  },

  // 1099-S
  {
    form: '1099-S',
    form_name: 'Proceeds from Real Estate Transactions',
    recipient_due_date: 'January 31',
    irs_paper_due_date: 'February 28',
    irs_electronic_due_date: 'March 31',
    penalty_per_return: '$60-$310 per form (2024)',
    penalty_irc_section: 'IRC § 6721, § 6722',
    notes: [
      'Reports gross proceeds from real estate sales',
      'Exceptions for principal residence under IRC § 121',
      'Filed by closing agent/settlement attorney',
      'Buyer TIN required',
    ],
  },
];

// ============================================================================
// INTERNATIONAL FILING DEADLINES
// ============================================================================

export interface InternationalFilingDeadline {
  form: string;
  form_name: string;
  due_date: string;
  extension_available: boolean;
  penalty: string;
  penalty_irc_section: string;
  notes: string[];
}

export const INTERNATIONAL_FILING_DEADLINES: InternationalFilingDeadline[] = [
  {
    form: 'FBAR (FinCEN 114)',
    form_name: 'Report of Foreign Bank and Financial Accounts',
    due_date: 'April 15 (auto-extended to October 15)',
    extension_available: true,
    penalty: '$10,000 per violation (non-willful); greater of $100,000 or 50% of balance (willful)',
    penalty_irc_section: '31 USC § 5321',
    notes: [
      'Required if aggregate foreign accounts > $10,000 at any time',
      'Filed electronically through FinCEN BSA E-Filing',
      'Not filed with tax return',
      'Criminal penalties for willful violations',
    ],
  },
  {
    form: '8938',
    form_name: 'Statement of Specified Foreign Financial Assets (FATCA)',
    due_date: 'With income tax return (April 15 / October 15 extended)',
    extension_available: true,
    penalty: '$10,000 for failure to file; up to $50,000 for continued failure',
    penalty_irc_section: 'IRC § 6038D',
    notes: [
      'Thresholds vary by filing status and residence',
      'Domestic filers: $50,000 year-end / $75,000 at any time',
      'Foreign filers: $200,000 year-end / $300,000 at any time',
      'Different from FBAR - filed with tax return',
    ],
  },
  {
    form: '5471',
    form_name: 'Information Return of U.S. Persons With Respect to Certain Foreign Corporations',
    due_date: 'With income tax return',
    extension_available: true,
    penalty: '$10,000 per foreign corporation; additional $10,000/month (max $50,000)',
    penalty_irc_section: 'IRC § 6038',
    notes: [
      'Required for certain U.S. shareholders of CFCs',
      'Five categories of filers with different requirements',
      'Subpart F income reporting',
      'GILTI reporting for certain shareholders',
    ],
  },
  {
    form: '8865',
    form_name: 'Return of U.S. Persons With Respect to Certain Foreign Partnerships',
    due_date: 'With income tax return',
    extension_available: true,
    penalty: '$10,000 per partnership; additional $10,000/month (max $50,000)',
    penalty_irc_section: 'IRC § 6038',
    notes: [
      'Required for certain U.S. partners in foreign partnerships',
      'Four categories of filers',
      'Transfers to foreign partnerships also reported',
      'Schedule K-1 equivalent information',
    ],
  },
  {
    form: '3520',
    form_name: 'Annual Return To Report Transactions With Foreign Trusts',
    due_date: 'April 15 (15th day of 4th month)',
    extension_available: true,
    penalty: 'Greater of $10,000 or 5% of trust value; 35% of distribution from foreign trust',
    penalty_irc_section: 'IRC § 6677',
    notes: [
      'Required for transactions with foreign trusts',
      'Receiving distributions from foreign trusts',
      'Large gifts from foreign persons',
      'Very strict reporting requirements',
    ],
  },
  {
    form: '3520-A',
    form_name: 'Annual Information Return of Foreign Trust With a U.S. Owner',
    due_date: 'March 15 (15th day of 3rd month)',
    extension_available: true,
    penalty: 'Greater of $10,000 or 5% of portion treated as owned',
    penalty_irc_section: 'IRC § 6048',
    notes: [
      'Filed by foreign trust with U.S. owner',
      'Substitute for Form 1041',
      'Foreign Trust Statement to be provided to U.S. owner',
      'U.S. owner responsible if trust fails to file',
    ],
  },
];

// ============================================================================
// SPECIAL DEADLINES & ELECTIONS
// ============================================================================

export interface SpecialDeadline {
  action: string;
  deadline: string;
  form_or_method: string;
  irc_section: string;
  notes: string[];
}

export const SPECIAL_DEADLINES: SpecialDeadline[] = [
  {
    action: 'S Corporation Election',
    deadline: 'March 15 (2 months 15 days into tax year)',
    form_or_method: 'Form 2553',
    irc_section: 'IRC § 1362',
    notes: [
      'Late election relief available under Rev. Proc. 2013-30',
      'All shareholders must consent',
      'Certain corporations ineligible',
      'Effective beginning of year if timely filed',
    ],
  },
  {
    action: 'LLC Electing Corporate Treatment',
    deadline: '75 days from formation or start of tax year',
    form_or_method: 'Form 8832',
    irc_section: 'Treas. Reg. § 301.7701-3',
    notes: [
      'Check-the-box election',
      'Can elect C-Corp or S-Corp (with 2553)',
      'Late election relief available',
      '60-month limitation on re-election',
    ],
  },
  {
    action: 'Fiscal Year Change',
    deadline: 'Varies by method',
    form_or_method: 'Form 1128',
    irc_section: 'IRC § 442',
    notes: [
      'Automatic approval for certain changes',
      'Short period return required',
      'Annualization may be required',
      'Partnerships/S-Corps have restrictions',
    ],
  },
  {
    action: 'Accounting Method Change',
    deadline: 'During tax year of change',
    form_or_method: 'Form 3115',
    irc_section: 'IRC § 446',
    notes: [
      'Automatic approval list in Rev. Proc.',
      'IRC § 481(a) adjustment required',
      'Spread period for positive adjustments',
      'Non-automatic requires advance consent',
    ],
  },
  {
    action: 'IRA Contribution',
    deadline: 'April 15 (no extension)',
    form_or_method: 'Direct contribution to IRA',
    irc_section: 'IRC § 219',
    notes: [
      'Limit: $7,000 (2024); $8,000 if 50+',
      'Roth income limits apply',
      'SEP-IRA deadline extends with return',
      'Excess contribution penalty 6%/year',
    ],
  },
  {
    action: 'HSA Contribution',
    deadline: 'April 15 (no extension)',
    form_or_method: 'Direct contribution to HSA',
    irc_section: 'IRC § 223',
    notes: [
      'Limit: $4,150 individual / $8,300 family (2024)',
      'Additional $1,000 if 55+',
      'Must have HDHP coverage',
      'Excess contribution penalty 6%/year',
    ],
  },
  {
    action: 'Amended Return (Refund Claim)',
    deadline: '3 years from filing or 2 years from payment, whichever is later',
    form_or_method: 'Form 1040-X, 1120-X',
    irc_section: 'IRC § 6511',
    notes: [
      'Amount limited to tax paid within lookback period',
      'Net operating loss carryback extends period',
      'No time limit for fraud refund claims',
      'Special rules for bad debts, worthless securities',
    ],
  },
];

// ============================================================================
// COMPLETE ANNUAL TAX CALENDAR
// ============================================================================

export interface CalendarEvent {
  date: string;
  event: string;
  forms: string[];
  entity_types: string[];
  category: 'filing' | 'payment' | 'information' | 'election' | 'other';
}

export const ANNUAL_TAX_CALENDAR: CalendarEvent[] = [
  // JANUARY
  { date: 'January 15', event: 'Q4 Estimated Tax Payment Due', forms: ['1040-ES', '1120-W'], entity_types: ['individual', 'ccorp'], category: 'payment' },
  { date: 'January 31', event: 'W-2 and 1099-NEC Due to Recipients and IRS', forms: ['W-2', 'W-3', '1099-NEC'], entity_types: ['all'], category: 'information' },
  { date: 'January 31', event: 'Form 940 (FUTA) Due', forms: ['940'], entity_types: ['employers'], category: 'filing' },
  { date: 'January 31', event: 'Form 941 Q4 Due', forms: ['941'], entity_types: ['employers'], category: 'filing' },
  { date: 'January 31', event: 'Form 944 Due (if applicable)', forms: ['944'], entity_types: ['small_employers'], category: 'filing' },
  { date: 'January 31', event: '1099 Forms Due to Recipients (most types)', forms: ['1099-MISC', '1099-INT', '1099-DIV', '1099-R', '1099-K'], entity_types: ['all'], category: 'information' },

  // FEBRUARY
  { date: 'February 15', event: '1099-B Due to Recipients', forms: ['1099-B'], entity_types: ['brokers'], category: 'information' },
  { date: 'February 28', event: '1099 Forms Due to IRS (paper)', forms: ['1099-MISC', '1099-INT', '1099-DIV', '1099-B', '1099-R'], entity_types: ['all'], category: 'information' },

  // MARCH
  { date: 'March 15', event: 'Partnership Returns Due (Form 1065)', forms: ['1065', 'K-1'], entity_types: ['partnership', 'llc_multi'], category: 'filing' },
  { date: 'March 15', event: 'S Corporation Returns Due (Form 1120-S)', forms: ['1120-S', 'K-1'], entity_types: ['scorp'], category: 'filing' },
  { date: 'March 15', event: 'S Corporation Election Deadline', forms: ['2553'], entity_types: ['llc', 'ccorp'], category: 'election' },
  { date: 'March 31', event: '1099 Forms Due to IRS (electronic)', forms: ['1099-MISC', '1099-INT', '1099-DIV', '1099-B', '1099-R', '1099-K'], entity_types: ['all'], category: 'information' },

  // APRIL
  { date: 'April 15', event: 'Individual Returns Due (Form 1040)', forms: ['1040'], entity_types: ['individual', 'sole_prop'], category: 'filing' },
  { date: 'April 15', event: 'C Corporation Returns Due (Form 1120)', forms: ['1120'], entity_types: ['ccorp'], category: 'filing' },
  { date: 'April 15', event: 'Trust & Estate Returns Due (Form 1041)', forms: ['1041'], entity_types: ['trust', 'estate'], category: 'filing' },
  { date: 'April 15', event: 'Q1 Estimated Tax Payment Due', forms: ['1040-ES', '1120-W'], entity_types: ['individual', 'ccorp'], category: 'payment' },
  { date: 'April 15', event: 'IRA/HSA Contribution Deadline', forms: ['5498'], entity_types: ['individual'], category: 'other' },
  { date: 'April 15', event: 'FBAR Due (auto-extends to Oct 15)', forms: ['FinCEN 114'], entity_types: ['individual', 'all'], category: 'filing' },
  { date: 'April 30', event: 'Form 941 Q1 Due', forms: ['941'], entity_types: ['employers'], category: 'filing' },

  // MAY
  { date: 'May 15', event: 'Nonprofit Returns Due (Form 990)', forms: ['990', '990-EZ', '990-PF'], entity_types: ['nonprofit'], category: 'filing' },

  // JUNE
  { date: 'June 15', event: 'Q2 Estimated Tax Payment Due', forms: ['1040-ES', '1120-W'], entity_types: ['individual', 'ccorp'], category: 'payment' },
  { date: 'June 15', event: 'U.S. Citizens Abroad - Extension Deadline', forms: ['1040'], entity_types: ['individual'], category: 'filing' },

  // JULY
  { date: 'July 31', event: 'Form 941 Q2 Due', forms: ['941'], entity_types: ['employers'], category: 'filing' },
  { date: 'July 31', event: 'Form 5500 Due (Employee Benefit Plans)', forms: ['5500'], entity_types: ['employers'], category: 'filing' },

  // SEPTEMBER
  { date: 'September 15', event: 'Extended Partnership Returns Due', forms: ['1065'], entity_types: ['partnership', 'llc_multi'], category: 'filing' },
  { date: 'September 15', event: 'Extended S Corporation Returns Due', forms: ['1120-S'], entity_types: ['scorp'], category: 'filing' },
  { date: 'September 15', event: 'Q3 Estimated Tax Payment Due', forms: ['1040-ES', '1120-W'], entity_types: ['individual', 'ccorp'], category: 'payment' },
  { date: 'September 30', event: 'Extended Trust & Estate Returns Due', forms: ['1041'], entity_types: ['trust', 'estate'], category: 'filing' },

  // OCTOBER
  { date: 'October 15', event: 'Extended Individual Returns Due', forms: ['1040'], entity_types: ['individual', 'sole_prop'], category: 'filing' },
  { date: 'October 15', event: 'Extended C Corporation Returns Due', forms: ['1120'], entity_types: ['ccorp'], category: 'filing' },
  { date: 'October 15', event: 'Extended FBAR Deadline', forms: ['FinCEN 114'], entity_types: ['individual', 'all'], category: 'filing' },
  { date: 'October 31', event: 'Form 941 Q3 Due', forms: ['941'], entity_types: ['employers'], category: 'filing' },

  // NOVEMBER
  { date: 'November 15', event: 'Extended Nonprofit Returns Due', forms: ['990', '990-EZ', '990-PF'], entity_types: ['nonprofit'], category: 'filing' },

  // DECEMBER
  { date: 'December 31', event: 'Required Minimum Distributions (RMD) Deadline', forms: ['1099-R'], entity_types: ['individual'], category: 'other' },
  { date: 'December 31', event: 'Charitable Contribution Deadline', forms: ['1040 Sch A'], entity_types: ['individual'], category: 'other' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all deadlines for a specific entity type
 */
export function getDeadlinesForEntity(entityType: string): {
  income_tax: TaxDeadline[];
  estimated_tax: QuarterlyDeadline[];
  payroll: PayrollDeadline[];
  information_returns: InformationReturnDeadline[];
  calendar: CalendarEvent[];
} {
  return {
    income_tax: ANNUAL_INCOME_TAX_DEADLINES.filter(d =>
      d.entity_types.includes(entityType) || d.entity_types.includes('all')
    ),
    estimated_tax: ESTIMATED_TAX_DEADLINES.filter(d =>
      d.applies_to.includes(entityType) || d.applies_to.includes('all')
    ),
    payroll: entityType !== 'individual' ? PAYROLL_TAX_DEADLINES : [],
    information_returns: INFORMATION_RETURN_DEADLINES,
    calendar: ANNUAL_TAX_CALENDAR.filter(e =>
      e.entity_types.includes(entityType) || e.entity_types.includes('all') || e.entity_types.includes('employers')
    ),
  };
}

/**
 * Get upcoming deadlines within specified days
 */
export function getUpcomingDeadlines(days: number = 30): CalendarEvent[] {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + days);

  // This is a simplified version - in production, you'd calculate actual dates
  return ANNUAL_TAX_CALENDAR.filter(event => {
    // Parse the month and day from the date string
    const [month, day] = event.date.split(' ');
    const eventDate = new Date(`${month} ${day}, ${today.getFullYear()}`);
    return eventDate >= today && eventDate <= targetDate;
  });
}

/**
 * Get penalty information for a specific form
 */
export function getPenaltyInfo(form: string): {
  penalty: string;
  irc_section: string;
  notes: string[];
} | undefined {
  const incomeTax = ANNUAL_INCOME_TAX_DEADLINES.find(d => d.form === form);
  if (incomeTax) {
    return {
      penalty: incomeTax.penalty_for_late_filing,
      irc_section: incomeTax.penalty_irc_section,
      notes: incomeTax.notes,
    };
  }

  const infoReturn = INFORMATION_RETURN_DEADLINES.find(d => d.form === form);
  if (infoReturn) {
    return {
      penalty: infoReturn.penalty_per_return,
      irc_section: infoReturn.penalty_irc_section,
      notes: infoReturn.notes,
    };
  }

  const international = INTERNATIONAL_FILING_DEADLINES.find(d => d.form === form);
  if (international) {
    return {
      penalty: international.penalty,
      irc_section: international.penalty_irc_section,
      notes: international.notes,
    };
  }

  return undefined;
}

/**
 * Generate deadline summary for an entity
 */
export function generateDeadlineSummary(
  entityType: string,
  entityName: string,
  fiscalYearEnd: string = 'December 31'
): string {
  const deadlines = getDeadlinesForEntity(entityType);

  let summary = `# Tax Filing Deadline Summary\n\n`;
  summary += `**Entity:** ${entityName}\n`;
  summary += `**Entity Type:** ${entityType}\n`;
  summary += `**Fiscal Year End:** ${fiscalYearEnd}\n\n`;

  summary += `## Annual Income Tax Return\n\n`;
  summary += `| Form | Due Date | Extended Due Date | Extension Form |\n`;
  summary += `|------|----------|-------------------|----------------|\n`;
  for (const d of deadlines.income_tax) {
    summary += `| ${d.form} | ${d.original_due_date} | ${d.extended_due_date} | ${d.extension_form} |\n`;
  }

  summary += `\n## Estimated Tax Payments\n\n`;
  summary += `| Quarter | Period | Due Date |\n`;
  summary += `|---------|--------|----------|\n`;
  for (const d of deadlines.estimated_tax) {
    summary += `| ${d.quarter} | ${d.period_covered} | ${d.due_date} |\n`;
  }

  if (deadlines.payroll.length > 0) {
    summary += `\n## Payroll Tax Returns\n\n`;
    summary += `| Form | Frequency | Due Date |\n`;
    summary += `|------|-----------|----------|\n`;
    for (const d of deadlines.payroll) {
      summary += `| ${d.form} | ${d.frequency} | ${d.due_date} |\n`;
    }
  }

  return summary;
}
