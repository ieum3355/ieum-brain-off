export interface Stock {
  id: string;
  name: string;
  ticker: string;
  recommendedPrice: number;
  currentPrice: number;
  captureDate: string;
  captureTime: string;
  status: 'stable' | 'rising' | 'target_near' | 'caution' | 'closed';
  isClosed?: boolean;
  finalReturn?: number;
  changeRate: number;
  volume: number;
  avgVolume: number;
  supportPrice: number;
  resistancePrice: number;
  chartData: number[];
  volumeRatio: number;
  maDistance: number;

  marketCap: number;
  high20Day: number;
  volumeGrowthRank: number;
  hasAccumulation: boolean;
  isRisky: boolean;
  maTrend: 'up' | 'down' | 'flat';
  marketStrength: number;
  isInstitutionalBuying: boolean;

  hitRate?: number;
  entryGrid?: {
    entry: number;
    target: number;
    stop: number;
  };

  albbanooScore: number;
  tier?: 'Premium' | 'Standard' | 'Basic';
  isLocked?: boolean;
  reasoning?: {
    title: string;
    content: string;
    steps: {
      label: string;
      value: string;
      status: 'success' | 'warning';
      desc: string;
    }[];
  };
}

export const mockStocks: Stock[] = [];

export const mockHistory: Stock[] = [];
