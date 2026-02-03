/**
 * Penalty Relief Argument Generator
 * Develops penalty relief arguments under IRM and IRC
 */

import { Finding } from '../../core/types';
import { generateId } from '../../core/normalize';
import { TaxDefenseContext, PenaltyExposure } from './index';

// Common IRS Penalties
const PENALTIES = {
  accuracy_related: {
    irc: '6662',
    types: ['negligence', 'substantial_understatement', 'substantial_valuation'],
    rate: 0.20,
    relief_bases: ['reasonable_cause', 'substantial_authority', 'adequate_disclosure'],
  },
  fraud: {
    irc: '6663',
    rate: 0.75,
    relief_bases: [], // No relief for fraud
  },
  failure_to_file: {
    irc: '6651(a)(1)',
    rate: 0.05, // per month, max 25%
    relief_bases: ['reasonable_cause', 'first_time_abatement'],
  },
  failure_to_pay: {
    irc: '6651(a)(2)',
    rate: 0.005, // per month, max 25%
    relief_bases: ['reasonable_cause', 'first_time_abatement'],
  },
  estimated_tax: {
    irc: '6654/6655',
    relief_bases: ['casualty', 'disaster', 'retirement'],
  },
};

export async function runPenaltyReliefEngine(context: TaxDefenseContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Analyze potential penalty exposure
  const exposure = analyzePenaltyExposure(context);

  exposure.forEach(penalty => {
    // Generate relief arguments for each penalty
    const reliefArgs = generateReliefArguments(penalty);

    findings.push({
      id: generateId('PEN'),
      module: 'irs_tax_defense',
      title: `Penalty Exposure: ${penalty.type}`,
      description: `**IRC Section:** ${penalty.irc_section}\n` +
        `**Potential Penalty:** $${penalty.amount.toLocaleString()} (${(penalty.rate * 100).toFixed(0)}%)\n` +
        `**Tax Amount:** $${penalty.underlying_tax.toLocaleString()}\n\n` +
        `**Relief Available:** ${penalty.relief_available ? 'Yes' : 'No'}\n` +
        `**Relief Basis:** ${reliefArgs.primary_basis}`,
      severity: penalty.amount > 10000 ? 'high' : penalty.amount > 1000 ? 'medium' : 'low',
      confidence: 0.80,
      detected_at: new Date().toISOString(),
      evidence_refs: [],
      tags: ['penalty', 'irc_' + penalty.irc_section, penalty.type],
      recommended_actions: reliefArgs.recommended_actions,
      amount_involved: penalty.amount,
    });

    // Add detailed relief argument finding
    if (reliefArgs.arguments.length > 0) {
      findings.push({
        id: generateId('RLF'),
        module: 'irs_tax_defense',
        title: `Penalty Relief Strategy: ${penalty.type}`,
        description: reliefArgs.full_argument,
        severity: 'info',
        confidence: reliefArgs.success_probability,
        detected_at: new Date().toISOString(),
        evidence_refs: [],
        tags: ['penalty_relief', penalty.type],
      });
    }
  });

  // First Time Abatement Analysis
  const ftaAnalysis = analyzeFirstTimeAbatement(context);
  if (ftaAnalysis.eligible) {
    findings.push({
      id: generateId('FTA'),
      module: 'irs_tax_defense',
      title: 'First Time Abatement Eligibility',
      description: `**FTA Status:** ${ftaAnalysis.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}\n\n` +
        `${ftaAnalysis.analysis}\n\n` +
        `**IRM Reference:** IRM 20.1.1.3.6.1`,
      severity: 'info',
      confidence: ftaAnalysis.confidence,
      detected_at: new Date().toISOString(),
      evidence_refs: [],
      tags: ['penalty_relief', 'fta', 'first_time_abatement'],
      recommended_actions: ftaAnalysis.recommended_actions,
    });
  }

  return findings;
}

interface PenaltyAnalysis {
  type: string;
  irc_section: string;
  rate: number;
  underlying_tax: number;
  amount: number;
  relief_available: boolean;
}

interface ReliefArguments {
  primary_basis: string;
  arguments: string[];
  full_argument: string;
  success_probability: number;
  recommended_actions: string[];
}

function analyzePenaltyExposure(context: TaxDefenseContext): PenaltyAnalysis[] {
  const penalties: PenaltyAnalysis[] = [];

  // Estimate underlying tax based on transaction volume
  const transactions = Array.from(context.transactions.values());
  const totalIncome = transactions
    .filter(t => t.direction === 'credit' || t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const estimatedTax = totalIncome * 0.25; // Rough estimate

  // Always consider accuracy-related penalty
  if (estimatedTax > 0) {
    penalties.push({
      type: 'accuracy_related',
      irc_section: '6662',
      rate: 0.20,
      underlying_tax: estimatedTax,
      amount: estimatedTax * 0.20,
      relief_available: true,
    });
  }

  // Check for substantial understatement (>$5,000 or >10% of tax)
  const understatementThreshold = Math.max(5000, estimatedTax * 0.10);
  if (estimatedTax > understatementThreshold) {
    penalties.push({
      type: 'substantial_understatement',
      irc_section: '6662(d)',
      rate: 0.20,
      underlying_tax: estimatedTax,
      amount: estimatedTax * 0.20,
      relief_available: true,
    });
  }

  return penalties;
}

function generateReliefArguments(penalty: PenaltyAnalysis): ReliefArguments {
  const arguments_list: string[] = [];
  let primaryBasis = '';
  let fullArgument = '';
  let successProb = 0.5;
  const actions: string[] = [];

  switch (penalty.type) {
    case 'accuracy_related':
    case 'substantial_understatement':
      primaryBasis = 'Reasonable Cause and Good Faith';

      arguments_list.push(
        'Taxpayer acted in good faith and had reasonable cause for the position taken',
        'Taxpayer relied on qualified tax professional',
        'Position had substantial authority in the law',
        'Adequate disclosure was made on return'
      );

      fullArgument = `## Penalty Relief Request - IRC ${penalty.irc_section}

### Primary Argument: Reasonable Cause and Good Faith

Under IRC 6664(c), the accuracy-related penalty does not apply if the taxpayer shows reasonable cause and good faith.

**Reasonable Cause Factors (IRM 20.1.1.3.2):**
1. Taxpayer's effort to report proper tax liability
2. Taxpayer's knowledge, education, and experience
3. Reliance on advice of professional
4. Size and nature of the understatement

**Application to This Case:**

The taxpayer made a good faith effort to comply with tax laws by:
- Engaging qualified tax professionals
- Maintaining adequate records
- Making timely filings
- Cooperating with examination

### Alternative Argument: Substantial Authority

Under IRC 6662(d)(2)(B), no penalty applies if there was substantial authority for the position.

Substantial authority exists when the weight of authorities supporting the treatment is substantial in relation to the weight of authorities supporting contrary treatment.

### Alternative Argument: Adequate Disclosure

Under IRC 6662(d)(2)(B)(ii), no penalty applies if:
- The relevant facts were adequately disclosed on the return
- There was a reasonable basis for the position

**Conclusion:** Based on the above, penalty relief should be granted.`;

      successProb = 0.65;

      actions.push(
        'Document reliance on tax professional advice',
        'Prepare timeline of compliance efforts',
        'Gather evidence of good faith',
        'Request penalty appeal if initially denied'
      );
      break;

    case 'failure_to_file':
    case 'failure_to_pay':
      primaryBasis = 'Reasonable Cause / First Time Abatement';

      arguments_list.push(
        'First Time Abatement administrative waiver',
        'Reasonable cause for late filing/payment',
        'Circumstances beyond taxpayer control'
      );

      fullArgument = `## Penalty Relief Request - IRC ${penalty.irc_section}

### Primary Argument: First Time Abatement (FTA)

Under IRM 20.1.1.3.6.1, the IRS will waive the failure to file and/or failure to pay penalty if:
1. Taxpayer has no prior penalties in past 3 years
2. All required returns have been filed
3. All taxes due have been paid or arranged

### Alternative Argument: Reasonable Cause

Under Reg 301.6651-1(c), penalty may be waived if failure was due to reasonable cause and not willful neglect.

Reasonable cause factors:
- Death, serious illness, or unavoidable absence
- Fire, casualty, natural disaster
- Inability to obtain records
- Reliance on erroneous IRS advice

**Conclusion:** Penalty relief should be granted under FTA or reasonable cause.`;

      successProb = 0.75;

      actions.push(
        'Verify FTA eligibility criteria',
        'Request FTA by phone or letter',
        'Document reasonable cause if FTA unavailable',
        'Ensure all returns filed before requesting'
      );
      break;
  }

  return {
    primary_basis: primaryBasis,
    arguments: arguments_list,
    full_argument: fullArgument,
    success_probability: successProb,
    recommended_actions: actions,
  };
}

interface FTAAnalysis {
  eligible: boolean;
  analysis: string;
  confidence: number;
  recommended_actions: string[];
}

function analyzeFirstTimeAbatement(context: TaxDefenseContext): FTAAnalysis {
  // In real implementation, would check taxpayer history

  return {
    eligible: true, // Assume eligible for demonstration
    analysis: `**First Time Abatement Requirements (IRM 20.1.1.3.6.1):**

1. ✓ No penalties in prior 3 tax years (assumed)
2. ⚠️ All required returns filed (verify)
3. ⚠️ All taxes paid or in payment arrangement (verify)

**Procedure:**
- Can be requested by phone (1-800-829-1040)
- Or by written request
- Must be requested (not automatic)

**Note:** FTA applies to failure to file, failure to pay, and failure to deposit penalties. Does NOT apply to accuracy-related penalties.`,
    confidence: 0.80,
    recommended_actions: [
      'Verify no penalties in prior 3 years',
      'Ensure all returns are filed before requesting',
      'Call IRS or submit written request',
      'If denied, request reasonable cause review',
    ],
  };
}
