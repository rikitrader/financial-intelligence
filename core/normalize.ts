/**
 * Data Normalization Module
 * Transforms raw input data into canonical schema format
 */

import * as crypto from 'crypto';
import {
  Transaction,
  LedgerEntry,
  Entity,
  Account,
  EvidenceRef,
  ChainOfCustodyEvent,
} from './types';

// ============================================================================
// ID GENERATION
// ============================================================================

let idCounters: Record<string, number> = {};

export function generateId(prefix: string): string {
  if (!idCounters[prefix]) {
    idCounters[prefix] = 0;
  }
  idCounters[prefix]++;
  const suffix = idCounters[prefix].toString(36).toUpperCase().padStart(8, '0');
  return `${prefix}-${suffix}`;
}

export function resetIdCounters(): void {
  idCounters = {};
}

// ============================================================================
// HASHING
// ============================================================================

export function hashData(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function hashRow(row: Record<string, unknown>): string {
  const normalized = JSON.stringify(row, Object.keys(row).sort());
  return hashData(normalized);
}

// ============================================================================
// CHAIN OF CUSTODY
// ============================================================================

export function createCustodyEvent(
  actor: string,
  action: ChainOfCustodyEvent['action'],
  sourceHash: string,
  resultHash?: string,
  notes?: string
): ChainOfCustodyEvent {
  return {
    timestamp: new Date().toISOString(),
    actor,
    action,
    source_hash: sourceHash,
    result_hash: resultHash,
    tool_version: '1.0.0',
    notes,
  };
}

// ============================================================================
// STRING NORMALIZATION
// ============================================================================

export function normalizeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function normalizeUpperCase(value: unknown): string {
  return normalizeString(value).toUpperCase();
}

export function normalizeLowerCase(value: unknown): string {
  return normalizeString(value).toLowerCase();
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

// ============================================================================
// NUMBER NORMALIZATION
// ============================================================================

export function normalizeAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return 0;

  let str = String(value).trim();

  // Handle accounting format (1,234.56) or (1234.56) for negatives
  const isNegative = str.startsWith('(') && str.endsWith(')');
  if (isNegative) {
    str = str.slice(1, -1);
  }

  // Handle explicit negative sign
  const hasNegativeSign = str.startsWith('-');
  if (hasNegativeSign) {
    str = str.slice(1);
  }

  // Remove currency symbols and thousands separators
  str = str.replace(/[$€£¥,]/g, '');

  // Handle European format (1.234,56 -> 1234.56)
  if (str.includes(',') && str.lastIndexOf(',') > str.lastIndexOf('.')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }

  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  return (isNegative || hasNegativeSign) ? -num : num;
}

export function normalizePercentage(value: unknown): number {
  if (typeof value === 'number') {
    return value > 1 ? value / 100 : value;
  }
  const str = normalizeString(value).replace('%', '');
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return num > 1 ? num / 100 : num;
}

// ============================================================================
// DATE NORMALIZATION
// ============================================================================

const DATE_FORMATS = [
  /^(\d{4})-(\d{2})-(\d{2})$/,  // YYYY-MM-DD
  /^(\d{2})\/(\d{2})\/(\d{4})$/,  // MM/DD/YYYY
  /^(\d{2})-(\d{2})-(\d{4})$/,  // MM-DD-YYYY
  /^(\d{2})\/(\d{2})\/(\d{2})$/,  // MM/DD/YY
  /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // M/D/YYYY
];

export function normalizeDate(value: unknown): string | null {
  if (!value) return null;

  const str = normalizeString(value);
  if (!str) return null;

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const date = new Date(str);
    if (!isNaN(date.getTime())) return str;
  }

  // Try MM/DD/YYYY
  let match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  // Try MM/DD/YY
  match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (match) {
    const [, month, day, year] = match;
    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  // Try parsing as Date
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return null;
}

export function normalizePeriod(date: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ============================================================================
// CURRENCY NORMALIZATION
// ============================================================================

const CURRENCY_ALIASES: Record<string, string> = {
  'DOLLAR': 'USD',
  'DOLLARS': 'USD',
  '$': 'USD',
  'US$': 'USD',
  'EURO': 'EUR',
  'EUROS': 'EUR',
  '€': 'EUR',
  'POUND': 'GBP',
  'POUNDS': 'GBP',
  '£': 'GBP',
  'YEN': 'JPY',
  '¥': 'JPY',
};

export function normalizeCurrency(value: unknown): string {
  const str = normalizeUpperCase(value);
  if (CURRENCY_ALIASES[str]) return CURRENCY_ALIASES[str];
  if (/^[A-Z]{3}$/.test(str)) return str;
  return 'USD';  // Default
}

// ============================================================================
// ACCOUNT TYPE NORMALIZATION
// ============================================================================

const ACCOUNT_TYPE_PATTERNS: Record<string, RegExp[]> = {
  asset: [/^1\d{3}$/, /asset/i, /cash/i, /bank/i, /receivable/i, /inventory/i, /prepaid/i],
  liability: [/^2\d{3}$/, /liability/i, /payable/i, /accrued/i, /deferred/i],
  equity: [/^3\d{3}$/, /equity/i, /capital/i, /retained/i, /drawing/i],
  revenue: [/^4\d{3}$/, /revenue/i, /income/i, /sales/i],
  expense: [/^[5-9]\d{3}$/, /expense/i, /cost/i, /salary/i, /rent/i, /utility/i],
};

export function normalizeAccountType(
  accountNumber: string,
  accountName: string
): 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'unknown' {
  for (const [type, patterns] of Object.entries(ACCOUNT_TYPE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(accountNumber) || pattern.test(accountName)) {
        return type as any;
      }
    }
  }
  return 'unknown';
}

// ============================================================================
// TRANSACTION DIRECTION
// ============================================================================

export function inferDirection(
  description: string,
  amount: number,
  accountType?: string
): 'debit' | 'credit' | 'unknown' {
  const desc = description.toLowerCase();

  // Explicit indicators
  if (/\bdebit\b|\bdr\b|\bwithdraw/i.test(desc)) return 'debit';
  if (/\bcredit\b|\bcr\b|\bdeposit/i.test(desc)) return 'credit';

  // Amount sign-based
  if (amount < 0) return 'credit';
  if (amount > 0) return 'debit';

  return 'unknown';
}

// ============================================================================
// TRANSACTION METHOD
// ============================================================================

export function inferMethod(description: string): Transaction['method'] {
  const desc = description.toLowerCase();

  if (/wire|swift|fedwire|telex/i.test(desc)) return 'wire';
  if (/ach|direct.?deposit|electronic/i.test(desc)) return 'ach';
  if (/check|cheque|chk/i.test(desc)) return 'check';
  if (/cash|atm/i.test(desc)) return 'cash';
  if (/card|visa|mastercard|amex|debit.?card/i.test(desc)) return 'card';
  if (/journal|je|entry|adjustment/i.test(desc)) return 'journal';
  if (/transfer|xfer|internal/i.test(desc)) return 'internal';

  return 'unknown';
}

// ============================================================================
// CSV PARSING
// ============================================================================

export interface CsvRow {
  [key: string]: string;
}

export function parseCSV(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: CsvRow = {};

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }

    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

// ============================================================================
// BANK TRANSACTION NORMALIZATION
// ============================================================================

export interface RawBankTransaction {
  date?: string;
  transaction_date?: string;
  post_date?: string;
  amount?: string | number;
  debit?: string | number;
  credit?: string | number;
  description?: string;
  memo?: string;
  reference?: string;
  ref?: string;
  check_number?: string;
  [key: string]: unknown;
}

export function normalizeBankTransaction(
  raw: RawBankTransaction,
  sourceFile: string,
  rowIndex: number,
  actor: string
): { transaction: Transaction; evidenceRef: EvidenceRef } {
  const rawHash = hashRow(raw as Record<string, unknown>);

  const date = normalizeDate(raw.date || raw.transaction_date || raw.post_date) || new Date().toISOString().split('T')[0];

  // Handle separate debit/credit columns
  let amount: number;
  let direction: 'debit' | 'credit' | 'unknown';

  if (raw.debit !== undefined && raw.credit !== undefined) {
    const debitAmt = normalizeAmount(raw.debit);
    const creditAmt = normalizeAmount(raw.credit);
    if (debitAmt > 0) {
      amount = debitAmt;
      direction = 'debit';
    } else if (creditAmt > 0) {
      amount = creditAmt;
      direction = 'credit';
    } else {
      amount = 0;
      direction = 'unknown';
    }
  } else {
    amount = normalizeAmount(raw.amount);
    direction = inferDirection(raw.description || '', amount);
    amount = Math.abs(amount);
  }

  const description = normalizeWhitespace(normalizeString(raw.description || raw.memo || ''));
  const reference = normalizeString(raw.reference || raw.ref || raw.check_number || '');

  const canonicalId = generateId('TXN');
  const evidenceId = generateId('EVD');

  const transaction: Transaction = {
    id: canonicalId,
    transaction_date: date,
    posted_date: normalizeDate(raw.post_date) || undefined,
    amount,
    currency: 'USD',
    direction,
    method: inferMethod(description),
    description,
    reference_number: reference || undefined,
    source_row_id: rowIndex,
    source_file: sourceFile,
    canonical_id: canonicalId,
    risk_flags: [],
    evidence_refs: [evidenceId],
    metadata: {},
  };

  const evidenceRef: EvidenceRef = {
    id: evidenceId,
    type: 'bank_record',
    source_file: sourceFile,
    source_row_id: rowIndex,
    canonical_id: canonicalId,
    description: `Bank transaction: ${description.substring(0, 50)}`,
    hash: rawHash,
    chain_of_custody: [
      createCustodyEvent(actor, 'acquired', rawHash, undefined, `Imported from ${sourceFile} row ${rowIndex}`),
    ],
  };

  return { transaction, evidenceRef };
}

// ============================================================================
// GL ENTRY NORMALIZATION
// ============================================================================

export interface RawGLEntry {
  date?: string;
  entry_date?: string;
  posting_date?: string;
  period?: string;
  account?: string;
  account_number?: string;
  account_name?: string;
  debit?: string | number;
  credit?: string | number;
  amount?: string | number;
  description?: string;
  reference?: string;
  journal_id?: string;
  created_by?: string;
  [key: string]: unknown;
}

export function normalizeGLEntry(
  raw: RawGLEntry,
  sourceFile: string,
  rowIndex: number,
  actor: string
): { entry: LedgerEntry; evidenceRef: EvidenceRef } {
  const rawHash = hashRow(raw as Record<string, unknown>);

  const entryDate = normalizeDate(raw.date || raw.entry_date) || new Date().toISOString().split('T')[0];
  const postingDate = normalizeDate(raw.posting_date) || entryDate;
  const period = raw.period || normalizePeriod(postingDate);

  const accountNumber = normalizeString(raw.account || raw.account_number);
  const accountName = normalizeString(raw.account_name || '');

  let debitAmount: number | undefined;
  let creditAmount: number | undefined;

  if (raw.debit !== undefined || raw.credit !== undefined) {
    debitAmount = normalizeAmount(raw.debit) || undefined;
    creditAmount = normalizeAmount(raw.credit) || undefined;
  } else if (raw.amount !== undefined) {
    const amt = normalizeAmount(raw.amount);
    if (amt >= 0) {
      debitAmount = amt;
    } else {
      creditAmount = Math.abs(amt);
    }
  }

  const canonicalId = generateId('LED');
  const evidenceId = generateId('EVD');
  const accountId = `ACC-${hashData(accountNumber).substring(0, 8).toUpperCase()}`;

  const entry: LedgerEntry = {
    id: canonicalId,
    entry_date: entryDate,
    posting_date: postingDate,
    period,
    account_id: accountId,
    account_number: accountNumber,
    account_name: accountName,
    debit_amount: debitAmount,
    credit_amount: creditAmount,
    currency: 'USD',
    journal_id: normalizeString(raw.journal_id) || undefined,
    description: normalizeWhitespace(normalizeString(raw.description || '')),
    reference: normalizeString(raw.reference) || undefined,
    created_by: normalizeString(raw.created_by) || undefined,
    source_row_id: rowIndex,
    source_file: sourceFile,
    canonical_id: canonicalId,
    risk_flags: [],
    evidence_refs: [evidenceId],
    metadata: {},
  };

  const evidenceRef: EvidenceRef = {
    id: evidenceId,
    type: 'ledger_entry',
    source_file: sourceFile,
    source_row_id: rowIndex,
    canonical_id: canonicalId,
    description: `GL entry: ${accountNumber} - ${entry.description.substring(0, 30)}`,
    hash: rawHash,
    chain_of_custody: [
      createCustodyEvent(actor, 'acquired', rawHash, undefined, `Imported from ${sourceFile} row ${rowIndex}`),
    ],
  };

  return { entry, evidenceRef };
}

// ============================================================================
// INVOICE NORMALIZATION
// ============================================================================

export interface RawInvoice {
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  vendor?: string;
  vendor_id?: string;
  vendor_name?: string;
  amount?: string | number;
  description?: string;
  po_number?: string;
  [key: string]: unknown;
}

export function normalizeInvoice(
  raw: RawInvoice,
  sourceFile: string,
  rowIndex: number,
  actor: string
): { transaction: Transaction; evidenceRef: EvidenceRef } {
  const rawHash = hashRow(raw as Record<string, unknown>);

  const invoiceDate = normalizeDate(raw.invoice_date) || new Date().toISOString().split('T')[0];
  const amount = Math.abs(normalizeAmount(raw.amount));
  const vendorName = normalizeString(raw.vendor || raw.vendor_name || 'Unknown Vendor');
  const invoiceNumber = normalizeString(raw.invoice_number || '');

  const canonicalId = generateId('TXN');
  const evidenceId = generateId('EVD');

  const transaction: Transaction = {
    id: canonicalId,
    transaction_date: invoiceDate,
    amount,
    currency: 'USD',
    direction: 'credit',
    method: 'unknown',
    description: `Invoice ${invoiceNumber} - ${vendorName}`,
    reference_number: invoiceNumber || undefined,
    memo: normalizeString(raw.description) || undefined,
    source_row_id: rowIndex,
    source_file: sourceFile,
    canonical_id: canonicalId,
    risk_flags: [],
    evidence_refs: [evidenceId],
    metadata: {
      vendor_id: normalizeString(raw.vendor_id),
      po_number: normalizeString(raw.po_number),
      due_date: normalizeDate(raw.due_date),
    },
  };

  const evidenceRef: EvidenceRef = {
    id: evidenceId,
    type: 'invoice',
    source_file: sourceFile,
    source_row_id: rowIndex,
    canonical_id: canonicalId,
    description: `Invoice: ${invoiceNumber} from ${vendorName}`,
    hash: rawHash,
    chain_of_custody: [
      createCustodyEvent(actor, 'acquired', rawHash, undefined, `Imported from ${sourceFile} row ${rowIndex}`),
    ],
  };

  return { transaction, evidenceRef };
}

// ============================================================================
// WIRE NORMALIZATION
// ============================================================================

export interface RawWire {
  date?: string;
  amount?: string | number;
  originator?: string;
  originator_account?: string;
  beneficiary?: string;
  beneficiary_account?: string;
  beneficiary_bank?: string;
  reference?: string;
  purpose?: string;
  [key: string]: unknown;
}

export function normalizeWire(
  raw: RawWire,
  sourceFile: string,
  rowIndex: number,
  actor: string
): { transaction: Transaction; evidenceRef: EvidenceRef } {
  const rawHash = hashRow(raw as Record<string, unknown>);

  const date = normalizeDate(raw.date) || new Date().toISOString().split('T')[0];
  const amount = Math.abs(normalizeAmount(raw.amount));

  const canonicalId = generateId('TXN');
  const evidenceId = generateId('EVD');

  const description = [
    normalizeString(raw.originator),
    '->',
    normalizeString(raw.beneficiary),
    normalizeString(raw.purpose) ? `(${normalizeString(raw.purpose)})` : '',
  ].filter(Boolean).join(' ');

  const transaction: Transaction = {
    id: canonicalId,
    transaction_date: date,
    amount,
    currency: 'USD',
    direction: 'debit',
    method: 'wire',
    description: normalizeWhitespace(description),
    reference_number: normalizeString(raw.reference) || undefined,
    source_row_id: rowIndex,
    source_file: sourceFile,
    canonical_id: canonicalId,
    risk_flags: [],
    evidence_refs: [evidenceId],
    metadata: {
      originator: normalizeString(raw.originator),
      originator_account: normalizeString(raw.originator_account),
      beneficiary: normalizeString(raw.beneficiary),
      beneficiary_account: normalizeString(raw.beneficiary_account),
      beneficiary_bank: normalizeString(raw.beneficiary_bank),
    },
  };

  const evidenceRef: EvidenceRef = {
    id: evidenceId,
    type: 'wire',
    source_file: sourceFile,
    source_row_id: rowIndex,
    canonical_id: canonicalId,
    description: `Wire: $${amount.toLocaleString()} to ${normalizeString(raw.beneficiary)}`,
    hash: rawHash,
    chain_of_custody: [
      createCustodyEvent(actor, 'acquired', rawHash, undefined, `Imported from ${sourceFile} row ${rowIndex}`),
    ],
  };

  return { transaction, evidenceRef };
}

// ============================================================================
// PAYROLL NORMALIZATION
// ============================================================================

export interface RawPayroll {
  pay_date?: string;
  employee_id?: string;
  employee_name?: string;
  department?: string;
  gross_pay?: string | number;
  net_pay?: string | number;
  taxes?: string | number;
  deductions?: string | number;
  hours?: string | number;
  rate?: string | number;
  [key: string]: unknown;
}

export function normalizePayroll(
  raw: RawPayroll,
  sourceFile: string,
  rowIndex: number,
  actor: string
): { transaction: Transaction; evidenceRef: EvidenceRef } {
  const rawHash = hashRow(raw as Record<string, unknown>);

  const payDate = normalizeDate(raw.pay_date) || new Date().toISOString().split('T')[0];
  const grossPay = normalizeAmount(raw.gross_pay);
  const netPay = normalizeAmount(raw.net_pay);
  const amount = grossPay || netPay;

  const employeeName = normalizeString(raw.employee_name || 'Unknown Employee');
  const employeeId = normalizeString(raw.employee_id || '');

  const canonicalId = generateId('TXN');
  const evidenceId = generateId('EVD');

  const transaction: Transaction = {
    id: canonicalId,
    transaction_date: payDate,
    amount,
    currency: 'USD',
    direction: 'debit',
    method: 'ach',
    category: 'payroll',
    description: `Payroll: ${employeeName}${employeeId ? ` (${employeeId})` : ''}`,
    source_row_id: rowIndex,
    source_file: sourceFile,
    canonical_id: canonicalId,
    risk_flags: [],
    evidence_refs: [evidenceId],
    metadata: {
      employee_id: employeeId,
      employee_name: employeeName,
      department: normalizeString(raw.department),
      gross_pay: grossPay,
      net_pay: netPay,
      taxes: normalizeAmount(raw.taxes),
      deductions: normalizeAmount(raw.deductions),
      hours: normalizeAmount(raw.hours),
      rate: normalizeAmount(raw.rate),
    },
  };

  const evidenceRef: EvidenceRef = {
    id: evidenceId,
    type: 'payroll',
    source_file: sourceFile,
    source_row_id: rowIndex,
    canonical_id: canonicalId,
    description: `Payroll: ${employeeName} - $${amount.toLocaleString()}`,
    hash: rawHash,
    chain_of_custody: [
      createCustodyEvent(actor, 'acquired', rawHash, undefined, `Imported from ${sourceFile} row ${rowIndex}`),
    ],
  };

  return { transaction, evidenceRef };
}
