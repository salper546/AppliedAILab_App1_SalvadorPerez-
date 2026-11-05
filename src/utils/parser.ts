import Papa from 'papaparse';
import { SalesRow } from '../types';

export const REQUIRED_COLUMNS = [
  'quarter',
  'region',
  'channel',
  'product',
  'units',
  'discount_pct',
  'revenue',
];

export const SAMPLE_CSV_DEFAULT = `quarter,region,channel,product,units,discount_pct,revenue
Q1,North,Direct,Widget A,150,0.05,14250
Q1,South,Retail,Widget B,200,0.10,18000
Q1,East,Online,Widget A,320,0.15,27200
Q1,West,Direct,Widget C,90,0.00,10800
Q2,North,Direct,Widget A,210,0.05,19950
Q2,North,Online,Widget B,180,0.10,16200
Q2,South,Retail,Widget B,250,0.05,23750
Q2,East,Online,Widget A,300,0.15,25500
Q2,West,Direct,Widget C,140,0.00,16800
Q3,North,Direct,Widget A,350,0.08,32200
Q3,North,Online,Widget B,290,0.12,25520
Q3,South,Retail,Widget B,240,0.05,22800
Q3,East,Online,Widget A,310,0.10,27900
Q3,West,Direct,Widget C,135,0.05,15390
Q4,North,Direct,Widget A,380,0.05,36100
Q4,South,Retail,Widget B,260,0.10,23400
Q4,East,Online,Widget A,340,0.15,28900
Q4,West,Direct,Widget C,160,0.00,19200`;

export const SAMPLE_CSV_GLOBAL = `quarter,region,channel,product,units,discount_pct,revenue
Q1,EMEA,Enterprise,Cloud Suite,420,0.08,84000
Q1,APAC,Partner,Cloud Suite,310,0.12,58000
Q1,Americas,Direct,Analytics Pro,650,0.05,130000
Q1,LATAM,Online,Starter Kit,220,0.00,22000
Q2,EMEA,Enterprise,Cloud Suite,480,0.08,96000
Q2,EMEA,Direct,Analytics Pro,290,0.05,58000
Q2,APAC,Partner,Cloud Suite,360,0.10,72000
Q2,Americas,Direct,Analytics Pro,820,0.06,164000
Q2,Americas,Online,Starter Kit,410,0.02,41000
Q2,LATAM,Online,Starter Kit,260,0.05,24700
Q3,EMEA,Enterprise,Cloud Suite,710,0.10,142000
Q3,EMEA,Direct,Analytics Pro,450,0.04,90000
Q3,APAC,Partner,Cloud Suite,400,0.10,80000
Q3,Americas,Direct,Analytics Pro,790,0.08,158000
Q3,Americas,Online,Starter Kit,430,0.02,43000
Q3,LATAM,Online,Starter Kit,290,0.05,27550
Q4,EMEA,Enterprise,Cloud Suite,750,0.10,150000
Q4,APAC,Partner,Cloud Suite,450,0.10,90000
Q4,Americas,Direct,Analytics Pro,880,0.05,176000
Q4,LATAM,Online,Starter Kit,320,0.05,30400`;

export interface ParseResult {
  rows: SalesRow[];
  error?: string;
  missingCols?: string[];
  totalRecords: number;
}

export function parseSalesCsv(csvText: string): ParseResult {
  if (!csvText || !csvText.trim()) {
    return {
      rows: [],
      error: 'The provided CSV file is empty.',
      totalRecords: 0,
    };
  }

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
    return {
      rows: [],
      error: `CSV syntax error: ${parsed.errors[0].message}`,
      totalRecords: 0,
    };
  }

  if (!parsed.data || parsed.data.length === 0) {
    return {
      rows: [],
      error: 'The provided CSV file contains no records.',
      totalRecords: 0,
    };
  }

  // Standardize field keys to lowercase
  const rawRows = parsed.data;
  const firstRow = rawRows[0];
  const normalizedHeaders = Object.keys(firstRow).map((k) =>
    k.trim().toLowerCase()
  );

  const missing = REQUIRED_COLUMNS.filter(
    (col) => !normalizedHeaders.includes(col)
  );
  if (missing.length > 0) {
    return {
      rows: [],
      error: `Missing required column(s): ${missing.join(', ')}`,
      missingCols: missing,
      totalRecords: rawRows.length,
    };
  }

  const cleanedRows: SalesRow[] = [];

  for (const raw of rawRows) {
    // Map lowercased properties
    const standard: Record<string, string> = {};
    for (const [key, val] of Object.entries(raw)) {
      standard[key.trim().toLowerCase()] = typeof val === 'string' ? val.trim() : String(val ?? '');
    }

    const quarter = standard['quarter'] ? standard['quarter'].toUpperCase() : '';
    const region = standard['region'] || 'Unknown';
    const channel = standard['channel'] || 'Other';
    const product = standard['product'] || 'General';

    // Parse units
    const unitsStr = (standard['units'] || '0').replace(/[^0-9.-]/g, '');
    const units = Math.max(0, parseFloat(unitsStr) || 0);

    // Parse discount_pct (handles both 0.05 and 5%)
    let discountStr = standard['discount_pct'] || '0';
    const hasPercent = discountStr.includes('%');
    discountStr = discountStr.replace(/[^0-9.-]/g, '');
    let discount_pct = parseFloat(discountStr) || 0;
    if (hasPercent || discount_pct > 1.0) {
      discount_pct = discount_pct / 100;
    }

    // Parse revenue
    const revenueStr = (standard['revenue'] || '0').replace(/[^0-9.-]/g, '');
    const revenue = parseFloat(revenueStr) || 0;

    if (quarter && region) {
      cleanedRows.push({
        quarter,
        region,
        channel,
        product,
        units,
        discount_pct,
        revenue,
      });
    }
  }

  if (cleanedRows.length === 0) {
    return {
      rows: [],
      error: 'No valid rows with quarter and region found in CSV.',
      totalRecords: rawRows.length,
    };
  }

  return {
    rows: cleanedRows,
    totalRecords: cleanedRows.length,
  };
}

export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
