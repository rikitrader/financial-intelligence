/**
 * Collection Defense Module
 * Strategies for IRS collection alternatives
 */

import { Finding } from '../../core/types';
import { generateId } from '../../core/normalize';
import { TaxDefenseContext } from './index';

export async function runCollectionDefense(context: TaxDefenseContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  findings.push({
    id: generateId('COL'),
    module: 'irs_tax_defense',
    title: 'Collection Alternatives Overview',
    description: generateCollectionOverview(),
    severity: 'info',
    confidence: 0.95,
    detected_at: new Date().toISOString(),
    evidence_refs: [],
    tags: ['collection', 'alternatives', 'defense'],
  });

  return findings;
}

function generateCollectionOverview(): string {
  return `# IRS Collection Defense Strategies

## Collection Due Process (CDP) Rights

Under IRC 6320 and 6330, taxpayers have the right to:
- Notice before levy action
- Request a CDP hearing
- Challenge the appropriateness of collection action
- Propose collection alternatives
- Appeal to Tax Court if denied

## Collection Alternatives

### 1. Installment Agreement (IA)
**IRC 6159**

**Types:**
- Streamlined IA (balance ≤ $50,000)
- Non-Streamlined IA (balance > $50,000)
- Partial Payment IA (PPIA)
- In-Business Trust Fund Express IA

**Requirements:**
- All returns filed
- Current on estimated taxes
- Financial disclosure (if required)

### 2. Offer in Compromise (OIC)
**IRC 7122**

**Bases for OIC:**
- Doubt as to Liability (DAL)
- Doubt as to Collectibility (DATC)
- Effective Tax Administration (ETA)

**OIC Formula (DATC):**
- Future income × remaining CSED months
- Plus: Realizable value of assets
- Equals: Reasonable Collection Potential (RCP)

### 3. Currently Not Collectible (CNC)
**IRM 5.16**

**Requirements:**
- Demonstrate hardship
- Financial disclosure (Form 433-A/B)
- Periodic review by IRS

### 4. Innocent Spouse Relief
**IRC 6015**

**Types:**
- Traditional Innocent Spouse (6015(b))
- Separation of Liability (6015(c))
- Equitable Relief (6015(f))

### 5. Penalty Abatement
**IRC 6651, 6662**

- First Time Abatement
- Reasonable Cause
- Statutory Exceptions

## Collection Statute Expiration Date (CSED)

- 10 years from assessment (IRC 6502)
- Can be extended by agreement or OIC
- Track CSED for each assessment

## Bankruptcy Considerations

**Dischargeable Taxes (Chapter 7):**
- Income taxes > 3 years old
- Return filed > 2 years before bankruptcy
- Assessment > 240 days before bankruptcy
- No fraud or willful evasion

## Enforcement Actions

**Levies (IRC 6331):**
- Bank accounts
- Wages
- Social Security
- State tax refunds

**Liens (IRC 6321):**
- Federal Tax Lien (Notice of)
- Subordination requests
- Discharge requests
- Withdrawal requests

## Defense Strategies

1. **Request CDP Hearing** within 30 days of notice
2. **Propose Alternatives** before levy
3. **Challenge RCP Calculation** in OIC
4. **Track CSED** - may expire before collection
5. **Consider Bankruptcy** timing strategies`;
}
