import React, { useState } from 'react';
import { Copy, Check, Sparkles, TrendingUp, TrendingDown, Layers, Box } from 'lucide-react';
import { GroundedDiagnostic } from '../types';
import { formatCurrency } from '../utils/analytics';

interface AiDiagnosticCardProps {
  diagnostic: GroundedDiagnostic;
}

export const AiDiagnosticCard: React.FC<AiDiagnosticCardProps> = ({ diagnostic }) => {
  const [copied, setCopied] = useState(false);

  const fullText = diagnostic.hasQ2AndQ3
    ? `1. ${diagnostic.sentence1}\n2. ${diagnostic.sentence2}\n3. ${diagnostic.sentence3}`
    : diagnostic.sentence1;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/90 border border-indigo-100 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
          </span>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
            AI Diagnostic: Q2 vs. Q3 Regional Shift
          </h2>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-white/80 hover:bg-white border border-indigo-200/80 transition-colors self-start sm:self-auto shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied Diagnostic</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Diagnostic</span>
            </>
          )}
        </button>
      </div>

      <div className="text-slate-800 text-sm sm:text-base leading-relaxed bg-white/85 p-5 rounded-lg border border-indigo-100/70 shadow-xs space-y-3">
        {diagnostic.hasQ2AndQ3 ? (
          <>
            <div className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold shrink-0 mt-0.5">
                1
              </span>
              <p className="text-slate-800 font-medium">
                {diagnostic.sentence1}
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold shrink-0 mt-0.5">
                2
              </span>
              <p className="text-slate-800 font-medium">
                {diagnostic.sentence2}
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold shrink-0 mt-0.5">
                3
              </span>
              <p className="text-slate-800 font-medium">
                {diagnostic.sentence3}
              </p>
            </div>
          </>
        ) : (
          <p className="text-amber-800 bg-amber-50/80 p-3 rounded-md border border-amber-200 text-sm">
            {diagnostic.sentence1}
          </p>
        )}
      </div>

      {diagnostic.hasQ2AndQ3 && (
        <div className="mt-4 pt-4 border-t border-indigo-100/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/60 rounded-lg p-2.5 border border-indigo-100/50">
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">
              Target Region
            </span>
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span>{diagnostic.targetRegion}</span>
              <span
                className={`tabular-nums font-medium ${
                  diagnostic.direction === 'increased'
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {diagnostic.direction === 'increased' ? '+' : '-'}
                {formatCurrency(Math.abs(diagnostic.targetRevDelta))}
              </span>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-2.5 border border-indigo-100/50">
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">
              Dominant Product Shift
            </span>
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span className="truncate">{diagnostic.topProduct}</span>
              <span className="tabular-nums font-medium text-slate-700">
                ±{formatCurrency(diagnostic.topProductDelta)}
              </span>
            </div>
          </div>

          <div className="bg-white/60 rounded-lg p-2.5 border border-indigo-100/50">
            <span className="text-slate-500 block text-[11px] uppercase tracking-wider mb-0.5">
              Dominant Channel Shift
            </span>
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span className="truncate">{diagnostic.topChannel}</span>
              <span className="tabular-nums font-medium text-slate-700">
                ±{formatCurrency(diagnostic.topChannelDelta)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
