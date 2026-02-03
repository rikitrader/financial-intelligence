/**
 * Tax Law Reference Module
 * Comprehensive reference to actual tax law sources with official citations
 *
 * SOURCES OF TAX LAW HIERARCHY (In Order of Legal Authority):
 * 1. Internal Revenue Code (Title 26 U.S.C.) - THE LAW ITSELF
 * 2. Treasury Regulations (26 CFR) - Binding Interpretations
 * 3. Tax Court & Federal Cases - Judicial Interpretation
 * 4. IRS Revenue Rulings & Notices - IRS Official Position
 * 5. IRS Publications - Guidance (Not Law)
 * 6. Internal Revenue Manual (IRM) - IRS Internal Procedures
 *
 * OFFICIAL SOURCES:
 * - Legal Information Institute (Cornell Law): https://www.law.cornell.edu/uscode/text/26
 * - GovInfo (U.S. Government Publishing Office): https://www.govinfo.gov/app/collection/uscode
 * - Treasury Regulations: https://www.ecfr.gov/current/title-26
 * - IRS Forms & Publications: https://www.irs.gov/forms-pubs
 * - Tax Court: https://www.ustaxcourt.gov
 * - IRS Internal Revenue Manual: https://www.irs.gov/irm
 */

// ============================================================================
// TAX LAW HIERARCHY TYPES
// ============================================================================

export interface TaxLawSource {
  level: number;
  name: string;
  authority: 'statutory' | 'regulatory' | 'judicial' | 'administrative' | 'guidance' | 'internal';
  official_url: string;
  backup_url?: string;
  description: string;
  binding: boolean;
  citation_format: string;
}

export interface IRCSection {
  section: string;
  title: string;
  subtitle: string;
  chapter: string;
  subchapter?: string;
  part?: string;
  summary: string;
  cornell_url: string;
  govinfo_url: string;
  related_regs: string[];
  key_provisions: string[];
  penalties?: PenaltyReference[];
  effective_date?: string;
  amendments?: string[];
}

export interface TreasuryRegulation {
  reg_number: string;
  title: string;
  irc_section: string;
  ecfr_url: string;
  summary: string;
  effective_date: string;
  binding: boolean;
}

export interface PenaltyReference {
  irc_section: string;
  penalty_type: 'civil' | 'criminal';
  description: string;
  amount_or_rate: string;
  statute_of_limitations: string;
}

export interface IRMReference {
  irm_section: string;
  title: string;
  url: string;
  summary: string;
  applies_to: string[];
}

// ============================================================================
// OFFICIAL TAX LAW SOURCES
// ============================================================================

export const TAX_LAW_SOURCES: TaxLawSource[] = [
  {
    level: 1,
    name: 'Internal Revenue Code (Title 26 U.S.C.)',
    authority: 'statutory',
    official_url: 'https://www.govinfo.gov/app/collection/uscode',
    backup_url: 'https://www.law.cornell.edu/uscode/text/26',
    description: 'THE actual tax code written by Congress. This is federal statutory law - the law itself.',
    binding: true,
    citation_format: 'IRC § [section], 26 U.S.C. § [section]',
  },
  {
    level: 2,
    name: 'Treasury Regulations (26 CFR)',
    authority: 'regulatory',
    official_url: 'https://www.ecfr.gov/current/title-26',
    description: 'Treasury Department interpretations of the IRC. Legally binding rules explaining how to apply the code.',
    binding: true,
    citation_format: 'Treas. Reg. § [section]',
  },
  {
    level: 3,
    name: 'Tax Court & Federal Cases',
    authority: 'judicial',
    official_url: 'https://www.ustaxcourt.gov',
    backup_url: 'https://scholar.google.com',
    description: 'Judicial interpretation of tax law. Binding precedent within respective circuits.',
    binding: true,
    citation_format: '[Name] v. Commissioner, [volume] T.C. [page] ([year])',
  },
  {
    level: 4,
    name: 'Revenue Rulings & Notices',
    authority: 'administrative',
    official_url: 'https://www.irs.gov/irb',
    description: 'Official IRS position on how they will interpret and apply the law.',
    binding: false,
    citation_format: 'Rev. Rul. [year]-[number]',
  },
  {
    level: 5,
    name: 'IRS Publications',
    authority: 'guidance',
    official_url: 'https://www.irs.gov/forms-pubs',
    description: 'IRS explanations for taxpayers. Not legally binding but reflect IRS interpretation.',
    binding: false,
    citation_format: 'IRS Pub. [number]',
  },
  {
    level: 6,
    name: 'Internal Revenue Manual (IRM)',
    authority: 'internal',
    official_url: 'https://www.irs.gov/irm',
    description: 'IRS internal procedures - how agents think, how audits work, how penalties apply.',
    binding: false,
    citation_format: 'IRM [part].[chapter].[section]',
  },
];

// ============================================================================
// INTERNAL REVENUE CODE STRUCTURE
// ============================================================================

export const IRC_STRUCTURE = {
  title: 'Title 26 - Internal Revenue Code',
  cornell_base: 'https://www.law.cornell.edu/uscode/text/26',
  govinfo_base: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26.htm',

  subtitles: {
    A: {
      name: 'Income Taxes',
      sections: '1-1564',
      chapters: {
        1: { name: 'Normal Taxes and Surtaxes', sections: '1-1400Z-2' },
        2: { name: 'Tax on Self-Employment Income', sections: '1401-1403' },
        3: { name: 'Withholding of Tax on Nonresident Aliens and Foreign Corporations', sections: '1441-1464' },
        4: { name: 'Taxes to Enforce Reporting on Certain Foreign Accounts', sections: '1471-1474' },
        6: { name: 'Consolidated Returns', sections: '1501-1564' },
      },
    },
    B: {
      name: 'Estate and Gift Taxes',
      sections: '2001-2801',
      chapters: {
        11: { name: 'Estate Tax', sections: '2001-2210' },
        12: { name: 'Gift Tax', sections: '2501-2524' },
        13: { name: 'Tax on Generation-Skipping Transfers', sections: '2601-2664' },
      },
    },
    C: {
      name: 'Employment Taxes',
      sections: '3101-3510',
      chapters: {
        21: { name: 'Federal Insurance Contributions Act', sections: '3101-3128' },
        22: { name: 'Railroad Retirement Tax Act', sections: '3201-3241' },
        23: { name: 'Federal Unemployment Tax Act', sections: '3301-3311' },
        24: { name: 'Collection of Income Tax at Source on Wages', sections: '3401-3456' },
        25: { name: 'General Provisions Relating to Employment Taxes', sections: '3501-3510' },
      },
    },
    D: {
      name: 'Miscellaneous Excise Taxes',
      sections: '4001-5000',
    },
    E: {
      name: 'Alcohol, Tobacco, and Certain Other Excise Taxes',
      sections: '5001-5891',
    },
    F: {
      name: 'Procedure and Administration',
      sections: '6001-7874',
      chapters: {
        61: { name: 'Information and Returns', sections: '6001-6117' },
        62: { name: 'Time and Place for Paying Tax', sections: '6151-6167' },
        63: { name: 'Assessment', sections: '6201-6241' },
        64: { name: 'Collection', sections: '6301-6344' },
        65: { name: 'Abatements, Credits, and Refunds', sections: '6401-6432' },
        66: { name: 'Limitations', sections: '6501-6533' },
        67: { name: 'Interest', sections: '6601-6631' },
        68: { name: 'Additions to the Tax, Additional Amounts, and Assessable Penalties', sections: '6651-6725' },
        75: { name: 'Crimes, Other Offenses, and Forfeitures', sections: '7201-7345' },
        76: { name: 'Judicial Proceedings', sections: '7401-7493' },
        77: { name: 'Miscellaneous Provisions', sections: '7501-7528' },
        78: { name: 'Discovery of Liability and Enforcement of Title', sections: '7601-7655' },
        79: { name: 'Definitions', sections: '7701-7705' },
        80: { name: 'General Rules', sections: '7801-7874' },
      },
    },
  },
};

// ============================================================================
// KEY IRC SECTIONS BY CATEGORY
// ============================================================================

export const IRC_SECTIONS_BY_CATEGORY: Record<string, IRCSection[]> = {
  // INCOME TAX - INDIVIDUALS
  income_tax_individuals: [
    {
      section: 'IRC 1',
      title: 'Tax Imposed',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Imposes income tax on individuals at graduated rates (10%, 12%, 22%, 24%, 32%, 35%, 37%)',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/1',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapA-partI-sec1.htm',
      related_regs: ['Treas. Reg. 1.1-1'],
      key_provisions: [
        'Married filing jointly rates',
        'Head of household rates',
        'Single rates',
        'Married filing separately rates',
        'Kiddie tax for unearned income of minors',
      ],
    },
    {
      section: 'IRC 61',
      title: 'Gross Income Defined',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'All income from whatever source derived is taxable unless specifically excluded',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/61',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partI-sec61.htm',
      related_regs: ['Treas. Reg. 1.61-1 through 1.61-21'],
      key_provisions: [
        'Compensation for services',
        'Business income',
        'Gains from property',
        'Interest, dividends, rents, royalties',
        'Alimony (pre-2019)',
        'Cancellation of debt income',
      ],
    },
    {
      section: 'IRC 62',
      title: 'Adjusted Gross Income Defined',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Defines above-the-line deductions that reduce gross income to AGI',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/62',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partI-sec62.htm',
      related_regs: ['Treas. Reg. 1.62-1 through 1.62-2'],
      key_provisions: [
        'Trade or business deductions',
        'Educator expenses ($300)',
        'HSA contributions',
        'Self-employment tax (50%)',
        'SEP, SIMPLE, qualified plan contributions',
        'Student loan interest ($2,500)',
        'Alimony paid (pre-2019 agreements)',
      ],
    },
    {
      section: 'IRC 63',
      title: 'Taxable Income Defined',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'AGI minus itemized or standard deduction equals taxable income',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/63',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partI-sec63.htm',
      related_regs: ['Treas. Reg. 1.63-1'],
      key_provisions: [
        'Standard deduction amounts (2024: $14,600 single, $29,200 MFJ)',
        'Additional standard deduction for elderly/blind',
        'Itemized deductions election',
      ],
    },
  ],

  // DEDUCTIONS
  deductions: [
    {
      section: 'IRC 162',
      title: 'Trade or Business Expenses',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      subchapter: 'B - Computation of Taxable Income',
      summary: 'Ordinary and necessary business expenses are deductible',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/162',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVI-sec162.htm',
      related_regs: ['Treas. Reg. 1.162-1 through 1.162-33'],
      key_provisions: [
        'Salaries and wages',
        'Rent expense',
        'Repairs and maintenance',
        'Supplies',
        'Reasonable compensation requirement',
        'Public policy limitations (bribes, fines)',
      ],
    },
    {
      section: 'IRC 163',
      title: 'Interest',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Deduction for interest paid on indebtedness, subject to limitations',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/163',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVI-sec163.htm',
      related_regs: ['Treas. Reg. 1.163-1 through 1.163-17'],
      key_provisions: [
        'Business interest deduction',
        '163(j) limitation (30% of ATI)',
        'Investment interest limitation (IRC 163(d))',
        'Home mortgage interest (acquisition indebtedness up to $750,000)',
        'Tracing rules for interest allocation',
      ],
    },
    {
      section: 'IRC 164',
      title: 'Taxes',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Deduction for state/local taxes, limited to $10,000 for individuals (SALT cap)',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/164',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVI-sec164.htm',
      related_regs: ['Treas. Reg. 1.164-1 through 1.164-8'],
      key_provisions: [
        'State and local income/sales tax',
        'Real property taxes',
        'Personal property taxes',
        '$10,000 SALT cap (individuals, through 2025)',
        'Foreign taxes (if not credited)',
      ],
    },
    {
      section: 'IRC 165',
      title: 'Losses',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Deduction for losses sustained during taxable year',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/165',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVI-sec165.htm',
      related_regs: ['Treas. Reg. 1.165-1 through 1.165-12'],
      key_provisions: [
        'Trade or business losses fully deductible',
        'Investment losses (capital loss rules)',
        'Casualty losses (federally declared disasters only for individuals)',
        'Wagering losses (to extent of winnings)',
        'Theft losses',
      ],
    },
    {
      section: 'IRC 167/168',
      title: 'Depreciation / MACRS',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Depreciation deduction for property used in trade or business',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/168',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVI-sec168.htm',
      related_regs: ['Treas. Reg. 1.167(a)-1 through 1.168(k)-2'],
      key_provisions: [
        'MACRS recovery periods (3, 5, 7, 15, 27.5, 39 years)',
        'Section 168(k) bonus depreciation (80% in 2024)',
        'Section 179 expensing ($1,160,000 limit in 2024)',
        'Qualified improvement property (15 years)',
        'Alternative Depreciation System (ADS)',
      ],
    },
    {
      section: 'IRC 170',
      title: 'Charitable Contributions',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Deduction for charitable contributions, subject to AGI limitations',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/170',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVI-sec170.htm',
      related_regs: ['Treas. Reg. 1.170A-1 through 1.170A-18'],
      key_provisions: [
        '60% of AGI limit for cash to public charities',
        '30% limit for capital gain property',
        '20% limit for gifts to private foundations',
        'Substantiation requirements ($250+ requires written acknowledgment)',
        'Quid pro quo contribution rules',
        '5-year carryover of excess contributions',
      ],
    },
    {
      section: 'IRC 179',
      title: 'Election to Expense Depreciable Business Assets',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Election to expense (immediately deduct) cost of qualifying property',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/179',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVI-sec179.htm',
      related_regs: ['Treas. Reg. 1.179-1 through 1.179-6'],
      key_provisions: [
        '$1,160,000 deduction limit (2024)',
        '$2,890,000 phase-out threshold (2024)',
        'Qualified real property included',
        'Taxable income limitation',
        'Carryforward of disallowed amounts',
      ],
    },
    {
      section: 'IRC 183',
      title: 'Activities Not Engaged in For Profit (Hobby Loss)',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Limits deductions for activities not engaged in for profit',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/183',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVI-sec183.htm',
      related_regs: ['Treas. Reg. 1.183-1, 1.183-2'],
      key_provisions: [
        'Profit in 3 of 5 years presumption',
        'Horse activities: 2 of 7 years',
        '9 factors for profit motive (Reg. 1.183-2)',
        'Deductions limited to gross income from activity',
      ],
    },
  ],

  // CORPORATE TAX
  corporate_tax: [
    {
      section: 'IRC 11',
      title: 'Tax Imposed on Corporations',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Imposes flat 21% tax on corporate taxable income (post-TCJA)',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/11',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapA-partII-sec11.htm',
      related_regs: ['Treas. Reg. 1.11-1'],
      key_provisions: [
        'Flat 21% rate (effective 2018)',
        'No graduated rates',
        'Corporate AMT repealed (except book minimum tax)',
        '15% corporate alternative minimum tax (large corps)',
      ],
    },
    {
      section: 'IRC 243',
      title: 'Dividends Received Deduction',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Corporations may deduct dividends received from other corporations',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/243',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapB-partVIII-sec243.htm',
      related_regs: ['Treas. Reg. 1.243-1 through 1.243-5'],
      key_provisions: [
        '50% DRD for < 20% ownership',
        '65% DRD for 20-80% ownership',
        '100% DRD for 80%+ (affiliated group)',
        '46-day holding period requirement',
      ],
    },
    {
      section: 'IRC 301',
      title: 'Distributions of Property',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      subchapter: 'C - Corporate Distributions and Adjustments',
      summary: 'Treatment of property distributions from corporations',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/301',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapC-partI-subpartA-sec301.htm',
      related_regs: ['Treas. Reg. 1.301-1'],
      key_provisions: [
        'Dividend to extent of E&P',
        'Return of capital to extent of stock basis',
        'Capital gain for excess over basis',
        'Constructive dividends for disguised distributions',
      ],
    },
    {
      section: 'IRC 351',
      title: 'Transfer to Corporation Controlled by Transferor',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Nonrecognition of gain/loss on transfers to controlled corporations',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/351',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapC-partIII-sec351.htm',
      related_regs: ['Treas. Reg. 1.351-1 through 1.351-3'],
      key_provisions: [
        '80% control requirement immediately after transfer',
        'Boot received triggers gain recognition',
        'Services not counted for control',
        'Liability assumption rules (IRC 357)',
      ],
    },
    {
      section: 'IRC 531',
      title: 'Accumulated Earnings Tax',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: '20% tax on corporations that accumulate earnings beyond reasonable needs',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/531',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapG-partI-sec531.htm',
      related_regs: ['Treas. Reg. 1.531-1 through 1.537-3'],
      key_provisions: [
        '20% penalty tax rate',
        '$250,000 accumulated earnings credit ($150,000 for PSCs)',
        'Specific, definite, and feasible plans required',
        'Bardahl formula for working capital needs',
      ],
    },
    {
      section: 'IRC 541',
      title: 'Personal Holding Company Tax',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: '20% tax on closely-held corporations with passive income',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/541',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapG-partII-sec541.htm',
      related_regs: ['Treas. Reg. 1.541-1 through 1.547-6'],
      key_provisions: [
        '20% tax on undistributed PHC income',
        'PHC if 60%+ PHC income AND 5 or fewer own 50%+',
        'Deficiency dividend procedure available',
        'PHC income: dividends, interest, rents, royalties, etc.',
      ],
    },
  ],

  // PARTNERSHIPS
  partnerships: [
    {
      section: 'IRC 701',
      title: 'Partners, Not Partnership, Subject to Tax',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      subchapter: 'K - Partners and Partnerships',
      summary: 'Partnerships are pass-through entities; partners taxed on distributive share',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/701',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapK-partI-sec701.htm',
      related_regs: ['Treas. Reg. 1.701-1, 1.701-2'],
      key_provisions: [
        'Partnership not subject to income tax',
        'Partners taxed on distributive share',
        'Character of items flows through',
        'Anti-abuse rules (Reg. 1.701-2)',
      ],
    },
    {
      section: 'IRC 704',
      title: "Partner's Distributive Share",
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Allocation of partnership items among partners',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/704',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapK-partI-sec704.htm',
      related_regs: ['Treas. Reg. 1.704-1 through 1.704-4'],
      key_provisions: [
        '704(a): Partner agreement controls',
        '704(b): Substantial economic effect requirement',
        '704(c): Built-in gain/loss allocation',
        '704(d): Limitation on losses to basis',
      ],
    },
    {
      section: 'IRC 707',
      title: 'Transactions Between Partner and Partnership',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Treatment of transactions between partner and partnership',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/707',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapK-partI-sec707.htm',
      related_regs: ['Treas. Reg. 1.707-1 through 1.707-9'],
      key_provisions: [
        '707(a): Partner dealing in non-partner capacity',
        '707(b): Related party rules',
        '707(c): Guaranteed payments',
        'Disguised sales (Reg. 1.707-3 through 1.707-9)',
      ],
    },
    {
      section: 'IRC 721',
      title: 'Nonrecognition of Gain or Loss on Contribution',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'No gain/loss on contribution of property to partnership',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/721',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapK-partII-subpartA-sec721.htm',
      related_regs: ['Treas. Reg. 1.721-1'],
      key_provisions: [
        'Nonrecognition on contribution',
        'Services in exchange for partnership interest taxable',
        'Investment company exception',
        'Basis equals adjusted basis of contributed property',
      ],
    },
    {
      section: 'IRC 731',
      title: 'Distribution of Partnership Property',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Treatment of distributions from partnership to partner',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/731',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapK-partII-subpartB-sec731.htm',
      related_regs: ['Treas. Reg. 1.731-1, 1.731-2'],
      key_provisions: [
        'Gain only if cash exceeds basis',
        'Loss only on liquidating distribution of money, unrealized receivables, inventory',
        'Basis of distributed property',
        'Hot asset rules (IRC 751)',
      ],
    },
    {
      section: 'IRC 751',
      title: 'Unrealized Receivables and Inventory Items (Hot Assets)',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'Ordinary income treatment for sales/distributions involving hot assets',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/751',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapK-partII-subpartD-sec751.htm',
      related_regs: ['Treas. Reg. 1.751-1'],
      key_provisions: [
        'Unrealized receivables = ordinary income',
        'Substantially appreciated inventory',
        'Section 1245/1250 recapture',
        'Prevents conversion of ordinary income to capital gain',
      ],
    },
  ],

  // TRUSTS & ESTATES
  trusts_estates: [
    {
      section: 'IRC 641',
      title: 'Imposition of Tax on Trusts and Estates',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      subchapter: 'J - Estates, Trusts, Beneficiaries, and Decedents',
      summary: 'Trusts and estates taxed as separate entities with compressed brackets',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/641',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapJ-partI-subpartA-sec641.htm',
      related_regs: ['Treas. Reg. 1.641(a)-1 through 1.641(c)-1'],
      key_provisions: [
        '37% bracket at $14,450 (2024)',
        'Distribution deduction (IRC 651, 661)',
        'Distributable Net Income (DNI) limits deduction',
        'Complex vs. simple trust rules',
      ],
    },
    {
      section: 'IRC 671-679',
      title: 'Grantor Trust Rules',
      subtitle: 'A - Income Taxes',
      chapter: '1 - Normal Taxes and Surtaxes',
      summary: 'When trust income is taxed to the grantor rather than the trust',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/671',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-chap1-subchapJ-partI-subpartE-sec671.htm',
      related_regs: ['Treas. Reg. 1.671-1 through 1.679-7'],
      key_provisions: [
        '672: Adverse party and related party definitions',
        '673: Reversionary interests',
        '674: Power to control beneficial enjoyment',
        '675: Administrative powers',
        '676: Power to revoke',
        '677: Income for benefit of grantor',
        '678: Person other than grantor treated as owner',
        '679: Foreign trusts with U.S. beneficiaries',
      ],
    },
    {
      section: 'IRC 2001',
      title: 'Estate Tax Imposed',
      subtitle: 'B - Estate and Gift Taxes',
      chapter: '11 - Estate Tax',
      summary: '40% estate tax on taxable estates exceeding exemption',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/2001',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleB-chap11-subchapA-partI-sec2001.htm',
      related_regs: ['Treas. Reg. 20.2001-1'],
      key_provisions: [
        '40% top rate',
        '$13.61 million exemption (2024)',
        'Portability between spouses',
        'Stepped-up basis for inherited property (IRC 1014)',
      ],
    },
    {
      section: 'IRC 2036',
      title: 'Transfers with Retained Life Estate',
      subtitle: 'B - Estate and Gift Taxes',
      chapter: '11 - Estate Tax',
      summary: 'Property transferred but retained for life included in gross estate',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/2036',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleB-chap11-subchapA-partIII-sec2036.htm',
      related_regs: ['Treas. Reg. 20.2036-1'],
      key_provisions: [
        'Retained possession or enjoyment',
        'Retained income from property',
        'Right to designate who enjoys property',
        'Bona fide sale exception',
      ],
    },
    {
      section: 'IRC 2501',
      title: 'Imposition of Gift Tax',
      subtitle: 'B - Estate and Gift Taxes',
      chapter: '12 - Gift Tax',
      summary: '40% gift tax on taxable gifts exceeding annual exclusion and lifetime exemption',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/2501',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleB-chap12-subchapA-sec2501.htm',
      related_regs: ['Treas. Reg. 25.2501-1'],
      key_provisions: [
        '$18,000 annual exclusion (2024)',
        '$13.61 million lifetime exemption (2024)',
        'Unlimited marital deduction',
        'Unlimited charitable deduction',
        'Gift-splitting between spouses',
      ],
    },
  ],

  // EMPLOYMENT TAXES
  employment_taxes: [
    {
      section: 'IRC 3101',
      title: 'FICA Tax - Employee Share',
      subtitle: 'C - Employment Taxes',
      chapter: '21 - Federal Insurance Contributions Act',
      summary: 'Employee share of Social Security and Medicare taxes',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/3101',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleC-chap21-subchapA-sec3101.htm',
      related_regs: ['Treas. Reg. 31.3101-1 through 31.3101-4'],
      key_provisions: [
        '6.2% Social Security on wages up to wage base ($168,600 in 2024)',
        '1.45% Medicare on all wages',
        '0.9% Additional Medicare on wages over $200,000 ($250,000 MFJ)',
      ],
    },
    {
      section: 'IRC 3111',
      title: 'FICA Tax - Employer Share',
      subtitle: 'C - Employment Taxes',
      chapter: '21 - Federal Insurance Contributions Act',
      summary: 'Employer matching share of FICA taxes',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/3111',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleC-chap21-subchapB-sec3111.htm',
      related_regs: ['Treas. Reg. 31.3111-1 through 31.3111-6'],
      key_provisions: [
        '6.2% Social Security (matching)',
        '1.45% Medicare (matching)',
        'No employer share of Additional Medicare',
        'Total FICA: 15.3% on first $168,600 (2024)',
      ],
    },
    {
      section: 'IRC 3301',
      title: 'Federal Unemployment Tax (FUTA)',
      subtitle: 'C - Employment Taxes',
      chapter: '23 - Federal Unemployment Tax Act',
      summary: '6.0% FUTA tax on first $7,000 of wages (5.4% credit for state tax)',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/3301',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleC-chap23-sec3301.htm',
      related_regs: ['Treas. Reg. 31.3301-1 through 31.3301-4'],
      key_provisions: [
        '6.0% on first $7,000 wages per employee',
        '5.4% credit for timely state unemployment tax',
        'Effective rate: 0.6% (=$42/employee max)',
        'Credit reduction if state borrows from federal fund',
      ],
    },
    {
      section: 'IRC 3402',
      title: 'Income Tax Withholding',
      subtitle: 'C - Employment Taxes',
      chapter: '24 - Collection of Income Tax at Source on Wages',
      summary: 'Employer must withhold income tax from employee wages',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/3402',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleC-chap24-sec3402.htm',
      related_regs: ['Treas. Reg. 31.3402(a)-1 through 31.3402(r)-1'],
      key_provisions: [
        'Withholding based on Form W-4',
        'Percentage method or wage-bracket tables',
        'Backup withholding (24%)',
        'Supplemental wage withholding',
      ],
    },
    {
      section: 'IRC 6672',
      title: 'Trust Fund Recovery Penalty',
      subtitle: 'F - Procedure and Administration',
      chapter: '68 - Additions to Tax',
      summary: '100% personal liability for responsible persons who fail to remit trust fund taxes',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6672',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap68-subchapB-partI-sec6672.htm',
      related_regs: ['Treas. Reg. 301.6672-1'],
      key_provisions: [
        '100% penalty on trust fund taxes not remitted',
        'Personal liability for responsible persons',
        'Willfulness requirement',
        'Joint and several liability',
        'No discharge in bankruptcy',
      ],
      penalties: [
        {
          irc_section: 'IRC 6672',
          penalty_type: 'civil',
          description: 'Trust Fund Recovery Penalty',
          amount_or_rate: '100% of unpaid trust fund taxes',
          statute_of_limitations: '3 years from return due date',
        },
      ],
    },
  ],

  // PENALTIES
  penalties: [
    {
      section: 'IRC 6651',
      title: 'Failure to File or Pay',
      subtitle: 'F - Procedure and Administration',
      chapter: '68 - Additions to Tax',
      summary: 'Penalties for failure to file returns or pay tax',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6651',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap68-subchapA-partI-sec6651.htm',
      related_regs: ['Treas. Reg. 301.6651-1'],
      key_provisions: [
        'Failure to file: 5% per month, max 25%',
        'Failure to pay: 0.5% per month, max 25%',
        'Combined maximum: 47.5%',
        'Minimum penalty for 60+ days late',
        'Reasonable cause defense available',
      ],
      penalties: [
        {
          irc_section: 'IRC 6651(a)(1)',
          penalty_type: 'civil',
          description: 'Failure to file penalty',
          amount_or_rate: '5% per month, max 25%',
          statute_of_limitations: '3 years from filing or due date',
        },
        {
          irc_section: 'IRC 6651(a)(2)',
          penalty_type: 'civil',
          description: 'Failure to pay penalty',
          amount_or_rate: '0.5% per month, max 25%',
          statute_of_limitations: '3 years from filing or due date',
        },
      ],
    },
    {
      section: 'IRC 6662',
      title: 'Accuracy-Related Penalty',
      subtitle: 'F - Procedure and Administration',
      chapter: '68 - Additions to Tax',
      summary: '20% penalty for negligence, substantial understatement, or valuation misstatement',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6662',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap68-subchapA-partII-sec6662.htm',
      related_regs: ['Treas. Reg. 1.6662-1 through 1.6662-7'],
      key_provisions: [
        '20% penalty on underpayment',
        'Negligence or disregard of rules',
        'Substantial understatement (>$5,000 or >10%)',
        '40% for gross valuation misstatement',
        'Reasonable cause/good faith defense (IRC 6664)',
      ],
      penalties: [
        {
          irc_section: 'IRC 6662(a)',
          penalty_type: 'civil',
          description: 'Accuracy-related penalty',
          amount_or_rate: '20% of underpayment',
          statute_of_limitations: '3 years from filing',
        },
        {
          irc_section: 'IRC 6662(h)',
          penalty_type: 'civil',
          description: 'Gross valuation misstatement',
          amount_or_rate: '40% of underpayment',
          statute_of_limitations: '3 years from filing',
        },
      ],
    },
    {
      section: 'IRC 6663',
      title: 'Civil Fraud Penalty',
      subtitle: 'F - Procedure and Administration',
      chapter: '68 - Additions to Tax',
      summary: '75% penalty on underpayment attributable to fraud',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6663',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap68-subchapA-partII-sec6663.htm',
      related_regs: ['Treas. Reg. 1.6663-1 through 1.6663-4'],
      key_provisions: [
        '75% of fraud-related underpayment',
        'No statute of limitations for fraud',
        'Burden shifts to taxpayer for non-fraud portion',
        'Cannot stack with accuracy penalty',
      ],
      penalties: [
        {
          irc_section: 'IRC 6663',
          penalty_type: 'civil',
          description: 'Civil fraud penalty',
          amount_or_rate: '75% of underpayment',
          statute_of_limitations: 'NONE',
        },
      ],
    },
    {
      section: 'IRC 6694',
      title: 'Understatement of Tax by Tax Return Preparer',
      subtitle: 'F - Procedure and Administration',
      chapter: '68 - Additions to Tax',
      summary: 'Penalties on preparers for unreasonable or willful positions',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6694',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap68-subchapB-partI-sec6694.htm',
      related_regs: ['Treas. Reg. 1.6694-1 through 1.6694-4'],
      key_provisions: [
        '6694(a): Greater of $1,000 or 50% of fees for unreasonable position',
        '6694(b): Greater of $5,000 or 75% of fees for willful/reckless conduct',
        'Substantial authority standard',
        'Disclosure exception',
      ],
      penalties: [
        {
          irc_section: 'IRC 6694(a)',
          penalty_type: 'civil',
          description: 'Unreasonable position',
          amount_or_rate: 'Greater of $1,000 or 50% of fees',
          statute_of_limitations: '3 years from filing',
        },
        {
          irc_section: 'IRC 6694(b)',
          penalty_type: 'civil',
          description: 'Willful or reckless conduct',
          amount_or_rate: 'Greater of $5,000 or 75% of fees',
          statute_of_limitations: '3 years from filing',
        },
      ],
    },
  ],

  // CRIMINAL STATUTES
  criminal: [
    {
      section: 'IRC 7201',
      title: 'Attempt to Evade or Defeat Tax',
      subtitle: 'F - Procedure and Administration',
      chapter: '75 - Crimes, Other Offenses, and Forfeitures',
      summary: 'Felony for willfully attempting to evade tax',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/7201',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap75-subchapA-partI-sec7201.htm',
      related_regs: [],
      key_provisions: [
        'Tax deficiency must exist',
        'Willfulness required (voluntary, intentional violation)',
        'Affirmative act of evasion',
        'Spies doctrine: evasion of assessment vs. payment',
      ],
      penalties: [
        {
          irc_section: 'IRC 7201',
          penalty_type: 'criminal',
          description: 'Tax evasion (felony)',
          amount_or_rate: 'Up to 5 years imprisonment, $250,000 fine ($500,000 corp)',
          statute_of_limitations: '6 years from commission of offense',
        },
      ],
    },
    {
      section: 'IRC 7206',
      title: 'Fraud and False Statements',
      subtitle: 'F - Procedure and Administration',
      chapter: '75 - Crimes, Other Offenses, and Forfeitures',
      summary: 'Felony for making false statements under penalties of perjury',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/7206',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap75-subchapA-partI-sec7206.htm',
      related_regs: [],
      key_provisions: [
        '7206(1): False statements on return',
        '7206(2): Aiding/assisting false return',
        '7206(4): Removing/concealing property to evade',
        '7206(5): Compromises and closing agreements',
        'Material false statement required',
      ],
      penalties: [
        {
          irc_section: 'IRC 7206(1)',
          penalty_type: 'criminal',
          description: 'False statement (felony)',
          amount_or_rate: 'Up to 3 years imprisonment, $250,000 fine',
          statute_of_limitations: '6 years from filing',
        },
        {
          irc_section: 'IRC 7206(2)',
          penalty_type: 'criminal',
          description: 'Aiding false return (felony)',
          amount_or_rate: 'Up to 3 years imprisonment, $250,000 fine',
          statute_of_limitations: '6 years from filing',
        },
      ],
    },
    {
      section: 'IRC 7203',
      title: 'Willful Failure to File, Supply Information, or Pay Tax',
      subtitle: 'F - Procedure and Administration',
      chapter: '75 - Crimes, Other Offenses, and Forfeitures',
      summary: 'Misdemeanor for willful failure to file or pay',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/7203',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap75-subchapA-partI-sec7203.htm',
      related_regs: [],
      key_provisions: [
        'Willful failure to file required return',
        'Willful failure to pay required tax',
        'Willful failure to supply required information',
        'Willfulness is key element',
      ],
      penalties: [
        {
          irc_section: 'IRC 7203',
          penalty_type: 'criminal',
          description: 'Failure to file/pay (misdemeanor)',
          amount_or_rate: 'Up to 1 year imprisonment, $100,000 fine ($200,000 corp)',
          statute_of_limitations: '6 years from due date',
        },
      ],
    },
    {
      section: 'IRC 7202',
      title: 'Willful Failure to Collect or Pay Over Tax',
      subtitle: 'F - Procedure and Administration',
      chapter: '75 - Crimes, Other Offenses, and Forfeitures',
      summary: 'Felony for willful failure to collect or pay over employment taxes',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/7202',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap75-subchapA-partI-sec7202.htm',
      related_regs: [],
      key_provisions: [
        'Trust fund taxes (withholding, FICA)',
        'Employer obligation to collect and remit',
        'Willfulness required',
        'Personal liability for responsible persons',
      ],
      penalties: [
        {
          irc_section: 'IRC 7202',
          penalty_type: 'criminal',
          description: 'Failure to pay over (felony)',
          amount_or_rate: 'Up to 5 years imprisonment, $10,000 fine',
          statute_of_limitations: '6 years from due date',
        },
      ],
    },
    {
      section: '31 USC 5324',
      title: 'Structuring Currency Transactions',
      subtitle: 'Bank Secrecy Act',
      chapter: 'Financial Recordkeeping and Reporting',
      summary: 'Felony for structuring transactions to evade CTR requirements',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/31/5324',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title31/html/USCODE-2022-title31-subtitleIV-chap53-subchapII-sec5324.htm',
      related_regs: ['31 CFR 1010'],
      key_provisions: [
        'Breaking up transactions to avoid $10,000 CTR',
        'Causing bank to fail to file CTR',
        'Knowledge of CTR requirement',
        'Intent to evade reporting',
      ],
      penalties: [
        {
          irc_section: '31 USC 5324',
          penalty_type: 'criminal',
          description: 'Structuring (felony)',
          amount_or_rate: 'Up to 5 years imprisonment, $250,000 fine; 10 years if pattern',
          statute_of_limitations: '5 years from offense',
        },
      ],
    },
  ],

  // IRS AUTHORITY & PROCEDURE
  procedure: [
    {
      section: 'IRC 6501',
      title: 'Limitations on Assessment and Collection',
      subtitle: 'F - Procedure and Administration',
      chapter: '66 - Limitations',
      summary: 'Statute of limitations for IRS to assess additional tax',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6501',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap66-subchapA-sec6501.htm',
      related_regs: ['Treas. Reg. 301.6501(a)-1 through 301.6501(o)-1'],
      key_provisions: [
        '3 years from filing (general rule)',
        '6 years if 25%+ of gross income omitted',
        'NO limit if fraud or no return filed',
        'Extensions by agreement (Form 872)',
        'Special rules for listed transactions, foreign info returns',
      ],
    },
    {
      section: 'IRC 6502',
      title: 'Collection After Assessment',
      subtitle: 'F - Procedure and Administration',
      chapter: '66 - Limitations',
      summary: '10-year statute for IRS to collect assessed taxes',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6502',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap66-subchapA-sec6502.htm',
      related_regs: ['Treas. Reg. 301.6502-1'],
      key_provisions: [
        '10 years from date of assessment',
        'Tolled during bankruptcy, CDP, OIC, installment agreement',
        'Levy before expiration captures future right',
        'Release of levy does not extend statute',
      ],
    },
    {
      section: 'IRC 6212',
      title: 'Notice of Deficiency',
      subtitle: 'F - Procedure and Administration',
      chapter: '63 - Assessment',
      summary: '90-day letter allowing Tax Court petition before assessment',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6212',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap63-subchapB-sec6212.htm',
      related_regs: ['Treas. Reg. 301.6212-1, 301.6212-2'],
      key_provisions: [
        'Required before assessment (deficiency procedures)',
        'Last known address mailing',
        '90 days to petition Tax Court (150 if outside US)',
        'One notice per deficiency',
      ],
    },
    {
      section: 'IRC 6320/6330',
      title: 'Collection Due Process (CDP)',
      subtitle: 'F - Procedure and Administration',
      chapter: '64 - Collection',
      summary: 'Right to hearing before lien filing or levy',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/6330',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap64-subchapD-sec6330.htm',
      related_regs: ['Treas. Reg. 301.6320-1, 301.6330-1'],
      key_provisions: [
        'Notice required before NFTL or levy',
        '30 days to request CDP hearing',
        'May challenge liability if no prior opportunity',
        'Collection suspended during CDP',
        'Tax Court review of CDP determination',
      ],
    },
    {
      section: 'IRC 7122',
      title: 'Compromises (Offer in Compromise)',
      subtitle: 'F - Procedure and Administration',
      chapter: '74 - Closing Agreements and Compromises',
      summary: 'Settlement of tax liability for less than full amount owed',
      cornell_url: 'https://www.law.cornell.edu/uscode/text/26/7122',
      govinfo_url: 'https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleF-chap74-sec7122.htm',
      related_regs: ['Treas. Reg. 301.7122-1'],
      key_provisions: [
        'Doubt as to liability',
        'Doubt as to collectibility',
        'Effective tax administration (hardship)',
        '$205 application fee (waived for low income)',
        '5-year compliance requirement',
      ],
    },
  ],
};

// ============================================================================
// IRS PUBLICATIONS REFERENCE
// ============================================================================

export const IRS_PUBLICATIONS: Record<string, { number: string; title: string; url: string; topics: string[] }> = {
  pub_17: {
    number: '17',
    title: 'Your Federal Income Tax (For Individuals)',
    url: 'https://www.irs.gov/pub/irs-pdf/p17.pdf',
    topics: ['Individual income tax', 'Filing requirements', 'Deductions', 'Credits'],
  },
  pub_334: {
    number: '334',
    title: 'Tax Guide for Small Business',
    url: 'https://www.irs.gov/pub/irs-pdf/p334.pdf',
    topics: ['Schedule C', 'Business income', 'Business expenses', 'Self-employment tax'],
  },
  pub_535: {
    number: '535',
    title: 'Business Expenses',
    url: 'https://www.irs.gov/pub/irs-pdf/p535.pdf',
    topics: ['Ordinary and necessary', 'Capitalization', 'Cost of goods sold', 'Entertainment'],
  },
  pub_463: {
    number: '463',
    title: 'Travel, Gift, and Car Expenses',
    url: 'https://www.irs.gov/pub/irs-pdf/p463.pdf',
    topics: ['Travel expenses', 'Business gifts', 'Vehicle expenses', 'Standard mileage rate'],
  },
  pub_15: {
    number: '15',
    title: 'Circular E - Employer\'s Tax Guide',
    url: 'https://www.irs.gov/pub/irs-pdf/p15.pdf',
    topics: ['Payroll taxes', 'Withholding', 'FICA', 'Deposit requirements'],
  },
  pub_946: {
    number: '946',
    title: 'How to Depreciate Property',
    url: 'https://www.irs.gov/pub/irs-pdf/p946.pdf',
    topics: ['MACRS', 'Section 179', 'Bonus depreciation', 'Listed property'],
  },
  pub_550: {
    number: '550',
    title: 'Investment Income and Expenses',
    url: 'https://www.irs.gov/pub/irs-pdf/p550.pdf',
    topics: ['Interest', 'Dividends', 'Capital gains', 'Investment expenses'],
  },
  pub_544: {
    number: '544',
    title: 'Sales and Other Dispositions of Assets',
    url: 'https://www.irs.gov/pub/irs-pdf/p544.pdf',
    topics: ['Capital gains', 'Section 1231', 'Installment sales', 'Like-kind exchanges'],
  },
  pub_538: {
    number: '538',
    title: 'Accounting Periods and Methods',
    url: 'https://www.irs.gov/pub/irs-pdf/p538.pdf',
    topics: ['Tax year', 'Accounting methods', 'Cash vs. accrual', 'Inventory methods'],
  },
  pub_559: {
    number: '559',
    title: 'Survivors, Executors, and Administrators',
    url: 'https://www.irs.gov/pub/irs-pdf/p559.pdf',
    topics: ['Estate tax', 'Estate income', 'Final return', 'Fiduciary responsibilities'],
  },
  pub_541: {
    number: '541',
    title: 'Partnerships',
    url: 'https://www.irs.gov/pub/irs-pdf/p541.pdf',
    topics: ['Partnership formation', 'Distributive share', 'Partner basis', 'Distributions'],
  },
  pub_542: {
    number: '542',
    title: 'Corporations',
    url: 'https://www.irs.gov/pub/irs-pdf/p542.pdf',
    topics: ['Corporate formation', 'Distributions', 'S corporations', 'Liquidations'],
  },
};

// ============================================================================
// IRM REFERENCES (Internal Revenue Manual)
// ============================================================================

export const IRM_REFERENCES: Record<string, IRMReference> = {
  'IRM 4.10': {
    irm_section: 'IRM 4.10',
    title: 'Examination of Returns',
    url: 'https://www.irs.gov/irm/part4/irm_04-010-001',
    summary: 'Examination procedures including selection, planning, documentation, and closure',
    applies_to: ['All examinations', 'Audit defense'],
  },
  'IRM 4.10.4': {
    irm_section: 'IRM 4.10.4',
    title: 'Examining Process',
    url: 'https://www.irs.gov/irm/part4/irm_04-010-004',
    summary: 'Detailed procedures for conducting examinations including information gathering',
    applies_to: ['Field examinations', 'Office audits'],
  },
  'IRM 5.1': {
    irm_section: 'IRM 5.1',
    title: 'Field Collection',
    url: 'https://www.irs.gov/irm/part5/irm_05-001-001',
    summary: 'Collection procedures including liens, levies, and seizures',
    applies_to: ['Tax collection', 'Taxpayer representation'],
  },
  'IRM 5.8': {
    irm_section: 'IRM 5.8',
    title: 'Offer in Compromise',
    url: 'https://www.irs.gov/irm/part5/irm_05-008-001',
    summary: 'Processing and evaluation of offers in compromise',
    applies_to: ['OIC applications', 'Settlement negotiations'],
  },
  'IRM 8.1': {
    irm_section: 'IRM 8.1',
    title: 'IRS Appeals Function',
    url: 'https://www.irs.gov/irm/part8/irm_08-001-001',
    summary: 'Appeals process including conferences and settlement authority',
    applies_to: ['Appeals', 'Settlement'],
  },
  'IRM 20.1': {
    irm_section: 'IRM 20.1',
    title: 'Penalty Handbook',
    url: 'https://www.irs.gov/irm/part20/irm_20-001-001',
    summary: 'Penalty administration including assessment, abatement, and reasonable cause',
    applies_to: ['Penalty defense', 'Abatement requests'],
  },
  'IRM 25.1': {
    irm_section: 'IRM 25.1',
    title: 'Fraud Handbook',
    url: 'https://www.irs.gov/irm/part25/irm_25-001-001',
    summary: 'Fraud detection, development, and referral procedures',
    applies_to: ['Fraud cases', 'Criminal referrals'],
  },
  'IRM 9.1': {
    irm_section: 'IRM 9.1',
    title: 'Criminal Investigation',
    url: 'https://www.irs.gov/irm/part9/irm_09-001-001',
    summary: 'Criminal investigation procedures and referrals',
    applies_to: ['Criminal tax cases', 'CI investigations'],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getIRCSectionUrl(section: string, source: 'cornell' | 'govinfo' = 'cornell'): string {
  const sectionNum = section.replace(/[^0-9]/g, '');
  if (source === 'cornell') {
    return `https://www.law.cornell.edu/uscode/text/26/${sectionNum}`;
  }
  return `https://www.govinfo.gov/content/pkg/USCODE-2022-title26/html/USCODE-2022-title26-subtitleA-sec${sectionNum}.htm`;
}

export function getTreasuryRegUrl(regSection: string): string {
  return `https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/section-${regSection.replace('Treas. Reg. ', '')}`;
}

export function getIRMUrl(irmSection: string): string {
  const parts = irmSection.replace('IRM ', '').split('.');
  return `https://www.irs.gov/irm/part${parts[0]}/irm_${parts.join('-').padStart(2, '0')}`;
}

export function getIRSPubUrl(pubNumber: string): string {
  return `https://www.irs.gov/pub/irs-pdf/p${pubNumber}.pdf`;
}

export function lookupIRCSection(section: string): IRCSection | undefined {
  for (const category of Object.values(IRC_SECTIONS_BY_CATEGORY)) {
    const found = category.find(s => s.section === section || s.section.includes(section));
    if (found) return found;
  }
  return undefined;
}

export function lookupPenalty(section: string): PenaltyReference[] | undefined {
  const ircSection = lookupIRCSection(section);
  return ircSection?.penalties;
}

export function generateLegalCitation(section: string, type: 'irc' | 'reg' | 'case' = 'irc'): string {
  switch (type) {
    case 'irc':
      return `Internal Revenue Code Section ${section.replace('IRC ', '')}, 26 U.S.C. § ${section.replace('IRC ', '')}`;
    case 'reg':
      return `Treasury Regulation Section ${section}`;
    case 'case':
      return section; // Case citations should be provided in full
    default:
      return section;
  }
}
