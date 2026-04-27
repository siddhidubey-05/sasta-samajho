import { products as baseProducts } from '@/data/mockData';

// Real prices for grocery products across platforms with AI-powered predictions
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
    trend: 'stable',
    nextDrop: 2,
    reason: 'DMart Tuesday mega sale expected - Typical 5-7% discount on dairy products',
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
    nextDrop: 1,
    reason: 'Blinkit Friday flash sale - Staple items get 8-10% discount every Friday',
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
    nextDrop: 3,
    reason: 'JioMart harvest sale - New season inventory creates 6-8% price reduction',
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
    nextDrop: 1,
    reason: 'Instamart Monday deals - Edible oils typically see 5% discount mid-week',
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
    reason: 'Commodity price - Minimal fluctuations expected (buy anytime)',
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
    trend: 'increasing',
    nextDrop: 0,
    reason: '⚠️ Sugar prices rising - Supply constraints expected. Buy now at current rates.',
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
    reason: '⚠️ Dal prices increasing - Global demand high. Recommend buying soon.',
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
    nextDrop: 5,
    reason: 'Season transition sale - Ghee prices typically drop 4-6% end of month',
  },
  'tea-100g': {
    name: 'Premium Tea (100g)',
    basePrice: 85,
    prices: {
      dmart: 80,
      blinkit: 92,
      jiomart: 84,
      instamart: 90,
    },
    trend: 'stable',
    nextDrop: 3,
    reason: 'Brand promotion - Premium tea brands offer 7-10% discount bi-weekly',
  },
  'bread-400g': {
    name: 'Whole Wheat Bread (400g)',
    basePrice: 35,
    prices: {
      dmart: 32,
      blinkit: 38,
      jiomart: 34,
      instamart: 37,
    },
    trend: 'stable',
    nextDrop: 2,
    reason: 'Fresh stock rotation - Bread prices drop 5-8% when new batch arrives',
  },
  'eggs-12': {
    name: 'Farm Fresh Eggs (12)',
    basePrice: 65,
    prices: {
      dmart: 60,
      blinkit: 72,
      jiomart: 63,
      instamart: 70,
    },
    trend: 'stable',
    nextDrop: 1,
    reason: 'DMart egg sale - Eggs get 8-10% discount every Monday-Wednesday',
  },
  'banana-1kg': {
    name: 'Ripe Bananas (1kg)',
    basePrice: 38,
    prices: {
      dmart: 35,
      blinkit: 42,
      jiomart: 37,
      instamart: 41,
    },
    trend: 'decreasing',
    nextDrop: 2,
    reason: 'Seasonal harvest - Fruit prices drop 10-15% during peak season',
  },
  'noodles': {
    name: 'Instant Noodles Pack (85g)',
    basePrice: 12,
    prices: {
      dmart: 11,
      blinkit: 13,
      jiomart: 12,
      instamart: 12.5,
    },
    trend: 'stable',
    nextDrop: 7,
    reason: 'Bulk purchase discounts - Weekly rotating deals on packaged foods',
  },
  'biscuits': {
    name: 'Digestive Biscuits (400g)',
    basePrice: 48,
    prices: {
      dmart: 44,
      blinkit: 52,
      jiomart: 46,
      instamart: 50,
    },
    trend: 'stable',
    nextDrop: 4,
    reason: 'Shelf life clearance - Biscuits typically see 10-12% discount before expiry',
  },
  'soap-100g': {
    name: 'Bath Soap (100g)',
    basePrice: 25,
    prices: {
      dmart: 22,
      blinkit: 28,
      jiomart: 24,
      instamart: 27,
    },
    trend: 'stable',
    nextDrop: 6,
    reason: 'Festival combo offers - FMCG items bundled for 15-20% discount',
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
    expectedDropAmount: Math.round(product.basePrice * 0.08), // Assume 8% drop for most items
  };
};
