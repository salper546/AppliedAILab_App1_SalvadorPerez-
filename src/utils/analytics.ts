import { ExecutiveBoardInsights, GroundedDiagnostic, RegionQuarterMatrix, SalesRow } from '../types';

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

export function computeExecutiveBoardInsights(
  rows: SalesRow[],
  diagnostic: GroundedDiagnostic
): ExecutiveBoardInsights {
  const isQ2 = (q: string) => /^(Q2|2)$/i.test(q.trim());
  const isQ3 = (q: string) => /^(Q3|3)$/i.test(q.trim());

  const q2Rows = rows.filter((r) => isQ2(r.quarter));
  const q3Rows = rows.filter((r) => isQ3(r.quarter));

  const totalQ2Rev = q2Rows.reduce((acc, r) => acc + r.revenue, 0);
  const totalQ3Rev = q3Rows.reduce((acc, r) => acc + r.revenue, 0);
  const totalQoQDelta = totalQ3Rev - totalQ2Rev;
  const totalQoQPct = totalQ2Rev > 0 ? (totalQoQDelta / totalQ2Rev) * 100 : 0;

  const totalQ2Units = q2Rows.reduce((acc, r) => acc + r.units, 0);
  const totalQ3Units = q3Rows.reduce((acc, r) => acc + r.units, 0);
  const totalUnitsDelta = totalQ3Units - totalQ2Units;
  const totalUnitsPct = totalQ2Units > 0 ? (totalUnitsDelta / totalQ2Units) * 100 : 0;

  const q2Asp = totalQ2Units > 0 ? totalQ2Rev / totalQ2Units : 0;
  const q3Asp = totalQ3Units > 0 ? totalQ3Rev / totalQ3Units : 0;
  const aspDelta = q3Asp - q2Asp;

  const q2DiscountSum = q2Rows.reduce((acc, r) => acc + r.discount_pct * r.units, 0);
  const q3DiscountSum = q3Rows.reduce((acc, r) => acc + r.discount_pct * r.units, 0);
  const q2AvgDiscount = totalQ2Units > 0 ? q2DiscountSum / totalQ2Units : 0;
  const q3AvgDiscount = totalQ3Units > 0 ? q3DiscountSum / totalQ3Units : 0;
  const discountDeltaBps = Math.round((q3AvgDiscount - q2AvgDiscount) * 10000);

  // Regional breakdown
  const regions = Array.from(new Set(rows.map((r) => r.region))).sort();
  const regionalBreakdown = regions.map((reg) => {
    const q2 = q2Rows.filter((r) => r.region === reg).reduce((a, b) => a + b.revenue, 0);
    const q3 = q3Rows.filter((r) => r.region === reg).reduce((a, b) => a + b.revenue, 0);
    const delta = q3 - q2;
    const pct = q2 > 0 ? (delta / q2) * 100 : 0;
    return { region: reg, q2Rev: q2, q3Rev: q3, delta, pct };
  }).sort((a, b) => b.delta - a.delta);

  // Product breakdown
  const products = Array.from(new Set(rows.map((r) => r.product))).sort();
  const productBreakdown = products.map((prod) => {
    const q2 = q2Rows.filter((r) => r.product === prod).reduce((a, b) => a + b.revenue, 0);
    const q3 = q3Rows.filter((r) => r.product === prod).reduce((a, b) => a + b.revenue, 0);
    const delta = q3 - q2;
    const pct = q2 > 0 ? (delta / q2) * 100 : 0;
    return { product: prod, q2Rev: q2, q3Rev: q3, delta, pct };
  }).sort((a, b) => b.delta - a.delta);

  // Channel breakdown
  const channels = Array.from(new Set(rows.map((r) => r.channel))).sort();
  const channelBreakdown = channels.map((ch) => {
    const q2 = q2Rows.filter((r) => r.channel === ch).reduce((a, b) => a + b.revenue, 0);
    const q3 = q3Rows.filter((r) => r.channel === ch).reduce((a, b) => a + b.revenue, 0);
    const delta = q3 - q2;
    const pct = q2 > 0 ? (delta / q2) * 100 : 0;
    return { channel: ch, q2Rev: q2, q3Rev: q3, delta, pct };
  }).sort((a, b) => b.delta - a.delta);

  const topGrowerRegion = regionalBreakdown[0];
  const laggardRegion = regionalBreakdown[regionalBreakdown.length - 1];
  const topProduct = productBreakdown[0];
  const topChannel = channelBreakdown[0];

  // CEO Directives (Strategic, Commercial & Market Focus)
  const ceoDirectives = [
    `Top-Line Trajectory: Enterprise revenue generated ${formatCurrency(totalQ3Rev)} in Q3 vs ${formatCurrency(totalQ2Rev)} in Q2 (${totalQoQDelta >= 0 ? '+' : ''}${formatCurrency(totalQoQDelta)} / ${totalQoQPct >= 0 ? '+' : ''}${totalQoQPct.toFixed(1)}%), led by ${topGrowerRegion ? topGrowerRegion.region : 'primary territory'} (${topGrowerRegion && topGrowerRegion.delta >= 0 ? '+' : ''}${topGrowerRegion ? formatCurrency(topGrowerRegion.delta) : '$0'}).`,
    `Product & Channel Engine: Growth momentum was centered in ${topProduct ? topProduct.product : 'core products'} (${topProduct && topProduct.delta >= 0 ? '+' : ''}${topProduct ? formatCurrency(topProduct.delta) : '$0'}), with ${topChannel ? topChannel.channel : 'primary'} acting as the leading commercial distribution conduit.`,
    `Strategic Directive: Focus Q4 go-to-market execution on replicating the ${topGrowerRegion ? topGrowerRegion.region : 'target region'} expansion playbook while stabilizing performance in ${laggardRegion && laggardRegion.region !== topGrowerRegion?.region ? laggardRegion.region : 'contracting territories'}.`,
  ];

  // CFO Financial Bridge (Unit Economics, Price Realization & Margin Audit)
  const cfoFinancialBridge = [
    `Volume & Unit Realization: Total unit volume shifted by ${totalUnitsDelta >= 0 ? '+' : ''}${totalUnitsDelta.toLocaleString()} units (${totalUnitsPct >= 0 ? '+' : ''}${totalUnitsPct.toFixed(1)}%), while Average Selling Price (ASP) realized at ${formatCurrency(q3Asp)}/unit vs ${formatCurrency(q2Asp)}/unit (${aspDelta >= 0 ? '+' : ''}${formatCurrency(aspDelta)}/unit).`,
    `Discount & Contract Discipline: Blended discount rate moved from ${formatPercent(q2AvgDiscount)} to ${formatPercent(q3AvgDiscount)} (${discountDeltaBps >= 0 ? '+' : ''}${discountDeltaBps} bps), demonstrating ${discountDeltaBps > 0 ? 'higher promotional pricing concessions to accelerate volume' : 'disciplined margin preservation across contract negotiations'}.`,
    `Regional Variance Concentration: ${diagnostic.targetRegion || 'Primary region'} exhibited the largest single variance at ${formatCurrency(Math.abs(diagnostic.targetRevDelta))}, driven by ${diagnostic.topProduct || 'lead product'} and representing a key audit focus for quarterly financial reconciliation.`,
  ];

  // Board Chair Governance (Portfolio Risk, Capital Allocation & Forward Guidance)
  const boardGovernanceNotes = [
    `Enterprise Health & Concentration: Total quarterly volume across all active territories reached ${totalQ3Units.toLocaleString()} units, with ${topProduct ? topProduct.product : 'lead product'} representing ${totalQ3Rev > 0 && topProduct ? ((topProduct.q3Rev / totalQ3Rev) * 100).toFixed(1) : '0'}% of Q3 aggregate revenue.`,
    `Capital Allocation Priority: Channel distribution shifted towards ${topChannel ? topChannel.channel : 'core channel'}, recommending targeted reinvestment of working capital into inventory readiness and channel enablement.`,
    `Audit & Governance Directive: Board oversight affirms positive top-line reconciliation with grounded transaction validation; management is instructed to present Q4 territory capacity models at the next governance committee.`,
  ];

  return {
    totalQ2Rev,
    totalQ3Rev,
    totalQoQDelta,
    totalQoQPct,
    totalQ2Units,
    totalQ3Units,
    totalUnitsDelta,
    totalUnitsPct,
    q2Asp,
    q3Asp,
    aspDelta,
    q2AvgDiscount,
    q3AvgDiscount,
    discountDeltaBps,
    regionalBreakdown,
    productBreakdown,
    channelBreakdown,
    ceoDirectives,
    cfoFinancialBridge,
    boardGovernanceNotes,
  };
}

