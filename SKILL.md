---
name: financial-intelligence
description: >
  Elite Financial Intelligence & Litigation System v5. Use this skill when the user needs:
  financial analysis, forensic accounting, fraud detection, IRS tax defense, audit preparation,
  AML compliance, SEC disclosure review, litigation support, expert witness preparation,
  settlement modeling, or any financial investigation. This skill triggers a guided intake
  process that routes to 38 specialized workflows based on user needs.
---

# Elite Financial Intelligence & Litigation System v5

## How This Skill Works

When triggered, this skill runs a **guided intake process** that:

1. Asks targeted questions to understand the engagement
2. Determines the appropriate workflow(s) to execute
3. Collects necessary data and documents
4. Routes to specialized analysis modules
5. Generates reports in the requested output format

## Triggering the Skill

This skill activates when the user mentions financial analysis, tax defense, forensic investigation, or related topics. Upon activation:

### STEP 1: Determine Engagement Purpose

Ask the user:

> **What is the primary purpose of this engagement?**
>
> 1. **Accounting & Financial Reporting** - Generate financial statements, reconciliations, books from raw data
> 2. **IRS Tax Defense** - Audit defense, tax controversy, penalties, appeals, Tax Court, collection issues
> 3. **Forensic Investigation** - Fraud detection, asset tracing, transaction analysis
> 4. **Compliance Review** - AML/BSA, SOX controls, SEC disclosure
> 5. **Litigation Support** - Expert witness, damages, trial support, settlement
> 6. **Executive Dashboard** - CFO-level KPIs and financial health analysis

### STEP 2: Route to Specific Workflow

Based on the answer, ask follow-up questions and route to the appropriate workflow:

#### If ACCOUNTING selected:
> **What type of accounting work?**
> - Full GAAP Accounting from bank statements → Execute `gaap_accounting` workflow
> - Account Reconciliation (Bank/GL) → Execute `reconciliation` workflow
> - Financial Statement Generation → Execute `financial_reporting` workflow
> - Records Reconstruction → Execute `records_intelligence` workflow

#### If IRS TAX DEFENSE selected:
> **What is the tax situation?**
> - Full Tax Controversy (let system route) → Execute `tax_orchestrator` workflow
> - IRS Audit in progress → Execute `audit_defense` workflow
> - Non-filer / Unfiled returns → Execute `non_filer` workflow
> - SFR (Substitute for Return) received → Execute `sfr_attack` workflow
> - Collection issue (levy/lien/garnishment) → Execute `collection_defense` workflow
> - Need to file Appeals Protest → Execute `appeals_protest` workflow
> - Offer in Compromise → Execute `oic_builder` workflow
> - Tax Court case → Execute `tax_court_petition` workflow
> - Penalty abatement needed → Execute `penalty_optimizer` workflow
> - Criminal exposure concern → Execute `criminal_risk` workflow
> - DOJ Tax Division litigation → Execute `doj_litigation` workflow
> - Federal refund suit → Execute `refund_suit` workflow

#### If FORENSIC selected:
> **What type of investigation?**
> - General fraud investigation → Execute `forensic_investigation` workflow
> - Asset tracing/recovery → Execute `asset_tracing` workflow
> - Payroll fraud/ghost employees → Execute `payroll_forensics` workflow
> - AP/Vendor fraud → Execute `ap_procurement` workflow
> - Statistical anomaly analysis → Execute `statistical_anomalies` workflow

#### If COMPLIANCE selected:
> **What compliance area?**
> - AML/BSA compliance → Execute `aml_compliance` workflow
> - SOX/Internal controls → Execute `controls_sox` workflow
> - SEC disclosure → Execute `sec_disclosure` workflow

#### If LITIGATION selected:
> **What litigation support?**
> - General litigation/expert witness → Execute `litigation_support` workflow
> - Settlement analysis → Execute `settlement_analysis` workflow
> - Real-time trial support → Execute `trial_support` workflow

### STEP 3: Collect Entity Information

For all engagements, collect:

1. **Entity Name**: Full legal name
2. **Entity Type**: Individual, Sole Prop, LLC, Partnership, S-Corp, C-Corp, Trust, Estate, Nonprofit
3. **Industry**: Retail, Services, Construction, Manufacturing, Technology, Healthcare, Real Estate, Financial, Restaurant, E-Commerce, Other
4. **Fiscal Year**: Start and end dates
5. **Tax Years at Issue**: (if applicable)
6. **Accounting Method**: Cash or Accrual

### STEP 4: Collect Data Sources & File Access

**IMPORTANT: Always ask for the data directory or file paths before starting analysis.**

Ask the user:

> **Where are your files located?**
>
> Please provide:
> 1. **Directory path** containing all documents (e.g., `/Users/name/Documents/case_files/`)
> 2. **OR** specific file paths for individual documents
>
> I can process the following file formats:
> - **PDF** - Bank statements, tax returns, IRS notices, contracts
> - **CSV** - Transaction exports, general ledger, payroll data
> - **Excel (.xlsx, .xls)** - Spreadsheets, workbooks, reports
> - **Images (.png, .jpg)** - Scanned documents, check images
> - **JSON** - Data exports, API outputs
> - **Text (.txt)** - Plain text documents

Then ask what types of data are available:
- [ ] Bank statements (PDF, CSV, or Excel)
- [ ] General ledger export (CSV or Excel)
- [ ] Trial balance (CSV or Excel)
- [ ] Tax returns (PDF)
- [ ] IRS notices/correspondence (PDF)
- [ ] IRS transcripts (PDF or text)
- [ ] Payroll records (CSV or Excel)
- [ ] Invoices (PDF or CSV)
- [ ] Contracts (PDF)
- [ ] Other documents

**File Reading Protocol:**
1. Use the Read tool to access files at the provided paths
2. For PDFs: Read tool extracts text and visual content page by page
3. For CSVs/Excel: Parse structured data for analysis
4. For images: View visual content for document analysis
5. If a file cannot be read, ask user to provide in alternative format

### STEP 5: Determine Output Requirements

> **What output formats do you need?**
> - [ ] Markdown reports
> - [ ] PDF reports
> - [ ] Excel workbooks
> - [ ] CSV data files
> - [ ] JSON data
> - [ ] HTML reports
> - [ ] Charts & graphics

> **Export to accounting software?**
> - [ ] QuickBooks Desktop (IIF)
> - [ ] QuickBooks Online (CSV)
> - [ ] Xero
> - [ ] Sage
> - [ ] FreshBooks
> - [ ] Wave
> - [ ] Zoho Books
> - [ ] None

### STEP 6: Set Urgency Level

> **What is the urgency?**
> - Routine - Standard processing
> - Priority - Expedited
> - Urgent - Time-sensitive deadline
> - Emergency - Trial/filing deadline imminent

### STEP 7: Execute Workflow

After collecting all information:

1. Generate entity-specific **tax deadline timeline** based on entity type
2. Run the selected workflow module(s)
3. Perform analysis using the provided data
4. Generate outputs in requested formats
5. Attach deadline timeline to final report package

---

## Workflow Reference

### Financial & Accounting
| Workflow | Module | Use When |
|----------|--------|----------|
| `gaap_accounting` | Generate GAAP financials | Need full financial statements from bank data |
| `reconciliation` | Bank/GL reconciliation | Matching bank to books, variance analysis |
| `records_intelligence` | Records reconstruction | Incomplete records need rebuilding |
| `financial_reporting` | Statement generation | Have trial balance, need statements |
| `cfo_dashboard` | Executive dashboard | Need KPIs, trends, forecasts |

### IRS Tax Defense
| Workflow | Module | Use When |
|----------|--------|----------|
| `tax_orchestrator` | Master coordinator | Complex case, need full analysis |
| `tax_defense` | Audit defense | IRS examination in progress |
| `non_filer` | Non-filer defense | Unfiled returns, compliance |
| `sfr_attack` | SFR reconsideration | Received §6020(b) substitute return |
| `collection_defense` | Collection defense | Facing levy, lien, garnishment |
| `appeals_protest` | Appeals protest | Need formal IRS Appeals protest |
| `criminal_risk` | Criminal assessment | Concern about CI referral |
| `penalty_optimizer` | Penalty reduction | Need penalty abatement |
| `transcript_analysis` | Transcript decode | Have IRS transcripts to analyze |
| `audit_defense` | Audit strategy | Building audit response |
| `oic_builder` | Offer in Compromise | Settlement offer to IRS |
| `evidence_package` | Evidence packaging | Preparing exhibits for proceeding |
| `form_433_analysis` | Form 433 analysis | Financial statement for IRS |
| `tax_court_petition` | Tax Court petition | Filing Tax Court case |
| `trial_strategy` | Trial preparation | Tax Court trial strategy |
| `settlement_probability` | Settlement odds | Calculate settlement likelihood |
| `procedure_violations` | IRS errors | Detect procedural violations |
| `case_memory` | Case tracking | Maintain case continuity |
| `doj_litigation` | DOJ defense | DOJ Tax Division case |
| `refund_suit` | Refund action | Federal court refund suit |
| `case_router` | Case routing | Determine best path |

### Forensic Investigation
| Workflow | Module | Use When |
|----------|--------|----------|
| `forensic_investigation` | Fraud examination | General fraud investigation |
| `asset_tracing` | Asset location | Tracing funds, hidden assets |
| `payroll_forensics` | Payroll fraud | Ghost employees, payroll issues |
| `ap_procurement` | Vendor fraud | Duplicate payments, kickbacks |
| `statistical_anomalies` | Statistical analysis | Benford's Law, outliers |

### Compliance
| Workflow | Module | Use When |
|----------|--------|----------|
| `aml_compliance` | AML/BSA | Anti-money laundering review |
| `controls_sox` | SOX compliance | Internal controls testing |
| `sec_disclosure` | SEC analysis | Public company disclosures |

### Litigation
| Workflow | Module | Use When |
|----------|--------|----------|
| `litigation_support` | Litigation/Expert | Damages, expert reports |
| `settlement_analysis` | Settlement | Settlement modeling |
| `trial_support` | Trial support | Real-time trial assistance |

---

## Tax Deadline Generation

Based on entity type, automatically generate applicable deadlines:

### Individual/Sole Prop/Single-Member LLC
- April 15: Form 1040 due, Q1 estimated tax
- June 15: Q2 estimated tax
- September 15: Q3 estimated tax
- October 15: Extended return due
- January 15: Q4 estimated tax

### Partnership/Multi-Member LLC
- March 15: Form 1065 and K-1s due
- September 15: Extended return due

### S Corporation
- March 15: Form 1120-S and K-1s due
- September 15: Extended return due

### C Corporation
- April 15: Form 1120 due, Q1 estimated tax
- June 15: Q2 estimated tax
- September 15: Q3 estimated tax
- October 15: Extended return due
- December 15: Q4 estimated tax

### Trust/Estate
- April 15: Form 1041 due
- September 30: Extended return due

### Nonprofit
- May 15: Form 990 due
- November 15: Extended return due

---

## Output Structure

All workflows generate a structured output directory:

```
/output/[CASE_ID]/
├── 00_MANIFEST.md           # File index and summary
├── 01_INTAKE_SUMMARY.md     # Intake information collected
├── 02_DEADLINE_TIMELINE.md  # Entity-specific tax deadlines
├── 03_ANALYSIS/             # Analysis outputs by module
│   ├── risk_scores.json
│   ├── findings.json
│   └── [module]_report.md
├── 04_LETTERS/              # Generated correspondence
├── 05_EXHIBITS/             # Evidence and exhibits
├── 06_EXPORTS/              # Accounting software files
└── FINAL_REPORT.md          # Comprehensive final report
```

---

## Module File Locations

Core modules are located in:
- `modules/irs_tax_defense/` - All IRS defense modules
- `modules/forensic/` - Fraud detection
- `modules/statistical_anomalies/` - Benford, outliers
- `modules/realtime_trial/` - Trial support
- `modules/gaap_accounting_engine/` - GAAP accounting
- `workflows/workflow_intake.ts` - Master intake system

Key reference files:
- `modules/irs_tax_defense/tax_deadlines.ts` - Deadline calculations
- `modules/irs_tax_defense/tax_law_reference.ts` - IRC/IRM citations
- `core/templates/` - Document templates

---

## File Format Support & Error Handling

### Supported File Formats
| Format | Extension | Use Case | Read Method |
|--------|-----------|----------|-------------|
| PDF | `.pdf` | Bank statements, tax returns, IRS notices, contracts | Read tool (extracts text + visuals) |
| CSV | `.csv` | Transaction exports, GL data, payroll | Read tool (parse structured data) |
| Excel | `.xlsx`, `.xls` | Spreadsheets, workbooks, financial reports | Read tool |
| Images | `.png`, `.jpg`, `.jpeg` | Scanned documents, check images | Read tool (visual analysis) |
| JSON | `.json` | Data exports, API outputs | Read tool |
| Text | `.txt` | Plain text documents, transcripts | Read tool |
| Jupyter | `.ipynb` | Analysis notebooks | Read tool |

### Error Handling Protocol
If a file cannot be read or processed:

1. **File Not Found**: Ask user to verify the path exists
2. **Permission Denied**: Ask user to check file permissions
3. **Unsupported Format**: Request file in supported format (PDF, CSV, Excel)
4. **Corrupted File**: Ask user to provide clean copy
5. **File Too Large**: Process in chunks or ask for split files
6. **Encoding Issues**: Try UTF-8 encoding or ask for plain text version

### Best Practices
- Always use absolute file paths (e.g., `/Users/name/Documents/file.pdf`)
- Verify files exist before starting analysis
- Process large directories file-by-file to avoid timeout
- For sensitive data, confirm user consent before reading

---

## Safety Guardrails

- **Criminal Screen**: All IRS cases run criminal exposure check first
- **No Legal Advice**: Outputs are analytical, not legal counsel
- **Evidence Required**: All findings must cite sources
- **Privacy Protection**: PII redaction available
- **Audit Trail**: Full explanation chain for scores
- **File Safety**: Never modify or delete source files

---

## Version

**ELITE FINANCIAL INTELLIGENCE & LITIGATION SYSTEM v5**
- 38 Specialized Workflows
- 21 IRS Tax Defense Modules
- 70+ Document Templates
- Full IRC/IRM Legal Reference Library
