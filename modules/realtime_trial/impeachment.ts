/**
 * Impeachment Detection and Actions
 * Identifies contradictions and generates impeachment strategies
 */

import { TestimonyEvent, TrialAction, Finding } from '../../core/types';
import { generateId } from '../../core/normalize';

// ============================================================================
// CONTRADICTION DETECTION
// ============================================================================

export interface Contradiction {
  statement: string;
  contradicts: string;
  evidence_ref: string;
  contradiction_type: 'direct' | 'inconsistent' | 'omission';
  strength: 'strong' | 'moderate' | 'weak';
}

export function detectContradictions(
  event: TestimonyEvent,
  priorFindings: Finding[],
  priorContradictions: { statement: string; contradicts: string; evidence_ref: string; exploited: boolean }[]
): Contradiction[] {
  const contradictions: Contradiction[] = [];
  const eventText = event.text.toLowerCase();

  // Check against prior findings
  priorFindings.forEach(finding => {
    // Look for direct contradictions
    const findingKeywords = extractKeywords(finding.description);

    findingKeywords.forEach(keyword => {
      // Check for denial patterns
      if (eventText.includes(`not ${keyword}`) ||
          eventText.includes(`never ${keyword}`) ||
          eventText.includes(`didn't ${keyword}`) ||
          eventText.includes(`did not ${keyword}`)) {

        // Verify finding actually contains the positive assertion
        if (finding.description.toLowerCase().includes(keyword) &&
            !finding.description.toLowerCase().includes('not ')) {

          contradictions.push({
            statement: event.text,
            contradicts: `Finding ${finding.id}: ${finding.title}`,
            evidence_ref: finding.evidence_refs[0] || finding.id,
            contradiction_type: 'direct',
            strength: finding.confidence > 0.7 ? 'strong' : 'moderate',
          });
        }
      }
    });

    // Check for inconsistent amounts
    const amountPattern = /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars|USD)/gi;
    const eventAmounts = eventText.match(amountPattern) || [];
    const findingAmounts = finding.description.match(amountPattern) || [];

    if (eventAmounts.length > 0 && findingAmounts.length > 0) {
      const eventAmt = parseAmount(eventAmounts[0]);
      const findingAmt = parseAmount(findingAmounts[0]);

      if (eventAmt && findingAmt && Math.abs(eventAmt - findingAmt) / findingAmt > 0.2) {
        contradictions.push({
          statement: event.text,
          contradicts: `Amount discrepancy in ${finding.id}: stated $${eventAmt.toLocaleString()} vs finding $${findingAmt.toLocaleString()}`,
          evidence_ref: finding.evidence_refs[0] || finding.id,
          contradiction_type: 'inconsistent',
          strength: Math.abs(eventAmt - findingAmt) / findingAmt > 0.5 ? 'strong' : 'moderate',
        });
      }
    }

    // Check for date inconsistencies
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4}/gi;
    const eventDates = eventText.match(datePattern) || [];
    const findingDates = finding.description.match(datePattern) || [];

    if (eventDates.length > 0 && findingDates.length > 0) {
      // Simple date comparison - could be enhanced
      if (eventDates[0] !== findingDates[0]) {
        contradictions.push({
          statement: event.text,
          contradicts: `Date discrepancy in ${finding.id}`,
          evidence_ref: finding.evidence_refs[0] || finding.id,
          contradiction_type: 'inconsistent',
          strength: 'moderate',
        });
      }
    }
  });

  // Check against prior testimony (within same session)
  // This would require maintaining a transcript, simplified here

  return contradictions;
}

function extractKeywords(text: string): string[] {
  // Extract meaningful keywords for contradiction detection
  const stopWords = new Set(['the', 'a', 'an', 'is', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those']);

  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
}

function parseAmount(amountStr: string): number | null {
  const cleaned = amountStr.replace(/[$,]/g, '').replace(/\s*(dollars|USD)/i, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// ============================================================================
// IMPEACHMENT ACTION GENERATION
// ============================================================================

export function generateImpeachmentActions(
  contradictions: Contradiction[],
  event: TestimonyEvent
): TrialAction[] {
  const actions: TrialAction[] = [];

  contradictions.forEach(contradiction => {
    const priority = contradiction.strength === 'strong' ? 'P0' : 'P1';

    if (contradiction.contradiction_type === 'direct') {
      actions.push({
        priority,
        type: 'impeachment',
        target: event.speaker_name,
        suggested_language: generateImpeachmentLanguage(contradiction, event),
        rationale: `Witness testimony directly contradicts documented evidence in ${contradiction.evidence_ref}`,
        evidence_refs: [contradiction.evidence_ref],
        risk_tradeoff: 'May damage rapport with jury if handled aggressively; recommend measured approach',
        confidence: contradiction.strength === 'strong' ? 0.85 : 0.65,
      });
    } else if (contradiction.contradiction_type === 'inconsistent') {
      actions.push({
        priority: 'P1',
        type: 'impeachment',
        target: event.speaker_name,
        suggested_language: `Your testimony today states [X]. However, [exhibit/prior statement] indicates [Y]. Can you explain this discrepancy?`,
        rationale: `Inconsistency between current testimony and ${contradiction.contradicts}`,
        evidence_refs: [contradiction.evidence_ref],
        risk_tradeoff: 'Witness may have reasonable explanation; be prepared for clarification',
        confidence: 0.6,
      });
    }
  });

  return actions;
}

function generateImpeachmentLanguage(contradiction: Contradiction, event: TestimonyEvent): string {
  const witnessName = event.speaker_name.split(' ').pop();  // Last name

  return `${witnessName}, you just testified that "${truncate(contradiction.statement, 50)}." ` +
    `I'd like to direct your attention to [EXHIBIT], which shows ${truncate(contradiction.contradicts, 50)}. ` +
    `Were you being truthful in your testimony just now?`;
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

// ============================================================================
// PRIOR STATEMENT ANALYSIS
// ============================================================================

export interface PriorStatement {
  source: string;  // deposition, interview, email, etc.
  date: string;
  content: string;
  speaker: string;
}

export function compareWithPriorStatements(
  currentTestimony: TestimonyEvent,
  priorStatements: PriorStatement[]
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  const currentLower = currentTestimony.text.toLowerCase();

  priorStatements
    .filter(ps => ps.speaker.toLowerCase() === currentTestimony.speaker_name.toLowerCase())
    .forEach(priorStatement => {
      const priorLower = priorStatement.content.toLowerCase();

      // Check for "I don't recall" when prior statement shows knowledge
      if (currentLower.includes("don't recall") ||
          currentLower.includes("do not recall") ||
          currentLower.includes("don't remember") ||
          currentLower.includes("cannot recall")) {

        // Check if prior statement has specific details on same topic
        const topicKeywords = currentTestimony.topic_tags;

        topicKeywords.forEach(topic => {
          if (priorLower.includes(topic) &&
              !priorLower.includes("don't recall") &&
              !priorLower.includes("do not recall")) {

            contradictions.push({
              statement: currentTestimony.text,
              contradicts: `Prior ${priorStatement.source} (${priorStatement.date}): "${truncate(priorStatement.content, 100)}"`,
              evidence_ref: `${priorStatement.source}-${priorStatement.date}`,
              contradiction_type: 'inconsistent',
              strength: 'moderate',
            });
          }
        });
      }

      // Check for direct contradictions using negation detection
      const priorKeyPhrases = extractKeyPhrases(priorStatement.content);

      priorKeyPhrases.forEach(phrase => {
        if (currentLower.includes(`not ${phrase}`) ||
            currentLower.includes(`never ${phrase}`) ||
            currentLower.includes(`didn't ${phrase}`)) {

          if (priorLower.includes(phrase) && !priorLower.includes(`not ${phrase}`)) {
            contradictions.push({
              statement: currentTestimony.text,
              contradicts: `Prior ${priorStatement.source}: claimed "${phrase}"`,
              evidence_ref: `${priorStatement.source}-${priorStatement.date}`,
              contradiction_type: 'direct',
              strength: 'strong',
            });
          }
        }
      });
    });

  return contradictions;
}

function extractKeyPhrases(text: string): string[] {
  // Simple phrase extraction - could use NLP for better results
  const phrases: string[] = [];
  const words = text.toLowerCase().split(/\s+/);

  // Extract 2-3 word phrases
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
    if (i < words.length - 2) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }

  return phrases.filter(p => p.length > 5);
}
