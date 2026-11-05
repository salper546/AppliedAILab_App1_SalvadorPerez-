import { GroundedDiagnostic, RegionQuarterMatrix, SalesRow } from '../types';

export function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(val: number): string {
  return val.toLocaleString('en-US');
}

export function formatPercent(val: number): string {
  return (val * 100).toFixed(1) + '%';
}

export function sortQuarters(quarters: string[]): string[] {
  // Sort quarters logically if they follow Q1, Q2, etc., else alphabetical
  return [...quarters].sort((a, b) => {
    const matchA = a.match(/Q?(\d+)/i);
    const matchB = b.match(/Q?(\d+)/i);
    if (matchA && matchB) {
      return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
    }
    return a.localeCompare(b);
  });
}

export function buildRegionQuarterMatrix(rows: SalesRow[]): {
  regions: string[];
  quarters: string[];
  matrix: RegionQuarterMatrix;
  regionTotals: Record<string, number>;
  quarterTotals: Record<string, number>;
  grandTotal: number;
} {
  const regionsSet = new Set<string>();
  const quartersSet = new Set<string>();
  const matrix: RegionQuarterMatrix = {};
  const regionTotals: Record<string, number> = {};
  const quarterTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const r of rows) {
    regionsSet.add(r.region);
    quartersSet.add(r.quarter);

    if (!matrix[r.region]) {
      matrix[r.region] = {};
    }
    matrix[r.region][r.quarter] = (matrix[r.region][r.quarter] || 0) + r.revenue;
    regionTotals[r.region] = (regionTotals[r.region] || 0) + r.revenue;
    quarterTotals[r.quarter] = (quarterTotals[r.quarter] || 0) + r.revenue;
    grandTotal += r.revenue;
  }

  const regions = Array.from(regionsSet).sort();
  const quarters = sortQuarters(Array.from(quartersSet));

  return {
    regions,
    quarters,
    matrix,
    regionTotals,
    quarterTotals,
    grandTotal,
  };
}

export function calculateGroundedDiagnostic(
  rows: SalesRow[],
  regions: string[],
  _matrix: RegionQuarterMatrix
): GroundedDiagnostic {
  const isQ2 = (q: string) => /^(Q2|2)$/i.test(q.trim());
  const isQ3 = (q: string) => /^(Q3|3)$/i.test(q.trim());

  const allQ = rows.map((r) => r.quarter);
  const hasQ2 = allQ.some(isQ2);
  const hasQ3 = allQ.some(isQ3);

  if (!hasQ2 || !hasQ3 || regions.length === 0) {
    return {
      hasQ2AndQ3: false,
      targetRegion: null,
      targetRevDelta: 0,
      targetRevPct: 0,
      targetQ2Rev: 0,
      targetQ3Rev: 0,
      direction: 'increased',
      topProduct: null,
      topProductDelta: 0,
      topProductQ2Rev: 0,
      topProductQ3Rev: 0,
      topProductSignedDelta: 0,
      topChannel: null,
      topChannelDelta: 0,
      topChannelSignedDelta: 0,
      q2Units: 0,
      q3Units: 0,
      unitsDelta: 0,
      avgQ2Disc: 0,
      avgQ3Disc: 0,
      sentence1:
        'Insufficient quarterly data: both Q2 and Q3 records must be present in the CSV to calculate quarter-over-quarter dynamics.',
      sentence2:
        'Upload sales records spanning at least the second and third fiscal quarters to reveal regional shift drivers.',
      sentence3:
        'Ensure product and channel identifiers are present to unlock deep category variance diagnostics.',
    };
  }

  // 1. Identify which region changed the most from Q2 to Q3 in revenue
  let maxDelta = -1;
  let targetRegion: string = regions[0];
  let targetQ2Rev = 0;
  let targetQ3Rev = 0;
  let targetRevDelta = 0;

  for (const reg of regions) {
    const q2Rev = rows
      .filter((r) => r.region === reg && isQ2(r.quarter))
      .reduce((acc, c) => acc + c.revenue, 0);
    const q3Rev = rows
      .filter((r) => r.region === reg && isQ3(r.quarter))
      .reduce((acc, c) => acc + c.revenue, 0);
    const diff = Math.abs(q3Rev - q2Rev);

    if (diff > maxDelta) {
      maxDelta = diff;
      targetRegion = reg;
      targetQ2Rev = q2Rev;
      targetQ3Rev = q3Rev;
      targetRevDelta = q3Rev - q2Rev;
    }
  }

  // 2. Compute "Why": Sub-segment drivers for targetRegion between Q2 and Q3
  const targetRows = rows.filter(
    (r) => r.region === targetRegion && (isQ2(r.quarter) || isQ3(r.quarter))
  );

  const q2Units = targetRows
    .filter((r) => isQ2(r.quarter))
    .reduce((a, b) => a + b.units, 0);
  const q3Units = targetRows
    .filter((r) => isQ3(r.quarter))
    .reduce((a, b) => a + b.units, 0);
  const unitsDelta = q3Units - q2Units;

  const q2DiscountSum = targetRows
    .filter((r) => isQ2(r.quarter))
    .reduce((a, b) => a + b.discount_pct * b.units, 0);
  const q3DiscountSum = targetRows
    .filter((r) => isQ3(r.quarter))
    .reduce((a, b) => a + b.discount_pct * b.units, 0);
  const avgQ2Disc = q2Units > 0 ? q2DiscountSum / q2Units : 0;
  const avgQ3Disc = q3Units > 0 ? q3DiscountSum / q3Units : 0;

  // Group by Product to find primary product contributor
  const products = Array.from(new Set(targetRows.map((r) => r.product)));
  let topProduct: string = products[0] || 'Unknown';
  let topProductDelta = -1;
  let topProductSignedDelta = 0;
  let topProductQ2Rev = 0;
  let topProductQ3Rev = 0;

  for (const p of products) {
    const pQ2Rev = targetRows
      .filter((r) => isQ2(r.quarter) && r.product === p)
      .reduce((a, b) => a + b.revenue, 0);
    const pQ3Rev = targetRows
      .filter((r) => isQ3(r.quarter) && r.product === p)
      .reduce((a, b) => a + b.revenue, 0);
    const diff = Math.abs(pQ3Rev - pQ2Rev);
    if (diff > topProductDelta) {
      topProductDelta = diff;
      topProduct = p;
      topProductSignedDelta = pQ3Rev - pQ2Rev;
      topProductQ2Rev = pQ2Rev;
      topProductQ3Rev = pQ3Rev;
    }
  }

  // Group by Channel to find primary channel contributor
  const channels = Array.from(new Set(targetRows.map((r) => r.channel)));
  let topChannel: string = channels[0] || 'Unknown';
  let topChannelDelta = -1;
  let topChannelSignedDelta = 0;

  for (const ch of channels) {
    const chQ2Rev = targetRows
      .filter((r) => isQ2(r.quarter) && r.channel === ch)
      .reduce((a, b) => a + b.revenue, 0);
    const chQ3Rev = targetRows
      .filter((r) => isQ3(r.quarter) && r.channel === ch)
      .reduce((a, b) => a + b.revenue, 0);
    const diff = Math.abs(chQ3Rev - chQ2Rev);
    if (diff > topChannelDelta) {
      topChannelDelta = diff;
      topChannel = ch;
      topChannelSignedDelta = chQ3Rev - chQ2Rev;
    }
  }

  const targetRevPct =
    targetQ2Rev !== 0 ? (targetRevDelta / targetQ2Rev) * 100 : 0;
  const dirText = targetRevDelta >= 0 ? 'increased' : 'decreased';
  const absDeltaFormatted = Math.abs(targetRevDelta).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const q2RevFormatted = targetQ2Rev.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const q3RevFormatted = targetQ3Rev.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prodDeltaFormatted = Math.abs(topProductSignedDelta).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );
  const chDeltaFormatted = Math.abs(topChannelSignedDelta).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );

  const sentence1 = `${targetRegion} changed the most from Q2 to Q3, with revenue that ${dirText} by $${absDeltaFormatted} (${Math.abs(targetRevPct).toFixed(1)}%), shifting from $${q2RevFormatted} to $${q3RevFormatted}.`;

  const sentence2 = `This variance was primarily driven by ${topProduct}, which shifted by $${prodDeltaFormatted} (from $${topProductQ2Rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to $${topProductQ3Rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}), with the ${topChannel} channel experiencing the largest channel-level movement of $${chDeltaFormatted}.`;

  const sentence3 = `Overall regional volume moved by ${unitsDelta >= 0 ? '+' : ''}${unitsDelta.toLocaleString()} units (${q2Units.toLocaleString()} in Q2 vs. ${q3Units.toLocaleString()} in Q3) alongside an average discount movement from ${(avgQ2Disc * 100).toFixed(1)}% to ${(avgQ3Disc * 100).toFixed(1)}%.`;

  return {
    hasQ2AndQ3: true,
    targetRegion,
    targetRevDelta,
    targetRevPct,
    targetQ2Rev,
    targetQ3Rev,
    direction: targetRevDelta >= 0 ? 'increased' : 'decreased',
    topProduct,
    topProductDelta,
    topProductQ2Rev,
    topProductQ3Rev,
    topProductSignedDelta,
    topChannel,
    topChannelDelta,
    topChannelSignedDelta,
    q2Units,
    q3Units,
    unitsDelta,
    avgQ2Disc,
    avgQ3Disc,
    sentence1,
    sentence2,
    sentence3,
  };
}
