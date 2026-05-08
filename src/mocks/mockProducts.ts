import { Product } from '../types/product';

// These hand-tuned products guarantee a polished hackathon demo even when APIs are offline.
// Several are tuned to land at 9/10 or 10/10 so the premium-unlock flow always has live targets.
export const mockProducts: Product[] = [
  {
    id: 'mock-1',
    source: 'mock',
    title: 'Pet Travel Water Bottle',
    description:
      'Leak-proof portable water dispenser designed for dog walks, hikes, and road trips. One-handed dispensing with easy water return.',
    category: 'pets',
    brand: 'PawHydrate',
    price: 12.99,
    discountPercent: 8,
    rating: 4.8,
    stock: 320,
    thumbnail:
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-2',
    source: 'mock',
    title: 'Portable Neck Fan',
    description:
      'Hands-free bladeless cooling fan with three speeds, USB-C charging, and 16 hours of battery life.',
    category: 'electronics',
    brand: 'CoolWear',
    price: 24.5,
    discountPercent: 12,
    rating: 4.6,
    stock: 540,
    thumbnail:
      'https://images.unsplash.com/photo-1591488229005-c54f4685e8d4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1591488229005-c54f4685e8d4?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-3',
    source: 'mock',
    title: 'Mini Thermal Printer',
    description:
      'Pocket-sized Bluetooth thermal printer for to-do lists, photos, journal stickers, and study notes. Ink-free printing.',
    category: 'electronics',
    brand: 'PrintLab',
    price: 39.99,
    discountPercent: 15,
    rating: 4.9,
    stock: 280,
    thumbnail:
      'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-4',
    source: 'mock',
    title: 'LED Face Mask',
    description:
      'At-home red and blue light therapy mask for clearer skin, reduced redness, and a luminous complexion.',
    category: 'beauty',
    brand: 'GlowKit',
    price: 79.0,
    discountPercent: 20,
    rating: 4.7,
    stock: 180,
    thumbnail:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-5',
    source: 'mock',
    title: 'Foldable Storage Box',
    description:
      'Stackable fabric storage organizer with reinforced lids. Perfect for closets, nurseries, and small apartments.',
    category: 'home-decoration',
    brand: 'NestNeat',
    price: 18.99,
    discountPercent: 5,
    rating: 4.4,
    stock: 720,
    thumbnail:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-6',
    source: 'mock',
    title: 'Portable Blender',
    description:
      'USB rechargeable personal blender for smoothies, protein shakes, and travel meals. 6-blade titanium-coated motor.',
    category: 'kitchen',
    brand: 'BlendGo',
    price: 32.0,
    discountPercent: 10,
    rating: 4.5,
    stock: 460,
    thumbnail:
      'https://images.unsplash.com/photo-1610847499832-918a1c3c6811?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1610847499832-918a1c3c6811?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-7',
    source: 'mock',
    title: 'Car Vacuum Cleaner',
    description:
      'High-suction handheld car vacuum with HEPA filter, LED light, and 3 swappable nozzles for deep cleaning.',
    category: 'automotive',
    brand: 'AutoClean',
    price: 45.0,
    discountPercent: 18,
    rating: 4.8,
    stock: 220,
    thumbnail:
      'https://images.unsplash.com/photo-1603721023474-c4f2bb16f08a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1603721023474-c4f2bb16f08a?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-8',
    source: 'mock',
    title: 'Smart LED Strip',
    description:
      'App-controlled RGB LED strip with 16M colors, music sync, and Alexa support. Perfect for gamers and creators.',
    category: 'lighting',
    brand: 'LumeOne',
    price: 28.0,
    discountPercent: 14,
    rating: 4.9,
    stock: 610,
    thumbnail:
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-9',
    source: 'mock',
    title: 'Resistance Band Set',
    description:
      'Five-level latex resistance band kit with handles, ankle straps, and door anchor. Full home gym in a pouch.',
    category: 'fitness',
    brand: 'FlexFit',
    price: 19.5,
    discountPercent: 6,
    rating: 4.6,
    stock: 880,
    thumbnail:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 'mock-10',
    source: 'mock',
    title: 'Baby Nail Trimmer',
    description:
      'Gentle electric nail file for newborns and toddlers with six grinding heads and a quiet vibration motor.',
    category: 'baby',
    brand: 'TinyCare',
    price: 22.99,
    discountPercent: 11,
    rating: 4.9,
    stock: 410,
    thumbnail:
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    ],
  },
];
