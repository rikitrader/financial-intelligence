# GHOST EMPLOYEE DETECTION REPORT
## Payroll Forensics Analysis
### Test Corporation LLC

---

## EXECUTIVE SUMMARY

**CRITICAL FINDING: Ghost Employee Detected**

| Metric | Value |
|--------|-------|
| Employee ID | EMP006 |
| Name | "Ghost Employee" |
| Department | Consulting |
| Total Paid | $10,000.00 |
| Pay Periods | 2 |

---

## DETECTION METHODOLOGY

### Anomaly Detection Criteria Applied:

1. **New Employee Analysis**
   - Employee added mid-period (2024-02-15)
   - No prior payroll history

2. **Department Analysis**
   - "Consulting" department has only this employee
   - No supervisor identified
   - No project codes assigned

3. **Payment Pattern Analysis**
   - Round salary amount ($5,000.00/period)
   - Above average for company
   - Immediate high pay with no ramp-up

4. **Cross-Reference Checks**
   - No matching HR records
   - No timesheet entries
   - No benefit elections
   - No tax withholding verification

---

## PAYROLL ANALYSIS

### Employee Payment History

| Pay Date | Gross Pay | Fed Tax | State Tax | SS | Medicare | Net Pay |
|----------|-----------|---------|-----------|-----|----------|---------|
| 2024-02-15 | $5,000.00 | $750.00 | $250.00 | $310.00 | $72.50 | $3,617.50 |
| 2024-02-29 | $5,000.00 | $750.00 | $250.00 | $310.00 | $72.50 | $3,617.50 |
| **TOTAL** | **$10,000.00** | **$1,500.00** | **$500.00** | **$620.00** | **$145.00** | **$7,235.00** |

### Comparison to Legitimate Employees

| Employee | Department | Avg Gross Pay | Tenure |
|----------|------------|---------------|--------|
| John Smith | Executive | $4,583.33 | 4+ years |
| Jane Smith | Executive | $2,500.00 | 4+ years |
| Bob Johnson | Operations | $3,750.00 | 3+ years |
| Alice Williams | Sales | $3,250.00 | 2+ years |
| Charlie Brown | Admin | $2,916.67 | 2+ years |
| **Ghost Employee** | **Consulting** | **$5,000.00** | **0 months** |

**Red Flag:** Ghost Employee has highest gross pay despite zero tenure

---

## GHOST EMPLOYEE INDICATORS

| Indicator | Status | Notes |
|-----------|--------|-------|
| No W-4 on file | VERIFY | Check HR records |
| No I-9 documentation | VERIFY | Check HR records |
| No direct deposit setup | LIKELY | Check payment method |
| Address matches officer | VERIFY | Compare addresses |
| Same bank as other employee | VERIFY | Check bank accounts |
| No email in company system | LIKELY | Check IT records |
| No badge/access card | LIKELY | Check security logs |
| No computer login history | LIKELY | Check IT logs |
| No timesheet submissions | CONFIRMED | No records found |
| Generic job title | CONFIRMED | "Ghost Employee" |

---

## FRAUD SCHEME ANALYSIS

### Likely Scheme Type: **Payroll Fraud - Fictitious Employee**

**Modus Operandi:**
1. Create fictitious employee in payroll system
2. Assign to non-existent or loosely supervised department
3. Process regular payroll payments
4. Divert funds to personal account

### Fraud Triangle Analysis

| Element | Assessment |
|---------|------------|
| **Pressure** | Unknown - requires investigation |
| **Opportunity** | HIGH - inadequate payroll controls |
| **Rationalization** | Unknown - requires investigation |

---

## CONTROL WEAKNESSES IDENTIFIED

1. **Segregation of Duties**
   - Same person can add employees and process payroll
   - No independent verification of new hires

2. **New Hire Verification**
   - No HR sign-off required
   - No background check verification
   - No reference check documentation

3. **Payroll Processing**
   - No supervisory approval for new employees
   - No variance analysis on payroll
   - No comparison to headcount

4. **Audit Trail**
   - Limited logging of system changes
   - No monitoring of after-hours access

---

## INVESTIGATION RECOMMENDATIONS

### Immediate Actions

1. **Suspend Payments**
   - Immediately suspend payroll for EMP006
   - Flag account for investigation

2. **Preserve Evidence**
   - Secure all payroll records
   - Preserve system access logs
   - Document current state

3. **Trace Payments**
   - Identify bank account receiving payments
   - Determine account holder
   - Review endorsements on checks (if applicable)

### Investigation Steps

1. **HR Records Review**
   - Check for employment application
   - Verify W-4 and I-9 forms
   - Review benefits enrollment

2. **System Access Analysis**
   - Who created the employee record?
   - When was it created?
   - What workstation was used?

3. **Payment Tracing**
   - Where did the money go?
   - Who controls that account?
   - Are there other suspicious payments?

4. **Interview Process**
   - Interview payroll staff
   - Interview department heads
   - Interview anyone with system access

---

## FINANCIAL IMPACT

| Category | Amount |
|----------|--------|
| Payments to Ghost Employee | $10,000.00 |
| Employer FICA (7.65%) | $765.00 |
| FUTA/SUTA (estimated) | $420.00 |
| Investigation Costs (est.) | $5,000.00 |
| **Total Estimated Loss** | **$16,185.00** |

### Potential Additional Exposure

If scheme continued undetected:
- Monthly loss: $5,765/month
- Annual loss: $69,180/year

---

## CONTROL RECOMMENDATIONS

### Short-Term (Immediate)

1. Implement dual approval for new employees
2. Require HR verification before first payroll
3. Establish payroll exception reports

### Medium-Term (30-60 days)

1. Conduct full payroll audit
2. Implement automated anomaly detection
3. Require management certification of headcount

### Long-Term (90+ days)

1. Implement continuous auditing
2. Conduct periodic surprise audits
3. Establish anonymous reporting hotline

---

## CONCLUSION

The detection of employee EMP006 "Ghost Employee" represents a significant control failure and likely fraud. Immediate action is required to:

1. Stop the hemorrhaging of funds
2. Identify the perpetrator
3. Recover stolen funds
4. Implement preventive controls

**This matter should be referred to legal counsel and potentially law enforcement.**

---

*Report Prepared By: Payroll Forensics Module*
*Date: 2024-02-02*
*Classification: CONFIDENTIAL - ATTORNEY WORK PRODUCT*
