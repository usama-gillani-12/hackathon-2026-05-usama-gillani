import { Product } from '../types/product';
import type { AmazonRawProduct } from '../api/amazonApi';

interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
}

interface FakeStoreProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating?: { rate: number; count: number };
  image: string;
}

export function normalizeDummyJson(p: DummyJsonProduct): Product {
  return {
    id: `dj-${p.id}`,
    source: 'dummyjson',
    title: p.title,
    description: p.description,
    category: p.category,
    brand: p.brand,
    price: p.price,
    discountPercent: p.discountPercentage,
    rating: p.rating,
    stock: p.stock,
    thumbnail: p.thumbnail,
    images: p.images?.length ? p.images : [p.thumbnail],
  };
}

export function normalizeFakeStore(p: FakeStoreProduct): Product {
  return {
    id: `fs-${p.id}`,
    source: 'fakestore',
    title: p.title,
    description: p.description,
    category: p.category,
    price: p.price,
    rating: p.rating?.rate ?? 4,
    stock: 50 + Math.floor(Math.random() * 200),
    thumbnail: p.image,
    images: [p.image],
  };
}

export function normalizeAmazonProduct(p: AmazonRawProduct): Product {
  const rawPrice = p.product_price ?? p.deal_price ?? '$0';
  const price = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;

  const rawRating = p.product_star_rating ?? '4';
  const rating = parseFloat(rawRating) || 4;

  const photo = p.product_photo ?? '';
  const category = p.department ?? p.category ?? 'General';
  const asin = p.asin ?? '';

  return {
    id: `amz-${asin}`,
    source: 'amazon',
    title: p.product_title ?? 'Amazon Product',
    description: '',
    category,
    price,
    rating,
    stock: 999,
    thumbnail: photo,
    images: photo ? [photo] : [],
    asin,
    salesRank: typeof p.rank === 'number' ? p.rank : undefined,
    salesVolume: p.sales_volume,
  };
}
