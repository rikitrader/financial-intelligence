# Elite Financial Intelligence & Litigation System v5

```
███████╗██╗███╗   ██╗ █████╗ ███╗   ██╗ ██████╗██╗ █████╗ ██╗
██╔════╝██║████╗  ██║██╔══██╗████╗  ██║██╔════╝██║██╔══██╗██║
█████╗  ██║██╔██╗ ██║███████║██╔██╗ ██║██║     ██║███████║██║
██╔══╝  ██║██║╚██╗██║██╔══██║██║╚██╗██║██║     ██║██╔══██║██║
██║     ██║██║ ╚████║██║  ██║██║ ╚████║╚██████╗██║██║  ██║███████╗
╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚═╝╚═╝  ╚═╝╚══════╝
        INTELLIGENCE & LITIGATION SYSTEM v5.0
```

![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Personal%20%26%20Educational%20Use-blue.svg)
![Workflows](https://img.shields.io/badge/workflows-38-green.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)
![Errors](https://img.shields.io/badge/errors-0-success.svg)

---

## ⚠️ COPYRIGHT NOTICE & LICENSE

```
╔══════════════════════════════════════════════════════════════════╗
║              PERSONAL & EDUCATIONAL USE LICENSE                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Copyright © 2026 Ricardo Prieto. All Rights Reserved.          ║
║                                                                   ║
║  This software is licensed for PERSONAL and EDUCATIONAL use     ║
║  ONLY. Commercial use is STRICTLY PROHIBITED.                   ║
║                                                                   ║
║  Created using Claude Code - Anthropic's AI coding assistant    ║
║                                                                   ║
║  See LICENSE.md for full terms and conditions.                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## 🤖 Built with Claude Code

```
╔══════════════════════════════════════════════════════════════════╗
║                    CREATED WITH CLAUDE CODE                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  This skill and all 38 workflows were developed using Claude    ║
║  Code, Anthropic's official AI-powered coding assistant.        ║
║                                                                   ║
║  Claude Code capabilities demonstrated:                          ║
║    • Advanced skill creation and workflow design                ║
║    • TypeScript/JavaScript module development                   ║
║    • Comprehensive test data generation                         ║
║    • Automated documentation generation                         ║
║    • Git repository management and GitHub deployment            ║
║    • Complex financial domain knowledge integration             ║
║                                                                   ║
║  Learn more: https://claude.ai/claude-code                      ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [All 38 Workflows](#all-38-workflows)
6. [Commands Reference](#commands-reference)
7. [Entity Types & Industries](#entity-types--industries)
8. [File Formats](#file-formats)
9. [Output Formats](#output-formats)
10. [Legal Reference Library](#legal-reference-library)
11. [Testing & Validation](#testing--validation)
12. [Directory Structure](#directory-structure)
13. [Security & Privacy](#security--privacy)
14. [License](#license)

---

## Overview

The **Elite Financial Intelligence & Litigation System v5** is a comprehensive Claude Code skill providing 38 specialized workflows for:

- **GAAP Accounting** - Financial statement generation from raw data
- **IRS Tax Defense** - Audit defense, penalties, collection, Tax Court
- **Forensic Investigation** - Fraud detection, asset tracing, Benford's Law
- **Compliance** - AML/BSA, SOX 404, SEC disclosure
- **Litigation Support** - Expert witness, damages, settlement, trial

### Who This Is For

| Role | Use Cases |
|------|-----------|
| **CFOs & Controllers** | Financial health monitoring, KPI dashboards |
| **Tax Professionals** | IRS audit defense, penalty abatement, Tax Court |
| **Forensic Accountants** | Fraud detection, asset tracing, expert witness |
| **Compliance Officers** | AML/BSA, SOX testing, SEC disclosure |
| **Litigators** | Trial support, settlement modeling, damages |

---

## Features

### 38 Specialized Workflows

| Category | Count | Description |
|----------|-------|-------------|
| Accounting | 4 | GAAP financials, reconciliation, reporting |
| IRS Tax Defense | 21 | Full tax controversy support |
| Forensic | 5 | Fraud detection, asset tracing |
| Compliance | 3 | AML, SOX, SEC |
| Litigation | 4 | Expert witness, trial support |
| Other | 1 | Custom workflows |

### Key Capabilities

- ✅ **Guided Intake System** - Routes to appropriate workflow
- ✅ **21 IRS Tax Defense Modules** - Full IRC/IRM reference
- ✅ **Benford's Law Analysis** - Statistical fraud detection
- ✅ **Ghost Employee Detection** - Payroll fraud
- ✅ **AML/SAR Generation** - BSA compliance
- ✅ **Multi-Format Export** - QuickBooks, Xero, Sage, more
- ✅ **Real-Time Trial Support** - Live litigation assistance
- ✅ **Zero-Error Tested** - Comprehensive validation

---

## Installation

### Prerequisites

- Claude Code CLI installed and configured
- macOS, Linux, or Windows with WSL
- Access to Claude Code skills system
- **License key** (contact copyright holder for Personal & Educational use)

### Step 1: Clone Repository

```bash
git clone https://github.com/rikitrader/financial-intelligence.git \
  ~/.claude/skills/financial-intelligence
```

### Step 2: Navigate to Directory

```bash
cd ~/.claude/skills/financial-intelligence
```

### Step 3: Activate License (REQUIRED)

```
╔══════════════════════════════════════════════════════════════════╗
║                   LICENSE ACTIVATION REQUIRED                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Before using this skill, you MUST activate your license.       ║
║                                                                   ║
║  Run: ./scripts/activate.sh                                     ║
║                                                                   ║
║  You will need a license key for Personal & Educational use.    ║
║  Contact the copyright holder to obtain your key.               ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

```bash
./scripts/activate.sh
```

When prompted, enter your license key and agree to the terms.

### Step 4: Verify Installation

```bash
ls -la
```

Expected files:
```
SKILL.md              # Skill definition (required)
README.md             # This documentation
LICENSE.md            # Private use license
CHANGELOG.md          # Version history
.gitignore            # Git ignore rules
workflows/            # Workflow definitions
modules/              # Analysis modules
core/                 # Core utilities
test/                 # Test data and validation
examples/             # Usage examples
```

### Step 4: Confirm Skill Loading

The skill auto-loads when placed in `~/.claude/skills/`. Verify by asking Claude Code about financial analysis.

---

## Quick Start

### Method 1: Guided Intake (Recommended)

Simply mention any financial topic:

```
I need help with IRS tax defense
```

or

```
I need forensic accounting analysis
```

The system will automatically start the guided intake process.

### Method 2: Direct Commands

```bash
/financial-intake      # Start guided intake
/accounting            # GAAP financials
/tax-defense           # IRS audit defense
/forensic              # Fraud investigation
/aml                   # AML compliance
/cfo                   # Executive dashboard
```

### Method 3: Specific Workflow

```bash
/tax-orchestrator      # Full tax controversy
/payroll-fraud         # Ghost employee detection
/transcript-analysis   # Decode IRS transcript
```

---

## All 38 Workflows

### Category 1: Accounting & Financial Reporting (4 Workflows)

| # | Workflow | Command | Description |
|---|----------|---------|-------------|
| 1 | GAAP Accounting | `/accounting` | Generate GAAP-compliant financial statements from bank data |
| 2 | Reconciliation | `/reconcile` | Bank, AR, AP, GL reconciliation with variance analysis |
| 3 | Financial Reporting | `/reports` | Financial statement generation from trial balance |
| 4 | Records Reconstruction | `/reconstruct` | Rebuild records from incomplete data fragments |

### Category 2: IRS Tax Defense (21 Workflows)

| # | Workflow | Command | Description |
|---|----------|---------|-------------|
| 5 | Tax Defense | `/tax-defense` | Comprehensive IRS audit defense |
| 6 | Non-Filer Defense | `/non-filer` | Unfiled returns, voluntary disclosure |
| 7 | SFR Attack | `/sfr-attack` | IRC §6020(b) Substitute for Return reconsideration |
| 8 | Collection Defense | `/collection-defense` | Levy, lien, garnishment defense |
| 9 | Appeals Protest | `/appeals-protest` | IRS Appeals formal protest generation |
| 10 | Criminal Risk | `/criminal-risk` | CI referral risk assessment |
| 11 | Penalty Optimizer | `/penalty-optimizer` | Penalty abatement strategies (FTA, reasonable cause) |
| 12 | Transcript Analysis | `/transcript-analysis` | Decode IRS account transcripts |
| 13 | Audit Defense | `/audit-defense` | Audit response strategy and IDR handling |
| 14 | OIC Builder | `/oic-builder` | Offer in Compromise analysis and RCP calculation |
| 15 | Evidence Package | `/evidence-package` | Court-ready exhibit preparation |
| 16 | Form 433 Analysis | `/433-analysis` | Financial statement review for IRS |
| 17 | Tax Court Petition | `/tax-court-petition` | U.S. Tax Court petition preparation |
| 18 | Settlement Probability | `/settlement-probability` | Settlement modeling and probability |
| 19 | Trial Strategy | `/trial-strategy` | Tax Court trial preparation |
| 20 | Procedure Violations | `/procedure-violations` | IRS procedural error detection |
| 21 | Case Memory | `/case-memory` | Strategy continuity tracking |
| 22 | DOJ Litigation | `/doj-litigation` | DOJ Tax Division defense |
| 23 | Refund Suit | `/refund-suit` | Federal district court refund action |
| 24 | Case Router | `/case-router` | Jurisdiction and strategy selection |
| 25 | Tax Orchestrator | `/tax-orchestrator` | Master coordinator for all tax modules |

### Category 3: Forensic Investigation (5 Workflows)

| # | Workflow | Command | Description |
|---|----------|---------|-------------|
| 26 | Forensic Investigation | `/forensic` | Comprehensive fraud examination |
| 27 | Asset Tracing | `/asset-trace` | Locate and trace assets, flow of funds |
| 28 | Payroll Forensics | `/payroll-fraud` | Ghost employee detection, payroll schemes |
| 29 | AP/Procurement | `/ap-fraud` | Vendor fraud, duplicate payments, kickbacks |
| 30 | Statistical Anomalies | `/statistics` | Benford's Law, outlier detection |

### Category 4: Compliance (3 Workflows)

| # | Workflow | Command | Description |
|---|----------|---------|-------------|
| 31 | AML Compliance | `/aml` | Anti-money laundering, SAR generation |
| 32 | SOX Controls | `/sox` | SOX 404 internal controls testing |
| 33 | SEC Disclosure | `/sec` | Public company disclosure analysis |

### Category 5: Litigation Support (4 Workflows)

| # | Workflow | Command | Description |
|---|----------|---------|-------------|
| 34 | Litigation Support | `/litigation` | Expert witness preparation, damages |
| 35 | Settlement Analysis | `/settlement` | Settlement modeling and negotiation |
| 36 | Trial Support | `/trial` | Real-time trial assistance |
| 37 | CFO Dashboard | `/cfo` | Executive financial health dashboard |

### Category 6: Custom (1 Workflow)

| # | Workflow | Command | Description |
|---|----------|---------|-------------|
| 38 | Custom | `/financial-intake` | Flexible routing based on needs |

---

## Commands Reference

### Master Commands (Start Here)

```bash
/financial-intake      # Guided intake - routes to appropriate workflow
/tax-orchestrator      # Full tax controversy - runs all tax modules
/forensic              # Complete fraud investigation
```

### Accounting Commands

```bash
/accounting            # GAAP financials from bank statements
/reconcile             # Bank/GL reconciliation
/reports               # Financial statement generation
/reconstruct           # Records reconstruction
```

### IRS Tax Defense Commands

```bash
/tax-defense           # Comprehensive audit defense
/non-filer             # Non-filer defense
/sfr-attack            # SFR reconsideration
/collection-defense    # Levy/lien/garnishment defense
/appeals-protest       # Appeals protest generation
/criminal-risk         # Criminal exposure assessment
/penalty-optimizer     # Penalty abatement
/transcript-analysis   # Transcript decode
/audit-defense         # Audit strategy
/oic-builder           # Offer in Compromise
/evidence-package      # Court exhibits
/433-analysis          # Form 433 review
/tax-court-petition    # Tax Court petition
/settlement-probability # Settlement modeling
/trial-strategy        # Trial preparation
/procedure-violations  # IRS error detection
/case-memory           # Strategy continuity
/doj-litigation        # DOJ defense
/refund-suit           # Refund litigation
/case-router           # Jurisdiction routing
```

### Forensic Commands

```bash
/asset-trace           # Asset tracing
/payroll-fraud         # Ghost employee detection
/ap-fraud              # Vendor fraud
/statistics            # Benford's Law analysis
```

### Compliance Commands

```bash
/aml                   # AML/BSA compliance
/sox                   # SOX 404 testing
/sec                   # SEC disclosure analysis
```

### Litigation Commands

```bash
/litigation            # Expert witness support
/settlement            # Settlement modeling
/trial                 # Real-time trial support
/cfo                   # Executive dashboard
```

---

## Entity Types & Industries

### Supported Entity Types

| Entity Type | Tax Form | Description |
|-------------|----------|-------------|
| Individual | 1040 | Personal tax return |
| Sole Proprietorship | Schedule C | Business income |
| Single-Member LLC | 1040/Schedule C | Disregarded entity |
| Multi-Member LLC | 1065 | Partnership return |
| Partnership | 1065 | Partnership return |
| S Corporation | 1120-S | Pass-through entity |
| C Corporation | 1120 | Corporate tax return |
| Trust | 1041 | Fiduciary return |
| Estate | 1041 | Estate return |
| Nonprofit | 990 | Exempt organization |

### Supported Industries

- Retail
- Professional Services
- Construction
- Manufacturing
- Technology
- Healthcare
- Real Estate
- Financial Services
- Restaurant/Hospitality
- E-Commerce

---

## File Formats

### Supported Input Formats

| Format | Extensions | Use Case |
|--------|------------|----------|
| CSV | .csv | Bank statements, ledgers, payroll |
| Excel | .xlsx, .xls | Financial data, reports |
| PDF | .pdf | Statements, notices, tax returns |
| JSON | .json | Structured data, API exports |
| Text | .txt | IRS transcripts, notes |
| Images | .png, .jpg | Document scans |

### Sample Input Files

#### Bank Transactions (bank.csv)
```csv
date,description,amount,type,category,reference
2024-01-05,Wire Transfer - ABC Corp,15000.00,credit,revenue,WT-001
2024-01-08,Payroll - January,8500.00,debit,payroll,PR-001
```

#### Payroll Records (payroll.csv)
```csv
pay_date,employee_id,employee_name,gross_pay,net_pay,department
2024-01-15,EMP001,John Smith,4583.33,3316.03,Executive
```

#### IRS Transcript (transcript.txt)
```
TRANS CODE  TRANS DATE   CYCLE    AMOUNT
150         04-15-2023   202315   $0.00    Tax return filed
290         08-15-2023   202333   $11,025  Additional tax assessed
```

---

## Output Formats

### Report Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| Markdown | .md | Reports, memos, analysis |
| PDF | .pdf | Formal reports |
| Excel | .xlsx | Financial workbooks |
| CSV | .csv | Data exports |
| JSON | .json | Structured data |
| HTML | .html | Web reports |

### Accounting Software Exports

| Software | Format | Extension |
|----------|--------|-----------|
| QuickBooks Desktop | IIF | .iif |
| QuickBooks Online | CSV | .csv |
| Xero | CSV | .csv |
| Sage 50/Intacct | CSV | .csv |
| FreshBooks | CSV | .csv |
| Wave Accounting | CSV | .csv |
| Zoho Books | CSV | .csv |

---

## Legal Reference Library

### Internal Revenue Code (IRC) Sections

| Section | Description |
|---------|-------------|
| IRC §61 | Gross Income Defined |
| IRC §162 | Trade or Business Expenses |
| IRC §267 | Related Party Transactions |
| IRC §274 | Entertainment Expense Limits |
| IRC §6020(b) | Substitute for Return |
| IRC §6212 | Notice of Deficiency |
| IRC §6213 | Tax Court Petition |
| IRC §6330 | Collection Due Process |
| IRC §6651 | Failure to File/Pay Penalties |
| IRC §6662 | Accuracy-Related Penalty |
| IRC §6663 | Fraud Penalty |
| IRC §7122 | Offer in Compromise |
| IRC §7201 | Attempt to Evade Tax |
| IRC §7206 | Fraud and False Statements |
| IRC §7433 | Civil Damages for Unauthorized Collection |

### Internal Revenue Manual (IRM) References

| Section | Description |
|---------|-------------|
| IRM 4.8.9 | Examination Procedures |
| IRM 5.8 | Offer in Compromise |
| IRM 5.11 | Notice of Levy |
| IRM 5.12 | Federal Tax Lien |
| IRM 5.14 | Installment Agreements |
| IRM 5.19.1 | Balance Due Procedures |
| IRM 5.19.8 | Collection Due Process |
| IRM 8.22 | Appeals Procedures |

### Bank Secrecy Act (BSA) References

| Regulation | Description |
|------------|-------------|
| 31 USC 5311-5330 | Bank Secrecy Act |
| 31 CFR 1010.311 | CTR Filing Requirements |
| 31 CFR 1020.320 | SAR Filing Requirements |
| 31 USC 5324 | Structuring Prohibition |

---

## Testing & Validation

### Test Results Summary

```
╔═══════════════════════════════════════════════════════╗
║              VALIDATION RESULTS                       ║
╠═══════════════════════════════════════════════════════╣
║  Workflows Tested:        38/38           PASS        ║
║  Test Data Files:         19              CREATED     ║
║  Output Reports:          15              GENERATED   ║
║  Red Flag Detection:      10/10 (100%)    PASS        ║
║  Errors Found:            0               ZERO        ║
╠═══════════════════════════════════════════════════════╣
║  SYSTEM STATUS: PRODUCTION READY                      ║
╚═══════════════════════════════════════════════════════╝
```

### Red Flags Successfully Detected

| # | Red Flag | Detection Module |
|---|----------|------------------|
| 1 | Cash Structuring ($9,997-$9,999) | AML, Statistical |
| 2 | Ghost Employee | Payroll Forensics |
| 3 | Shell Company Payments | AP Procurement |
| 4 | Related Party (Undisclosed) | Forensic, SEC |
| 5 | Cash Payment to Unknown Vendor | AP Procurement |
| 6 | Round Dollar Payments | Statistical |
| 7 | Offshore Wire Transfers | AML, Asset Tracing |
| 8 | IRS Procedural Violations | Procedure Violations |
| 9 | Benford's Law Deviation | Statistical |
| 10 | SOX Material Weakness | Controls SOX |

### Test Files Location

```
test/
├── input/              # 19 test data files
│   ├── bank_transactions.csv
│   ├── general_ledger.csv
│   ├── payroll_records.csv
│   ├── invoices.csv
│   ├── tax_return_2023.json
│   ├── irs_transcript.txt
│   ├── irs_notice_cp2000.json
│   ├── form_433.json
│   └── ... (11 more)
│
├── output/             # Generated reports by workflow
│   ├── gaap_accounting/
│   ├── tax_defense/
│   ├── forensic_investigation/
│   └── ... (34 more)
│
├── comprehensive_test_report.md
└── VALIDATION_REPORT.md
```

---

## Directory Structure

```
financial-intelligence/
├── SKILL.md                    # Skill definition (required)
├── README.md                   # This documentation
├── LICENSE.md                  # Private use license
├── CHANGELOG.md                # Version history
├── .gitignore                  # Git ignore rules
│
├── workflows/
│   ├── workflow_intake.ts      # Master intake system
│   ├── forensic_playbook.md
│   └── realtime_trial_playbook.md
│
├── modules/
│   ├── irs_tax_defense/        # 21 IRS modules
│   │   ├── index.ts
│   │   ├── non_filer_defense.ts
│   │   ├── sfr_attack.ts
│   │   ├── collection_defense.ts
│   │   ├── advanced_modules.ts
│   │   ├── litigation_modules.ts
│   │   ├── case_router.ts
│   │   ├── master_orchestrator.ts
│   │   ├── tax_deadlines.ts
│   │   └── tax_law_reference.ts
│   │
│   ├── forensic/
│   ├── statistical_anomalies/
│   ├── fincen_aml/
│   ├── sec/
│   ├── controls_sox/
│   ├── cfo/
│   ├── payroll_forensics/
│   ├── ap_procurement/
│   ├── asset_tracing/
│   ├── reconciliation/
│   ├── records_intelligence/
│   ├── litigation_finance/
│   ├── settlement_engine/
│   └── realtime_trial/
│
├── core/
│   └── templates/              # Document templates
│
├── test/
│   ├── input/                  # Test data files
│   ├── output/                 # Generated outputs
│   └── VALIDATION_REPORT.md
│
└── examples/
    └── sample_outputs/         # Example reports
```

---

## Security & Privacy

### Data Handling

- All data processed locally
- No external API calls for sensitive data
- PII redaction available
- Full audit trail for all operations

### Guardrails

- Criminal screen runs first on all tax cases
- No legal advice provided (analytical only)
- All findings require source citation
- Evidence preservation protocols

### Evidence Integrity

- SHA-256 hashing of source files
- Line-level source references
- ISO 8601 timestamps
- Original data never modified

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 5.0.0 | 2026-02-02 | Initial release with 38 workflows |
| | | - 21 IRS tax defense modules |
| | | - Comprehensive forensic suite |
| | | - Full litigation support |
| | | - Zero-error validation |

---

## License

```
╔══════════════════════════════════════════════════════════════════╗
║           PERSONAL & EDUCATIONAL USE LICENSE                     ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Copyright © 2026 Ricardo Prieto. All Rights Reserved.          ║
║  Created using Claude Code by Anthropic                         ║
║                                                                   ║
║  PERMITTED USES                                                  ║
║  ✓ Personal, non-commercial use                                 ║
║  ✓ Educational and learning purposes                            ║
║  ✓ Academic projects with attribution                           ║
║  ✓ Studying code and documentation                              ║
║                                                                   ║
║  PROHIBITED USES                                                  ║
║  ✗ Commercial use or profit                                     ║
║  ✗ Redistribution without permission                            ║
║  ✗ Removing copyright notices                                   ║
║  ✗ Using outputs as professional advice                         ║
║                                                                   ║
║  DISCLAIMER                                                       ║
║  This software is for EDUCATIONAL purposes only.                ║
║  It does NOT provide legal, tax, financial, or accounting       ║
║  advice. Always consult qualified professionals.                ║
║                                                                   ║
║  See LICENSE.md for complete terms.                             ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Support

This software is provided for personal and educational use. For questions about permitted uses, see LICENSE.md.

---

<div align="center">

**Elite Financial Intelligence & Litigation System v5**

*38 Specialized Workflows | Production Ready | Zero Errors*

```
┌─────────────────────────────────────────────────────────────┐
│  "Empowering financial professionals with intelligent       │
│   analysis for accounting, tax defense, forensics,         │
│   compliance, and litigation."                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Created with [Claude Code](https://claude.ai/claude-code) by Anthropic**

*Demonstrating AI-assisted skill development for complex financial workflows*

---

Copyright © 2026 Ricardo Prieto. All Rights Reserved.

**PERSONAL & EDUCATIONAL USE ONLY | NOT FOR COMMERCIAL USE**

</div>
