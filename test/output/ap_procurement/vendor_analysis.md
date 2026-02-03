# AP/PROCUREMENT FRAUD ANALYSIS
## Vendor Risk Assessment
### Test Corporation LLC

---

## EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| Total Vendors Analyzed | 7 |
| High-Risk Vendors | 3 |
| Suspicious Payments | $135,000 |
| Duplicate Payment Risk | LOW |
| Kickback Indicators | MEDIUM |

---

## HIGH-RISK VENDOR ANALYSIS

### 1. SHELL COMPANY LLC (V005)

**RISK LEVEL: CRITICAL**

| Metric | Value |
|--------|-------|
| Total Payments | $75,000 |
| Invoice Count | 3 |
| Average Invoice | $25,000 |
| Payment Method | Wire Transfer |

#### Invoice Details

| Invoice # | Date | Amount | Description |
|-----------|------|--------|-------------|
| INV-2024-007 | 2024-01-20 | $25,000 | Management Fees |
| INV-2024-009 | 2024-01-25 | $25,000 | Consulting Fees |
| INV-2024-013 | 2024-02-08 | $25,000 | Advisory Services |

#### Red Flags Detected

| Flag | Severity | Details |
|------|----------|---------|
| Shell company indicators | CRITICAL | Generic name, no online presence |
| Vague descriptions | HIGH | No specific deliverables |
| Round dollar amounts | MEDIUM | All invoices exactly $25,000 |
| Rapid payment cycle | MEDIUM | Paid within 15 days |
| No contract on file | HIGH | Services without agreement |

#### Vendor Validation Checklist

| Item | Status |
|------|--------|
| W-9 on file | NOT VERIFIED |
| Business license | NOT VERIFIED |
| Physical address | NOT VERIFIED |
| Bank account ownership | NOT VERIFIED |
| Insurance certificates | NOT VERIFIED |
| References checked | NO |

**RECOMMENDATION:** Suspend all payments, conduct full investigation

---

### 2. RELATED PARTY CORP (V007)

**RISK LEVEL: HIGH**

| Metric | Value |
|--------|-------|
| Total Payments | $50,000 |
| Invoice Count | 1 |
| Payment Method | Wire Transfer |

#### Invoice Details

| Invoice # | Date | Amount | Description |
|-----------|------|--------|-------------|
| INV-2024-015 | 2024-02-12 | $50,000 | Management Services |

#### Red Flags Detected

| Flag | Severity | Details |
|------|----------|---------|
| Related party name | HIGH | Suggests undisclosed relationship |
| Large single payment | MEDIUM | Single invoice for full amount |
| No disclosure | CRITICAL | Not reported per GAAP |
| Vague services | HIGH | "Management Services" undefined |

#### Related Party Analysis

| Question | Finding |
|----------|---------|
| Common ownership? | LIKELY |
| Common management? | LIKELY |
| Arm's length pricing? | UNKNOWN |
| Proper disclosure? | NO |
| Board approval? | NOT DOCUMENTED |

**RECOMMENDATION:** Obtain related party disclosure, verify arm's length pricing

---

### 3. UNKNOWN VENDOR (V006)

**RISK LEVEL: CRITICAL**

| Metric | Value |
|--------|-------|
| Total Payments | $10,000 |
| Invoice Count | 1 |
| Payment Method | **CASH** |

#### Invoice Details

| Invoice # | Date | Amount | Description |
|-----------|------|--------|-------------|
| INV-2024-012 | 2024-02-05 | $10,000 | Services Rendered |

#### Red Flags Detected

| Flag | Severity | Details |
|------|----------|---------|
| Cash payment | CRITICAL | B2B cash unusual |
| Unknown vendor name | CRITICAL | Literal "Unknown Vendor" |
| No documentation | CRITICAL | No supporting documents |
| Vague description | HIGH | "Services Rendered" |
| No W-9 | HIGH | Tax reporting issue |

#### Fictitious Vendor Indicators

| Indicator | Present |
|-----------|---------|
| No verifiable address | YES |
| No phone number | YES |
| No email contact | YES |
| No website | YES |
| Employee matches | CHECK |
| PO Box only | CHECK |

**RECOMMENDATION:** IMMEDIATE INVESTIGATION - Possible fictitious vendor

---

## NORMAL RISK VENDORS

### Office Depot (V001)

**RISK LEVEL: LOW**

| Metric | Value |
|--------|-------|
| Total Payments | $5,000 |
| Invoice Count | 4 |
| Average Invoice | $1,250 |

| Invoice # | Date | Amount | Description |
|-----------|------|--------|-------------|
| INV-2024-001 | 2024-01-05 | $1,250 | Office Supplies |
| INV-2024-004 | 2024-01-12 | $1,250 | Office Supplies |
| INV-2024-008 | 2024-01-22 | $1,250 | Office Supplies |
| INV-2024-014 | 2024-02-10 | $1,250 | Office Supplies |

**Note:** Recurring same-amount invoices warrant verification of actual receipts

---

### ABC Consulting (V002)

**RISK LEVEL: LOW**

| Metric | Value |
|--------|-------|
| Total Payments | $22,500 |
| Invoice Count | 3 |
| Average Invoice | $7,500 |

**Note:** Regular consulting arrangement appears legitimate

---

### Quick Print Shop (V004)

**RISK LEVEL: LOW**

| Metric | Value |
|--------|-------|
| Total Payments | $5,000 |
| Invoice Count | 2 |
| Average Invoice | $2,500 |

---

### XYZ Technologies (V003)

**RISK LEVEL: LOW**

| Metric | Value |
|--------|-------|
| Total Payments | $15,000 |
| Invoice Count | 1 |

**Note:** Software license - verify actual usage

---

## DUPLICATE PAYMENT ANALYSIS

### Potential Duplicates Identified

| Vendor | Amount | Frequency | Status |
|--------|--------|-----------|--------|
| Office Depot | $1,250 | 4× monthly | VERIFY |
| Shell Company | $25,000 | 3× monthly | **SUSPICIOUS** |

### Duplicate Detection Matrix

| Invoice 1 | Invoice 2 | Amount | Days Apart | Duplicate? |
|-----------|-----------|--------|------------|------------|
| INV-2024-007 | INV-2024-009 | $25,000 | 5 | POSSIBLE |
| INV-2024-009 | INV-2024-013 | $25,000 | 14 | POSSIBLE |

---

## KICKBACK INDICATORS

### Vendor Concentration Analysis

| Vendor | % of Total AP | Risk |
|--------|---------------|------|
| Shell Company LLC | 41.2% | **HIGH** |
| Related Party Corp | 27.5% | **HIGH** |
| ABC Consulting | 12.4% | MEDIUM |
| Others | 18.9% | LOW |

**Finding:** 68.7% of payments go to two suspicious vendors

### Pricing Analysis

| Vendor | Service | Rate | Market Rate | Variance |
|--------|---------|------|-------------|----------|
| ABC Consulting | Consulting | $7,500/mo | $5,000-$8,000 | Normal |
| Shell Company | "Management" | $25,000/mo | Unknown | **INVESTIGATE** |
| Related Party | "Services" | $50,000 | Unknown | **INVESTIGATE** |

### Approval Pattern Analysis

| Pattern | Finding |
|---------|---------|
| Same approver for all high-risk | CHECK |
| Approval above authority | CHECK |
| Split invoices under threshold | NOT DETECTED |
| Weekend/holiday approvals | NOT DETECTED |

---

## CONTROL WEAKNESSES IDENTIFIED

### Vendor Onboarding

| Control | Status |
|---------|--------|
| W-9 verification | WEAK |
| Business license verification | WEAK |
| Reference checks | NOT PERFORMED |
| Background screening | NOT PERFORMED |
| Approved vendor list | NOT MAINTAINED |

### Invoice Processing

| Control | Status |
|---------|--------|
| Three-way match | NOT IMPLEMENTED |
| PO requirement | INCONSISTENT |
| Duplicate detection | MANUAL ONLY |
| Approval matrix | UNCLEAR |

### Payment Controls

| Control | Status |
|---------|--------|
| Segregation of duties | WEAK |
| Bank account verification | NOT PERFORMED |
| Check stock security | UNKNOWN |
| Wire approval process | SINGLE APPROVER |

---

## RECOMMENDATIONS

### Immediate Actions (24-48 hours)

1. **Suspend payments to Shell Company LLC**
2. **Investigate Unknown Vendor payment**
3. **Obtain related party documentation**

### Short-Term Actions (1-2 weeks)

1. Implement vendor validation checklist
2. Require W-9 before payment
3. Establish approved vendor list

### Long-Term Actions (30+ days)

1. Implement three-way matching
2. Deploy automated duplicate detection
3. Establish vendor risk scoring
4. Conduct periodic vendor audits

---

## FINANCIAL EXPOSURE SUMMARY

| Category | Amount | Risk Level |
|----------|--------|------------|
| Shell Company Payments | $75,000 | CRITICAL |
| Related Party (Undisclosed) | $50,000 | HIGH |
| Cash to Unknown | $10,000 | CRITICAL |
| **Total Exposure** | **$135,000** | |

---

*Report Prepared By: AP/Procurement Fraud Module*
*Date: 2024-02-02*
*Classification: CONFIDENTIAL*
