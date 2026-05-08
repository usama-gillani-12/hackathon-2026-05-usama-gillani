export interface MarginEstimate {
  estimatedCost: number;
  suggestedPrice: number;
  estimatedMargin: number;
  marginPercent: number;
}

const CATEGORY_MARKUP: Record<string, number> = {
  electronics: 1.6,
  beauty: 2.4,
  fragrances: 2.2,
  groceries: 1.4,
  furniture: 1.7,
  smartphones: 1.5,
  laptops: 1.5,
  tablets: 1.5,
  'mens-shirts': 2.1,
  'mens-shoes': 2.0,
  'mens-watches': 2.2,
  'womens-bags': 2.3,
  'womens-dresses': 2.2,
  'womens-jewellery': 2.4,
  'womens-shoes': 2.1,
  'womens-watches': 2.2,
  'home-decoration': 2.0,
  lighting: 2.1,
  motorcycle: 1.6,
  automotive: 1.6,
  fitness: 2.3,
  pets: 2.4,
  baby: 2.3,
  kitchen: 2.0,
  'health-care': 2.2,
  general: 1.9,
};

const COST_RATIO: Record<string, number> = {
  electronics: 0.55,
  beauty: 0.25,
  fragrances: 0.3,
  groceries: 0.6,
  furniture: 0.45,
  smartphones: 0.6,
  laptops: 0.65,
  tablets: 0.6,
  'mens-shirts': 0.3,
  'mens-shoes': 0.35,
  'mens-watches': 0.3,
  'womens-bags': 0.3,
  'womens-dresses': 0.3,
  'womens-jewellery': 0.25,
  'womens-shoes': 0.35,
  'womens-watches': 0.3,
  'home-decoration': 0.3,
  lighting: 0.35,
  motorcycle: 0.5,
  automotive: 0.5,
  fitness: 0.3,
  pets: 0.25,
  baby: 0.3,
  kitchen: 0.35,
  'health-care': 0.3,
  general: 0.4,
};

export function calculateMargin(price: number, category: string): MarginEstimate {
  const cat = (category || 'general').toLowerCase();
  const markup = CATEGORY_MARKUP[cat] ?? 1.8;
  const costRatio = COST_RATIO[cat] ?? 0.4;
  const suggestedPrice = Math.round(price * markup * 100) / 100;
  const estimatedCost = Math.round(price * costRatio * 100) / 100;
  const estimatedMargin = Math.round((suggestedPrice - estimatedCost) * 100) / 100;
  const marginPercent = suggestedPrice > 0 ? Math.round(((estimatedMargin / suggestedPrice) * 100) * 10) / 10 : 0;
  return { estimatedCost, suggestedPrice, estimatedMargin, marginPercent };
}
