import {
  Product,
  ProductTestPlan,
  Recommendation,
  ScoreBreakdown,
  ScoredProduct,
} from '@t/product';
import { calculateMargin } from '@utils/calculateMargin';

const COMPETITION_BY_CATEGORY: Record<string, number> = {
  smartphones: 88,
  laptops: 80,
  electronics: 72,
  fragrances: 65,
  beauty: 60,
  'mens-shirts': 70,
  'mens-shoes': 70,
  'womens-dresses': 75,
  'womens-shoes': 70,
  'womens-bags': 65,
  furniture: 55,
  'home-decoration': 45,
  lighting: 40,
  kitchen: 50,
  fitness: 55,
  pets: 38,
  baby: 42,
  automotive: 45,
  motorcycle: 50,
  groceries: 80,
  'health-care': 60,
  general: 60,
};

const SHIPPING_EASE_BY_CATEGORY: Record<string, number> = {
  beauty: 88,
  fragrances: 78,
  'home-decoration': 75,
  lighting: 80,
  kitchen: 70,
  pets: 82,
  baby: 80,
  fitness: 78,
  automotive: 60,
  motorcycle: 35,
  furniture: 30,
  laptops: 55,
  smartphones: 70,
  electronics: 70,
  'mens-shirts': 90,
  'womens-dresses': 88,
  'womens-bags': 80,
  groceries: 50,
  'health-care': 75,
  general: 70,
};

const RISK_BY_CATEGORY: Record<string, number> = {
  electronics: 65,
  smartphones: 70,
  laptops: 70,
  beauty: 55,
  fragrances: 60,
  'health-care': 60,
  baby: 55,
  automotive: 50,
  motorcycle: 60,
  pets: 30,
  fitness: 35,
  kitchen: 45,
  'home-decoration': 25,
  lighting: 35,
  furniture: 50,
  groceries: 30,
  'mens-shirts': 25,
  'womens-dresses': 28,
  'womens-bags': 30,
  general: 45,
};

const AUDIENCE_BY_CATEGORY: Record<string, string> = {
  pets: 'Pet owners aged 22–45 on Instagram and TikTok',
  beauty: 'Skincare-focused women aged 18–34 on TikTok and Reels',
  fragrances: 'Gen-Z fragrance enthusiasts on TikTok',
  electronics: 'Tech-curious millennials on YouTube and TikTok',
  smartphones: 'Smartphone upgraders aged 22–40',
  fitness: 'Home-gym millennials and Gen Z on Instagram and TikTok',
  baby: 'New parents aged 25–38 on Facebook and Instagram',
  kitchen: 'Home-cooking and meal-prep millennials on TikTok',
  'home-decoration': 'Aesthetic-focused renters and homeowners aged 22–40',
  lighting: 'Gamers, streamers, and Gen-Z bedroom decorators',
  automotive: 'Car enthusiasts and rideshare drivers aged 24–45',
  general: 'Trend-driven shoppers aged 20–40 on TikTok and Instagram',
};

const AD_ANGLE_BY_TITLE: { keywords: string[]; angle: string }[] = [
  { keywords: ['pet', 'dog', 'cat', 'puppy'], angle: 'Keep your pet hydrated and happy anywhere you go.' },
  { keywords: ['fan', 'cooling', 'neck'], angle: 'Beat the heat hands-free, all summer long.' },
  { keywords: ['printer', 'thermal'], angle: 'Print your thoughts in seconds — no ink, no setup.' },
  { keywords: ['mask', 'face', 'glow', 'led'], angle: 'Spa-grade glow at home in 10 minutes a day.' },
  { keywords: ['storage', 'foldable', 'organizer'], angle: 'Reclaim your closet without buying new furniture.' },
  { keywords: ['blender', 'kitchen'], angle: 'Smoothies anywhere — no kitchen required.' },
  { keywords: ['vacuum', 'cleaner'], angle: 'A cleaner car in under 2 minutes.' },
  { keywords: ['light', 'rgb', 'lamp'], angle: 'Transform any room with cinematic light.' },
  { keywords: ['band', 'fitness', 'yoga'], angle: 'A full home gym that fits in your bag.' },
  { keywords: ['baby', 'nail', 'infant'], angle: 'Trim baby nails safely without the panic.' },
];

const PLATFORMS_DEFAULT = ['Shopify', 'TikTok Shop', 'Instagram Reels', 'Facebook Ads'];

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

// 1–10 rating ladder — generous on the high end so 90+ winners feel premium.
function scoreToRating10(score: number): number {
  if (score >= 90) return 10;
  if (score >= 80) return 9;
  if (score >= 72) return 8;
  if (score >= 64) return 7;
  if (score >= 56) return 6;
  if (score >= 48) return 5;
  if (score >= 38) return 4;
  if (score >= 28) return 3;
  if (score >= 18) return 2;
  return 1;
}

function pickAudience(category: string): string {
  const cat = (category || 'general').toLowerCase();
  return AUDIENCE_BY_CATEGORY[cat] ?? AUDIENCE_BY_CATEGORY.general;
}

function pickAdAngle(title: string, category: string): string {
  const lower = title.toLowerCase();
  for (const entry of AD_ANGLE_BY_TITLE) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.angle;
  }
  if (category.toLowerCase().includes('beauty')) return 'Glow up overnight — viral on TikTok this month.';
  return 'Solve a tiny daily annoyance your customers feel every day.';
}

function recommendationFor(score: number): Recommendation {
  if (score >= 85) return 'Test Now';
  if (score >= 70) return 'Watch Closely';
  if (score >= 50) return 'Research More';
  return 'Avoid for Now';
}

function unlockCostFor(rating10: number): number {
  if (rating10 >= 10) return 5;
  if (rating10 >= 9) return 3;
  return 0;
}

function premiumReasonFor(rating10: number): string {
  if (rating10 >= 10) return 'Top 1% winning score · viral demand signal detected';
  if (rating10 >= 9) return 'Top 5% winning score · strong margin and rising buzz';
  return '';
}

export interface ScoreInputs {
  socialBuzz: number;     // 0–100 YouTube-derived score
  redditBuzz?: number;    // 0–100 Reddit community score (optional, blended in when present)
}

export function buildScore(product: Product, inputs: ScoreInputs): ScoredProduct {
  const cat = (product.category || 'general').toLowerCase();
  const stock = clamp(product.stock, 0, 5000);
  const rating = clamp(product.rating, 0, 5);
  const discount = clamp(product.discountPercent ?? 0, 0, 100);

  // Demand: stock movement (saturates ~300 units) + rating + discount appetite.
  const demand = clamp(
    Math.min(35, (stock / 300) * 35) + (rating / 5) * 45 + Math.min(20, discount * 1.2),
    0,
    100,
  );

  const productRating = clamp((rating / 5) * 100, 0, 100);

  const margin = calculateMargin(product.price, cat);
  const profitPotential = clamp(margin.marginPercent * 1.4, 0, 100);

  const competitionRaw = COMPETITION_BY_CATEGORY[cat] ?? 60;
  const competition = clamp(competitionRaw, 0, 100);
  const shippingEase = clamp(SHIPPING_EASE_BY_CATEGORY[cat] ?? 70, 0, 100);
  const riskRaw = RISK_BY_CATEGORY[cat] ?? 45;
  const risk = clamp(riskRaw, 0, 100);

  // Blend YouTube (60%) + Reddit (40%) when both are available
  const blendedBuzz =
    inputs.redditBuzz !== undefined
      ? Math.round(clamp(inputs.socialBuzz * 0.6 + inputs.redditBuzz * 0.4))
      : inputs.socialBuzz;

  const breakdown: ScoreBreakdown = {
    demand,
    socialBuzz: blendedBuzz,
    profitPotential,
    productRating,
    shippingEase,
    competition, // displayed inverted in UI
    risk, // displayed inverted in UI
  };

  // Higher = better. Competition and risk get inverted before weighting.
  const winning =
    breakdown.demand * 0.25 +
    breakdown.socialBuzz * 0.2 +
    breakdown.profitPotential * 0.2 +
    breakdown.productRating * 0.15 +
    breakdown.shippingEase * 0.1 +
    (100 - breakdown.competition) * 0.05 +
    (100 - breakdown.risk) * 0.05;

  const winningScore = Math.round(clamp(winning));
  const rating10 = scoreToRating10(winningScore);
  const isPremium = rating10 >= 9;
  const recommendation = recommendationFor(winningScore);

  const audience = pickAudience(cat);
  const adAngle = pickAdAngle(product.title, cat);

  const buzzLabel = blendedBuzz >= 75 ? 'rising' : blendedBuzz >= 50 ? 'steady' : 'soft';
  const aiSummary = `${product.title} sits in a category with ${competition >= 70 ? 'heavy' : competition >= 50 ? 'moderate' : 'light'} competition and ${buzzLabel} social buzz${inputs.redditBuzz !== undefined ? ` (YouTube + Reddit blend: ${blendedBuzz}/100)` : ''}. With an estimated ${margin.marginPercent}% margin at a $${margin.suggestedPrice.toFixed(2)} retail price, it ${winningScore >= 70 ? 'looks worth testing this week' : 'needs more validation before scaling ad spend'}.`;

  const whyTrending = `${product.title.split(' ')[0]} videos in this niche are getting ${inputs.socialBuzz >= 80 ? 'millions of views' : 'steady traction'} on TikTok. Demand signal is reinforced by a ${rating.toFixed(1)}/5 rating and ${stock} units in stock across suppliers.`;

  const risksToWatch = `Watch out for ${risk >= 60 ? 'higher complaint rates and return risk in this category' : 'seasonal dips and compliance rules in some regions'}. Competition is ${competition >= 70 ? 'crowded — differentiate with creative' : 'manageable if you move fast'}.`;

  return {
    product,
    scoreBreakdown: breakdown,
    winningScore,
    rating10,
    recommendation,
    isPremium,
    unlockCost: unlockCostFor(rating10),
    estimatedCost: margin.estimatedCost,
    suggestedPrice: margin.suggestedPrice,
    estimatedMargin: margin.estimatedMargin,
    marginPercent: margin.marginPercent,
    bestAudience: audience,
    bestAdAngle: adAngle,
    suggestedPlatforms: PLATFORMS_DEFAULT,
    aiSummary,
    whyTrending,
    risksToWatch,
    premiumReason: premiumReasonFor(rating10),
    socialBuzzSources:
      inputs.redditBuzz !== undefined
        ? { youtube: inputs.socialBuzz, reddit: inputs.redditBuzz }
        : undefined,
  };
}

export function buildTestPlan(scored: ScoredProduct): ProductTestPlan {
  const budget = scored.suggestedPrice >= 60 ? 100 : 50;
  const days = scored.winningScore >= 80 ? 3 : 5;
  const adCopyVerb = scored.recommendation === 'Test Now' ? 'Don’t miss out' : 'Discover';
  const firstAdCopy = `${adCopyVerb} ${scored.product.title}. ${scored.bestAdAngle} Limited launch — order yours today.`;
  return {
    productId: scored.product.id,
    suggestedPrice: scored.suggestedPrice,
    targetAudience: scored.bestAudience,
    adAngle: scored.bestAdAngle,
    firstAdCopy,
    testingBudget: budget,
    testDurationDays: days,
    successMetric: 'Achieve <$8 CPA on TikTok with at least 1.5% CTR. Scale only if ROAS > 1.6 by day 3.',
  };
}

export const SCORE_DIMENSIONS: { key: keyof ScoreBreakdown; label: string; explainer: string; inverted?: boolean }[] = [
  {
    key: 'demand',
    label: 'Demand Signal',
    explainer: 'How strongly shoppers are searching, rating, and buying products like this.',
  },
  {
    key: 'socialBuzz',
    label: 'Social Buzz',
    explainer: 'Blended signal from YouTube search volume (60%) and Reddit community engagement (40%).',
  },
  {
    key: 'profitPotential',
    label: 'Profit Potential',
    explainer: 'Margin you can realistically keep after sourcing, shipping, and ad costs.',
  },
  {
    key: 'productRating',
    label: 'Rating Signal',
    explainer: 'How well existing buyers rate this product on average.',
  },
  {
    key: 'shippingEase',
    label: 'Shipping Ease',
    explainer: 'How light, durable, and unbreakable this product is to ship globally.',
  },
  {
    key: 'competition',
    label: 'Competition',
    explainer: 'Lower is better. How crowded the category already is.',
    inverted: true,
  },
  {
    key: 'risk',
    label: 'Risk Score',
    explainer: 'Lower is better. Complaint, return, and compliance risk for this niche.',
    inverted: true,
  },
];
