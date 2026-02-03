/**
 * Graphics Generation Module
 * Generates visual outputs as SVG/PNG for reports and dashboards
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface TimelineEvent {
  date: string;
  label: string;
  type: string;
  amount?: number;
}

export interface FlowNode {
  id: string;
  label: string;
  type: 'source' | 'process' | 'destination' | 'scheme';
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface GraphicOutput {
  svg: string;
  markdown: string;
  filename: string;
}

// ============================================================================
// COLOR SCHEMES
// ============================================================================

const COLORS = {
  primary: '#2563eb',
  danger: '#dc2626',
  warning: '#f59e0b',
  success: '#16a34a',
  neutral: '#6b7280',
  background: '#ffffff',
  text: '#1f2937',
  gridLine: '#e5e7eb',
  threshold: '#ef4444',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#22c55e',
  info: '#3b82f6',
};

// ============================================================================
// BAR CHART
// ============================================================================

export function generateBarChart(
  data: ChartData,
  title: string,
  options: {
    width?: number;
    height?: number;
    threshold?: number;
    thresholdLabel?: string;
    showValues?: boolean;
  } = {}
): GraphicOutput {
  const width = options.width || 600;
  const height = options.height || 400;
  const padding = { top: 60, right: 40, bottom: 80, left: 80 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.values, options.threshold || 0) * 1.1;
  const barWidth = chartWidth / data.labels.length * 0.7;
  const barSpacing = chartWidth / data.labels.length;

  let bars = '';
  let labels = '';
  let valueLabels = '';

  data.values.forEach((value, i) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x = padding.left + i * barSpacing + (barSpacing - barWidth) / 2;
    const y = padding.top + chartHeight - barHeight;
    const color = data.colors?.[i] || COLORS.primary;

    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4"/>`;
    labels += `<text x="${x + barWidth / 2}" y="${height - padding.bottom + 20}" text-anchor="middle" font-size="12" fill="${COLORS.text}">${data.labels[i]}</text>`;

    if (options.showValues !== false) {
      valueLabels += `<text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="11" font-weight="bold" fill="${COLORS.text}">$${value.toLocaleString()}</text>`;
    }
  });

  // Threshold line
  let thresholdLine = '';
  if (options.threshold) {
    const thresholdY = padding.top + chartHeight - (options.threshold / maxValue) * chartHeight;
    thresholdLine = `
      <line x1="${padding.left}" y1="${thresholdY}" x2="${width - padding.right}" y2="${thresholdY}" stroke="${COLORS.threshold}" stroke-width="2" stroke-dasharray="5,5"/>
      <text x="${width - padding.right + 5}" y="${thresholdY + 4}" font-size="11" fill="${COLORS.threshold}">${options.thresholdLabel || `$${options.threshold.toLocaleString()}`}</text>
    `;
  }

  // Y-axis
  const yAxisTicks = 5;
  let yAxis = '';
  for (let i = 0; i <= yAxisTicks; i++) {
    const value = (maxValue / yAxisTicks) * i;
    const y = padding.top + chartHeight - (i / yAxisTicks) * chartHeight;
    yAxis += `
      <line x1="${padding.left - 5}" y1="${y}" x2="${padding.left}" y2="${y}" stroke="${COLORS.text}"/>
      <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${COLORS.text}">$${Math.round(value).toLocaleString()}</text>
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${COLORS.gridLine}" stroke-dasharray="2,2"/>
    `;
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${COLORS.background}"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="${COLORS.text}">${title}</text>
  <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="${COLORS.text}"/>
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="${COLORS.text}"/>
  ${yAxis}
  ${bars}
  ${labels}
  ${valueLabels}
  ${thresholdLine}
</svg>`;

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_chart.svg';

  const markdown = `## ${title}

![${title}](./images/${filename})

| Date | Amount |
|------|--------|
${data.labels.map((label, i) => `| ${label} | $${data.values[i].toLocaleString()} |`).join('\n')}
`;

  return { svg, markdown, filename };
}

// ============================================================================
// PIE CHART
// ============================================================================

export function generatePieChart(
  data: ChartData,
  title: string,
  options: { width?: number; height?: number } = {}
): GraphicOutput {
  const width = options.width || 500;
  const height = options.height || 400;
  const centerX = width / 2;
  const centerY = height / 2 + 20;
  const radius = Math.min(width, height) / 3;

  const total = data.values.reduce((a, b) => a + b, 0);
  let currentAngle = -Math.PI / 2;

  let slices = '';
  let legend = '';
  const defaultColors = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899'];

  data.values.forEach((value, i) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;
    const color = data.colors?.[i] || defaultColors[i % defaultColors.length];

    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    slices += `<path d="M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z" fill="${color}" stroke="${COLORS.background}" stroke-width="2"/>`;

    // Legend
    const legendY = 30 + i * 20;
    const percentage = ((value / total) * 100).toFixed(1);
    legend += `
      <rect x="20" y="${legendY}" width="14" height="14" fill="${color}"/>
      <text x="40" y="${legendY + 12}" font-size="12" fill="${COLORS.text}">${data.labels[i]} (${percentage}%)</text>
    `;

    currentAngle = endAngle;
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${COLORS.background}"/>
  <text x="${width / 2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="${COLORS.text}">${title}</text>
  ${slices}
  ${legend}
</svg>`;

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_pie.svg';

  const markdown = `## ${title}

![${title}](./images/${filename})

| Category | Amount | Percentage |
|----------|--------|------------|
${data.labels.map((label, i) => `| ${label} | $${data.values[i].toLocaleString()} | ${((data.values[i] / total) * 100).toFixed(1)}% |`).join('\n')}
`;

  return { svg, markdown, filename };
}

// ============================================================================
// TIMELINE
// ============================================================================

export function generateTimeline(
  events: TimelineEvent[],
  title: string,
  options: { width?: number; height?: number } = {}
): GraphicOutput {
  const width = options.width || 800;
  const eventHeight = 60;
  const height = options.height || Math.max(300, events.length * eventHeight + 100);
  const padding = { top: 60, left: 150, right: 50 };

  const typeColors: Record<string, string> = {
    structuring: '#dc2626',
    offshore: '#f59e0b',
    payroll: '#8b5cf6',
    deposit: '#16a34a',
    wire: '#2563eb',
    default: '#6b7280',
  };

  let eventElements = '';
  let connectors = '';

  events.forEach((event, i) => {
    const y = padding.top + i * eventHeight;
    const color = typeColors[event.type] || typeColors.default;

    // Date label
    eventElements += `<text x="${padding.left - 10}" y="${y + 20}" text-anchor="end" font-size="12" fill="${COLORS.text}">${event.date}</text>`;

    // Connector dot
    eventElements += `<circle cx="${padding.left + 10}" cy="${y + 15}" r="8" fill="${color}"/>`;

    // Event box
    eventElements += `
      <rect x="${padding.left + 30}" y="${y}" width="${width - padding.left - padding.right - 30}" height="45" fill="${color}10" stroke="${color}" stroke-width="1" rx="4"/>
      <text x="${padding.left + 40}" y="${y + 20}" font-size="13" font-weight="bold" fill="${COLORS.text}">${event.label}</text>
    `;

    if (event.amount) {
      eventElements += `<text x="${padding.left + 40}" y="${y + 38}" font-size="12" fill="${COLORS.neutral}">$${event.amount.toLocaleString()}</text>`;
    }

    // Vertical connector line
    if (i < events.length - 1) {
      connectors += `<line x1="${padding.left + 10}" y1="${y + 23}" x2="${padding.left + 10}" y2="${y + eventHeight}" stroke="${COLORS.gridLine}" stroke-width="2"/>`;
    }
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${COLORS.background}"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="${COLORS.text}">${title}</text>
  ${connectors}
  ${eventElements}
</svg>`;

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_timeline.svg';

  const markdown = `## ${title}

![${title}](./images/${filename})

| Date | Event | Type | Amount |
|------|-------|------|--------|
${events.map(e => `| ${e.date} | ${e.label} | ${e.type} | ${e.amount ? '$' + e.amount.toLocaleString() : '-'} |`).join('\n')}
`;

  return { svg, markdown, filename };
}

// ============================================================================
// FLOW DIAGRAM
// ============================================================================

export function generateFlowDiagram(
  nodes: FlowNode[],
  edges: FlowEdge[],
  title: string,
  options: { width?: number; height?: number } = {}
): GraphicOutput {
  const width = options.width || 700;
  const height = options.height || 500;

  const typeColors: Record<string, string> = {
    source: '#16a34a',
    process: '#2563eb',
    destination: '#dc2626',
    scheme: '#f59e0b',
  };

  // Simple layout - arrange nodes in layers
  const nodePositions: Record<string, { x: number; y: number }> = {};
  const nodesByType: Record<string, FlowNode[]> = {};

  nodes.forEach(node => {
    if (!nodesByType[node.type]) nodesByType[node.type] = [];
    nodesByType[node.type].push(node);
  });

  const layers = ['source', 'process', 'scheme', 'destination'];
  let layerX = 100;

  layers.forEach(type => {
    const layerNodes = nodesByType[type] || [];
    const startY = (height - layerNodes.length * 80) / 2;

    layerNodes.forEach((node, i) => {
      nodePositions[node.id] = { x: layerX, y: startY + i * 80 };
    });

    if (layerNodes.length > 0) layerX += 180;
  });

  // Draw edges
  let edgeElements = '';
  edges.forEach(edge => {
    const from = nodePositions[edge.from];
    const to = nodePositions[edge.to];
    if (from && to) {
      const midX = (from.x + to.x) / 2;
      edgeElements += `
        <path d="M${from.x + 60},${from.y + 25} Q${midX},${from.y + 25} ${midX},${(from.y + to.y) / 2 + 25} T${to.x},${to.y + 25}" fill="none" stroke="${COLORS.neutral}" stroke-width="2" marker-end="url(#arrowhead)"/>
      `;
      if (edge.label) {
        edgeElements += `<text x="${midX}" y="${(from.y + to.y) / 2 + 20}" text-anchor="middle" font-size="10" fill="${COLORS.neutral}">${edge.label}</text>`;
      }
    }
  });

  // Draw nodes
  let nodeElements = '';
  nodes.forEach(node => {
    const pos = nodePositions[node.id];
    if (pos) {
      const color = typeColors[node.type] || COLORS.neutral;
      nodeElements += `
        <rect x="${pos.x}" y="${pos.y}" width="120" height="50" fill="${color}" rx="8"/>
        <text x="${pos.x + 60}" y="${pos.y + 30}" text-anchor="middle" font-size="11" fill="white" font-weight="bold">${node.label}</text>
      `;
    }
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="${COLORS.neutral}"/>
    </marker>
  </defs>
  <rect width="${width}" height="${height}" fill="${COLORS.background}"/>
  <text x="${width / 2}" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="${COLORS.text}">${title}</text>
  ${edgeElements}
  ${nodeElements}
</svg>`;

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_flow.svg';

  const markdown = `## ${title}

![${title}](./images/${filename})

### Flow Connections

${edges.map(e => `- ${e.from} → ${e.to}${e.label ? ` (${e.label})` : ''}`).join('\n')}
`;

  return { svg, markdown, filename };
}

// ============================================================================
// RISK GAUGE
// ============================================================================

export function generateRiskGauge(
  score: number,
  title: string,
  options: { width?: number; height?: number; thresholds?: Record<string, number> } = {}
): GraphicOutput {
  const width = options.width || 300;
  const height = options.height || 200;
  const centerX = width / 2;
  const centerY = height - 40;
  const radius = 80;

  const thresholds = options.thresholds || { critical: 80, high: 60, medium: 40, low: 20 };

  // Color based on score
  let color = '#16a34a'; // Low
  let label = 'LOW';
  if (score >= thresholds.critical) { color = '#dc2626'; label = 'CRITICAL'; }
  else if (score >= thresholds.high) { color = '#f59e0b'; label = 'HIGH'; }
  else if (score >= thresholds.medium) { color = '#eab308'; label = 'MEDIUM'; }

  // Arc calculation
  const startAngle = Math.PI;
  const endAngle = 0;
  const scoreAngle = startAngle - (score / 100) * Math.PI;

  const arcPath = (start: number, end: number, r: number) => {
    const x1 = centerX + r * Math.cos(start);
    const y1 = centerY + r * Math.sin(start);
    const x2 = centerX + r * Math.cos(end);
    const y2 = centerY + r * Math.sin(end);
    const largeArc = Math.abs(end - start) > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2}`;
  };

  // Needle
  const needleX = centerX + (radius - 10) * Math.cos(scoreAngle);
  const needleY = centerY + (radius - 10) * Math.sin(scoreAngle);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${COLORS.background}"/>
  <text x="${width / 2}" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="${COLORS.text}">${title}</text>

  <!-- Background arc -->
  <path d="${arcPath(startAngle, endAngle, radius)}" fill="none" stroke="${COLORS.gridLine}" stroke-width="20" stroke-linecap="round"/>

  <!-- Score arc -->
  <path d="${arcPath(startAngle, scoreAngle, radius)}" fill="none" stroke="${color}" stroke-width="20" stroke-linecap="round"/>

  <!-- Needle -->
  <line x1="${centerX}" y1="${centerY}" x2="${needleX}" y2="${needleY}" stroke="${COLORS.text}" stroke-width="3"/>
  <circle cx="${centerX}" cy="${centerY}" r="8" fill="${COLORS.text}"/>

  <!-- Score display -->
  <text x="${centerX}" y="${centerY - 20}" text-anchor="middle" font-size="28" font-weight="bold" fill="${color}">${score}</text>
  <text x="${centerX}" y="${centerY + 30}" text-anchor="middle" font-size="14" font-weight="bold" fill="${color}">${label}</text>

  <!-- Scale labels -->
  <text x="${centerX - radius - 10}" y="${centerY + 15}" text-anchor="middle" font-size="10" fill="${COLORS.neutral}">0</text>
  <text x="${centerX + radius + 10}" y="${centerY + 15}" text-anchor="middle" font-size="10" fill="${COLORS.neutral}">100</text>
</svg>`;

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_gauge.svg';

  const markdown = `## ${title}

![${title}](./images/${filename})

**Score:** ${score}/100 (${label})
`;

  return { svg, markdown, filename };
}

// ============================================================================
// BENFORD DISTRIBUTION CHART
// ============================================================================

export function generateBenfordChart(
  observed: number[],
  expected: number[],
  title: string,
  options: { width?: number; height?: number } = {}
): GraphicOutput {
  const width = options.width || 600;
  const height = options.height || 350;
  const padding = { top: 60, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const maxValue = Math.max(...observed, ...expected) * 1.1;
  const barWidth = chartWidth / 9 * 0.35;
  const barSpacing = chartWidth / 9;

  let bars = '';
  let labels = '';

  digits.forEach((digit, i) => {
    const x = padding.left + i * barSpacing;

    // Expected bar
    const expectedHeight = (expected[i] / maxValue) * chartHeight;
    const expectedY = padding.top + chartHeight - expectedHeight;
    bars += `<rect x="${x}" y="${expectedY}" width="${barWidth}" height="${expectedHeight}" fill="${COLORS.primary}" opacity="0.5"/>`;

    // Observed bar
    const observedHeight = (observed[i] / maxValue) * chartHeight;
    const observedY = padding.top + chartHeight - observedHeight;
    bars += `<rect x="${x + barWidth + 2}" y="${observedY}" width="${barWidth}" height="${observedHeight}" fill="${COLORS.danger}"/>`;

    // Digit label
    labels += `<text x="${x + barWidth}" y="${height - padding.bottom + 20}" text-anchor="middle" font-size="12" fill="${COLORS.text}">${digit}</text>`;
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${COLORS.background}"/>
  <text x="${width / 2}" y="25" text-anchor="middle" font-size="16" font-weight="bold" fill="${COLORS.text}">${title}</text>

  <!-- Legend -->
  <rect x="${width - 150}" y="35" width="12" height="12" fill="${COLORS.primary}" opacity="0.5"/>
  <text x="${width - 133}" y="46" font-size="11" fill="${COLORS.text}">Expected</text>
  <rect x="${width - 150}" y="52" width="12" height="12" fill="${COLORS.danger}"/>
  <text x="${width - 133}" y="63" font-size="11" fill="${COLORS.text}">Observed</text>

  <!-- Axes -->
  <line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${width - padding.right}" y2="${padding.top + chartHeight}" stroke="${COLORS.text}"/>
  <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartHeight}" stroke="${COLORS.text}"/>

  <!-- Y-axis label -->
  <text x="15" y="${height / 2}" text-anchor="middle" font-size="12" fill="${COLORS.text}" transform="rotate(-90 15 ${height / 2})">Frequency (%)</text>

  <!-- X-axis label -->
  <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="12" fill="${COLORS.text}">First Digit</text>

  ${bars}
  ${labels}
</svg>`;

  const filename = 'benford_analysis_chart.svg';

  const markdown = `## ${title}

![${title}](./images/${filename})

| Digit | Expected | Observed | Deviation |
|-------|----------|----------|-----------|
${digits.map((d, i) => `| ${d} | ${expected[i].toFixed(1)}% | ${observed[i].toFixed(1)}% | ${(observed[i] - expected[i]).toFixed(1)}% |`).join('\n')}
`;

  return { svg, markdown, filename };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function saveGraphic(graphic: GraphicOutput, outputDir: string): string {
  const imagesDir = path.join(outputDir, 'images');

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const filePath = path.join(imagesDir, graphic.filename);
  fs.writeFileSync(filePath, graphic.svg);

  return filePath;
}

export function generateAllGraphics(
  findings: any[],
  scores: any[],
  transactions: any[],
  outputDir: string
): string[] {
  const savedFiles: string[] = [];

  // Risk gauge for composite score
  if (scores.length > 0) {
    const compositeScore = scores.reduce((a, b) => a + b.value, 0) / scores.length;
    const gauge = generateRiskGauge(Math.round(compositeScore), 'Composite Risk Score');
    savedFiles.push(saveGraphic(gauge, outputDir));
  }

  // Findings by severity pie chart
  const severityCounts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  findings.forEach(f => {
    if (severityCounts[f.severity] !== undefined) {
      severityCounts[f.severity]++;
    }
  });

  if (Object.values(severityCounts).some(v => v > 0)) {
    const pie = generatePieChart(
      {
        labels: Object.keys(severityCounts),
        values: Object.values(severityCounts),
        colors: Object.keys(severityCounts).map(s => SEVERITY_COLORS[s]),
      },
      'Findings by Severity'
    );
    savedFiles.push(saveGraphic(pie, outputDir));
  }

  return savedFiles;
}
