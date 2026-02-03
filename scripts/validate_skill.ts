/**
 * Skill Validation Script
 * Tests that all modules are properly exported and can be loaded
 */

console.log('='.repeat(70));
console.log('FINANCIAL INTELLIGENCE SKILL v5 - VALIDATION');
console.log('='.repeat(70));
console.log('');

interface ValidationResult {
  module: string;
  status: 'pass' | 'fail';
  exports: string[];
  errors: string[];
}

const results: ValidationResult[] = [];

// Test Core Types
console.log('Testing Core Types...');
try {
  const types = require('../core/types');
  const exports = Object.keys(types).filter(k => typeof types[k] !== 'undefined');
  results.push({
    module: 'core/types',
    status: 'pass',
    exports: exports.slice(0, 10),
    errors: [],
  });
  console.log(`  ✓ core/types: ${exports.length} exports`);
} catch (e: any) {
  results.push({
    module: 'core/types',
    status: 'fail',
    exports: [],
    errors: [e.message],
  });
  console.log(`  ✗ core/types: ${e.message}`);
}

// Test Workflow Intake
console.log('Testing Workflow Intake...');
try {
  const intake = require('../workflows/workflow_intake');
  const exports = Object.keys(intake);
  results.push({
    module: 'workflows/workflow_intake',
    status: 'pass',
    exports,
    errors: [],
  });
  console.log(`  ✓ workflow_intake: ${exports.length} exports`);
  console.log(`    Commands: ${Object.keys(intake.WORKFLOW_COMMANDS || {}).length}`);
  console.log(`    Registry: ${Object.keys(intake.WORKFLOW_REGISTRY || {}).length}`);
} catch (e: any) {
  results.push({
    module: 'workflows/workflow_intake',
    status: 'fail',
    exports: [],
    errors: [e.message],
  });
  console.log(`  ✗ workflow_intake: ${e.message}`);
}

// Test IRS Tax Defense Index
console.log('Testing IRS Tax Defense...');
try {
  const irs = require('../modules/irs_tax_defense');
  const exports = Object.keys(irs);
  results.push({
    module: 'modules/irs_tax_defense',
    status: 'pass',
    exports,
    errors: [],
  });
  console.log(`  ✓ irs_tax_defense: ${exports.length} exports`);
} catch (e: any) {
  results.push({
    module: 'modules/irs_tax_defense',
    status: 'fail',
    exports: [],
    errors: [e.message],
  });
  console.log(`  ✗ irs_tax_defense: ${e.message}`);
}

// Test Individual IRS Modules
const irsModules = [
  'non_filer_defense',
  'sfr_attack',
  'collection_defense',
  'advanced_modules',
  'litigation_modules',
  'case_router',
  'master_orchestrator',
  'tax_deadlines',
  'tax_law_reference',
];

console.log('Testing Individual IRS Modules...');
for (const mod of irsModules) {
  try {
    const module = require(`../modules/irs_tax_defense/${mod}`);
    const exports = Object.keys(module);
    results.push({
      module: `irs_tax_defense/${mod}`,
      status: 'pass',
      exports: exports.slice(0, 5),
      errors: [],
    });
    console.log(`  ✓ ${mod}: ${exports.length} exports`);
  } catch (e: any) {
    results.push({
      module: `irs_tax_defense/${mod}`,
      status: 'fail',
      exports: [],
      errors: [e.message],
    });
    console.log(`  ✗ ${mod}: ${e.message}`);
  }
}

// Test Other Modules
const otherModules = [
  { path: 'modules/forensic', name: 'forensic' },
  { path: 'modules/statistical_anomalies', name: 'statistical_anomalies' },
  { path: 'modules/realtime_trial', name: 'realtime_trial' },
];

console.log('Testing Other Modules...');
for (const { path, name } of otherModules) {
  try {
    const module = require(`../${path}`);
    const exports = Object.keys(module);
    results.push({
      module: name,
      status: 'pass',
      exports: exports.slice(0, 5),
      errors: [],
    });
    console.log(`  ✓ ${name}: ${exports.length} exports`);
  } catch (e: any) {
    results.push({
      module: name,
      status: 'fail',
      exports: [],
      errors: [e.message],
    });
    console.log(`  ✗ ${name}: ${e.message}`);
  }
}

// Summary
console.log('');
console.log('='.repeat(70));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(70));

const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail').length;

console.log(`Total Modules Tested: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('');

if (failed > 0) {
  console.log('FAILED MODULES:');
  for (const r of results.filter(r => r.status === 'fail')) {
    console.log(`  - ${r.module}: ${r.errors.join(', ')}`);
  }
}

console.log('');
console.log('='.repeat(70));
console.log(failed === 0 ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗');
console.log('='.repeat(70));

// Export results
export { results };
