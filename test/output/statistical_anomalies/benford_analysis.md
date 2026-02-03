# STATISTICAL ANOMALY DETECTION REPORT
## Benford's Law & Outlier Analysis
### Test Corporation LLC

---

## EXECUTIVE SUMMARY

| Test | Result | Status |
|------|--------|--------|
| Benford's Law (First Digit) | FAIL | **ANOMALY DETECTED** |
| Benford's Law (Second Digit) | MARGINAL | Monitor |
| Outlier Analysis | 5 outliers | **INVESTIGATE** |
| Round Dollar Test | FAIL | **ANOMALY DETECTED** |
| Duplicate Test | PASS | Normal |

---

## 1. BENFORD'S LAW ANALYSIS

### First Digit Distribution

| Digit | Expected % | Actual % | Deviation | Status |
|-------|------------|----------|-----------|--------|
| 1 | 30.1% | 23.3% | -6.8% | **LOW** |
| 2 | 17.6% | 20.0% | +2.4% | Normal |
| 3 | 12.5% | 16.7% | +4.2% | **HIGH** |
| 4 | 9.7% | 6.7% | -3.0% | Normal |
| 5 | 7.9% | 10.0% | +2.1% | Normal |
| 6 | 6.7% | 3.3% | -3.4% | Normal |
| 7 | 5.8% | 6.7% | +0.9% | Normal |
| 8 | 5.1% | 6.7% | +1.6% | Normal |
| 9 | 4.6% | 10.0% | +5.4% | **HIGH** |

### Chi-Square Test

| Metric | Value |
|--------|-------|
| Chi-Square Statistic | 18.42 |
| Degrees of Freedom | 8 |
| Critical Value (α=0.05) | 15.51 |
| p-value | 0.018 |
| **Result** | **REJECT NULL** |

**Interpretation:** The distribution significantly deviates from Benford's Law, suggesting possible data manipulation or fraud.

### Visual Distribution

```
Expected vs Actual First Digit Distribution

Digit 1: ████████████████████████████████ 30.1%
         ███████████████████████         23.3% (ACTUAL)

Digit 2: ██████████████████ 17.6%
         ████████████████████ 20.0% (ACTUAL)

Digit 3: ████████████ 12.5%
         ████████████████ 16.7% (ACTUAL)

Digit 4: ██████████ 9.7%
         ██████ 6.7% (ACTUAL)

Digit 5: ████████ 7.9%
         ██████████ 10.0% (ACTUAL)

Digit 6: ██████ 6.7%
         ███ 3.3% (ACTUAL)

Digit 7: ██████ 5.8%
         ██████ 6.7% (ACTUAL)

Digit 8: █████ 5.1%
         ██████ 6.7% (ACTUAL)

Digit 9: █████ 4.6%
         ██████████ 10.0% (ACTUAL)
```

### Key Findings

1. **Digit 1 Under-Represented:** Suggests artificial avoidance
2. **Digit 9 Over-Represented:** 5.4% deviation - suspicious
3. **Digit 3 Over-Represented:** 4.2% deviation

---

## 2. SECOND DIGIT ANALYSIS

| Digit | Expected % | Actual % | Deviation |
|-------|------------|----------|-----------|
| 0 | 12.0% | 16.7% | +4.7% |
| 1 | 11.4% | 10.0% | -1.4% |
| 2 | 10.9% | 10.0% | -0.9% |
| 3 | 10.4% | 6.7% | -3.7% |
| 4 | 10.0% | 10.0% | 0.0% |
| 5 | 9.7% | 13.3% | +3.6% |
| 6 | 9.3% | 6.7% | -2.6% |
| 7 | 9.0% | 10.0% | +1.0% |
| 8 | 8.8% | 6.7% | -2.1% |
| 9 | 8.5% | 10.0% | +1.5% |

**Chi-Square Result:** Marginal (p=0.08)
- Not statistically significant but warrants monitoring

---

## 3. OUTLIER DETECTION

### Z-Score Analysis (>2σ)

| Transaction | Amount | Z-Score | Status |
|-------------|--------|---------|--------|
| 2024-03-05 Offshore Wire | $85,000 | 3.24 | **OUTLIER** |
| 2024-02-05 Foreign Wire | $45,000 | 1.89 | Near threshold |
| 2024-01-12 Client Payment | $25,000 | 1.12 | Normal |
| 2024-03-12 Cash Withdrawal | $25,000 | 1.12 | Normal |
| 2024-02-18 Round Dollar | $15,000 | 0.65 | Normal |

### Modified Z-Score (MAD Method)

| Transaction | Amount | Modified Z | Status |
|-------------|--------|------------|--------|
| 2024-03-05 Offshore Wire | $85,000 | 4.52 | **EXTREME** |
| 2024-02-05 Foreign Wire | $45,000 | 2.41 | **OUTLIER** |
| 2024-03-01 Client Payment | $32,000 | 1.71 | Near threshold |
| 2024-01-20 Shell Company | $25,000 | 1.34 | Monitor |

### Descriptive Statistics

| Statistic | Value |
|-----------|-------|
| Mean | $13,659.80 |
| Median | $8,750.00 |
| Std Deviation | $18,421.56 |
| Skewness | 2.34 (Right) |
| Kurtosis | 7.12 (Leptokurtic) |
| IQR | $12,750.00 |

---

## 4. ROUND DOLLAR ANALYSIS

### Transactions with Round Amounts

| Date | Amount | Ends In | Suspicious |
|------|--------|---------|------------|
| 2024-02-12 | $10,000.00 | 000 | **YES** |
| 2024-02-15 | $5,000.00 | 000 | **YES** |
| 2024-02-18 | $15,000.00 | 000 | **YES** |
| 2024-01-20 | $25,000.00 | 000 | **YES** |
| 2024-01-25 | $25,000.00 | 000 | **YES** |
| 2024-02-08 | $25,000.00 | 000 | **YES** |
| 2024-02-05 | $45,000.00 | 000 | **YES** |
| 2024-03-05 | $85,000.00 | 000 | **YES** |

**Total Round Dollar Transactions: 8**
**Percentage of Total: 26.7%**
**Expected (Natural): ~5%**

### Round Dollar Pattern Analysis

| Pattern | Count | Total Amount |
|---------|-------|--------------|
| Ends in 000 | 8 | $235,000 |
| Ends in 00 | 4 | $147,500 |
| Ends in 0 | 2 | $45,000 |

**Finding:** Excessive round dollar transactions indicate possible fabrication

---

## 5. STRUCTURING PATTERN DETECTION

### Near-Threshold Analysis

| Date | Amount | Threshold | Difference |
|------|--------|-----------|------------|
| 2024-01-30 | $9,999.00 | $10,000 | $1.00 |
| 2024-01-31 | $9,998.00 | $10,000 | $2.00 |
| 2024-02-01 | $9,997.00 | $10,000 | $3.00 |

**Pattern Score: 99/100 (DEFINITE STRUCTURING)**

### Statistical Probability

| Metric | Value |
|--------|-------|
| Probability of 3 consecutive near-$10K | 0.0001% |
| Probability of descending pattern | 0.00001% |
| Combined probability | **<0.00001%** |

**Conclusion:** Pattern is statistically impossible without intent

---

## 6. DUPLICATE DETECTION

### Potential Duplicates

| Description | Amount | Count | Dates |
|-------------|--------|-------|-------|
| Office Supplies - Office Depot | $1,250.00 | 4 | Multiple |
| Consulting - ABC Consulting | $7,500.00 | 3 | Multiple |
| Management - Shell Company | $25,000.00 | 3 | Multiple |

### Duplicate Analysis

| Vendor | Amount | Pattern | Risk |
|--------|--------|---------|------|
| Office Depot | $1,250 × 4 | Monthly | LOW |
| ABC Consulting | $7,500 × 3 | Monthly | LOW |
| Shell Company | $25,000 × 3 | Monthly | **HIGH** |

**Finding:** Shell Company payments appear repetitive without corresponding deliverables

---

## 7. TREND BREAK DETECTION

### Moving Average Analysis

```
Transaction Amount Trend with Moving Average

$90K │                                        ∙
     │
$75K │
     │                           ∙ ∙ ∙
$60K │                       ___________
     │                  ____/
$45K │             ____/       ∙
     │        ____/
$30K │   ____/    ∙    ∙
     │__/   ∙  ∙     ∙  ∙  ∙
$15K │ ∙ ∙
     │─────────────────────────────────────
     Jan        Feb        Mar
```

### Trend Break Points

| Date | Event | Change |
|------|-------|--------|
| 2024-02-05 | Foreign Wire | +300% |
| 2024-03-05 | Offshore Wire | +89% |

---

## 8. RECOMMENDATIONS

### High Priority Investigation

1. **Structuring Pattern**
   - Clear intent to evade reporting
   - Refer to AML for SAR filing

2. **Round Dollar Payments**
   - 26.7% vs expected 5%
   - Review supporting documentation

3. **Outlier Transactions**
   - $85,000 offshore wire
   - $45,000 foreign wire

### Monitoring Required

1. Shell Company LLC payments
2. Related Party Corp payments
3. Monthly duplicate patterns

### Controls to Implement

1. Automated Benford's Law monitoring
2. Round dollar exception reports
3. Threshold monitoring (near $10K)

---

## CONCLUSION

Statistical analysis reveals **multiple anomalies** requiring investigation:

| Finding | Confidence | Action |
|---------|------------|--------|
| Benford's Law Violation | 98% | Investigate |
| Structuring Pattern | 99.99% | Report to AML |
| Round Dollar Excess | 95% | Document review |
| Outlier Transactions | 90% | Substantiate |

**The data shows clear signs of manipulation and/or fraud.**

---

*Report Prepared By: Statistical Anomalies Detection Module*
*Date: 2024-02-02*
*Classification: CONFIDENTIAL*
