import React, { useState, useMemo } from 'react';
import {
  Presentation,
  Download,
  Copy,
  Check,
  Printer,
  Maximize2,
  Minimize2,
  X,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  DollarSign,
  Package,
  Percent,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { GroundedDiagnostic, RegionQuarterMatrix, SalesRow } from '../types';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  computeExecutiveBoardInsights,
} from '../utils/analytics';
import { downloadFile } from '../utils/parser';

interface ExecutiveBoardSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: SalesRow[];
  diagnostic: GroundedDiagnostic;
  regions: string[];
  quarters: string[];
  matrix: RegionQuarterMatrix;
  activeDatasetName?: string;
}

type SlidePerspective = 'all' | 'ceo' | 'cfo' | 'board';
type SlideTheme = 'boardroom-dark' | 'executive-light';

export const ExecutiveBoardSlideModal: React.FC<ExecutiveBoardSlideModalProps> = ({
  isOpen,
  onClose,
  rows,
  diagnostic,
  regions,
  quarters,
  matrix,
  activeDatasetName = 'Sales Order Portfolio',
}) => {
  const [perspective, setPerspective] = useState<SlidePerspective>('all');
  const [theme, setTheme] = useState<SlideTheme>('boardroom-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Editable board slide titles and context
  const [meetingTitle, setMeetingTitle] = useState('Quarterly Board of Directors Review');
  const [slideSubtitle, setSlideSubtitle] = useState('Q2 vs. Q3 Revenue Variance, Territory Dynamics & Margin Audit');
  const [meetingDate, setMeetingDate] = useState('Fiscal Q3 Executive Session');
  const [presenterTitle, setPresenterTitle] = useState('Office of the CEO & CFO');
  const [customCeoPriority, setCustomCeoPriority] = useState('');
  const [customCfoPriority, setCustomCfoPriority] = useState('');
  const [customBoardPriority, setCustomBoardPriority] = useState('');

  const insights = useMemo(() => {
    return computeExecutiveBoardInsights(rows, diagnostic);
  }, [rows, diagnostic]);

  if (!isOpen) return null;

  const isDark = theme === 'boardroom-dark';

  const handleCopyExecutiveBrief = () => {
    const memo = `================================================================================
EXECUTIVE BOARD MEMORANDUM · QUARTERLY REVENUE & MARGIN VARIANCE
Audience: Chief Executive Officer, Chief Financial Officer & Board Chairs
Meeting: ${meetingTitle} (${meetingDate})
Presenter: ${presenterTitle}
Dataset Scope: ${activeDatasetName} (${rows.length.toLocaleString()} transactions)
================================================================================

1. EXECUTIVE SUMMARY & GROUNDED DIAGNOSTICS
--------------------------------------------------------------------------------
${diagnostic.sentence1}
${diagnostic.sentence2}
${diagnostic.sentence3}

2. ENTERPRISE FINANCIAL MACRO METRICS (Q2 vs Q3)
--------------------------------------------------------------------------------
- Total Q2 Revenue: ${formatCurrency(insights.totalQ2Rev)}
- Total Q3 Revenue: ${formatCurrency(insights.totalQ3Rev)}
- Net Revenue Variance: ${insights.totalQoQDelta >= 0 ? '+' : ''}${formatCurrency(insights.totalQoQDelta)} (${insights.totalQoQPct >= 0 ? '+' : ''}${insights.totalQoQPct.toFixed(1)}%)
- Total Unit Volume: ${insights.totalQ2Units.toLocaleString()} (Q2) -> ${insights.totalQ3Units.toLocaleString()} (Q3) [${insights.totalUnitsDelta >= 0 ? '+' : ''}${insights.totalUnitsDelta.toLocaleString()} units]
- Average Selling Price (ASP): ${formatCurrency(insights.q2Asp)} -> ${formatCurrency(insights.q3Asp)}/unit (${insights.aspDelta >= 0 ? '+' : ''}${formatCurrency(insights.aspDelta)})
- Blended Contract Discount: ${formatPercent(insights.q2AvgDiscount)} -> ${formatPercent(insights.q3AvgDiscount)} (${insights.discountDeltaBps >= 0 ? '+' : ''}${insights.discountDeltaBps} bps)

3. CEO STRATEGIC COMMENTARY (COMMERCIAL EXPANSION & GTM)
--------------------------------------------------------------------------------
${insights.ceoDirectives.map((d, i) => `[${i + 1}] ${d}`).join('\n')}
${customCeoPriority ? `[Additional CEO Focus]: ${customCeoPriority}` : ''}

4. CFO FINANCIAL & AUDIT BRIDGE (PRICE/VOLUME & MARGIN AUDIT)
--------------------------------------------------------------------------------
${insights.cfoFinancialBridge.map((b, i) => `[${i + 1}] ${b}`).join('\n')}
${customCfoPriority ? `[Additional CFO Focus]: ${customCfoPriority}` : ''}

5. BOARD CHAIR GOVERNANCE & CAPITAL ALLOCATION DIRECTIVES
--------------------------------------------------------------------------------
${insights.boardGovernanceNotes.map((g, i) => `[${i + 1}] ${g}`).join('\n')}
${customBoardPriority ? `[Additional Board Priority]: ${customBoardPriority}` : ''}

6. REGIONAL REVENUE SUMMARY
--------------------------------------------------------------------------------
${insights.regionalBreakdown
  .map(
    (r) =>
      `- ${r.region.padEnd(14)} Q2: ${formatCurrency(r.q2Rev).padEnd(12)} Q3: ${formatCurrency(r.q3Rev).padEnd(12)} Shift: ${r.delta >= 0 ? '+' : ''}${formatCurrency(r.delta)} (${r.pct >= 0 ? '+' : ''}${r.pct.toFixed(1)}%)`
  )
  .join('\n')}
================================================================================`;

    navigator.clipboard.writeText(memo);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const handleDownloadHtmlSlide = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${meetingTitle} - Executive Board Slide</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} p-6 min-h-screen flex items-center justify-center">
  <div class="max-w-6xl w-full ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl p-8 shadow-2xl">
    <div class="flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} pb-6 mb-6">
      <div>
        <span class="text-xs font-bold tracking-widest uppercase text-indigo-500">Board Executive Review · C-Suite Brief</span>
        <h1 class="text-2xl font-bold mt-1">${meetingTitle}</h1>
        <p class="text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-0.5">${slideSubtitle}</p>
      </div>
      <div class="text-right text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}">
        <p class="font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}">${presenterTitle}</p>
        <p>${meetingDate}</p>
      </div>
    </div>

    <!-- Macro KPIs -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border">
        <span class="text-xs uppercase text-slate-500 font-semibold">Net QoQ Revenue</span>
        <div class="text-xl font-bold mono mt-1 ${insights.totalQoQDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'}">
          ${insights.totalQoQDelta >= 0 ? '+' : ''}${formatCurrency(insights.totalQoQDelta)}
        </div>
        <span class="text-[11px] text-slate-400">${insights.totalQoQPct >= 0 ? '+' : ''}${insights.totalQoQPct.toFixed(1)}% vs. Q2</span>
      </div>
      <div class="${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border">
        <span class="text-xs uppercase text-slate-500 font-semibold">Volume Shipped</span>
        <div class="text-xl font-bold mono mt-1">${formatNumber(insights.totalQ3Units)} units</div>
        <span class="text-[11px] text-slate-400">${insights.totalUnitsDelta >= 0 ? '+' : ''}${insights.totalUnitsDelta.toLocaleString()} units QoQ</span>
      </div>
      <div class="${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border">
        <span class="text-xs uppercase text-slate-500 font-semibold">Avg Selling Price</span>
        <div class="text-xl font-bold mono mt-1">${formatCurrency(insights.q3Asp)}</div>
        <span class="text-[11px] text-slate-400">${insights.aspDelta >= 0 ? '+' : ''}${formatCurrency(insights.aspDelta)}/unit</span>
      </div>
      <div class="${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border">
        <span class="text-xs uppercase text-slate-500 font-semibold">Blended Discount</span>
        <div class="text-xl font-bold mono mt-1">${formatPercent(insights.q3AvgDiscount)}</div>
        <span class="text-[11px] text-slate-400">${insights.discountDeltaBps >= 0 ? '+' : ''}${insights.discountDeltaBps} bps QoQ</span>
      </div>
    </div>

    <!-- Diagnostic and Regional Split -->
    <div class="grid grid-cols-3 gap-6">
      <div class="${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'} p-5 rounded-xl border">
        <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3">CEO Commercial Synthesis</h3>
        <p class="text-xs leading-relaxed mb-3">${diagnostic.sentence1}</p>
        <p class="text-xs leading-relaxed mb-3">${diagnostic.sentence2}</p>
        <p class="text-xs leading-relaxed">${diagnostic.sentence3}</p>
      </div>

      <div class="${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'} p-5 rounded-xl border">
        <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3">Territory Performance</h3>
        <div class="space-y-2 text-xs">
          ${insights.regionalBreakdown
            .map(
              (r) => `
            <div class="flex items-center justify-between py-1 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}">
              <span class="font-medium">${r.region}</span>
              <span class="mono ${r.delta >= 0 ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}">
                ${r.delta >= 0 ? '+' : ''}${formatCurrency(r.delta)} (${r.pct >= 0 ? '+' : ''}${r.pct.toFixed(1)}%)
              </span>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-200'} p-5 rounded-xl border">
        <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-3">CFO & Board Governance Directives</h3>
        <ul class="text-xs space-y-2.5">
          <li><strong>CFO Reconciliation:</strong> ${insights.cfoFinancialBridge[0]}</li>
          <li><strong>Pricing Discipline:</strong> ${insights.cfoFinancialBridge[1]}</li>
          <li><strong>Board Oversight:</strong> ${insights.boardGovernanceNotes[2]}</li>
        </ul>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'} text-[11px] flex justify-between">
      <span>Grounded Deterministic Variance Audit · Board of Directors Confidential</span>
      <span>Generated from ${activeDatasetName}</span>
    </div>
  </div>
</body>
</html>`;

    downloadFile(htmlContent, 'executive_board_slide_deck.html', 'text/html;charset=utf-8;');
  };

  const handlePrint = () => {
    window.print();
  };

  // Find max regional revenue for scaling bars
  const maxRegionRevenue = Math.max(
    ...insights.regionalBreakdown.map((r) => Math.max(r.q2Rev, r.q3Rev, 1)),
    1
  );

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-opacity ${
        isFullscreen ? 'p-0!' : ''
      }`}
    >
      <div
        className={`w-full ${
          isFullscreen ? 'h-screen max-w-none rounded-none' : 'max-w-7xl rounded-2xl'
        } ${
          isDark
            ? 'bg-slate-900 text-slate-100 border-slate-800'
            : 'bg-slate-50 text-slate-900 border-slate-200'
        } border shadow-2xl flex flex-col max-h-[96vh] overflow-hidden transition-all`}
      >
        {/* Top Control Bar (Screen only, hidden on print) */}
        <div
          className={`no-print px-5 py-3.5 border-b ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white'
          } flex flex-wrap items-center justify-between gap-3 shrink-0`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Presentation className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight">
                  Executive Board Slide Builder
                </h2>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  CEO · CFO · Board Chairs
                </span>
              </div>
            </div>
          </div>

          {/* Perspective Selector (Segmented controls) */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs">
            <button
              onClick={() => setPerspective('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                perspective === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Leadership
            </button>
            <button
              onClick={() => setPerspective('ceo')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                perspective === 'ceo'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CEO Lens
            </button>
            <button
              onClick={() => setPerspective('cfo')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                perspective === 'cfo'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CFO Lens
            </button>
            <button
              onClick={() => setPerspective('board')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                perspective === 'board'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Board Chair Lens
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? 'executive-light' : 'boardroom-dark')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Toggle Slide Theme"
            >
              {isDark ? '☀️ Light Slide' : '🌙 Dark Slide'}
            </button>

            <button
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1 ${
                isEditingNotes
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Customize Slide Labels & Directives"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingNotes ? 'Done Editing' : 'Customize'}</span>
            </button>

            <button
              onClick={handleCopyExecutiveBrief}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Copy Board Briefing Memo to Clipboard"
            >
              {copiedMemo ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Memo</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadHtmlSlide}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors inline-flex items-center gap-1.5"
              title="Download Self-Contained Standalone Slide HTML"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors inline-flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF / Print</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={isFullscreen ? 'Exit Fullscreen' : 'Present Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Slide Customizer Tray */}
        {isEditingNotes && (
          <div
            className={`no-print p-4 border-b ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            } text-xs grid grid-cols-1 md:grid-cols-4 gap-3 animate-in fade-in duration-200`}
          >
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Board Meeting Title</label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded border text-xs ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Meeting Subtitle</label>
              <input
                type="text"
                value={slideSubtitle}
                onChange={(e) => setSlideSubtitle(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded border text-xs ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Session Date / Quarter</label>
              <input
                type="text"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded border text-xs ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Presenter Title</label>
              <input
                type="text"
                value={presenterTitle}
                onChange={(e) => setPresenterTitle(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded border text-xs ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>
        )}

        {/* The 16:9 Slide Viewport Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
          <div
            id="executive-slide-print-root"
            className={`print-only-slide w-full max-w-6xl aspect-[16/9.5] sm:aspect-[16/9] ${
              isDark
                ? 'bg-slate-950 text-slate-100 border-slate-800 shadow-2xl'
                : 'bg-white text-slate-900 border-slate-300 shadow-xl'
            } border rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-colors`}
          >
            {/* Slide Header Zone */}
            <div
              className={`border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              } pb-4 mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3`}
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-indigo-500">
                  <span>Quarterly Board of Directors Briefing</span>
                  <span>·</span>
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    Confidential C-Suite Material
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-balance">
                  {meetingTitle}
                </h1>
                <p
                  className={`text-xs sm:text-sm mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {slideSubtitle}
                </p>
              </div>

              <div
                className={`text-left sm:text-right text-xs shrink-0 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {presenterTitle}
                </div>
                <div>{meetingDate}</div>
                <div className="text-[11px] text-slate-500">
                  Dataset: {activeDatasetName}
                </div>
              </div>
            </div>

            {/* Slide Macro KPIs Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {/* Metric 1: Net QoQ Revenue */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-slate-50/90 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <span>Net QoQ Revenue</span>
                  <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div
                  className={`text-lg sm:text-xl font-bold tabular-nums mt-1 ${
                    insights.totalQoQDelta >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {insights.totalQoQDelta >= 0 ? '+' : ''}
                  {formatCurrency(insights.totalQoQDelta)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Q2: {formatCurrency(insights.totalQ2Rev)} → Q3: {formatCurrency(insights.totalQ3Rev)} (
                  {insights.totalQoQPct >= 0 ? '+' : ''}
                  {insights.totalQoQPct.toFixed(1)}%)
                </div>
              </div>

              {/* Metric 2: Unit Volume */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-slate-50/90 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <span>Total Commercial Units</span>
                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold tabular-nums mt-1">
                  {formatNumber(insights.totalQ3Units)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {insights.totalUnitsDelta >= 0 ? '+' : ''}
                  {insights.totalUnitsDelta.toLocaleString()} units ({insights.totalUnitsPct >= 0 ? '+' : ''}
                  {insights.totalUnitsPct.toFixed(1)}% QoQ)
                </div>
              </div>

              {/* Metric 3: Average Selling Price */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-slate-50/90 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <span>Average Selling Price</span>
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold tabular-nums mt-1">
                  {formatCurrency(insights.q3Asp)}/unit
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Shift: {insights.aspDelta >= 0 ? '+' : ''}
                  {formatCurrency(insights.aspDelta)} vs Q2 ({formatCurrency(insights.q2Asp)})
                </div>
              </div>

              {/* Metric 4: Pricing & Margin Discipline */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-slate-50/90 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <span>Blended Contract Discount</span>
                  <Percent className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-lg sm:text-xl font-bold tabular-nums mt-1">
                  {formatPercent(insights.q3AvgDiscount)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {insights.discountDeltaBps >= 0 ? '+' : ''}
                  {insights.discountDeltaBps} bps vs Q2 ({formatPercent(insights.q2AvgDiscount)})
                </div>
              </div>
            </div>

            {/* Main Content Area (Dynamic based on selected perspective) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
              {/* Left Column: Grounded Diagnostic & Core Story (4 cols) */}
              <div
                className={`lg:col-span-4 p-4 rounded-xl border flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800/80'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Executive Grounded Diagnostic</span>
                  </div>
                  <div
                    className={`text-xs leading-relaxed space-y-2.5 p-3 rounded-lg border ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <p className="font-medium">
                      <strong className="text-indigo-500">1. Territory Variance: </strong>
                      {diagnostic.sentence1}
                    </p>
                    <p className="font-medium">
                      <strong className="text-indigo-500">2. Product Engine: </strong>
                      {diagnostic.sentence2}
                    </p>
                    <p className="font-medium">
                      <strong className="text-indigo-500">3. Operational Volume: </strong>
                      {diagnostic.sentence3}
                    </p>
                  </div>
                </div>

                {/* Leading territory card */}
                <div
                  className={`mt-3 p-3 rounded-lg border text-xs ${
                    isDark
                      ? 'bg-indigo-950/30 border-indigo-900/60 text-slate-300'
                      : 'bg-indigo-50/70 border-indigo-200 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold uppercase text-[10px] tracking-wider text-indigo-400">
                      Primary Variance Territory
                    </span>
                    <span
                      className={`font-bold tabular-nums ${
                        diagnostic.direction === 'increased'
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {diagnostic.direction === 'increased' ? '+' : '-'}
                      {formatCurrency(Math.abs(diagnostic.targetRevDelta))}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {diagnostic.targetRegion} accounted for the highest single-region variance,
                    anchored by {diagnostic.topProduct} and {diagnostic.topChannel} channels.
                  </div>
                </div>
              </div>

              {/* Center Column: Visual Variance Bridge (4 cols) */}
              <div
                className={`lg:col-span-4 p-4 rounded-xl border flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800/80'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Territory Performance Bridge</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">Q2 vs Q3</span>
                  </div>

                  {/* Horizontal Bar Chart for all regions */}
                  <div className="space-y-2.5">
                    {insights.regionalBreakdown.map((r) => {
                      const q2Pct = (r.q2Rev / maxRegionRevenue) * 100;
                      const q3Pct = (r.q3Rev / maxRegionRevenue) * 100;
                      const isUp = r.delta >= 0;

                      return (
                        <div key={r.region} className="text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-slate-300">{r.region}</span>
                            <span
                              className={`tabular-nums font-semibold ${
                                isUp ? 'text-emerald-500' : 'text-rose-500'
                              }`}
                            >
                              {isUp ? '+' : ''}
                              {formatCurrency(r.delta)} ({isUp ? '+' : ''}
                              {r.pct.toFixed(1)}%)
                            </span>
                          </div>
                          {/* Comparative visual tracks */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="w-5 shrink-0">Q2</span>
                              <div
                                className={`flex-1 h-1.5 rounded-full ${
                                  isDark ? 'bg-slate-800' : 'bg-slate-200'
                                } overflow-hidden`}
                              >
                                <div
                                  className="h-full bg-slate-400 rounded-full"
                                  style={{ width: `${Math.max(q2Pct, 3)}%` }}
                                ></div>
                              </div>
                              <span className="w-12 text-right tabular-nums">
                                {formatCurrency(r.q2Rev)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="w-5 shrink-0">Q3</span>
                              <div
                                className={`flex-1 h-1.5 rounded-full ${
                                  isDark ? 'bg-slate-800' : 'bg-slate-200'
                                } overflow-hidden`}
                              >
                                <div
                                  className={`h-full rounded-full ${
                                    isUp ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.max(q3Pct, 3)}%` }}
                                ></div>
                              </div>
                              <span
                                className={`w-12 text-right tabular-nums font-medium ${
                                  isUp ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {formatCurrency(r.q3Rev)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Product & Channel Highlights */}
                <div
                  className={`mt-3 pt-3 border-t text-[11px] grid grid-cols-2 gap-2 ${
                    isDark ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px]">
                      Top Product Shift
                    </span>
                    <span className="font-semibold truncate block">
                      {insights.productBreakdown[0]?.product || 'General'}
                    </span>
                    <span className="tabular-nums text-indigo-400">
                      {insights.productBreakdown[0]?.delta >= 0 ? '+' : ''}
                      {formatCurrency(insights.productBreakdown[0]?.delta || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[10px]">
                      Top Channel Shift
                    </span>
                    <span className="font-semibold truncate block">
                      {insights.channelBreakdown[0]?.channel || 'Direct'}
                    </span>
                    <span className="tabular-nums text-indigo-400">
                      {insights.channelBreakdown[0]?.delta >= 0 ? '+' : ''}
                      {formatCurrency(insights.channelBreakdown[0]?.delta || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: C-Suite Directives & Governance (4 cols) */}
              <div
                className={`lg:col-span-4 p-4 rounded-xl border flex flex-col justify-between ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800/80'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {perspective === 'ceo'
                        ? 'CEO Strategic Directives'
                        : perspective === 'cfo'
                        ? 'CFO Margin & Financial Bridge'
                        : perspective === 'board'
                        ? 'Board Governance & Advisory'
                        : 'Leadership & Board Directives'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed">
                    {(perspective === 'all' || perspective === 'ceo') && (
                      <div
                        className={`p-2.5 rounded-lg border ${
                          isDark
                            ? 'bg-slate-950/60 border-slate-800'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                          <span>CEO Focus: Commercial Momentum</span>
                        </div>
                        <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                          {insights.ceoDirectives[0]}
                        </p>
                        <p
                          className={`mt-1.5 text-[11px] ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {insights.ceoDirectives[2]}
                        </p>
                      </div>
                    )}

                    {(perspective === 'all' || perspective === 'cfo') && (
                      <div
                        className={`p-2.5 rounded-lg border ${
                          isDark
                            ? 'bg-slate-950/60 border-slate-800'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
                          <span>CFO Focus: Margins & Pricing Discipline</span>
                        </div>
                        <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                          {insights.cfoFinancialBridge[0]}
                        </p>
                        <p
                          className={`mt-1.5 text-[11px] ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {insights.cfoFinancialBridge[1]}
                        </p>
                      </div>
                    )}

                    {(perspective === 'all' || perspective === 'board') && (
                      <div
                        className={`p-2.5 rounded-lg border ${
                          isDark
                            ? 'bg-slate-950/60 border-slate-800'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                          <span>Board Chair Focus: Oversight & Allocation</span>
                        </div>
                        <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                          {insights.boardGovernanceNotes[1]}
                        </p>
                        <p
                          className={`mt-1.5 text-[11px] ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {insights.boardGovernanceNotes[2]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer sign-off inside card */}
                <div
                  className={`mt-3 pt-3 border-t text-[11px] flex items-center justify-between ${
                    isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <span>Q4 Forward Outlook: Defensible</span>
                  <span className="font-semibold text-emerald-500">Audit Status: Reconciled</span>
                </div>
              </div>
            </div>

            {/* Slide Legal / Confidentiality Footer */}
            <div
              className={`border-t ${
                isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
              } pt-3 mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] gap-2`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-400">BOARD CONFIDENTIAL</span>
                <span>·</span>
                <span>Deterministic Calculation Grounded in Underlying CSV Sales Transactions</span>
              </div>
              <div className="tabular-nums">
                Page 1 of 1 · Executive Board Deck
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar with Keyboard Hint and Close */}
        <div
          className={`no-print px-6 py-3 border-t ${
            isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-500'
          } text-xs flex items-center justify-between`}
        >
          <span>
            Use <strong>Fullscreen</strong> for live projector presentations or <strong>PDF / Print</strong> for physical board binders.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            Close Slide
          </button>
        </div>
      </div>
    </div>
  );
};
