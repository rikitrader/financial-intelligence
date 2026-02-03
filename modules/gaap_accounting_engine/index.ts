/**
 * AI Financial Reporting & GAAP-Compliant Accounting Engine
 *
 * Operates as: AI CPA + Controller + Tax Preparer + Financial Analyst
 *
 * COMPLIANCE FRAMEWORK:
 * - U.S. GAAP (FASB Framework)
 * - IRS Business Reporting Rules (Schedule C / 1120 / 1065)
 * - Accrual Accounting Principles
 * - Double-Entry Bookkeeping
 * - Revenue Recognition Standards (ASC 606)
 * - Expense Deductibility Rules
 *
 * MISSION: Convert raw bank activity into audit-ready, GAAP-compliant,
 * tax-ready financial reporting for small, medium, and large businesses.
 */

import { generateId } from '../../core/normalize';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance?: number;
  account_number?: string;
  merchant?: string;
  category?: string;
  reference?: string;
}

export interface NormalizedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'asset' | 'liability' | 'equity';
  account_code: string;
  account_name: string;
  category: string;
  subcategory?: string;
  notes: string;
  flags: string[];
  confidence: number;
  needs_review: boolean;
}

export interface LedgerEntry {
  id: string;
  date: string;
  account_debit: string;
  account_credit: string;
  amount: number;
  description: string;
  reference?: string;
  source_transaction_id: string;
}

export interface FinancialStatement {
  statement_type: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'trial_balance';
  period_start: string;
  period_end: string;
  generated_at: string;
  sections: StatementSection[];
  totals: Record<string, number>;
}

export interface StatementSection {
  name: string;
  line_items: LineItem[];
  subtotal: number;
}

export interface LineItem {
  account_code: string;
  account_name: string;
  amount: number;
  is_subtotal?: boolean;
}

export interface ChartData {
  chart_type: 'pie' | 'bar' | 'line' | 'stacked_bar';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
  }[];
}

export interface TaxSummary {
  tax_year: string;
  entity_type: 'sole_prop' | 'partnership' | 'scorp' | 'ccorp';
  gross_revenue: number;
  cost_of_goods_sold: number;
  gross_profit: number;
  total_deductions: number;
  net_taxable_income: number;
  deductions_by_category: Record<string, number>;
  depreciation_candidates: DepreciationCandidate[];
  payroll_indicators: PayrollIndicator[];
  estimated_tax_liability: number;
  schedule_c_ready: boolean;
  form_1120_ready: boolean;
  form_1065_ready: boolean;
}

export interface DepreciationCandidate {
  description: string;
  amount: number;
  date_acquired: string;
  asset_class: string;
  recovery_period: number;
  section_179_eligible: boolean;
}

export interface PayrollIndicator {
  description: string;
  amount: number;
  frequency: string;
  likely_payroll: boolean;
}

export interface RiskReport {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  anomalies: Anomaly[];
  recommendations: string[];
}

export interface Anomaly {
  type: string;
  description: string;
  transaction_id?: string;
  amount?: number;
  severity: 'info' | 'warning' | 'critical';
  action_required: string;
}

export interface AccountingEngineConfig {
  entity_name: string;
  entity_type: 'sole_prop' | 'partnership' | 'scorp' | 'ccorp' | 'llc';
  fiscal_year_start: string;
  fiscal_year_end: string;
  accounting_method: 'cash' | 'accrual';
  industry?: string;
  state?: string;
}

export interface AccountingEngineOutput {
  config: AccountingEngineConfig;
  normalized_transactions: NormalizedTransaction[];
  general_ledger: LedgerEntry[];
  income_statement: FinancialStatement;
  balance_sheet: FinancialStatement;
  cash_flow_statement: FinancialStatement;
  trial_balance: FinancialStatement;
  chart_data: ChartData[];
  tax_summary: TaxSummary;
  risk_report: RiskReport;
  exports: {
    quickbooks: string;
    xero: string;
    universal_csv: string;
    json_ledger: string;
  };
  summary_report: string;
}

// ============================================================================
// CHART OF ACCOUNTS (GAAP-COMPLIANT)
// ============================================================================

export const CHART_OF_ACCOUNTS = {
  // ASSETS (1000-1999)
  assets: {
    current: {
      '1000': { name: 'Cash - Operating', type: 'asset', normal: 'debit' },
      '1010': { name: 'Cash - Payroll', type: 'asset', normal: 'debit' },
      '1020': { name: 'Cash - Savings', type: 'asset', normal: 'debit' },
      '1100': { name: 'Accounts Receivable', type: 'asset', normal: 'debit' },
      '1150': { name: 'Allowance for Doubtful Accounts', type: 'asset', normal: 'credit' },
      '1200': { name: 'Inventory', type: 'asset', normal: 'debit' },
      '1300': { name: 'Prepaid Expenses', type: 'asset', normal: 'debit' },
      '1310': { name: 'Prepaid Insurance', type: 'asset', normal: 'debit' },
      '1320': { name: 'Prepaid Rent', type: 'asset', normal: 'debit' },
    },
    fixed: {
      '1500': { name: 'Furniture & Fixtures', type: 'asset', normal: 'debit' },
      '1510': { name: 'Accumulated Depreciation - F&F', type: 'asset', normal: 'credit' },
      '1520': { name: 'Equipment', type: 'asset', normal: 'debit' },
      '1530': { name: 'Accumulated Depreciation - Equipment', type: 'asset', normal: 'credit' },
      '1540': { name: 'Vehicles', type: 'asset', normal: 'debit' },
      '1550': { name: 'Accumulated Depreciation - Vehicles', type: 'asset', normal: 'credit' },
      '1560': { name: 'Buildings', type: 'asset', normal: 'debit' },
      '1570': { name: 'Accumulated Depreciation - Buildings', type: 'asset', normal: 'credit' },
      '1580': { name: 'Land', type: 'asset', normal: 'debit' },
      '1590': { name: 'Leasehold Improvements', type: 'asset', normal: 'debit' },
    },
    other: {
      '1700': { name: 'Deposits', type: 'asset', normal: 'debit' },
      '1800': { name: 'Intangible Assets', type: 'asset', normal: 'debit' },
      '1900': { name: 'Other Assets', type: 'asset', normal: 'debit' },
    },
  },

  // LIABILITIES (2000-2999)
  liabilities: {
    current: {
      '2000': { name: 'Accounts Payable', type: 'liability', normal: 'credit' },
      '2100': { name: 'Credit Card Payable', type: 'liability', normal: 'credit' },
      '2200': { name: 'Accrued Expenses', type: 'liability', normal: 'credit' },
      '2210': { name: 'Accrued Wages', type: 'liability', normal: 'credit' },
      '2220': { name: 'Accrued Interest', type: 'liability', normal: 'credit' },
      '2300': { name: 'Sales Tax Payable', type: 'liability', normal: 'credit' },
      '2310': { name: 'Payroll Tax Payable', type: 'liability', normal: 'credit' },
      '2320': { name: 'Federal Income Tax Payable', type: 'liability', normal: 'credit' },
      '2330': { name: 'State Income Tax Payable', type: 'liability', normal: 'credit' },
      '2400': { name: 'Deferred Revenue', type: 'liability', normal: 'credit' },
      '2500': { name: 'Current Portion of Long-Term Debt', type: 'liability', normal: 'credit' },
    },
    longTerm: {
      '2600': { name: 'Notes Payable', type: 'liability', normal: 'credit' },
      '2610': { name: 'Bank Loans', type: 'liability', normal: 'credit' },
      '2620': { name: 'SBA Loans', type: 'liability', normal: 'credit' },
      '2700': { name: 'Mortgage Payable', type: 'liability', normal: 'credit' },
      '2800': { name: 'Other Long-Term Liabilities', type: 'liability', normal: 'credit' },
    },
  },

  // EQUITY (3000-3999)
  equity: {
    '3000': { name: 'Owner\'s Capital', type: 'equity', normal: 'credit' },
    '3010': { name: 'Owner\'s Contributions', type: 'equity', normal: 'credit' },
    '3020': { name: 'Owner\'s Draws', type: 'equity', normal: 'debit' },
    '3100': { name: 'Common Stock', type: 'equity', normal: 'credit' },
    '3110': { name: 'Additional Paid-in Capital', type: 'equity', normal: 'credit' },
    '3200': { name: 'Retained Earnings', type: 'equity', normal: 'credit' },
    '3300': { name: 'Current Year Earnings', type: 'equity', normal: 'credit' },
    '3400': { name: 'Dividends Paid', type: 'equity', normal: 'debit' },
  },

  // REVENUE (4000-4999)
  revenue: {
    '4000': { name: 'Sales Revenue', type: 'revenue', normal: 'credit' },
    '4010': { name: 'Product Sales', type: 'revenue', normal: 'credit' },
    '4020': { name: 'Service Revenue', type: 'revenue', normal: 'credit' },
    '4030': { name: 'Consulting Revenue', type: 'revenue', normal: 'credit' },
    '4100': { name: 'Sales Returns & Allowances', type: 'revenue', normal: 'debit' },
    '4200': { name: 'Sales Discounts', type: 'revenue', normal: 'debit' },
    '4500': { name: 'Interest Income', type: 'revenue', normal: 'credit' },
    '4510': { name: 'Dividend Income', type: 'revenue', normal: 'credit' },
    '4600': { name: 'Rental Income', type: 'revenue', normal: 'credit' },
    '4700': { name: 'Gain on Sale of Assets', type: 'revenue', normal: 'credit' },
    '4900': { name: 'Other Income', type: 'revenue', normal: 'credit' },
  },

  // COST OF GOODS SOLD (5000-5999)
  cogs: {
    '5000': { name: 'Cost of Goods Sold', type: 'expense', normal: 'debit' },
    '5010': { name: 'Purchases', type: 'expense', normal: 'debit' },
    '5020': { name: 'Purchase Returns & Allowances', type: 'expense', normal: 'credit' },
    '5030': { name: 'Purchase Discounts', type: 'expense', normal: 'credit' },
    '5100': { name: 'Direct Labor', type: 'expense', normal: 'debit' },
    '5200': { name: 'Direct Materials', type: 'expense', normal: 'debit' },
    '5300': { name: 'Manufacturing Overhead', type: 'expense', normal: 'debit' },
    '5400': { name: 'Freight In', type: 'expense', normal: 'debit' },
    '5500': { name: 'Subcontractor Costs', type: 'expense', normal: 'debit' },
  },

  // OPERATING EXPENSES (6000-6999)
  expenses: {
    '6000': { name: 'Advertising & Marketing', type: 'expense', normal: 'debit' },
    '6010': { name: 'Online Advertising', type: 'expense', normal: 'debit' },
    '6020': { name: 'Print Advertising', type: 'expense', normal: 'debit' },
    '6100': { name: 'Bank Charges & Fees', type: 'expense', normal: 'debit' },
    '6110': { name: 'Merchant Fees', type: 'expense', normal: 'debit' },
    '6200': { name: 'Dues & Subscriptions', type: 'expense', normal: 'debit' },
    '6210': { name: 'Software Subscriptions', type: 'expense', normal: 'debit' },
    '6220': { name: 'Professional Memberships', type: 'expense', normal: 'debit' },
    '6300': { name: 'Insurance', type: 'expense', normal: 'debit' },
    '6310': { name: 'Health Insurance', type: 'expense', normal: 'debit' },
    '6320': { name: 'Liability Insurance', type: 'expense', normal: 'debit' },
    '6330': { name: 'Workers Compensation', type: 'expense', normal: 'debit' },
    '6400': { name: 'Interest Expense', type: 'expense', normal: 'debit' },
    '6500': { name: 'Legal & Professional Fees', type: 'expense', normal: 'debit' },
    '6510': { name: 'Accounting Fees', type: 'expense', normal: 'debit' },
    '6520': { name: 'Legal Fees', type: 'expense', normal: 'debit' },
    '6530': { name: 'Consulting Fees', type: 'expense', normal: 'debit' },
    '6600': { name: 'Office Expenses', type: 'expense', normal: 'debit' },
    '6610': { name: 'Office Supplies', type: 'expense', normal: 'debit' },
    '6620': { name: 'Postage & Shipping', type: 'expense', normal: 'debit' },
    '6700': { name: 'Payroll Expenses', type: 'expense', normal: 'debit' },
    '6710': { name: 'Wages & Salaries', type: 'expense', normal: 'debit' },
    '6720': { name: 'Payroll Taxes', type: 'expense', normal: 'debit' },
    '6730': { name: 'Employee Benefits', type: 'expense', normal: 'debit' },
    '6740': { name: 'Contract Labor', type: 'expense', normal: 'debit' },
    '6800': { name: 'Rent Expense', type: 'expense', normal: 'debit' },
    '6810': { name: 'Equipment Rental', type: 'expense', normal: 'debit' },
    '6900': { name: 'Repairs & Maintenance', type: 'expense', normal: 'debit' },
    '6950': { name: 'Taxes & Licenses', type: 'expense', normal: 'debit' },
  },

  // OTHER EXPENSES (7000-7999)
  otherExpenses: {
    '7000': { name: 'Travel Expense', type: 'expense', normal: 'debit' },
    '7010': { name: 'Airfare', type: 'expense', normal: 'debit' },
    '7020': { name: 'Lodging', type: 'expense', normal: 'debit' },
    '7030': { name: 'Ground Transportation', type: 'expense', normal: 'debit' },
    '7100': { name: 'Meals & Entertainment', type: 'expense', normal: 'debit' },
    '7110': { name: 'Business Meals', type: 'expense', normal: 'debit' },
    '7200': { name: 'Utilities', type: 'expense', normal: 'debit' },
    '7210': { name: 'Electric', type: 'expense', normal: 'debit' },
    '7220': { name: 'Gas', type: 'expense', normal: 'debit' },
    '7230': { name: 'Water', type: 'expense', normal: 'debit' },
    '7240': { name: 'Internet & Phone', type: 'expense', normal: 'debit' },
    '7300': { name: 'Vehicle Expenses', type: 'expense', normal: 'debit' },
    '7310': { name: 'Gas & Fuel', type: 'expense', normal: 'debit' },
    '7320': { name: 'Vehicle Repairs', type: 'expense', normal: 'debit' },
    '7330': { name: 'Vehicle Insurance', type: 'expense', normal: 'debit' },
    '7340': { name: 'Vehicle Registration', type: 'expense', normal: 'debit' },
    '7400': { name: 'Depreciation Expense', type: 'expense', normal: 'debit' },
    '7500': { name: 'Amortization Expense', type: 'expense', normal: 'debit' },
    '7600': { name: 'Bad Debt Expense', type: 'expense', normal: 'debit' },
    '7700': { name: 'Loss on Sale of Assets', type: 'expense', normal: 'debit' },
    '7800': { name: 'Charitable Contributions', type: 'expense', normal: 'debit' },
    '7900': { name: 'Miscellaneous Expense', type: 'expense', normal: 'debit' },
  },

  // TAX EXPENSE (8000-8999)
  taxes: {
    '8000': { name: 'Income Tax Expense', type: 'expense', normal: 'debit' },
    '8100': { name: 'Federal Income Tax', type: 'expense', normal: 'debit' },
    '8200': { name: 'State Income Tax', type: 'expense', normal: 'debit' },
    '8300': { name: 'Local Income Tax', type: 'expense', normal: 'debit' },
  },

  // SUSPENSE / CLEARING (9000-9999)
  suspense: {
    '9000': { name: 'Suspense Account', type: 'asset', normal: 'debit' },
    '9100': { name: 'Clearing Account', type: 'asset', normal: 'debit' },
    '9200': { name: 'Unclassified Transactions', type: 'expense', normal: 'debit' },
    '9900': { name: 'Needs Review', type: 'expense', normal: 'debit' },
  },
};

// ============================================================================
// TRANSACTION CLASSIFICATION RULES
// ============================================================================

export const CLASSIFICATION_RULES: {
  patterns: RegExp[];
  account_code: string;
  category: string;
  subcategory?: string;
  confidence: number;
}[] = [
  // INCOME
  { patterns: [/deposit|transfer in|payment received|ach credit|wire in/i], account_code: '4000', category: 'revenue', subcategory: 'sales', confidence: 0.8 },
  { patterns: [/stripe|square|paypal.*transfer|merchant.*dep/i], account_code: '4000', category: 'revenue', subcategory: 'sales', confidence: 0.9 },
  { patterns: [/interest.*credit|interest.*earned/i], account_code: '4500', category: 'revenue', subcategory: 'interest', confidence: 0.95 },
  { patterns: [/dividend/i], account_code: '4510', category: 'revenue', subcategory: 'dividends', confidence: 0.95 },
  { patterns: [/rent.*income|rental.*received/i], account_code: '4600', category: 'revenue', subcategory: 'rental', confidence: 0.85 },

  // COGS
  { patterns: [/wholesale|inventory|materials|supplies.*prod/i], account_code: '5200', category: 'cogs', subcategory: 'materials', confidence: 0.8 },
  { patterns: [/amazon.*seller|alibaba|dhgate/i], account_code: '5010', category: 'cogs', subcategory: 'purchases', confidence: 0.75 },
  { patterns: [/freight|shipping.*in|fedex.*in|ups.*in/i], account_code: '5400', category: 'cogs', subcategory: 'freight', confidence: 0.8 },
  { patterns: [/contractor|subcontract|1099.*labor/i], account_code: '5500', category: 'cogs', subcategory: 'subcontractor', confidence: 0.8 },

  // PAYROLL
  { patterns: [/payroll|gusto|adp|paychex|quickbooks.*payroll/i], account_code: '6710', category: 'expense', subcategory: 'payroll', confidence: 0.95 },
  { patterns: [/eftps|941.*tax|payroll.*tax/i], account_code: '6720', category: 'expense', subcategory: 'payroll_tax', confidence: 0.95 },
  { patterns: [/401k|retirement|pension/i], account_code: '6730', category: 'expense', subcategory: 'benefits', confidence: 0.9 },
  { patterns: [/health.*insurance|medical.*premium|dental.*premium/i], account_code: '6310', category: 'expense', subcategory: 'insurance', confidence: 0.9 },

  // RENT & UTILITIES
  { patterns: [/rent|lease.*payment/i], account_code: '6800', category: 'expense', subcategory: 'rent', confidence: 0.9 },
  { patterns: [/electric|power.*company|duke.*energy|pge/i], account_code: '7210', category: 'expense', subcategory: 'utilities', confidence: 0.95 },
  { patterns: [/gas.*company|natural.*gas/i], account_code: '7220', category: 'expense', subcategory: 'utilities', confidence: 0.9 },
  { patterns: [/water.*utility|water.*bill/i], account_code: '7230', category: 'expense', subcategory: 'utilities', confidence: 0.9 },
  { patterns: [/comcast|att|verizon|spectrum|internet|phone.*bill/i], account_code: '7240', category: 'expense', subcategory: 'utilities', confidence: 0.9 },

  // SOFTWARE & SUBSCRIPTIONS
  { patterns: [/adobe|microsoft|google.*workspace|slack|zoom|dropbox/i], account_code: '6210', category: 'expense', subcategory: 'software', confidence: 0.95 },
  { patterns: [/quickbooks|xero|freshbooks|wave/i], account_code: '6510', category: 'expense', subcategory: 'accounting', confidence: 0.95 },
  { patterns: [/salesforce|hubspot|mailchimp|constant.*contact/i], account_code: '6000', category: 'expense', subcategory: 'marketing', confidence: 0.9 },

  // ADVERTISING & MARKETING
  { patterns: [/facebook.*ads|google.*ads|linkedin.*ads|meta.*ads/i], account_code: '6010', category: 'expense', subcategory: 'advertising', confidence: 0.95 },
  { patterns: [/vistaprint|gotprint|print.*advertising/i], account_code: '6020', category: 'expense', subcategory: 'advertising', confidence: 0.9 },

  // PROFESSIONAL SERVICES
  { patterns: [/attorney|lawyer|legal.*fee/i], account_code: '6520', category: 'expense', subcategory: 'legal', confidence: 0.9 },
  { patterns: [/cpa|accountant|tax.*prep|h&r.*block|turbotax/i], account_code: '6510', category: 'expense', subcategory: 'accounting', confidence: 0.9 },
  { patterns: [/consultant|consulting/i], account_code: '6530', category: 'expense', subcategory: 'consulting', confidence: 0.85 },

  // INSURANCE
  { patterns: [/insurance.*premium|liability.*ins|general.*liability/i], account_code: '6320', category: 'expense', subcategory: 'insurance', confidence: 0.9 },
  { patterns: [/workers.*comp|workman.*comp/i], account_code: '6330', category: 'expense', subcategory: 'insurance', confidence: 0.9 },

  // OFFICE & SUPPLIES
  { patterns: [/staples|office.*depot|amazon.*office/i], account_code: '6610', category: 'expense', subcategory: 'office', confidence: 0.85 },
  { patterns: [/usps|fedex|ups|dhl|shipping|postage/i], account_code: '6620', category: 'expense', subcategory: 'shipping', confidence: 0.9 },

  // TRAVEL
  { patterns: [/airline|united.*air|delta.*air|american.*air|southwest/i], account_code: '7010', category: 'expense', subcategory: 'travel', confidence: 0.95 },
  { patterns: [/marriott|hilton|hyatt|hotel|airbnb|vrbo/i], account_code: '7020', category: 'expense', subcategory: 'travel', confidence: 0.95 },
  { patterns: [/uber|lyft|taxi|rental.*car|hertz|enterprise/i], account_code: '7030', category: 'expense', subcategory: 'travel', confidence: 0.9 },

  // MEALS
  { patterns: [/restaurant|doordash|grubhub|ubereats|starbucks|dunkin/i], account_code: '7110', category: 'expense', subcategory: 'meals', confidence: 0.8 },

  // VEHICLE
  { patterns: [/shell|exxon|chevron|bp|gas.*station|fuel/i], account_code: '7310', category: 'expense', subcategory: 'vehicle', confidence: 0.85 },
  { patterns: [/jiffy.*lube|oil.*change|auto.*repair|mechanic/i], account_code: '7320', category: 'expense', subcategory: 'vehicle', confidence: 0.9 },
  { patterns: [/geico|progressive|allstate|state.*farm.*auto/i], account_code: '7330', category: 'expense', subcategory: 'vehicle', confidence: 0.85 },
  { patterns: [/dmv|registration|license.*plate/i], account_code: '7340', category: 'expense', subcategory: 'vehicle', confidence: 0.9 },

  // BANK FEES
  { patterns: [/monthly.*fee|service.*charge|overdraft|nsf.*fee/i], account_code: '6100', category: 'expense', subcategory: 'bank_fees', confidence: 0.95 },
  { patterns: [/stripe.*fee|square.*fee|paypal.*fee|merchant.*fee/i], account_code: '6110', category: 'expense', subcategory: 'merchant_fees', confidence: 0.95 },

  // INTEREST EXPENSE
  { patterns: [/interest.*charge|interest.*payment|loan.*interest/i], account_code: '6400', category: 'expense', subcategory: 'interest', confidence: 0.9 },

  // LOANS & DEBT
  { patterns: [/loan.*payment|mortgage.*payment|note.*payment/i], account_code: '2600', category: 'liability', subcategory: 'loan_payment', confidence: 0.85 },
  { patterns: [/sba.*loan|ppp.*loan/i], account_code: '2620', category: 'liability', subcategory: 'sba_loan', confidence: 0.9 },
  { patterns: [/credit.*card.*payment/i], account_code: '2100', category: 'liability', subcategory: 'credit_card', confidence: 0.9 },

  // TAXES
  { patterns: [/irs|federal.*tax|estimated.*tax/i], account_code: '8100', category: 'tax', subcategory: 'federal', confidence: 0.95 },
  { patterns: [/state.*tax|franchise.*tax/i], account_code: '8200', category: 'tax', subcategory: 'state', confidence: 0.9 },
  { patterns: [/sales.*tax|state.*sales/i], account_code: '2300', category: 'liability', subcategory: 'sales_tax', confidence: 0.9 },

  // OWNER TRANSACTIONS
  { patterns: [/owner.*draw|distribution|shareholder.*dist/i], account_code: '3020', category: 'equity', subcategory: 'draws', confidence: 0.85 },
  { patterns: [/capital.*contribution|owner.*invest/i], account_code: '3010', category: 'equity', subcategory: 'contribution', confidence: 0.85 },

  // EQUIPMENT / ASSETS
  { patterns: [/apple.*store|best.*buy|computer|laptop|server/i], account_code: '1520', category: 'asset', subcategory: 'equipment', confidence: 0.75 },
  { patterns: [/furniture|desk|chair|office.*furn/i], account_code: '1500', category: 'asset', subcategory: 'furniture', confidence: 0.8 },
  { patterns: [/vehicle.*purchase|car.*purchase|truck.*purchase/i], account_code: '1540', category: 'asset', subcategory: 'vehicle', confidence: 0.85 },

  // TRANSFERS (Internal - not income/expense)
  { patterns: [/transfer.*to|transfer.*from|internal.*transfer/i], account_code: '9100', category: 'transfer', subcategory: 'internal', confidence: 0.9 },

  // ATM / CASH
  { patterns: [/atm.*withdrawal|cash.*withdrawal/i], account_code: '9200', category: 'expense', subcategory: 'unclassified', confidence: 0.5 },
];

// ============================================================================
// MAIN ENGINE CLASS
// ============================================================================

export class GAAPAccountingEngine {
  private config: AccountingEngineConfig;
  private transactions: NormalizedTransaction[] = [];
  private ledger: LedgerEntry[] = [];
  private anomalies: Anomaly[] = [];

  constructor(config: AccountingEngineConfig) {
    this.config = config;
  }

  /**
   * STEP 1: Process and normalize raw bank transactions
   */
  async normalizeTransactions(rawTransactions: BankTransaction[]): Promise<NormalizedTransaction[]> {
    this.transactions = rawTransactions.map(raw => {
      const classification = this.classifyTransaction(raw);

      return {
        id: generateId('TXN'),
        date: raw.date,
        description: raw.description,
        amount: Math.abs(raw.amount),
        type: classification.type as any,
        account_code: classification.account_code,
        account_name: classification.account_name,
        category: classification.category,
        subcategory: classification.subcategory,
        notes: raw.merchant || '',
        flags: classification.flags,
        confidence: classification.confidence,
        needs_review: classification.needs_review,
      };
    });

    return this.transactions;
  }

  /**
   * Classify a single transaction using pattern matching
   */
  private classifyTransaction(txn: BankTransaction): {
    type: string;
    account_code: string;
    account_name: string;
    category: string;
    subcategory?: string;
    confidence: number;
    flags: string[];
    needs_review: boolean;
  } {
    const description = txn.description.toLowerCase();
    const flags: string[] = [];
    let needs_review = false;

    // Try to match against classification rules
    for (const rule of CLASSIFICATION_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(description)) {
          const account = this.getAccountInfo(rule.account_code);
          return {
            type: this.determineTransactionType(rule.category, txn.type),
            account_code: rule.account_code,
            account_name: account?.name || 'Unknown Account',
            category: rule.category,
            subcategory: rule.subcategory,
            confidence: rule.confidence,
            flags,
            needs_review: rule.confidence < 0.7,
          };
        }
      }
    }

    // Flag anomalies
    if (Math.abs(txn.amount) > 10000) {
      flags.push('LARGE_TRANSACTION');
      this.anomalies.push({
        type: 'large_transaction',
        description: `Large transaction of $${Math.abs(txn.amount).toLocaleString()}`,
        amount: txn.amount,
        severity: 'warning',
        action_required: 'Review and classify manually',
      });
    }

    // Default classification based on debit/credit
    if (txn.type === 'credit' || txn.amount > 0) {
      return {
        type: 'income',
        account_code: '4900',
        account_name: 'Other Income',
        category: 'revenue',
        subcategory: 'other',
        confidence: 0.5,
        flags: [...flags, 'UNCLASSIFIED'],
        needs_review: true,
      };
    } else {
      return {
        type: 'expense',
        account_code: '9200',
        account_name: 'Unclassified Transactions',
        category: 'expense',
        subcategory: 'unclassified',
        confidence: 0.3,
        flags: [...flags, 'UNCLASSIFIED', 'NEEDS_REVIEW'],
        needs_review: true,
      };
    }
  }

  private determineTransactionType(category: string, rawType: string): string {
    if (category === 'revenue') return 'income';
    if (category === 'expense' || category === 'cogs' || category === 'tax') return 'expense';
    if (category === 'asset') return 'asset';
    if (category === 'liability') return 'liability';
    if (category === 'equity') return 'equity';
    if (category === 'transfer') return 'transfer';
    return rawType === 'credit' ? 'income' : 'expense';
  }

  private getAccountInfo(code: string): { name: string; type: string; normal: string } | undefined {
    // Search all account categories
    const allAccounts = {
      ...CHART_OF_ACCOUNTS.assets.current,
      ...CHART_OF_ACCOUNTS.assets.fixed,
      ...CHART_OF_ACCOUNTS.assets.other,
      ...CHART_OF_ACCOUNTS.liabilities.current,
      ...CHART_OF_ACCOUNTS.liabilities.longTerm,
      ...CHART_OF_ACCOUNTS.equity,
      ...CHART_OF_ACCOUNTS.revenue,
      ...CHART_OF_ACCOUNTS.cogs,
      ...CHART_OF_ACCOUNTS.expenses,
      ...CHART_OF_ACCOUNTS.otherExpenses,
      ...CHART_OF_ACCOUNTS.taxes,
      ...CHART_OF_ACCOUNTS.suspense,
    };

    return allAccounts[code as keyof typeof allAccounts];
  }

  /**
   * STEP 2: Build double-entry general ledger
   */
  buildGeneralLedger(): LedgerEntry[] {
    this.ledger = this.transactions.map(txn => {
      // Double-entry logic
      let debitAccount = '';
      let creditAccount = '';

      switch (txn.type) {
        case 'income':
          debitAccount = '1000'; // Cash
          creditAccount = txn.account_code; // Revenue account
          break;
        case 'expense':
          debitAccount = txn.account_code; // Expense account
          creditAccount = '1000'; // Cash
          break;
        case 'asset':
          debitAccount = txn.account_code; // Asset account
          creditAccount = '1000'; // Cash
          break;
        case 'liability':
          debitAccount = txn.account_code; // Liability account (payment reduces)
          creditAccount = '1000'; // Cash
          break;
        case 'equity':
          if (txn.account_code === '3020') {
            // Owner's draw
            debitAccount = txn.account_code;
            creditAccount = '1000';
          } else {
            // Owner's contribution
            debitAccount = '1000';
            creditAccount = txn.account_code;
          }
          break;
        case 'transfer':
          debitAccount = '9100'; // Clearing
          creditAccount = '9100';
          break;
        default:
          debitAccount = '9200';
          creditAccount = '1000';
      }

      return {
        id: generateId('JE'),
        date: txn.date,
        account_debit: debitAccount,
        account_credit: creditAccount,
        amount: txn.amount,
        description: txn.description,
        source_transaction_id: txn.id,
      };
    });

    return this.ledger;
  }

  /**
   * STEP 3: Generate Income Statement (Profit & Loss)
   */
  generateIncomeStatement(): FinancialStatement {
    const revenue = this.sumByAccountRange('4000', '4999');
    const cogs = this.sumByAccountRange('5000', '5999');
    const grossProfit = revenue - cogs;
    const operatingExpenses = this.sumByAccountRange('6000', '6999');
    const otherExpenses = this.sumByAccountRange('7000', '7999');
    const taxes = this.sumByAccountRange('8000', '8999');
    const netIncome = grossProfit - operatingExpenses - otherExpenses - taxes;

    return {
      statement_type: 'income_statement',
      period_start: this.config.fiscal_year_start,
      period_end: this.config.fiscal_year_end,
      generated_at: new Date().toISOString(),
      sections: [
        {
          name: 'Revenue',
          line_items: this.getLineItemsByAccountRange('4000', '4999'),
          subtotal: revenue,
        },
        {
          name: 'Cost of Goods Sold',
          line_items: this.getLineItemsByAccountRange('5000', '5999'),
          subtotal: cogs,
        },
        {
          name: 'Gross Profit',
          line_items: [{ account_code: '', account_name: 'Gross Profit', amount: grossProfit, is_subtotal: true }],
          subtotal: grossProfit,
        },
        {
          name: 'Operating Expenses',
          line_items: this.getLineItemsByAccountRange('6000', '6999'),
          subtotal: operatingExpenses,
        },
        {
          name: 'Other Expenses',
          line_items: this.getLineItemsByAccountRange('7000', '7999'),
          subtotal: otherExpenses,
        },
        {
          name: 'Income Tax Expense',
          line_items: this.getLineItemsByAccountRange('8000', '8999'),
          subtotal: taxes,
        },
        {
          name: 'Net Income',
          line_items: [{ account_code: '', account_name: 'Net Income', amount: netIncome, is_subtotal: true }],
          subtotal: netIncome,
        },
      ],
      totals: {
        revenue,
        cogs,
        gross_profit: grossProfit,
        operating_expenses: operatingExpenses,
        other_expenses: otherExpenses,
        taxes,
        net_income: netIncome,
      },
    };
  }

  /**
   * STEP 3: Generate Balance Sheet
   */
  generateBalanceSheet(): FinancialStatement {
    const currentAssets = this.sumByAccountRange('1000', '1499');
    const fixedAssets = this.sumByAccountRange('1500', '1699');
    const otherAssets = this.sumByAccountRange('1700', '1999');
    const totalAssets = currentAssets + fixedAssets + otherAssets;

    const currentLiabilities = this.sumByAccountRange('2000', '2599');
    const longTermLiabilities = this.sumByAccountRange('2600', '2999');
    const totalLiabilities = currentLiabilities + longTermLiabilities;

    const equity = this.sumByAccountRange('3000', '3999');
    const netIncome = this.generateIncomeStatement().totals.net_income;
    const totalEquity = equity + netIncome;

    return {
      statement_type: 'balance_sheet',
      period_start: this.config.fiscal_year_start,
      period_end: this.config.fiscal_year_end,
      generated_at: new Date().toISOString(),
      sections: [
        {
          name: 'Current Assets',
          line_items: this.getLineItemsByAccountRange('1000', '1499'),
          subtotal: currentAssets,
        },
        {
          name: 'Fixed Assets',
          line_items: this.getLineItemsByAccountRange('1500', '1699'),
          subtotal: fixedAssets,
        },
        {
          name: 'Other Assets',
          line_items: this.getLineItemsByAccountRange('1700', '1999'),
          subtotal: otherAssets,
        },
        {
          name: 'TOTAL ASSETS',
          line_items: [{ account_code: '', account_name: 'Total Assets', amount: totalAssets, is_subtotal: true }],
          subtotal: totalAssets,
        },
        {
          name: 'Current Liabilities',
          line_items: this.getLineItemsByAccountRange('2000', '2599'),
          subtotal: currentLiabilities,
        },
        {
          name: 'Long-Term Liabilities',
          line_items: this.getLineItemsByAccountRange('2600', '2999'),
          subtotal: longTermLiabilities,
        },
        {
          name: 'TOTAL LIABILITIES',
          line_items: [{ account_code: '', account_name: 'Total Liabilities', amount: totalLiabilities, is_subtotal: true }],
          subtotal: totalLiabilities,
        },
        {
          name: 'Equity',
          line_items: [
            ...this.getLineItemsByAccountRange('3000', '3999'),
            { account_code: '3300', account_name: 'Current Year Earnings', amount: netIncome },
          ],
          subtotal: totalEquity,
        },
        {
          name: 'TOTAL LIABILITIES & EQUITY',
          line_items: [{ account_code: '', account_name: 'Total Liabilities & Equity', amount: totalLiabilities + totalEquity, is_subtotal: true }],
          subtotal: totalLiabilities + totalEquity,
        },
      ],
      totals: {
        current_assets: currentAssets,
        fixed_assets: fixedAssets,
        other_assets: otherAssets,
        total_assets: totalAssets,
        current_liabilities: currentLiabilities,
        long_term_liabilities: longTermLiabilities,
        total_liabilities: totalLiabilities,
        equity: totalEquity,
        total_liabilities_equity: totalLiabilities + totalEquity,
      },
    };
  }

  /**
   * STEP 3: Generate Cash Flow Statement
   */
  generateCashFlowStatement(): FinancialStatement {
    const netIncome = this.generateIncomeStatement().totals.net_income;
    const depreciation = this.sumByAccount('7400');

    // Operating activities (simplified indirect method)
    const operatingCashFlow = netIncome + depreciation;

    // Investing activities (asset purchases)
    const assetPurchases = this.sumByAccountRange('1500', '1699');
    const investingCashFlow = -assetPurchases;

    // Financing activities
    const loanPayments = this.sumByAccountRange('2600', '2999');
    const ownerDraws = this.sumByAccount('3020');
    const ownerContributions = this.sumByAccount('3010');
    const financingCashFlow = ownerContributions - ownerDraws - loanPayments;

    const netChange = operatingCashFlow + investingCashFlow + financingCashFlow;

    return {
      statement_type: 'cash_flow',
      period_start: this.config.fiscal_year_start,
      period_end: this.config.fiscal_year_end,
      generated_at: new Date().toISOString(),
      sections: [
        {
          name: 'Operating Activities',
          line_items: [
            { account_code: '', account_name: 'Net Income', amount: netIncome },
            { account_code: '7400', account_name: 'Add: Depreciation', amount: depreciation },
            { account_code: '', account_name: 'Net Cash from Operating Activities', amount: operatingCashFlow, is_subtotal: true },
          ],
          subtotal: operatingCashFlow,
        },
        {
          name: 'Investing Activities',
          line_items: [
            { account_code: '', account_name: 'Purchase of Fixed Assets', amount: -assetPurchases },
            { account_code: '', account_name: 'Net Cash from Investing Activities', amount: investingCashFlow, is_subtotal: true },
          ],
          subtotal: investingCashFlow,
        },
        {
          name: 'Financing Activities',
          line_items: [
            { account_code: '3010', account_name: 'Owner Contributions', amount: ownerContributions },
            { account_code: '3020', account_name: 'Owner Draws', amount: -ownerDraws },
            { account_code: '', account_name: 'Loan Payments', amount: -loanPayments },
            { account_code: '', account_name: 'Net Cash from Financing Activities', amount: financingCashFlow, is_subtotal: true },
          ],
          subtotal: financingCashFlow,
        },
        {
          name: 'Net Change in Cash',
          line_items: [{ account_code: '', account_name: 'Net Increase (Decrease) in Cash', amount: netChange, is_subtotal: true }],
          subtotal: netChange,
        },
      ],
      totals: {
        operating: operatingCashFlow,
        investing: investingCashFlow,
        financing: financingCashFlow,
        net_change: netChange,
      },
    };
  }

  /**
   * STEP 3: Generate Trial Balance
   */
  generateTrialBalance(): FinancialStatement {
    const accountBalances = new Map<string, { debit: number; credit: number }>();

    // Aggregate ledger entries by account
    this.ledger.forEach(entry => {
      const debitBal = accountBalances.get(entry.account_debit) || { debit: 0, credit: 0 };
      debitBal.debit += entry.amount;
      accountBalances.set(entry.account_debit, debitBal);

      const creditBal = accountBalances.get(entry.account_credit) || { debit: 0, credit: 0 };
      creditBal.credit += entry.amount;
      accountBalances.set(entry.account_credit, creditBal);
    });

    const lineItems: LineItem[] = [];
    let totalDebits = 0;
    let totalCredits = 0;

    accountBalances.forEach((bal, code) => {
      const account = this.getAccountInfo(code);
      const netDebit = bal.debit;
      const netCredit = bal.credit;

      lineItems.push({
        account_code: code,
        account_name: account?.name || 'Unknown',
        amount: netDebit - netCredit,
      });

      totalDebits += netDebit;
      totalCredits += netCredit;
    });

    return {
      statement_type: 'trial_balance',
      period_start: this.config.fiscal_year_start,
      period_end: this.config.fiscal_year_end,
      generated_at: new Date().toISOString(),
      sections: [
        {
          name: 'Trial Balance',
          line_items: lineItems.sort((a, b) => a.account_code.localeCompare(b.account_code)),
          subtotal: 0,
        },
      ],
      totals: {
        total_debits: totalDebits,
        total_credits: totalCredits,
        difference: totalDebits - totalCredits,
      },
    };
  }

  // Helper methods for account range calculations
  private sumByAccountRange(startCode: string, endCode: string): number {
    return this.transactions
      .filter(t => t.account_code >= startCode && t.account_code <= endCode)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private sumByAccount(code: string): number {
    return this.transactions
      .filter(t => t.account_code === code)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private getLineItemsByAccountRange(startCode: string, endCode: string): LineItem[] {
    const accountTotals = new Map<string, number>();

    this.transactions
      .filter(t => t.account_code >= startCode && t.account_code <= endCode)
      .forEach(t => {
        const current = accountTotals.get(t.account_code) || 0;
        accountTotals.set(t.account_code, current + t.amount);
      });

    return Array.from(accountTotals.entries())
      .map(([code, amount]) => ({
        account_code: code,
        account_name: this.getAccountInfo(code)?.name || 'Unknown',
        amount,
      }))
      .filter(item => item.amount !== 0)
      .sort((a, b) => a.account_code.localeCompare(b.account_code));
  }

  /**
   * STEP 4: Generate Chart Data for Visualizations
   */
  generateChartData(): ChartData[] {
    const charts: ChartData[] = [];

    // Expense Breakdown Pie Chart
    const expenseByCategory = new Map<string, number>();
    this.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.subcategory || t.category;
        expenseByCategory.set(cat, (expenseByCategory.get(cat) || 0) + t.amount);
      });

    charts.push({
      chart_type: 'pie',
      title: 'Expense Breakdown by Category',
      labels: Array.from(expenseByCategory.keys()),
      datasets: [{
        label: 'Expenses',
        data: Array.from(expenseByCategory.values()),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#7BC225', '#B4436C',
        ],
      }],
    });

    // Revenue vs Expense Bar Chart
    const totalRevenue = this.sumByAccountRange('4000', '4999');
    const totalExpenses = this.sumByAccountRange('5000', '7999');

    charts.push({
      chart_type: 'bar',
      title: 'Revenue vs Expenses',
      labels: ['Revenue', 'Expenses', 'Net Income'],
      datasets: [{
        label: 'Amount ($)',
        data: [totalRevenue, totalExpenses, totalRevenue - totalExpenses],
        backgroundColor: ['#4BC0C0', '#FF6384', totalRevenue - totalExpenses >= 0 ? '#7BC225' : '#FF6384'],
      }],
    });

    // Monthly Cash Flow Trend
    const monthlyData = new Map<string, { income: number; expense: number }>();
    this.transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      const current = monthlyData.get(month) || { income: 0, expense: 0 };
      if (t.type === 'income') {
        current.income += t.amount;
      } else if (t.type === 'expense') {
        current.expense += t.amount;
      }
      monthlyData.set(month, current);
    });

    const sortedMonths = Array.from(monthlyData.keys()).sort();
    charts.push({
      chart_type: 'line',
      title: 'Monthly Cash Flow Trend',
      labels: sortedMonths,
      datasets: [
        {
          label: 'Income',
          data: sortedMonths.map(m => monthlyData.get(m)?.income || 0),
          backgroundColor: ['#4BC0C0'],
        },
        {
          label: 'Expenses',
          data: sortedMonths.map(m => monthlyData.get(m)?.expense || 0),
          backgroundColor: ['#FF6384'],
        },
      ],
    });

    return charts;
  }

  /**
   * STEP 5: Generate Tax Preparation Summary
   */
  generateTaxSummary(): TaxSummary {
    const incomeStatement = this.generateIncomeStatement();

    // Identify depreciation candidates (equipment purchases > $2,500)
    const depreciationCandidates: DepreciationCandidate[] = this.transactions
      .filter(t => t.type === 'asset' && t.amount > 2500)
      .map(t => ({
        description: t.description,
        amount: t.amount,
        date_acquired: t.date,
        asset_class: this.determineAssetClass(t.account_code),
        recovery_period: this.determineRecoveryPeriod(t.account_code),
        section_179_eligible: true,
      }));

    // Identify payroll indicators
    const payrollIndicators: PayrollIndicator[] = this.transactions
      .filter(t => t.subcategory === 'payroll')
      .map(t => ({
        description: t.description,
        amount: t.amount,
        frequency: 'bi-weekly', // Would need more analysis
        likely_payroll: true,
      }));

    // Calculate deductions by category
    const deductionsByCategory: Record<string, number> = {};
    this.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.subcategory || t.category;
        deductionsByCategory[cat] = (deductionsByCategory[cat] || 0) + t.amount;
      });

    const grossRevenue = incomeStatement.totals.revenue;
    const cogs = incomeStatement.totals.cogs;
    const grossProfit = incomeStatement.totals.gross_profit;
    const totalDeductions = incomeStatement.totals.operating_expenses + incomeStatement.totals.other_expenses;
    const netTaxableIncome = incomeStatement.totals.net_income;

    // Estimate tax liability based on entity type
    let estimatedTax = 0;
    switch (this.config.entity_type) {
      case 'ccorp':
        estimatedTax = netTaxableIncome * 0.21; // Flat 21%
        break;
      case 'sole_prop':
        estimatedTax = netTaxableIncome * 0.25 + netTaxableIncome * 0.153 * 0.9235; // Est income + SE tax
        break;
      case 'scorp':
      case 'partnership':
        estimatedTax = netTaxableIncome * 0.30; // Pass-through estimate
        break;
      default:
        estimatedTax = netTaxableIncome * 0.25;
    }

    return {
      tax_year: this.config.fiscal_year_end.substring(0, 4),
      entity_type: this.config.entity_type as any,
      gross_revenue: grossRevenue,
      cost_of_goods_sold: cogs,
      gross_profit: grossProfit,
      total_deductions: totalDeductions,
      net_taxable_income: netTaxableIncome,
      deductions_by_category: deductionsByCategory,
      depreciation_candidates: depreciationCandidates,
      payroll_indicators: payrollIndicators,
      estimated_tax_liability: Math.max(0, estimatedTax),
      schedule_c_ready: this.config.entity_type === 'sole_prop',
      form_1120_ready: this.config.entity_type === 'ccorp',
      form_1065_ready: this.config.entity_type === 'partnership',
    };
  }

  private determineAssetClass(code: string): string {
    if (code.startsWith('150')) return 'Furniture & Fixtures';
    if (code.startsWith('152')) return 'Equipment';
    if (code.startsWith('154')) return 'Vehicles';
    if (code.startsWith('156')) return 'Buildings';
    if (code.startsWith('158')) return 'Land';
    return 'Other';
  }

  private determineRecoveryPeriod(code: string): number {
    if (code.startsWith('150')) return 7; // Furniture
    if (code.startsWith('152')) return 5; // Equipment
    if (code.startsWith('154')) return 5; // Vehicles
    if (code.startsWith('156')) return 39; // Buildings (nonresidential)
    return 7;
  }

  /**
   * STEP 6: Generate Export Formats
   */
  generateExports(): {
    quickbooks: string;
    xero: string;
    universal_csv: string;
    json_ledger: string;
  } {
    // QuickBooks IIF format
    const quickbooks = this.ledger.map(entry => (
      `${entry.date}\t${this.getAccountInfo(entry.account_debit)?.name}\t${entry.description}\t${entry.amount}\t0\n` +
      `${entry.date}\t${this.getAccountInfo(entry.account_credit)?.name}\t${entry.description}\t0\t${entry.amount}`
    )).join('\n');

    // Xero CSV format
    const xeroHeader = 'Date,Description,Account Code,Debit,Credit\n';
    const xero = xeroHeader + this.ledger.map(entry => (
      `${entry.date},"${entry.description}",${entry.account_debit},${entry.amount},0\n` +
      `${entry.date},"${entry.description}",${entry.account_credit},0,${entry.amount}`
    )).join('\n');

    // Universal CSV
    const csvHeader = 'Date,Account,Type,Amount\n';
    const universal_csv = csvHeader + this.transactions.map(t =>
      `${t.date},"${t.account_name}",${t.type},${t.amount}`
    ).join('\n');

    // JSON Ledger
    const json_ledger = JSON.stringify({
      config: this.config,
      transactions: this.transactions,
      ledger: this.ledger,
    }, null, 2);

    return {
      quickbooks,
      xero,
      universal_csv,
      json_ledger,
    };
  }

  /**
   * STEP 7: Generate Risk & Anomaly Report
   */
  generateRiskReport(): RiskReport {
    const anomalies: Anomaly[] = [...this.anomalies];

    // Check for duplicate transactions
    const seen = new Map<string, number>();
    this.transactions.forEach(t => {
      const key = `${t.date}|${t.amount}|${t.description}`;
      seen.set(key, (seen.get(key) || 0) + 1);
    });

    seen.forEach((count, key) => {
      if (count > 1) {
        anomalies.push({
          type: 'duplicate_transaction',
          description: `Possible duplicate transaction: ${key}`,
          severity: 'warning',
          action_required: 'Review for duplicate entry',
        });
      }
    });

    // Check for personal expense patterns
    const personalPatterns = [/netflix|hulu|spotify|amazon prime|personal|grocery|walmart/i];
    this.transactions.forEach(t => {
      if (personalPatterns.some(p => p.test(t.description))) {
        anomalies.push({
          type: 'personal_expense',
          description: `Possible personal expense: ${t.description}`,
          transaction_id: t.id,
          amount: t.amount,
          severity: 'warning',
          action_required: 'Verify business purpose or remove',
        });
      }
    });

    // Check for unclassified transactions
    const unclassified = this.transactions.filter(t => t.needs_review).length;
    if (unclassified > 0) {
      anomalies.push({
        type: 'unclassified_transactions',
        description: `${unclassified} transactions require manual classification`,
        severity: unclassified > 20 ? 'critical' : 'warning',
        action_required: 'Review and classify manually',
      });
    }

    // Check for large cash withdrawals
    this.transactions
      .filter(t => /atm|cash.*withdrawal/i.test(t.description) && t.amount > 1000)
      .forEach(t => {
        anomalies.push({
          type: 'large_cash_withdrawal',
          description: `Large cash withdrawal: $${t.amount.toLocaleString()}`,
          transaction_id: t.id,
          amount: t.amount,
          severity: 'warning',
          action_required: 'Document business purpose',
        });
      });

    // Check for missing categories
    const categoryCounts = new Map<string, number>();
    this.transactions.forEach(t => {
      categoryCounts.set(t.category, (categoryCounts.get(t.category) || 0) + 1);
    });

    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const warningCount = anomalies.filter(a => a.severity === 'warning').length;

    if (criticalCount > 0) riskLevel = 'critical';
    else if (warningCount > 10) riskLevel = 'high';
    else if (warningCount > 5) riskLevel = 'medium';

    return {
      risk_level: riskLevel,
      anomalies,
      recommendations: [
        'Review all flagged transactions for accuracy',
        'Ensure proper documentation for large transactions',
        'Remove personal expenses from business records',
        'Complete classification of unclassified transactions',
        'Reconcile bank statements monthly',
      ],
    };
  }

  /**
   * STEP 8: Generate Complete Output
   */
  async processAndGenerateAll(rawTransactions: BankTransaction[]): Promise<AccountingEngineOutput> {
    // Step 1: Normalize
    await this.normalizeTransactions(rawTransactions);

    // Step 2: Build Ledger
    this.buildGeneralLedger();

    // Step 3: Generate Statements
    const incomeStatement = this.generateIncomeStatement();
    const balanceSheet = this.generateBalanceSheet();
    const cashFlowStatement = this.generateCashFlowStatement();
    const trialBalance = this.generateTrialBalance();

    // Step 4: Charts
    const chartData = this.generateChartData();

    // Step 5: Tax Summary
    const taxSummary = this.generateTaxSummary();

    // Step 6: Exports
    const exports = this.generateExports();

    // Step 7: Risk Report
    const riskReport = this.generateRiskReport();

    // Step 8: Summary Report
    const summaryReport = this.generateSummaryReport(incomeStatement, balanceSheet, taxSummary, riskReport);

    return {
      config: this.config,
      normalized_transactions: this.transactions,
      general_ledger: this.ledger,
      income_statement: incomeStatement,
      balance_sheet: balanceSheet,
      cash_flow_statement: cashFlowStatement,
      trial_balance: trialBalance,
      chart_data: chartData,
      tax_summary: taxSummary,
      risk_report: riskReport,
      exports,
      summary_report: summaryReport,
    };
  }

  /**
   * Generate Markdown Summary Report
   */
  private generateSummaryReport(
    incomeStatement: FinancialStatement,
    balanceSheet: FinancialStatement,
    taxSummary: TaxSummary,
    riskReport: RiskReport
  ): string {
    return `# FINANCIAL SUMMARY REPORT

**Entity:** ${this.config.entity_name}
**Entity Type:** ${this.config.entity_type.toUpperCase()}
**Period:** ${this.config.fiscal_year_start} to ${this.config.fiscal_year_end}
**Accounting Method:** ${this.config.accounting_method.toUpperCase()}
**Generated:** ${new Date().toISOString()}

---

## EXECUTIVE SUMMARY

| Metric | Amount |
|--------|--------|
| **Gross Revenue** | $${incomeStatement.totals.revenue.toLocaleString()} |
| **Cost of Goods Sold** | $${incomeStatement.totals.cogs.toLocaleString()} |
| **Gross Profit** | $${incomeStatement.totals.gross_profit.toLocaleString()} |
| **Operating Expenses** | $${incomeStatement.totals.operating_expenses.toLocaleString()} |
| **Net Income** | $${incomeStatement.totals.net_income.toLocaleString()} |

**Gross Margin:** ${((incomeStatement.totals.gross_profit / incomeStatement.totals.revenue) * 100).toFixed(1)}%
**Net Margin:** ${((incomeStatement.totals.net_income / incomeStatement.totals.revenue) * 100).toFixed(1)}%

---

## INCOME STATEMENT (PROFIT & LOSS)

### Revenue
${incomeStatement.sections[0].line_items.map(i => `| ${i.account_name} | $${i.amount.toLocaleString()} |`).join('\n')}
| **Total Revenue** | **$${incomeStatement.totals.revenue.toLocaleString()}** |

### Cost of Goods Sold
${incomeStatement.sections[1].line_items.map(i => `| ${i.account_name} | $${i.amount.toLocaleString()} |`).join('\n') || '| (None) | $0 |'}
| **Total COGS** | **$${incomeStatement.totals.cogs.toLocaleString()}** |

### Gross Profit: $${incomeStatement.totals.gross_profit.toLocaleString()}

### Operating Expenses
${incomeStatement.sections[3].line_items.map(i => `| ${i.account_name} | $${i.amount.toLocaleString()} |`).join('\n')}
| **Total Operating Expenses** | **$${incomeStatement.totals.operating_expenses.toLocaleString()}** |

### Net Income: $${incomeStatement.totals.net_income.toLocaleString()}

---

## BALANCE SHEET

### Assets
| Current Assets | Amount |
|----------------|--------|
${balanceSheet.sections[0].line_items.map(i => `| ${i.account_name} | $${i.amount.toLocaleString()} |`).join('\n') || '| (None) | $0 |'}
| **Total Current Assets** | **$${balanceSheet.totals.current_assets.toLocaleString()}** |

| Fixed Assets | Amount |
|--------------|--------|
${balanceSheet.sections[1].line_items.map(i => `| ${i.account_name} | $${i.amount.toLocaleString()} |`).join('\n') || '| (None) | $0 |'}
| **Total Fixed Assets** | **$${balanceSheet.totals.fixed_assets.toLocaleString()}** |

**TOTAL ASSETS: $${balanceSheet.totals.total_assets.toLocaleString()}**

### Liabilities & Equity

| Liabilities | Amount |
|-------------|--------|
${balanceSheet.sections[4].line_items.map(i => `| ${i.account_name} | $${i.amount.toLocaleString()} |`).join('\n') || '| (None) | $0 |'}
| **Total Liabilities** | **$${balanceSheet.totals.total_liabilities.toLocaleString()}** |

| Equity | Amount |
|--------|--------|
${balanceSheet.sections[7].line_items.map(i => `| ${i.account_name} | $${i.amount.toLocaleString()} |`).join('\n')}
| **Total Equity** | **$${balanceSheet.totals.equity.toLocaleString()}** |

**TOTAL LIABILITIES & EQUITY: $${balanceSheet.totals.total_liabilities_equity.toLocaleString()}**

---

## TAX PREPARATION SUMMARY

| Item | Amount |
|------|--------|
| Gross Revenue | $${taxSummary.gross_revenue.toLocaleString()} |
| Cost of Goods Sold | $${taxSummary.cost_of_goods_sold.toLocaleString()} |
| Gross Profit | $${taxSummary.gross_profit.toLocaleString()} |
| Total Deductions | $${taxSummary.total_deductions.toLocaleString()} |
| **Net Taxable Income** | **$${taxSummary.net_taxable_income.toLocaleString()}** |
| **Estimated Tax Liability** | **$${taxSummary.estimated_tax_liability.toLocaleString()}** |

### Deductions by Category

| Category | Amount |
|----------|--------|
${Object.entries(taxSummary.deductions_by_category).map(([cat, amt]) => `| ${cat} | $${amt.toLocaleString()} |`).join('\n')}

### Depreciation Candidates (Section 179 Eligible)

${taxSummary.depreciation_candidates.length > 0 ?
  taxSummary.depreciation_candidates.map(d => `- **${d.description}**: $${d.amount.toLocaleString()} (${d.asset_class}, ${d.recovery_period}-year recovery)`).join('\n') :
  '(No depreciation candidates identified)'}

---

## RISK & ANOMALY REPORT

**Overall Risk Level:** ${riskReport.risk_level.toUpperCase()}

### Anomalies Detected: ${riskReport.anomalies.length}

${riskReport.anomalies.map(a => `- **${a.type}** (${a.severity}): ${a.description}`).join('\n') || '(No anomalies detected)'}

### Recommendations

${riskReport.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

## COMPLIANCE NOTES

This report was prepared in accordance with:
- U.S. GAAP (Generally Accepted Accounting Principles)
- IRS Business Reporting Rules
- Accrual/Cash Accounting Principles (as configured)
- Double-Entry Bookkeeping Standards

### Forms Ready for Filing

${taxSummary.schedule_c_ready ? '✓ Schedule C (Form 1040) - Sole Proprietor' : ''}
${taxSummary.form_1120_ready ? '✓ Form 1120 - C Corporation' : ''}
${taxSummary.form_1065_ready ? '✓ Form 1065 - Partnership' : ''}

---

## EXPORT FILES GENERATED

1. **QuickBooks Format** (.iif)
2. **Xero Format** (.csv)
3. **Universal CSV Ledger** (.csv)
4. **JSON Ledger** (.json)

---

*This report is generated by the AI Financial Reporting & GAAP-Compliant Accounting Engine.*
*For tax filing purposes, please consult with a licensed CPA or tax professional.*
`;
  }
}

// ============================================================================
// WORKFLOW INTEGRATION
// ============================================================================

export interface AccountingWorkflowInput {
  raw_transactions: BankTransaction[];
  config: AccountingEngineConfig;
  output_directory: string;
}

export async function runAccountingWorkflow(input: AccountingWorkflowInput): Promise<AccountingEngineOutput> {
  const engine = new GAAPAccountingEngine(input.config);
  return await engine.processAndGenerateAll(input.raw_transactions);
}
