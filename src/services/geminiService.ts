import { ScoredProduct } from '../types/product';
import { AdCopyResult, AdScript } from '../types/adCopy';

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

// Separate cache for ad copy — keeps insights and scripts independent
const adCopyCache = new Map<string, AdCopyResult>();

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

/**
 * Builds personalized ad scripts from the product's own data fields.
 * Used as a fallback when the Gemini API is unavailable (quota, network, etc.).
 * Output is still fully personalized — it uses bestAdAngle, bestAudience,
 * suggestedPrice, and marginPercent from scoringService.
 */
function buildFallbackAdCopy(scored: ScoredProduct): AdCopyResult {
  const { product, suggestedPrice, marginPercent, winningScore, bestAdAngle, bestAudience } = scored;
  const price = `$${suggestedPrice.toFixed(2)}`;
  const category = product.category.toLowerCase();
  const shortTitle = product.title.length > 40
    ? product.title.slice(0, 37) + '...'
    : product.title;

  const scripts: [AdScript, AdScript, AdScript] = [
    {
      platform: 'TikTok',
      headline: bestAdAngle.length <= 60 ? bestAdAngle : `This ${category} is going viral right now`,
      body: `POV: You just found the ${category} everyone's talking about. ${bestAudience} are buying this up — and at ${price} it practically sells itself. Stock is limited, don't sleep on this one.`,
      cta: 'Tap to grab yours before it sells out',
    },
    {
      platform: 'Meta',
      headline: `Finally — ${shortTitle} at ${price}`,
      body: `${bestAudience} — this is the product you've been waiting for. The ${shortTitle} is trending with a ${winningScore}/100 opportunity score and ${marginPercent}% margins. Thousands of happy customers, fast shipping, and a risk-free guarantee.`,
      cta: 'Shop now — limited stock available',
    },
    {
      platform: 'Google',
      headline: `${shortTitle} | ${price} | Fast Shipping`,
      body: `Top-trending ${category} product with a ${winningScore}/100 market score. Ideal for ${bestAudience}. High demand, competitive price, ships in days.`,
      cta: 'Buy now — ships in 3–5 days',
    },
  ];

  return { scripts, generatedAt: Date.now(), productId: product.id };
}

/**
 * Generates 3 platform-specific ad scripts (TikTok, Meta, Google).
 * Tries Gemini 2.0 Flash first; falls back to personalized static templates
 * if the API is unavailable (quota exceeded, network error, etc.).
 * Always returns a result — never null.
 */
export async function generateAdCopy(scored: ScoredProduct): Promise<AdCopyResult> {
  const cached = adCopyCache.get(scored.product.id);
  if (cached) return cached;

  // Attempt Gemini API if key is available
  if (API_KEY) {
    const {
      product, scoreBreakdown, winningScore,
      marginPercent, suggestedPrice, bestAdAngle, bestAudience,
    } = scored;

    const prompt = `You are an expert direct-response copywriter specialising in e-commerce dropshipping.
Return ONLY a valid JSON object — no markdown fences, no extra text, no trailing commas.
The JSON must have exactly one key "scripts" whose value is an array of exactly 3 objects in this order: TikTok, then Meta, then Google.
Each object must have exactly these 4 string keys:
- "platform": one of "TikTok", "Meta", or "Google"
- "headline": a punchy scroll-stopping hook of at most 10 words
- "body": 2–3 sentences of persuasive ad copy (TikTok = energetic/casual, Meta = benefit-driven/trust, Google = intent-matching/direct)
- "cta": a call-to-action phrase of at most 8 words

Product data:
- Title: ${product.title}
- Category: ${product.category}
- Suggested sell price: $${suggestedPrice.toFixed(2)}
- Estimated margin: ${marginPercent}%
- Best ad angle: ${bestAdAngle}
- Target audience: ${bestAudience}
- Winning score: ${winningScore}/100
- Demand: ${Math.round(scoreBreakdown.demand)}/100
- Social buzz: ${Math.round(scoreBreakdown.socialBuzz)}/100`;

    try {
      const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        const stripped = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        let scripts: AdScript[] | null = null;
        const objMatch = stripped.match(/\{[\s\S]*\}/);
        if (objMatch) {
          const parsed: { scripts?: AdScript[] } = JSON.parse(objMatch[0]);
          if (Array.isArray(parsed.scripts)) scripts = parsed.scripts;
        }
        if (!scripts) {
          const arrMatch = stripped.match(/\[[\s\S]*\]/);
          if (arrMatch) scripts = JSON.parse(arrMatch[0]);
        }

        if (scripts && scripts.length >= 2) {
          if (scripts.length === 2) {
            scripts.push({ platform: 'Google', headline: scripts[1].headline, body: scripts[1].body, cta: scripts[1].cta });
          }
          const result: AdCopyResult = {
            scripts: scripts.slice(0, 3) as [AdScript, AdScript, AdScript],
            generatedAt: Date.now(),
            productId: product.id,
          };
          adCopyCache.set(product.id, result);
          if (__DEV__) console.log('[geminiService] adCopy from Gemini ✓');
          return result;
        }
      } else if (__DEV__) {
        console.warn('[geminiService] adCopy API error:', res.status, '— using fallback');
      }
    } catch (err) {
      if (__DEV__) console.warn('[geminiService] adCopy fetch error:', err, '— using fallback');
    }
  }

  // Fallback: build from product data — always works, always personalized
  if (__DEV__) console.log('[geminiService] adCopy using smart fallback');
  const fallback = buildFallbackAdCopy(scored);
  adCopyCache.set(scored.product.id, fallback);
  return fallback;
}
