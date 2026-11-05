import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from 'chart.js';
import { RegionQuarterMatrix } from '../types';
import { formatCurrency } from '../utils/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
);

interface RevenueChartProps {
  regions: string[];
  quarters: string[];
  matrix: RegionQuarterMatrix;
}

type ChartViewMode = 'by-region' | 'by-quarter' | 'q2-q3-delta';

export const RevenueChart: React.FC<RevenueChartProps> = ({
  regions,
  quarters,
  matrix,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const [viewMode, setViewMode] = useState<ChartViewMode>('by-region');

  const palette = [
    '#4f46e5', // indigo-600
    '#06b6d4', // cyan-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
    '#3b82f6', // blue-500
  ];

  const hasQ2AndQ3 =
    quarters.some((q) => /^(Q2|2)$/i.test(q)) &&
    quarters.some((q) => /^(Q3|3)$/i.test(q));

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let chartLabels: string[] = [];
    let datasets: any[] = [];

    if (viewMode === 'by-region') {
      chartLabels = regions;
      datasets = quarters.map((q, idx) => ({
        label: q,
        data: regions.map((reg) => matrix[reg]?.[q] || 0),
        backgroundColor: palette[idx % palette.length],
        borderRadius: 4,
      }));
    } else if (viewMode === 'by-quarter') {
      chartLabels = quarters;
      datasets = regions.map((reg, idx) => ({
        label: reg,
        data: quarters.map((q) => matrix[reg]?.[q] || 0),
        backgroundColor: palette[idx % palette.length],
        borderRadius: 4,
      }));
    } else if (viewMode === 'q2-q3-delta') {
      const q2Key = quarters.find((q) => /^(Q2|2)$/i.test(q)) || 'Q2';
      const q3Key = quarters.find((q) => /^(Q3|3)$/i.test(q)) || 'Q3';

      chartLabels = regions;
      const deltas = regions.map((reg) => {
        const q2 = matrix[reg]?.[q2Key] || 0;
        const q3 = matrix[reg]?.[q3Key] || 0;
        return q3 - q2;
      });

      datasets = [
        {
          label: `${q3Key} vs ${q2Key} Revenue Variance`,
          data: deltas,
          backgroundColor: deltas.map((d) => (d >= 0 ? '#10b981' : '#f43f5e')),
          borderRadius: 4,
        },
      ];
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
            callbacks: {
              label: (item) => {
                const val = typeof item.raw === 'number' ? item.raw : 0;
                return `${item.dataset.label}: ${formatCurrency(val)}`;
              },
            },
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              boxHeight: 12,
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
              padding: 14,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
              color: '#475569',
            },
          },
          y: {
            beginAtZero: viewMode !== 'q2-q3-delta',
            grid: {
              color: '#f1f5f9',
            },
            ticks: {
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              color: '#64748b',
              callback: (val) => {
                const num = Number(val);
                if (Math.abs(num) >= 1_000_000) {
                  return '$' + (num / 1_000_000).toFixed(1) + 'M';
                }
                if (Math.abs(num) >= 1_000) {
                  return '$' + (num / 1_000).toFixed(0) + 'k';
                }
                return '$' + num.toLocaleString();
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [regions, quarters, matrix, viewMode]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Total Revenue by Region & Quarter
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Grouped quarterly distribution across sales territories
          </p>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('by-region')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'by-region'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Region
          </button>
          <button
            type="button"
            onClick={() => setViewMode('by-quarter')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'by-quarter'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Quarter
          </button>
          {hasQ2AndQ3 && (
            <button
              type="button"
              onClick={() => setViewMode('q2-q3-delta')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'q2-q3-delta'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q2→Q3 Shift
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-[320px] w-full">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
