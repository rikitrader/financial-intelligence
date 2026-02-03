/**
 * IRS Tax Defense Intake Workflow
 * Command: /tax-intake
 *
 * Triggers comprehensive tax defense analysis with scorecard
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateId } from '../core/normalize';
import { loadBankTransactions, loadGLEntries, loadInvoices, ensureDirectory, writeFile, writeJSON } from '../core/io';
import { runIntake, TaxDefenseCase, IntakeData } from '../modules/irs_tax_defense';
import { runRedFlagAnalysis, RedFlagScorecard } from '../modules/irs_tax_defense/red_flags';
import { generateScorecardReport } from '../modules/irs_tax_defense/scorecard';

// ============================================================================
// INTAKE WORKFLOW
// ============================================================================

export interface IntakeWorkflowConfig {
  input_dir: string;
  output_dir: string;
  taxpayer_name: string;
  taxpayer_type: 'individual' | 'corporation' | 'partnership' | 'trust';
  ein_or_ssn?: string;
  tax_years: string[];
  audit_trigger?: string;
  urgency?: 'routine' | 'elevated' | 'urgent' | 'emergency';
}

export async function runIntakeWorkflow(config: IntakeWorkflowConfig): Promise<{
  case_id: string;
  scorecard: RedFlagScorecard;
  output_files: string[];
}> {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     IRS TAX DEFENSE & REGULATORY CONTROVERSY SYSTEM             ║');
  console.log('║                    INTAKE WORKFLOW v3.0                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const case_id = generateId('TAX');
  const outputFiles: string[] = [];

  // Create output directories
  const caseDir = path.join(config.output_dir, 'case-files', case_id);
  ensureDirectory(caseDir);
  ensureDirectory(path.join(caseDir, '01_INTAKE'));
  ensureDirectory(path.join(caseDir, '02_EVIDENCE'));
  ensureDirectory(path.join(caseDir, '03_ISSUES'));
  ensureDirectory(path.join(caseDir, '04_DEFENSE'));
  ensureDirectory(path.join(caseDir, '05_PENALTIES'));
  ensureDirectory(path.join(caseDir, '06_IDR_RESPONSE'));
  ensureDirectory(path.join(caseDir, '07_APPEALS'));
  ensureDirectory(path.join(caseDir, '08_COLLECTION'));
  ensureDirectory(path.join(caseDir, '09_LITIGATION'));
  ensureDirectory(path.join(caseDir, '10_CRIMINAL'));
  ensureDirectory(path.join(caseDir, '11_FINAL_REPORT'));
  ensureDirectory(path.join(caseDir, '12_APPEALS_PROTEST'));
  ensureDirectory(path.join(caseDir, '13_SEC_RISK'));
  ensureDirectory(path.join(caseDir, 'images'));

  console.log(`📁 Case Directory: ${caseDir}`);
  console.log(`📋 Case ID: ${case_id}`);
  console.log('\n');

  // ========================================
  // PHASE 1: Load Financial Data
  // ========================================
  console.log('▶ PHASE 1: Loading Financial Data');
  console.log('─'.repeat(50));

  const financialData = await loadFinancialData(config.input_dir);
  console.log(`   ✓ Bank Transactions: ${financialData.bankTransactions.length}`);
  console.log(`   ✓ GL Entries: ${financialData.glEntries.length}`);
  console.log(`   ✓ Invoices: ${financialData.invoices.length}`);
  console.log('\n');

  // ========================================
  // PHASE 2: Run Red Flag Analysis
  // ========================================
  console.log('▶ PHASE 2: Red Flag Analysis & Scorecard');
  console.log('─'.repeat(50));

  const scorecard = await runRedFlagAnalysis({
    transactions: financialData.bankTransactions,
    ledger_entries: financialData.glEntries,
    invoices: financialData.invoices,
    taxpayer_type: config.taxpayer_type,
    tax_years: config.tax_years,
  });

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                     RED FLAG SCORECARD                            ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  IRS AUDIT RISK:        ${padScore(scorecard.irs_risk_score)}  ${getRiskBar(scorecard.irs_risk_score)}  ║`);
  console.log(`║  FRAUD INDICATORS:      ${padScore(scorecard.fraud_score)}  ${getRiskBar(scorecard.fraud_score)}  ║`);
  console.log(`║  PENALTY EXPOSURE:      ${padScore(scorecard.penalty_score)}  ${getRiskBar(scorecard.penalty_score)}  ║`);
  console.log(`║  SEC COMPLIANCE:        ${padScore(scorecard.sec_score)}  ${getRiskBar(scorecard.sec_score)}  ║`);
  console.log(`║  CRIMINAL RISK:         ${padScore(scorecard.criminal_score)}  ${getRiskBar(scorecard.criminal_score)}  ║`);
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  OVERALL RISK:          ${padScore(scorecard.overall_score)}  ${getRiskBar(scorecard.overall_score)}  ║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Display red flags
  if (scorecard.red_flags.length > 0) {
    console.log('🚩 RED FLAGS DETECTED:');
    console.log('─'.repeat(50));
    scorecard.red_flags.forEach((flag, i) => {
      const icon = flag.severity === 'critical' ? '🔴' :
                   flag.severity === 'high' ? '🟠' :
                   flag.severity === 'medium' ? '🟡' : '🟢';
      console.log(`   ${icon} ${flag.title}`);
      console.log(`      └─ ${flag.description.substring(0, 70)}...`);
    });
    console.log('\n');
  }

  // ========================================
  // PHASE 3: Criminal Exposure Check
  // ========================================
  console.log('▶ PHASE 3: Criminal Exposure Check');
  console.log('─'.repeat(50));

  if (scorecard.criminal_score >= 60) {
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  ⚠️  WARNING: POTENTIAL CRIMINAL EXPOSURE DETECTED              ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  RECOMMENDED ACTIONS:                                            ║');
    console.log('║  1. STOP all communications with IRS                            ║');
    console.log('║  2. ENGAGE criminal tax defense counsel IMMEDIATELY             ║');
    console.log('║  3. PRESERVE all documents                                       ║');
    console.log('║  4. INVOKE Fifth Amendment rights if questioned                 ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('\n');
  } else {
    console.log('   ✓ No significant criminal exposure indicators');
    console.log('\n');
  }

  // ========================================
  // PHASE 4: Generate Reports
  // ========================================
  console.log('▶ PHASE 4: Generating Reports');
  console.log('─'.repeat(50));

  // Generate scorecard report
  const scorecardReport = generateScorecardReport(scorecard, config);
  const scorecardPath = path.join(caseDir, '01_INTAKE', 'SCORECARD.md');
  writeFile(scorecardPath, scorecardReport);
  outputFiles.push(scorecardPath);
  console.log(`   ✓ Scorecard: SCORECARD.md`);

  // Generate red flags report
  const redFlagsReport = generateRedFlagsReport(scorecard);
  const redFlagsPath = path.join(caseDir, '01_INTAKE', 'RED_FLAGS.md');
  writeFile(redFlagsPath, redFlagsReport);
  outputFiles.push(redFlagsPath);
  console.log(`   ✓ Red Flags: RED_FLAGS.md`);

  // Generate action plan
  const actionPlan = generateActionPlan(scorecard, config);
  const actionPlanPath = path.join(caseDir, '01_INTAKE', 'ACTION_PLAN.md');
  writeFile(actionPlanPath, actionPlan);
  outputFiles.push(actionPlanPath);
  console.log(`   ✓ Action Plan: ACTION_PLAN.md`);

  // Generate transaction analysis
  const transactionAnalysis = generateTransactionAnalysis(financialData, scorecard);
  const transactionPath = path.join(caseDir, '02_EVIDENCE', 'TRANSACTION_ANALYSIS.md');
  writeFile(transactionPath, transactionAnalysis);
  outputFiles.push(transactionPath);
  console.log(`   ✓ Transaction Analysis: TRANSACTION_ANALYSIS.md`);

  // Save raw data
  writeJSON(path.join(caseDir, '01_INTAKE', 'scorecard.json'), scorecard);
  writeJSON(path.join(caseDir, '01_INTAKE', 'config.json'), config);

  console.log('\n');

  // ========================================
  // PHASE 5: Summary
  // ========================================
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                    INTAKE WORKFLOW COMPLETE                       ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Case ID: ${case_id.padEnd(52)}║`);
  console.log(`║  Output Directory: ${caseDir.substring(0, 43).padEnd(44)}║`);
  console.log(`║  Files Generated: ${outputFiles.length.toString().padEnd(44)}║`);
  console.log(`║  Red Flags Found: ${scorecard.red_flags.length.toString().padEnd(44)}║`);
  console.log(`║  Overall Risk: ${scorecard.overall_score}/100 (${getRiskLevel(scorecard.overall_score).padEnd(39)})║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  return {
    case_id,
    scorecard,
    output_files: outputFiles,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface FinancialData {
  bankTransactions: any[];
  glEntries: any[];
  invoices: any[];
}

async function loadFinancialData(inputDir: string): Promise<FinancialData> {
  let bankTransactions: any[] = [];
  let glEntries: any[] = [];
  let invoices: any[] = [];

  // Load bank transactions
  const bankFile = path.join(inputDir, 'bank.csv');
  if (fs.existsSync(bankFile)) {
    const result = loadBankTransactions(bankFile, 'intake');
    bankTransactions = result.data;
  }

  // Load GL entries
  const glFile = path.join(inputDir, 'gl.csv');
  if (fs.existsSync(glFile)) {
    const result = loadGLEntries(glFile, 'intake');
    glEntries = result.data;
  }

  // Load invoices
  const invoiceFile = path.join(inputDir, 'invoices.csv');
  if (fs.existsSync(invoiceFile)) {
    const result = loadInvoices(invoiceFile, 'intake');
    invoices = result.data;
  }

  return { bankTransactions, glEntries, invoices };
}

function padScore(score: number): string {
  return score.toString().padStart(3) + '/100';
}

function getRiskBar(score: number): string {
  const filled = Math.round(score / 5);
  const empty = 20 - filled;
  const color = score >= 80 ? '█' : score >= 60 ? '▓' : score >= 40 ? '▒' : '░';
  return color.repeat(filled) + '░'.repeat(empty);
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

function generateRedFlagsReport(scorecard: RedFlagScorecard): string {
  return `# Red Flag Analysis Report

**Generated:** ${new Date().toISOString()}
**Total Red Flags:** ${scorecard.red_flags.length}

---

## Summary by Severity

| Severity | Count |
|----------|-------|
| Critical | ${scorecard.red_flags.filter(f => f.severity === 'critical').length} |
| High | ${scorecard.red_flags.filter(f => f.severity === 'high').length} |
| Medium | ${scorecard.red_flags.filter(f => f.severity === 'medium').length} |
| Low | ${scorecard.red_flags.filter(f => f.severity === 'low').length} |

---

## Detailed Red Flags

${scorecard.red_flags.map((flag, i) => `
### ${i + 1}. ${flag.title}

**Severity:** ${flag.severity.toUpperCase()}
**Category:** ${flag.category}
**Confidence:** ${(flag.confidence * 100).toFixed(0)}%
${flag.amount_involved ? `**Amount Involved:** $${flag.amount_involved.toLocaleString()}` : ''}
${flag.irc_section ? `**IRC Section:** ${flag.irc_section}` : ''}

${flag.description}

**Risk Factors:**
${flag.risk_factors?.map(r => `- ${r}`).join('\n') || '- See description'}

**Recommended Actions:**
${flag.recommended_actions?.map(a => `- ${a}`).join('\n') || '- Review and investigate'}

---
`).join('\n')}

## Legal References

${scorecard.legal_references?.map(ref => `- ${ref}`).join('\n') || '- Internal Revenue Code\n- Treasury Regulations\n- Internal Revenue Manual'}
`;
}

function generateActionPlan(scorecard: RedFlagScorecard, config: IntakeWorkflowConfig): string {
  const criticalFlags = scorecard.red_flags.filter(f => f.severity === 'critical');
  const highFlags = scorecard.red_flags.filter(f => f.severity === 'high');

  return `# Action Plan

**Case:** ${config.taxpayer_name}
**Generated:** ${new Date().toISOString()}
**Overall Risk:** ${scorecard.overall_score}/100 (${getRiskLevel(scorecard.overall_score)})

---

## Immediate Actions (7 Days)

${scorecard.overall_score >= 60 ? `
1. ⚠️ **ENGAGE PROFESSIONAL REPRESENTATION**
   - Contact experienced tax controversy counsel
   - Consider Kovel arrangement for privilege

2. **DOCUMENT PRESERVATION**
   - Issue litigation hold
   - Preserve all electronic records
   - Secure physical documents
` : ''}

${criticalFlags.length > 0 ? criticalFlags.map((f, i) => `
${scorecard.overall_score >= 60 ? i + 3 : i + 1}. **Address: ${f.title}**
   - ${f.recommended_actions?.[0] || 'Investigate immediately'}
`).join('\n') : '1. Review and document all tax positions'}

---

## Short-Term Actions (30 Days)

${highFlags.map((f, i) => `
${i + 1}. **${f.title}**
   - ${f.recommended_actions?.[0] || 'Review and prepare defense'}
`).join('\n') || '1. Complete comprehensive documentation review'}

---

## Long-Term Actions (90 Days)

1. Complete penalty relief analysis
2. Prepare appeals strategy (if applicable)
3. Review collection alternatives
4. Assess SEC disclosure obligations
5. Implement control improvements

---

## Resources Required

- Tax controversy counsel
- Forensic accountant
- Document management system
- Timeline tracking

---

*This action plan should be reviewed and updated regularly.*
`;
}

function generateTransactionAnalysis(data: FinancialData, scorecard: RedFlagScorecard): string {
  const totalTransactions = data.bankTransactions.length + data.glEntries.length;
  const flaggedTransactions = scorecard.flagged_transactions || [];

  return `# Transaction Analysis Report

**Generated:** ${new Date().toISOString()}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Transactions Analyzed | ${totalTransactions} |
| Bank Transactions | ${data.bankTransactions.length} |
| GL Entries | ${data.glEntries.length} |
| Invoices | ${data.invoices.length} |
| Flagged Transactions | ${flaggedTransactions.length} |
| Flag Rate | ${((flaggedTransactions.length / Math.max(totalTransactions, 1)) * 100).toFixed(1)}% |

---

## Flagged Transactions

${flaggedTransactions.length > 0 ? `
| Date | Description | Amount | Flag Type |
|------|-------------|--------|-----------|
${flaggedTransactions.slice(0, 50).map(t =>
  `| ${t.date} | ${(t.description || '').substring(0, 30)} | $${Math.abs(t.amount).toLocaleString()} | ${t.flag_type} |`
).join('\n')}
${flaggedTransactions.length > 50 ? `\n*...and ${flaggedTransactions.length - 50} more*` : ''}
` : '*No transactions flagged*'}

---

## Analysis by Category

### Cash Transactions
${data.bankTransactions.filter(t => t.description?.toLowerCase().includes('cash')).length} cash transactions detected

### Round Dollar Amounts
${data.bankTransactions.filter(t => t.amount === Math.round(t.amount) && Math.abs(t.amount) > 1000).length} round dollar transactions

### Large Transactions
${data.bankTransactions.filter(t => Math.abs(t.amount) > 10000).length} transactions over $10,000

### Near-Threshold Transactions
${data.bankTransactions.filter(t => Math.abs(t.amount) >= 9000 && Math.abs(t.amount) < 10000).length} transactions between $9,000-$10,000

---

*All flagged transactions require manual review and documentation.*
`;
}
