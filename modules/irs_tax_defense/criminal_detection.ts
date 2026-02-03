/**
 * Criminal Exposure Detection Module
 * FAILSAFE - Detects potential criminal tax exposure
 */

import { TaxDefenseContext } from './index';

interface CriminalExposureResult {
  exposure_detected: boolean;
  indicators: string[];
  confidence: number;
  recommendation: string;
}

// Badges of Fraud (IRM 25.1.1)
const FRAUD_BADGES = [
  {
    badge: 'Understatement of Income',
    patterns: ['unreported', 'omitted', 'hidden', 'concealed'],
    weight: 0.15,
  },
  {
    badge: 'Inadequate Records',
    patterns: ['destroyed', 'missing', 'no records', 'cash only'],
    weight: 0.10,
  },
  {
    badge: 'Failure to Cooperate',
    patterns: ['refused', 'uncooperative', 'obstruct'],
    weight: 0.12,
  },
  {
    badge: 'Dealing in Cash',
    patterns: ['large cash', 'structuring', 'smurfing'],
    weight: 0.15,
  },
  {
    badge: 'False Statements',
    patterns: ['false', 'lie', 'fabricat', 'forged'],
    weight: 0.18,
  },
  {
    badge: 'Substantial Understatement',
    patterns: ['material', 'substantial', 'gross'],
    weight: 0.12,
  },
  {
    badge: 'Pattern of Noncompliance',
    patterns: ['repeat', 'pattern', 'multiple years'],
    weight: 0.10,
  },
  {
    badge: 'Sophisticated Concealment',
    patterns: ['offshore', 'shell', 'nominee', 'layering'],
    weight: 0.18,
  },
];

// Criminal Tax Statutes
const CRIMINAL_STATUTES = {
  'IRC 7201': {
    title: 'Attempted Tax Evasion',
    elements: ['Substantial tax due', 'Willfulness', 'Affirmative act of evasion'],
    penalty: 'Felony - Up to 5 years, $250K fine',
  },
  'IRC 7206(1)': {
    title: 'Fraud and False Statements',
    elements: ['False material statement', 'Under penalties of perjury', 'Willfulness'],
    penalty: 'Felony - Up to 3 years, $250K fine',
  },
  'IRC 7206(2)': {
    title: 'Aiding/Assisting False Return',
    elements: ['Aid/assist preparation', 'False material matter', 'Knowledge'],
    penalty: 'Felony - Up to 3 years, $250K fine',
  },
  'IRC 7203': {
    title: 'Willful Failure to File/Pay',
    elements: ['Required to file/pay', 'Failure', 'Willfulness'],
    penalty: 'Misdemeanor - Up to 1 year, $100K fine',
  },
  '31 USC 5324': {
    title: 'Structuring Currency Transactions',
    elements: ['Purpose to evade reporting', 'Breaking up transactions', 'Knowledge of requirement'],
    penalty: 'Felony - Up to 5 years, $250K fine',
  },
};

export function detectCriminalExposure(context: TaxDefenseContext): CriminalExposureResult {
  const indicators: string[] = [];
  let totalWeight = 0;

  const transactions = Array.from(context.transactions.values());
  const allText = [
    ...transactions.map(t => t.description || ''),
    ...context.issues.map(i => i.description),
  ].join(' ').toLowerCase();

  // Check for fraud badges
  FRAUD_BADGES.forEach(badge => {
    const matches = badge.patterns.filter(p => allText.includes(p));
    if (matches.length > 0) {
      indicators.push(`${badge.badge}: ${matches.join(', ')}`);
      totalWeight += badge.weight;
    }
  });

  // Check for structuring
  const cashDeposits = transactions.filter(t =>
    t.description?.toLowerCase().includes('cash') &&
    (t.direction === 'credit' || t.amount > 0)
  );

  const nearThreshold = cashDeposits.filter(t =>
    t.amount >= 9000 && t.amount < 10000
  );

  if (nearThreshold.length >= 3) {
    indicators.push('Potential Structuring: Multiple cash deposits just under $10,000 threshold');
    totalWeight += 0.25;
  }

  // Check for offshore indicators
  const offshoreIndicators = transactions.filter(t =>
    t.description?.toLowerCase().includes('offshore') ||
    t.description?.toLowerCase().includes('foreign') ||
    t.description?.toLowerCase().includes('cayman') ||
    t.description?.toLowerCase().includes('swiss')
  );

  if (offshoreIndicators.length > 0) {
    indicators.push('Offshore Activity: Foreign accounts or entities detected');
    totalWeight += 0.15;
  }

  // Determine exposure level
  const exposureDetected = totalWeight >= 0.40; // 40% threshold
  const confidence = Math.min(totalWeight * 2, 0.95);

  return {
    exposure_detected: exposureDetected,
    indicators,
    confidence,
    recommendation: exposureDetected
      ? 'STOP ALL WORK. Potential criminal exposure detected. Immediately engage criminal tax counsel. ' +
        'Do not make any statements to IRS. Preserve all documents. Fifth Amendment considerations apply.'
      : 'No significant criminal exposure indicators detected. Continue with civil defense strategy.',
  };
}

export function generateCriminalExposureReport(result: CriminalExposureResult): string {
  if (!result.exposure_detected) {
    return `# Criminal Exposure Assessment

## Status: LOW RISK

No significant indicators of criminal tax exposure detected.

Confidence: ${(result.confidence * 100).toFixed(0)}%

Continue with civil defense strategy.`;
  }

  return `# ⚠️ CRIMINAL EXPOSURE ALERT ⚠️

## STATUS: POTENTIAL CRIMINAL EXPOSURE DETECTED

**Confidence Level:** ${(result.confidence * 100).toFixed(0)}%

---

## IMMEDIATE ACTIONS REQUIRED

1. **STOP** all communications with IRS
2. **DO NOT** provide any documents without counsel review
3. **ENGAGE** criminal tax defense counsel immediately
4. **PRESERVE** all documents and electronic records
5. **INVOKE** Fifth Amendment rights if questioned

---

## Indicators Detected

${result.indicators.map(i => `- ${i}`).join('\n')}

---

## Applicable Criminal Statutes

${Object.entries(CRIMINAL_STATUTES).map(([code, statute]) => `
### ${code} - ${statute.title}

**Elements:**
${statute.elements.map(e => `- ${e}`).join('\n')}

**Penalty:** ${statute.penalty}
`).join('\n---\n')}

---

## Fifth Amendment Considerations

The taxpayer has the right to refuse to answer questions that may incriminate.
This right applies to both oral and documentary evidence.

**Kovel Arrangement:** Consider engaging counsel to establish attorney-client privilege
for communications with accountants.

---

## WARNING

This assessment is NOT legal advice. Criminal tax matters require specialized
criminal defense counsel. The stakes are too high for self-representation.

---

*This report is work product and should be treated as privileged.*`;
}
