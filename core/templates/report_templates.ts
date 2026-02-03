/**
 * Financial Report Error Detection Templates
 * Comprehensive library for highlighting errors in financial reports
 */

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface ErrorHighlight {
  location: string;
  line_item: string;
  reported_value: number | string;
  expected_value?: number | string;
  variance?: number;
  variance_percent?: number;
  error_type: ErrorType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  irc_reference?: string;
  gaap_reference?: string;
  consequence?: string;
  recommended_action: string;
}

export type ErrorType =
  | 'mathematical'
  | 'classification'
  | 'timing'
  | 'valuation'
  | 'disclosure'
  | 'omission'
  | 'duplication'
  | 'cutoff'
  | 'completeness'
  | 'existence'
  | 'rights_obligations'
  | 'presentation'
  | 'tax_position'
  | 'fraud_indicator';

export interface ReportTemplate {
  name: string;
  category: string;
  sections: TemplateSection[];
  error_checks: ErrorCheck[];
  output_format: string;
}

export interface TemplateSection {
  name: string;
  line_items: string[];
  validation_rules: ValidationRule[];
}

export interface ValidationRule {
  rule_id: string;
  description: string;
  formula?: string;
  tolerance?: number;
  error_if_fails: ErrorType;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ErrorCheck {
  check_id: string;
  name: string;
  applies_to: string[];
  logic: string;
  irc_reference?: string;
  gaap_reference?: string;
}

// ============================================================================
// BALANCE SHEET TEMPLATE
// ============================================================================

export const BALANCE_SHEET_TEMPLATE: ReportTemplate = {
  name: 'Balance Sheet Error Detection',
  category: 'financial_statement',
  sections: [
    {
      name: 'Current Assets',
      line_items: [
        'Cash and Cash Equivalents',
        'Accounts Receivable',
        'Allowance for Doubtful Accounts',
        'Inventory',
        'Prepaid Expenses',
        'Other Current Assets',
      ],
      validation_rules: [
        {
          rule_id: 'CA001',
          description: 'Cash must be positive or zero',
          formula: 'cash >= 0',
          error_if_fails: 'existence',
          severity: 'critical',
        },
        {
          rule_id: 'CA002',
          description: 'Allowance for doubtful accounts should be contra (negative or zero)',
          formula: 'allowance <= 0',
          error_if_fails: 'classification',
          severity: 'high',
        },
        {
          rule_id: 'CA003',
          description: 'Net receivables = Gross AR - Allowance',
          formula: 'net_ar = gross_ar - allowance',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
        {
          rule_id: 'CA004',
          description: 'Inventory should not exceed 80% of current assets',
          formula: 'inventory / total_current_assets < 0.80',
          error_if_fails: 'valuation',
          severity: 'medium',
        },
      ],
    },
    {
      name: 'Non-Current Assets',
      line_items: [
        'Property, Plant & Equipment (Gross)',
        'Accumulated Depreciation',
        'Net PP&E',
        'Intangible Assets',
        'Goodwill',
        'Long-term Investments',
        'Other Non-Current Assets',
      ],
      validation_rules: [
        {
          rule_id: 'NCA001',
          description: 'Accumulated depreciation must be contra (negative or zero)',
          formula: 'accum_depr <= 0',
          error_if_fails: 'classification',
          severity: 'high',
        },
        {
          rule_id: 'NCA002',
          description: 'Net PP&E = Gross PP&E + Accumulated Depreciation',
          formula: 'net_ppe = gross_ppe + accum_depr',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'NCA003',
          description: 'Accumulated depreciation should not exceed gross PP&E',
          formula: 'Math.abs(accum_depr) <= gross_ppe',
          error_if_fails: 'valuation',
          severity: 'critical',
        },
      ],
    },
    {
      name: 'Current Liabilities',
      line_items: [
        'Accounts Payable',
        'Accrued Expenses',
        'Short-term Debt',
        'Current Portion of Long-term Debt',
        'Deferred Revenue',
        'Income Taxes Payable',
        'Other Current Liabilities',
      ],
      validation_rules: [
        {
          rule_id: 'CL001',
          description: 'Liabilities should be positive (credit balance)',
          formula: 'total_current_liab >= 0',
          error_if_fails: 'classification',
          severity: 'high',
        },
        {
          rule_id: 'CL002',
          description: 'Current portion of LTD must equal sum from debt schedule',
          formula: 'cpltd = debt_schedule_current',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Non-Current Liabilities',
      line_items: [
        'Long-term Debt',
        'Deferred Tax Liability',
        'Pension Obligations',
        'Lease Liabilities',
        'Other Non-Current Liabilities',
      ],
      validation_rules: [
        {
          rule_id: 'NCL001',
          description: 'Long-term debt should match debt schedule (less current portion)',
          formula: 'ltd = debt_schedule_total - cpltd',
          tolerance: 0.01,
          error_if_fails: 'completeness',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Equity',
      line_items: [
        'Common Stock',
        'Additional Paid-in Capital',
        'Retained Earnings',
        'Treasury Stock',
        'Accumulated Other Comprehensive Income',
        'Non-controlling Interest',
      ],
      validation_rules: [
        {
          rule_id: 'EQ001',
          description: 'Treasury stock should be contra (negative)',
          formula: 'treasury_stock <= 0',
          error_if_fails: 'classification',
          severity: 'high',
        },
        {
          rule_id: 'EQ002',
          description: 'Retained earnings rollforward: Beginning + NI - Dividends = Ending',
          formula: 'ending_re = beginning_re + net_income - dividends',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'BS001',
      name: 'Balance Sheet Must Balance',
      applies_to: ['Total Assets', 'Total Liabilities', 'Total Equity'],
      logic: 'total_assets === total_liabilities + total_equity',
      gaap_reference: 'ASC 210 - Balance Sheet',
    },
    {
      check_id: 'BS002',
      name: 'Working Capital Reasonability',
      applies_to: ['Current Assets', 'Current Liabilities'],
      logic: 'current_ratio = current_assets / current_liabilities should be > 0.5',
      gaap_reference: 'Going Concern Analysis',
    },
    {
      check_id: 'BS003',
      name: 'Negative Equity Warning',
      applies_to: ['Total Equity'],
      logic: 'total_equity < 0 triggers going concern evaluation',
      gaap_reference: 'ASC 205-40 - Going Concern',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// INCOME STATEMENT TEMPLATE
// ============================================================================

export const INCOME_STATEMENT_TEMPLATE: ReportTemplate = {
  name: 'Income Statement Error Detection',
  category: 'financial_statement',
  sections: [
    {
      name: 'Revenue',
      line_items: [
        'Gross Revenue',
        'Sales Returns and Allowances',
        'Net Revenue',
      ],
      validation_rules: [
        {
          rule_id: 'REV001',
          description: 'Net Revenue = Gross Revenue - Returns',
          formula: 'net_revenue = gross_revenue - returns',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'REV002',
          description: 'Returns should not exceed 50% of gross revenue',
          formula: 'returns / gross_revenue < 0.50',
          error_if_fails: 'fraud_indicator',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Cost of Goods Sold',
      line_items: [
        'Beginning Inventory',
        'Purchases',
        'Ending Inventory',
        'Cost of Goods Sold',
      ],
      validation_rules: [
        {
          rule_id: 'COGS001',
          description: 'COGS = Beginning Inv + Purchases - Ending Inv',
          formula: 'cogs = begin_inv + purchases - end_inv',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'COGS002',
          description: 'Gross margin should be consistent with prior periods',
          formula: 'variance(gross_margin, prior_gross_margin) < 10%',
          error_if_fails: 'valuation',
          severity: 'medium',
        },
      ],
    },
    {
      name: 'Operating Expenses',
      line_items: [
        'Selling Expenses',
        'General & Administrative',
        'Research & Development',
        'Depreciation & Amortization',
        'Other Operating Expenses',
      ],
      validation_rules: [
        {
          rule_id: 'OPEX001',
          description: 'D&A should match depreciation schedule',
          formula: 'da_expense = depr_schedule_current_year',
          tolerance: 0.01,
          error_if_fails: 'completeness',
          severity: 'high',
        },
        {
          rule_id: 'OPEX002',
          description: 'Operating expenses should not exceed 80% of revenue (varies by industry)',
          formula: 'total_opex / net_revenue < 0.80',
          error_if_fails: 'valuation',
          severity: 'medium',
        },
      ],
    },
    {
      name: 'Other Income/Expense',
      line_items: [
        'Interest Income',
        'Interest Expense',
        'Gain/Loss on Sale of Assets',
        'Other Income/Expense',
      ],
      validation_rules: [
        {
          rule_id: 'OIE001',
          description: 'Interest expense should correlate with debt balances',
          formula: 'interest_exp / avg_debt approximates market rate',
          error_if_fails: 'valuation',
          severity: 'medium',
        },
      ],
    },
    {
      name: 'Income Tax',
      line_items: [
        'Income Before Tax',
        'Current Tax Expense',
        'Deferred Tax Expense',
        'Total Tax Expense',
        'Net Income',
      ],
      validation_rules: [
        {
          rule_id: 'TAX001',
          description: 'Total Tax = Current + Deferred',
          formula: 'total_tax = current_tax + deferred_tax',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
        {
          rule_id: 'TAX002',
          description: 'Effective tax rate should be reasonable (15-30% for US corps)',
          formula: 'total_tax / income_before_tax between 0.15 and 0.35',
          error_if_fails: 'tax_position',
          severity: 'medium',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'IS001',
      name: 'Net Income Calculation',
      applies_to: ['All sections'],
      logic: 'net_income = revenue - cogs - opex - interest + other - tax',
      gaap_reference: 'ASC 220 - Comprehensive Income',
    },
    {
      check_id: 'IS002',
      name: 'Gross Profit Calculation',
      applies_to: ['Revenue', 'COGS'],
      logic: 'gross_profit = net_revenue - cogs',
      gaap_reference: 'ASC 605/606 - Revenue Recognition',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// CASH FLOW STATEMENT TEMPLATE
// ============================================================================

export const CASH_FLOW_TEMPLATE: ReportTemplate = {
  name: 'Cash Flow Statement Error Detection',
  category: 'financial_statement',
  sections: [
    {
      name: 'Operating Activities',
      line_items: [
        'Net Income',
        'Depreciation & Amortization',
        'Stock-based Compensation',
        'Deferred Taxes',
        'Changes in Working Capital',
        'Cash from Operations',
      ],
      validation_rules: [
        {
          rule_id: 'CFO001',
          description: 'Net income must match income statement',
          formula: 'net_income_cf = net_income_is',
          tolerance: 0.01,
          error_if_fails: 'completeness',
          severity: 'critical',
        },
        {
          rule_id: 'CFO002',
          description: 'D&A must match income statement',
          formula: 'da_cf = da_is',
          tolerance: 0.01,
          error_if_fails: 'completeness',
          severity: 'high',
        },
        {
          rule_id: 'CFO003',
          description: 'Working capital changes must reconcile to balance sheet changes',
          formula: 'wc_change = (current_assets - current_liab)_end - (current_assets - current_liab)_begin',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Investing Activities',
      line_items: [
        'Capital Expenditures',
        'Acquisitions',
        'Sales of Investments',
        'Purchases of Investments',
        'Cash from Investing',
      ],
      validation_rules: [
        {
          rule_id: 'CFI001',
          description: 'CapEx should reconcile to PP&E schedule',
          formula: 'capex = ppe_additions from fixed asset rollforward',
          tolerance: 0.01,
          error_if_fails: 'completeness',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Financing Activities',
      line_items: [
        'Debt Proceeds',
        'Debt Repayments',
        'Stock Issuance',
        'Stock Repurchases',
        'Dividends Paid',
        'Cash from Financing',
      ],
      validation_rules: [
        {
          rule_id: 'CFF001',
          description: 'Net debt change should reconcile to balance sheet',
          formula: 'debt_proceeds - debt_repayments = ending_debt - beginning_debt',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
        {
          rule_id: 'CFF002',
          description: 'Treasury stock purchases should match equity rollforward',
          formula: 'repurchases = treasury_stock_change',
          tolerance: 0.01,
          error_if_fails: 'completeness',
          severity: 'high',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'CF001',
      name: 'Cash Reconciliation',
      applies_to: ['All sections'],
      logic: 'beginning_cash + cfo + cfi + cff + fx = ending_cash',
      gaap_reference: 'ASC 230 - Statement of Cash Flows',
    },
    {
      check_id: 'CF002',
      name: 'Ending Cash Must Match Balance Sheet',
      applies_to: ['Ending Cash'],
      logic: 'cf_ending_cash = bs_cash',
      gaap_reference: 'ASC 230',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// BANK RECONCILIATION TEMPLATE
// ============================================================================

export const BANK_RECONCILIATION_TEMPLATE: ReportTemplate = {
  name: 'Bank Reconciliation Error Detection',
  category: 'account_reconciliation',
  sections: [
    {
      name: 'Bank Balance',
      line_items: [
        'Bank Statement Ending Balance',
        'Deposits in Transit',
        'Outstanding Checks',
        'Bank Errors',
        'Adjusted Bank Balance',
      ],
      validation_rules: [
        {
          rule_id: 'BR001',
          description: 'Bank statement must be from last day of period',
          formula: 'statement_date = period_end_date',
          error_if_fails: 'cutoff',
          severity: 'high',
        },
        {
          rule_id: 'BR002',
          description: 'Deposits in transit should clear within 3 business days',
          formula: 'dit_age < 5 days',
          error_if_fails: 'timing',
          severity: 'medium',
        },
        {
          rule_id: 'BR003',
          description: 'Outstanding checks over 6 months should be investigated',
          formula: 'oc_age < 180 days',
          error_if_fails: 'completeness',
          severity: 'medium',
        },
      ],
    },
    {
      name: 'Book Balance',
      line_items: [
        'GL Ending Balance',
        'Interest Earned',
        'Bank Fees',
        'NSF Checks',
        'Book Errors',
        'Adjusted Book Balance',
      ],
      validation_rules: [
        {
          rule_id: 'BR004',
          description: 'GL balance must match trial balance',
          formula: 'gl_cash = trial_balance_cash',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'BR001',
      name: 'Adjusted Balances Must Match',
      applies_to: ['Adjusted Bank Balance', 'Adjusted Book Balance'],
      logic: 'adjusted_bank_balance = adjusted_book_balance',
      gaap_reference: 'Internal Control - Cash Reconciliation',
    },
    {
      check_id: 'BR002',
      name: 'Stale Dated Items',
      applies_to: ['Outstanding Checks', 'Deposits in Transit'],
      logic: 'flag items older than 90 days for investigation',
      gaap_reference: 'SOX 404 - Internal Controls',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// TAX RETURN TEMPLATE
// ============================================================================

export const TAX_RETURN_TEMPLATE: ReportTemplate = {
  name: 'Tax Return Error Detection',
  category: 'tax_compliance',
  sections: [
    {
      name: 'Income Reporting',
      line_items: [
        'Gross Receipts/Sales',
        'Returns and Allowances',
        'Cost of Goods Sold',
        'Gross Profit',
        'Other Income',
        'Total Income',
      ],
      validation_rules: [
        {
          rule_id: 'TR001',
          description: 'Book-tax income difference must be explained',
          formula: 'gaap_income +/- m1_adjustments = taxable_income',
          tolerance: 0.01,
          error_if_fails: 'tax_position',
          severity: 'critical',
        },
        {
          rule_id: 'TR002',
          description: 'Gross receipts should match 1099-K and deposit analysis',
          formula: 'gross_receipts >= 1099k_total + cash_deposits',
          error_if_fails: 'omission',
          severity: 'critical',
        },
      ],
    },
    {
      name: 'Deductions',
      line_items: [
        'Compensation of Officers',
        'Salaries and Wages',
        'Repairs and Maintenance',
        'Bad Debts',
        'Rent',
        'Taxes and Licenses',
        'Interest',
        'Depreciation',
        'Advertising',
        'Other Deductions',
      ],
      validation_rules: [
        {
          rule_id: 'TR003',
          description: 'Depreciation must match Form 4562',
          formula: 'depreciation = form_4562_total',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
        {
          rule_id: 'TR004',
          description: 'Officer compensation must match W-2s issued',
          formula: 'officer_comp = sum(officer_w2s)',
          tolerance: 0.01,
          error_if_fails: 'completeness',
          severity: 'high',
        },
        {
          rule_id: 'TR005',
          description: 'Interest deduction limited under IRC 163(j)',
          formula: 'interest <= 30% * ATI (with exceptions)',
          error_if_fails: 'tax_position',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Tax Computation',
      line_items: [
        'Taxable Income Before NOL',
        'NOL Deduction',
        'Taxable Income',
        'Total Tax',
        'Credits',
        'Payments',
        'Amount Owed/Refund',
      ],
      validation_rules: [
        {
          rule_id: 'TR006',
          description: 'NOL deduction limited to 80% of taxable income (post-TCJA)',
          formula: 'nol_deduction <= 0.80 * taxable_income_before_nol',
          error_if_fails: 'tax_position',
          severity: 'high',
        },
        {
          rule_id: 'TR007',
          description: 'Corporate tax = 21% of taxable income',
          formula: 'total_tax = 0.21 * taxable_income (for C corps)',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'TR001',
      name: 'Schedule M-1 Reconciliation',
      applies_to: ['Book Income', 'Taxable Income'],
      logic: 'book_income + m1_additions - m1_subtractions = taxable_income',
      irc_reference: 'IRC 6012 - Returns Required',
    },
    {
      check_id: 'TR002',
      name: 'Schedule L Balance Sheet',
      applies_to: ['Beginning Balance', 'Ending Balance'],
      logic: 'schedule_l_assets = schedule_l_liabilities + schedule_l_equity',
      gaap_reference: 'Form 1120 Schedule L',
    },
    {
      check_id: 'TR003',
      name: 'Related Party Transactions Disclosure',
      applies_to: ['Form 5472', 'Schedule G'],
      logic: 'if related_party_transactions > threshold then disclosure required',
      irc_reference: 'IRC 6038A - Foreign-Owned Corporations',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// ACCOUNTS PAYABLE TEMPLATE
// ============================================================================

export const ACCOUNTS_PAYABLE_TEMPLATE: ReportTemplate = {
  name: 'Accounts Payable Error Detection',
  category: 'account_reconciliation',
  sections: [
    {
      name: 'AP Aging',
      line_items: [
        'Current (0-30 days)',
        '31-60 days',
        '61-90 days',
        'Over 90 days',
        'Total AP',
      ],
      validation_rules: [
        {
          rule_id: 'AP001',
          description: 'Total AP must match GL balance',
          formula: 'aging_total = gl_ap_balance',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'AP002',
          description: 'Old AP (>90 days) should be less than 10% of total',
          formula: 'over_90 / total_ap < 0.10',
          error_if_fails: 'timing',
          severity: 'medium',
        },
        {
          rule_id: 'AP003',
          description: 'No negative AP balances (unless debit memos)',
          formula: 'negative_balances = debit_memos_only',
          error_if_fails: 'classification',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Vendor Analysis',
      line_items: [
        'Number of Active Vendors',
        'New Vendors (Period)',
        'Vendors with >$100K Balance',
        'Related Party Vendors',
      ],
      validation_rules: [
        {
          rule_id: 'AP004',
          description: 'New vendors should have W-9 on file',
          formula: 'new_vendors_with_w9 = new_vendors_count',
          error_if_fails: 'completeness',
          severity: 'high',
        },
        {
          rule_id: 'AP005',
          description: 'Related party vendors must be disclosed',
          formula: 'related_party_disclosed = true',
          error_if_fails: 'disclosure',
          severity: 'high',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'AP001',
      name: '1099 Reporting Compliance',
      applies_to: ['Vendors', 'Payments'],
      logic: 'vendors_over_600 must have 1099 issued',
      irc_reference: 'IRC 6041 - Information Returns',
    },
    {
      check_id: 'AP002',
      name: 'Cutoff Testing',
      applies_to: ['Period-End Invoices'],
      logic: 'invoices_dated_period_end must be in correct period',
      gaap_reference: 'ASC 450 - Contingencies',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// ACCOUNTS RECEIVABLE TEMPLATE
// ============================================================================

export const ACCOUNTS_RECEIVABLE_TEMPLATE: ReportTemplate = {
  name: 'Accounts Receivable Error Detection',
  category: 'account_reconciliation',
  sections: [
    {
      name: 'AR Aging',
      line_items: [
        'Current (0-30 days)',
        '31-60 days',
        '61-90 days',
        'Over 90 days',
        'Total Gross AR',
        'Allowance for Doubtful Accounts',
        'Net AR',
      ],
      validation_rules: [
        {
          rule_id: 'AR001',
          description: 'Net AR = Gross AR - Allowance',
          formula: 'net_ar = gross_ar - allowance',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'AR002',
          description: 'Allowance should be reasonable based on historical loss rate',
          formula: 'allowance >= over_90 * historical_loss_rate',
          error_if_fails: 'valuation',
          severity: 'high',
        },
        {
          rule_id: 'AR003',
          description: 'DSO should be consistent with payment terms',
          formula: 'dso = (avg_ar / annual_revenue) * 365 should be near payment_terms',
          error_if_fails: 'timing',
          severity: 'medium',
        },
      ],
    },
    {
      name: 'Customer Analysis',
      line_items: [
        'Customer Concentration (Top 10)',
        'Related Party Receivables',
        'Credit Balances',
        'Disputed Invoices',
      ],
      validation_rules: [
        {
          rule_id: 'AR004',
          description: 'Credit balances should be reclassified to AP',
          formula: 'credit_balances should be in current_liabilities',
          error_if_fails: 'classification',
          severity: 'high',
        },
        {
          rule_id: 'AR005',
          description: 'Customer concentration disclosure if >10% of revenue',
          formula: 'if customer_revenue > 10% then disclose',
          error_if_fails: 'disclosure',
          severity: 'medium',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'AR001',
      name: 'Revenue Recognition Cutoff',
      applies_to: ['Period-End Sales'],
      logic: 'revenue recorded when performance obligation satisfied',
      gaap_reference: 'ASC 606 - Revenue Recognition',
    },
    {
      check_id: 'AR002',
      name: 'Bad Debt Reserve Adequacy',
      applies_to: ['Allowance', 'Historical Write-offs'],
      logic: 'allowance >= expected_credit_losses',
      gaap_reference: 'ASC 326 - Credit Losses (CECL)',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// PAYROLL TEMPLATE
// ============================================================================

export const PAYROLL_TEMPLATE: ReportTemplate = {
  name: 'Payroll Error Detection',
  category: 'tax_compliance',
  sections: [
    {
      name: 'Wage Summary',
      line_items: [
        'Gross Wages',
        'Federal Withholding',
        'Social Security (Employee)',
        'Medicare (Employee)',
        'State Withholding',
        'Other Deductions',
        'Net Pay',
      ],
      validation_rules: [
        {
          rule_id: 'PR001',
          description: 'Gross - Deductions = Net Pay',
          formula: 'gross - fed - ss - med - state - other = net',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'PR002',
          description: 'Social Security = 6.2% of wages up to limit',
          formula: 'ss_ee = min(gross, ss_limit) * 0.062',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
        {
          rule_id: 'PR003',
          description: 'Medicare = 1.45% of all wages (+ 0.9% over $200K)',
          formula: 'med_ee = gross * 0.0145 + (excess over 200k * 0.009)',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Employer Taxes',
      line_items: [
        'Social Security (Employer)',
        'Medicare (Employer)',
        'FUTA',
        'SUTA',
        'Workers Comp',
      ],
      validation_rules: [
        {
          rule_id: 'PR004',
          description: 'Employer SS matches Employee SS',
          formula: 'ss_er = ss_ee',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
        {
          rule_id: 'PR005',
          description: 'FUTA = 6% on first $7,000 (5.4% credit = 0.6% net)',
          formula: 'futa = min(ytd_wages, 7000) * 0.006',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Quarterly Reconciliation',
      line_items: [
        'Form 941 Total Wages',
        'Form 941 Total Tax',
        'Deposits Made',
        'Balance Due/Overpayment',
      ],
      validation_rules: [
        {
          rule_id: 'PR006',
          description: 'Form 941 wages = Sum of pay register wages',
          formula: 'f941_wages = sum(pay_register_gross)',
          tolerance: 0.01,
          error_if_fails: 'completeness',
          severity: 'critical',
        },
        {
          rule_id: 'PR007',
          description: 'Deposits must be timely (semi-weekly or monthly)',
          formula: 'deposits made within lookback period schedule',
          error_if_fails: 'timing',
          severity: 'high',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'PR001',
      name: 'W-2 Reconciliation',
      applies_to: ['Form 941', 'W-2s'],
      logic: 'sum(w2_wages) = sum(f941_wages) for year',
      irc_reference: 'IRC 6051 - W-2 Requirements',
    },
    {
      check_id: 'PR002',
      name: 'Trust Fund Compliance',
      applies_to: ['Withholding', 'FICA'],
      logic: 'all trust fund taxes deposited timely',
      irc_reference: 'IRC 6672 - Trust Fund Recovery Penalty',
    },
    {
      check_id: 'PR003',
      name: 'Worker Classification',
      applies_to: ['Employees', 'Contractors'],
      logic: 'workers classified correctly per IRS 20-factor test',
      irc_reference: 'IRC 3121 - Employment Taxes',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// INVENTORY TEMPLATE
// ============================================================================

export const INVENTORY_TEMPLATE: ReportTemplate = {
  name: 'Inventory Error Detection',
  category: 'asset_verification',
  sections: [
    {
      name: 'Inventory Valuation',
      line_items: [
        'Raw Materials',
        'Work in Process',
        'Finished Goods',
        'Total Inventory',
        'Inventory Reserve',
        'Net Inventory',
      ],
      validation_rules: [
        {
          rule_id: 'INV001',
          description: 'Total = Raw + WIP + Finished',
          formula: 'total = raw + wip + finished',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'INV002',
          description: 'Inventory should be at lower of cost or NRV',
          formula: 'inventory <= net_realizable_value',
          error_if_fails: 'valuation',
          severity: 'high',
        },
        {
          rule_id: 'INV003',
          description: 'Reserve should be adequate for obsolete/slow-moving',
          formula: 'reserve >= obsolete_inventory_at_cost',
          error_if_fails: 'valuation',
          severity: 'high',
        },
      ],
    },
    {
      name: 'Inventory Turnover',
      line_items: [
        'Beginning Inventory',
        'Purchases',
        'COGS',
        'Ending Inventory',
        'Days in Inventory',
      ],
      validation_rules: [
        {
          rule_id: 'INV004',
          description: 'Ending = Beginning + Purchases - COGS',
          formula: 'ending = beginning + purchases - cogs',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'INV005',
          description: 'Days in inventory should be reasonable (< 365)',
          formula: 'dio = (avg_inventory / cogs) * 365 < 365',
          error_if_fails: 'valuation',
          severity: 'medium',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'INV001',
      name: 'Physical Count Reconciliation',
      applies_to: ['Perpetual Records', 'Physical Count'],
      logic: 'perpetual_quantity = physical_count_quantity',
      gaap_reference: 'ASC 330 - Inventory',
    },
    {
      check_id: 'INV002',
      name: 'Cost Method Consistency',
      applies_to: ['FIFO', 'LIFO', 'Average Cost'],
      logic: 'cost method applied consistently period over period',
      irc_reference: 'IRC 472 - LIFO Method',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// FIXED ASSETS TEMPLATE
// ============================================================================

export const FIXED_ASSETS_TEMPLATE: ReportTemplate = {
  name: 'Fixed Assets Error Detection',
  category: 'asset_verification',
  sections: [
    {
      name: 'Asset Rollforward',
      line_items: [
        'Beginning Balance (Gross)',
        'Additions',
        'Disposals',
        'Transfers',
        'Ending Balance (Gross)',
      ],
      validation_rules: [
        {
          rule_id: 'FA001',
          description: 'Ending = Beginning + Additions - Disposals +/- Transfers',
          formula: 'ending = beginning + additions - disposals +/- transfers',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'FA002',
          description: 'Additions should be capitalized per policy (typically > $2,500)',
          formula: 'each addition >= capitalization_threshold',
          error_if_fails: 'classification',
          severity: 'medium',
        },
      ],
    },
    {
      name: 'Depreciation',
      line_items: [
        'Beginning Accumulated Depreciation',
        'Current Period Depreciation',
        'Accumulated Depreciation on Disposals',
        'Ending Accumulated Depreciation',
      ],
      validation_rules: [
        {
          rule_id: 'FA003',
          description: 'Ending Accum = Beginning + Current - Disposed',
          formula: 'ending_accum = beginning_accum + current_depr - disposed_accum',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'FA004',
          description: 'Accumulated depreciation cannot exceed gross cost',
          formula: 'ending_accum_depr <= ending_gross_assets',
          error_if_fails: 'valuation',
          severity: 'critical',
        },
      ],
    },
    {
      name: 'Net Book Value',
      line_items: [
        'Gross Assets',
        'Accumulated Depreciation',
        'Net Book Value',
      ],
      validation_rules: [
        {
          rule_id: 'FA005',
          description: 'NBV = Gross - Accumulated Depreciation',
          formula: 'nbv = gross - accum_depr',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'FA006',
          description: 'NBV cannot be negative',
          formula: 'nbv >= 0',
          error_if_fails: 'valuation',
          severity: 'critical',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'FA001',
      name: 'Tax Depreciation Reconciliation',
      applies_to: ['Book Depreciation', 'Tax Depreciation'],
      logic: 'book_depr +/- timing_differences = tax_depr',
      irc_reference: 'IRC 168 - MACRS Depreciation',
    },
    {
      check_id: 'FA002',
      name: 'Section 179 Limitation',
      applies_to: ['Section 179 Expense'],
      logic: 's179_expense <= s179_limit ($1,160,000 in 2024)',
      irc_reference: 'IRC 179 - Expensing Election',
    },
    {
      check_id: 'FA003',
      name: 'Bonus Depreciation',
      applies_to: ['Qualified Property'],
      logic: 'bonus_depr = qualified_property * bonus_rate (80% in 2024)',
      irc_reference: 'IRC 168(k) - Bonus Depreciation',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// TRIAL BALANCE TEMPLATE
// ============================================================================

export const TRIAL_BALANCE_TEMPLATE: ReportTemplate = {
  name: 'Trial Balance Error Detection',
  category: 'account_reconciliation',
  sections: [
    {
      name: 'Account Categories',
      line_items: [
        'Assets (Debits)',
        'Liabilities (Credits)',
        'Equity (Credits)',
        'Revenue (Credits)',
        'Expenses (Debits)',
      ],
      validation_rules: [
        {
          rule_id: 'TB001',
          description: 'Total Debits = Total Credits',
          formula: 'sum(debits) = sum(credits)',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'TB002',
          description: 'Asset accounts should have debit balances',
          formula: 'assets are debits (positive)',
          error_if_fails: 'classification',
          severity: 'high',
        },
        {
          rule_id: 'TB003',
          description: 'Liability and equity accounts should have credit balances',
          formula: 'liabilities and equity are credits',
          error_if_fails: 'classification',
          severity: 'high',
        },
        {
          rule_id: 'TB004',
          description: 'Revenue accounts should have credit balances',
          formula: 'revenue accounts are credits',
          error_if_fails: 'classification',
          severity: 'high',
        },
        {
          rule_id: 'TB005',
          description: 'Expense accounts should have debit balances',
          formula: 'expense accounts are debits',
          error_if_fails: 'classification',
          severity: 'high',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'TB001',
      name: 'Unusual Account Balances',
      applies_to: ['All Accounts'],
      logic: 'flag accounts with unexpected debit/credit orientation',
      gaap_reference: 'General Accounting Principles',
    },
    {
      check_id: 'TB002',
      name: 'Suspense Account Review',
      applies_to: ['Suspense', 'Clearing Accounts'],
      logic: 'suspense accounts should be zero at period end',
      gaap_reference: 'Internal Control Standards',
    },
    {
      check_id: 'TB003',
      name: 'Account Activity Analysis',
      applies_to: ['All Accounts'],
      logic: 'flag accounts with no activity in 12 months',
      gaap_reference: 'Chart of Accounts Maintenance',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// GENERAL LEDGER TEMPLATE
// ============================================================================

export const GENERAL_LEDGER_TEMPLATE: ReportTemplate = {
  name: 'General Ledger Error Detection',
  category: 'journal_entry_testing',
  sections: [
    {
      name: 'Journal Entry Analysis',
      line_items: [
        'Standard Entries',
        'Recurring Entries',
        'Adjusting Entries',
        'Reversing Entries',
        'Manual Entries',
      ],
      validation_rules: [
        {
          rule_id: 'GL001',
          description: 'Each entry must balance (debits = credits)',
          formula: 'entry_debits = entry_credits',
          tolerance: 0.01,
          error_if_fails: 'mathematical',
          severity: 'critical',
        },
        {
          rule_id: 'GL002',
          description: 'Entries must have valid accounts',
          formula: 'all accounts exist in chart of accounts',
          error_if_fails: 'existence',
          severity: 'critical',
        },
        {
          rule_id: 'GL003',
          description: 'Entries must have descriptions',
          formula: 'description is not null or empty',
          error_if_fails: 'completeness',
          severity: 'medium',
        },
      ],
    },
    {
      name: 'High-Risk Entry Indicators',
      line_items: [
        'Round Dollar Entries',
        'Period-End Entries',
        'Unusual Hour Entries',
        'Large Entries (> Threshold)',
        'Entries to Unusual Account Combinations',
      ],
      validation_rules: [
        {
          rule_id: 'GL004',
          description: 'Flag round dollar entries over $10,000',
          formula: 'if amount > 10000 and amount % 1000 = 0 then flag',
          error_if_fails: 'fraud_indicator',
          severity: 'medium',
        },
        {
          rule_id: 'GL005',
          description: 'Flag period-end entries (last 3 days)',
          formula: 'if date in last 3 days of period then flag for review',
          error_if_fails: 'timing',
          severity: 'medium',
        },
        {
          rule_id: 'GL006',
          description: 'Flag entries posted outside business hours',
          formula: 'if posted_time < 7am or > 8pm then flag',
          error_if_fails: 'fraud_indicator',
          severity: 'medium',
        },
      ],
    },
  ],
  error_checks: [
    {
      check_id: 'GL001',
      name: 'Segregation of Duties',
      applies_to: ['Entry Creator', 'Entry Approver'],
      logic: 'creator != approver for entries over threshold',
      gaap_reference: 'SOX 404 - Internal Controls',
    },
    {
      check_id: 'GL002',
      name: 'Recurring Entry Consistency',
      applies_to: ['Recurring Entries'],
      logic: 'recurring entries posted in all periods',
      gaap_reference: 'Accrual Accounting',
    },
    {
      check_id: 'GL003',
      name: 'Adjusting Entry Support',
      applies_to: ['Adjusting Entries'],
      logic: 'all AJEs have supporting documentation',
      gaap_reference: 'Audit Standards',
    },
  ],
  output_format: 'markdown',
};

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

export const TEMPLATE_REGISTRY: Record<string, ReportTemplate> = {
  balance_sheet: BALANCE_SHEET_TEMPLATE,
  income_statement: INCOME_STATEMENT_TEMPLATE,
  cash_flow: CASH_FLOW_TEMPLATE,
  bank_reconciliation: BANK_RECONCILIATION_TEMPLATE,
  tax_return: TAX_RETURN_TEMPLATE,
  accounts_payable: ACCOUNTS_PAYABLE_TEMPLATE,
  accounts_receivable: ACCOUNTS_RECEIVABLE_TEMPLATE,
  payroll: PAYROLL_TEMPLATE,
  inventory: INVENTORY_TEMPLATE,
  fixed_assets: FIXED_ASSETS_TEMPLATE,
  trial_balance: TRIAL_BALANCE_TEMPLATE,
  general_ledger: GENERAL_LEDGER_TEMPLATE,
};

// ============================================================================
// TEMPLATE FUNCTIONS
// ============================================================================

export function getTemplate(templateName: string): ReportTemplate | undefined {
  return TEMPLATE_REGISTRY[templateName];
}

export function getAllTemplates(): ReportTemplate[] {
  return Object.values(TEMPLATE_REGISTRY);
}

export function getTemplateNames(): string[] {
  return Object.keys(TEMPLATE_REGISTRY);
}
