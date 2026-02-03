/**
 * Financial Intelligence Workflow Intake System
 * Routes users to the appropriate workflow based on their needs
 *
 * TRIGGER COMMAND: /financial-intake
 *
 * This module provides a guided intake process that asks targeted questions
 * to determine the appropriate workflow and collects necessary information.
 */

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export type WorkflowType =
  | 'gaap_accounting'           // Full GAAP-compliant accounting from bank statements
  | 'tax_defense'               // IRS Tax Defense & Audit Preparation
  | 'forensic_investigation'    // Fraud detection & forensic analysis
  | 'aml_compliance'            // Anti-Money Laundering compliance
  | 'sec_disclosure'            // SEC disclosure analysis
  | 'controls_sox'              // SOX compliance & internal controls
  | 'cfo_dashboard'             // CFO financial dashboard
  | 'payroll_forensics'         // Payroll fraud detection
  | 'litigation_support'        // Litigation support & expert witness
  | 'settlement_analysis'       // Settlement modeling & analysis
  | 'trial_support'             // Real-time trial support
  | 'asset_tracing'             // Asset tracing & recovery
  | 'reconciliation'            // Account reconciliation
  | 'ap_procurement'            // AP/Procurement fraud detection
  | 'statistical_anomalies'     // Statistical anomaly detection
  | 'records_intelligence'      // Records reconstruction
  | 'financial_reporting'       // Financial statement generation
  // IRS Tax Defense Advanced Modules
  | 'non_filer'                 // Non-Filer Defense & Compliance
  | 'sfr_attack'                // SFR Attack & Reconsideration
  | 'collection_defense'        // Collection Defense (levies, liens)
  | 'appeals_protest'           // IRS Appeals Protest Generator
  | 'criminal_risk'             // Criminal Exposure Risk Detection
  | 'penalty_optimizer'         // Penalty Reduction Optimization
  | 'transcript_analysis'       // IRS Transcript Analysis
  | 'audit_defense'             // Audit Defense Strategy Engine
  | 'oic_builder'               // Offer in Compromise Builder
  | 'evidence_package'          // Evidence Packaging System
  | 'form_433_analysis'         // Financial Statement Analyzer (Form 433)
  | 'tax_court_petition'        // Tax Court Petition Builder
  | 'settlement_probability'    // Settlement Probability Model
  | 'trial_strategy'            // Tax Court Trial Strategy
  | 'procedure_violations'      // IRS Procedure Violation Detector
  | 'case_memory'               // Case Memory & Strategy Continuity
  | 'doj_litigation'            // DOJ Tax Division Litigation
  | 'refund_suit'               // Federal District Court Refund Suit
  | 'case_router'               // Tax Case Router (Jurisdiction Selector)
  | 'tax_orchestrator'          // Master Tax Controversy Orchestrator
  | 'custom';                   // Custom workflow

export interface WorkflowConfig {
  workflow_type: WorkflowType;
  entity_name: string;
  entity_type: 'individual' | 'sole_prop' | 'partnership' | 'llc' | 'scorp' | 'ccorp' | 'trust' | 'estate' | 'nonprofit';
  industry?: string;
  fiscal_year_start: string;
  fiscal_year_end: string;
  tax_years: string[];
  accounting_method: 'cash' | 'accrual';
  data_sources: DataSource[];
  urgency: 'routine' | 'priority' | 'urgent' | 'emergency';
  case_number?: string;
  engagement_type?: 'audit_defense' | 'litigation' | 'compliance' | 'consulting' | 'investigation';
  output_requirements: OutputRequirement[];
  special_instructions?: string;
}

export interface DataSource {
  type: 'bank_statement' | 'gl_export' | 'trial_balance' | 'tax_return' | 'payroll_records' | 'invoices' | 'contracts' | 'other';
  file_path?: string;
  date_range?: { start: string; end: string };
  format?: 'csv' | 'pdf' | 'excel' | 'qbo' | 'json';
}

export interface OutputRequirement {
  type: 'markdown_report' | 'excel' | 'pdf' | 'csv' | 'json' | 'quickbooks_desktop' | 'quickbooks_online' | 'xero' | 'sage' | 'freshbooks' | 'wave' | 'zoho_books' | 'graphics' | 'html';
  destination?: string;
}

// Accounting software export formats
export const ACCOUNTING_SOFTWARE_FORMATS = {
  quickbooks_desktop: {
    name: 'QuickBooks Desktop',
    format: 'IIF',
    extension: '.iif',
    description: 'QuickBooks Desktop import file format',
  },
  quickbooks_online: {
    name: 'QuickBooks Online',
    format: 'CSV',
    extension: '.csv',
    description: 'QuickBooks Online bank feed CSV format',
    template: 'QBO_BANK_IMPORT',
  },
  xero: {
    name: 'Xero',
    format: 'CSV',
    extension: '.csv',
    description: 'Xero statement import format',
    template: 'XERO_STATEMENT',
  },
  sage: {
    name: 'Sage 50/Intacct',
    format: 'CSV',
    extension: '.csv',
    description: 'Sage accounting import format',
  },
  freshbooks: {
    name: 'FreshBooks',
    format: 'CSV',
    extension: '.csv',
    description: 'FreshBooks import format',
  },
  wave: {
    name: 'Wave Accounting',
    format: 'CSV',
    extension: '.csv',
    description: 'Wave Accounting import format',
  },
  zoho_books: {
    name: 'Zoho Books',
    format: 'CSV',
    extension: '.csv',
    description: 'Zoho Books import format',
  },
};

export interface IntakeQuestion {
  id: string;
  question: string;
  type: 'single_choice' | 'multi_choice' | 'text' | 'date' | 'file_path';
  options?: { value: string; label: string; description?: string }[];
  required: boolean;
  depends_on?: { question_id: string; value: string | string[] };
  validation?: string;
  help_text?: string;
}

export interface IntakeAnswer {
  question_id: string;
  value: string | string[];
}

// ============================================================================
// INTAKE QUESTIONS
// ============================================================================

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  // STEP 1: Primary Purpose
  {
    id: 'purpose',
    question: 'What is the primary purpose of this engagement?',
    type: 'single_choice',
    options: [
      { value: 'accounting', label: 'Accounting & Financial Reporting', description: 'Generate financial statements from raw data' },
      { value: 'tax', label: 'Tax Defense & Audit', description: 'IRS audit defense, tax controversy, penalty relief' },
      { value: 'forensic', label: 'Forensic Investigation', description: 'Fraud detection, asset tracing, litigation support' },
      { value: 'compliance', label: 'Compliance Review', description: 'AML, SOX, SEC, regulatory compliance' },
      { value: 'litigation', label: 'Litigation Support', description: 'Expert witness, trial support, settlement analysis' },
      { value: 'dashboard', label: 'Executive Dashboard', description: 'CFO-level financial analysis and KPIs' },
    ],
    required: true,
    help_text: 'Select the main reason for this engagement',
  },

  // STEP 2: Specific Workflow (based on purpose)
  {
    id: 'workflow_accounting',
    question: 'What type of accounting work is needed?',
    type: 'single_choice',
    options: [
      { value: 'gaap_accounting', label: 'Full GAAP Accounting', description: 'Complete financial statement generation' },
      { value: 'reconciliation', label: 'Account Reconciliation', description: 'Bank, AR, AP, GL reconciliation' },
      { value: 'financial_reporting', label: 'Financial Reporting Only', description: 'Generate reports from existing GL' },
      { value: 'records_intelligence', label: 'Records Reconstruction', description: 'Reconstruct records from fragments' },
    ],
    required: true,
    depends_on: { question_id: 'purpose', value: 'accounting' },
  },
  {
    id: 'workflow_tax',
    question: 'What type of tax matter is this?',
    type: 'single_choice',
    options: [
      { value: 'tax_orchestrator', label: 'Full Tax Controversy (Recommended)', description: 'Master orchestrator - routes to all modules' },
      { value: 'tax_defense', label: 'Audit Defense', description: 'IRS or state audit response' },
      { value: 'non_filer', label: 'Non-Filer Defense', description: 'Unfiled returns, SFR response' },
      { value: 'collection_defense', label: 'Collection Defense', description: 'Levies, liens, garnishments' },
      { value: 'appeals_protest', label: 'IRS Appeals', description: 'Protest preparation, appeals conference' },
      { value: 'oic_builder', label: 'Offer in Compromise', description: 'Settlement offer preparation' },
      { value: 'penalty_optimizer', label: 'Penalty Relief', description: 'Abatement requests, reasonable cause' },
      { value: 'criminal_risk', label: 'Criminal Exposure Analysis', description: 'Evaluate criminal tax risk' },
      { value: 'tax_court_petition', label: 'Tax Court Preparation', description: 'Petition and litigation preparation' },
      { value: 'doj_litigation', label: 'DOJ Tax Litigation', description: 'DOJ civil tax litigation defense' },
      { value: 'refund_suit', label: 'Refund Suit', description: 'Federal district court refund action' },
    ],
    required: true,
    depends_on: { question_id: 'purpose', value: 'tax' },
  },
  // Additional tax sub-workflow selection
  {
    id: 'workflow_tax_advanced',
    question: 'Do you need any additional analysis?',
    type: 'multi_choice',
    options: [
      { value: 'transcript_analysis', label: 'IRS Transcript Analysis', description: 'Decode account transcripts' },
      { value: 'form_433_analysis', label: 'Financial Statement (433)', description: 'Analyze Form 433-A/F' },
      { value: 'procedure_violations', label: 'Procedure Violations', description: 'Detect IRS errors' },
      { value: 'case_memory', label: 'Case Continuity Tracking', description: 'Track case strategy over time' },
      { value: 'evidence_package', label: 'Evidence Packaging', description: 'Prepare court-ready exhibits' },
      { value: 'settlement_probability', label: 'Settlement Modeling', description: 'Calculate settlement odds' },
    ],
    required: false,
    depends_on: { question_id: 'purpose', value: 'tax' },
    help_text: 'Select additional modules to include in your analysis',
  },
  {
    id: 'workflow_forensic',
    question: 'What type of forensic investigation?',
    type: 'single_choice',
    options: [
      { value: 'forensic_investigation', label: 'General Fraud Investigation', description: 'Comprehensive fraud examination' },
      { value: 'asset_tracing', label: 'Asset Tracing', description: 'Trace funds, locate assets' },
      { value: 'payroll_forensics', label: 'Payroll Forensics', description: 'Ghost employees, payroll fraud' },
      { value: 'ap_procurement', label: 'AP/Procurement Fraud', description: 'Vendor fraud, kickbacks' },
      { value: 'statistical_anomalies', label: 'Statistical Analysis', description: 'Benford\'s Law, anomaly detection' },
    ],
    required: true,
    depends_on: { question_id: 'purpose', value: 'forensic' },
  },
  {
    id: 'workflow_compliance',
    question: 'What type of compliance review?',
    type: 'single_choice',
    options: [
      { value: 'aml_compliance', label: 'AML/BSA Compliance', description: 'Anti-money laundering review' },
      { value: 'controls_sox', label: 'SOX Compliance', description: 'Internal controls testing' },
      { value: 'sec_disclosure', label: 'SEC Disclosure', description: 'Public company filing analysis' },
    ],
    required: true,
    depends_on: { question_id: 'purpose', value: 'compliance' },
  },
  {
    id: 'workflow_litigation',
    question: 'What type of litigation support?',
    type: 'single_choice',
    options: [
      { value: 'litigation_support', label: 'General Litigation Support', description: 'Document analysis, calculations' },
      { value: 'trial_support', label: 'Real-Time Trial Support', description: 'Live trial assistance' },
      { value: 'settlement_analysis', label: 'Settlement Analysis', description: 'Settlement modeling & negotiation' },
      { value: 'expert_witness', label: 'Expert Witness Preparation', description: 'Report preparation, testimony' },
    ],
    required: true,
    depends_on: { question_id: 'purpose', value: 'litigation' },
  },

  // STEP 3: Entity Information
  {
    id: 'entity_name',
    question: 'What is the entity name?',
    type: 'text',
    required: true,
    help_text: 'Full legal name of the business or individual',
  },
  {
    id: 'entity_type',
    question: 'What is the entity type?',
    type: 'single_choice',
    options: [
      { value: 'individual', label: 'Individual' },
      { value: 'sole_prop', label: 'Sole Proprietorship' },
      { value: 'llc', label: 'LLC (Single-Member)' },
      { value: 'llc_multi', label: 'LLC (Multi-Member)' },
      { value: 'partnership', label: 'Partnership' },
      { value: 'scorp', label: 'S Corporation' },
      { value: 'ccorp', label: 'C Corporation' },
      { value: 'trust', label: 'Trust' },
      { value: 'estate', label: 'Estate' },
      { value: 'nonprofit', label: 'Nonprofit' },
    ],
    required: true,
  },
  {
    id: 'industry',
    question: 'What industry is the entity in?',
    type: 'single_choice',
    options: [
      { value: 'retail', label: 'Retail' },
      { value: 'services', label: 'Professional Services' },
      { value: 'construction', label: 'Construction' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'technology', label: 'Technology' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'real_estate', label: 'Real Estate' },
      { value: 'financial', label: 'Financial Services' },
      { value: 'restaurant', label: 'Restaurant/Hospitality' },
      { value: 'ecommerce', label: 'E-Commerce' },
      { value: 'other', label: 'Other' },
    ],
    required: false,
  },

  // STEP 4: Time Period
  {
    id: 'fiscal_year_start',
    question: 'Fiscal year start date?',
    type: 'date',
    required: true,
    help_text: 'Format: YYYY-MM-DD',
  },
  {
    id: 'fiscal_year_end',
    question: 'Fiscal year end date?',
    type: 'date',
    required: true,
    help_text: 'Format: YYYY-MM-DD',
  },
  {
    id: 'tax_years',
    question: 'Which tax years are involved?',
    type: 'multi_choice',
    options: [
      { value: '2020', label: '2020' },
      { value: '2021', label: '2021' },
      { value: '2022', label: '2022' },
      { value: '2023', label: '2023' },
      { value: '2024', label: '2024' },
      { value: '2025', label: '2025' },
    ],
    required: true,
    depends_on: { question_id: 'purpose', value: ['tax', 'forensic', 'litigation'] },
  },

  // STEP 5: Accounting Method
  {
    id: 'accounting_method',
    question: 'What accounting method does the entity use?',
    type: 'single_choice',
    options: [
      { value: 'cash', label: 'Cash Basis', description: 'Income/expenses recognized when cash changes hands' },
      { value: 'accrual', label: 'Accrual Basis', description: 'Income/expenses recognized when earned/incurred' },
      { value: 'unknown', label: 'Unknown', description: 'Will need to determine' },
    ],
    required: true,
  },

  // STEP 6: Data Sources
  {
    id: 'data_sources',
    question: 'What data sources are available?',
    type: 'multi_choice',
    options: [
      { value: 'bank_statement', label: 'Bank Statements' },
      { value: 'gl_export', label: 'General Ledger Export' },
      { value: 'trial_balance', label: 'Trial Balance' },
      { value: 'tax_return', label: 'Tax Returns' },
      { value: 'payroll_records', label: 'Payroll Records' },
      { value: 'invoices', label: 'Invoices (AR/AP)' },
      { value: 'contracts', label: 'Contracts' },
      { value: 'credit_cards', label: 'Credit Card Statements' },
      { value: 'pos_data', label: 'POS/Sales Data' },
      { value: 'other', label: 'Other' },
    ],
    required: true,
    help_text: 'Select all that apply',
  },
  {
    id: 'data_directory',
    question: 'Where is the data located?',
    type: 'file_path',
    required: true,
    help_text: 'Full path to directory containing financial data',
  },

  // STEP 7: Urgency
  {
    id: 'urgency',
    question: 'What is the urgency level?',
    type: 'single_choice',
    options: [
      { value: 'routine', label: 'Routine', description: 'Standard turnaround' },
      { value: 'priority', label: 'Priority', description: 'Expedited processing needed' },
      { value: 'urgent', label: 'Urgent', description: 'Time-sensitive matter' },
      { value: 'emergency', label: 'Emergency', description: 'Immediate attention required (trial, deadline)' },
    ],
    required: true,
  },

  // STEP 8: Output Requirements
  {
    id: 'output_formats',
    question: 'What output formats are needed?',
    type: 'multi_choice',
    options: [
      { value: 'markdown_report', label: 'Markdown Reports' },
      { value: 'pdf', label: 'PDF Reports' },
      { value: 'excel', label: 'Excel Workbooks' },
      { value: 'csv', label: 'CSV Data Files' },
      { value: 'json', label: 'JSON Data' },
      { value: 'html', label: 'HTML Reports' },
      { value: 'graphics', label: 'Charts & Graphics' },
    ],
    required: true,
    help_text: 'Select all that apply',
  },
  // STEP 8b: Accounting Software Export
  {
    id: 'accounting_software',
    question: 'Export to which accounting software?',
    type: 'multi_choice',
    options: [
      { value: 'none', label: 'None', description: 'No accounting software export needed' },
      { value: 'quickbooks_desktop', label: 'QuickBooks Desktop', description: 'IIF format for QB Desktop' },
      { value: 'quickbooks_online', label: 'QuickBooks Online', description: 'Bank feed CSV format' },
      { value: 'xero', label: 'Xero', description: 'Xero statement import format' },
      { value: 'sage', label: 'Sage 50/Intacct', description: 'Sage import format' },
      { value: 'freshbooks', label: 'FreshBooks', description: 'FreshBooks import format' },
      { value: 'wave', label: 'Wave Accounting', description: 'Wave import format' },
      { value: 'zoho_books', label: 'Zoho Books', description: 'Zoho Books import format' },
    ],
    required: false,
    depends_on: { question_id: 'purpose', value: ['accounting', 'dashboard'] },
    help_text: 'Select accounting software for direct import capability',
  },
  {
    id: 'output_directory',
    question: 'Where should outputs be saved?',
    type: 'file_path',
    required: true,
    help_text: 'Full path to output directory',
  },

  // STEP 9: Special Instructions
  {
    id: 'case_number',
    question: 'Case/Matter number (if applicable)?',
    type: 'text',
    required: false,
    depends_on: { question_id: 'purpose', value: ['tax', 'forensic', 'litigation'] },
  },
  {
    id: 'special_instructions',
    question: 'Any special instructions or notes?',
    type: 'text',
    required: false,
    help_text: 'Additional context or requirements',
  },
];

// ============================================================================
// WORKFLOW ROUTING
// ============================================================================

export interface WorkflowRouting {
  workflow_type: WorkflowType;
  workflow_name: string;
  module_path: string;
  entry_function: string;
  required_data: string[];
  generates_outputs: string[];
  estimated_phases: number;
  description: string;
}

export const WORKFLOW_REGISTRY: Record<WorkflowType, WorkflowRouting> = {
  gaap_accounting: {
    workflow_type: 'gaap_accounting',
    workflow_name: 'GAAP-Compliant Accounting Engine',
    module_path: '../modules/gaap_accounting_engine',
    entry_function: 'runAccountingWorkflow',
    required_data: ['bank_statement'],
    generates_outputs: ['income_statement', 'balance_sheet', 'cash_flow', 'trial_balance', 'tax_summary', 'exports'],
    estimated_phases: 8,
    description: 'Full financial statement generation from raw bank data',
  },
  tax_defense: {
    workflow_type: 'tax_defense',
    workflow_name: 'IRS Tax Defense & Audit Preparation',
    module_path: '../modules/irs_tax_defense',
    entry_function: 'runTaxDefenseWorkflow',
    required_data: ['bank_statement', 'tax_return'],
    generates_outputs: ['scorecard', 'red_flags', 'penalty_analysis', 'criminal_exposure', 'defense_memo'],
    estimated_phases: 11,
    description: 'Comprehensive IRS audit defense with multi-lens analysis',
  },
  forensic_investigation: {
    workflow_type: 'forensic_investigation',
    workflow_name: 'Forensic Fraud Investigation',
    module_path: '../modules/forensic',
    entry_function: 'runForensicWorkflow',
    required_data: ['bank_statement', 'gl_export'],
    generates_outputs: ['fraud_report', 'transaction_tracing', 'source_use_funds', 'timeline'],
    estimated_phases: 15,
    description: 'Comprehensive fraud examination and investigation',
  },
  aml_compliance: {
    workflow_type: 'aml_compliance',
    workflow_name: 'AML/BSA Compliance Review',
    module_path: '../modules/fincen_aml',
    entry_function: 'runAMLWorkflow',
    required_data: ['bank_statement'],
    generates_outputs: ['aml_report', 'sar_candidates', 'structuring_analysis', 'kyc_review'],
    estimated_phases: 7,
    description: 'Anti-money laundering and Bank Secrecy Act compliance',
  },
  sec_disclosure: {
    workflow_type: 'sec_disclosure',
    workflow_name: 'SEC Disclosure Analysis',
    module_path: '../modules/sec',
    entry_function: 'runSECWorkflow',
    required_data: ['gl_export', 'trial_balance'],
    generates_outputs: ['disclosure_checklist', 'materiality_analysis', 'related_party_review'],
    estimated_phases: 6,
    description: 'Public company disclosure and compliance analysis',
  },
  controls_sox: {
    workflow_type: 'controls_sox',
    workflow_name: 'SOX Compliance & Internal Controls',
    module_path: '../modules/controls_sox',
    entry_function: 'runSOXWorkflow',
    required_data: ['gl_export', 'invoices'],
    generates_outputs: ['control_matrix', 'testing_results', 'deficiency_report', 'management_letter'],
    estimated_phases: 8,
    description: 'Internal controls testing and SOX 404 compliance',
  },
  cfo_dashboard: {
    workflow_type: 'cfo_dashboard',
    workflow_name: 'CFO Executive Dashboard',
    module_path: '../modules/cfo',
    entry_function: 'runCFODashboard',
    required_data: ['gl_export', 'trial_balance'],
    generates_outputs: ['kpi_dashboard', 'trend_analysis', 'forecast', 'alerts'],
    estimated_phases: 5,
    description: 'Executive-level financial dashboard and KPIs',
  },
  payroll_forensics: {
    workflow_type: 'payroll_forensics',
    workflow_name: 'Payroll Forensics',
    module_path: '../modules/payroll_forensics',
    entry_function: 'runPayrollForensics',
    required_data: ['payroll_records', 'bank_statement'],
    generates_outputs: ['ghost_employee_analysis', 'payroll_variance', 'benefit_fraud'],
    estimated_phases: 6,
    description: 'Payroll fraud detection and ghost employee analysis',
  },
  litigation_support: {
    workflow_type: 'litigation_support',
    workflow_name: 'Litigation Support',
    module_path: '../modules/litigation_finance',
    entry_function: 'runLitigationSupport',
    required_data: ['bank_statement', 'contracts'],
    generates_outputs: ['damages_calculation', 'expert_report', 'exhibits', 'timeline'],
    estimated_phases: 10,
    description: 'Litigation support and expert witness preparation',
  },
  settlement_analysis: {
    workflow_type: 'settlement_analysis',
    workflow_name: 'Settlement Modeling & Analysis',
    module_path: '../modules/settlement_engine',
    entry_function: 'runSettlementAnalysis',
    required_data: ['damages_data'],
    generates_outputs: ['settlement_model', 'negotiation_strategy', 'present_value'],
    estimated_phases: 4,
    description: 'Settlement modeling and negotiation analysis',
  },
  trial_support: {
    workflow_type: 'trial_support',
    workflow_name: 'Real-Time Trial Support',
    module_path: '../modules/realtime_trial',
    entry_function: 'runTrialSupport',
    required_data: ['case_documents'],
    generates_outputs: ['impeachment_analysis', 'exhibit_summary', 'rapid_response'],
    estimated_phases: 3,
    description: 'Real-time trial support and rapid response',
  },
  asset_tracing: {
    workflow_type: 'asset_tracing',
    workflow_name: 'Asset Tracing & Recovery',
    module_path: '../modules/asset_tracing',
    entry_function: 'runAssetTracing',
    required_data: ['bank_statement', 'tax_return'],
    generates_outputs: ['asset_inventory', 'flow_of_funds', 'hidden_assets'],
    estimated_phases: 8,
    description: 'Asset tracing, location, and recovery analysis',
  },
  reconciliation: {
    workflow_type: 'reconciliation',
    workflow_name: 'Account Reconciliation',
    module_path: '../modules/reconciliation',
    entry_function: 'runReconciliation',
    required_data: ['bank_statement', 'gl_export'],
    generates_outputs: ['reconciliation_report', 'variance_analysis', 'adjusting_entries'],
    estimated_phases: 4,
    description: 'Bank, AR, AP, and GL reconciliation',
  },
  ap_procurement: {
    workflow_type: 'ap_procurement',
    workflow_name: 'AP/Procurement Fraud Detection',
    module_path: '../modules/ap_procurement',
    entry_function: 'runAPProcurement',
    required_data: ['invoices', 'gl_export'],
    generates_outputs: ['vendor_analysis', 'duplicate_payments', 'kickback_indicators'],
    estimated_phases: 6,
    description: 'Accounts payable and procurement fraud detection',
  },
  statistical_anomalies: {
    workflow_type: 'statistical_anomalies',
    workflow_name: 'Statistical Anomaly Detection',
    module_path: '../modules/statistical_anomalies',
    entry_function: 'runStatisticalAnalysis',
    required_data: ['gl_export'],
    generates_outputs: ['benford_analysis', 'outliers', 'trend_breaks', 'correlation'],
    estimated_phases: 5,
    description: 'Benford\'s Law and statistical anomaly detection',
  },
  records_intelligence: {
    workflow_type: 'records_intelligence',
    workflow_name: 'Records Intelligence & Reconstruction',
    module_path: '../modules/records_intelligence',
    entry_function: 'runRecordsReconstruction',
    required_data: ['bank_statement'],
    generates_outputs: ['reconstructed_gl', 'estimated_income', 'expense_analysis'],
    estimated_phases: 7,
    description: 'Reconstruct financial records from incomplete data',
  },
  financial_reporting: {
    workflow_type: 'financial_reporting',
    workflow_name: 'Financial Statement Generation',
    module_path: '../modules/gaap_accounting_engine',
    entry_function: 'generateFinancialStatements',
    required_data: ['trial_balance'],
    generates_outputs: ['income_statement', 'balance_sheet', 'cash_flow', 'notes'],
    estimated_phases: 3,
    description: 'Generate financial statements from trial balance',
  },
  custom: {
    workflow_type: 'custom',
    workflow_name: 'Custom Workflow',
    module_path: '../workflows/custom',
    entry_function: 'runCustomWorkflow',
    required_data: [],
    generates_outputs: [],
    estimated_phases: 0,
    description: 'Custom workflow based on specific requirements',
  },

  // ============================================================================
  // IRS TAX DEFENSE ADVANCED MODULES
  // ============================================================================

  non_filer: {
    workflow_type: 'non_filer',
    workflow_name: 'Non-Filer Defense & Compliance',
    module_path: '../modules/irs_tax_defense/non_filer_defense',
    entry_function: 'analyzeNonFilerCase',
    required_data: ['bank_statement', 'irs_notices'],
    generates_outputs: ['defense_memo', 'letter_templates', 'resolution_roadmap', 'filing_timeline'],
    estimated_phases: 6,
    description: 'IRS non-filer defense, SFR response, compliance strategy',
  },
  sfr_attack: {
    workflow_type: 'sfr_attack',
    workflow_name: 'SFR Attack & Reconsideration',
    module_path: '../modules/irs_tax_defense/sfr_attack',
    entry_function: 'analyzeSFRCase',
    required_data: ['irs_notices', 'tax_return', 'bank_statement'],
    generates_outputs: ['sfr_analysis', 'reconsideration_request', 'procedural_path', 'attack_strategy'],
    estimated_phases: 5,
    description: 'IRC §6020(b) Substitute for Return attack and reconsideration',
  },
  collection_defense: {
    workflow_type: 'collection_defense',
    workflow_name: 'Collection Defense',
    module_path: '../modules/irs_tax_defense/collection_defense',
    entry_function: 'analyzeCollectionCase',
    required_data: ['irs_notices', 'bank_statement', 'financial_data'],
    generates_outputs: ['collection_analysis', 'cdp_request', 'levy_release', 'collection_alternative'],
    estimated_phases: 7,
    description: 'Defense against levies, liens, and garnishments',
  },
  appeals_protest: {
    workflow_type: 'appeals_protest',
    workflow_name: 'IRS Appeals Protest Generator',
    module_path: '../modules/irs_tax_defense/advanced_modules',
    entry_function: 'generateAppealsProtest',
    required_data: ['irs_notices', 'audit_documents'],
    generates_outputs: ['formal_protest', 'issue_analysis', 'legal_arguments', 'exhibits'],
    estimated_phases: 4,
    description: 'Generate formal IRS Appeals Office protests',
  },
  criminal_risk: {
    workflow_type: 'criminal_risk',
    workflow_name: 'Criminal Exposure Risk Detection',
    module_path: '../modules/irs_tax_defense/advanced_modules',
    entry_function: 'assessCriminalRisk',
    required_data: ['bank_statement', 'tax_return', 'transaction_data'],
    generates_outputs: ['risk_assessment', 'badge_matrix', 'mitigation_plan', 'ci_likelihood'],
    estimated_phases: 5,
    description: 'Detect criminal tax exposure and CI referral risk',
  },
  penalty_optimizer: {
    workflow_type: 'penalty_optimizer',
    workflow_name: 'Penalty Reduction Optimizer',
    module_path: '../modules/irs_tax_defense/advanced_modules',
    entry_function: 'optimizePenaltyReduction',
    required_data: ['irs_notices', 'penalty_data'],
    generates_outputs: ['penalty_analysis', 'abatement_letter', 'fta_eligibility', 'reasonable_cause'],
    estimated_phases: 4,
    description: 'Optimize penalty reduction and abatement strategies',
  },
  transcript_analysis: {
    workflow_type: 'transcript_analysis',
    workflow_name: 'IRS Transcript Analyzer',
    module_path: '../modules/irs_tax_defense/advanced_modules',
    entry_function: 'analyzeTranscript',
    required_data: ['irs_transcript'],
    generates_outputs: ['transcript_decode', 'timeline', 'red_flags', 'action_items'],
    estimated_phases: 3,
    description: 'Decode and analyze IRS account transcripts',
  },
  audit_defense: {
    workflow_type: 'audit_defense',
    workflow_name: 'Audit Defense Strategy Engine',
    module_path: '../modules/irs_tax_defense/advanced_modules',
    entry_function: 'buildAuditDefenseStrategy',
    required_data: ['audit_notice', 'tax_return', 'supporting_docs'],
    generates_outputs: ['defense_strategy', 'idr_responses', 'document_requests', 'timeline'],
    estimated_phases: 6,
    description: 'Build comprehensive IRS audit defense strategy',
  },
  oic_builder: {
    workflow_type: 'oic_builder',
    workflow_name: 'Offer in Compromise Builder',
    module_path: '../modules/irs_tax_defense/advanced_modules',
    entry_function: 'buildOICStrategy',
    required_data: ['financial_data', 'tax_liability', 'form_433'],
    generates_outputs: ['oic_analysis', 'rcp_calculation', 'offer_amount', 'form_656'],
    estimated_phases: 5,
    description: 'Build and analyze IRS Offer in Compromise applications',
  },
  evidence_package: {
    workflow_type: 'evidence_package',
    workflow_name: 'Evidence Packaging System',
    module_path: '../modules/irs_tax_defense/advanced_modules',
    entry_function: 'packageEvidence',
    required_data: ['case_documents', 'exhibits'],
    generates_outputs: ['evidence_binder', 'exhibit_index', 'chain_of_custody', 'court_ready_package'],
    estimated_phases: 4,
    description: 'Package evidence for court or administrative proceedings',
  },
  form_433_analysis: {
    workflow_type: 'form_433_analysis',
    workflow_name: 'Financial Statement Analyzer (Form 433)',
    module_path: '../modules/irs_tax_defense/litigation_modules',
    entry_function: 'analyzeForm433',
    required_data: ['form_433', 'financial_data'],
    generates_outputs: ['financial_analysis', 'rcp_calculation', 'expense_allowances', 'recommendations'],
    estimated_phases: 4,
    description: 'Analyze IRS Form 433-A/F financial statements',
  },
  tax_court_petition: {
    workflow_type: 'tax_court_petition',
    workflow_name: 'Tax Court Petition Builder',
    module_path: '../modules/irs_tax_defense/litigation_modules',
    entry_function: 'buildTaxCourtPetition',
    required_data: ['notice_deficiency', 'tax_return', 'supporting_docs'],
    generates_outputs: ['petition', 'statement_of_issues', 'stipulations', 'timeline'],
    estimated_phases: 5,
    description: 'Build U.S. Tax Court petitions',
  },
  settlement_probability: {
    workflow_type: 'settlement_probability',
    workflow_name: 'Settlement Probability Model',
    module_path: '../modules/irs_tax_defense/litigation_modules',
    entry_function: 'calculateSettlementProbability',
    required_data: ['case_data', 'legal_issues'],
    generates_outputs: ['probability_analysis', 'settlement_range', 'risk_factors', 'recommendation'],
    estimated_phases: 3,
    description: 'Calculate IRS settlement probability and optimal offer',
  },
  trial_strategy: {
    workflow_type: 'trial_strategy',
    workflow_name: 'Tax Court Trial Strategy',
    module_path: '../modules/irs_tax_defense/litigation_modules',
    entry_function: 'buildTrialStrategy',
    required_data: ['case_documents', 'discovery', 'witness_list'],
    generates_outputs: ['trial_brief', 'witness_prep', 'exhibit_list', 'opening_closing'],
    estimated_phases: 7,
    description: 'Build comprehensive Tax Court trial strategy',
  },
  procedure_violations: {
    workflow_type: 'procedure_violations',
    workflow_name: 'IRS Procedure Violation Detector',
    module_path: '../modules/irs_tax_defense/litigation_modules',
    entry_function: 'detectProcedureViolations',
    required_data: ['irs_correspondence', 'case_history'],
    generates_outputs: ['violation_report', 'irm_citations', 'due_process_issues', 'motion_support'],
    estimated_phases: 4,
    description: 'Detect IRS procedural violations and IRM non-compliance',
  },
  case_memory: {
    workflow_type: 'case_memory',
    workflow_name: 'Case Memory & Strategy Continuity',
    module_path: '../modules/irs_tax_defense/litigation_modules',
    entry_function: 'manageCaseMemory',
    required_data: ['case_history', 'prior_analysis'],
    generates_outputs: ['case_summary', 'strategy_timeline', 'decision_log', 'continuity_report'],
    estimated_phases: 2,
    description: 'Track case strategy and maintain continuity',
  },
  doj_litigation: {
    workflow_type: 'doj_litigation',
    workflow_name: 'DOJ Tax Division Litigation',
    module_path: '../modules/irs_tax_defense/litigation_modules',
    entry_function: 'buildDOJLitigationStrategy',
    required_data: ['doj_complaint', 'case_documents', 'discovery'],
    generates_outputs: ['defense_strategy', 'discovery_responses', 'motion_practice', 'settlement_analysis'],
    estimated_phases: 8,
    description: 'DOJ Tax Division civil litigation defense',
  },
  refund_suit: {
    workflow_type: 'refund_suit',
    workflow_name: 'Federal District Court Refund Suit',
    module_path: '../modules/irs_tax_defense/litigation_modules',
    entry_function: 'buildRefundSuit',
    required_data: ['claim_denial', 'payment_proof', 'amended_returns'],
    generates_outputs: ['complaint', 'legal_memo', 'discovery_plan', 'motion_practice'],
    estimated_phases: 6,
    description: 'Federal district court tax refund litigation',
  },
  case_router: {
    workflow_type: 'case_router',
    workflow_name: 'Tax Case Router',
    module_path: '../modules/irs_tax_defense/case_router',
    entry_function: 'routeTaxCase',
    required_data: ['case_summary', 'irs_notices'],
    generates_outputs: ['routing_analysis', 'recommended_path', 'module_bundle', 'timeline'],
    estimated_phases: 2,
    description: 'Route tax cases to appropriate jurisdiction and strategy',
  },
  tax_orchestrator: {
    workflow_type: 'tax_orchestrator',
    workflow_name: 'Master Tax Controversy Orchestrator',
    module_path: '../modules/irs_tax_defense/master_orchestrator',
    entry_function: 'orchestrateTaxCase',
    required_data: ['case_summary', 'irs_notices', 'financial_data'],
    generates_outputs: ['complete_case_file', 'strategy_plan', 'module_outputs', 'timeline', 'manifest'],
    estimated_phases: 10,
    description: 'Master orchestrator coordinating all tax defense modules',
  },
};

// ============================================================================
// INTAKE PROCESSOR
// ============================================================================

export function processIntakeAnswers(answers: IntakeAnswer[]): WorkflowConfig {
  const answerMap = new Map(answers.map(a => [a.question_id, a.value]));

  // Determine workflow type based on answers
  const purpose = answerMap.get('purpose') as string;
  let workflow_type: WorkflowType = 'custom';

  switch (purpose) {
    case 'accounting':
      workflow_type = answerMap.get('workflow_accounting') as WorkflowType || 'gaap_accounting';
      break;
    case 'tax':
      workflow_type = answerMap.get('workflow_tax') as WorkflowType || 'tax_defense';
      break;
    case 'forensic':
      workflow_type = answerMap.get('workflow_forensic') as WorkflowType || 'forensic_investigation';
      break;
    case 'compliance':
      workflow_type = answerMap.get('workflow_compliance') as WorkflowType || 'aml_compliance';
      break;
    case 'litigation':
      workflow_type = answerMap.get('workflow_litigation') as WorkflowType || 'litigation_support';
      break;
    case 'dashboard':
      workflow_type = 'cfo_dashboard';
      break;
  }

  // Build data sources array
  const dataSourceTypes = answerMap.get('data_sources') as string[] || [];
  const data_sources: DataSource[] = dataSourceTypes.map(type => ({
    type: type as any,
    file_path: answerMap.get('data_directory') as string,
  }));

  // Build output requirements
  const outputFormats = answerMap.get('output_formats') as string[] || ['markdown_report'];
  const output_requirements: OutputRequirement[] = outputFormats.map(format => ({
    type: format as any,
    destination: answerMap.get('output_directory') as string,
  }));

  return {
    workflow_type,
    entity_name: answerMap.get('entity_name') as string || 'Unknown Entity',
    entity_type: answerMap.get('entity_type') as any || 'llc',
    industry: answerMap.get('industry') as string,
    fiscal_year_start: answerMap.get('fiscal_year_start') as string || `${new Date().getFullYear()}-01-01`,
    fiscal_year_end: answerMap.get('fiscal_year_end') as string || `${new Date().getFullYear()}-12-31`,
    tax_years: answerMap.get('tax_years') as string[] || [new Date().getFullYear().toString()],
    accounting_method: answerMap.get('accounting_method') as any || 'cash',
    data_sources,
    urgency: answerMap.get('urgency') as any || 'routine',
    case_number: answerMap.get('case_number') as string,
    output_requirements,
    special_instructions: answerMap.get('special_instructions') as string,
  };
}

export function getWorkflowRouting(workflow_type: WorkflowType): WorkflowRouting {
  return WORKFLOW_REGISTRY[workflow_type];
}

// ============================================================================
// WORKFLOW TRIGGER FUNCTIONS
// ============================================================================

export async function triggerWorkflow(config: WorkflowConfig): Promise<{
  success: boolean;
  workflow_id: string;
  message: string;
  output_path?: string;
}> {
  const routing = getWorkflowRouting(config.workflow_type);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`INITIATING WORKFLOW: ${routing.workflow_name}`);
  console.log(`${'='.repeat(70)}\n`);
  console.log(`Entity: ${config.entity_name}`);
  console.log(`Type: ${config.entity_type}`);
  console.log(`Period: ${config.fiscal_year_start} to ${config.fiscal_year_end}`);
  console.log(`Urgency: ${config.urgency.toUpperCase()}`);
  console.log(`Estimated Phases: ${routing.estimated_phases}`);
  console.log(`\nDescription: ${routing.description}`);
  console.log(`\n${'='.repeat(70)}\n`);

  const workflow_id = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    workflow_id,
    message: `Workflow ${routing.workflow_name} initiated successfully`,
    output_path: config.output_requirements[0]?.destination,
  };
}

// ============================================================================
// COMMAND TRIGGERS
// ============================================================================

export const WORKFLOW_COMMANDS: Record<string, {
  command: string;
  description: string;
  workflow_type: WorkflowType;
  quick_start: boolean;
}> = {
  '/financial-intake': {
    command: '/financial-intake',
    description: 'Start guided intake process',
    workflow_type: 'custom',
    quick_start: false,
  },
  '/accounting': {
    command: '/accounting',
    description: 'Generate GAAP-compliant financials from bank statements',
    workflow_type: 'gaap_accounting',
    quick_start: true,
  },
  '/tax-defense': {
    command: '/tax-defense',
    description: 'IRS audit defense and tax controversy analysis',
    workflow_type: 'tax_defense',
    quick_start: true,
  },
  '/forensic': {
    command: '/forensic',
    description: 'Forensic fraud investigation',
    workflow_type: 'forensic_investigation',
    quick_start: true,
  },
  '/aml': {
    command: '/aml',
    description: 'Anti-money laundering compliance review',
    workflow_type: 'aml_compliance',
    quick_start: true,
  },
  '/sec': {
    command: '/sec',
    description: 'SEC disclosure analysis',
    workflow_type: 'sec_disclosure',
    quick_start: true,
  },
  '/sox': {
    command: '/sox',
    description: 'SOX compliance and internal controls testing',
    workflow_type: 'controls_sox',
    quick_start: true,
  },
  '/cfo': {
    command: '/cfo',
    description: 'CFO executive dashboard',
    workflow_type: 'cfo_dashboard',
    quick_start: true,
  },
  '/payroll-fraud': {
    command: '/payroll-fraud',
    description: 'Payroll fraud and ghost employee detection',
    workflow_type: 'payroll_forensics',
    quick_start: true,
  },
  '/litigation': {
    command: '/litigation',
    description: 'Litigation support and expert witness',
    workflow_type: 'litigation_support',
    quick_start: true,
  },
  '/settlement': {
    command: '/settlement',
    description: 'Settlement modeling and analysis',
    workflow_type: 'settlement_analysis',
    quick_start: true,
  },
  '/trial': {
    command: '/trial',
    description: 'Real-time trial support',
    workflow_type: 'trial_support',
    quick_start: true,
  },
  '/asset-trace': {
    command: '/asset-trace',
    description: 'Asset tracing and recovery',
    workflow_type: 'asset_tracing',
    quick_start: true,
  },
  '/reconcile': {
    command: '/reconcile',
    description: 'Account reconciliation',
    workflow_type: 'reconciliation',
    quick_start: true,
  },
  '/ap-fraud': {
    command: '/ap-fraud',
    description: 'AP/Procurement fraud detection',
    workflow_type: 'ap_procurement',
    quick_start: true,
  },
  '/statistics': {
    command: '/statistics',
    description: 'Statistical anomaly detection',
    workflow_type: 'statistical_anomalies',
    quick_start: true,
  },
  '/reconstruct': {
    command: '/reconstruct',
    description: 'Records reconstruction',
    workflow_type: 'records_intelligence',
    quick_start: true,
  },
  '/reports': {
    command: '/reports',
    description: 'Generate financial reports',
    workflow_type: 'financial_reporting',
    quick_start: true,
  },

  // ============================================================================
  // IRS TAX DEFENSE COMMANDS
  // ============================================================================

  '/non-filer': {
    command: '/non-filer',
    description: 'Non-filer defense and compliance strategy',
    workflow_type: 'non_filer',
    quick_start: true,
  },
  '/sfr-attack': {
    command: '/sfr-attack',
    description: 'SFR (Substitute for Return) attack and reconsideration',
    workflow_type: 'sfr_attack',
    quick_start: true,
  },
  '/collection-defense': {
    command: '/collection-defense',
    description: 'Collection defense (levies, liens, garnishments)',
    workflow_type: 'collection_defense',
    quick_start: true,
  },
  '/appeals-protest': {
    command: '/appeals-protest',
    description: 'IRS Appeals formal protest generator',
    workflow_type: 'appeals_protest',
    quick_start: true,
  },
  '/criminal-risk': {
    command: '/criminal-risk',
    description: 'Criminal tax exposure risk assessment',
    workflow_type: 'criminal_risk',
    quick_start: true,
  },
  '/penalty-optimizer': {
    command: '/penalty-optimizer',
    description: 'Penalty reduction and abatement optimization',
    workflow_type: 'penalty_optimizer',
    quick_start: true,
  },
  '/transcript-analysis': {
    command: '/transcript-analysis',
    description: 'IRS transcript decode and analysis',
    workflow_type: 'transcript_analysis',
    quick_start: true,
  },
  '/audit-defense': {
    command: '/audit-defense',
    description: 'IRS audit defense strategy engine',
    workflow_type: 'audit_defense',
    quick_start: true,
  },
  '/oic-builder': {
    command: '/oic-builder',
    description: 'Offer in Compromise builder and analysis',
    workflow_type: 'oic_builder',
    quick_start: true,
  },
  '/evidence-package': {
    command: '/evidence-package',
    description: 'Evidence packaging for court/admin proceedings',
    workflow_type: 'evidence_package',
    quick_start: true,
  },
  '/433-analysis': {
    command: '/433-analysis',
    description: 'Form 433-A/F financial statement analyzer',
    workflow_type: 'form_433_analysis',
    quick_start: true,
  },
  '/tax-court-petition': {
    command: '/tax-court-petition',
    description: 'U.S. Tax Court petition builder',
    workflow_type: 'tax_court_petition',
    quick_start: true,
  },
  '/settlement-probability': {
    command: '/settlement-probability',
    description: 'IRS settlement probability calculator',
    workflow_type: 'settlement_probability',
    quick_start: true,
  },
  '/trial-strategy': {
    command: '/trial-strategy',
    description: 'Tax Court trial strategy builder',
    workflow_type: 'trial_strategy',
    quick_start: true,
  },
  '/procedure-violations': {
    command: '/procedure-violations',
    description: 'IRS procedure violation detector',
    workflow_type: 'procedure_violations',
    quick_start: true,
  },
  '/case-memory': {
    command: '/case-memory',
    description: 'Case memory and strategy continuity',
    workflow_type: 'case_memory',
    quick_start: true,
  },
  '/doj-litigation': {
    command: '/doj-litigation',
    description: 'DOJ Tax Division litigation defense',
    workflow_type: 'doj_litigation',
    quick_start: true,
  },
  '/refund-suit': {
    command: '/refund-suit',
    description: 'Federal district court refund suit',
    workflow_type: 'refund_suit',
    quick_start: true,
  },
  '/case-router': {
    command: '/case-router',
    description: 'Tax case jurisdiction and strategy router',
    workflow_type: 'case_router',
    quick_start: true,
  },
  '/tax-orchestrator': {
    command: '/tax-orchestrator',
    description: 'Master tax controversy orchestrator',
    workflow_type: 'tax_orchestrator',
    quick_start: false,
  },
};

// ============================================================================
// MASTER INTAKE RUNNER
// ============================================================================

export interface MasterIntakeResult {
  config: WorkflowConfig;
  routing: WorkflowRouting;
  additional_modules: WorkflowType[];
  accounting_software_exports: string[];
  deadline_summary?: {
    entity_type: string;
    upcoming_deadlines: { date: string; description: string; form: string }[];
  };
}

/**
 * Run the master intake process
 * This function coordinates the full intake flow:
 * 1. Ask purpose/workflow questions
 * 2. Collect entity and data source info
 * 3. Determine output formats and accounting software
 * 4. Route to appropriate workflow(s)
 * 5. Generate deadline summary based on entity type
 */
export function runMasterIntake(answers: IntakeAnswer[]): MasterIntakeResult {
  const config = processIntakeAnswers(answers);
  const routing = getWorkflowRouting(config.workflow_type);

  const answerMap = new Map(answers.map(a => [a.question_id, a.value]));

  // Get additional modules if selected
  const additional_modules = (answerMap.get('workflow_tax_advanced') as string[] || [])
    .filter(m => m !== 'none') as WorkflowType[];

  // Get accounting software exports if selected
  const accounting_software_exports = (answerMap.get('accounting_software') as string[] || [])
    .filter(s => s !== 'none');

  // Generate deadline summary based on entity type
  const deadline_summary = generateDeadlineSummaryForEntity(config.entity_type, config.fiscal_year_end);

  return {
    config,
    routing,
    additional_modules,
    accounting_software_exports,
    deadline_summary,
  };
}

/**
 * Generate deadline summary for entity type
 */
function generateDeadlineSummaryForEntity(
  entityType: string,
  fiscalYearEnd: string
): { entity_type: string; upcoming_deadlines: { date: string; description: string; form: string }[] } {
  const deadlines: { date: string; description: string; form: string }[] = [];
  const year = new Date().getFullYear();

  // Entity-specific deadlines
  switch (entityType) {
    case 'individual':
    case 'sole_prop':
    case 'llc':
      deadlines.push(
        { date: `${year}-04-15`, description: 'Individual Income Tax Return Due', form: '1040' },
        { date: `${year}-04-15`, description: 'Q1 Estimated Tax Due', form: '1040-ES' },
        { date: `${year}-06-15`, description: 'Q2 Estimated Tax Due', form: '1040-ES' },
        { date: `${year}-09-15`, description: 'Q3 Estimated Tax Due', form: '1040-ES' },
        { date: `${year}-10-15`, description: 'Extended Return Due', form: '1040' },
        { date: `${year + 1}-01-15`, description: 'Q4 Estimated Tax Due', form: '1040-ES' },
      );
      break;
    case 'partnership':
    case 'llc_multi':
      deadlines.push(
        { date: `${year}-03-15`, description: 'Partnership Return Due', form: '1065' },
        { date: `${year}-03-15`, description: 'K-1s Due to Partners', form: 'Schedule K-1' },
        { date: `${year}-09-15`, description: 'Extended Partnership Return Due', form: '1065' },
      );
      break;
    case 'scorp':
      deadlines.push(
        { date: `${year}-03-15`, description: 'S Corporation Return Due', form: '1120-S' },
        { date: `${year}-03-15`, description: 'K-1s Due to Shareholders', form: 'Schedule K-1' },
        { date: `${year}-09-15`, description: 'Extended S Corp Return Due', form: '1120-S' },
      );
      break;
    case 'ccorp':
      deadlines.push(
        { date: `${year}-04-15`, description: 'C Corporation Return Due', form: '1120' },
        { date: `${year}-04-15`, description: 'Q1 Estimated Tax Due', form: '1120-W' },
        { date: `${year}-06-15`, description: 'Q2 Estimated Tax Due', form: '1120-W' },
        { date: `${year}-09-15`, description: 'Q3 Estimated Tax Due', form: '1120-W' },
        { date: `${year}-10-15`, description: 'Extended C Corp Return Due', form: '1120' },
        { date: `${year}-12-15`, description: 'Q4 Estimated Tax Due', form: '1120-W' },
      );
      break;
    case 'trust':
    case 'estate':
      deadlines.push(
        { date: `${year}-04-15`, description: 'Trust/Estate Return Due', form: '1041' },
        { date: `${year}-04-15`, description: 'K-1s Due to Beneficiaries', form: 'Schedule K-1' },
        { date: `${year}-09-30`, description: 'Extended Trust/Estate Return Due', form: '1041' },
      );
      break;
    case 'nonprofit':
      deadlines.push(
        { date: `${year}-05-15`, description: 'Nonprofit Return Due', form: '990' },
        { date: `${year}-11-15`, description: 'Extended Nonprofit Return Due', form: '990' },
      );
      break;
  }

  // Sort by date
  deadlines.sort((a, b) => a.date.localeCompare(b.date));

  // Filter to upcoming deadlines (within next 12 months)
  const today = new Date().toISOString().split('T')[0];
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const upcoming_deadlines = deadlines.filter(d => d.date >= today && d.date <= oneYearFromNow);

  return {
    entity_type: entityType,
    upcoming_deadlines,
  };
}

/**
 * Generate intake summary report
 */
export function generateIntakeSummaryReport(result: MasterIntakeResult): string {
  const lines: string[] = [];

  lines.push('# Financial Intelligence Intake Summary');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');

  lines.push('## Entity Information');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Entity Name | ${result.config.entity_name} |`);
  lines.push(`| Entity Type | ${result.config.entity_type} |`);
  lines.push(`| Industry | ${result.config.industry || 'Not specified'} |`);
  lines.push(`| Fiscal Year | ${result.config.fiscal_year_start} to ${result.config.fiscal_year_end} |`);
  lines.push(`| Accounting Method | ${result.config.accounting_method} |`);
  lines.push('');

  lines.push('## Workflow Selected');
  lines.push('');
  lines.push(`**Primary Workflow:** ${result.routing.workflow_name}`);
  lines.push('');
  lines.push(`**Description:** ${result.routing.description}`);
  lines.push('');
  lines.push(`**Estimated Phases:** ${result.routing.estimated_phases}`);
  lines.push('');

  if (result.additional_modules.length > 0) {
    lines.push('## Additional Analysis Modules');
    lines.push('');
    result.additional_modules.forEach(m => {
      const moduleRouting = WORKFLOW_REGISTRY[m];
      if (moduleRouting) {
        lines.push(`- **${moduleRouting.workflow_name}**: ${moduleRouting.description}`);
      }
    });
    lines.push('');
  }

  lines.push('## Output Configuration');
  lines.push('');
  lines.push('**Report Formats:**');
  result.config.output_requirements.forEach(o => {
    lines.push(`- ${o.type}`);
  });
  lines.push('');

  if (result.accounting_software_exports.length > 0) {
    lines.push('**Accounting Software Exports:**');
    result.accounting_software_exports.forEach(s => {
      const software = ACCOUNTING_SOFTWARE_FORMATS[s as keyof typeof ACCOUNTING_SOFTWARE_FORMATS];
      if (software) {
        lines.push(`- ${software.name} (${software.format})`);
      }
    });
    lines.push('');
  }

  if (result.deadline_summary && result.deadline_summary.upcoming_deadlines.length > 0) {
    lines.push('## Upcoming Tax Deadlines');
    lines.push('');
    lines.push(`Entity Type: **${result.deadline_summary.entity_type}**`);
    lines.push('');
    lines.push('| Date | Description | Form |');
    lines.push('|------|-------------|------|');
    result.deadline_summary.upcoming_deadlines.forEach(d => {
      lines.push(`| ${d.date} | ${d.description} | ${d.form} |`);
    });
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('*Generated by Elite Financial Intelligence & Litigation System v5*');

  return lines.join('\n');
}
