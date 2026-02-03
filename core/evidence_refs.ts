/**
 * Evidence Reference Management
 * Handles creation, linking, and chain of custody for all evidence
 */

import {
  EvidenceRef,
  ChainOfCustodyEvent,
  Finding,
  Transaction,
  LedgerEntry,
} from './types';
import { generateId, hashData, createCustodyEvent } from './normalize';

// ============================================================================
// EVIDENCE REF STORE
// ============================================================================

export class EvidenceStore {
  private refs: Map<string, EvidenceRef> = new Map();
  private bySource: Map<string, Set<string>> = new Map();  // source_file -> ref IDs
  private byCanonical: Map<string, string> = new Map();  // canonical_id -> ref ID

  add(ref: EvidenceRef): void {
    this.refs.set(ref.id, ref);

    // Index by source file
    const sourceRefs = this.bySource.get(ref.source_file) || new Set();
    sourceRefs.add(ref.id);
    this.bySource.set(ref.source_file, sourceRefs);

    // Index by canonical ID
    this.byCanonical.set(ref.canonical_id, ref.id);
  }

  get(id: string): EvidenceRef | undefined {
    return this.refs.get(id);
  }

  getByCanonical(canonicalId: string): EvidenceRef | undefined {
    const refId = this.byCanonical.get(canonicalId);
    return refId ? this.refs.get(refId) : undefined;
  }

  getBySource(sourceFile: string): EvidenceRef[] {
    const refIds = this.bySource.get(sourceFile);
    if (!refIds) return [];
    return Array.from(refIds).map(id => this.refs.get(id)!).filter(Boolean);
  }

  getAll(): EvidenceRef[] {
    return Array.from(this.refs.values());
  }

  addCustodyEvent(refId: string, event: ChainOfCustodyEvent): void {
    const ref = this.refs.get(refId);
    if (ref) {
      ref.chain_of_custody.push(event);
    }
  }

  toMap(): Map<string, EvidenceRef> {
    return new Map(this.refs);
  }

  fromArray(refs: EvidenceRef[]): void {
    refs.forEach(ref => this.add(ref));
  }

  size(): number {
    return this.refs.size;
  }
}

// ============================================================================
// EVIDENCE REF CREATION
// ============================================================================

export function createEvidenceRef(
  type: EvidenceRef['type'],
  sourceFile: string,
  sourceRowId: string | number,
  canonicalId: string,
  description: string,
  actor: string,
  rawData?: string
): EvidenceRef {
  const hash = rawData ? hashData(rawData) : hashData(`${sourceFile}:${sourceRowId}`);

  return {
    id: generateId('EVD'),
    type,
    source_file: sourceFile,
    source_row_id: sourceRowId,
    canonical_id: canonicalId,
    description,
    hash,
    chain_of_custody: [
      createCustodyEvent(actor, 'acquired', hash, undefined, `Created evidence reference for ${type}`),
    ],
  };
}

// ============================================================================
// EVIDENCE LINKING
// ============================================================================

export interface EvidenceLink {
  from_ref_id: string;
  to_ref_id: string;
  relationship: 'derived_from' | 'corroborates' | 'contradicts' | 'related_to';
  strength: number;  // 0-1
  notes?: string;
}

export class EvidenceLinker {
  private links: EvidenceLink[] = [];
  private byRef: Map<string, EvidenceLink[]> = new Map();

  addLink(link: EvidenceLink): void {
    this.links.push(link);

    // Index by both refs
    const fromLinks = this.byRef.get(link.from_ref_id) || [];
    fromLinks.push(link);
    this.byRef.set(link.from_ref_id, fromLinks);

    const toLinks = this.byRef.get(link.to_ref_id) || [];
    toLinks.push(link);
    this.byRef.set(link.to_ref_id, toLinks);
  }

  getLinksFor(refId: string): EvidenceLink[] {
    return this.byRef.get(refId) || [];
  }

  getCorroborating(refId: string): string[] {
    return this.getLinksFor(refId)
      .filter(l => l.relationship === 'corroborates')
      .map(l => l.from_ref_id === refId ? l.to_ref_id : l.from_ref_id);
  }

  getContradicting(refId: string): string[] {
    return this.getLinksFor(refId)
      .filter(l => l.relationship === 'contradicts')
      .map(l => l.from_ref_id === refId ? l.to_ref_id : l.from_ref_id);
  }

  getAllLinks(): EvidenceLink[] {
    return [...this.links];
  }
}

// ============================================================================
// EVIDENCE VALIDATION
// ============================================================================

export interface EvidenceValidationResult {
  valid: boolean;
  issues: {
    severity: 'error' | 'warning';
    refId: string;
    message: string;
  }[];
  coverage: {
    total_refs: number;
    with_hash: number;
    with_custody: number;
    custody_complete: number;
  };
}

export function validateEvidenceIntegrity(
  store: EvidenceStore,
  findings: Finding[]
): EvidenceValidationResult {
  const issues: EvidenceValidationResult['issues'] = [];
  const refs = store.getAll();

  let withHash = 0;
  let withCustody = 0;
  let custodyComplete = 0;

  refs.forEach(ref => {
    // Check hash presence
    if (ref.hash) {
      withHash++;
    } else {
      issues.push({
        severity: 'warning',
        refId: ref.id,
        message: 'Evidence reference missing hash',
      });
    }

    // Check chain of custody
    if (ref.chain_of_custody.length > 0) {
      withCustody++;

      // Check custody completeness
      const hasAcquired = ref.chain_of_custody.some(e => e.action === 'acquired');
      if (hasAcquired) {
        custodyComplete++;
      } else {
        issues.push({
          severity: 'warning',
          refId: ref.id,
          message: 'Chain of custody missing acquisition event',
        });
      }
    } else {
      issues.push({
        severity: 'error',
        refId: ref.id,
        message: 'Evidence reference has no chain of custody',
      });
    }
  });

  // Validate finding evidence refs exist
  findings.forEach(finding => {
    finding.evidence_refs.forEach(refId => {
      if (!store.get(refId)) {
        issues.push({
          severity: 'error',
          refId,
          message: `Finding ${finding.id} references non-existent evidence: ${refId}`,
        });
      }
    });
  });

  return {
    valid: !issues.some(i => i.severity === 'error'),
    issues,
    coverage: {
      total_refs: refs.length,
      with_hash: withHash,
      with_custody: withCustody,
      custody_complete: custodyComplete,
    },
  };
}

// ============================================================================
// EVIDENCE EXPORT
// ============================================================================

export interface EvidenceExport {
  exported_at: string;
  exported_by: string;
  total_refs: number;
  refs: EvidenceRef[];
  links: EvidenceLink[];
  validation: EvidenceValidationResult;
}

export function exportEvidence(
  store: EvidenceStore,
  linker: EvidenceLinker,
  findings: Finding[],
  actor: string
): EvidenceExport {
  const refs = store.getAll();

  // Add export custody event to all refs
  refs.forEach(ref => {
    ref.chain_of_custody.push(
      createCustodyEvent(actor, 'exported', ref.hash || '', undefined, 'Exported for report generation')
    );
  });

  return {
    exported_at: new Date().toISOString(),
    exported_by: actor,
    total_refs: refs.length,
    refs,
    links: linker.getAllLinks(),
    validation: validateEvidenceIntegrity(store, findings),
  };
}

// ============================================================================
// CITATION FORMATTING
// ============================================================================

export function formatCitation(ref: EvidenceRef, style: 'short' | 'full' = 'short'): string {
  if (style === 'short') {
    return `[${ref.id}]`;
  }

  const parts = [
    ref.type.toUpperCase(),
    ref.source_file,
    `row ${ref.source_row_id}`,
  ];

  if (ref.description) {
    parts.push(`"${ref.description.substring(0, 50)}${ref.description.length > 50 ? '...' : ''}"`);
  }

  return `[${ref.id}: ${parts.join(', ')}]`;
}

export function formatCitations(refIds: string[], store: EvidenceStore, style: 'short' | 'full' = 'short'): string {
  const formatted = refIds
    .map(id => store.get(id))
    .filter(Boolean)
    .map(ref => formatCitation(ref!, style));

  return formatted.join('; ');
}

// ============================================================================
// EVIDENCE SEARCH
// ============================================================================

export function searchEvidence(
  store: EvidenceStore,
  query: {
    type?: EvidenceRef['type'];
    sourceFile?: string;
    dateRange?: { start: string; end: string };
    descriptionContains?: string;
  }
): EvidenceRef[] {
  let results = store.getAll();

  if (query.type) {
    results = results.filter(r => r.type === query.type);
  }

  if (query.sourceFile) {
    results = results.filter(r => r.source_file === query.sourceFile);
  }

  if (query.descriptionContains) {
    const lower = query.descriptionContains.toLowerCase();
    results = results.filter(r => r.description.toLowerCase().includes(lower));
  }

  if (query.dateRange) {
    results = results.filter(r => {
      const acquired = r.chain_of_custody.find(e => e.action === 'acquired');
      if (!acquired) return true;
      const date = acquired.timestamp.split('T')[0];
      return date >= query.dateRange!.start && date <= query.dateRange!.end;
    });
  }

  return results;
}

// ============================================================================
// EVIDENCE SUMMARY
// ============================================================================

export interface EvidenceSummary {
  total: number;
  by_type: Record<EvidenceRef['type'], number>;
  by_source: Record<string, number>;
  integrity: {
    with_hash: number;
    complete_custody: number;
  };
}

export function summarizeEvidence(store: EvidenceStore): EvidenceSummary {
  const refs = store.getAll();

  const byType: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let withHash = 0;
  let completeCustody = 0;

  refs.forEach(ref => {
    byType[ref.type] = (byType[ref.type] || 0) + 1;
    bySource[ref.source_file] = (bySource[ref.source_file] || 0) + 1;

    if (ref.hash) withHash++;
    if (ref.chain_of_custody.some(e => e.action === 'acquired')) completeCustody++;
  });

  return {
    total: refs.length,
    by_type: byType as Record<EvidenceRef['type'], number>,
    by_source: bySource,
    integrity: {
      with_hash: withHash,
      complete_custody: completeCustody,
    },
  };
}
