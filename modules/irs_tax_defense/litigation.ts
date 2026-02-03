/**
 * Tax Court Litigation Preparation Module
 */

import { Finding } from '../../core/types';
import { generateId } from '../../core/normalize';
import { TaxDefenseContext } from './index';

export async function runLitigationPrep(context: TaxDefenseContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  findings.push({
    id: generateId('LIT'),
    module: 'irs_tax_defense',
    title: 'Tax Court Litigation Readiness Assessment',
    description: generateLitigationOverview(),
    severity: 'info',
    confidence: 0.95,
    detected_at: new Date().toISOString(),
    evidence_refs: [],
    tags: ['litigation', 'tax_court', 'preparation'],
  });

  return findings;
}

function generateLitigationOverview(): string {
  return `# Tax Court Litigation Preparation

## Forum Selection

### U.S. Tax Court
- **Prepayment Forum** - No payment required
- **90-Day Letter Required** - Must file within 90 days
- **Jurisdiction:** Deficiency cases, CDP, partnership items

### U.S. District Court
- **Full Payment Required** (Flora rule)
- **Jury Trial Available**
- **File refund claim first**

### U.S. Court of Federal Claims
- **Full Payment Required**
- **No Jury**
- **Specialized tax judges**

## Tax Court Procedures

### Small Tax Case (S Case)
- Amount in dispute ≤ $50,000
- Simplified procedures
- No appeal (binding)
- Election required

### Regular Tax Case
- Formal procedures
- Discovery available
- Appeal to Circuit Court
- Precedential decisions

## Key Deadlines

1. **Petition Filing:** 90 days from Notice of Deficiency
2. **Answer:** 60 days from petition service
3. **Discovery:** Per court order
4. **Trial:** Per court calendar

## Petition Requirements (Rule 34)

1. Statement that petition is filed
2. Taxpayer information
3. Notice of deficiency information
4. Tax years at issue
5. Amounts in dispute
6. Assignment of errors
7. Statement of facts
8. Signature and declaration

## Discovery Tools

- Interrogatories
- Requests for Production
- Requests for Admission
- Depositions
- Subpoenas

## Trial Preparation

### Stipulations (Rule 91)
- Required attempt to stipulate
- Facts and documents
- Reduces trial time

### Briefs
- Opening brief
- Reply brief
- Simultaneous exchange

### Evidence
- Burden of proof considerations
- Hearsay rules
- Business records exception

## Settlement Opportunities

- Before trial
- During trial
- Qualified Offers (IRC 7430)
- Implications for attorney fees

## Hazards of Litigation Analysis

| Factor | Favorable | Unfavorable |
|--------|-----------|-------------|
| Law | Strong precedent | Adverse cases |
| Facts | Well documented | Missing records |
| Witness | Credible | Impeachable |
| Expert | Qualified | Challenged |

## Cost Considerations

- Attorney fees
- Expert witness fees
- Court costs
- Time investment
- Settlement vs. trial economics`;
}
