import React from 'react';
import { Filter, X } from 'lucide-react';
import { FilterState, SalesRow } from '../types';

interface FilterToolbarProps {
  rows: SalesRow[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  rows,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const regions = Array.from(new Set(rows.map((r) => r.region))).sort();
  const channels = Array.from(new Set(rows.map((r) => r.channel))).sort();
  const products = Array.from(new Set(rows.map((r) => r.product))).sort();

  const isFiltered =
    filters.region !== 'all' ||
    filters.channel !== 'all' ||
    filters.product !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters:</span>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="region-filter" className="text-xs text-slate-500">
            Region:
          </label>
          <select
            id="region-filter"
            value={filters.region}
            onChange={(e) =>
              onFilterChange({ ...filters, region: e.target.value })
            }
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Regions ({regions.length})</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="channel-filter" className="text-xs text-slate-500">
            Channel:
          </label>
          <select
            id="channel-filter"
            value={filters.channel}
            onChange={(e) =>
              onFilterChange({ ...filters, channel: e.target.value })
            }
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Channels ({channels.length})</option>
            {channels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        {/* Product Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="product-filter" className="text-xs text-slate-500">
            Product:
          </label>
          <select
            id="product-filter"
            value={filters.product}
            onChange={(e) =>
              onFilterChange({ ...filters, product: e.target.value })
            }
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Products ({products.length})</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      )}
    </div>
  );
};
