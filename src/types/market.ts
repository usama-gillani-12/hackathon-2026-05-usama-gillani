export interface MarketPulseItem {
  category: string;
  score: number;    // 0–100 momentum score
  trend: string;    // e.g. "+18%" or "-4%"
  hot: boolean;
  emoji: string;
  bars: number[];   // 5 values 0–100, for sparkline
}

export interface TrendingPost {
  id: string;
  title: string;
  url: string;
  points: number;
  comments: number;
  author: string;
  createdAt: string;  // ISO string
  category: string;   // auto-detected from title keywords
  isNew: boolean;     // posted < 24 hrs ago
  isHot: boolean;     // points > 100
}
