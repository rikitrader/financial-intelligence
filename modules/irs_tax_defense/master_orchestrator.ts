/**
 * MASTER TAX CONTROVERSY ORCHESTRATOR
 *
 * The "brain of the brain" - coordinates ALL modules in the IRS/DOJ/federal tax litigation system.
 *
 * TRIGGER COMMAND: /tax-orchestrator
 *
 * Functions:
 * - Classifies case posture
 * - Chooses correct forum (admin/appeals/tax court/doj/refund suit)
 * - Invokes correct sub-modules
 * - Maintains case memory + strategy continuity
 * - Produces full case file directory with drafts, evidence index, and deadlines
 * - Updates strategy iteratively when new facts arrive
 *
 * IMPORTANT: This system does NOT assist with illegal tax evasion, concealment, or
 * destruction of records. Focus is on lawful compliance, defense, and procedure.
 */

import { routeTaxCase, generateCaseRouterReport, type CaseRouterInput, type CaseRouterOutput } from './case_router';

// ============================================================================
// AVAILABLE SUB-MODULES
// ============================================================================

export const AVAILABLE_MODULES = {
  // Routing & Classification
  tax_case_router: '/case-router',

  // Non-Filer & Compliance
  nonfiler_defense: '/non-filer',
  sfr_reversal: '/sfr-attack',

  // Collection Defense
  collection_protection: '/collection-defense',
  financial_statement_analyzer: '/433-analysis',
  oic_strategy: '/oic-builder',

  // Appeals & Penalties
  appeals_protest: '/appeals-protest',
  penalty_reduction: '/penalty-optimizer',

  // Risk Assessment
  criminal_exposure: '/criminal-risk',
  procedure_violations: '/procedure-violations',
  settlement_probability: '/settlement-probability',

  // Intelligence & Analysis
  transcript_intelligence: '/transcript-analysis',
  audit_defense: '/audit-defense',

  // Litigation
  tax_court_petition: '/tax-court-petition',
  trial_strategy: '/trial-strategy',
  doj_litigation: '/doj-litigation',
  refund_suit: '/refund-suit',

  // Case Management
  case_memory: '/case-memory',
  evidence_packager: '/evidence-package',
};

// ============================================================================
// INPUT CONTRACT
// ============================================================================

export interface OrchestratorInput {
  // Case Identification
  case_id: string;
  taxpayer_profile: {
    name: string;
    entity_type: 'individual' | 'llc' | 'corp' | 'partnership' | 'trust' | 'estate';
    address_state: string;
    filing_status: 'single' | 'mfj' | 'mfs' | 'hoh' | 'unknown';
  };
  years_at_issue: string[];

  // Notice Status
  known_notices: {
    type: string;
    date: string;
    days_since: number;
  }[];

  // Case Status
  assessment_status: 'assessed' | 'not_assessed' | 'unknown';
  payment_status: 'none' | 'partial' | 'full' | 'unknown';
  collection_status: 'none' | 'lien' | 'levy' | 'garnishment' | 'ro_assigned' | 'unknown';
  audit_status: 'none' | 'open' | 'closed' | 'unknown';
  sfr_status: 'yes' | 'no' | 'unknown';
  refund_claim_status: 'not_filed' | 'filed' | 'disallowed' | '6_months_elapsed' | 'unknown';
  doj_litigation_status: 'none' | 'served' | 'ongoing' | 'unknown';

  // Risk Indicators
  criminal_indicators: 'none' | 'possible' | 'high' | 'unknown';

  // Records & Financials
  records_status: 'complete' | 'partial' | 'missing' | 'unknown';
  financial_snapshot?: {
    monthly_income: number;
    monthly_expenses: number;
    assets_summary: string;
    hardship_flags: string[];
  };

  // Documents
  uploaded_documents_index?: string[];
}

// ============================================================================
// OUTPUT STRUCTURE
// ============================================================================

export interface OrchestratorOutput {
  // Executive Summary
  executive_summary: string;

  // Routing
  route_decision: CaseRouterOutput;
  route_justification: string;

  // Deadlines
  deadline_dashboard: {
    deadline_type: string;
    trigger_event: string;
    days_remaining: number | 'unknown';
    consequence: string;
    recommended_action: string;
  }[];

  // Strategy
  strategy_plan: {
    phase: string;
    timeframe: string;
    objectives: string[];
    actions: string[];
    modules_to_invoke: string[];
  }[];

  // Drafts
  draft_letters: { name: string; content: string }[];
  draft_pleadings: { name: string; content: string }[];

  // Evidence
  evidence_index: { category: string; documents: string[] }[];
  evidence_gaps: string[];

  // Risk Scores
  risk_scores: {
    criminal_risk: 'low' | 'medium' | 'high' | 'critical';
    collection_risk: 'low' | 'medium' | 'high' | 'critical';
    audit_risk: 'low' | 'medium' | 'high' | 'critical';
    litigation_risk: 'low' | 'medium' | 'high' | 'critical';
  };

  // Settlement
  settlement_options: string[];

  // Case Files
  file_tree: string;
  manifest: string;

  // Warnings
  criminal_warning: boolean;
  criminal_advisory: string;
}

// ============================================================================
// MODULE BUNDLE SELECTOR
// ============================================================================

type RouteType = 'admin_nonfiler' | 'sfr' | 'collections' | 'appeals' | 'tax_court' | 'doj' | 'refund_suit' | 'audit';

function selectModuleBundle(routeOutput: CaseRouterOutput): { route: RouteType; modules: string[] } {
  const route = routeOutput.primary_route;

  switch (route) {
    case 'voluntary_compliance':
    case 'penalty_abatement':
    case 'administrative_resolution':
      return {
        route: 'admin_nonfiler',
        modules: ['/non-filer', '/penalty-optimizer', '/evidence-package'],
      };

    case 'sfr_reconsideration':
      return {
        route: 'sfr',
        modules: ['/sfr-attack', '/penalty-optimizer', '/evidence-package'],
      };

    case 'collection_defense':
    case 'irs_appeals_cdp':
      return {
        route: 'collections',
        modules: ['/collection-defense', '/433-analysis', '/oic-builder', '/procedure-violations'],
      };

    case 'irs_appeals_audit':
      return {
        route: 'appeals',
        modules: ['/appeals-protest', '/settlement-probability', '/evidence-package'],
      };

    case 'tax_court_deficiency':
    case 'tax_court_cdp':
      return {
        route: 'tax_court',
        modules: ['/tax-court-petition', '/trial-strategy', '/settlement-probability', '/evidence-package'],
      };

    case 'doj_litigation':
      return {
        route: 'doj',
        modules: ['/doj-litigation', '/evidence-package', '/procedure-violations', '/settlement-probability'],
      };

    case 'refund_suit':
      return {
        route: 'refund_suit',
        modules: ['/refund-suit', '/evidence-package', '/settlement-probability'],
      };

    case 'audit_defense':
      return {
        route: 'audit',
        modules: ['/audit-defense', '/evidence-package', '/penalty-optimizer'],
      };

    default:
      return {
        route: 'admin_nonfiler',
        modules: ['/non-filer', '/penalty-optimizer'],
      };
  }
}

// ============================================================================
// DEADLINE CALCULATOR
// ============================================================================

function calculateDeadlines(input: OrchestratorInput, routeOutput: CaseRouterOutput): OrchestratorOutput['deadline_dashboard'] {
  const deadlines: OrchestratorOutput['deadline_dashboard'] = [];

  // Add deadlines from router
  for (const d of routeOutput.deadlines) {
    deadlines.push({
      deadline_type: d.item,
      trigger_event: 'See notice date',
      days_remaining: d.date_or_timeframe.includes('days') ?
        parseInt(d.date_or_timeframe) || 'unknown' : 'unknown',
      consequence: d.critical ? 'Jurisdictional - rights lost if missed' : 'Procedural impact',
      recommended_action: 'Complete before deadline',
    });
  }

  // Check for NOD 90-day deadline
  const nodNotice = input.known_notices.find(n =>
    n.type.toLowerCase().includes('deficiency') ||
    n.type === 'notice_of_deficiency'
  );
  if (nodNotice && nodNotice.days_since < 90) {
    deadlines.push({
      deadline_type: '90-Day Tax Court Petition',
      trigger_event: `Notice of Deficiency dated ${nodNotice.date}`,
      days_remaining: 90 - nodNotice.days_since,
      consequence: 'Tax Court jurisdiction LOST - must pay before suing',
      recommended_action: 'FILE TAX COURT PETITION IMMEDIATELY',
    });
  }

  // Check for CDP 30-day deadline
  const cdpNotice = input.known_notices.find(n =>
    n.type.toLowerCase().includes('cdp') ||
    n.type === 'LT11' ||
    n.type === 'Letter1058' ||
    n.type === 'CP90'
  );
  if (cdpNotice && cdpNotice.days_since < 30) {
    deadlines.push({
      deadline_type: '30-Day CDP Hearing Request',
      trigger_event: `CDP Notice (${cdpNotice.type}) dated ${cdpNotice.date}`,
      days_remaining: 30 - cdpNotice.days_since,
      consequence: 'CDP rights waived - levy can proceed',
      recommended_action: 'FILE FORM 12153 IMMEDIATELY',
    });
  }

  // Refund suit timing
  if (input.refund_claim_status === 'disallowed') {
    deadlines.push({
      deadline_type: '2-Year Refund Suit Filing',
      trigger_event: 'Refund claim disallowed',
      days_remaining: 'unknown',
      consequence: 'Right to sue for refund expires',
      recommended_action: 'Calculate deadline and file suit before expiration',
    });
  }

  return deadlines;
}

// ============================================================================
// RISK ASSESSMENT
// ============================================================================

function assessRisks(input: OrchestratorInput, routeOutput: CaseRouterOutput): OrchestratorOutput['risk_scores'] {
  // Criminal Risk
  let criminalRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (input.criminal_indicators === 'high') criminalRisk = 'critical';
  else if (input.criminal_indicators === 'possible') criminalRisk = 'high';
  else if (input.years_at_issue.length >= 3) criminalRisk = 'medium';

  // Collection Risk
  let collectionRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (input.collection_status === 'levy' || input.collection_status === 'garnishment') {
    collectionRisk = 'critical';
  } else if (input.collection_status === 'lien' || input.collection_status === 'ro_assigned') {
    collectionRisk = 'high';
  } else if (input.assessment_status === 'assessed' && input.payment_status !== 'full') {
    collectionRisk = 'medium';
  }

  // Audit Risk
  let auditRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (input.audit_status === 'open') auditRisk = 'high';
  else if (input.sfr_status === 'yes') auditRisk = 'medium';

  // Litigation Risk
  let litigationRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (input.doj_litigation_status === 'served' || input.doj_litigation_status === 'ongoing') {
    litigationRisk = 'critical';
  } else if (routeOutput.primary_route.includes('court') || routeOutput.primary_route === 'refund_suit') {
    litigationRisk = 'high';
  } else if (routeOutput.primary_route.includes('appeals')) {
    litigationRisk = 'medium';
  }

  return { criminal_risk: criminalRisk, collection_risk: collectionRisk, audit_risk: auditRisk, litigation_risk: litigationRisk };
}

// ============================================================================
// FILE TREE GENERATOR
// ============================================================================

function generateFileTree(caseId: string, input: OrchestratorInput): string {
  return `
/case-files/${caseId}/
├── MANIFEST.md
├── 00_case_summary.md
├── 01_route_and_jurisdiction.md
├── 02_deadline_dashboard.md
├── 03_strategy_plan.md
├── 04_drafts/
│   ├── letters/
│   │   ├── non_filer_response.md
│   │   ├── penalty_abatement.md
│   │   └── levy_release_request.md
│   ├── pleadings/
│   │   ├── tax_court_petition.md
│   │   └── answer_template.md
│   └── protests/
│       └── appeals_protest.md
├── 05_evidence/
│   ├── index.md
│   ├── gaps.md
│   └── issue_binders/
│       ├── income/
│       ├── deductions/
│       └── penalties/
├── 06_financials/
│   ├── 433_analysis.md
│   └── oic_rcp.md
├── 07_risk/
│   ├── criminal_risk.md
│   ├── procedural_violations.md
│   └── settlement_model.md
└── 08_logs/
    ├── decisions.json
    └── timeline.json
`;
}

// ============================================================================
// MANIFEST GENERATOR
// ============================================================================

function generateManifest(caseId: string, input: OrchestratorInput, output: OrchestratorOutput): string {
  return `# CASE MANIFEST

## Case ID: ${caseId}

## Taxpayer: ${input.taxpayer_profile.name}

## Generated: ${new Date().toISOString()}

---

## FILE INDEX

| File | Description | Status |
|------|-------------|--------|
| 00_case_summary.md | Executive case summary | Generated |
| 01_route_and_jurisdiction.md | Routing decision and legal basis | Generated |
| 02_deadline_dashboard.md | Critical deadlines table | Generated |
| 03_strategy_plan.md | Phased strategy plan | Generated |
| 04_drafts/ | Letter and pleading templates | ${output.draft_letters.length + output.draft_pleadings.length} drafts |
| 05_evidence/ | Evidence organization | ${output.evidence_index.length} categories |
| 06_financials/ | Financial analysis | ${input.financial_snapshot ? 'Available' : 'Pending'} |
| 07_risk/ | Risk assessments | Generated |
| 08_logs/ | Decision and timeline logs | Active |

---

## CURRENT POSTURE

- **Primary Route:** ${output.route_decision.route_name}
- **Risk Level:** ${output.route_decision.risk_score.toUpperCase()}
- **Criminal Flag:** ${output.criminal_warning ? 'YES - CONSULT COUNSEL' : 'No'}

---

## MODULES INVOKED

${output.strategy_plan.flatMap(p => p.modules_to_invoke).map(m => `- ${m}`).join('\n')}

---

## CROSS-REFERENCES

- Evidence gaps linked to strategy actions
- Deadlines linked to recommended actions
- Risk scores inform strategy priority
`;
}

// ============================================================================
// MAIN ORCHESTRATOR FUNCTION
// ============================================================================

export function orchestrateTaxCase(input: OrchestratorInput): OrchestratorOutput {
  // STEP A: NORMALIZE & VALIDATE
  // (Input normalization handled by caller)

  // STEP B: ROUTE THE CASE
  const routerInput: CaseRouterInput = {
    notices_received: input.known_notices.map(n => n.type as any),
    days_since_notice: input.known_notices[0]?.days_since || 0,
    notice_of_deficiency_received: input.known_notices.some(n =>
      n.type.toLowerCase().includes('deficiency')
    ),
    cdp_notice_received: input.known_notices.some(n =>
      ['LT11', 'Letter1058', 'CP90', 'cdp_notice'].includes(n.type)
    ),
    tax_assessed: input.assessment_status === 'assessed',
    tax_paid: input.payment_status,
    tax_years: input.years_at_issue,
    amount_owed: 0, // Would be provided in full implementation
    refund_claim_filed: input.refund_claim_status !== 'not_filed' && input.refund_claim_status !== 'unknown',
    refund_claim_disallowed: input.refund_claim_status === 'disallowed',
    six_months_since_refund_claim: input.refund_claim_status === '6_months_elapsed',
    irs_collection_started: input.collection_status !== 'none' && input.collection_status !== 'unknown',
    collection_type: input.collection_status === 'unknown' ? ['none'] : [input.collection_status as any],
    audit_status: input.audit_status as any,
    sfr_assessment: input.sfr_status === 'yes',
    appeals_rights_remaining: true, // Would be determined in full implementation
    prior_appeals_hearing: false,
    doj_complaint_served: input.doj_litigation_status === 'served' || input.doj_litigation_status === 'ongoing',
    criminal_referral_known: input.criminal_indicators === 'high',
    criminal_investigation_suspected: input.criminal_indicators === 'possible',
  };

  const routeOutput = routeTaxCase(routerInput);

  // STEP C: CRIMINAL SCREEN
  let criminalWarning = false;
  let criminalAdvisory = '';

  if (input.criminal_indicators === 'possible' || input.criminal_indicators === 'high' ||
      input.years_at_issue.length >= 3) {
    criminalWarning = true;
    criminalAdvisory = `
⚠️ CRIMINAL EXPOSURE ADVISORY ⚠️

Elevated criminal risk indicators detected.

IMMEDIATE REQUIREMENTS:
1. RETAIN CRIMINAL TAX DEFENSE COUNSEL before any IRS communication
2. Invoke Fifth Amendment rights if questioned by agents
3. Do NOT make voluntary disclosures without attorney guidance
4. Preserve all records - destruction is obstruction (IRC § 7212)
5. Limit discussions about the case

Run /criminal-risk for detailed exposure analysis.
`;
  }

  // STEP D: SELECT MODULE BUNDLE
  const moduleBundle = selectModuleBundle(routeOutput);

  // STEP E: CALCULATE DEADLINES
  const deadlines = calculateDeadlines(input, routeOutput);

  // STEP F: ASSESS RISKS
  const riskScores = assessRisks(input, routeOutput);

  // STEP G: BUILD STRATEGY PLAN
  const strategyPlan: OrchestratorOutput['strategy_plan'] = [
    {
      phase: 'PHASE 0 - IMMEDIATE (0-14 days)',
      timeframe: '0-14 days',
      objectives: [
        'Address any jurisdictional deadlines',
        'Preserve evidence and documents',
        'Establish case organization',
      ],
      actions: routeOutput.immediate_actions.map(a => a.action),
      modules_to_invoke: ['/case-router', ...moduleBundle.modules.slice(0, 2)],
    },
    {
      phase: 'PHASE 1 - FOUNDATION (14-60 days)',
      timeframe: '14-60 days',
      objectives: [
        'Complete required filings',
        'Gather and organize evidence',
        'Submit initial responses',
      ],
      actions: [
        'File any missing returns',
        'Compile evidence inventory',
        'Submit responses to IRS',
        'Prepare financial documentation',
      ],
      modules_to_invoke: moduleBundle.modules,
    },
    {
      phase: 'PHASE 2 - RESOLUTION (60-180 days)',
      timeframe: '2-6 months',
      objectives: [
        'Pursue primary resolution path',
        'Negotiate with IRS/DOJ',
        'Address any appeals',
      ],
      actions: [
        'Complete primary resolution process',
        'Attend conferences/hearings',
        'Negotiate settlement if appropriate',
      ],
      modules_to_invoke: ['/settlement-probability', '/case-memory'],
    },
    {
      phase: 'PHASE 3 - FINALIZATION (6-18 months)',
      timeframe: '6-18 months',
      objectives: [
        'Finalize resolution',
        'Implement payment arrangements',
        'Establish ongoing compliance',
      ],
      actions: [
        'Complete resolution process',
        'Set up payment plan if needed',
        'Maintain compliance going forward',
      ],
      modules_to_invoke: ['/case-memory'],
    },
  ];

  // BUILD EVIDENCE INDEX
  const evidenceIndex: OrchestratorOutput['evidence_index'] = [
    { category: 'Tax Returns', documents: input.uploaded_documents_index?.filter(d => d.includes('return')) || [] },
    { category: 'IRS Notices', documents: input.known_notices.map(n => `${n.type} - ${n.date}`) },
    { category: 'Bank Records', documents: input.uploaded_documents_index?.filter(d => d.includes('bank')) || [] },
    { category: 'Income Documentation', documents: input.uploaded_documents_index?.filter(d => d.includes('income') || d.includes('w2') || d.includes('1099')) || [] },
    { category: 'Expense Documentation', documents: input.uploaded_documents_index?.filter(d => d.includes('expense') || d.includes('receipt')) || [] },
  ];

  // EVIDENCE GAPS
  const evidenceGaps: string[] = [];
  if (!input.uploaded_documents_index?.some(d => d.includes('transcript'))) {
    evidenceGaps.push('IRS Transcripts (Wage & Income, Account)');
  }
  if (!input.uploaded_documents_index?.some(d => d.includes('return'))) {
    evidenceGaps.push('Tax returns for years at issue');
  }
  if (input.records_status === 'missing' || input.records_status === 'partial') {
    evidenceGaps.push('Complete financial records');
  }

  // SETTLEMENT OPTIONS
  const settlementOptions: string[] = [];
  if (riskScores.collection_risk !== 'low') {
    settlementOptions.push('Installment Agreement - Monthly payments over time');
    if (input.financial_snapshot?.hardship_flags.length) {
      settlementOptions.push('Currently Not Collectible - Hardship status');
      settlementOptions.push('Offer in Compromise - Settle for less');
    }
  }
  if (moduleBundle.route === 'appeals' || moduleBundle.route === 'tax_court') {
    settlementOptions.push('Appeals Settlement - Negotiate with Appeals Officer');
    settlementOptions.push('Stipulated Decision - Agreed Tax Court outcome');
  }

  // GENERATE FILE TREE AND MANIFEST
  const fileTree = generateFileTree(input.case_id, input);

  // BUILD OUTPUT
  const output: OrchestratorOutput = {
    executive_summary: `
# EXECUTIVE CASE SUMMARY

**Case ID:** ${input.case_id}
**Taxpayer:** ${input.taxpayer_profile.name}
**Entity Type:** ${input.taxpayer_profile.entity_type}
**State:** ${input.taxpayer_profile.address_state}

## CURRENT STATUS
- **Years at Issue:** ${input.years_at_issue.join(', ')}
- **Assessment Status:** ${input.assessment_status}
- **Collection Status:** ${input.collection_status}
- **Audit Status:** ${input.audit_status}
- **DOJ Litigation:** ${input.doj_litigation_status}

## PRIMARY ROUTE
**${routeOutput.route_name}**

${routeOutput.legal_basis}

## CRITICAL DEADLINES
${deadlines.filter(d => d.days_remaining !== 'unknown' && (d.days_remaining as number) <= 30)
  .map(d => `- ${d.deadline_type}: ${d.days_remaining} days`).join('\n') || 'No immediate deadlines'}

## RISK ASSESSMENT
| Category | Level |
|----------|-------|
| Criminal | ${riskScores.criminal_risk.toUpperCase()} |
| Collection | ${riskScores.collection_risk.toUpperCase()} |
| Audit | ${riskScores.audit_risk.toUpperCase()} |
| Litigation | ${riskScores.litigation_risk.toUpperCase()} |

${criminalWarning ? '⚠️ CRIMINAL EXPOSURE DETECTED - SEE ADVISORY' : ''}
`,
    route_decision: routeOutput,
    route_justification: `
## ROUTING JUSTIFICATION

The case has been routed to **${routeOutput.route_name}** based on:

1. **Notice Status:** ${input.known_notices.length > 0 ? input.known_notices.map(n => n.type).join(', ') : 'No notices'}
2. **Assessment Status:** ${input.assessment_status}
3. **Collection Activity:** ${input.collection_status}
4. **Refund Claim Status:** ${input.refund_claim_status}
5. **DOJ Involvement:** ${input.doj_litigation_status}

${generateCaseRouterReport(routeOutput)}
`,
    deadline_dashboard: deadlines,
    strategy_plan: strategyPlan,
    draft_letters: [],
    draft_pleadings: [],
    evidence_index: evidenceIndex,
    evidence_gaps: evidenceGaps,
    risk_scores: riskScores,
    settlement_options: settlementOptions,
    file_tree: fileTree,
    manifest: '',
    criminal_warning: criminalWarning,
    criminal_advisory: criminalAdvisory,
  };

  // Generate manifest last (needs full output)
  output.manifest = generateManifest(input.case_id, input, output);

  return output;
}

// ============================================================================
// REPORT GENERATOR
// ============================================================================

export function generateOrchestratorReport(output: OrchestratorOutput): string {
  return `
${output.executive_summary}

---

# A) ROUTE DECISION & LEGAL BASIS

${output.route_justification}

---

# B) DEADLINE DASHBOARD

| Deadline Type | Trigger | Days Remaining | Consequence | Action |
|---------------|---------|----------------|-------------|--------|
${output.deadline_dashboard.map(d =>
  `| ${d.deadline_type} | ${d.trigger_event} | ${d.days_remaining} | ${d.consequence} | ${d.recommended_action} |`
).join('\n')}

---

# C) STRATEGY PLAN

${output.strategy_plan.map(phase => `
## ${phase.phase}
**Timeframe:** ${phase.timeframe}

### Objectives
${phase.objectives.map(o => `- ${o}`).join('\n')}

### Actions
${phase.actions.map(a => `- ${a}`).join('\n')}

### Modules to Invoke
${phase.modules_to_invoke.map(m => `- \`${m}\``).join('\n')}
`).join('\n')}

---

# D) EVIDENCE INDEX

${output.evidence_index.map(cat => `
## ${cat.category}
${cat.documents.length > 0 ? cat.documents.map(d => `- ${d}`).join('\n') : '- No documents catalogued'}
`).join('\n')}

## Evidence Gaps
${output.evidence_gaps.map(g => `- ⚠️ ${g}`).join('\n')}

---

# E) RISK & SETTLEMENT SCORES

## Risk Assessment
| Category | Level |
|----------|-------|
| Criminal Risk | ${output.risk_scores.criminal_risk.toUpperCase()} |
| Collection Risk | ${output.risk_scores.collection_risk.toUpperCase()} |
| Audit Risk | ${output.risk_scores.audit_risk.toUpperCase()} |
| Litigation Risk | ${output.risk_scores.litigation_risk.toUpperCase()} |

## Settlement Options
${output.settlement_options.map(s => `- ${s}`).join('\n')}

---

# F) FILE TREE

\`\`\`
${output.file_tree}
\`\`\`

---

# G) MANIFEST

${output.manifest}

${output.criminal_warning ? `
---

${output.criminal_advisory}
` : ''}
`;
}

// ============================================================================
// WORKFLOW COMMAND
// ============================================================================

export const MASTER_ORCHESTRATOR_WORKFLOW = {
  command: '/tax-orchestrator',
  description: 'Master Tax Controversy Orchestrator - Coordinates all modules',
  workflow_type: 'master_orchestrator',
  module_path: '../modules/irs_tax_defense/master_orchestrator',
  entry_function: 'orchestrateTaxCase',
  required_data: ['taxpayer_profile', 'case_status', 'notices'],
  generates_outputs: [
    'executive_summary',
    'route_decision',
    'deadline_dashboard',
    'strategy_plan',
    'draft_letters',
    'draft_pleadings',
    'evidence_index',
    'risk_scores',
    'settlement_options',
    'file_tree',
    'manifest',
  ],
  estimated_phases: 10,
};
