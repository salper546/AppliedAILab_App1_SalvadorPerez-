# Application Architecture: Sales Order Revenue & Dynamics Analyzer

## Business Overview

The Sales Order Revenue & Dynamics Analyzer is an executive financial intelligence platform designed to ingest raw sales transaction data, aggregate regional quarterly revenues into multi-dimensional matrices, and automatically generate grounded, audit-ready diagnostic insights explaining quarter-over-quarter revenue shifts (specifically between Q2 and Q3). By mathematically evaluating variance contributors—including leading territory performance, top moving product lines, dominant sales channels, unit volume fluctuations, and average discount changes—the platform enables sales leadership, finance teams, and commercial operations executives to understand not only what changed in their top-line performance, but precisely why it changed, completely grounded in underlying transaction records.

## System File Inventory

| File Path | Description |
| :--- | :--- |
| `/.env.example` | Defines the environment variable template for external configurations such as the Gemini API key. |
| `/.gitignore` | Specifies directories and temporary build artifacts to exclude from version control tracking. |
| `/bun.lock` | Preserves deterministic package resolution lockfile metadata for the project dependencies. |
| `/index.html` | Serves as the primary HTML entry page for the web application, establishing branding fonts and metadata tags. |
| `/metadata.json` | Specifies the application identity, descriptive metadata, and required platform capabilities for the AI Studio runtime. |
| `/package.json` | Declares all third-party dependencies, project metadata, and development execution scripts. |
| `/public/assets/aistudio/ai_studio_code__3__f9e8978a.html` | Archives the original reference single-page implementation of the sales order revenue analyzer. |
| `/src/App.tsx` | Serves as the root React component, managing dataset lifecycle, multi-attribute filtering, analytics calculations, and overall view orchestration. |
| `/src/components/AiDiagnosticCard.tsx` | Renders the structured three-sentence diagnostic summary explaining the primary regional variance and its dominant product, channel, and discount drivers. |
| `/src/components/ExecutiveBoardSlideModal.tsx` | Builds and presents an executive 16:9 widescreen presentation slide formatted for the CEO, CFO, and Board Chairs, complete with role perspectives, PDF printing, and HTML export. |
| `/src/components/FilterToolbar.tsx` | Provides user controls to slice and filter sales transactions dynamically across regions, sales channels, and product categories. |
| `/src/components/Header.tsx` | Displays the application title banner, dataset indicators, and quick-action controls for resetting state or loading pre-built sample datasets. |
| `/src/components/KpiStrip.tsx` | Presents executive headline KPIs including total gross revenue, top variance territory, total volume sold, and blended average discount rates. |
| `/src/components/RawDataViewer.tsx` | Provides an interactive, searchable, and paginated data table allowing users to audit individual sales order records and download them as CSV. |
| `/src/components/RevenueChart.tsx` | Visualizes quarterly regional revenue distributions and Q2-to-Q3 variance deltas using interactive bar charts. |
| `/src/components/RevenueMatrixTable.tsx` | Presents a cross-tabulated revenue breakdown matrix by territory and fiscal quarter, complete with clipboard copying and CSV export features. |
| `/src/components/UploadZone.tsx` | Manages file drag-and-drop ingestion, column schema validation, error reporting, sample dataset switching, and template CSV downloads. |
| `/src/index.css` | Imports Tailwind CSS utility layers and configures global typography and tabular numeric formatting rules. |
| `/src/main.tsx` | Bootstraps and mounts the React application into the browser DOM container. |
| `/src/types.ts` | Defines the central TypeScript data schemas for order records, cross-tabulation matrices, diagnostic models, and filter configurations. |
| `/src/utils/analytics.ts` | Houses mathematical calculation engines that aggregate revenue matrices and deterministically evaluate driver metrics between fiscal quarters. |
| `/src/utils/parser.ts` | Implements RFC-compliant CSV parsing, data sanitization, schema validation rules, and bundled sample dataset repositories. |
| `/tsconfig.json` | Configures TypeScript compiler settings, target ECMAScript standards, path aliases, and type-checking behaviors. |
| `/vite.config.ts` | Configures the Vite development server network binding, host allowance, React plugin, and Tailwind CSS compiler integration. |
