import { buildScore, ScoreInputs } from '../src/core/services/scoringService';
import { Product } from '../src/types/product';

const mockProduct: Product = {
  id: 'test-001',
  source: 'mock',
  title: 'Wireless Pet Water Fountain',
  description: 'Auto-circulating filtered water fountain for cats and dogs.',
  category: 'pets',
  brand: 'PawFlow',
  price: 34.99,
  discountPercent: 15,
  rating: 4.7,
  stock: 320,
  thumbnail: 'https://example.com/img.jpg',
  images: ['https://example.com/img.jpg'],
};

const mockInputs: ScoreInputs = { socialBuzz: 74, redditBuzz: 61 };

describe('scoringService.buildScore', () => {
  it('returns a winning score between 0 and 100', () => {
    const result = buildScore(mockProduct, mockInputs);
    expect(result.winningScore).toBeGreaterThanOrEqual(0);
    expect(result.winningScore).toBeLessThanOrEqual(100);
  });

  it('returns a rating between 1 and 10', () => {
    const result = buildScore(mockProduct, mockInputs);
    expect(result.rating10).toBeGreaterThanOrEqual(1);
    expect(result.rating10).toBeLessThanOrEqual(10);
  });

  it('scoreBreakdown dimensions are all between 0 and 100', () => {
    const { scoreBreakdown } = buildScore(mockProduct, mockInputs);
    Object.values(scoreBreakdown).forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });

  it('scoreBreakdown weighted sum approximates winningScore', () => {
    const { scoreBreakdown, winningScore } = buildScore(mockProduct, mockInputs);
    const weights = { demand: 0.25, socialBuzz: 0.20, profitPotential: 0.20, productRating: 0.15, shippingEase: 0.10, competition: 0.05, risk: 0.05 };
    const computed =
      scoreBreakdown.demand * weights.demand +
      scoreBreakdown.socialBuzz * weights.socialBuzz +
      scoreBreakdown.profitPotential * weights.profitPotential +
      scoreBreakdown.productRating * weights.productRating +
      scoreBreakdown.shippingEase * weights.shippingEase +
      scoreBreakdown.competition * weights.competition +
      scoreBreakdown.risk * weights.risk;
    expect(Math.abs(computed - winningScore)).toBeLessThan(5);
  });

  it('marks rating >= 9 products as premium', () => {
    const result = buildScore(mockProduct, { socialBuzz: 96, redditBuzz: 92 });
    if (result.rating10 >= 9) expect(result.isPremium).toBe(true);
  });

  it('produces a valid score even with minimum social buzz', () => {
    const result = buildScore(mockProduct, { socialBuzz: 0 });
    expect(result.winningScore).toBeGreaterThanOrEqual(0);
    expect(result.winningScore).toBeLessThanOrEqual(100);
  });
});
