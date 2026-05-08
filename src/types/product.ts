export type ProductSource = 'dummyjson' | 'fakestore' | 'mock' | 'amazon' | 'bestbuy';

export interface Product {
  id: string;
  source: ProductSource;
  title: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  discountPercent?: number;
  rating: number;
  stock: number;
  asin?: string;
  salesRank?: number;
  salesVolume?: string;
  thumbnail: string;
  images: string[];
}

export type Recommendation = 'Test Now' | 'Watch Closely' | 'Research More' | 'Avoid for Now';

export interface ScoreBreakdown {
  demand: number;
  socialBuzz: number;
  profitPotential: number;
  productRating: number;
  shippingEase: number;
  competition: number;
  risk: number;
}

export interface ScoredProduct {
  product: Product;
  scoreBreakdown: ScoreBreakdown;
  winningScore: number;
  rating10: number;
  recommendation: Recommendation;
  isPremium: boolean;
  unlockCost: number;
  estimatedCost: number;
  suggestedPrice: number;
  estimatedMargin: number;
  marginPercent: number;
  bestAudience: string;
  bestAdAngle: string;
  suggestedPlatforms: string[];
  aiSummary: string;
  whyTrending: string;
  risksToWatch: string;
  premiumReason: string;
  socialBuzzSources?: { youtube: number; reddit: number };
}

export type WatchlistStatus = 'Testing' | 'Watching' | 'Avoided';

export interface WatchlistItem {
  productId: string;
  status: WatchlistStatus;
  addedAt: number;
}

export interface DashboardStats {
  productsScanned: number;
  risingTrends: number;
  premiumOpportunities: number;
  productsUnlocked: number;
  topOpportunity?: ScoredProduct;
}

export interface ProductTestPlan {
  productId: string;
  suggestedPrice: number;
  targetAudience: string;
  adAngle: string;
  firstAdCopy: string;
  testingBudget: number;
  testDurationDays: number;
  successMetric: string;
}
