# Forensic Investigation Playbook

A 15-phase methodology for comprehensive financial forensic investigations.

---

## Phase 0: Intake & Scope

### Objectives
- Define investigation boundaries
- Identify key stakeholders
- Establish materiality thresholds
- Document initial hypotheses

### Activities
1. Review engagement letter and scope
2. Identify period under investigation
3. List entities in scope
4. Define materiality levels
5. Document initial allegations or concerns
6. Establish communication protocols

### Deliverables
- [ ] Investigation scope document
- [ ] Materiality threshold memo
- [ ] Stakeholder contact list
- [ ] Initial hypothesis list

---

## Phase 1: Data Acquisition & Integrity

### Objectives
- Secure all relevant financial data
- Verify data integrity through hashing
- Establish chain of custody
- Assess data completeness

### Activities
1. Request and receive data files
2. Calculate SHA-256 hashes for all files
3. Document chain of custody
4. Assess data completeness vs. expectations
5. Identify missing or corrupted data

### Data Sources
- General ledger exports
- Bank statements
- Invoice/AP records
- Payroll registers
- Wire transfer logs
- Check images
- Journal entry details

### Integrity Checks
```
For each file:
1. Hash original file
2. Document source, date received, custodian
3. Verify row counts vs. expected
4. Check for truncation or corruption
5. Store in read-only location
```

### Deliverables
- [ ] Data inventory with hashes
- [ ] Chain of custody log
- [ ] Completeness assessment
- [ ] Data gap memo

---

## Phase 2: Normalization & Entity Resolution

### Objectives
- Transform data to canonical schema
- Resolve entity references
- Build transaction graph
- Create master data indexes

### Activities
1. Map source fields to canonical schema
2. Normalize dates, amounts, currencies
3. Resolve vendor/customer names
4. Link accounts to entities
5. Build relationship graph

### Key Transformations
- Date formats → YYYY-MM-DD
- Amounts → numeric, absolute values with direction indicator
- Names → standardized, deduplicated
- Accounts → unified account master

### Entity Resolution Rules
1. Exact match on identifiers (EIN, SSN, DUNS)
2. Fuzzy match on names (Levenshtein distance < 3)
3. Address matching (normalized, geocoded)
4. Manual review for uncertain matches

### Deliverables
- [ ] Canonical transaction file
- [ ] Entity master with relationships
- [ ] Account master
- [ ] Field mapping documentation

---

## Phase 3: Bank/GL Reconciliation

### Objectives
- Match bank transactions to GL entries
- Identify unmatched items
- Calculate reconciling differences
- Flag timing differences vs. true variances

### Activities
1. Match on date, amount, reference
2. Apply fuzzy matching for near-matches
3. Investigate unmatched bank items
4. Investigate unmatched GL items
5. Document reconciling items

### Match Criteria
| Level | Criteria | Confidence |
|-------|----------|------------|
| 1 | Exact date, amount, reference | 100% |
| 2 | Date ±3 days, exact amount | 90% |
| 3 | Exact date, amount ±$0.01 | 85% |
| 4 | Date ±3 days, amount ±1% | 70% |

### Red Flags
- Large unmatched amounts
- Systematic timing differences
- Missing bank deposits
- Unrecorded disbursements

### Deliverables
- [ ] Reconciliation workpaper
- [ ] Unmatched items list
- [ ] Variance analysis
- [ ] Reconciliation findings

---

## Phase 4: Baseline Financial Reality

### Objectives
- Establish accurate financial picture
- Calculate key metrics
- Identify baseline anomalies
- Document financial health indicators

### Activities
1. Summarize by account, period, entity
2. Calculate financial ratios
3. Compare to industry benchmarks
4. Identify unusual trends
5. Document baseline observations

### Key Metrics
- Revenue trends
- Expense ratios
- Cash flow patterns
- Working capital
- DSO/DPO
- Gross margin

### Deliverables
- [ ] Financial summary
- [ ] Ratio analysis
- [ ] Trend charts
- [ ] Baseline anomaly list

---

## Phase 5: Targeted Hypotheses

### Objectives
- Develop specific fraud hypotheses
- Design targeted tests
- Prioritize investigation paths
- Document assumptions

### Activities
1. Review initial allegations
2. Develop fraud scenarios
3. Identify data tests for each scenario
4. Prioritize by likelihood and impact
5. Document alternative explanations

### Common Fraud Hypotheses
- Fictitious vendors
- Billing schemes
- Check tampering
- Payroll fraud
- Expense reimbursement fraud
- Revenue manipulation
- Asset misappropriation

### Hypothesis Template
```
Hypothesis: [Description]
Indicators: [What would we expect to see]
Tests: [Specific data analyses]
Counter-hypothesis: [Alternative explanation]
Priority: [High/Medium/Low]
```

### Deliverables
- [ ] Hypothesis matrix
- [ ] Test plan by hypothesis
- [ ] Investigation priority list

---

## Phase 6: Deep Transaction Tracing

### Objectives
- Follow money flows end-to-end
- Identify suspicious patterns
- Document transaction chains
- Build supporting schedules

### Activities
1. Select high-risk transactions
2. Trace from initiation to settlement
3. Document supporting documents
4. Identify breaks in trail
5. Map relationships

### Tracing Elements
- Authorization
- Recording
- Custody
- Reconciliation
- Supporting documentation

### Deliverables
- [ ] Transaction trace workpapers
- [ ] Flow diagrams
- [ ] Document inventory
- [ ] Gap analysis

---

## Phase 7: Statistical & Behavioral Analysis

### Objectives
- Apply statistical tests
- Identify anomalies
- Detect manipulation patterns
- Quantify deviations

### Activities
1. Benford's Law analysis
2. Outlier detection (Z-score, IQR)
3. Clustering analysis
4. Time series analysis
5. Correlation analysis

### Statistical Tests

#### Benford's Law
- First digit distribution
- Second digit distribution
- Chi-square test
- MAD calculation

#### Outlier Detection
- Z-score > 3σ
- IQR × 1.5 (mild), × 3 (extreme)
- DBSCAN clustering

### Red Flags
- Non-conforming Benford distribution
- Threshold clustering (just below $10K, etc.)
- Round dollar concentrations
- Unusual seasonality

### Deliverables
- [ ] Statistical analysis report
- [ ] Benford results
- [ ] Outlier list
- [ ] Anomaly documentation

---

## Phase 8: Controls Testing

### Objectives
- Assess control environment
- Test key controls
- Identify control gaps
- Document deficiencies

### Activities
1. Document control design
2. Select controls for testing
3. Perform walkthrough
4. Test operating effectiveness
5. Evaluate deficiencies

### Key Controls
- Authorization limits
- Segregation of duties
- Reconciliation procedures
- Access controls
- Journal entry approval
- Vendor master changes

### Deliverables
- [ ] Control documentation
- [ ] Test results
- [ ] Deficiency summary
- [ ] Remediation recommendations

---

## Phase 9: AML Pattern Scan

### Objectives
- Identify suspicious activity patterns
- Apply FinCEN typologies
- Document SAR-worthy activity
- Assess compliance

### Activities
1. Structuring detection
2. Funnel pattern analysis
3. Rapid movement detection
4. Shell company indicators
5. Geographic risk assessment

### FinCEN Typologies
- Structuring
- Layering
- Funnel accounts
- Correspondent banking
- Trade-based laundering
- Real estate schemes

### Deliverables
- [ ] AML analysis report
- [ ] Suspicious activity summary
- [ ] SAR recommendations
- [ ] Compliance assessment

---

## Phase 10: Asset & Ownership Mapping

### Objectives
- Identify asset holdings
- Map ownership structures
- Detect concealment patterns
- Value traceable assets

### Activities
1. Entity relationship mapping
2. Beneficial ownership research
3. Asset tracing
4. Valuation analysis
5. Concealment indicator review

### Asset Categories
- Bank accounts
- Real property
- Vehicles
- Investments
- Business interests
- Intellectual property

### Concealment Indicators
- Complex ownership structures
- Nominee arrangements
- Offshore entities
- Recent transfers
- Under-market transactions

### Deliverables
- [ ] Ownership charts
- [ ] Asset inventory
- [ ] Valuation summary
- [ ] Concealment findings

---

## Phase 11: Findings & Corroboration

### Objectives
- Consolidate findings
- Cross-validate evidence
- Assess finding strength
- Document counter-arguments

### Activities
1. Compile all findings
2. Link findings to evidence
3. Test counter-hypotheses
4. Assess confidence levels
5. Identify gaps

### Finding Requirements
Each finding must include:
- Clear title and description
- Severity classification
- Evidence references
- Confidence score
- Counter-hypotheses
- Suggested strengthening

### Deliverables
- [ ] Consolidated findings
- [ ] Evidence matrix
- [ ] Confidence assessment
- [ ] Gap analysis

---

## Phase 12: Litigation / SEC Packaging

### Objectives
- Prepare court-ready materials
- Organize exhibits
- Calculate damages
- Document methodology

### Activities
1. Organize exhibits
2. Prepare demonstratives
3. Calculate damages bands
4. Document methodology
5. Prepare expert materials

### Exhibit Organization
- Chronological index
- Topical index
- Witness index
- Foundation requirements

### Deliverables
- [ ] Exhibit binders
- [ ] Damages calculation
- [ ] Methodology memo
- [ ] Demonstrative drafts

---

## Phase 13: Expert Preparation & Trial Modeling

### Objectives
- Prepare expert testimony
- Anticipate cross-examination
- Model trial scenarios
- Refine opinions

### Activities
1. Draft expert report
2. Prepare testimony outline
3. Identify vulnerabilities
4. Develop cross-exam defenses
5. Practice direct examination

### Expert Report Sections
1. Qualifications
2. Scope and limitations
3. Methodology
4. Findings
5. Opinions
6. Appendices

### Cross-Exam Preparation
- Identify weakest points
- Prepare for Daubert challenges
- Document basis for each opinion
- Practice difficult questions

### Deliverables
- [ ] Expert report
- [ ] Testimony outline
- [ ] Cross-exam preparation
- [ ] Visual aids

---

## Phase 14: Jury Narrative & Settlement Readiness

### Objectives
- Develop compelling narrative
- Prepare settlement analysis
- Create jury materials
- Assess negotiation position

### Activities
1. Craft case theme
2. Develop visual story
3. Calculate settlement range
4. Assess BATNA
5. Prepare negotiation strategy

### Narrative Elements
- Clear villain/victim
- Understandable scheme
- Quantified harm
- Call to action

### Settlement Analysis
- Best case damages
- Worst case exposure
- Probability-weighted outcomes
- Risk-adjusted range

### Deliverables
- [ ] Jury narrative
- [ ] Settlement memo
- [ ] Visual package
- [ ] Negotiation strategy

---

## Quality Checkpoints

### After Each Phase
- [ ] Deliverables complete
- [ ] Work reviewed
- [ ] Issues escalated
- [ ] Next phase planned

### Before Final Report
- [ ] All findings validated
- [ ] Evidence complete
- [ ] Counter-hypotheses addressed
- [ ] Methodology documented

---

*This playbook is for guidance only and should be adapted to specific engagement requirements.*
