import React from 'react';
import { BarChart3, Database, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasData: boolean;
  activeDatasetName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onReset,
  hasData,
  activeDatasetName,
}) => {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Sales Order Revenue Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Aggregate regional revenue, examine Q2–Q3 variance, and inspect grounded diagnostic drivers.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {hasData && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Clear data and upload new file"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
        <button
          onClick={onLoadSample}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
        >
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          Load Sample CSV
        </button>
      </div>
    </header>
  );
};
