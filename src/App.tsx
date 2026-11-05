import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { KpiStrip } from './components/KpiStrip';
import { AiDiagnosticCard } from './components/AiDiagnosticCard';
import { RevenueChart } from './components/RevenueChart';
import { RevenueMatrixTable } from './components/RevenueMatrixTable';
import { FilterToolbar } from './components/FilterToolbar';
import { RawDataViewer } from './components/RawDataViewer';
import { FilterState, SalesRow } from './types';
import {
  parseSalesCsv,
  SAMPLE_CSV_DEFAULT,
} from './utils/parser';
import {
  buildRegionQuarterMatrix,
  calculateGroundedDiagnostic,
} from './utils/analytics';

export default function App() {
  const [rawRows, setRawRows] = useState<SalesRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    region: 'all',
    channel: 'all',
    product: 'all',
  });

  // Automatically initialize with sample data on first load for instant interactivity
  useEffect(() => {
    loadCsvContent(SAMPLE_CSV_DEFAULT, 'sample_sales_data.csv');
  }, []);

  const loadCsvContent = (csvString: string, name: string) => {
    setErrorMessage(null);
    const result = parseSalesCsv(csvString);
    if (result.error) {
      setErrorMessage(result.error);
      return;
    }
    setRawRows(result.rows);
    setFileName(name);
    setFilters({ region: 'all', channel: 'all', product: 'all' });
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please upload a valid .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        loadCsvContent(content, file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Error reading uploaded file.');
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setRawRows([]);
    setFileName(null);
    setErrorMessage(null);
    setFilters({ region: 'all', channel: 'all', product: 'all' });
  };

  // Filter rows based on active toolbar filters
  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      if (filters.region !== 'all' && r.region !== filters.region) return false;
      if (filters.channel !== 'all' && r.channel !== filters.channel) return false;
      if (filters.product !== 'all' && r.product !== filters.product) return false;
      return true;
    });
  }, [rawRows, filters]);

  // Aggregate matrix from active rows
  const { regions, quarters, matrix, regionTotals, quarterTotals, grandTotal } =
    useMemo(() => {
      return buildRegionQuarterMatrix(filteredRows);
    }, [filteredRows]);

  // Diagnostic calculations
  const diagnostic = useMemo(() => {
    return calculateGroundedDiagnostic(filteredRows, regions, matrix);
  }, [filteredRows, regions, matrix]);

  // Leading region
  const leadingRegion = useMemo(() => {
    if (regions.length === 0) return null;
    let topReg = regions[0];
    let maxRev = -1;
    for (const reg of regions) {
      const rev = regionTotals[reg] || 0;
      if (rev > maxRev) {
        maxRev = rev;
        topReg = reg;
      }
    }
    return { region: topReg, revenue: maxRev };
  }, [regions, regionTotals]);

  const hasData = rawRows.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Header
          onLoadSample={() => loadCsvContent(SAMPLE_CSV_DEFAULT, 'sample_sales_data.csv')}
          onReset={handleReset}
          hasData={hasData}
          activeDatasetName={fileName || undefined}
        />

        {/* Upload Box */}
        <UploadZone
          onFileUpload={handleFileUpload}
          onLoadCustomCsv={loadCsvContent}
          fileName={fileName}
          errorMessage={errorMessage}
          totalRecords={rawRows.length}
        />

        {/* Results Section */}
        {hasData && (
          <div className="space-y-8">
            {/* KPI Strip */}
            <KpiStrip
              rows={filteredRows}
              diagnostic={diagnostic}
              grandTotal={grandTotal}
              leadingRegion={leadingRegion}
            />

            {/* Filter Toolbar */}
            <FilterToolbar
              rows={rawRows}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={() =>
                setFilters({ region: 'all', channel: 'all', product: 'all' })
              }
            />

            {/* Grounded AI Diagnostic Card */}
            <AiDiagnosticCard diagnostic={diagnostic} />

            {/* Visualizations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <RevenueChart
                regions={regions}
                quarters={quarters}
                matrix={matrix}
              />
              <RevenueMatrixTable
                regions={regions}
                quarters={quarters}
                matrix={matrix}
                regionTotals={regionTotals}
                quarterTotals={quarterTotals}
                grandTotal={grandTotal}
              />
            </div>

            {/* Raw Data Viewer */}
            <RawDataViewer rows={filteredRows} />
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        <p>Sales Order Revenue & Q2–Q3 Dynamics Analyzer · Grounded Variance Diagnostics</p>
      </footer>
    </div>
  );
}
