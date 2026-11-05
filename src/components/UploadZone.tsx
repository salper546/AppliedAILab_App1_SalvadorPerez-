import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';
import { REQUIRED_COLUMNS, SAMPLE_CSV_DEFAULT, SAMPLE_CSV_GLOBAL, downloadFile } from '../utils/parser';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  onLoadCustomCsv: (csvContent: string, name: string) => void;
  fileName: string | null;
  errorMessage: string | null;
  totalRecords?: number;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileUpload,
  onLoadCustomCsv,
  fileName,
  errorMessage,
  totalRecords,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadFile(SAMPLE_CSV_DEFAULT, 'sales_orders_template.csv');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upload Sales CSV</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Process regional quarterly sales, compute variance matrix, and diagnose shifting drivers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV Template
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-600 mb-4 bg-slate-50 border border-slate-200/80 rounded-lg p-3">
        <span className="font-semibold text-slate-700 block mb-1">Required CSV Columns:</span>
        <div className="flex flex-wrap gap-1.5">
          {REQUIRED_COLUMNS.map((col) => (
            <code
              key={col}
              className="bg-white text-slate-800 font-mono text-[11px] px-2 py-0.5 rounded border border-slate-200"
            >
              {col}
            </code>
          ))}
        </div>
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/40 scale-[0.99]'
            : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <UploadCloud className="w-6 h-6 text-slate-500" />
        </div>

        <span className="block text-sm font-semibold text-slate-800">
          Click to browse or drop CSV here
        </span>
        <span className="text-xs text-slate-500 mt-1 block">
          Accepts standard RFC-4180 CSV files with header row
        </span>

        {fileName && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700">
            <FileText className="w-3.5 h-3.5" />
            <span>{fileName}</span>
            {totalRecords !== undefined && (
              <span className="text-indigo-500 text-[11px]">
                ({totalRecords.toLocaleString()} rows)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Dataset Switcher */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 pt-2 border-t border-slate-100">
        <span>Need test data to experiment?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLoadCustomCsv(SAMPLE_CSV_DEFAULT, 'sample_sales_data.csv')}
            className="text-indigo-600 hover:text-indigo-800 font-medium underline-offset-2 hover:underline"
          >
            Widget Manufacturing Sample
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => onLoadCustomCsv(SAMPLE_CSV_GLOBAL, 'global_enterprise_saas.csv')}
            className="text-indigo-600 hover:text-indigo-800 font-medium underline-offset-2 hover:underline"
          >
            Global SaaS B2B Sample
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Failed to process CSV file</span>
            <span className="text-xs text-red-600">{errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
