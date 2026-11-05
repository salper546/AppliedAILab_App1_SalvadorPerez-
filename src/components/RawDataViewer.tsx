import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Layers, FileDown } from 'lucide-react';
import { SalesRow } from '../types';
import { formatCurrency, formatPercent } from '../utils/analytics';
import { downloadFile } from '../utils/parser';

interface RawDataViewerProps {
  rows: SalesRow[];
}

export const RawDataViewer: React.FC<RawDataViewerProps> = ({ rows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (r) =>
        r.region.toLowerCase().includes(term) ||
        r.quarter.toLowerCase().includes(term) ||
        r.channel.toLowerCase().includes(term) ||
        r.product.toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const handleExportAll = () => {
    const headers = ['quarter', 'region', 'channel', 'product', 'units', 'discount_pct', 'revenue'];
    let csv = headers.join(',') + '\n';
    rows.forEach((r) => {
      csv += [
        r.quarter,
        `"${r.region}"`,
        `"${r.channel}"`,
        `"${r.product}"`,
        r.units,
        r.discount_pct,
        r.revenue,
      ].join(',') + '\n';
    });
    downloadFile(csv, 'sales_raw_records.csv');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-8 overflow-hidden">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">
            Raw Sales Order Records ({rows.length.toLocaleString()} rows)
          </h3>
          <span className="text-xs text-slate-400">· Click to {isOpen ? 'hide' : 'inspect'}</span>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 pt-0 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 my-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search region, product, channel..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleExportAll}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download All Rows
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Quarter</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Units</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No matching records found
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{r.quarter}</td>
                      <td className="py-2.5 px-3">{r.region}</td>
                      <td className="py-2.5 px-3">{r.channel}</td>
                      <td className="py-2.5 px-3">{r.product}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{r.units}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{formatPercent(r.discount_pct)}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 tabular-nums">
                        {formatCurrency(r.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span>
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} records
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Prev
                </button>
                <span className="tabular-nums">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
