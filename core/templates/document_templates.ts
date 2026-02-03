/**
 * Comprehensive Financial Document Template Library
 * Complete library covering all financial documents for analysis and error detection
 *
 * DOCUMENT CATEGORIES:
 * 1. Core Financial Statements
 * 2. Accounting Ledger System
 * 3. Revenue Documents
 * 4. Expense & Payables
 * 5. Banking & Cash
 * 6. Payroll & HR Financials
 * 7. Tax Documents
 * 8. Assets & Capital
 * 9. Investor & Equity
 * 10. Audit & Compliance
 * 11. Forensic / Investigation Files
 * 12. SEC & Public Company Filings
 */

// ============================================================================
// DOCUMENT TEMPLATE TYPES
// ============================================================================

export interface DocumentTemplate {
  id: string;
  name: string;
  aliases: string[];
  category: DocumentCategory;
  subcategory?: string;
  description: string;
  file_naming_convention: string;
  required_fields: FieldDefinition[];
  optional_fields: FieldDefinition[];
  validation_rules: ValidationRule[];
  error_checks: DocumentErrorCheck[];
  cross_references: CrossReference[];
  retention_period: string;
  regulatory_references?: string[];
}

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean' | 'array';
  description: string;
  required: boolean;
  format?: string;
  validation?: string;
}

export interface ValidationRule {
  rule_id: string;
  description: string;
  formula?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  error_type: string;
}

export interface DocumentErrorCheck {
  check_id: string;
  name: string;
  logic: string;
  red_flag_if_fails: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface CrossReference {
  document_type: string;
  relationship: 'must_match' | 'should_reconcile' | 'supports' | 'derived_from';
  fields_to_compare: string[];
}

export type DocumentCategory =
  | 'core_financial_statements'
  | 'accounting_ledger'
  | 'revenue'
  | 'expense_payables'
  | 'banking_cash'
  | 'payroll_hr'
  | 'tax'
  | 'assets_capital'
  | 'investor_equity'
  | 'audit_compliance'
  | 'forensic_investigation'
  | 'sec_filings';

// ============================================================================
// FILE NAMING CONVENTION
// ============================================================================

export const FILE_NAMING_CONVENTION = {
  format: '[ENTITY]_[YEAR]_[CATEGORY]_[SUBCATEGORY]_[DETAIL]_[VERSION]',
  examples: [
    'ACME_2025_GL_TrialBalance_PreAudit_v2.xlsx',
    'ACME_2025_TAX_1120_Filed.pdf',
    'ACME_2025_BANK_Chase_Statement_Jan.pdf',
    'ACME_2025_FS_BalanceSheet_Q4_Final.xlsx',
    'ACME_2025_AR_Aging_Dec31.xlsx',
  ],
  categories: {
    GL: 'General Ledger',
    FS: 'Financial Statements',
    TAX: 'Tax Documents',
    BANK: 'Banking & Cash',
    AR: 'Accounts Receivable',
    AP: 'Accounts Payable',
    PAY: 'Payroll',
    FA: 'Fixed Assets',
    INV: 'Inventory',
    EQ: 'Equity',
    AUDIT: 'Audit',
    SEC: 'SEC Filings',
    LEGAL: 'Legal/Contracts',
    FORENSIC: 'Forensic',
  },
};

// ============================================================================
// 1. CORE FINANCIAL STATEMENTS
// ============================================================================

export const CORE_FINANCIAL_STATEMENTS: DocumentTemplate[] = [
  {
    id: 'balance_sheet',
    name: 'Balance Sheet',
    aliases: ['Statement of Financial Position', 'Statement of Financial Condition'],
    category: 'core_financial_statements',
    description: 'Point-in-time snapshot of assets, liabilities, and equity',
    file_naming_convention: '[ENTITY]_[YEAR]_FS_BalanceSheet_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'report_date', type: 'date', description: 'As of date', required: true },
      { name: 'total_assets', type: 'currency', description: 'Total assets', required: true },
      { name: 'total_liabilities', type: 'currency', description: 'Total liabilities', required: true },
      { name: 'total_equity', type: 'currency', description: 'Total shareholders equity', required: true },
      { name: 'cash_and_equivalents', type: 'currency', description: 'Cash and cash equivalents', required: true },
      { name: 'accounts_receivable', type: 'currency', description: 'Net accounts receivable', required: true },
      { name: 'inventory', type: 'currency', description: 'Inventory', required: true },
      { name: 'property_plant_equipment', type: 'currency', description: 'Net PP&E', required: true },
      { name: 'accounts_payable', type: 'currency', description: 'Accounts payable', required: true },
      { name: 'long_term_debt', type: 'currency', description: 'Long-term debt', required: true },
      { name: 'retained_earnings', type: 'currency', description: 'Retained earnings', required: true },
    ],
    optional_fields: [
      { name: 'current_assets', type: 'currency', description: 'Total current assets', required: false },
      { name: 'current_liabilities', type: 'currency', description: 'Total current liabilities', required: false },
      { name: 'goodwill', type: 'currency', description: 'Goodwill', required: false },
      { name: 'intangible_assets', type: 'currency', description: 'Intangible assets', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'BS_BAL_001',
        description: 'Assets must equal Liabilities plus Equity',
        formula: 'total_assets === total_liabilities + total_equity',
        severity: 'critical',
        error_type: 'mathematical',
      },
      {
        rule_id: 'BS_CURR_001',
        description: 'Current assets should sum correctly',
        formula: 'current_assets === cash + ar + inventory + prepaid + other_current',
        severity: 'high',
        error_type: 'mathematical',
      },
    ],
    error_checks: [
      {
        check_id: 'BS_NEG_EQUITY',
        name: 'Negative Equity Check',
        logic: 'total_equity < 0 indicates potential going concern',
        red_flag_if_fails: true,
        severity: 'high',
      },
      {
        check_id: 'BS_NEG_CASH',
        name: 'Negative Cash Check',
        logic: 'cash_and_equivalents < 0 indicates error or overdraft',
        red_flag_if_fails: true,
        severity: 'critical',
      },
    ],
    cross_references: [
      { document_type: 'trial_balance', relationship: 'derived_from', fields_to_compare: ['all_accounts'] },
      { document_type: 'general_ledger', relationship: 'must_match', fields_to_compare: ['total_assets', 'total_liabilities'] },
      { document_type: 'bank_reconciliation', relationship: 'must_match', fields_to_compare: ['cash_and_equivalents'] },
    ],
    retention_period: '7 years',
    regulatory_references: ['ASC 210', 'SEC Regulation S-X'],
  },
  {
    id: 'income_statement',
    name: 'Income Statement',
    aliases: ['Profit & Loss Statement', 'P&L', 'Statement of Operations', 'Statement of Earnings'],
    category: 'core_financial_statements',
    description: 'Summary of revenues and expenses over a period',
    file_naming_convention: '[ENTITY]_[YEAR]_FS_IncomeStatement_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'period_start', type: 'date', description: 'Period start date', required: true },
      { name: 'period_end', type: 'date', description: 'Period end date', required: true },
      { name: 'net_revenue', type: 'currency', description: 'Net revenue/sales', required: true },
      { name: 'cost_of_goods_sold', type: 'currency', description: 'Cost of goods sold', required: true },
      { name: 'gross_profit', type: 'currency', description: 'Gross profit', required: true },
      { name: 'operating_expenses', type: 'currency', description: 'Total operating expenses', required: true },
      { name: 'operating_income', type: 'currency', description: 'Operating income (EBIT)', required: true },
      { name: 'interest_expense', type: 'currency', description: 'Interest expense', required: true },
      { name: 'income_before_tax', type: 'currency', description: 'Income before income taxes', required: true },
      { name: 'income_tax_expense', type: 'currency', description: 'Income tax expense', required: true },
      { name: 'net_income', type: 'currency', description: 'Net income', required: true },
    ],
    optional_fields: [
      { name: 'earnings_per_share', type: 'number', description: 'Basic EPS', required: false },
      { name: 'diluted_eps', type: 'number', description: 'Diluted EPS', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'IS_GP_001',
        description: 'Gross profit = Revenue - COGS',
        formula: 'gross_profit === net_revenue - cost_of_goods_sold',
        severity: 'critical',
        error_type: 'mathematical',
      },
      {
        rule_id: 'IS_NI_001',
        description: 'Net income calculation must be correct',
        formula: 'net_income === income_before_tax - income_tax_expense',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [
      {
        check_id: 'IS_NEG_REV',
        name: 'Negative Revenue',
        logic: 'net_revenue < 0 indicates reversal or error',
        red_flag_if_fails: true,
        severity: 'high',
      },
      {
        check_id: 'IS_ETR',
        name: 'Effective Tax Rate Reasonability',
        logic: 'income_tax_expense / income_before_tax should be 15-35% for US corps',
        red_flag_if_fails: false,
        severity: 'medium',
      },
    ],
    cross_references: [
      { document_type: 'trial_balance', relationship: 'derived_from', fields_to_compare: ['revenue_accounts', 'expense_accounts'] },
      { document_type: 'statement_of_equity', relationship: 'must_match', fields_to_compare: ['net_income'] },
    ],
    retention_period: '7 years',
    regulatory_references: ['ASC 220', 'SEC Regulation S-X'],
  },
  {
    id: 'cash_flow_statement',
    name: 'Cash Flow Statement',
    aliases: ['Statement of Cash Flows'],
    category: 'core_financial_statements',
    description: 'Sources and uses of cash over a period',
    file_naming_convention: '[ENTITY]_[YEAR]_FS_CashFlow_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'period_start', type: 'date', description: 'Period start date', required: true },
      { name: 'period_end', type: 'date', description: 'Period end date', required: true },
      { name: 'net_income', type: 'currency', description: 'Net income', required: true },
      { name: 'depreciation_amortization', type: 'currency', description: 'D&A add-back', required: true },
      { name: 'cash_from_operations', type: 'currency', description: 'Net cash from operating activities', required: true },
      { name: 'cash_from_investing', type: 'currency', description: 'Net cash from investing activities', required: true },
      { name: 'cash_from_financing', type: 'currency', description: 'Net cash from financing activities', required: true },
      { name: 'net_change_in_cash', type: 'currency', description: 'Net increase/decrease in cash', required: true },
      { name: 'beginning_cash', type: 'currency', description: 'Cash at beginning of period', required: true },
      { name: 'ending_cash', type: 'currency', description: 'Cash at end of period', required: true },
    ],
    optional_fields: [
      { name: 'capital_expenditures', type: 'currency', description: 'CapEx', required: false },
      { name: 'dividends_paid', type: 'currency', description: 'Dividends paid', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'CF_BAL_001',
        description: 'Cash reconciliation must balance',
        formula: 'beginning_cash + net_change_in_cash === ending_cash',
        severity: 'critical',
        error_type: 'mathematical',
      },
      {
        rule_id: 'CF_TOTAL_001',
        description: 'Total of three sections must equal net change',
        formula: 'cash_from_operations + cash_from_investing + cash_from_financing === net_change_in_cash',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [
      {
        check_id: 'CF_BS_MATCH',
        name: 'Ending Cash Matches Balance Sheet',
        logic: 'ending_cash === balance_sheet.cash_and_equivalents',
        red_flag_if_fails: true,
        severity: 'critical',
      },
    ],
    cross_references: [
      { document_type: 'balance_sheet', relationship: 'must_match', fields_to_compare: ['ending_cash'] },
      { document_type: 'income_statement', relationship: 'must_match', fields_to_compare: ['net_income'] },
    ],
    retention_period: '7 years',
    regulatory_references: ['ASC 230'],
  },
  {
    id: 'statement_of_equity',
    name: 'Statement of Changes in Equity',
    aliases: ['Shareholders\' Equity Statement', 'Statement of Stockholders\' Equity'],
    category: 'core_financial_statements',
    description: 'Changes in equity components over a period',
    file_naming_convention: '[ENTITY]_[YEAR]_FS_Equity_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'period_start', type: 'date', description: 'Period start date', required: true },
      { name: 'period_end', type: 'date', description: 'Period end date', required: true },
      { name: 'beginning_equity', type: 'currency', description: 'Beginning total equity', required: true },
      { name: 'net_income', type: 'currency', description: 'Net income for period', required: true },
      { name: 'dividends_declared', type: 'currency', description: 'Dividends declared', required: true },
      { name: 'stock_issued', type: 'currency', description: 'Stock issued', required: true },
      { name: 'treasury_stock', type: 'currency', description: 'Treasury stock purchased', required: true },
      { name: 'other_comprehensive_income', type: 'currency', description: 'OCI', required: true },
      { name: 'ending_equity', type: 'currency', description: 'Ending total equity', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'EQ_ROLL_001',
        description: 'Equity rollforward must reconcile',
        formula: 'beginning_equity + net_income - dividends_declared + stock_issued - treasury_stock + oci === ending_equity',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'balance_sheet', relationship: 'must_match', fields_to_compare: ['ending_equity'] },
      { document_type: 'income_statement', relationship: 'must_match', fields_to_compare: ['net_income'] },
    ],
    retention_period: '7 years',
    regulatory_references: ['ASC 505', 'ASC 220'],
  },
  {
    id: 'comprehensive_income',
    name: 'Statement of Comprehensive Income',
    aliases: ['OCI Statement'],
    category: 'core_financial_statements',
    description: 'Net income plus other comprehensive income items',
    file_naming_convention: '[ENTITY]_[YEAR]_FS_OCI_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'net_income', type: 'currency', description: 'Net income', required: true },
      { name: 'foreign_currency_translation', type: 'currency', description: 'Foreign currency translation', required: true },
      { name: 'pension_adjustments', type: 'currency', description: 'Pension adjustments', required: true },
      { name: 'unrealized_gains_losses', type: 'currency', description: 'Unrealized gains/losses on securities', required: true },
      { name: 'total_oci', type: 'currency', description: 'Total other comprehensive income', required: true },
      { name: 'comprehensive_income', type: 'currency', description: 'Total comprehensive income', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'OCI_001',
        description: 'Comprehensive income = Net income + OCI',
        formula: 'comprehensive_income === net_income + total_oci',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'income_statement', relationship: 'must_match', fields_to_compare: ['net_income'] },
      { document_type: 'statement_of_equity', relationship: 'must_match', fields_to_compare: ['other_comprehensive_income'] },
    ],
    retention_period: '7 years',
    regulatory_references: ['ASC 220'],
  },
  {
    id: 'financial_statement_footnotes',
    name: 'Financial Statement Footnotes',
    aliases: ['Notes to Financial Statements', 'Notes to FS'],
    category: 'core_financial_statements',
    description: 'Explanatory notes accompanying financial statements',
    file_naming_convention: '[ENTITY]_[YEAR]_FS_Notes_[PERIOD]_[VERSION].docx',
    required_fields: [
      { name: 'summary_of_policies', type: 'string', description: 'Summary of significant accounting policies', required: true },
      { name: 'revenue_recognition', type: 'string', description: 'Revenue recognition policy', required: true },
      { name: 'inventory_method', type: 'string', description: 'Inventory valuation method', required: true },
      { name: 'depreciation_method', type: 'string', description: 'Depreciation methods', required: true },
      { name: 'debt_schedule', type: 'string', description: 'Debt maturities schedule', required: true },
      { name: 'related_party_transactions', type: 'string', description: 'Related party disclosures', required: true },
      { name: 'commitments_contingencies', type: 'string', description: 'Commitments and contingencies', required: true },
      { name: 'subsequent_events', type: 'string', description: 'Subsequent events', required: true },
    ],
    optional_fields: [],
    validation_rules: [],
    error_checks: [
      {
        check_id: 'FN_COMPLETE',
        name: 'All Required Disclosures Present',
        logic: 'Check for all ASC/GAAP required disclosures',
        red_flag_if_fails: true,
        severity: 'high',
      },
    ],
    cross_references: [],
    retention_period: '7 years',
    regulatory_references: ['ASC 235', 'ASC 275', 'ASC 450', 'ASC 855'],
  },
];

// ============================================================================
// 2. ACCOUNTING LEDGER SYSTEM
// ============================================================================

export const ACCOUNTING_LEDGER_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'general_ledger',
    name: 'General Ledger',
    aliases: ['GL', 'Master Ledger'],
    category: 'accounting_ledger',
    description: 'Master accounting record containing all transactions by account',
    file_naming_convention: '[ENTITY]_[YEAR]_GL_Detail_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'account_number', type: 'string', description: 'Account number', required: true },
      { name: 'account_name', type: 'string', description: 'Account name', required: true },
      { name: 'transaction_date', type: 'date', description: 'Transaction date', required: true },
      { name: 'journal_entry_id', type: 'string', description: 'Journal entry reference', required: true },
      { name: 'debit', type: 'currency', description: 'Debit amount', required: true },
      { name: 'credit', type: 'currency', description: 'Credit amount', required: true },
      { name: 'balance', type: 'currency', description: 'Running balance', required: true },
      { name: 'description', type: 'string', description: 'Transaction description', required: true },
    ],
    optional_fields: [
      { name: 'source_document', type: 'string', description: 'Source document reference', required: false },
      { name: 'posted_by', type: 'string', description: 'User who posted', required: false },
      { name: 'posted_date', type: 'date', description: 'Date posted', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'GL_BAL_001',
        description: 'Running balance must be correct',
        formula: 'prior_balance + debit - credit === balance',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [
      {
        check_id: 'GL_DUP',
        name: 'Duplicate Entry Check',
        logic: 'Check for duplicate journal entry IDs',
        red_flag_if_fails: true,
        severity: 'high',
      },
    ],
    cross_references: [
      { document_type: 'trial_balance', relationship: 'derived_from', fields_to_compare: ['account_balances'] },
      { document_type: 'journal_entries', relationship: 'derived_from', fields_to_compare: ['all_entries'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'trial_balance',
    name: 'Trial Balance',
    aliases: ['TB', 'Working Trial Balance'],
    category: 'accounting_ledger',
    description: 'Summary of all account balances to verify debits equal credits',
    file_naming_convention: '[ENTITY]_[YEAR]_GL_TrialBalance_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'report_date', type: 'date', description: 'As of date', required: true },
      { name: 'account_number', type: 'string', description: 'Account number', required: true },
      { name: 'account_name', type: 'string', description: 'Account name', required: true },
      { name: 'debit_balance', type: 'currency', description: 'Debit balance', required: true },
      { name: 'credit_balance', type: 'currency', description: 'Credit balance', required: true },
    ],
    optional_fields: [
      { name: 'adjustments_dr', type: 'currency', description: 'Adjusting entries debit', required: false },
      { name: 'adjustments_cr', type: 'currency', description: 'Adjusting entries credit', required: false },
      { name: 'adjusted_dr', type: 'currency', description: 'Adjusted trial balance debit', required: false },
      { name: 'adjusted_cr', type: 'currency', description: 'Adjusted trial balance credit', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'TB_BAL_001',
        description: 'Total debits must equal total credits',
        formula: 'sum(debit_balance) === sum(credit_balance)',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [
      {
        check_id: 'TB_UNUSUAL',
        name: 'Unusual Balance Direction',
        logic: 'Asset/expense accounts with credits or liability/revenue with debits',
        red_flag_if_fails: true,
        severity: 'medium',
      },
    ],
    cross_references: [
      { document_type: 'general_ledger', relationship: 'derived_from', fields_to_compare: ['account_balances'] },
      { document_type: 'balance_sheet', relationship: 'supports', fields_to_compare: ['all_accounts'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'chart_of_accounts',
    name: 'Chart of Accounts',
    aliases: ['COA', 'Account Listing'],
    category: 'accounting_ledger',
    description: 'List of all accounts used in the accounting system',
    file_naming_convention: '[ENTITY]_[YEAR]_GL_ChartOfAccounts_[VERSION].xlsx',
    required_fields: [
      { name: 'account_number', type: 'string', description: 'Account number', required: true },
      { name: 'account_name', type: 'string', description: 'Account name', required: true },
      { name: 'account_type', type: 'string', description: 'Asset/Liability/Equity/Revenue/Expense', required: true },
      { name: 'normal_balance', type: 'string', description: 'Debit or Credit', required: true },
      { name: 'active', type: 'boolean', description: 'Active account flag', required: true },
    ],
    optional_fields: [
      { name: 'parent_account', type: 'string', description: 'Parent account for hierarchy', required: false },
      { name: 'tax_code', type: 'string', description: 'Tax reporting code', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'COA_UNIQUE',
        description: 'Account numbers must be unique',
        formula: 'unique(account_number) === count(account_number)',
        severity: 'critical',
        error_type: 'completeness',
      },
    ],
    error_checks: [],
    cross_references: [],
    retention_period: 'Permanent',
  },
  {
    id: 'journal_entries',
    name: 'Journal Entries',
    aliases: ['JEs', 'Accounting Entries'],
    category: 'accounting_ledger',
    description: 'Individual accounting records recording transactions',
    file_naming_convention: '[ENTITY]_[YEAR]_GL_JournalEntries_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'entry_id', type: 'string', description: 'Unique journal entry ID', required: true },
      { name: 'entry_date', type: 'date', description: 'Entry date', required: true },
      { name: 'account_number', type: 'string', description: 'Account number', required: true },
      { name: 'debit', type: 'currency', description: 'Debit amount', required: true },
      { name: 'credit', type: 'currency', description: 'Credit amount', required: true },
      { name: 'description', type: 'string', description: 'Entry description', required: true },
      { name: 'entry_type', type: 'string', description: 'Standard/Adjusting/Recurring', required: true },
    ],
    optional_fields: [
      { name: 'prepared_by', type: 'string', description: 'Preparer', required: false },
      { name: 'approved_by', type: 'string', description: 'Approver', required: false },
      { name: 'source_document', type: 'string', description: 'Supporting document', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'JE_BAL_001',
        description: 'Each entry must balance',
        formula: 'sum(debit) === sum(credit) for each entry_id',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [
      {
        check_id: 'JE_SOD',
        name: 'Segregation of Duties',
        logic: 'prepared_by !== approved_by',
        red_flag_if_fails: true,
        severity: 'high',
      },
      {
        check_id: 'JE_WEEKEND',
        name: 'Weekend Entry',
        logic: 'entry_date is Saturday or Sunday',
        red_flag_if_fails: false,
        severity: 'medium',
      },
    ],
    cross_references: [
      { document_type: 'general_ledger', relationship: 'supports', fields_to_compare: ['all_entries'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'subsidiary_ledgers',
    name: 'Subsidiary Ledgers',
    aliases: ['Subledgers', 'Detail Ledgers'],
    category: 'accounting_ledger',
    description: 'Detailed records supporting general ledger control accounts (AR, AP, Inventory)',
    file_naming_convention: '[ENTITY]_[YEAR]_GL_[SUBLEDGER]_Detail_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'subledger_type', type: 'string', description: 'AR/AP/Inventory/Fixed Assets', required: true },
      { name: 'control_account', type: 'string', description: 'GL control account', required: true },
      { name: 'detail_records', type: 'array', description: 'Individual detail records', required: true },
      { name: 'subledger_total', type: 'currency', description: 'Total of all detail', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'SUB_RECON',
        description: 'Subledger must reconcile to GL control account',
        formula: 'subledger_total === gl_control_balance',
        severity: 'critical',
        error_type: 'completeness',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'general_ledger', relationship: 'must_match', fields_to_compare: ['control_account_balance'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'general_journal',
    name: 'General Journal',
    aliases: ['GJ', 'Book of Original Entry'],
    category: 'accounting_ledger',
    description: 'Record of non-routine journal entries',
    file_naming_convention: '[ENTITY]_[YEAR]_GL_GeneralJournal_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'entry_id', type: 'string', description: 'Entry ID', required: true },
      { name: 'date', type: 'date', description: 'Entry date', required: true },
      { name: 'accounts', type: 'array', description: 'Accounts affected', required: true },
      { name: 'debits', type: 'array', description: 'Debit amounts', required: true },
      { name: 'credits', type: 'array', description: 'Credit amounts', required: true },
      { name: 'explanation', type: 'string', description: 'Entry explanation', required: true },
    ],
    optional_fields: [],
    validation_rules: [],
    error_checks: [],
    cross_references: [
      { document_type: 'general_ledger', relationship: 'supports', fields_to_compare: ['entries'] },
    ],
    retention_period: '7 years',
  },
];

// ============================================================================
// 3. REVENUE DOCUMENTS
// ============================================================================

export const REVENUE_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'sales_invoice',
    name: 'Sales Invoice',
    aliases: ['Invoice', 'Customer Invoice'],
    category: 'revenue',
    description: 'Document billing customer for goods or services',
    file_naming_convention: '[ENTITY]_[YEAR]_REV_Invoice_[INVOICENO]_[VERSION].pdf',
    required_fields: [
      { name: 'invoice_number', type: 'string', description: 'Unique invoice number', required: true },
      { name: 'invoice_date', type: 'date', description: 'Invoice date', required: true },
      { name: 'customer_name', type: 'string', description: 'Customer name', required: true },
      { name: 'customer_id', type: 'string', description: 'Customer ID', required: true },
      { name: 'line_items', type: 'array', description: 'Invoice line items', required: true },
      { name: 'subtotal', type: 'currency', description: 'Subtotal before tax', required: true },
      { name: 'tax_amount', type: 'currency', description: 'Sales tax', required: true },
      { name: 'total_amount', type: 'currency', description: 'Total invoice amount', required: true },
      { name: 'due_date', type: 'date', description: 'Payment due date', required: true },
      { name: 'payment_terms', type: 'string', description: 'Payment terms (Net 30, etc.)', required: true },
    ],
    optional_fields: [
      { name: 'po_number', type: 'string', description: 'Customer PO number', required: false },
      { name: 'ship_date', type: 'date', description: 'Shipment date', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'INV_TOTAL',
        description: 'Total must equal subtotal plus tax',
        formula: 'total_amount === subtotal + tax_amount',
        severity: 'high',
        error_type: 'mathematical',
      },
    ],
    error_checks: [
      {
        check_id: 'INV_DUP',
        name: 'Duplicate Invoice Number',
        logic: 'invoice_number must be unique',
        red_flag_if_fails: true,
        severity: 'high',
      },
    ],
    cross_references: [
      { document_type: 'ar_aging', relationship: 'must_match', fields_to_compare: ['invoice_amount'] },
      { document_type: 'sales_order', relationship: 'derived_from', fields_to_compare: ['line_items'] },
    ],
    retention_period: '7 years',
    regulatory_references: ['ASC 606'],
  },
  {
    id: 'customer_contract',
    name: 'Customer Contract',
    aliases: ['Sales Agreement', 'Service Agreement'],
    category: 'revenue',
    description: 'Agreement with customer defining terms of sale',
    file_naming_convention: '[ENTITY]_[YEAR]_REV_Contract_[CUSTOMER]_[VERSION].pdf',
    required_fields: [
      { name: 'contract_id', type: 'string', description: 'Contract ID', required: true },
      { name: 'customer_name', type: 'string', description: 'Customer name', required: true },
      { name: 'effective_date', type: 'date', description: 'Contract start date', required: true },
      { name: 'termination_date', type: 'date', description: 'Contract end date', required: true },
      { name: 'contract_value', type: 'currency', description: 'Total contract value', required: true },
      { name: 'performance_obligations', type: 'array', description: 'Performance obligations', required: true },
      { name: 'payment_terms', type: 'string', description: 'Payment terms', required: true },
    ],
    optional_fields: [],
    validation_rules: [],
    error_checks: [],
    cross_references: [
      { document_type: 'revenue_recognition_schedule', relationship: 'supports', fields_to_compare: ['contract_value'] },
    ],
    retention_period: '7 years after expiration',
    regulatory_references: ['ASC 606'],
  },
  {
    id: 'revenue_recognition_schedule',
    name: 'Revenue Recognition Schedule',
    aliases: ['Rev Rec Schedule'],
    category: 'revenue',
    description: 'Schedule showing revenue recognition over time',
    file_naming_convention: '[ENTITY]_[YEAR]_REV_RevRecSchedule_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'contract_id', type: 'string', description: 'Contract reference', required: true },
      { name: 'total_contract_value', type: 'currency', description: 'Total value', required: true },
      { name: 'recognition_periods', type: 'array', description: 'Period-by-period recognition', required: true },
      { name: 'recognized_to_date', type: 'currency', description: 'Cumulative revenue recognized', required: true },
      { name: 'deferred_revenue', type: 'currency', description: 'Remaining deferred revenue', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'REV_REC_001',
        description: 'Recognized plus deferred must equal total',
        formula: 'recognized_to_date + deferred_revenue === total_contract_value',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'balance_sheet', relationship: 'must_match', fields_to_compare: ['deferred_revenue'] },
    ],
    retention_period: '7 years',
    regulatory_references: ['ASC 606'],
  },
  {
    id: 'deferred_revenue_report',
    name: 'Deferred Revenue Report',
    aliases: ['Unearned Revenue Report'],
    category: 'revenue',
    description: 'Report of revenue received but not yet earned',
    file_naming_convention: '[ENTITY]_[YEAR]_REV_DeferredRevenue_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'report_date', type: 'date', description: 'As of date', required: true },
      { name: 'customer_id', type: 'string', description: 'Customer ID', required: true },
      { name: 'contract_id', type: 'string', description: 'Contract ID', required: true },
      { name: 'deferred_balance', type: 'currency', description: 'Deferred revenue balance', required: true },
      { name: 'expected_recognition_date', type: 'date', description: 'Expected recognition date', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'DEF_REV_001',
        description: 'Total must match balance sheet',
        formula: 'sum(deferred_balance) === balance_sheet.deferred_revenue',
        severity: 'critical',
        error_type: 'completeness',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'balance_sheet', relationship: 'must_match', fields_to_compare: ['deferred_revenue'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'ar_aging',
    name: 'AR Aging Report',
    aliases: ['Accounts Receivable Aging', 'AR Aging Schedule'],
    category: 'revenue',
    description: 'Analysis of accounts receivable by age bucket',
    file_naming_convention: '[ENTITY]_[YEAR]_AR_Aging_[DATE]_[VERSION].xlsx',
    required_fields: [
      { name: 'report_date', type: 'date', description: 'As of date', required: true },
      { name: 'customer_id', type: 'string', description: 'Customer ID', required: true },
      { name: 'customer_name', type: 'string', description: 'Customer name', required: true },
      { name: 'current_0_30', type: 'currency', description: 'Current (0-30 days)', required: true },
      { name: 'days_31_60', type: 'currency', description: '31-60 days', required: true },
      { name: 'days_61_90', type: 'currency', description: '61-90 days', required: true },
      { name: 'over_90', type: 'currency', description: 'Over 90 days', required: true },
      { name: 'total', type: 'currency', description: 'Total AR', required: true },
    ],
    optional_fields: [
      { name: 'credit_balance', type: 'currency', description: 'Credit balances', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'AR_SUM_001',
        description: 'Buckets must sum to total',
        formula: 'current + 31_60 + 61_90 + over_90 === total',
        severity: 'critical',
        error_type: 'mathematical',
      },
      {
        rule_id: 'AR_GL_001',
        description: 'Total must match GL',
        formula: 'sum(total) === gl_ar_balance',
        severity: 'critical',
        error_type: 'completeness',
      },
    ],
    error_checks: [
      {
        check_id: 'AR_CONC',
        name: 'Customer Concentration',
        logic: 'Single customer > 10% of total AR',
        red_flag_if_fails: false,
        severity: 'medium',
      },
    ],
    cross_references: [
      { document_type: 'balance_sheet', relationship: 'must_match', fields_to_compare: ['accounts_receivable'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'sales_order',
    name: 'Sales Order',
    aliases: ['SO', 'Order'],
    category: 'revenue',
    description: 'Customer order document',
    file_naming_convention: '[ENTITY]_[YEAR]_REV_SalesOrder_[ORDERNO]_[VERSION].pdf',
    required_fields: [
      { name: 'order_number', type: 'string', description: 'Order number', required: true },
      { name: 'order_date', type: 'date', description: 'Order date', required: true },
      { name: 'customer_id', type: 'string', description: 'Customer ID', required: true },
      { name: 'line_items', type: 'array', description: 'Order line items', required: true },
      { name: 'order_total', type: 'currency', description: 'Order total', required: true },
      { name: 'status', type: 'string', description: 'Order status', required: true },
    ],
    optional_fields: [],
    validation_rules: [],
    error_checks: [],
    cross_references: [
      { document_type: 'sales_invoice', relationship: 'supports', fields_to_compare: ['line_items'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'credit_memo',
    name: 'Credit Memo',
    aliases: ['Credit Note'],
    category: 'revenue',
    description: 'Document reducing customer account balance',
    file_naming_convention: '[ENTITY]_[YEAR]_REV_CreditMemo_[MEMONO]_[VERSION].pdf',
    required_fields: [
      { name: 'memo_number', type: 'string', description: 'Credit memo number', required: true },
      { name: 'memo_date', type: 'date', description: 'Date issued', required: true },
      { name: 'customer_id', type: 'string', description: 'Customer ID', required: true },
      { name: 'original_invoice', type: 'string', description: 'Original invoice reference', required: true },
      { name: 'credit_amount', type: 'currency', description: 'Credit amount', required: true },
      { name: 'reason', type: 'string', description: 'Reason for credit', required: true },
    ],
    optional_fields: [],
    validation_rules: [],
    error_checks: [
      {
        check_id: 'CM_LIMIT',
        name: 'Credit Memo Exceeds Invoice',
        logic: 'credit_amount > original_invoice_amount',
        red_flag_if_fails: true,
        severity: 'high',
      },
    ],
    cross_references: [
      { document_type: 'sales_invoice', relationship: 'derived_from', fields_to_compare: ['original_invoice'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'sales_tax_report',
    name: 'Sales Tax Report',
    aliases: ['Sales Tax Return'],
    category: 'revenue',
    description: 'Report of sales tax collected and remitted',
    file_naming_convention: '[ENTITY]_[YEAR]_TAX_SalesTax_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'period', type: 'string', description: 'Reporting period', required: true },
      { name: 'jurisdiction', type: 'string', description: 'Tax jurisdiction', required: true },
      { name: 'gross_sales', type: 'currency', description: 'Gross sales', required: true },
      { name: 'exempt_sales', type: 'currency', description: 'Exempt sales', required: true },
      { name: 'taxable_sales', type: 'currency', description: 'Taxable sales', required: true },
      { name: 'tax_rate', type: 'percentage', description: 'Tax rate', required: true },
      { name: 'tax_collected', type: 'currency', description: 'Tax collected', required: true },
      { name: 'tax_due', type: 'currency', description: 'Tax due', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'ST_CALC',
        description: 'Tax calculation must be correct',
        formula: 'taxable_sales * tax_rate === tax_collected (within rounding)',
        severity: 'high',
        error_type: 'mathematical',
      },
    ],
    error_checks: [],
    cross_references: [],
    retention_period: '7 years',
  },
];

// ============================================================================
// 4. EXPENSE & PAYABLES
// ============================================================================

export const EXPENSE_PAYABLES_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'vendor_invoice',
    name: 'Vendor Invoice',
    aliases: ['Purchase Invoice', 'Bill'],
    category: 'expense_payables',
    description: 'Invoice received from vendor for goods or services',
    file_naming_convention: '[ENTITY]_[YEAR]_AP_Invoice_[VENDOR]_[INVNO]_[VERSION].pdf',
    required_fields: [
      { name: 'invoice_number', type: 'string', description: 'Vendor invoice number', required: true },
      { name: 'vendor_id', type: 'string', description: 'Vendor ID', required: true },
      { name: 'vendor_name', type: 'string', description: 'Vendor name', required: true },
      { name: 'invoice_date', type: 'date', description: 'Invoice date', required: true },
      { name: 'due_date', type: 'date', description: 'Payment due date', required: true },
      { name: 'line_items', type: 'array', description: 'Invoice line items', required: true },
      { name: 'total_amount', type: 'currency', description: 'Total amount', required: true },
      { name: 'gl_coding', type: 'array', description: 'GL account coding', required: true },
    ],
    optional_fields: [
      { name: 'po_reference', type: 'string', description: 'Purchase order reference', required: false },
      { name: 'approved_by', type: 'string', description: 'Approver', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'VI_3WAY',
        description: 'Three-way match: Invoice, PO, Receiving',
        formula: 'invoice_amount === po_amount === receiving_amount',
        severity: 'high',
        error_type: 'completeness',
      },
    ],
    error_checks: [
      {
        check_id: 'VI_DUP',
        name: 'Duplicate Invoice',
        logic: 'Same vendor + invoice number already paid',
        red_flag_if_fails: true,
        severity: 'critical',
      },
    ],
    cross_references: [
      { document_type: 'purchase_order', relationship: 'must_match', fields_to_compare: ['line_items', 'amounts'] },
      { document_type: 'ap_aging', relationship: 'must_match', fields_to_compare: ['invoice_amount'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'expense_report',
    name: 'Expense Report',
    aliases: ['T&E Report', 'Travel Expense Report'],
    category: 'expense_payables',
    description: 'Employee expense reimbursement request',
    file_naming_convention: '[ENTITY]_[YEAR]_EXP_ExpenseReport_[EMPLOYEE]_[DATE]_[VERSION].pdf',
    required_fields: [
      { name: 'report_id', type: 'string', description: 'Report ID', required: true },
      { name: 'employee_id', type: 'string', description: 'Employee ID', required: true },
      { name: 'employee_name', type: 'string', description: 'Employee name', required: true },
      { name: 'report_date', type: 'date', description: 'Report date', required: true },
      { name: 'expenses', type: 'array', description: 'Individual expenses', required: true },
      { name: 'total_amount', type: 'currency', description: 'Total reimbursable', required: true },
      { name: 'business_purpose', type: 'string', description: 'Business purpose', required: true },
      { name: 'approved_by', type: 'string', description: 'Approver', required: true },
    ],
    optional_fields: [
      { name: 'receipts_attached', type: 'boolean', description: 'Receipts attached flag', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'EXP_RECEIPT',
        description: 'Expenses over $25 require receipts',
        formula: 'if expense > 25 then receipt required',
        severity: 'high',
        error_type: 'completeness',
      },
    ],
    error_checks: [
      {
        check_id: 'EXP_POLICY',
        name: 'Policy Compliance',
        logic: 'Check against company expense policy limits',
        red_flag_if_fails: false,
        severity: 'medium',
      },
    ],
    cross_references: [],
    retention_period: '7 years',
    regulatory_references: ['IRC 162', 'IRC 274'],
  },
  {
    id: 'purchase_order',
    name: 'Purchase Order',
    aliases: ['PO'],
    category: 'expense_payables',
    description: 'Authorization to purchase goods or services',
    file_naming_convention: '[ENTITY]_[YEAR]_AP_PO_[PONO]_[VERSION].pdf',
    required_fields: [
      { name: 'po_number', type: 'string', description: 'PO number', required: true },
      { name: 'po_date', type: 'date', description: 'PO date', required: true },
      { name: 'vendor_id', type: 'string', description: 'Vendor ID', required: true },
      { name: 'line_items', type: 'array', description: 'Order line items', required: true },
      { name: 'total_amount', type: 'currency', description: 'Total amount', required: true },
      { name: 'approved_by', type: 'string', description: 'Approver', required: true },
      { name: 'status', type: 'string', description: 'PO status', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'PO_LIMIT',
        description: 'PO within approval limits',
        formula: 'total_amount <= approver_limit',
        severity: 'high',
        error_type: 'authorization',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'vendor_invoice', relationship: 'must_match', fields_to_compare: ['line_items', 'amounts'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'ap_aging',
    name: 'AP Aging Report',
    aliases: ['Accounts Payable Aging'],
    category: 'expense_payables',
    description: 'Analysis of accounts payable by age bucket',
    file_naming_convention: '[ENTITY]_[YEAR]_AP_Aging_[DATE]_[VERSION].xlsx',
    required_fields: [
      { name: 'report_date', type: 'date', description: 'As of date', required: true },
      { name: 'vendor_id', type: 'string', description: 'Vendor ID', required: true },
      { name: 'vendor_name', type: 'string', description: 'Vendor name', required: true },
      { name: 'current_0_30', type: 'currency', description: 'Current (0-30 days)', required: true },
      { name: 'days_31_60', type: 'currency', description: '31-60 days', required: true },
      { name: 'days_61_90', type: 'currency', description: '61-90 days', required: true },
      { name: 'over_90', type: 'currency', description: 'Over 90 days', required: true },
      { name: 'total', type: 'currency', description: 'Total AP', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'AP_SUM',
        description: 'Buckets must sum to total',
        formula: 'current + 31_60 + 61_90 + over_90 === total',
        severity: 'critical',
        error_type: 'mathematical',
      },
      {
        rule_id: 'AP_GL',
        description: 'Total must match GL',
        formula: 'sum(total) === gl_ap_balance',
        severity: 'critical',
        error_type: 'completeness',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'balance_sheet', relationship: 'must_match', fields_to_compare: ['accounts_payable'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'check_register',
    name: 'Check Register',
    aliases: ['Disbursement Register', 'Check Log'],
    category: 'expense_payables',
    description: 'Record of all checks issued',
    file_naming_convention: '[ENTITY]_[YEAR]_AP_CheckRegister_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'check_number', type: 'string', description: 'Check number', required: true },
      { name: 'check_date', type: 'date', description: 'Check date', required: true },
      { name: 'payee', type: 'string', description: 'Payee name', required: true },
      { name: 'amount', type: 'currency', description: 'Check amount', required: true },
      { name: 'status', type: 'string', description: 'Cleared/Outstanding/Void', required: true },
      { name: 'bank_account', type: 'string', description: 'Bank account', required: true },
    ],
    optional_fields: [
      { name: 'cleared_date', type: 'date', description: 'Date cleared', required: false },
      { name: 'invoice_reference', type: 'string', description: 'Invoice paid', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'CHK_SEQ',
        description: 'Check numbers should be sequential',
        formula: 'No gaps in check number sequence',
        severity: 'medium',
        error_type: 'completeness',
      },
    ],
    error_checks: [
      {
        check_id: 'CHK_VOID',
        name: 'Voided Check Review',
        logic: 'High volume of voided checks',
        red_flag_if_fails: false,
        severity: 'medium',
      },
    ],
    cross_references: [
      { document_type: 'bank_reconciliation', relationship: 'must_match', fields_to_compare: ['outstanding_checks'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'payment_authorization',
    name: 'Payment Authorization',
    aliases: ['Payment Approval'],
    category: 'expense_payables',
    description: 'Authorization document for payment',
    file_naming_convention: '[ENTITY]_[YEAR]_AP_PayAuth_[DATE]_[BATCHNO]_[VERSION].pdf',
    required_fields: [
      { name: 'batch_id', type: 'string', description: 'Payment batch ID', required: true },
      { name: 'payment_date', type: 'date', description: 'Payment date', required: true },
      { name: 'payments', type: 'array', description: 'List of payments', required: true },
      { name: 'total_amount', type: 'currency', description: 'Total payment amount', required: true },
      { name: 'prepared_by', type: 'string', description: 'Preparer', required: true },
      { name: 'approved_by', type: 'string', description: 'Approver', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'PA_SOD',
        description: 'Segregation of duties',
        formula: 'prepared_by !== approved_by',
        severity: 'high',
        error_type: 'authorization',
      },
    ],
    error_checks: [],
    cross_references: [],
    retention_period: '7 years',
  },
];

// ============================================================================
// 5. BANKING & CASH
// ============================================================================

export const BANKING_CASH_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'bank_statement',
    name: 'Bank Statement',
    aliases: ['Bank Account Statement'],
    category: 'banking_cash',
    description: 'Monthly statement from financial institution',
    file_naming_convention: '[ENTITY]_[YEAR]_BANK_[BANKNAME]_Statement_[PERIOD]_[VERSION].pdf',
    required_fields: [
      { name: 'account_number', type: 'string', description: 'Bank account number', required: true },
      { name: 'bank_name', type: 'string', description: 'Bank name', required: true },
      { name: 'statement_period', type: 'string', description: 'Statement period', required: true },
      { name: 'beginning_balance', type: 'currency', description: 'Beginning balance', required: true },
      { name: 'ending_balance', type: 'currency', description: 'Ending balance', required: true },
      { name: 'deposits', type: 'currency', description: 'Total deposits', required: true },
      { name: 'withdrawals', type: 'currency', description: 'Total withdrawals', required: true },
      { name: 'transactions', type: 'array', description: 'Transaction list', required: true },
    ],
    optional_fields: [
      { name: 'interest_earned', type: 'currency', description: 'Interest earned', required: false },
      { name: 'fees', type: 'currency', description: 'Bank fees', required: false },
    ],
    validation_rules: [
      {
        rule_id: 'BANK_BAL',
        description: 'Beginning + deposits - withdrawals = ending',
        formula: 'beginning_balance + deposits - withdrawals === ending_balance',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'bank_reconciliation', relationship: 'must_match', fields_to_compare: ['ending_balance'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'bank_reconciliation',
    name: 'Bank Reconciliation',
    aliases: ['Bank Rec', 'Cash Reconciliation'],
    category: 'banking_cash',
    description: 'Reconciliation of bank balance to book balance',
    file_naming_convention: '[ENTITY]_[YEAR]_BANK_[BANKNAME]_Reconciliation_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'reconciliation_date', type: 'date', description: 'As of date', required: true },
      { name: 'bank_balance', type: 'currency', description: 'Bank statement balance', required: true },
      { name: 'deposits_in_transit', type: 'currency', description: 'Deposits in transit', required: true },
      { name: 'outstanding_checks', type: 'currency', description: 'Outstanding checks', required: true },
      { name: 'adjusted_bank_balance', type: 'currency', description: 'Adjusted bank balance', required: true },
      { name: 'book_balance', type: 'currency', description: 'GL book balance', required: true },
      { name: 'book_adjustments', type: 'currency', description: 'Book adjustments (fees, interest)', required: true },
      { name: 'adjusted_book_balance', type: 'currency', description: 'Adjusted book balance', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'RECON_MATCH',
        description: 'Adjusted bank must equal adjusted book',
        formula: 'adjusted_bank_balance === adjusted_book_balance',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [
      {
        check_id: 'RECON_STALE',
        name: 'Stale Dated Items',
        logic: 'Outstanding checks or deposits > 90 days old',
        red_flag_if_fails: false,
        severity: 'medium',
      },
    ],
    cross_references: [
      { document_type: 'bank_statement', relationship: 'must_match', fields_to_compare: ['bank_balance'] },
      { document_type: 'balance_sheet', relationship: 'must_match', fields_to_compare: ['adjusted_book_balance'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'cash_receipts_log',
    name: 'Cash Receipts Log',
    aliases: ['Cash Receipts Journal', 'Daily Cash Report'],
    category: 'banking_cash',
    description: 'Record of all cash receipts',
    file_naming_convention: '[ENTITY]_[YEAR]_CASH_Receipts_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'receipt_date', type: 'date', description: 'Receipt date', required: true },
      { name: 'receipt_number', type: 'string', description: 'Receipt number', required: true },
      { name: 'source', type: 'string', description: 'Source (customer, etc.)', required: true },
      { name: 'payment_method', type: 'string', description: 'Cash/Check/Wire/ACH', required: true },
      { name: 'amount', type: 'currency', description: 'Amount received', required: true },
      { name: 'deposit_date', type: 'date', description: 'Date deposited', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'CR_DEP',
        description: 'Receipts should be deposited within 3 business days',
        formula: 'deposit_date - receipt_date <= 3 business days',
        severity: 'medium',
        error_type: 'timing',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'bank_statement', relationship: 'should_reconcile', fields_to_compare: ['deposits'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'cash_disbursement_log',
    name: 'Cash Disbursement Log',
    aliases: ['Cash Disbursements Journal'],
    category: 'banking_cash',
    description: 'Record of all cash disbursements',
    file_naming_convention: '[ENTITY]_[YEAR]_CASH_Disbursements_[PERIOD]_[VERSION].xlsx',
    required_fields: [
      { name: 'disbursement_date', type: 'date', description: 'Disbursement date', required: true },
      { name: 'check_number', type: 'string', description: 'Check/reference number', required: true },
      { name: 'payee', type: 'string', description: 'Payee', required: true },
      { name: 'payment_method', type: 'string', description: 'Check/Wire/ACH', required: true },
      { name: 'amount', type: 'currency', description: 'Amount paid', required: true },
      { name: 'gl_account', type: 'string', description: 'GL account coded', required: true },
    ],
    optional_fields: [],
    validation_rules: [],
    error_checks: [
      {
        check_id: 'CD_AUTH',
        name: 'Authorization',
        logic: 'All disbursements have proper authorization',
        red_flag_if_fails: true,
        severity: 'high',
      },
    ],
    cross_references: [
      { document_type: 'bank_statement', relationship: 'should_reconcile', fields_to_compare: ['withdrawals'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'wire_confirmation',
    name: 'Wire Transfer Confirmation',
    aliases: ['Wire Confirmation'],
    category: 'banking_cash',
    description: 'Confirmation of wire transfer',
    file_naming_convention: '[ENTITY]_[YEAR]_BANK_Wire_[DATE]_[REFNO]_[VERSION].pdf',
    required_fields: [
      { name: 'wire_date', type: 'date', description: 'Wire date', required: true },
      { name: 'reference_number', type: 'string', description: 'Wire reference number', required: true },
      { name: 'sending_bank', type: 'string', description: 'Sending bank', required: true },
      { name: 'receiving_bank', type: 'string', description: 'Receiving bank', required: true },
      { name: 'beneficiary', type: 'string', description: 'Beneficiary name', required: true },
      { name: 'amount', type: 'currency', description: 'Wire amount', required: true },
      { name: 'currency', type: 'string', description: 'Currency', required: true },
    ],
    optional_fields: [
      { name: 'purpose', type: 'string', description: 'Purpose of wire', required: false },
    ],
    validation_rules: [],
    error_checks: [
      {
        check_id: 'WIRE_DUAL',
        name: 'Dual Authorization',
        logic: 'Wires over threshold require dual authorization',
        red_flag_if_fails: true,
        severity: 'high',
      },
    ],
    cross_references: [
      { document_type: 'bank_statement', relationship: 'should_reconcile', fields_to_compare: ['amount'] },
    ],
    retention_period: '7 years',
  },
  {
    id: 'deposit_slip',
    name: 'Deposit Slip',
    aliases: ['Bank Deposit', 'Deposit Ticket'],
    category: 'banking_cash',
    description: 'Record of bank deposit',
    file_naming_convention: '[ENTITY]_[YEAR]_BANK_Deposit_[DATE]_[SLIPNO]_[VERSION].pdf',
    required_fields: [
      { name: 'deposit_date', type: 'date', description: 'Deposit date', required: true },
      { name: 'deposit_slip_number', type: 'string', description: 'Deposit slip number', required: true },
      { name: 'bank_account', type: 'string', description: 'Bank account', required: true },
      { name: 'cash_amount', type: 'currency', description: 'Cash deposited', required: true },
      { name: 'check_amount', type: 'currency', description: 'Checks deposited', required: true },
      { name: 'total_deposit', type: 'currency', description: 'Total deposit', required: true },
      { name: 'check_details', type: 'array', description: 'Individual check details', required: true },
    ],
    optional_fields: [],
    validation_rules: [
      {
        rule_id: 'DEP_TOTAL',
        description: 'Cash + Checks = Total',
        formula: 'cash_amount + check_amount === total_deposit',
        severity: 'critical',
        error_type: 'mathematical',
      },
    ],
    error_checks: [],
    cross_references: [
      { document_type: 'cash_receipts_log', relationship: 'must_match', fields_to_compare: ['amounts'] },
    ],
    retention_period: '7 years',
  },
];

// ============================================================================
// Continue with remaining categories...
// ============================================================================

// Export all templates
export const ALL_DOCUMENT_TEMPLATES: Record<DocumentCategory, DocumentTemplate[]> = {
  core_financial_statements: CORE_FINANCIAL_STATEMENTS,
  accounting_ledger: ACCOUNTING_LEDGER_TEMPLATES,
  revenue: REVENUE_TEMPLATES,
  expense_payables: EXPENSE_PAYABLES_TEMPLATES,
  banking_cash: BANKING_CASH_TEMPLATES,
  payroll_hr: [], // To be continued in next file
  tax: [],
  assets_capital: [],
  investor_equity: [],
  audit_compliance: [],
  forensic_investigation: [],
  sec_filings: [],
};

// Helper functions
export function getTemplateById(id: string): DocumentTemplate | undefined {
  for (const category of Object.values(ALL_DOCUMENT_TEMPLATES)) {
    const template = category.find(t => t.id === id);
    if (template) return template;
  }
  return undefined;
}

export function getTemplatesByCategory(category: DocumentCategory): DocumentTemplate[] {
  return ALL_DOCUMENT_TEMPLATES[category] || [];
}

export function getAllTemplateIds(): string[] {
  return Object.values(ALL_DOCUMENT_TEMPLATES)
    .flat()
    .map(t => t.id);
}

export function searchTemplates(searchTerm: string): DocumentTemplate[] {
  const term = searchTerm.toLowerCase();
  return Object.values(ALL_DOCUMENT_TEMPLATES)
    .flat()
    .filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.aliases.some(a => a.toLowerCase().includes(term)) ||
      t.description.toLowerCase().includes(term)
    );
}
