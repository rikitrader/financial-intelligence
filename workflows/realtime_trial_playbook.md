# Real-Time Trial Response Playbook

Guide for using the Real-Time Trial Response Module during live proceedings.

---

## Overview

The Real-Time Trial Response Module provides live analysis of testimony to:
- Track trial momentum
- Detect contradictions with prior statements/evidence
- Suggest impeachment opportunities
- Map potential objections
- Adjust strategy dynamically

**Important**: All outputs are strategy suggestions, not legal advice.

---

## Pre-Trial Setup

### 1. Data Preparation

Before trial, ensure these are loaded:
- All prior findings from investigation
- Deposition transcripts (if available)
- Key exhibits indexed
- Witness prior statements

### 2. Configuration

Create a configuration for the case:

```json
{
  "matter_id": "CASE-2024-001",
  "posture": "plaintiff|defendant",
  "strategy": {
    "posture": "aggressive|balanced|defensive",
    "risk_tolerance": "low|medium|high",
    "priorities": ["credibility", "narrative", "evidence", "impeachment"]
  },
  "key_themes": ["fraud", "breach", "damages"],
  "witnesses": [
    {
      "name": "John Smith",
      "role": "adverse",
      "key_topics": ["revenue", "contracts"],
      "prior_statements": ["depo_smith.json"]
    }
  ]
}
```

### 3. Initialize Session

```bash
npx ts-node cli.ts \
  --mode live \
  --testimonyStream ./testimony_stream.jsonl \
  --stateFile .trial_state.json \
  --outputDir ./trial_output \
  --pollIntervalSeconds 10
```

---

## During Trial

### Input Format

Testimony events are recorded in JSON Lines format:

```json
{
  "timestamp": "2024-02-15T09:32:10Z",
  "speaker_role": "witness",
  "speaker_name": "John Smith",
  "phase": "direct",
  "text": "I never saw those documents before today.",
  "exhibit_refs": ["EX-101"],
  "topic_tags": ["documents", "knowledge"],
  "credibility_signal": "neutral"
}
```

### Field Definitions

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| timestamp | Yes | ISO 8601 | When statement occurred |
| speaker_role | Yes | witness, attorney, judge | Who is speaking |
| speaker_name | Yes | string | Name of speaker |
| phase | Yes | direct, cross, redirect, recross, opening, closing, sidebar | Trial phase |
| text | Yes | string | Transcript chunk |
| exhibit_refs | No | string[] | Referenced exhibits |
| topic_tags | No | string[] | Subject matter tags |
| credibility_signal | Yes | neutral, helpful, harmful | Impact on our case |

### Credibility Signal Guide

| Signal | When to Use |
|--------|-------------|
| `helpful` | Testimony supports our position, witness admits favorable facts |
| `harmful` | Testimony damages our position, unfavorable admissions |
| `neutral` | Background information, no clear impact |

---

## Action Types

### Impeachment

Triggered when: Contradiction detected with prior statements or evidence

```json
{
  "priority": "P0",
  "type": "impeachment",
  "target": "John Smith",
  "suggested_language": "Mr. Smith, you just testified... but Exhibit 101 shows...",
  "rationale": "Direct contradiction with documentary evidence",
  "evidence_refs": ["EX-101"],
  "risk_tradeoff": "Strong foundation, low risk",
  "confidence": 0.85
}
```

**Usage**: Use during cross-examination. Ensure exhibit is admitted before impeaching.

### Objection

Triggered when: Objectionable question/testimony patterns detected

```json
{
  "priority": "P1",
  "type": "objection",
  "target": "hearsay",
  "suggested_language": "Objection, hearsay.",
  "rationale": "Witness testifying to out-of-court statement",
  "evidence_refs": [],
  "risk_tradeoff": "Standard objection, may have exceptions",
  "confidence": 0.65
}
```

**Common Objection Types**:
- `hearsay` - FRE 802
- `speculation` - FRE 602
- `leading` - FRE 611(c)
- `relevance` - FRE 401/402
- `compound` - Multiple questions
- `argumentative` - Arguing vs. asking
- `narrative` - Calls for narrative response

### Exhibit

Triggered when: Opportunity to introduce/highlight exhibit

```json
{
  "priority": "P1",
  "type": "exhibit",
  "target": "EX-101",
  "suggested_language": "Direct witness attention to Exhibit 101",
  "rationale": "Documentary evidence supports current testimony theme",
  "evidence_refs": ["EX-101"],
  "risk_tradeoff": "Ensure proper foundation before introducing",
  "confidence": 0.70
}
```

### Reframe

Triggered when: Opportunity to redirect narrative

```json
{
  "priority": "P2",
  "type": "reframe",
  "target": "narrative",
  "suggested_language": "Emphasize favorable testimony for closing",
  "rationale": "Helpful admission should be locked in",
  "evidence_refs": [],
  "risk_tradeoff": "Over-emphasis may alert witness",
  "confidence": 0.65
}
```

### Concession

Triggered when: Strategic retreat may strengthen overall position

```json
{
  "priority": "P2",
  "type": "concession",
  "target": "minor_point",
  "suggested_language": "Consider conceding to preserve credibility",
  "rationale": "Weak position on this point; fighting hurts credibility",
  "evidence_refs": [],
  "risk_tradeoff": "Concession admits weakness",
  "confidence": 0.50
}
```

### Sidebar Request

Triggered when: Complex issue requires off-record discussion

```json
{
  "priority": "P1",
  "type": "sidebar_request",
  "target": "court",
  "suggested_language": "Your Honor, may we approach?",
  "rationale": "Jury prejudice concern requires sidebar",
  "evidence_refs": [],
  "risk_tradeoff": "Interrupts flow but may be necessary",
  "confidence": 0.70
}
```

---

## Priority Levels

| Priority | Meaning | Response Time |
|----------|---------|---------------|
| P0 | Immediate action required | Now |
| P1 | High priority, act soon | Within current examination |
| P2 | Consider when opportunity arises | When convenient |

---

## Dashboard Interpretation

### Momentum Score (0-100)

| Range | Meaning | Action |
|-------|---------|--------|
| 80-100 | Strong advantage | Press advantage |
| 60-79 | Favorable position | Maintain momentum |
| 40-59 | Neutral | Look for opportunities |
| 20-39 | Unfavorable | Recovery strategies |
| 0-19 | Critical | Damage control |

### Momentum Trend

| Trend | Meaning |
|-------|---------|
| Improving | Recent events favor us |
| Stable | No significant shift |
| Declining | Recent events hurt us |

### Score Components

- **Cross-Exam Vulnerability**: How exposed are we to impeachment?
- **Jury Persuasion**: How compelling is our narrative?
- **Settlement Leverage**: How strong is our negotiating position?

---

## End of Day Procedures

1. **Save State**
   ```bash
   # State auto-saves, but verify
   cat .trial_state.json | jq '.events_processed, .momentum_score'
   ```

2. **Review Dashboard**
   - Export `realtime_trial_dashboard.md`
   - Note unexploited contradictions
   - Review pending actions

3. **Prepare for Tomorrow**
   - Address unexploited contradictions
   - Adjust strategy based on momentum
   - Update witness preparation

4. **Strategy Adjustments**
   - If momentum < 50: Prepare rehabilitation
   - If contradictions > 3: Prioritize impeachment
   - If declining trend: Consider witness order changes

---

## Troubleshooting

### No Events Processing
```bash
# Check file format
head -1 testimony_stream.jsonl | jq .

# Verify JSON Lines format
wc -l testimony_stream.jsonl
```

### State File Corruption
```bash
# Start fresh
rm .trial_state.json
# Restart CLI
```

### High Memory Usage
```bash
# Process in smaller batches
# Limit poll interval
--pollIntervalSeconds 30
```

---

## Best Practices

1. **Real-Time Input**: Have dedicated person entering testimony events
2. **Credibility Signals**: Be consistent in applying helpful/harmful labels
3. **Topic Tags**: Use consistent vocabulary across trial
4. **Action Review**: Not all suggestions should be acted upon - use judgment
5. **State Backup**: Periodically backup state file

---

## Safety Reminders

- All outputs are suggestions, not legal advice
- Impeachment claims require evidence citations
- Do not fabricate testimony or evidence
- Attorney judgment supersedes all suggestions
- System cannot replace trial experience

---

*This playbook provides operational guidance for the Real-Time Trial Response Module.*
