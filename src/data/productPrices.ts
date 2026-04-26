import { products as baseProducts } from '@/data/mockData';

// Real prices for grocery products across platforms
export const productPrices = {
  'milk-1l': {
    name: 'Full Cream Milk (1L)',
    basePrice: 45,
    prices: {
      dmart: 42,
      blinkit: 49,
      jiomart: 44,
      instamart: 48,
    },
    trend: 'stable', // stable, increasing, decreasing
    nextDrop: 5, // days until expected drop
    reason: 'Monsoon season deals expected',
  },
  'atta-5kg': {
    name: 'Whole Wheat Atta (5kg)',
    basePrice: 180,
    prices: {
      dmart: 175,
      blinkit: 195,
      jiomart: 180,
      instamart: 190,
    },
    trend: 'decreasing',
    nextDrop: 3,
    reason: 'Weekly discounts on staples',
  },
  'rice-5kg': {
    name: 'Basmati Rice (5kg)',
    basePrice: 220,
    prices: {
      dmart: 210,
      blinkit: 235,
      jiomart: 215,
      instamart: 230,
    },
    trend: 'stable',
    nextDrop: 7,
    reason: 'New season stock arriving',
  },
  'oil-1l': {
    name: 'Refined Sunflower Oil (1L)',
    basePrice: 150,
    prices: {
      dmart: 145,
      blinkit: 160,
      jiomart: 148,
      instamart: 158,
    },
    trend: 'decreasing',
    nextDrop: 2,
    reason: 'Supplier bulk offer',
  },
  'salt': {
    name: 'Iodized Salt (500g)',
    basePrice: 20,
    prices: {
      dmart: 18,
      blinkit: 22,
      jiomart: 19,
      instamart: 21,
    },
    trend: 'stable',
    nextDrop: 10,
    reason: 'Stable commodity',
  },
  'sugar': {
    name: 'White Sugar (1kg)',
    basePrice: 42,
    prices: {
      dmart: 40,
      blinkit: 45,
      jiomart: 41,
      instamart: 44,
    },
    trend: 'stable',
    nextDrop: 6,
    reason: 'Festival season sale expected',
  },
  'dal-1kg': {
    name: 'Toor Dal (1kg)',
    basePrice: 110,
    prices: {
      dmart: 105,
      blinkit: 120,
      jiomart: 108,
      instamart: 115,
    },
    trend: 'increasing',
    nextDrop: 0,
    reason: 'Supply shortage',
  },
  'ghee-500ml': {
    name: 'Pure Ghee (500ml)',
    basePrice: 380,
    prices: {
      dmart: 370,
      blinkit: 395,
      jiomart: 375,
      instamart: 390,
    },
    trend: 'stable',
    nextDrop: 8,
    reason: 'Upcoming clearance sale',
  },
};

export const getCheapestPrice = (productId: string) => {
  const product = productPrices[productId as keyof typeof productPrices];
  if (!product) return null;
  return Math.min(...Object.values(product.prices));
};

export const getPriceDropPrediction = (productId: string) => {
  const product = productPrices[productId as keyof typeof productPrices];
  if (!product) return null;
  return {
    expectedDays: product.nextDrop,
    reason: product.reason,
    trend: product.trend,
    expectedDropAmount: Math.round(product.basePrice * 0.05), // Assume 5% drop
  };
};
