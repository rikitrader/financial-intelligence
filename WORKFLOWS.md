# Financial Intelligence Workflow Reference Guide

## Quick Reference - All Command Triggers

### Core Financial Workflows

| Command | Workflow | Description |
|---------|----------|-------------|
| `/financial-intake` | Guided Intake | Start guided intake process with questions |
| `/accounting` | GAAP Accounting | Generate GAAP-compliant financials from bank statements |
| `/forensic` | Forensic Investigation | Forensic fraud investigation |
| `/aml` | AML Compliance | Anti-money laundering compliance review |
| `/sec` | SEC Disclosure | SEC disclosure analysis |
| `/sox` | SOX Compliance | SOX compliance and internal controls testing |
| `/cfo` | CFO Dashboard | CFO executive dashboard |
| `/payroll-fraud` | Payroll Forensics | Payroll fraud and ghost employee detection |
| `/litigation` | Litigation Support | Litigation support and expert witness |
| `/settlement` | Settlement Analysis | Settlement modeling and analysis |
| `/trial` | Trial Support | Real-time trial support |
| `/asset-trace` | Asset Tracing | Asset tracing and recovery |
| `/reconcile` | Reconciliation | Account reconciliation |
| `/ap-fraud` | AP/Procurement Fraud | AP/Procurement fraud detection |
| `/statistics` | Statistical Anomalies | Statistical anomaly detection |
| `/reconstruct` | Records Intelligence | Records reconstruction |
| `/reports` | Financial Reporting | Generate financial reports |

### IRS Tax Defense Workflows

| Command | Workflow | Description |
|---------|----------|-------------|
| `/tax-orchestrator` | Master Orchestrator | **START HERE** - Master tax controversy orchestrator (routes to all modules) |
| `/case-router` | Case Router | Tax case jurisdiction and strategy router |
| `/tax-defense` | Tax Defense | IRS audit defense and tax controversy analysis |
| `/non-filer` | Non-Filer Defense | Non-filer defense and compliance strategy |
| `/sfr-attack` | SFR Attack | SFR (Substitute for Return) attack and reconsideration |
| `/collection-defense` | Collection Defense | Collection defense (levies, liens, garnishments) |
| `/appeals-protest` | Appeals Protest | IRS Appeals formal protest generator |
| `/criminal-risk` | Criminal Risk | Criminal tax exposure risk assessment |
| `/penalty-optimizer` | Penalty Optimizer | Penalty reduction and abatement optimization |
| `/transcript-analysis` | Transcript Analysis | IRS transcript decode and analysis |
| `/audit-defense` | Audit Defense | IRS audit defense strategy engine |
| `/oic-builder` | OIC Builder | Offer in Compromise builder and analysis |
| `/evidence-package` | Evidence Package | Evidence packaging for court/admin proceedings |
| `/433-analysis` | Form 433 Analysis | Form 433-A/F financial statement analyzer |
| `/tax-court-petition` | Tax Court Petition | U.S. Tax Court petition builder |
| `/settlement-probability` | Settlement Probability | IRS settlement probability calculator |
| `/trial-strategy` | Trial Strategy | Tax Court trial strategy builder |
| `/procedure-violations` | Procedure Violations | IRS procedure violation detector |
| `/case-memory` | Case Memory | Case memory and strategy continuity |
| `/doj-litigation` | DOJ Litigation | DOJ Tax Division litigation defense |
| `/refund-suit` | Refund Suit | Federal district court refund suit |

---

## Complete Command Count: 38 Workflows

### By Category

**Financial & Accounting (6):**
- `/financial-intake`, `/accounting`, `/reconcile`, `/reconstruct`, `/reports`, `/cfo`

**Forensic & Fraud (5):**
- `/forensic`, `/asset-trace`, `/payroll-fraud`, `/ap-fraud`, `/statistics`

**Compliance & Regulatory (3):**
- `/aml`, `/sec`, `/sox`

**Litigation Support (3):**
- `/litigation`, `/settlement`, `/trial`

**IRS Tax Defense (21):**
- Master: `/tax-orchestrator`, `/case-router`
- Core: `/tax-defense`, `/non-filer`, `/sfr-attack`, `/collection-defense`
- Analysis: `/criminal-risk`, `/penalty-optimizer`, `/transcript-analysis`, `/audit-defense`
- Resolution: `/oic-builder`, `/appeals-protest`, `/evidence-package`, `/433-analysis`
- Litigation: `/tax-court-petition`, `/trial-strategy`, `/settlement-probability`, `/procedure-violations`
- DOJ/Federal: `/doj-litigation`, `/refund-suit`
- Continuity: `/case-memory`

---

## Workflow Categories

### 1. ACCOUNTING & FINANCIAL REPORTING

#### `/accounting` - GAAP-Compliant Accounting Engine
**Workflow Type:** `gaap_accounting`
**Module:** `gaap_accounting_engine`
**Phases:** 8

**Description:**
Full financial statement generation from raw bank data using U.S. GAAP standards.

**Required Data:**
- Bank statements (CSV, PDF, or Excel)

**Generated Outputs:**
- Income Statement
- Balance Sheet
- Cash Flow Statement
- Trial Balance
- Tax Summary
- Exports (QuickBooks IIF, Xero CSV, Universal CSV, JSON)

**Processing Steps:**
1. Transaction ingestion and normalization
2. Classification using pattern matching
3. Double-entry journal creation
4. General ledger posting
5. Financial statement generation
6. Chart/visualization creation
7. Tax summary preparation
8. Export file generation

---

#### `/reports` - Financial Statement Generation
**Workflow Type:** `financial_reporting`
**Module:** `gaap_accounting_engine`
**Phases:** 3

**Description:**
Generate financial statements from existing trial balance data.

**Required Data:**
- Trial Balance

**Generated Outputs:**
- Income Statement
- Balance Sheet
- Cash Flow Statement
- Notes to Financial Statements

---

#### `/reconcile` - Account Reconciliation
**Workflow Type:** `reconciliation`
**Module:** `reconciliation`
**Phases:** 4

**Description:**
Bank, AR, AP, and GL reconciliation with variance analysis.

**Required Data:**
- Bank statements
- General ledger export

**Generated Outputs:**
- Reconciliation Report
- Variance Analysis
- Adjusting Entries

---

#### `/reconstruct` - Records Intelligence & Reconstruction
**Workflow Type:** `records_intelligence`
**Module:** `records_intelligence`
**Phases:** 7

**Description:**
Reconstruct financial records from incomplete data sources.

**Required Data:**
- Bank statements
- Any available fragments

**Generated Outputs:**
- Reconstructed General Ledger
- Estimated Income Analysis
- Expense Analysis

---

### 2. TAX DEFENSE & COMPLIANCE

#### `/tax-defense` - IRS Tax Defense & Audit Preparation
**Workflow Type:** `tax_defense`
**Module:** `irs_tax_defense`
**Phases:** 11

**Description:**
Comprehensive IRS audit defense with multi-lens analysis including criminal exposure assessment.

**Required Data:**
- Bank statements
- Tax returns

**Generated Outputs:**
- Tax Scorecard
- Red Flag Analysis with IRC Citations
- Penalty Analysis
- Criminal Exposure Assessment
- Defense Memorandum

**Analysis Lenses:**
1. IRS Examiner Lens
2. Criminal Investigation (CI) Lens
3. Taxpayer Defense Lens
4. Tax Court Lens
5. Appeals Officer Lens

---

### 3. FORENSIC INVESTIGATION

#### `/forensic` - Forensic Fraud Investigation
**Workflow Type:** `forensic_investigation`
**Module:** `forensic`
**Phases:** 15

**Description:**
Comprehensive fraud examination and investigation with transaction tracing.

**Required Data:**
- Bank statements
- General ledger export

**Generated Outputs:**
- Fraud Investigation Report
- Transaction Tracing Analysis
- Source & Use of Funds
- Timeline of Events

**Red Flag Detection:**
- Structuring (IRC 6050I, 31 USC 5324)
- Round Dollar Transactions
- Large Cash Patterns
- Related Party Issues (IRC 267, 482)
- Foreign Transaction Anomalies
- Ghost Employees
- Duplicate Payments

---

#### `/asset-trace` - Asset Tracing & Recovery
**Workflow Type:** `asset_tracing`
**Module:** `asset_tracing`
**Phases:** 8

**Description:**
Asset tracing, location, and recovery analysis.

**Required Data:**
- Bank statements
- Tax returns

**Generated Outputs:**
- Asset Inventory
- Flow of Funds Analysis
- Hidden Assets Report

---

#### `/payroll-fraud` - Payroll Forensics
**Workflow Type:** `payroll_forensics`
**Module:** `payroll_forensics`
**Phases:** 6

**Description:**
Payroll fraud detection including ghost employee analysis.

**Required Data:**
- Payroll records
- Bank statements

**Generated Outputs:**
- Ghost Employee Analysis
- Payroll Variance Report
- Benefit Fraud Detection

---

#### `/ap-fraud` - AP/Procurement Fraud Detection
**Workflow Type:** `ap_procurement`
**Module:** `ap_procurement`
**Phases:** 6

**Description:**
Accounts payable and procurement fraud detection.

**Required Data:**
- Invoices (AR/AP)
- General ledger export

**Generated Outputs:**
- Vendor Analysis
- Duplicate Payments Report
- Kickback Indicators

---

#### `/statistics` - Statistical Anomaly Detection
**Workflow Type:** `statistical_anomalies`
**Module:** `statistical_anomalies`
**Phases:** 5

**Description:**
Benford's Law and statistical anomaly detection for fraud indicators.

**Required Data:**
- General ledger export

**Generated Outputs:**
- Benford's Law Analysis
- Outlier Detection
- Trend Break Analysis
- Correlation Analysis

---

### 4. COMPLIANCE & REGULATORY

#### `/aml` - AML/BSA Compliance Review
**Workflow Type:** `aml_compliance`
**Module:** `fincen_aml`
**Phases:** 7

**Description:**
Anti-money laundering and Bank Secrecy Act compliance analysis.

**Required Data:**
- Bank statements

**Generated Outputs:**
- AML Compliance Report
- SAR Candidates
- Structuring Analysis
- KYC Review

**Regulatory References:**
- 31 USC 5311-5332 (Bank Secrecy Act)
- 31 CFR Chapter X (FinCEN Regulations)
- USA PATRIOT Act

---

#### `/sec` - SEC Disclosure Analysis
**Workflow Type:** `sec_disclosure`
**Module:** `sec`
**Phases:** 6

**Description:**
Public company disclosure and compliance analysis.

**Required Data:**
- General ledger export
- Trial balance

**Generated Outputs:**
- Disclosure Checklist
- Materiality Analysis
- Related Party Review

**SEC Forms Covered:**
- 10-K Annual Report
- 10-Q Quarterly Report
- 8-K Current Report
- S-1 Registration
- DEF 14A Proxy Statement
- Schedule 13D/G
- Form 4 Insider Trading

---

#### `/sox` - SOX Compliance & Internal Controls
**Workflow Type:** `controls_sox`
**Module:** `controls_sox`
**Phases:** 8

**Description:**
Internal controls testing and SOX 404 compliance.

**Required Data:**
- General ledger export
- Invoices

**Generated Outputs:**
- Control Matrix
- Testing Results
- Deficiency Report
- Management Letter

---

### 5. LITIGATION SUPPORT

#### `/litigation` - Litigation Support
**Workflow Type:** `litigation_support`
**Module:** `litigation_finance`
**Phases:** 10

**Description:**
Litigation support and expert witness preparation.

**Required Data:**
- Bank statements
- Contracts

**Generated Outputs:**
- Damages Calculation
- Expert Report
- Exhibits
- Timeline of Events

---

#### `/trial` - Real-Time Trial Support
**Workflow Type:** `trial_support`
**Module:** `realtime_trial`
**Phases:** 3

**Description:**
Real-time trial support with rapid response capability.

**Required Data:**
- Case documents

**Generated Outputs:**
- Impeachment Analysis
- Exhibit Summary
- Rapid Response Materials

---

#### `/settlement` - Settlement Modeling & Analysis
**Workflow Type:** `settlement_analysis`
**Module:** `settlement_engine`
**Phases:** 4

**Description:**
Settlement modeling and negotiation analysis.

**Required Data:**
- Damages data

**Generated Outputs:**
- Settlement Model
- Negotiation Strategy
- Present Value Analysis

---

### 6. EXECUTIVE DASHBOARD

#### `/cfo` - CFO Executive Dashboard
**Workflow Type:** `cfo_dashboard`
**Module:** `cfo`
**Phases:** 5

**Description:**
Executive-level financial dashboard with KPIs and trend analysis.

**Required Data:**
- General ledger export
- Trial balance

**Generated Outputs:**
- KPI Dashboard
- Trend Analysis
- Financial Forecast
- Alert System

---

## Guided Intake Process

### `/financial-intake` - Complete Guided Intake

The guided intake process asks a series of questions to determine the appropriate workflow and collect necessary information.

**Intake Question Flow:**

1. **Purpose Selection**
   - Accounting & Financial Reporting
   - Tax Defense & Audit
   - Forensic Investigation
   - Compliance Review
   - Litigation Support
   - Executive Dashboard

2. **Workflow Refinement** (based on purpose)
   - Specific workflow type selection

3. **Entity Information**
   - Entity name
   - Entity type (Individual, LLC, S-Corp, C-Corp, Partnership, Trust, Estate, Nonprofit)
   - Industry classification

4. **Time Period**
   - Fiscal year start/end
   - Tax years involved

5. **Accounting Method**
   - Cash basis
   - Accrual basis

6. **Data Sources**
   - Bank statements
   - General ledger export
   - Trial balance
   - Tax returns
   - Payroll records
   - Invoices
   - Contracts
   - Credit card statements
   - POS/Sales data

7. **Urgency Level**
   - Routine
   - Priority
   - Urgent
   - Emergency

8. **Output Requirements**
   - Markdown reports
   - PDF reports
   - Excel workbooks
   - CSV data files
   - JSON data
   - QuickBooks import
   - Xero import
   - Charts & graphics

---

## Workflow Routing Logic

```
Purpose Selection
├── Accounting
│   ├── Full GAAP Accounting → gaap_accounting
│   ├── Account Reconciliation → reconciliation
│   ├── Financial Reporting Only → financial_reporting
│   └── Records Reconstruction → records_intelligence
│
├── Tax
│   ├── Audit Defense → tax_defense
│   ├── Penalty Relief → tax_defense
│   ├── Criminal Exposure Analysis → tax_defense
│   ├── IRS Appeals → tax_defense
│   └── Tax Court Preparation → tax_defense
│
├── Forensic
│   ├── General Fraud Investigation → forensic_investigation
│   ├── Asset Tracing → asset_tracing
│   ├── Payroll Forensics → payroll_forensics
│   ├── AP/Procurement Fraud → ap_procurement
│   └── Statistical Analysis → statistical_anomalies
│
├── Compliance
│   ├── AML/BSA Compliance → aml_compliance
│   ├── SOX Compliance → controls_sox
│   └── SEC Disclosure → sec_disclosure
│
├── Litigation
│   ├── General Litigation Support → litigation_support
│   ├── Real-Time Trial Support → trial_support
│   ├── Settlement Analysis → settlement_analysis
│   └── Expert Witness Preparation → litigation_support
│
└── Dashboard → cfo_dashboard
```

---

## Output Formats

All workflows can generate outputs in multiple formats:

| Format | Extension | Use Case |
|--------|-----------|----------|
| Markdown | `.md` | Documentation, reports |
| PDF | `.pdf` | Formal reports, court filings |
| Excel | `.xlsx` | Analysis, workpapers |
| CSV | `.csv` | Data export, analysis |
| JSON | `.json` | API integration, data exchange |
| QuickBooks | `.iif` | QuickBooks Desktop import |
| Xero | `.csv` | Xero accounting import |
| Graphics | `.png/.svg` | Charts, visualizations |

---

## Entity Types Supported

| Code | Entity Type | Tax Form |
|------|-------------|----------|
| `individual` | Individual | 1040 |
| `sole_prop` | Sole Proprietorship | 1040 Schedule C |
| `llc` | LLC (Single-Member) | 1040 Schedule C |
| `llc_multi` | LLC (Multi-Member) | 1065 |
| `partnership` | Partnership | 1065 |
| `scorp` | S Corporation | 1120-S |
| `ccorp` | C Corporation | 1120 |
| `trust` | Trust | 1041 |
| `estate` | Estate | 1041 |
| `nonprofit` | Nonprofit | 990 |

---

## Urgency Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Routine | Standard turnaround | Normal processing |
| Priority | Expedited processing | Accelerated processing |
| Urgent | Time-sensitive matter | Same-day focus |
| Emergency | Immediate attention | Trial/deadline mode |

---

## Integration with Document Templates

All workflows integrate with the complete template library covering 12 document categories:

1. **Core Financial Statements** - Balance Sheet, Income Statement, Cash Flow, etc.
2. **Accounting/Ledger** - General Ledger, Trial Balance, Chart of Accounts
3. **Revenue** - Sales Invoices, Contracts, Revenue Recognition
4. **Expense/Payables** - Vendor Invoices, Expense Reports, Purchase Orders
5. **Banking/Cash** - Bank Statements, Reconciliations, Cash Receipts
6. **Payroll/HR** - Payroll Register, Timesheets, W-2s, 941s
7. **Tax** - Tax Returns (1120, 1065, 1040), Estimated Payments
8. **Assets/Capital** - Fixed Asset Register, Depreciation, Leases
9. **Investor/Equity** - Cap Table, Stock Options, Dividends
10. **Audit/Compliance** - Audit Reports, Internal Controls, Risk Assessment
11. **Forensic/Investigation** - Transaction Tracing, Fraud Reports, AML/KYC
12. **SEC Filings** - 10-K, 10-Q, 8-K, S-1, DEF 14A

---

## Red Flag Detection with Penalty References

All forensic and tax workflows include red flag detection with:

- **IRC Citation** - Internal Revenue Code section
- **Law Violated** - Specific statute or regulation
- **Civil Penalty** - Monetary penalties
- **Criminal Penalty** - Potential criminal exposure
- **Consequences** - Business and personal impact
- **Statute of Limitations** - Applicable time limits

**Example Red Flags:**

| Flag | IRC | Civil Penalty | Criminal Penalty |
|------|-----|---------------|------------------|
| Structuring | 6050I | $25,000-$100,000 | Up to 5 years |
| Failure to File | 6651 | 5%/month up to 25% | Up to 1 year |
| Fraud | 6663 | 75% of underpayment | Up to 5 years |
| Evasion | 7201 | $100,000-$500,000 | Up to 5 years |

---

## Getting Started

1. **Quick Start**: Use a direct command (e.g., `/accounting`) for fast workflow initiation
2. **Guided Process**: Use `/financial-intake` for comprehensive intake with questions
3. **Provide Data**: Specify data directory and available source files
4. **Select Outputs**: Choose output formats and destination directory
5. **Review Results**: Examine generated reports, red flags, and recommendations

---

## Tax Filing Deadline Tables

### Annual Income Tax Return Deadlines by Entity Type

| Entity Type | Form | Original Due Date | Extended Due Date | Extension Form | Late Filing Penalty |
|-------------|------|-------------------|-------------------|----------------|---------------------|
| Individual | 1040 | April 15 | October 15 | 4868 | 5%/month, max 25% |
| Sole Proprietorship | 1040 + Sch C | April 15 | October 15 | 4868 | 5%/month, max 25% |
| LLC (Single-Member) | 1040 + Sch C | April 15 | October 15 | 4868 | 5%/month, max 25% |
| LLC (Multi-Member) | 1065 | March 15 | September 15 | 7004 | $220/partner/month |
| Partnership | 1065 | March 15 | September 15 | 7004 | $220/partner/month |
| S Corporation | 1120-S | March 15 | September 15 | 7004 | $220/shareholder/month |
| C Corporation | 1120 | April 15 | October 15 | 7004 | 5%/month, max 25% |
| Trust | 1041 | April 15 | September 30 | 7004 | 5%/month, max 25% |
| Estate | 1041 | April 15 | September 30 | 7004 | 5%/month, max 25% |
| Nonprofit | 990 | May 15 | November 15 | 8868 | $20/day, max $10,000 |

**IRC References:**
- IRC § 6072 - Time for filing income tax returns
- IRC § 6081 - Extension of time for filing returns
- IRC § 6651(a)(1) - Failure to file penalty
- IRC § 6698 - Partnership failure to file penalty
- IRC § 6699 - S Corporation failure to file penalty

---

### Estimated Tax Payment Deadlines

| Quarter | Period Covered | Due Date | Forms | Applies To |
|---------|----------------|----------|-------|------------|
| Q1 | January 1 - March 31 | April 15 | 1040-ES, 1120-W | Individuals, C-Corps, Trusts |
| Q2 | April 1 - May 31 | June 15 | 1040-ES, 1120-W | Individuals, C-Corps, Trusts |
| Q3 | June 1 - August 31 | September 15 | 1040-ES, 1120-W | Individuals, C-Corps, Trusts |
| Q4 | September 1 - December 31 | January 15 (next year) | 1040-ES, 1120-W | Individuals, C-Corps, Trusts |

**Penalty:** IRC § 6654 - Underpayment of estimated tax (individuals), IRC § 6655 (corporations)

---

### Payroll Tax Deadlines

| Form | Form Name | Frequency | Due Date | Penalty IRC |
|------|-----------|-----------|----------|-------------|
| 941 | Employer's Quarterly Federal Tax Return | Quarterly | Apr 30, Jul 31, Oct 31, Jan 31 | § 6651, § 6656 |
| 940 | Annual FUTA Tax Return | Annual | January 31 | § 6651, § 6656 |
| 944 | Annual Federal Tax Return (small employers) | Annual | January 31 | § 6651, § 6656 |
| 943 | Agricultural Employees Tax Return | Annual | January 31 | § 6651, § 6656 |

**Deposit Schedules:**
- **Monthly:** Deposits due by 15th of following month
- **Semi-Weekly:** Deposits due Wed/Fri depending on pay date
- **Next-Day:** $100,000+ liability requires next business day deposit

---

### Information Return Deadlines

| Form | Form Name | To Recipient | To IRS (Paper) | To IRS (E-File) | Penalty/Form |
|------|-----------|--------------|----------------|-----------------|--------------|
| W-2 | Wage and Tax Statement | January 31 | January 31 | January 31 | $60-$310 |
| 1099-NEC | Nonemployee Compensation | January 31 | January 31 | January 31 | $60-$310 |
| 1099-MISC | Miscellaneous Information | January 31 | February 28 | March 31 | $60-$310 |
| 1099-INT | Interest Income | January 31 | February 28 | March 31 | $60-$310 |
| 1099-DIV | Dividends and Distributions | January 31 | February 28 | March 31 | $60-$310 |
| 1099-B | Broker Transactions | February 15 | February 28 | March 31 | $60-$310 |
| 1099-K | Payment Card Transactions | January 31 | February 28 | March 31 | $60-$310 |
| 1099-R | Retirement Distributions | January 31 | February 28 | March 31 | $60-$310 |
| 1099-S | Real Estate Proceeds | January 31 | February 28 | March 31 | $60-$310 |

**Penalty IRC References:** IRC § 6721 (failure to file), IRC § 6722 (failure to furnish)

---

### International Filing Deadlines

| Form | Form Name | Due Date | Penalty |
|------|-----------|----------|---------|
| FBAR (FinCEN 114) | Foreign Bank Account Report | April 15 (auto-extends Oct 15) | $10,000 non-willful; 50% of balance willful |
| 8938 | FATCA - Foreign Financial Assets | With tax return | $10,000; up to $50,000 continued failure |
| 5471 | Foreign Corporation Information | With tax return | $10,000/corp; +$10,000/month (max $50,000) |
| 8865 | Foreign Partnership Information | With tax return | $10,000/partnership; +$10,000/month |
| 3520 | Foreign Trust Transactions | April 15 | 5% of trust value or 35% of distribution |
| 3520-A | Foreign Trust Annual Return | March 15 | 5% of portion treated as owned |

**Regulatory References:**
- 31 USC § 5321 - FBAR penalties
- IRC § 6038D - FATCA penalties
- IRC § 6038 - Information return penalties
- IRC § 6048, § 6677 - Foreign trust penalties

---

### Special Elections & Deadlines

| Action | Deadline | Form/Method | IRC Section |
|--------|----------|-------------|-------------|
| S Corporation Election | March 15 (2½ months into year) | Form 2553 | IRC § 1362 |
| LLC Corporate Election | 75 days from formation | Form 8832 | Treas. Reg. § 301.7701-3 |
| Fiscal Year Change | Varies | Form 1128 | IRC § 442 |
| Accounting Method Change | During tax year | Form 3115 | IRC § 446 |
| IRA Contribution | April 15 (no extension) | Direct contribution | IRC § 219 |
| HSA Contribution | April 15 (no extension) | Direct contribution | IRC § 223 |
| Amended Return (Refund) | 3 years from filing or 2 years from payment | 1040-X, 1120-X | IRC § 6511 |

---

### Annual Tax Calendar

#### January
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| January 15 | Q4 Estimated Tax Due | 1040-ES, 1120-W | Individuals, C-Corps |
| January 31 | W-2, 1099-NEC to Recipients & IRS | W-2, W-3, 1099-NEC | All employers |
| January 31 | Form 940 (FUTA) Due | 940 | Employers |
| January 31 | Form 941 Q4 Due | 941 | Employers |
| January 31 | Form 944 Due (if applicable) | 944 | Small employers |

#### February
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| February 15 | 1099-B Due to Recipients | 1099-B | Brokers |
| February 28 | 1099s Due to IRS (paper) | All 1099s | All |

#### March
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| March 15 | Partnership Returns Due | 1065, K-1s | Partnerships, Multi-member LLCs |
| March 15 | S Corporation Returns Due | 1120-S, K-1s | S Corporations |
| March 15 | S Election Deadline | 2553 | LLCs, C-Corps electing S |
| March 31 | 1099s Due to IRS (electronic) | All 1099s | All |

#### April
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| April 15 | Individual Returns Due | 1040 | Individuals, Sole Props |
| April 15 | C Corporation Returns Due | 1120 | C Corporations |
| April 15 | Trust & Estate Returns Due | 1041 | Trusts, Estates |
| April 15 | Q1 Estimated Tax Due | 1040-ES, 1120-W | Individuals, C-Corps |
| April 15 | IRA/HSA Contribution Deadline | - | Individuals |
| April 15 | FBAR Due (auto-extends Oct 15) | FinCEN 114 | All with foreign accounts |
| April 30 | Form 941 Q1 Due | 941 | Employers |

#### May
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| May 15 | Nonprofit Returns Due | 990, 990-EZ, 990-PF | Nonprofits |

#### June
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| June 15 | Q2 Estimated Tax Due | 1040-ES, 1120-W | Individuals, C-Corps |
| June 15 | U.S. Citizens Abroad Extension | 1040 | Expats |

#### July
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| July 31 | Form 941 Q2 Due | 941 | Employers |
| July 31 | Form 5500 Due (Benefit Plans) | 5500 | Employers with plans |

#### September
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| September 15 | Extended Partnership Returns Due | 1065 | Partnerships |
| September 15 | Extended S Corp Returns Due | 1120-S | S Corporations |
| September 15 | Q3 Estimated Tax Due | 1040-ES, 1120-W | Individuals, C-Corps |
| September 30 | Extended Trust/Estate Returns Due | 1041 | Trusts, Estates |

#### October
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| October 15 | Extended Individual Returns Due | 1040 | Individuals |
| October 15 | Extended C Corp Returns Due | 1120 | C Corporations |
| October 15 | Extended FBAR Deadline | FinCEN 114 | All with foreign accounts |
| October 31 | Form 941 Q3 Due | 941 | Employers |

#### November
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| November 15 | Extended Nonprofit Returns Due | 990 | Nonprofits |

#### December
| Date | Event | Forms | Entities |
|------|-------|-------|----------|
| December 31 | Required Minimum Distributions | - | Individuals 73+ |
| December 31 | Charitable Contribution Deadline | 1040 Sch A | Individuals |

---

## Version Information

**System Version:** ELITE FINANCIAL INTELLIGENCE & LITIGATION SYSTEM v5
**Template Library:** 70+ document templates across 12 categories
**Report Templates:** 12 core financial report templates
**Workflows:** 18+ specialized workflows
**Tax Law References:** Full IRC, Treasury Regulations, IRS Publications, IRM
**Tax Deadline Calendar:** Complete annual calendar with all entity types
