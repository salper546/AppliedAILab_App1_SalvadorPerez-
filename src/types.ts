export interface SalesRow {
  quarter: string;
  region: string;
  channel: string;
  product: string;
  units: number;
  discount_pct: number;
  revenue: number;
}

export interface RegionQuarterMatrix {
  [region: string]: {
    [quarter: string]: number;
  };
}

export interface GroundedDiagnostic {
  hasQ2AndQ3: boolean;
  targetRegion: string | null;
  targetRevDelta: number;
  targetRevPct: number;
  targetQ2Rev: number;
  targetQ3Rev: number;
  direction: 'increased' | 'decreased';
  topProduct: string | null;
  topProductDelta: number;
  topProductQ2Rev: number;
  topProductQ3Rev: number;
  topProductSignedDelta: number;
  topChannel: string | null;
  topChannelDelta: number;
  topChannelSignedDelta: number;
  q2Units: number;
  q3Units: number;
  unitsDelta: number;
  avgQ2Disc: number;
  avgQ3Disc: number;
  sentence1: string;
  sentence2: string;
  sentence3: string;
}

export interface FilterState {
  region: string;
  channel: string;
  product: string;
}
