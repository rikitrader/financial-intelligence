/**
 * Financial Intelligence Template Library Index
 * Complete export of all document templates and report templates
 */

// Export report templates
export * from './report_templates';

// Export document templates
export * from './document_templates';
export * from './document_templates_extended';

// Import for combined registry
import { ALL_DOCUMENT_TEMPLATES } from './document_templates';
import { EXTENDED_DOCUMENT_TEMPLATES } from './document_templates_extended';
import type { DocumentTemplate, DocumentCategory } from './document_templates';

// ============================================================================
// COMBINED TEMPLATE REGISTRY
// ============================================================================

/**
 * Complete registry of all document templates across all 12 categories
 */
export const COMPLETE_TEMPLATE_REGISTRY: Record<DocumentCategory, DocumentTemplate[]> = {
  ...ALL_DOCUMENT_TEMPLATES,
  payroll_hr: EXTENDED_DOCUMENT_TEMPLATES.payroll_hr,
  tax: EXTENDED_DOCUMENT_TEMPLATES.tax,
  assets_capital: EXTENDED_DOCUMENT_TEMPLATES.assets_capital,
  investor_equity: EXTENDED_DOCUMENT_TEMPLATES.investor_equity,
  audit_compliance: EXTENDED_DOCUMENT_TEMPLATES.audit_compliance,
  forensic_investigation: EXTENDED_DOCUMENT_TEMPLATES.forensic_investigation,
  sec_filings: EXTENDED_DOCUMENT_TEMPLATES.sec_filings,
};

// ============================================================================
// TEMPLATE STATISTICS
// ============================================================================

export function getTemplateStatistics(): {
  totalTemplates: number;
  byCategory: Record<string, number>;
  categories: string[];
} {
  const byCategory: Record<string, number> = {};
  let total = 0;

  for (const [category, templates] of Object.entries(COMPLETE_TEMPLATE_REGISTRY)) {
    byCategory[category] = templates.length;
    total += templates.length;
  }

  return {
    totalTemplates: total,
    byCategory,
    categories: Object.keys(COMPLETE_TEMPLATE_REGISTRY),
  };
}

// ============================================================================
// UNIFIED SEARCH & ACCESS FUNCTIONS
// ============================================================================

/**
 * Get a template by its ID from any category
 */
export function getTemplateById(id: string): DocumentTemplate | undefined {
  for (const templates of Object.values(COMPLETE_TEMPLATE_REGISTRY)) {
    const found = templates.find(t => t.id === id);
    if (found) return found;
  }
  return undefined;
}

/**
 * Get all templates for a specific category
 */
export function getTemplatesByCategory(category: DocumentCategory): DocumentTemplate[] {
  return COMPLETE_TEMPLATE_REGISTRY[category] || [];
}

/**
 * Search templates by name or alias
 */
export function searchTemplates(searchTerm: string): DocumentTemplate[] {
  const term = searchTerm.toLowerCase();
  return Object.values(COMPLETE_TEMPLATE_REGISTRY)
    .flat()
    .filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.aliases.some(a => a.toLowerCase().includes(term)) ||
      t.description.toLowerCase().includes(term)
    );
}

/**
 * Get all template IDs
 */
export function getAllTemplateIds(): string[] {
  return Object.values(COMPLETE_TEMPLATE_REGISTRY)
    .flat()
    .map(t => t.id);
}

/**
 * Get templates by regulatory reference
 */
export function getTemplatesByRegulation(regulation: string): DocumentTemplate[] {
  const term = regulation.toLowerCase();
  return Object.values(COMPLETE_TEMPLATE_REGISTRY)
    .flat()
    .filter(t =>
      t.regulatory_references?.some(r => r.toLowerCase().includes(term))
    );
}

/**
 * Get templates with critical validation rules
 */
export function getTemplatesWithCriticalRules(): DocumentTemplate[] {
  return Object.values(COMPLETE_TEMPLATE_REGISTRY)
    .flat()
    .filter(t =>
      t.validation_rules.some(r => r.severity === 'critical')
    );
}

/**
 * Get templates with red flag checks
 */
export function getTemplatesWithRedFlags(): DocumentTemplate[] {
  return Object.values(COMPLETE_TEMPLATE_REGISTRY)
    .flat()
    .filter(t =>
      t.error_checks.some(c => c.red_flag_if_fails)
    );
}

// ============================================================================
// CATEGORY DESCRIPTIONS
// ============================================================================

export const CATEGORY_DESCRIPTIONS: Record<DocumentCategory, string> = {
  core_financial_statements: 'Primary financial reports: Balance Sheet, Income Statement, Cash Flow, Equity, OCI, Notes',
  accounting_ledger: 'Source of truth: General Ledger, Trial Balance, Chart of Accounts, Journal Entries, Subledgers',
  revenue: 'Revenue cycle: Sales Invoices, Contracts, Revenue Recognition, Deferred Revenue, AR Aging, Sales Tax',
  expense_payables: 'Expense cycle: Vendor Invoices, Expense Reports, POs, AP Aging, Check Register, Payment Auth',
  banking_cash: 'Cash management: Bank Statements, Reconciliations, Cash Receipts/Disbursements, Wires, Deposits',
  payroll_hr: 'Payroll cycle: Payroll Register, Timesheets, W-2s, 1099s, 941s, Benefits',
  tax: 'Tax compliance: Corporate (1120), Partnership (1065), Individual (1040), Estimated Payments, Property Tax',
  assets_capital: 'Fixed assets: FA Register, Depreciation, CapEx, Leases, Loans, Debt Amortization',
  investor_equity: 'Equity instruments: Cap Table, Share Certificates, Stock Options, Dividends',
  audit_compliance: 'Audit & controls: Audit Report, Rep Letter, Internal Controls, SOX Testing, Risk Assessment',
  forensic_investigation: 'Forensic: Transaction Tracing, Source/Use of Funds, Related Party, Fraud Reports, AML/KYC',
  sec_filings: 'SEC filings: 10-K, 10-Q, 8-K, S-1, DEF 14A, Schedule 13D/G, Form 4',
};

// ============================================================================
// FILE NAMING CONVENTION HELPER
// ============================================================================

export function generateFileName(
  templateId: string,
  entity: string,
  year: string,
  additionalParams: Record<string, string> = {}
): string {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  let fileName = template.file_naming_convention
    .replace('[ENTITY]', entity.toUpperCase())
    .replace('[YEAR]', year);

  // Replace any additional parameters
  for (const [key, value] of Object.entries(additionalParams)) {
    fileName = fileName.replace(`[${key.toUpperCase()}]`, value);
  }

  // Remove any remaining placeholders with defaults
  fileName = fileName.replace(/\[VERSION\]/g, 'v1');
  fileName = fileName.replace(/\[.*?\]/g, 'UNKNOWN');

  return fileName;
}

// ============================================================================
// VALIDATION SUMMARY
// ============================================================================

export interface ValidationSummary {
  templateId: string;
  templateName: string;
  totalRules: number;
  criticalRules: number;
  highRules: number;
  redFlagChecks: number;
  crossReferences: number;
}

export function getValidationSummary(templateId: string): ValidationSummary | undefined {
  const template = getTemplateById(templateId);
  if (!template) return undefined;

  return {
    templateId: template.id,
    templateName: template.name,
    totalRules: template.validation_rules.length,
    criticalRules: template.validation_rules.filter(r => r.severity === 'critical').length,
    highRules: template.validation_rules.filter(r => r.severity === 'high').length,
    redFlagChecks: template.error_checks.filter(c => c.red_flag_if_fails).length,
    crossReferences: template.cross_references.length,
  };
}

export function getAllValidationSummaries(): ValidationSummary[] {
  return Object.values(COMPLETE_TEMPLATE_REGISTRY)
    .flat()
    .map(t => getValidationSummary(t.id)!)
    .filter(s => s !== undefined);
}
