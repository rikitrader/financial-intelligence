/**
 * IRS LITIGATION & ADVANCED DEFENSE MODULES
 *
 * This file contains specialized litigation and advanced defense modules:
 * 1. Financial Statement Analyzer (Form 433 Automation)
 * 2. Tax Court Petition Builder
 * 3. Settlement Probability Model
 * 4. Tax Court Trial Strategy Engine
 * 5. IRS Procedure Violation Detector
 * 6. Case Memory & Strategy Continuity System
 * 7. DOJ Tax Division Litigation Module
 * 8. Federal District Court Refund Suit Module
 *
 * TRIGGER COMMANDS:
 * - /433-analysis
 * - /tax-court-petition
 * - /settlement-probability
 * - /trial-strategy
 * - /procedure-violations
 * - /case-memory
 * - /doj-litigation
 * - /refund-suit
 */

// ============================================================================
// 1. FINANCIAL STATEMENT ANALYZER (FORM 433 AUTOMATION)
// ============================================================================

export interface Form433Input {
  monthly_income_sources: { source: string; amount: number }[];
  business_income?: { gross: number; expenses: number };
  monthly_expenses: {
    housing: number;
    food: number;
    transportation: number;
    health: number;
    utilities: number;
    other: number;
  };
  assets: {
    home_fmv: number;
    home_loan: number;
    vehicle_fmv: number;
    vehicle_loan: number;
    bank_accounts: number;
    retirement_accounts: number;
    investments: number;
    other_assets: number;
  };
  secured_debts: number;
  tax_debt_amount: number;
  dependents: number;
  state_of_residence: string;
  filing_status: 'single' | 'mfj' | 'mfs' | 'hoh';
}

export interface Form433Output {
  allowable_expense_adjustment: {
    category: string;
    actual: number;
    irs_allowable: number;
    adjustment: number;
  }[];
  net_disposable_income: number;
  asset_equity: {
    asset: string;
    fmv: number;
    loan: number;
    quick_sale_value: number;
    equity: number;
  }[];
  total_asset_equity: number;
  rcp_calculation: {
    asset_equity: number;
    future_income_12: number;
    future_income_24: number;
    total_rcp_lump: number;
    total_rcp_periodic: number;
  };
  resolution_eligibility: {
    installment_agreement: { eligible: boolean; type: string; reason: string };
    cnc: { eligible: boolean; reason: string };
    oic: { eligible: boolean; reason: string };
  };
  financial_risk_flags: string[];
  timeline: string;
}

// IRS National Standards (2024 approximation)
const IRS_NATIONAL_STANDARDS = {
  food_clothing_misc: {
    1: 785,
    2: 1410,
    3: 1610,
    4: 1900,
    5: 2200, // 5+ persons
  },
  health_care: {
    under_65: 75,
    over_65: 153,
  },
  out_of_pocket: {
    under_65: 62,
    over_65: 165,
  },
};

export function analyzeForm433(input: Form433Input): Form433Output {
  // Calculate total income
  const totalIncome = input.monthly_income_sources.reduce((sum, s) => sum + s.amount, 0) +
    (input.business_income ? input.business_income.gross - input.business_income.expenses : 0);

  // Determine family size
  const familySize = input.dependents + (input.filing_status === 'mfj' ? 2 : 1);

  // Get IRS allowable amounts
  const foodAllowable = IRS_NATIONAL_STANDARDS.food_clothing_misc[
    Math.min(familySize, 5) as keyof typeof IRS_NATIONAL_STANDARDS.food_clothing_misc
  ];
  const healthAllowable = IRS_NATIONAL_STANDARDS.health_care.under_65 * familySize;

  // Calculate actual expenses
  const actualExpenses = input.monthly_expenses;
  const totalActualExpenses = Object.values(actualExpenses).reduce((a, b) => a + b, 0);

  // Expense adjustments
  const expenseAdjustments = [
    {
      category: 'Food/Clothing/Misc',
      actual: actualExpenses.food,
      irs_allowable: foodAllowable,
      adjustment: Math.max(0, actualExpenses.food - foodAllowable),
    },
    {
      category: 'Housing',
      actual: actualExpenses.housing,
      irs_allowable: actualExpenses.housing, // Local standard varies
      adjustment: 0,
    },
    {
      category: 'Transportation',
      actual: actualExpenses.transportation,
      irs_allowable: Math.min(actualExpenses.transportation, 750), // Approximate
      adjustment: Math.max(0, actualExpenses.transportation - 750),
    },
    {
      category: 'Health Care',
      actual: actualExpenses.health,
      irs_allowable: healthAllowable,
      adjustment: Math.max(0, actualExpenses.health - healthAllowable),
    },
    {
      category: 'Utilities',
      actual: actualExpenses.utilities,
      irs_allowable: actualExpenses.utilities,
      adjustment: 0,
    },
  ];

  const totalAdjustments = expenseAdjustments.reduce((sum, e) => sum + e.adjustment, 0);
  const allowableExpenses = totalActualExpenses - totalAdjustments;

  // Net Disposable Income
  const ndi = Math.max(0, totalIncome - allowableExpenses);

  // Asset equity calculations
  const assetEquity = [
    {
      asset: 'Primary Residence',
      fmv: input.assets.home_fmv,
      loan: input.assets.home_loan,
      quick_sale_value: Math.round(input.assets.home_fmv * 0.8),
      equity: Math.max(0, Math.round(input.assets.home_fmv * 0.8) - input.assets.home_loan),
    },
    {
      asset: 'Vehicles',
      fmv: input.assets.vehicle_fmv,
      loan: input.assets.vehicle_loan,
      quick_sale_value: Math.round(input.assets.vehicle_fmv * 0.8),
      equity: Math.max(0, Math.round(input.assets.vehicle_fmv * 0.8) - input.assets.vehicle_loan),
    },
    {
      asset: 'Bank Accounts',
      fmv: input.assets.bank_accounts,
      loan: 0,
      quick_sale_value: input.assets.bank_accounts,
      equity: input.assets.bank_accounts,
    },
    {
      asset: 'Retirement Accounts',
      fmv: input.assets.retirement_accounts,
      loan: 0,
      quick_sale_value: Math.round(input.assets.retirement_accounts * 0.8), // After early withdrawal penalty
      equity: Math.round(input.assets.retirement_accounts * 0.8),
    },
    {
      asset: 'Investments',
      fmv: input.assets.investments,
      loan: 0,
      quick_sale_value: Math.round(input.assets.investments * 0.9),
      equity: Math.round(input.assets.investments * 0.9),
    },
  ];

  const totalEquity = assetEquity.reduce((sum, a) => sum + a.equity, 0);

  // RCP Calculation
  const futureIncome12 = ndi * 12;
  const futureIncome24 = ndi * 24;
  const rcpLump = totalEquity + futureIncome12;
  const rcpPeriodic = totalEquity + futureIncome24;

  // Resolution eligibility
  const iaEligible = input.tax_debt_amount <= 50000 || ndi > 0;
  const cncEligible = ndi <= 0;
  const oicEligible = rcpLump < input.tax_debt_amount;

  // Risk flags
  const riskFlags: string[] = [];
  if (actualExpenses.food > foodAllowable * 1.5) {
    riskFlags.push('Food/clothing expenses significantly exceed national standards');
  }
  if (input.assets.investments > 10000 && input.tax_debt_amount > 0) {
    riskFlags.push('Investment assets available while tax debt outstanding');
  }
  if (totalActualExpenses > totalIncome * 0.95) {
    riskFlags.push('Expenses consume nearly all income - verify accuracy');
  }

  return {
    allowable_expense_adjustment: expenseAdjustments,
    net_disposable_income: ndi,
    asset_equity: assetEquity,
    total_asset_equity: totalEquity,
    rcp_calculation: {
      asset_equity: totalEquity,
      future_income_12: futureIncome12,
      future_income_24: futureIncome24,
      total_rcp_lump: rcpLump,
      total_rcp_periodic: rcpPeriodic,
    },
    resolution_eligibility: {
      installment_agreement: {
        eligible: iaEligible,
        type: input.tax_debt_amount <= 50000 ? 'Streamlined' : 'Non-Streamlined',
        reason: iaEligible ? 'Positive NDI supports payment ability' : 'No disposable income for payments',
      },
      cnc: {
        eligible: cncEligible,
        reason: cncEligible ? 'No disposable income - hardship status appropriate' : 'Positive NDI exists',
      },
      oic: {
        eligible: oicEligible,
        reason: oicEligible ? 'RCP less than total debt - DATC applies' : 'RCP exceeds debt - DATC unlikely',
      },
    },
    financial_risk_flags: riskFlags,
    timeline: 'Preparation: 1-2 weeks | Form completion: 1 week | IRS review: 30-90 days',
  };
}

// ============================================================================
// 2. TAX COURT PETITION BUILDER
// ============================================================================

export type NoticeType = 'deficiency' | 'cdp' | 'determination';

export interface TaxCourtPetitionInput {
  taxpayer_name: string;
  taxpayer_address: string;
  taxpayer_ssn_last4: string;
  notice_type: NoticeType;
  tax_years: string[];
  amount_disputed: number;
  issues_in_dispute: string[];
  date_of_notice: string;
  days_since_notice: number;
  irs_errors_alleged: string[];
  facts_supporting_position: string[];
}

export interface TaxCourtPetitionOutput {
  jurisdiction_check: {
    has_jurisdiction: boolean;
    days_remaining: number;
    urgent: boolean;
    explanation: string;
  };
  petition_draft: string;
  issue_argument_outline: { issue: string; argument: string; authority: string }[];
  litigation_strategy: string;
  timeline: { phase: string; timeframe: string; actions: string[] }[];
}

export function buildTaxCourtPetition(input: TaxCourtPetitionInput): TaxCourtPetitionOutput {
  // Jurisdiction check
  const daysRemaining = input.notice_type === 'deficiency' ? 90 - input.days_since_notice :
    input.notice_type === 'cdp' ? 30 - input.days_since_notice : 90 - input.days_since_notice;

  const hasJurisdiction = daysRemaining > 0;
  const urgent = daysRemaining <= 14;

  const jurisdictionCheck = {
    has_jurisdiction: hasJurisdiction,
    days_remaining: Math.max(0, daysRemaining),
    urgent,
    explanation: hasJurisdiction ?
      `${daysRemaining} days remaining to file petition. ${urgent ? 'URGENT: FILE IMMEDIATELY' : 'Act promptly.'}` :
      'Deadline has passed. Tax Court jurisdiction may be lost. Consult counsel immediately.',
  };

  // Generate petition draft
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const petitionDraft = `
UNITED STATES TAX COURT

${input.taxpayer_name},
                    Petitioner,

        v.                                    Docket No. ____________

COMMISSIONER OF INTERNAL REVENUE,
                    Respondent.

PETITION

Petitioner hereby petitions for a redetermination of the deficiency (or liability) set forth by the Commissioner of Internal Revenue in the Notice of ${input.notice_type === 'deficiency' ? 'Deficiency' : 'Determination'} dated ${input.date_of_notice}.

1. PETITIONER'S INFORMATION

Petitioner's name and address: ${input.taxpayer_name}
                               ${input.taxpayer_address}

Social Security Number: XXX-XX-${input.taxpayer_ssn_last4}

2. NOTICE OF ${input.notice_type.toUpperCase()}

The Notice of ${input.notice_type === 'deficiency' ? 'Deficiency' : 'Determination'} (copy attached as Exhibit A) was mailed to petitioner on ${input.date_of_notice}.

3. TAX YEARS AND AMOUNTS IN DISPUTE

Tax Year(s): ${input.tax_years.join(', ')}
Amount in Dispute: $${input.amount_disputed.toLocaleString()}

4. ASSIGNMENTS OF ERROR

Petitioner alleges that the Commissioner erred in the following respects:

${input.irs_errors_alleged.map((error, i) => `    ${i + 1}. ${error}`).join('\n\n')}

5. STATEMENT OF FACTS

${input.facts_supporting_position.map((fact, i) => `    ${i + 1}. ${fact}`).join('\n\n')}

6. PRAYER FOR RELIEF

WHEREFORE, Petitioner prays that this Court may hear this case and:

    a. Determine that there is no deficiency in income tax for the tax year(s) in dispute, or alternatively;

    b. Determine that the deficiency is less than that determined by the Commissioner;

    c. Grant such other and further relief as this Court may deem just and proper.

Respectfully submitted,

_________________________
${input.taxpayer_name}
Petitioner, Pro Se
${input.taxpayer_address}

Date: ${today}

[Attach: Exhibit A - Copy of Notice of ${input.notice_type === 'deficiency' ? 'Deficiency' : 'Determination'}]
`;

  // Issue argument outline
  const issueOutline = input.issues_in_dispute.map((issue, i) => ({
    issue,
    argument: input.irs_errors_alleged[i] || 'Argument to be developed',
    authority: getAuthorityForIssue(issue),
  }));

  // Litigation strategy
  const litigationStrategy = `
## LITIGATION STRATEGY ANALYSIS

### Settlement Likelihood
Based on the issues presented, settlement ${input.issues_in_dispute.length > 2 ? 'may be possible on some issues' : 'should be explored'}.

### Trial Preparation
${input.issues_in_dispute.some(i => i.toLowerCase().includes('income')) ?
  '- Income issues: Prepare bank statements, third-party records' : ''}
${input.issues_in_dispute.some(i => i.toLowerCase().includes('deduction')) ?
  '- Deduction issues: Organize receipts, substantiation documents' : ''}
${input.issues_in_dispute.some(i => i.toLowerCase().includes('penalty')) ?
  '- Penalty issues: Document reasonable cause factors' : ''}

### Recommended Approach
1. File petition within deadline
2. Request Appeals consideration if not already held
3. Prepare stipulated facts early
4. Consider settlement before trial
`;

  return {
    jurisdiction_check: jurisdictionCheck,
    petition_draft: petitionDraft,
    issue_argument_outline: issueOutline,
    litigation_strategy: litigationStrategy,
    timeline: [
      { phase: 'File Petition', timeframe: `Within ${daysRemaining} days`, actions: ['Complete petition', 'File with Tax Court', 'Pay $60 fee'] },
      { phase: 'Answer Period', timeframe: '60 days after service', actions: ['Await IRS answer', 'Review disputed facts'] },
      { phase: 'Discovery/Stipulation', timeframe: '6-12 months', actions: ['Exchange documents', 'Prepare stipulated facts'] },
      { phase: 'Pretrial', timeframe: '12-18 months', actions: ['Pretrial memorandum', 'Exhibit lists', 'Trial preparation'] },
      { phase: 'Trial/Settlement', timeframe: '18-24 months', actions: ['Settlement conference', 'Trial if no settlement'] },
    ],
  };
}

function getAuthorityForIssue(issue: string): string {
  const lowerIssue = issue.toLowerCase();
  if (lowerIssue.includes('income')) return 'IRC § 61 - Gross Income Defined';
  if (lowerIssue.includes('deduction')) return 'IRC § 162 - Business Expenses; § 6001 - Substantiation';
  if (lowerIssue.includes('penalty')) return 'IRC § 6651 - Failure to File/Pay; § 6662 - Accuracy';
  if (lowerIssue.includes('credit')) return 'Applicable credit provision';
  return 'Authority to be researched';
}

// ============================================================================
// 3. SETTLEMENT PROBABILITY MODEL
// ============================================================================

export interface SettlementProbabilityInput {
  case_type: 'audit' | 'appeals' | 'oic' | 'collection' | 'tax_court';
  documentation_strength: 'strong' | 'moderate' | 'weak';
  legal_position_strength: 'strong' | 'moderate' | 'weak';
  financial_condition: 'hardship' | 'limited' | 'moderate' | 'good';
  prior_compliance_history: 'excellent' | 'good' | 'mixed' | 'poor';
  irs_position_strength: 'strong' | 'moderate' | 'weak';
  taxpayer_cooperation_level: 'full' | 'partial' | 'limited';
  amount_in_dispute: number;
}

export interface SettlementProbabilityOutput {
  probability_score: number;
  irs_hazards: string[];
  taxpayer_hazards: string[];
  leverage_factors: string[];
  strategy_recommendation: 'push_settlement' | 'prepare_litigation' | 'hybrid';
  detailed_analysis: string;
  timeline: string;
}

export function calculateSettlementProbability(input: SettlementProbabilityInput): SettlementProbabilityOutput {
  let score = 50; // Start at baseline

  // Documentation strength
  if (input.documentation_strength === 'strong') score += 15;
  else if (input.documentation_strength === 'moderate') score += 5;
  else score -= 15;

  // Legal position
  if (input.legal_position_strength === 'strong') score += 15;
  else if (input.legal_position_strength === 'moderate') score += 5;
  else score -= 15;

  // IRS position (inverse effect)
  if (input.irs_position_strength === 'weak') score += 10;
  else if (input.irs_position_strength === 'strong') score -= 10;

  // Compliance history
  if (input.prior_compliance_history === 'excellent') score += 10;
  else if (input.prior_compliance_history === 'good') score += 5;
  else if (input.prior_compliance_history === 'poor') score -= 10;

  // Cooperation
  if (input.taxpayer_cooperation_level === 'full') score += 5;
  else if (input.taxpayer_cooperation_level === 'limited') score -= 10;

  // Financial condition (for collection cases)
  if (input.case_type === 'collection' || input.case_type === 'oic') {
    if (input.financial_condition === 'hardship') score += 15;
    else if (input.financial_condition === 'limited') score += 10;
  }

  // Cap score
  score = Math.max(5, Math.min(95, score));

  // IRS hazards
  const irsHazards: string[] = [];
  if (input.documentation_strength === 'strong') irsHazards.push('Strong taxpayer documentation may undermine IRS position');
  if (input.legal_position_strength === 'strong') irsHazards.push('Taxpayer has strong legal arguments');
  if (input.irs_position_strength === 'weak') irsHazards.push('IRS position has weaknesses');
  if (input.taxpayer_cooperation_level === 'full') irsHazards.push('Cooperative taxpayer may gain sympathy');

  // Taxpayer hazards
  const taxpayerHazards: string[] = [];
  if (input.documentation_strength === 'weak') taxpayerHazards.push('Weak documentation may not support position');
  if (input.irs_position_strength === 'strong') taxpayerHazards.push('IRS has strong legal position');
  if (input.prior_compliance_history === 'poor') taxpayerHazards.push('Poor compliance history hurts credibility');
  if (input.legal_position_strength === 'weak') taxpayerHazards.push('Legal arguments may not prevail');

  // Leverage factors
  const leverage: string[] = [];
  if (input.financial_condition === 'hardship') leverage.push('Demonstrated hardship supports settlement');
  if (input.amount_in_dispute > 100000) leverage.push('Large amount justifies IRS considering settlement');
  if (input.prior_compliance_history === 'excellent' || input.prior_compliance_history === 'good') {
    leverage.push('Good compliance history supports favorable treatment');
  }

  // Strategy recommendation
  let strategy: 'push_settlement' | 'prepare_litigation' | 'hybrid';
  if (score >= 70) strategy = 'push_settlement';
  else if (score <= 40) strategy = 'prepare_litigation';
  else strategy = 'hybrid';

  return {
    probability_score: score,
    irs_hazards: irsHazards,
    taxpayer_hazards: taxpayerHazards,
    leverage_factors: leverage,
    strategy_recommendation: strategy,
    detailed_analysis: `
## SETTLEMENT PROBABILITY ANALYSIS

### Overall Score: ${score}%

### IRS Hazards of Litigation
${irsHazards.length > 0 ? irsHazards.map(h => `- ${h}`).join('\n') : '- No significant IRS hazards identified'}

### Taxpayer Hazards
${taxpayerHazards.length > 0 ? taxpayerHazards.map(h => `- ${h}`).join('\n') : '- No significant taxpayer hazards identified'}

### Negotiation Leverage
${leverage.length > 0 ? leverage.map(l => `- ${l}`).join('\n') : '- Limited leverage factors'}

### Recommended Strategy: ${strategy.replace('_', ' ').toUpperCase()}
${strategy === 'push_settlement' ? 'Strong position supports aggressive settlement pursuit' :
  strategy === 'prepare_litigation' ? 'Weak position requires thorough litigation preparation' :
  'Mixed factors suggest preparing for both settlement and litigation'}
`,
    timeline: `Appeals Resolution: 3-12 months | Tax Court (if needed): 12-24 months`,
  };
}

// ============================================================================
// 4. TAX COURT TRIAL STRATEGY ENGINE
// ============================================================================

export interface TrialStrategyInput {
  issues_in_dispute: string[];
  amount_at_issue: number;
  evidence_strength: 'strong' | 'moderate' | 'weak';
  witnesses_available: string[];
  expert_witnesses: boolean;
  irs_arguments: string[];
  taxpayer_arguments: string[];
}

export interface TrialStrategyOutput {
  theory_of_case: string;
  issue_strategy: {
    issue: string;
    burden_of_proof: string;
    best_authority: string;
    strategy: string;
  }[];
  evidence_plan: string;
  witness_strategy: string;
  settlement_vs_trial: string;
  pretrial_timeline: { phase: string; deadline: string; tasks: string[] }[];
  success_probability: number;
}

export function buildTrialStrategy(input: TrialStrategyInput): TrialStrategyOutput {
  // Theory of case
  const theoryOfCase = `
## THEORY OF THE CASE

### Core Narrative
The taxpayer [properly reported income / correctly claimed deductions / is entitled to the claimed credits] based on [documentary evidence / witness testimony / legal interpretation]. The IRS's determination is [incorrect / unsupported / based on incomplete information].

### Theme
"Taxpayer maintained proper records and acted in good faith throughout."

### Key Legal Position
${input.taxpayer_arguments.slice(0, 2).join('; ')}
`;

  // Issue-by-issue strategy
  const issueStrategy = input.issues_in_dispute.map(issue => ({
    issue,
    burden_of_proof: determineBurdenOfProof(issue),
    best_authority: getAuthorityForIssue(issue),
    strategy: `Present ${input.evidence_strength} evidence; ${input.expert_witnesses ? 'Use expert testimony' : 'Rely on documentary evidence'}`,
  }));

  // Evidence plan
  const evidencePlan = `
## EVIDENCE PRESENTATION PLAN

### Documentary Evidence
- Organize exhibits chronologically
- Create exhibit list with descriptions
- Prepare stipulated exhibits

### Testimonial Evidence
${input.witnesses_available.map(w => `- ${w}: [Anticipated testimony]`).join('\n')}

${input.expert_witnesses ? `
### Expert Witnesses
- Expert report required 30 days before trial
- Prepare direct examination outline
- Anticipate cross-examination
` : ''}

### Summary Exhibits
- Consider summary charts for complex data
- Rule 1006 requires underlying documents available
`;

  // Witness strategy
  const witnessStrategy = `
## WITNESS STRATEGY

### Direct Examination Themes
- Establish credibility and expertise
- Present facts supporting taxpayer position
- Introduce documentary evidence through witnesses

### Cross-Examination Preparation
- Anticipate IRS cross-examination points
- Prepare witnesses for hostile questions
- Focus on consistent narrative

### IRS Witnesses
- Prepare cross-examination for IRS witnesses
- Challenge methodology and assumptions
- Establish limitations of IRS analysis
`;

  // Settlement vs trial analysis
  const settlementVsTrial = `
## SETTLEMENT VS. TRIAL ANALYSIS

### Factors Favoring Settlement
${input.evidence_strength !== 'strong' ? '- Evidence strength is not overwhelming\n' : ''}
- Avoid litigation costs and time
- Certainty of outcome

### Factors Favoring Trial
${input.evidence_strength === 'strong' ? '- Strong evidence supports trial\n' : ''}
${input.expert_witnesses ? '- Expert testimony available\n' : ''}
- Establish precedent
- IRS position is weak

### Recommendation
${input.evidence_strength === 'strong' ? 'Consider trial if IRS unreasonable in settlement' : 'Pursue settlement unless IRS demands unreasonable concession'}
`;

  return {
    theory_of_case: theoryOfCase,
    issue_strategy: issueStrategy,
    evidence_plan: evidencePlan,
    witness_strategy: witnessStrategy,
    settlement_vs_trial: settlementVsTrial,
    pretrial_timeline: [
      { phase: 'Stipulations', deadline: '60 days before trial', tasks: ['Exchange proposed stipulations', 'Negotiate facts/exhibits', 'File stipulation'] },
      { phase: 'Discovery', deadline: '45 days before trial', tasks: ['Complete document requests', 'Conduct depositions if needed'] },
      { phase: 'Pretrial Memo', deadline: '14-21 days before trial', tasks: ['File pretrial memorandum', 'Trial brief', 'Exhibit list'] },
      { phase: 'Trial Prep', deadline: '7 days before trial', tasks: ['Finalize witness prep', 'Organize exhibits', 'Practice direct/cross'] },
    ],
    success_probability: input.evidence_strength === 'strong' ? 70 :
      input.evidence_strength === 'moderate' ? 50 : 30,
  };
}

function determineBurdenOfProof(issue: string): string {
  const lowerIssue = issue.toLowerCase();
  if (lowerIssue.includes('fraud')) return 'IRS bears burden by clear and convincing evidence';
  if (lowerIssue.includes('deduction')) return 'Taxpayer bears burden; may shift to IRS under § 7491';
  if (lowerIssue.includes('income')) return 'Taxpayer bears burden to show items are non-taxable';
  return 'Generally taxpayer bears burden; see § 7491 for potential shift';
}

// ============================================================================
// 5. IRS PROCEDURE VIOLATION DETECTOR
// ============================================================================

export interface ProcedureViolationInput {
  notice_history: { type: string; date: string; properly_issued: boolean | 'unknown' }[];
  dates_of_assessment: string[];
  levy_actions: { date: string; type: string }[];
  lien_filing_dates: string[];
  appeals_requests: { date: string; granted: boolean | 'pending' }[];
  statute_expiration_date: string;
  audit_procedures_followed: 'yes' | 'no' | 'unknown';
  cdp_notice_sent: boolean;
  cdp_hearing_held: boolean;
}

export interface ProcedureViolationOutput {
  potential_violations: {
    violation: string;
    legal_basis: string;
    severity: 'high' | 'medium' | 'low';
  }[];
  legal_consequences: string[];
  defense_strategy: string;
  timeline_of_errors: string;
  impact_score: number;
}

export function detectProcedureViolations(input: ProcedureViolationInput): ProcedureViolationOutput {
  const violations: ProcedureViolationOutput['potential_violations'] = [];
  const consequences: string[] = [];
  let impactScore = 0;

  // Check CDP notice before levy
  if (input.levy_actions.length > 0 && !input.cdp_notice_sent) {
    violations.push({
      violation: 'Levy without CDP notice',
      legal_basis: 'IRC § 6330 - CDP notice required before levy',
      severity: 'high',
    });
    consequences.push('Levy may be invalid; relief available');
    impactScore += 25;
  }

  // Check CDP hearing if requested
  if (input.appeals_requests.some(r => !r.granted && r.granted !== 'pending')) {
    violations.push({
      violation: 'CDP hearing denied without proper basis',
      legal_basis: 'IRC § 6330(c) - Right to hearing',
      severity: 'medium',
    });
    consequences.push('May appeal to Tax Court for review');
    impactScore += 15;
  }

  // Check statute of limitations
  const csed = new Date(input.statute_expiration_date);
  const today = new Date();
  if (csed < today) {
    violations.push({
      violation: 'Collection after statute expiration',
      legal_basis: 'IRC § 6502 - 10-year collection period',
      severity: 'high',
    });
    consequences.push('Debt no longer enforceable; collection must stop');
    impactScore += 30;
  }

  // Check notice requirements
  const improperNotices = input.notice_history.filter(n => n.properly_issued === false);
  for (const notice of improperNotices) {
    violations.push({
      violation: `Improper ${notice.type} notice`,
      legal_basis: 'IRC § 6212 - Deficiency notice requirements',
      severity: 'medium',
    });
    impactScore += 10;
  }

  // Check audit procedures
  if (input.audit_procedures_followed === 'no') {
    violations.push({
      violation: 'Audit procedures not followed',
      legal_basis: 'IRM 4.10 - Examination procedures',
      severity: 'medium',
    });
    consequences.push('May argue procedural error in Appeals');
    impactScore += 10;
  }

  return {
    potential_violations: violations,
    legal_consequences: consequences,
    defense_strategy: violations.length > 0 ?
      `Raise procedural violations ${violations.some(v => v.severity === 'high') ? 'immediately through CDP/Appeals' : 'as part of overall defense strategy'}. Document all violations thoroughly.` :
      'No significant procedural violations detected. Focus on substantive defense.',
    timeline_of_errors: `
## TIMELINE OF PROCEDURAL ERRORS

${violations.map((v, i) => `${i + 1}. ${v.violation} (${v.severity.toUpperCase()})\n   Basis: ${v.legal_basis}`).join('\n\n')}
`,
    impact_score: impactScore,
  };
}

// ============================================================================
// 6. CASE MEMORY & STRATEGY CONTINUITY SYSTEM
// ============================================================================

export interface CaseMemoryInput {
  case_id: string;
  taxpayer_name: string;
  case_stage: 'audit' | 'appeals' | 'collection' | 'tax_court' | 'resolved';
  previous_actions: { date: string; action: string; result: string }[];
  deadlines: { date: string; item: string; completed: boolean }[];
  irs_positions: string[];
  taxpayer_positions: string[];
  evidence_inventory: string[];
  documents_submitted: string[];
  documents_pending: string[];
}

export interface CaseMemoryOutput {
  case_state_summary: string;
  strategy_history: string;
  next_actions: { deadline: string; action: string; priority: 'critical' | 'high' | 'medium' }[];
  continuity_rules: string[];
  risk_changes: string;
  document_tracker: { category: string; submitted: string[]; pending: string[] };
  master_timeline: string;
}

export function manageCaseMemory(input: CaseMemoryInput): CaseMemoryOutput {
  // Case state summary
  const caseSummary = `
## CASE STATE SUMMARY

**Case ID:** ${input.case_id}
**Taxpayer:** ${input.taxpayer_name}
**Current Stage:** ${input.case_stage.toUpperCase()}
**Actions Taken:** ${input.previous_actions.length}
**Pending Deadlines:** ${input.deadlines.filter(d => !d.completed).length}
**Documents Submitted:** ${input.documents_submitted.length}
**Documents Pending:** ${input.documents_pending.length}
`;

  // Strategy history
  const strategyHistory = `
## PRIOR STRATEGY HISTORY

${input.previous_actions.map(a => `- ${a.date}: ${a.action} → ${a.result}`).join('\n')}

### Positions Taken
**Taxpayer:**
${input.taxpayer_positions.map(p => `- ${p}`).join('\n')}

**IRS:**
${input.irs_positions.map(p => `- ${p}`).join('\n')}
`;

  // Next actions
  const pendingDeadlines = input.deadlines
    .filter(d => !d.completed)
    .map(d => ({
      deadline: d.date,
      action: d.item,
      priority: (new Date(d.date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 ? 'critical' :
        new Date(d.date).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
    }));

  // Continuity rules
  const continuityRules = [
    'Maintain consistent position on income/deduction issues',
    'Do not contradict prior representations to IRS',
    'Reference prior correspondence in new submissions',
    'Build on evidence already submitted',
    'Avoid raising new issues that undermine prior arguments',
  ];

  return {
    case_state_summary: caseSummary,
    strategy_history: strategyHistory,
    next_actions: pendingDeadlines,
    continuity_rules: continuityRules,
    risk_changes: `Risk assessment: ${input.case_stage === 'tax_court' ? 'Elevated - in litigation' :
      input.case_stage === 'collection' ? 'High - enforcement possible' :
      input.case_stage === 'appeals' ? 'Moderate - negotiation phase' : 'Standard'}`,
    document_tracker: {
      category: 'Case Documents',
      submitted: input.documents_submitted,
      pending: input.documents_pending,
    },
    master_timeline: `
## MASTER CASE TIMELINE

${input.previous_actions.map(a => `[${a.date}] ${a.action}`).join('\n')}

### Upcoming Deadlines
${input.deadlines.filter(d => !d.completed).map(d => `[${d.date}] ${d.item}`).join('\n')}
`,
  };
}

// ============================================================================
// 7. DOJ TAX DIVISION LITIGATION MODULE
// ============================================================================

export type DOJCaseType = 'summons_enforcement' | 'reduce_to_judgment' | 'foreclosure' | 'injunction' | 'erroneous_refund' | 'other';

export interface DOJLitigationInput {
  case_type: DOJCaseType;
  court: string;
  caption_parties: string;
  procedural_posture: 'pre_suit' | 'complaint_served' | 'motion_stage' | 'discovery' | 'pretrial' | 'trial';
  key_dates: { service_date?: string; hearing_dates: string[]; deadlines: string[] };
  tax_years: string[];
  amounts: { assessments: number; penalties: number; interest: number };
  evidence_status: 'strong' | 'moderate' | 'weak';
  compliance_status: 'filed' | 'sfr' | 'unfiled';
  assets_profile: string[];
  third_party_issues: 'nominee' | 'alter_ego' | 'transferee' | 'none';
  government_claims_summary: string;
  defense_facts_summary: string;
}

export interface DOJLitigationOutput {
  case_intake_memo: string;
  defense_strategy_map: string;
  pleadings_pack: string;
  discovery_plan: string;
  motion_playbook: string;
  settlement_options: string;
  timeline: { phase: string; timeframe: string; tasks: string[] }[];
}

export function buildDOJLitigationStrategy(input: DOJLitigationInput): DOJLitigationOutput {
  const totalAmount = input.amounts.assessments + input.amounts.penalties + input.amounts.interest;

  return {
    case_intake_memo: `
## DOJ TAX DIVISION CASE INTAKE MEMO

**Case Type:** ${input.case_type.replace('_', ' ').toUpperCase()}
**Court:** ${input.court}
**Caption:** ${input.caption_parties}
**Procedural Posture:** ${input.procedural_posture.replace('_', ' ').toUpperCase()}

### Government Claims
${input.government_claims_summary}

### Amounts at Issue
- Assessments: $${input.amounts.assessments.toLocaleString()}
- Penalties: $${input.amounts.penalties.toLocaleString()}
- Interest: $${input.amounts.interest.toLocaleString()}
- **Total:** $${totalAmount.toLocaleString()}

### Tax Years: ${input.tax_years.join(', ')}

### Governing Statutes
${input.case_type === 'summons_enforcement' ? '- 26 U.S.C. § 7602 - Summons authority\n- 26 U.S.C. § 7604 - Enforcement' : ''}
${input.case_type === 'reduce_to_judgment' ? '- 26 U.S.C. § 7401 - Authorization for civil actions\n- 26 U.S.C. § 7402 - Jurisdiction' : ''}
${input.case_type === 'foreclosure' ? '- 26 U.S.C. § 7403 - Lien enforcement/foreclosure' : ''}

### Immediate Risks
${input.procedural_posture === 'complaint_served' ? '- Answer deadline approaching\n' : ''}
${input.case_type === 'foreclosure' ? '- Risk of property sale\n' : ''}
${input.case_type === 'summons_enforcement' ? '- Contempt risk if non-compliance\n' : ''}

### Key Deadlines
${input.key_dates.deadlines.map(d => `- ${d}`).join('\n')}
`,

    defense_strategy_map: `
## LITIGATION DEFENSE STRATEGY MAP

### Jurisdiction/Venue
- Verify proper jurisdiction under 28 U.S.C. § 1340/1345
- Check venue requirements
- Confirm proper service

### Affirmative Defenses Checklist
${input.case_type === 'reduce_to_judgment' ? `
- [ ] Statute of limitations (§ 6502)
- [ ] Assessment invalid
- [ ] Notice defects
- [ ] Collection Due Process violations
` : ''}
${input.case_type === 'foreclosure' ? `
- [ ] Lien not properly filed
- [ ] Property exempt from levy
- [ ] Third-party rights superior
- [ ] Surplus recovery rights
` : ''}
${input.case_type === 'summons_enforcement' ? `
- [ ] Summons defective
- [ ] Information not relevant
- [ ] Privilege applies
- [ ] Already provided to IRS
` : ''}

### Evidentiary Themes
- Evidence status: ${input.evidence_status.toUpperCase()}
- Defense facts: ${input.defense_facts_summary}

### Settlement Posture
${input.evidence_status === 'strong' ? 'Strong defense - push for favorable settlement' :
  input.evidence_status === 'weak' ? 'Consider settlement to limit exposure' :
  'Evaluate settlement vs. litigation costs'}
`,

    pleadings_pack: input.procedural_posture === 'complaint_served' ? `
## ANSWER TEMPLATE

UNITED STATES DISTRICT COURT
${input.court}

${input.caption_parties}

ANSWER TO COMPLAINT

Defendant answers the Complaint as follows:

[For each paragraph of Complaint:]
1. [Admit / Deny / Lack sufficient knowledge]

AFFIRMATIVE DEFENSES

First Defense: [Statute of Limitations if applicable]
Second Defense: [Procedural defects if applicable]
Third Defense: [Other applicable defenses]

WHEREFORE, Defendant requests that the Complaint be dismissed with prejudice.

[Signature block]
` : `## RESPONSIVE PLEADING NOTE

Current posture: ${input.procedural_posture}
${input.procedural_posture === 'pre_suit' ? 'No complaint filed yet - prepare for potential suit' :
  'Review applicable motion deadlines and prepare response strategy'}
`,

    discovery_plan: `
## DISCOVERY PLAN

### Rule 26 Initial Disclosures
- Identify all witnesses with knowledge
- List relevant documents
- Compute damages/claims
- Identify insurance

### Targeted Requests
**Requests for Production:**
- All IRS examination files
- Administrative file
- Collection activity records
- Correspondence

**Interrogatories:**
- Basis for assessment
- Identity of examining agents
- Calculation methodology

### Deposition Targets
- Revenue Officer
- Examining Agent
- Technical Advisor (if applicable)

### ESI Preservation
- Issue litigation hold
- Preserve all electronic records
- Document preservation efforts
`,

    motion_playbook: `
## MOTION PRACTICE PLAYBOOK

### Expected Government Motions
- Motion for Summary Judgment
- Motion to Compel (if discovery dispute)

### Defensive Motions to Consider
${input.case_type === 'summons_enforcement' ?
  '- Motion to Quash Summons\n- Motion for Protective Order' : ''}
- Motion to Dismiss (if jurisdictional issues)
- Motion for Summary Judgment (if facts support)

### Summary Judgment Structure
1. Statement of undisputed facts
2. Legal standard
3. Argument applying law to facts
4. Conclusion
`,

    settlement_options: `
## SETTLEMENT / RESOLUTION OPTIONS

### Collection Alternatives (if appropriate)
- Installment Agreement
- Offer in Compromise
- Currently Not Collectible

### Lien Issues
- Discharge of specific property
- Subordination for refinancing
- Withdrawal after resolution

### Consent Decree Strategy
- Narrow issues to reduce exposure
- Payment terms
- Interest abatement negotiation
`,

    timeline: [
      { phase: 'Triage', timeframe: '0-14 days', tasks: ['Retain counsel', 'Preserve evidence', 'Initial review'] },
      { phase: 'Response', timeframe: '14-60 days', tasks: ['File Answer/Response', 'Raise defenses', 'Initial disclosures'] },
      { phase: 'Discovery', timeframe: '60-180 days', tasks: ['Written discovery', 'Depositions', 'Expert reports'] },
      { phase: 'Pretrial', timeframe: '180-270 days', tasks: ['Dispositive motions', 'Pretrial order', 'Exhibit lists'] },
      { phase: 'Trial', timeframe: '270-365 days', tasks: ['Trial preparation', 'Settlement conference', 'Trial'] },
    ],
  };
}

// ============================================================================
// 8. FEDERAL DISTRICT COURT REFUND SUIT MODULE
// ============================================================================

export interface RefundSuitInput {
  tax_type: 'income' | 'employment' | 'excise' | 'penalty' | 'other';
  tax_years_or_periods: string[];
  amount_paid: number;
  date_paid: string;
  refund_claim_filed: boolean;
  refund_claim_date?: string;
  refund_claim_basis: string;
  irs_disallowance_received: boolean;
  disallowance_date?: string;
  desired_forum: 'district_court' | 'court_of_federal_claims' | 'unsure';
  district?: string;
  factual_record_strength: 'strong' | 'moderate' | 'weak';
  documents_available: string[];
  issues: string[];
}

export interface RefundSuitOutput {
  admin_claim_builder: string;
  jurisdiction_checklist: string;
  complaint_template: string;
  evidence_plan: string;
  defense_anticipation: string;
  motions_playbook: string;
  settlement_options: string;
  timeline: { phase: string; timeframe: string; tasks: string[] }[];
}

export function buildRefundSuit(input: RefundSuitInput): RefundSuitOutput {
  // Calculate timeliness
  const claimDeadline = new Date(input.date_paid);
  claimDeadline.setFullYear(claimDeadline.getFullYear() + 3);
  const claimTimely = new Date() < claimDeadline;

  // Six-month rule for suit
  let suitReady = false;
  if (input.irs_disallowance_received && input.disallowance_date) {
    const disallowance = new Date(input.disallowance_date);
    const suitDeadline = new Date(disallowance);
    suitDeadline.setFullYear(suitDeadline.getFullYear() + 2);
    suitReady = new Date() < suitDeadline;
  } else if (input.refund_claim_filed && input.refund_claim_date) {
    const claimDate = new Date(input.refund_claim_date);
    const sixMonths = new Date(claimDate);
    sixMonths.setMonth(sixMonths.getMonth() + 6);
    suitReady = new Date() > sixMonths;
  }

  return {
    admin_claim_builder: `
## ADMINISTRATIVE REFUND CLAIM BUILDER

### Checklist for Proper Claim
- [ ] Identify tax type and periods
- [ ] Calculate exact refund amount
- [ ] State grounds for refund
- [ ] Include supporting documentation
- [ ] Sign under penalties of perjury
- [ ] File within 3 years of filing or 2 years of payment

### Claim Structure
**Tax Type:** ${input.tax_type}
**Periods:** ${input.tax_years_or_periods.join(', ')}
**Amount Claimed:** $${input.amount_paid.toLocaleString()}

**Grounds for Refund:**
${input.refund_claim_basis}

**Supporting Documentation:**
${input.documents_available.map(d => `- ${d}`).join('\n')}

### Submission
- Form 1040-X (income tax) or appropriate form
- Send to IRS Service Center
- Use certified mail, return receipt requested
- Keep complete copy of claim
`,

    jurisdiction_checklist: `
## JURISDICTION & TIMELINESS CHECK

### § 6511 Timeliness
- Payment Date: ${input.date_paid}
- 3-Year Deadline: ${claimDeadline.toLocaleDateString()}
- Claim Status: ${claimTimely ? 'TIMELY' : 'POTENTIALLY UNTIMELY'}

### § 7422 Exhaustion
- Refund Claim Filed: ${input.refund_claim_filed ? 'YES' : 'NO - REQUIRED'}
${!input.refund_claim_filed ? '⚠️ MUST FILE ADMINISTRATIVE CLAIM BEFORE SUIT' : ''}

### § 6532(a) Suit Limitations
${input.irs_disallowance_received ?
  `- Disallowance Date: ${input.disallowance_date}\n- 2-Year Deadline to File Suit` :
  input.refund_claim_filed ?
  `- Claim Date: ${input.refund_claim_date}\n- May sue after 6 months if no IRS action` :
  '- File claim first; then wait 6 months or until disallowance'}

### Full Payment Rule
${input.tax_type === 'income' ?
  'Flora Rule: Full payment required before refund suit for income tax' :
  'Divisible taxes may allow partial payment strategy'}

### Forum Choice
${input.desired_forum === 'district_court' ? 'District Court - jury trial available' :
  input.desired_forum === 'court_of_federal_claims' ? 'Court of Federal Claims - no jury, specialized tax court' :
  'Consider: District Court offers jury; CFC offers specialized judges'}
`,

    complaint_template: `
UNITED STATES DISTRICT COURT
${input.district || '[DISTRICT]'}

[TAXPAYER NAME],
                    Plaintiff,

        v.                                    Civil Action No. ____________

UNITED STATES OF AMERICA,
                    Defendant.

COMPLAINT FOR REFUND OF FEDERAL TAXES

I. JURISDICTION AND VENUE

1. This Court has jurisdiction pursuant to 28 U.S.C. § 1346(a)(1).

2. Venue is proper in this district pursuant to 28 U.S.C. § 1402(a).

II. PARTIES

3. Plaintiff [NAME] is a [citizen/resident] of [STATE].

4. Defendant is the United States of America.

III. ADMINISTRATIVE CLAIM

5. Plaintiff filed an administrative claim for refund on [DATE].

6. More than six months have elapsed since the filing of the claim, and the IRS has [not acted / disallowed the claim on DATE].

IV. STATEMENT OF FACTS

[Insert relevant facts]

V. BASIS FOR REFUND

${input.issues.map((issue, i) => `COUNT ${i + 1}: ${issue.toUpperCase()}\n\n[Allegations supporting claim]`).join('\n\n')}

VI. PRAYER FOR RELIEF

WHEREFORE, Plaintiff prays for judgment against Defendant:

a. For a refund of $${input.amount_paid.toLocaleString()} plus interest;
b. For costs of this action;
c. For such other relief as the Court deems just.

JURY DEMAND

Plaintiff demands a trial by jury on all issues so triable.

[Signature block]
`,

    evidence_plan: `
## EVIDENCE PLAN

### Documents Proving Entitlement
${input.documents_available.map(d => `- ${d}`).join('\n')}

### Damages Computation
- Tax paid: $${input.amount_paid.toLocaleString()}
- Interest from: ${input.date_paid}

### Expert Needs
${input.factual_record_strength === 'weak' ? '- Consider expert for complex issues' : '- May not require expert'}

### Exhibit Preparation
- Organize chronologically
- Create exhibit list
- Prepare stipulated exhibits
`,

    defense_anticipation: `
## GOVERNMENT DEFENSE ANTICIPATION

### Common DOJ Defenses
- Failure to exhaust administrative remedies
- Untimely claim
- Full payment not made (income tax)
- Claim not properly verified
- Substantive defenses on merits

### Preemptive Strategies
- Document administrative claim fully in complaint
- Attach proof of payment
- Address timeliness explicitly
- Prepare strong factual record
`,

    motions_playbook: `
## MOTION PRACTICE

### Expected Government Motions
- Motion to Dismiss (12(b)(1) jurisdiction, 12(b)(6) failure to state claim)
- Motion for Summary Judgment

### Offensive Motions
- Motion for Summary Judgment if facts clear
- Motion to Compel discovery of IRS files

### Stipulated Facts Strategy
- Stipulate undisputed facts early
- Focus litigation on contested issues
`,

    settlement_options: `
## SETTLEMENT PATHWAYS

### DOJ/IRS Settlement
- DOJ has settlement authority
- Consider hazards of litigation
- Interest negotiation

### Negotiation Points
- Full refund
- Partial refund
- Interest calculation
- Attorney's fees (if applicable under § 7430)
`,

    timeline: [
      { phase: 'Admin Claim', timeframe: 'If not filed', tasks: ['Prepare and file refund claim', 'Document submission'] },
      { phase: 'Wait Period', timeframe: '6 months', tasks: ['Monitor for IRS response', 'Prepare for litigation'] },
      { phase: 'File Suit', timeframe: 'After 6 months or disallowance', tasks: ['Draft complaint', 'File in district court'] },
      { phase: 'Discovery', timeframe: '6-12 months', tasks: ['Initial disclosures', 'Written discovery', 'Depositions'] },
      { phase: 'Dispositive Motions', timeframe: '12-18 months', tasks: ['Summary judgment briefing'] },
      { phase: 'Trial', timeframe: '18-24 months', tasks: ['Pretrial preparation', 'Trial or settlement'] },
    ],
  };
}

// ============================================================================
// WORKFLOW COMMANDS EXPORT
// ============================================================================

export const LITIGATION_MODULE_WORKFLOWS = {
  form_433_analysis: {
    command: '/433-analysis',
    description: 'Analyze Form 433 financial statements',
    workflow_type: 'financial_analysis',
    entry_function: 'analyzeForm433',
    estimated_phases: 4,
  },
  tax_court_petition: {
    command: '/tax-court-petition',
    description: 'Build Tax Court petition',
    workflow_type: 'tax_court_petition',
    entry_function: 'buildTaxCourtPetition',
    estimated_phases: 5,
  },
  settlement_probability: {
    command: '/settlement-probability',
    description: 'Calculate settlement probability',
    workflow_type: 'settlement_model',
    entry_function: 'calculateSettlementProbability',
    estimated_phases: 3,
  },
  trial_strategy: {
    command: '/trial-strategy',
    description: 'Build Tax Court trial strategy',
    workflow_type: 'trial_strategy',
    entry_function: 'buildTrialStrategy',
    estimated_phases: 7,
  },
  procedure_violations: {
    command: '/procedure-violations',
    description: 'Detect IRS procedure violations',
    workflow_type: 'procedure_detector',
    entry_function: 'detectProcedureViolations',
    estimated_phases: 4,
  },
  case_memory: {
    command: '/case-memory',
    description: 'Manage case continuity and memory',
    workflow_type: 'case_memory',
    entry_function: 'manageCaseMemory',
    estimated_phases: 2,
  },
  doj_litigation: {
    command: '/doj-litigation',
    description: 'DOJ Tax Division litigation strategy',
    workflow_type: 'doj_litigation',
    entry_function: 'buildDOJLitigationStrategy',
    estimated_phases: 8,
  },
  refund_suit: {
    command: '/refund-suit',
    description: 'Federal refund suit builder',
    workflow_type: 'refund_suit',
    entry_function: 'buildRefundSuit',
    estimated_phases: 8,
  },
};
