export type AdPlatform = 'TikTok' | 'Meta' | 'Google';

export interface AdScript {
  platform: AdPlatform;
  /** Punchy scroll-stopping hook — ≤10 words */
  headline: string;
  /** 2–3 sentences of platform-toned ad body copy */
  body: string;
  /** Call-to-action phrase — ≤8 words */
  cta: string;
}

export interface AdCopyResult {
  /** Always exactly 3 scripts: TikTok, Meta, Google (in that order) */
  scripts: [AdScript, AdScript, AdScript];
  /** Date.now() at generation time — enables future staleness checks */
  generatedAt: number;
  productId: string;
}
