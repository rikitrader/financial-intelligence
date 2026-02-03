#!/usr/bin/env npx ts-node
/**
 * Financial Intelligence CLI
 * Command-line interface for batch and live analysis modes
 */

import * as fs from 'fs';
import * as path from 'path';
import { runPipeline } from './workflows/pipeline';
import {
  loadPipelineConfig,
  createDefaultConfig,
  loadTestimonyStream,
  loadTrialState,
  saveTrialState,
  writeFile,
  writeJSON,
  ensureDirectory,
} from './core/io';
import {
  initializeTrialState,
  processLiveEvent,
  generateDashboard,
  generateActionsOutput,
} from './modules/realtime_trial';

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

interface CLIArgs {
  mode: 'batch' | 'live';
  inputDir?: string;
  outputDir?: string;
  config?: string;
  testimonyStream?: string;
  pollIntervalSeconds?: number;
  stateFile?: string;
  help?: boolean;
}

function parseArgs(args: string[]): CLIArgs {
  const result: CLIArgs = {
    mode: 'batch',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--mode':
        if (next === 'batch' || next === 'live') {
          result.mode = next;
        }
        i++;
        break;
      case '--inputDir':
      case '--input-dir':
        result.inputDir = next;
        i++;
        break;
      case '--outputDir':
      case '--output-dir':
        result.outputDir = next;
        i++;
        break;
      case '--config':
        result.config = next;
        i++;
        break;
      case '--testimonyStream':
      case '--testimony-stream':
        result.testimonyStream = next;
        i++;
        break;
      case '--pollIntervalSeconds':
      case '--poll-interval':
        result.pollIntervalSeconds = parseInt(next) || 10;
        i++;
        break;
      case '--stateFile':
      case '--state-file':
        result.stateFile = next;
        i++;
        break;
      case '--help':
      case '-h':
        result.help = true;
        break;
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
Financial Intelligence CLI
==========================

Usage:
  npx ts-node cli.ts [options]

Modes:
  --mode batch          Run full forensic analysis pipeline (default)
  --mode live           Run real-time trial response mode

Batch Mode Options:
  --inputDir <path>     Input directory containing data files
  --outputDir <path>    Output directory for reports
  --config <path>       Path to config.json file

Live Mode Options:
  --testimonyStream <path>    Path to testimony_stream.jsonl file
  --pollIntervalSeconds <n>   Polling interval for live updates (default: 10)
  --stateFile <path>          Path to persist trial state (default: .trial_state.json)
  --outputDir <path>          Output directory for dashboards

Examples:
  # Batch analysis
  npx ts-node cli.ts --mode batch --inputDir ./data --outputDir ./output

  # Live trial mode
  npx ts-node cli.ts --mode live --testimonyStream ./testimony.jsonl --outputDir ./output

  # With config file
  npx ts-node cli.ts --mode batch --config ./config.json

For more information, see README.md
`);
}

// ============================================================================
// BATCH MODE
// ============================================================================

async function runBatchMode(args: CLIArgs): Promise<void> {
  console.log('Financial Intelligence System - Batch Mode');
  console.log('==========================================\n');

  // Load or create config
  let config;
  if (args.config && fs.existsSync(args.config)) {
    console.log(`Loading config from ${args.config}`);
    config = loadPipelineConfig(args.config);
  } else {
    const inputDir = args.inputDir || './examples/sample_inputs';
    const outputDir = args.outputDir || './examples/sample_outputs';
    console.log(`Using default config with input: ${inputDir}, output: ${outputDir}`);
    config = createDefaultConfig('CLI-001', inputDir, outputDir);
  }

  // Override with CLI args if provided
  if (args.inputDir) config.input_dir = args.inputDir;
  if (args.outputDir) config.output_dir = args.outputDir;

  // Ensure output directory exists
  ensureDirectory(config.output_dir);

  console.log(`\nInput directory: ${config.input_dir}`);
  console.log(`Output directory: ${config.output_dir}`);
  console.log(`Period: ${config.matter.period_start} to ${config.matter.period_end}`);
  console.log(`Modules enabled: ${config.modules_enabled.length}\n`);

  // Run pipeline
  console.log('Starting analysis pipeline...\n');

  try {
    const result = await runPipeline(config);

    console.log('\n==========================================');
    console.log('ANALYSIS COMPLETE');
    console.log('==========================================\n');

    console.log(`Total findings: ${result.findings.length}`);
    console.log(`  - Critical: ${result.findings.filter(f => f.severity === 'critical').length}`);
    console.log(`  - High: ${result.findings.filter(f => f.severity === 'high').length}`);
    console.log(`  - Medium: ${result.findings.filter(f => f.severity === 'medium').length}`);
    console.log(`  - Low: ${result.findings.filter(f => f.severity === 'low').length}`);

    if (result.compositeScore) {
      console.log(`\nComposite Risk Score: ${result.compositeScore.value.toFixed(1)}/100`);
      console.log(`Confidence: ${(result.compositeScore.confidence * 100).toFixed(0)}%`);
    }

    console.log(`\nOutputs written to: ${config.output_dir}`);
    console.log('  - SUMMARY_REPORT.md');
    console.log('  - risk_report.json');
    console.log('  - fraud_findings.json');
    console.log('  - And more...');

    // Exit with appropriate code
    process.exit(result.errors.length > 0 ? 1 : 0);

  } catch (err) {
    console.error('\nPIPELINE ERROR:', (err as Error).message);
    process.exit(1);
  }
}

// ============================================================================
// LIVE MODE
// ============================================================================

async function runLiveMode(args: CLIArgs): Promise<void> {
  console.log('Financial Intelligence System - Live Trial Mode');
  console.log('================================================\n');

  if (!args.testimonyStream) {
    console.error('Error: --testimonyStream is required for live mode');
    process.exit(1);
  }

  const outputDir = args.outputDir || './examples/sample_outputs';
  const stateFile = args.stateFile || '.trial_state.json';
  const pollInterval = (args.pollIntervalSeconds || 10) * 1000;

  ensureDirectory(outputDir);

  // Load or initialize state
  let state = loadTrialState(stateFile);
  if (!state) {
    console.log('Initializing new trial state...');
    state = initializeTrialState();
  } else {
    console.log(`Resuming from state file (${state.events_processed} events processed)`);
  }

  console.log(`\nTestimony stream: ${args.testimonyStream}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`State file: ${stateFile}`);
  console.log(`Poll interval: ${pollInterval / 1000}s\n`);

  // Load testimony events
  let events = loadTestimonyStream(args.testimonyStream);
  console.log(`Loaded ${events.length} testimony events\n`);

  // Skip already processed events
  events = events.slice(state.events_processed);

  if (events.length === 0) {
    console.log('No new events to process.');
    console.log('Waiting for new events...\n');
  }

  // Process events
  console.log('Processing testimony stream...\n');
  console.log('Press Ctrl+C to stop\n');

  let eventIndex = 0;

  const processNextEvent = () => {
    if (eventIndex >= events.length) {
      // Check for new events
      const allEvents = loadTestimonyStream(args.testimonyStream);
      const newEvents = allEvents.slice(state!.events_processed);

      if (newEvents.length > 0) {
        events = newEvents;
        eventIndex = 0;
        console.log(`\n[${new Date().toISOString()}] ${newEvents.length} new event(s) detected\n`);
      } else {
        setTimeout(processNextEvent, pollInterval);
        return;
      }
    }

    const event = events[eventIndex];
    eventIndex++;

    // Process event
    const { updatedState, newActions, stateChanges } = processLiveEvent(
      event,
      state!,
      []  // Prior findings would be loaded in real implementation
    );

    state = updatedState;

    // Log progress
    const timestamp = event.timestamp.split('T')[1]?.substring(0, 8) || '';
    console.log(`[${timestamp}] ${event.speaker_role}: ${event.speaker_name}`);
    console.log(`  "${event.text.substring(0, 60)}${event.text.length > 60 ? '...' : ''}"`);

    if (stateChanges.length > 0) {
      console.log(`  Changes: ${stateChanges.join(', ')}`);
    }

    if (newActions.filter(a => a.priority === 'P0').length > 0) {
      console.log(`  ** ${newActions.filter(a => a.priority === 'P0').length} IMMEDIATE ACTION(S) **`);
    }

    console.log(`  Momentum: ${state.momentum_score} (${state.momentum_trend})`);
    console.log('');

    // Update outputs
    const dashboard = generateDashboard(state);
    writeFile(path.join(outputDir, 'realtime_trial_dashboard.md'), dashboard);

    const actionsOutput = generateActionsOutput(state, newActions);
    writeJSON(path.join(outputDir, 'realtime_trial_actions.json'), actionsOutput);

    // Save state
    saveTrialState(state, stateFile);

    // Schedule next event
    setTimeout(processNextEvent, pollInterval);
  };

  // Start processing
  processNextEvent();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nShutting down...');
    console.log(`Processed ${state!.events_processed} events`);
    console.log(`Final momentum: ${state!.momentum_score}`);
    saveTrialState(state!, stateFile);
    console.log(`State saved to ${stateFile}`);
    process.exit(0);
  });
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.mode === 'live') {
    await runLiveMode(args);
  } else {
    await runBatchMode(args);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
