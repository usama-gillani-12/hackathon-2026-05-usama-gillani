import { ScoredProduct } from '../types/product';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiInsights {
  aiSummary: string;
  whyTrending: string;
  risksToWatch: string;
  bestAdAngle: string;
  bestAudience: string;
}

// Session-level cache so re-opening a product doesn't re-fetch
const cache = new Map<string, GeminiInsights>();

export async function generateProductInsights(
  scored: ScoredProduct,
): Promise<GeminiInsights | null> {
  if (!API_KEY) return null;

  const cached = cache.get(scored.product.id);
  if (cached) return cached;

  const { product, scoreBreakdown, winningScore, marginPercent, suggestedPrice, recommendation } =
    scored;

  const prompt = `You are a dropshipping product analyst. Given the product data below, return ONLY a JSON object (no markdown, no extra text) with exactly these 5 keys:
- "aiSummary": 2 sentences. Summarise the product's market opportunity referencing its score, margin, and competition level.
- "whyTrending": 2 sentences. Explain why this product is gaining traction on social media and with buyers right now.
- "risksToWatch": 2 sentences. Name the biggest risks a dropshipper should watch for with this product.
- "bestAdAngle": 1 punchy sentence (≤15 words). The best creative hook for a TikTok or Facebook ad.
- "bestAudience": 1 sentence. The ideal target audience including age, platform, and interest.

Product data:
- Title: ${product.title}
- Category: ${product.category}
- Price: $${product.price}
- Suggested sell price: $${suggestedPrice.toFixed(2)}
- Margin: ${marginPercent}%
- Rating: ${product.rating}/5
- Stock: ${product.stock} units
- Winning score: ${winningScore}/100
- Recommendation: ${recommendation}
- Demand: ${Math.round(scoreBreakdown.demand)}/100
- Social buzz: ${Math.round(scoreBreakdown.socialBuzz)}/100
- Profit potential: ${Math.round(scoreBreakdown.profitPotential)}/100
- Competition: ${Math.round(scoreBreakdown.competition)}/100 (higher = more crowded)
- Risk: ${Math.round(scoreBreakdown.risk)}/100 (higher = riskier)`;

  try {
    const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const insights: GeminiInsights = JSON.parse(cleaned);

    cache.set(scored.product.id, insights);
    return insights;
  } catch {
    return null;
  }
}
