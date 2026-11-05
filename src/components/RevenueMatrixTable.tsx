import React, { useState } from 'react';
import { Download, Copy, Check, Table2 } from 'lucide-react';
import { RegionQuarterMatrix } from '../types';
import { formatCurrency } from '../utils/analytics';
import { downloadFile } from '../utils/parser';

interface RevenueMatrixTableProps {
  regions: string[];
  quarters: string[];
  matrix: RegionQuarterMatrix;
  regionTotals: Record<string, number>;
  quarterTotals: Record<string, number>;
  grandTotal: number;
}

export const RevenueMatrixTable: React.FC<RevenueMatrixTableProps> = ({
  regions,
  quarters,
  matrix,
  regionTotals,
  quarterTotals,
  grandTotal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleExportCsv = () => {
    let csv = ['Region', ...quarters, 'Total'].join(',') + '\n';
    regions.forEach((reg) => {
      const row = [
        `"${reg}"`,
        ...quarters.map((q) => (matrix[reg]?.[q] || 0).toFixed(2)),
        (regionTotals[reg] || 0).toFixed(2),
      ];
      csv += row.join(',') + '\n';
    });
    // Add Total Row
    const totalRow = [
      'Total',
      ...quarters.map((q) => (quarterTotals[q] || 0).toFixed(2)),
      grandTotal.toFixed(2),
    ];
    csv += totalRow.join(',') + '\n';

    downloadFile(csv, 'regional_revenue_breakdown_matrix.csv');
  };

  const handleCopyTable = () => {
    let tsv = ['Region', ...quarters, 'Total'].join('\t') + '\n';
    regions.forEach((reg) => {
      const row = [
        reg,
        ...quarters.map((q) => (matrix[reg]?.[q] || 0).toFixed(2)),
        (regionTotals[reg] || 0).toFixed(2),
      ];
      tsv += row.join('\t') + '\n';
    });
    tsv +=
      ['Total', ...quarters.map((q) => (quarterTotals[q] || 0).toFixed(2)), grandTotal.toFixed(2)].join(
        '\t'
      ) + '\n';

    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Revenue Breakdown Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional cross-tabulation by fiscal period
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyTable}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
            title="Copy table to clipboard as TSV"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy TSV</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1.5 rounded-md transition-colors"
            title="Download matrix as CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 -mx-6 px-6">
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-700">
                Region
              </th>
              {quarters.map((q) => (
                <th
                  key={q}
                  className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-700 text-right"
                >
                  {q}
                </th>
              ))}
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-900 text-right bg-slate-100/60">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {regions.map((reg) => {
              const rowTotal = regionTotals[reg] || 0;
              return (
                <tr
                  key={reg}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {reg}
                  </td>
                  {quarters.map((q) => {
                    const val = matrix[reg]?.[q] || 0;
                    return (
                      <td
                        key={q}
                        className="py-3 px-4 text-right tabular-nums text-slate-600 whitespace-nowrap"
                      >
                        {formatCurrency(val)}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums bg-slate-50/40 whitespace-nowrap">
                    {formatCurrency(rowTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
              <td className="py-3 px-4 text-slate-900">Total</td>
              {quarters.map((q) => {
                const total = quarterTotals[q] || 0;
                return (
                  <td
                    key={q}
                    className="py-3 px-4 text-right tabular-nums text-slate-900 whitespace-nowrap"
                  >
                    {formatCurrency(total)}
                  </td>
                );
              })}
              <td className="py-3 px-4 text-right tabular-nums text-indigo-700 font-extrabold bg-indigo-50/50 whitespace-nowrap">
                {formatCurrency(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
