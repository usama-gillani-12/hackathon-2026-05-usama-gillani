---
name: mock-data
description: Generate realistic mock products for TrendPro's src/mocks/mockProducts.ts — Jungle Scout–style hero items
---

You are generating mock product data for TrendPro. Products must look like real Amazon best-sellers that an e-commerce dropshipper would find through Jungle Scout. When `/mock-data` is invoked:

## Product shape (`src/types/product.ts`)

```typescript
interface Product {
  id: string;           // 'mock-<slug>' format
  title: string;        // Real-sounding Amazon product title (brand + descriptor + key feature)
  description: string;  // 2–3 sentences, benefit-focused, no filler
  price: number;        // USD, realistic retail price
  category: string;     // lowercase Amazon category id: electronics, beauty, kitchen, sports, pets, fashion, etc.
  imageUrl: string;     // Use placeholder: 'https://picsum.photos/seed/<slug>/400/400'
  rating: number;       // 3.8–4.9 range (realistic)
  reviewCount: number;  // 50–15,000 (realistic distribution)
  source: 'mock';
  asin?: string;        // Optional, omit for mock
  salesVolume?: string; // e.g. '2K+ bought in past month'
  isPrime?: boolean;
}
```

## Quality standards for mock data

- **Title format**: `[Brand Name] [Product Type] [Key Differentiator] — [Size/Count/Variant]`
  - Good: "HydroMax Insulated Water Bottle with Carrying Loop — 32 oz, Forest Green"
  - Bad: "Water Bottle" or "Great Product for Pets"
- **Category spread**: generate across at least 4 different categories per batch
- **Price realism**: electronics $25–$150, beauty $12–$60, kitchen $15–$80, pets $10–$50
- **Rating**: never exactly 4.0 or 5.0 — use decimals like 4.3, 4.7, 3.9
- **Review count**: skewed distribution — most items 200–3000, a few outliers at 10K+
- **salesVolume**: include for ~60% of items, skip for others (realistic API data)
- **Description**: mention a specific use case, a pain point it solves, and one social-proof signal

## Hero items (always include)

These specific mock products must always be present in the output as they are referenced in demo flows:
- `mock-pet-water-bottle` — Pet Travel Water Bottle (pets category)
- `mock-resistance-bands` — Resistance Bands Set (sports category)
- `mock-wireless-charger` — Wireless Charging Pad (electronics category)

## Output

Generate valid TypeScript array entries, ready to paste into `src/mocks/mockProducts.ts`. Default batch size is 10 unless user specifies otherwise. End with a note on which categories were covered.
