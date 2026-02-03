/**
 * TAX CASE ROUTER - MASTER JURISDICTION & STRATEGY SELECTOR
 *
 * This module serves as the MASTER ROUTING ENGINE for all tax defense modules.
 * It analyzes a taxpayer's situation and determines the correct legal pathway:
 *
 * - IRS Administrative Resolution
 * - IRS Appeals
 * - U.S. Tax Court
 * - DOJ Tax Division Civil Litigation
 * - Federal District Court Refund Suit
 *
 * TRIGGER COMMAND: /case-router
 *
 * IMPORTANT: This system follows federal tax procedure rules and
 * NEVER recommends illegal evasion or non-compliance.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NoticeReceived =
  | 'CP2000' | 'CP59' | 'CP515' | 'CP516' | 'CP518'
  | 'LT11' | 'Letter1058' | 'CP90' | 'CP504'
  | 'notice_of_deficiency' | 'cdp_notice'
  | 'none';

export type PrimaryRoute =
  | 'doj_litigation'
  | 'refund_suit'
  | 'tax_court_deficiency'
  | 'tax_court_cdp'
  | 'irs_appeals_cdp'
  | 'irs_appeals_audit'
  | 'collection_defense'
  | 'audit_defense'
  | 'sfr_reconsideration'
  | 'penalty_abatement'
  | 'administrative_resolution'
  | 'voluntary_compliance';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CaseRouterInput {
  // Notice Status
  notices_received: NoticeReceived[];
  days_since_notice: number;
  notice_of_deficiency_received: boolean;
  cdp_notice_received: boolean;

  // Assessment & Payment Status
  tax_assessed: boolean;
  tax_paid: 'none' | 'partial' | 'full';
  tax_years: string[];
  amount_owed: number;

  // Refund Claim Status
  refund_claim_filed: boolean;
  refund_claim_disallowed: boolean;
  six_months_since_refund_claim: boolean;

  // Collection Status
  irs_collection_started: boolean;
  collection_type: ('levy' | 'lien' | 'garnishment' | 'none')[];

  // Audit Status
  audit_status: 'none' | 'open' | 'closed' | 'proposed_adjustment';
  sfr_assessment: boolean;

  // Appeals Status
  appeals_rights_remaining: boolean;
  prior_appeals_hearing: boolean;

  // DOJ/Criminal Status
  doj_complaint_served: boolean;
  criminal_referral_known: boolean;
  criminal_investigation_suspected: boolean;
}

export interface CaseRouterOutput {
  case_classification: string;
  primary_route: PrimaryRoute;
  route_name: string;
  legal_basis: string;
  deadlines: {
    item: string;
    date_or_timeframe: string;
    critical: boolean;
  }[];
  secondary_options: {
    route: PrimaryRoute;
    name: string;
    reason: string;
  }[];
  risk_score: RiskLevel;
  risk_factors: string[];
  immediate_actions: {
    action: string;
    priority: 'critical' | 'high' | 'medium';
    deadline: string;
  }[];
  timeline_map: string;
  module_triggers: string[];
  criminal_flag: boolean;
  criminal_advisory: string;
}

// ============================================================================
// ROUTING LOGIC
// ============================================================================

export function routeTaxCase(input: CaseRouterInput): CaseRouterOutput {
  const deadlines: CaseRouterOutput['deadlines'] = [];
  const secondaryOptions: CaseRouterOutput['secondary_options'] = [];
  const riskFactors: string[] = [];
  const immediateActions: CaseRouterOutput['immediate_actions'] = [];
  const moduleTriggers: string[] = [];

  let primaryRoute: PrimaryRoute;
  let routeName: string;
  let legalBasis: string;
  let caseClassification: string;
  let riskScore: RiskLevel = 'medium';

  // ========================================
  // ROUTING PRIORITY 1: DOJ LITIGATION
  // ========================================
  if (input.doj_complaint_served) {
    primaryRoute = 'doj_litigation';
    routeName = 'DOJ Tax Division Litigation';
    legalBasis = '26 U.S.C. §§ 7401, 7402, 7403 - DOJ civil tax actions';
    caseClassification = 'FEDERAL CIVIL LITIGATION (DOJ)';
    riskScore = 'critical';

    riskFactors.push('DOJ complaint served - active federal litigation');
    moduleTriggers.push('/doj-litigation');

    immediateActions.push({
      action: 'Retain federal litigation counsel IMMEDIATELY',
      priority: 'critical',
      deadline: 'Within 48 hours',
    });
    immediateActions.push({
      action: 'Review complaint and calculate answer deadline (typically 60 days)',
      priority: 'critical',
      deadline: 'Day 1',
    });
    immediateActions.push({
      action: 'Preserve all documents - issue litigation hold',
      priority: 'critical',
      deadline: 'Day 1',
    });

    deadlines.push({
      item: 'Answer to Complaint',
      date_or_timeframe: '60 days from service (verify local rules)',
      critical: true,
    });
  }

  // ========================================
  // ROUTING PRIORITY 2: REFUND SUIT
  // ========================================
  else if (input.tax_paid === 'full' && input.refund_claim_filed &&
           (input.refund_claim_disallowed || input.six_months_since_refund_claim)) {
    primaryRoute = 'refund_suit';
    routeName = 'Federal District Court Refund Suit';
    legalBasis = '26 U.S.C. § 7422 (exhaustion), 28 U.S.C. § 1346(a)(1) (jurisdiction)';
    caseClassification = 'FEDERAL REFUND LITIGATION';
    riskScore = 'medium';

    moduleTriggers.push('/refund-suit');

    if (input.refund_claim_disallowed) {
      riskFactors.push('IRS disallowed refund claim - 2-year suit deadline applies');
      deadlines.push({
        item: 'File refund suit',
        date_or_timeframe: '2 years from date of disallowance',
        critical: true,
      });
    } else {
      riskFactors.push('6 months elapsed since claim - may file suit');
      deadlines.push({
        item: 'File refund suit',
        date_or_timeframe: 'Anytime before 2 years from filing claim',
        critical: false,
      });
    }

    immediateActions.push({
      action: 'Prepare and file complaint in U.S. District Court',
      priority: 'high',
      deadline: 'Before statute expires',
    });
    immediateActions.push({
      action: 'Gather all documentation supporting refund claim',
      priority: 'high',
      deadline: '2 weeks',
    });

    secondaryOptions.push({
      route: 'tax_court_cdp',
      name: 'Court of Federal Claims',
      reason: 'Alternative forum for refund suits',
    });
  }

  // ========================================
  // ROUTING PRIORITY 3: TAX COURT - DEFICIENCY
  // ========================================
  else if (input.notice_of_deficiency_received && input.days_since_notice < 90) {
    primaryRoute = 'tax_court_deficiency';
    routeName = 'U.S. Tax Court (Deficiency Petition)';
    legalBasis = 'IRC § 6213 - Tax Court jurisdiction upon Notice of Deficiency';
    caseClassification = 'TAX COURT DEFICIENCY CASE';
    riskScore = input.days_since_notice < 30 ? 'high' : input.days_since_notice < 60 ? 'medium' : 'critical';

    const daysRemaining = 90 - input.days_since_notice;
    riskFactors.push(`${daysRemaining} days remaining to file Tax Court petition`);
    moduleTriggers.push('/tax-court-petition');

    deadlines.push({
      item: 'FILE TAX COURT PETITION',
      date_or_timeframe: `${daysRemaining} days remaining (JURISDICTIONAL)`,
      critical: true,
    });

    immediateActions.push({
      action: 'FILE TAX COURT PETITION - This is a jurisdictional deadline',
      priority: 'critical',
      deadline: `Within ${daysRemaining} days`,
    });
    immediateActions.push({
      action: 'Pay $60 filing fee',
      priority: 'critical',
      deadline: 'With petition',
    });
    immediateActions.push({
      action: 'Prepare original return if SFR case',
      priority: 'high',
      deadline: 'Concurrent with petition',
    });

    secondaryOptions.push({
      route: 'irs_appeals_audit',
      name: 'IRS Appeals (if time permits)',
      reason: 'Can request Appeals before petition if time allows',
    });
  }

  // ========================================
  // ROUTING PRIORITY 4: CDP APPEALS
  // ========================================
  else if (input.cdp_notice_received && input.days_since_notice < 30) {
    primaryRoute = 'irs_appeals_cdp';
    routeName = 'IRS Appeals - Collection Due Process';
    legalBasis = 'IRC § 6330 - Right to CDP hearing before levy';
    caseClassification = 'COLLECTION DUE PROCESS CASE';
    riskScore = input.days_since_notice < 14 ? 'high' : 'critical';

    const daysRemaining = 30 - input.days_since_notice;
    riskFactors.push(`${daysRemaining} days remaining for CDP hearing request`);
    moduleTriggers.push('/collection-defense');

    deadlines.push({
      item: 'REQUEST CDP HEARING',
      date_or_timeframe: `${daysRemaining} days remaining (STATUTORY)`,
      critical: true,
    });

    immediateActions.push({
      action: 'FILE CDP HEARING REQUEST (Form 12153) IMMEDIATELY',
      priority: 'critical',
      deadline: `Within ${daysRemaining} days`,
    });
    immediateActions.push({
      action: 'Identify collection alternative to propose',
      priority: 'high',
      deadline: 'Before hearing',
    });
    immediateActions.push({
      action: 'File any missing returns before hearing',
      priority: 'high',
      deadline: 'Before hearing',
    });

    secondaryOptions.push({
      route: 'tax_court_cdp',
      name: 'Tax Court CDP Appeal',
      reason: 'Can appeal CDP determination to Tax Court',
    });
  }

  // ========================================
  // ROUTING PRIORITY 5: COLLECTION + APPEALS
  // ========================================
  else if (input.tax_assessed && input.irs_collection_started && input.appeals_rights_remaining) {
    primaryRoute = 'collection_defense';
    routeName = 'Collection Defense with Appeals';
    legalBasis = 'IRM 5.11-5.16 (Collection), IRC § 6320/6330 (CDP if available)';
    caseClassification = 'COLLECTION DEFENSE CASE';
    riskScore = 'high';

    riskFactors.push('Active collection - appeals rights exist');
    if (input.collection_type.includes('levy')) {
      riskFactors.push('Levy in effect - seek release');
    }
    if (input.collection_type.includes('lien')) {
      riskFactors.push('Tax lien filed - affects credit');
    }

    moduleTriggers.push('/collection-defense');
    moduleTriggers.push('/appeals-protest');

    immediateActions.push({
      action: 'Request CDP or Equivalent Hearing if levy notice recent',
      priority: 'critical',
      deadline: 'Immediately',
    });
    immediateActions.push({
      action: 'Prepare Collection Information Statement (433-A)',
      priority: 'high',
      deadline: '1 week',
    });
    immediateActions.push({
      action: 'Propose collection alternative (IA, CNC, OIC)',
      priority: 'high',
      deadline: '2 weeks',
    });

    secondaryOptions.push({
      route: 'penalty_abatement',
      name: 'Penalty Abatement',
      reason: 'Request penalty relief while addressing collection',
    });
  }

  // ========================================
  // ROUTING PRIORITY 6: AUDIT DEFENSE
  // ========================================
  else if (input.audit_status === 'open' || input.audit_status === 'proposed_adjustment') {
    primaryRoute = 'audit_defense';
    routeName = 'Audit Defense Strategy';
    legalBasis = 'IRM 4.10 (Examination), IRC § 6001 (Records), § 7491 (Burden)';
    caseClassification = 'AUDIT DEFENSE CASE';
    riskScore = input.audit_status === 'proposed_adjustment' ? 'high' : 'medium';

    riskFactors.push(`Audit status: ${input.audit_status}`);
    moduleTriggers.push('/audit-defense');

    if (input.audit_status === 'proposed_adjustment') {
      deadlines.push({
        item: 'Respond to proposed adjustment (30-day letter)',
        date_or_timeframe: '30 days from letter (verify date)',
        critical: true,
      });
      immediateActions.push({
        action: 'Review proposed adjustments',
        priority: 'critical',
        deadline: 'Immediately',
      });
      immediateActions.push({
        action: 'Gather documentation to contest adjustments',
        priority: 'high',
        deadline: '2 weeks',
      });
    } else {
      immediateActions.push({
        action: 'Organize records by audit issue',
        priority: 'high',
        deadline: '1 week',
      });
      immediateActions.push({
        action: 'Respond to IDRs within deadlines',
        priority: 'high',
        deadline: 'Per IRS request',
      });
    }

    secondaryOptions.push({
      route: 'irs_appeals_audit',
      name: 'IRS Appeals',
      reason: 'Can appeal adverse audit result',
    });
  }

  // ========================================
  // ROUTING PRIORITY 7: SFR RECONSIDERATION
  // ========================================
  else if (input.sfr_assessment && !input.notice_of_deficiency_received) {
    primaryRoute = 'sfr_reconsideration';
    routeName = 'SFR Attack / Audit Reconsideration';
    legalBasis = 'IRM 4.12.1 (SFR), IRM 4.13 (Reconsideration)';
    caseClassification = 'SUBSTITUTE FOR RETURN CASE';
    riskScore = 'high';

    riskFactors.push('SFR assessed - liability likely overstated');
    riskFactors.push('No Tax Court window - must use reconsideration');
    moduleTriggers.push('/sfr-attack');

    immediateActions.push({
      action: 'Order IRS transcripts to verify SFR details',
      priority: 'critical',
      deadline: '3 days',
    });
    immediateActions.push({
      action: 'Prepare accurate original return(s)',
      priority: 'critical',
      deadline: '30 days',
    });
    immediateActions.push({
      action: 'Submit Audit Reconsideration request',
      priority: 'high',
      deadline: '60 days',
    });

    secondaryOptions.push({
      route: 'collection_defense',
      name: 'Collection Defense',
      reason: 'Address collection while reconsideration pending',
    });
  }

  // ========================================
  // ROUTING PRIORITY 8: PENALTY ABATEMENT
  // ========================================
  else if (!input.tax_assessed || (input.tax_assessed && !input.irs_collection_started)) {
    primaryRoute = 'penalty_abatement';
    routeName = 'Penalty Reduction / Administrative Resolution';
    legalBasis = 'IRC § 6651 (penalties), IRM 20.1 (abatement)';
    caseClassification = 'ADMINISTRATIVE RESOLUTION';
    riskScore = 'low';

    riskFactors.push('No active collection - time for administrative resolution');
    moduleTriggers.push('/penalty-optimizer');

    immediateActions.push({
      action: 'File any missing returns',
      priority: 'high',
      deadline: '30 days',
    });
    immediateActions.push({
      action: 'Request First Time Penalty Abatement if eligible',
      priority: 'medium',
      deadline: '60 days',
    });
    immediateActions.push({
      action: 'Prepare reasonable cause statement if FTA not available',
      priority: 'medium',
      deadline: '60 days',
    });

    secondaryOptions.push({
      route: 'administrative_resolution',
      name: 'Installment Agreement',
      reason: 'Set up payment plan if balance due',
    });
  }

  // ========================================
  // DEFAULT: VOLUNTARY COMPLIANCE
  // ========================================
  else {
    primaryRoute = 'voluntary_compliance';
    routeName = 'Voluntary Compliance / Proactive Resolution';
    legalBasis = 'General tax compliance obligations';
    caseClassification = 'PROACTIVE COMPLIANCE';
    riskScore = 'low';

    moduleTriggers.push('/non-filer');
    moduleTriggers.push('/accounting');

    immediateActions.push({
      action: 'Order IRS transcripts to verify status',
      priority: 'medium',
      deadline: '1 week',
    });
    immediateActions.push({
      action: 'File any missing returns',
      priority: 'medium',
      deadline: '30 days',
    });
    immediateActions.push({
      action: 'Address any balance due proactively',
      priority: 'medium',
      deadline: '60 days',
    });
  }

  // ========================================
  // CRIMINAL FLAG CHECK
  // ========================================
  let criminalFlag = false;
  let criminalAdvisory = '';

  if (input.criminal_referral_known || input.criminal_investigation_suspected) {
    criminalFlag = true;
    criminalAdvisory = `
⚠️ CRIMINAL EXPOSURE ADVISORY ⚠️

Criminal referral or investigation indicated.

IMMEDIATE REQUIREMENTS:
1. RETAIN CRIMINAL TAX DEFENSE COUNSEL BEFORE ANY IRS CONTACT
2. Invoke Fifth Amendment rights if questioned
3. Do NOT make voluntary disclosures without counsel
4. Preserve all records - do NOT destroy anything
5. Do NOT discuss case with third parties

Run /criminal-risk for detailed exposure analysis.
`;
    riskFactors.push('CRIMINAL EXPOSURE - Consult criminal tax defense counsel');
    moduleTriggers.push('/criminal-risk');
    riskScore = 'critical';
  }

  // ========================================
  // BUILD TIMELINE MAP
  // ========================================
  const timelineMap = buildTimelineMap(primaryRoute, input);

  return {
    case_classification: caseClassification,
    primary_route: primaryRoute,
    route_name: routeName,
    legal_basis: legalBasis,
    deadlines,
    secondary_options: secondaryOptions,
    risk_score: riskScore,
    risk_factors: riskFactors,
    immediate_actions: immediateActions,
    timeline_map: timelineMap,
    module_triggers: moduleTriggers,
    criminal_flag: criminalFlag,
    criminal_advisory: criminalAdvisory,
  };
}

// ============================================================================
// TIMELINE MAP BUILDER
// ============================================================================

function buildTimelineMap(route: PrimaryRoute, input: CaseRouterInput): string {
  const maps: Record<PrimaryRoute, string> = {
    doj_litigation: `
## MASTER TIMELINE: DOJ LITIGATION

┌─────────────────────────────────────────────────────────────────┐
│  COMPLAINT    →    ANSWER     →   DISCOVERY   →    TRIAL       │
│   SERVED           (60 days)      (6-12 mo)      (12-24 mo)    │
└─────────────────────────────────────────────────────────────────┘

Current: COMPLAINT SERVED - Answer required within 60 days

Next Steps:
1. File Answer with affirmative defenses
2. Initial disclosures (14 days after answer)
3. Discovery phase
4. Dispositive motions
5. Trial or settlement
`,

    refund_suit: `
## MASTER TIMELINE: REFUND SUIT

┌─────────────────────────────────────────────────────────────────┐
│   CLAIM     →   DISALLOW/   →   FILE SUIT   →    TRIAL        │
│   FILED         6 MONTHS        (2 yr limit)    (12-24 mo)     │
└─────────────────────────────────────────────────────────────────┘

Current: SUIT READY - May file in District Court or Court of Federal Claims

Next Steps:
1. Draft and file complaint
2. Serve United States
3. Discovery
4. Summary judgment motions
5. Trial
`,

    tax_court_deficiency: `
## MASTER TIMELINE: TAX COURT (DEFICIENCY)

┌─────────────────────────────────────────────────────────────────┐
│   NOTICE    →    PETITION    →   ANSWER    →    TRIAL          │
│   (90 days)     (file now)      (60 days)     (12-24 mo)       │
└─────────────────────────────────────────────────────────────────┘

Current: ${90 - input.days_since_notice} DAYS REMAINING - JURISDICTIONAL DEADLINE

Next Steps:
1. FILE PETITION (critical)
2. Await IRS Answer
3. Stipulation/Discovery
4. Settlement conference
5. Trial if no settlement
`,

    tax_court_cdp: `
## MASTER TIMELINE: TAX COURT (CDP APPEAL)

┌─────────────────────────────────────────────────────────────────┐
│   CDP      →    APPEALS    →   DETERMINATION  →   TAX COURT   │
│   NOTICE       HEARING         (adverse)         PETITION      │
└─────────────────────────────────────────────────────────────────┘

Next Steps:
1. Complete CDP hearing
2. Receive determination
3. If adverse, petition Tax Court within 30 days
`,

    irs_appeals_cdp: `
## MASTER TIMELINE: CDP HEARING

┌─────────────────────────────────────────────────────────────────┐
│   CDP       →    FORM     →    APPEALS    →    DETERMINATION   │
│   NOTICE        12153         HEARING          (3-6 mo)        │
│  (30 days)     (NOW!)                                          │
└─────────────────────────────────────────────────────────────────┘

Current: ${30 - input.days_since_notice} DAYS REMAINING for CDP request

Next Steps:
1. FILE FORM 12153 (critical)
2. Prepare collection alternative
3. Attend Appeals hearing
4. Receive determination
5. Tax Court if adverse
`,

    irs_appeals_audit: `
## MASTER TIMELINE: AUDIT → APPEALS

┌─────────────────────────────────────────────────────────────────┐
│   AUDIT    →    30-DAY    →    PROTEST   →    APPEALS         │
│   CLOSES        LETTER         FILED         CONFERENCE        │
└─────────────────────────────────────────────────────────────────┘

Next Steps:
1. Receive 30-day letter
2. File protest within 30 days
3. Appeals conference
4. Settlement or Tax Court
`,

    collection_defense: `
## MASTER TIMELINE: COLLECTION DEFENSE

┌─────────────────────────────────────────────────────────────────┐
│   NOTICE    →    CDP/IA    →    RESOLUTION   →   COMPLIANCE   │
│   RECEIVED       REQUEST        (3-12 mo)        ONGOING       │
└─────────────────────────────────────────────────────────────────┘

Current: COLLECTION ACTIVE - Seek resolution

Next Steps:
1. Request CDP if eligible
2. Submit financial statement
3. Propose collection alternative
4. Finalize agreement
`,

    audit_defense: `
## MASTER TIMELINE: AUDIT DEFENSE

┌─────────────────────────────────────────────────────────────────┐
│   IDR      →    RESPONSE   →   PROPOSED    →    30-DAY       │
│   ISSUED        PERIOD        ADJUSTMENT        LETTER        │
└─────────────────────────────────────────────────────────────────┘

Current: AUDIT OPEN

Next Steps:
1. Respond to IDRs
2. Provide documentation
3. Negotiate with examiner
4. Appeals if adverse
`,

    sfr_reconsideration: `
## MASTER TIMELINE: SFR RECONSIDERATION

┌─────────────────────────────────────────────────────────────────┐
│   SFR      →    ORIGINAL   →   RECON     →    ADJUSTMENT      │
│   ASSESSED      RETURN         REQUEST       (3-6 mo)         │
└─────────────────────────────────────────────────────────────────┘

Current: SFR ASSESSED - File original return

Next Steps:
1. Order transcripts
2. Prepare original return
3. Submit reconsideration request
4. Monitor for adjustment
`,

    penalty_abatement: `
## MASTER TIMELINE: PENALTY ABATEMENT

┌─────────────────────────────────────────────────────────────────┐
│   ASSESS   →    REQUEST    →    IRS      →    APPEAL          │
│   PENALTY       FTA/RC         DECISION       IF DENIED        │
└─────────────────────────────────────────────────────────────────┘

Next Steps:
1. Determine eligibility (FTA vs Reasonable Cause)
2. Submit request
3. Await decision
4. Appeal if denied
`,

    administrative_resolution: `
## MASTER TIMELINE: ADMINISTRATIVE RESOLUTION

┌─────────────────────────────────────────────────────────────────┐
│   FILE     →    ADDRESS    →    SET UP   →    MAINTAIN        │
│   RETURNS       BALANCE        AGREEMENT      COMPLIANCE       │
└─────────────────────────────────────────────────────────────────┘

Next Steps:
1. File all returns
2. Pay or arrange payment
3. Set up installment agreement if needed
4. Maintain ongoing compliance
`,

    voluntary_compliance: `
## MASTER TIMELINE: VOLUNTARY COMPLIANCE

┌─────────────────────────────────────────────────────────────────┐
│   ORDER    →    PREPARE    →    FILE     →    RESOLVE         │
│   TRANSCRIPTS    RETURNS       RETURNS       BALANCE          │
└─────────────────────────────────────────────────────────────────┘

Current: PROACTIVE PHASE - Coming into compliance

Next Steps:
1. Order all IRS transcripts
2. Prepare missing returns
3. File all returns
4. Address any balance
5. Maintain compliance
`,
  };

  return maps[route] || maps.voluntary_compliance;
}

// ============================================================================
// CASE ROUTER REPORT GENERATOR
// ============================================================================

export function generateCaseRouterReport(output: CaseRouterOutput): string {
  return `
# TAX CASE ROUTING ANALYSIS

## CASE CLASSIFICATION
**${output.case_classification}**

---

## PRIMARY ROUTE
**${output.route_name}**

### Legal Basis
${output.legal_basis}

---

## DEADLINES
${output.deadlines.length > 0 ?
  output.deadlines.map(d =>
    `${d.critical ? '⚠️ CRITICAL: ' : ''}${d.item}\n   Timeframe: ${d.date_or_timeframe}`
  ).join('\n\n') :
  'No immediate statutory deadlines identified.'}

---

## RISK SCORE: ${output.risk_score.toUpperCase()}

### Risk Factors
${output.risk_factors.map(f => `- ${f}`).join('\n')}

---

## IMMEDIATE ACTIONS

${output.immediate_actions.map(a =>
  `### ${a.priority.toUpperCase()}: ${a.action}\n   Deadline: ${a.deadline}`
).join('\n\n')}

---

## SECONDARY OPTIONS
${output.secondary_options.length > 0 ?
  output.secondary_options.map(o =>
    `- **${o.name}**: ${o.reason}`
  ).join('\n') :
  'No secondary options identified at this time.'}

---

## MODULE TRIGGERS
Run these commands for detailed analysis:
${output.module_triggers.map(t => `- \`${t}\``).join('\n')}

${output.timeline_map}

${output.criminal_flag ? output.criminal_advisory : ''}
`;
}

// ============================================================================
// WORKFLOW COMMAND
// ============================================================================

export const CASE_ROUTER_WORKFLOW = {
  command: '/case-router',
  description: 'Master Tax Case Router - Jurisdiction & Strategy Selector',
  workflow_type: 'case_router',
  module_path: '../modules/irs_tax_defense/case_router',
  entry_function: 'routeTaxCase',
  required_data: ['notices', 'assessment_status', 'collection_status'],
  generates_outputs: [
    'case_classification',
    'primary_route',
    'deadlines',
    'risk_assessment',
    'immediate_actions',
    'timeline_map',
    'module_triggers',
  ],
  estimated_phases: 3,
};
