/**
 * Examination Issue Engine
 * Develops and tracks examination issues
 */

import { Finding } from '../../core/types';
import { generateId } from '../../core/normalize';
import { TaxDefenseContext, TaxIssue } from './index';

// Common examination issues by IRC section
const COMMON_ISSUES = [
  { irc: '162', title: 'Trade or Business Expenses', category: 'deductions' },
  { irc: '167', title: 'Depreciation', category: 'deductions' },
  { irc: '179', title: 'Section 179 Expensing', category: 'deductions' },
  { irc: '183', title: 'Hobby Loss', category: 'income' },
  { irc: '274', title: 'Entertainment/Meals', category: 'deductions' },
  { irc: '280A', title: 'Home Office', category: 'deductions' },
  { irc: '61', title: 'Gross Income Definition', category: 'income' },
  { irc: '104', title: 'Damages Exclusion', category: 'income' },
  { irc: '469', title: 'Passive Activity Losses', category: 'losses' },
  { irc: '1031', title: 'Like-Kind Exchanges', category: 'deferral' },
];

export async function runExaminationEngine(context: TaxDefenseContext): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Analyze transactions for common issues
  const issueAnalysis = analyzeForCommonIssues(context);

  issueAnalysis.forEach(issue => {
    // Determine burden of proof
    const burdenAnalysis = analyzeBurdenOfProof(issue);

    findings.push({
      id: generateId('EXM'),
      module: 'irs_tax_defense',
      title: `Examination Issue: ${issue.title}`,
      description: `${issue.description}\n\n` +
        `**IRC Section:** ${issue.irc_section}\n` +
        `**Burden of Proof:** ${burdenAnalysis.holder} (${burdenAnalysis.standard})\n` +
        `**Amount at Issue:** $${issue.amount_at_issue.toLocaleString()}\n` +
        `**Defense Position:** ${issue.defense_position}`,
      severity: issue.risk_level === 'high' ? 'high' : issue.risk_level === 'medium' ? 'medium' : 'low',
      confidence: issue.confidence,
      detected_at: new Date().toISOString(),
      evidence_refs: issue.evidence_refs || [],
      tags: ['examination', 'irc_' + issue.irc_section, issue.category],
      recommended_actions: issue.recommended_actions,
      amount_involved: issue.amount_at_issue,
    });

    // Add burden of proof finding
    findings.push({
      id: generateId('BOP'),
      module: 'irs_tax_defense',
      title: `Burden of Proof Analysis: IRC ${issue.irc_section}`,
      description: burdenAnalysis.analysis,
      severity: 'info',
      confidence: burdenAnalysis.confidence,
      detected_at: new Date().toISOString(),
      evidence_refs: [],
      tags: ['burden_of_proof', 'irc_' + issue.irc_section],
    });
  });

  return findings;
}

interface IssueAnalysis {
  irc_section: string;
  title: string;
  category: string;
  description: string;
  amount_at_issue: number;
  risk_level: string;
  confidence: number;
  defense_position: string;
  evidence_refs?: any[];
  recommended_actions: string[];
}

interface BurdenAnalysis {
  holder: 'taxpayer' | 'irs';
  standard: string;
  analysis: string;
  confidence: number;
  shift_available: boolean;
  shift_requirements?: string[];
}

function analyzeForCommonIssues(context: TaxDefenseContext): IssueAnalysis[] {
  const issues: IssueAnalysis[] = [];
  const transactions = Array.from(context.transactions.values());
  const ledger = Array.from(context.ledger_entries.values());

  // Check for meals & entertainment (IRC 274)
  const mealsExpenses = transactions.filter(t =>
    t.description?.toLowerCase().includes('meal') ||
    t.description?.toLowerCase().includes('restaurant') ||
    t.description?.toLowerCase().includes('entertainment')
  );

  if (mealsExpenses.length > 0) {
    const totalMeals = mealsExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    issues.push({
      irc_section: '274',
      title: 'Meals and Entertainment Expenses',
      category: 'deductions',
      description: `${mealsExpenses.length} meals/entertainment transactions totaling $${totalMeals.toLocaleString()}. ` +
        'IRC 274 limits deductibility and requires substantiation.',
      amount_at_issue: totalMeals * 0.5, // 50% typically disallowed
      risk_level: totalMeals > 10000 ? 'high' : 'medium',
      confidence: 0.80,
      defense_position: 'Business purpose substantiated with contemporaneous records',
      recommended_actions: [
        'Prepare log of business purpose for each expense',
        'Document attendees and business discussed',
        'Separate 100% deductible from 50% limited expenses',
        'Review for post-2017 entertainment exclusion',
      ],
    });
  }

  // Check for vehicle expenses (IRC 274)
  const vehicleExpenses = transactions.filter(t =>
    t.description?.toLowerCase().includes('vehicle') ||
    t.description?.toLowerCase().includes('auto') ||
    t.description?.toLowerCase().includes('car') ||
    t.description?.toLowerCase().includes('mileage')
  );

  if (vehicleExpenses.length > 0) {
    const totalVehicle = vehicleExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    issues.push({
      irc_section: '274(d)',
      title: 'Vehicle Expense Substantiation',
      category: 'deductions',
      description: `Vehicle expenses of $${totalVehicle.toLocaleString()} require IRC 274(d) substantiation.`,
      amount_at_issue: totalVehicle * 0.3, // Estimate personal use portion
      risk_level: 'medium',
      confidence: 0.75,
      defense_position: 'Mileage log and business use documentation maintained',
      recommended_actions: [
        'Prepare mileage log for entire year',
        'Document business vs personal use percentage',
        'Calculate actual expense vs standard mileage comparison',
        'Prepare Form 4562 substantiation',
      ],
    });
  }

  // Check for professional services (potential 1099 issues)
  const professionalServices = transactions.filter(t =>
    t.description?.toLowerCase().includes('consulting') ||
    t.description?.toLowerCase().includes('contractor') ||
    t.description?.toLowerCase().includes('professional')
  );

  if (professionalServices.length > 0) {
    const totalServices = professionalServices.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    issues.push({
      irc_section: '6041',
      title: 'Information Reporting - Form 1099',
      category: 'compliance',
      description: `$${totalServices.toLocaleString()} in professional services may require Form 1099-NEC filing.`,
      amount_at_issue: 0, // Penalty exposure, not deduction
      risk_level: 'medium',
      confidence: 0.70,
      defense_position: 'All required 1099s were timely filed',
      recommended_actions: [
        'Verify W-9 on file for all vendors over $600',
        'Reconcile 1099s issued to expense records',
        'Prepare for potential backup withholding',
      ],
    });
  }

  // Check for large unusual transactions
  const avgTransaction = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length;
  const unusualTransactions = transactions.filter(t => Math.abs(t.amount) > avgTransaction * 5);

  if (unusualTransactions.length > 0) {
    unusualTransactions.forEach(t => {
      issues.push({
        irc_section: '162',
        title: `Large Transaction: ${t.description?.substring(0, 50) || 'Unknown'}`,
        category: 'deductions',
        description: `Transaction of $${Math.abs(t.amount).toLocaleString()} exceeds 5x average and may attract scrutiny.`,
        amount_at_issue: Math.abs(t.amount),
        risk_level: 'high',
        confidence: 0.65,
        defense_position: 'Legitimate business expense with full documentation',
        recommended_actions: [
          'Prepare detailed explanation of business purpose',
          'Gather all supporting documentation',
          'Document ordinary and necessary standard met',
        ],
      });
    });
  }

  return issues;
}

function analyzeBurdenOfProof(issue: IssueAnalysis): BurdenAnalysis {
  // Default: Taxpayer bears burden (Welch v. Helvering)
  let holder: 'taxpayer' | 'irs' = 'taxpayer';
  let standard = 'Preponderance of evidence';
  let shiftAvailable = false;
  let shiftRequirements: string[] = [];
  let analysis = '';

  // Check for burden shift under IRC 7491
  if (issue.category === 'deductions') {
    shiftAvailable = true;
    shiftRequirements = [
      'Credible evidence introduced',
      'Complied with substantiation requirements',
      'Cooperated with IRS reasonable requests',
      'Met recordkeeping requirements',
    ];

    analysis = `Under IRC 7491(a), burden may shift to IRS if taxpayer:\n` +
      `1. Introduces credible evidence\n` +
      `2. Complies with substantiation requirements\n` +
      `3. Cooperates with reasonable IRS requests\n` +
      `4. Maintains adequate records\n\n` +
      `For IRC ${issue.irc_section} issues, taxpayer must first establish prima facie case ` +
      `with credible evidence before burden shifts.`;
  }

  // Special rules for certain issues
  if (issue.irc_section === '183') {
    // Hobby loss - special rules
    analysis = `IRC 183 (hobby loss) analysis:\n` +
      `- Burden on taxpayer to establish profit motive\n` +
      `- 9 factors under Reg 1.183-2(b)\n` +
      `- Safe harbor: 3 profit years in 5 creates presumption`;
  }

  if (issue.category === 'income' && issue.title.includes('Unreported')) {
    // Unreported income - different standard
    holder = 'irs';
    standard = 'Some evidence (Bank Deposits Method)';
    analysis = `For unreported income cases, IRS must establish:\n` +
      `1. Taxpayer had unreported income (some evidence)\n` +
      `2. Once established, burden shifts to taxpayer to rebut`;
  }

  return {
    holder,
    standard,
    analysis,
    confidence: 0.85,
    shift_available: shiftAvailable,
    shift_requirements: shiftRequirements,
  };
}
