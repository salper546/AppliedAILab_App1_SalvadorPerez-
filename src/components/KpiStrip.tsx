import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Compass, Percent } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '../utils/analytics';
import { GroundedDiagnostic, SalesRow } from '../types';

interface KpiStripProps {
  rows: SalesRow[];
  diagnostic: GroundedDiagnostic;
  grandTotal: number;
  leadingRegion: { region: string; revenue: number } | null;
}

export const KpiStrip: React.FC<KpiStripProps> = ({
  rows,
  diagnostic,
  grandTotal,
  leadingRegion,
}) => {
  const totalUnits = rows.reduce((acc, r) => acc + r.units, 0);
  const avgDiscount =
    totalUnits > 0
      ? rows.reduce((acc, r) => acc + r.discount_pct * r.units, 0) / totalUnits
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Total Revenue */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Total Revenue</span>
          <DollarSign className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
          {formatCurrency(grandTotal)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Across {rows.length} validated orders
        </div>
      </div>

      {/* Primary Shift (Q2 → Q3) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Top Variance Region</span>
          {diagnostic.direction === 'increased' ? (
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-600" />
          )}
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
          {diagnostic.targetRegion || '—'}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
          {diagnostic.hasQ2AndQ3 ? (
            <span
              className={
                diagnostic.direction === 'increased'
                  ? 'text-emerald-700 font-semibold'
                  : 'text-rose-700 font-semibold'
              }
            >
              {diagnostic.direction === 'increased' ? '+' : '-'}
              {formatCurrency(Math.abs(diagnostic.targetRevDelta))} (
              {Math.abs(diagnostic.targetRevPct).toFixed(1)}%)
            </span>
          ) : (
            'Awaiting Q2 & Q3'
          )}
        </div>
      </div>

      {/* Total Units */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Volume Sold</span>
          <Package className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
          {formatNumber(totalUnits)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Units across all channels
        </div>
      </div>

      {/* Avg Discount */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium uppercase tracking-wider">Avg Discount</span>
          <Percent className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
          {formatPercent(avgDiscount)}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 truncate">
          Top region: {leadingRegion ? leadingRegion.region : '—'}
        </div>
      </div>
    </div>
  );
};
