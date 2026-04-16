import { Platform, Product, PlatformPrice } from '@/types';

export const platforms: Platform[] = [
  {
    id: 'dmart',
    name: 'DMart Ready',
    color: '#1a73e8',
    logo: '🏪',
    deliveryThreshold: 1000,
    baseDeliveryFee: 49,
    handlingFee: 0,
    platformFee: 0,
  },
  {
    id: 'blinkit',
    name: 'Blinkit',
    color: '#f8c700',
    logo: '⚡',
    deliveryThreshold: 499,
    baseDeliveryFee: 25,
    handlingFee: 6,
    platformFee: 3,
  },
  {
    id: 'jiomart',
    name: 'JioMart',
    color: '#0078d4',
    logo: '🛒',
    deliveryThreshold: 750,
    baseDeliveryFee: 39,
    handlingFee: 0,
    platformFee: 0,
  },
  {
    id: 'instamart',
    name: 'Swiggy Instamart',
    color: '#fc8019',
    logo: '🚀',
    deliveryThreshold: 399,
    baseDeliveryFee: 29,
    handlingFee: 4,
    platformFee: 2,
  },
];

export const products: Product[] = [
  { id: 'milk-1l', name: 'Full Cream Milk', nameHi: 'फुल क्रीम दूध', category: 'Dairy', categoryHi: 'डेयरी', image: '🥛', unit: '1 L' },
  { id: 'atta-5kg', name: 'Whole Wheat Atta', nameHi: 'गेहूं का आटा', category: 'Staples', categoryHi: 'अनाज', image: '🌾', unit: '5 kg' },
  { id: 'rice-5kg', name: 'Basmati Rice', nameHi: 'बासमती चावल', category: 'Staples', categoryHi: 'अनाज', image: '🍚', unit: '5 kg' },
  { id: 'oil-1l', name: 'Refined Sunflower Oil', nameHi: 'रिफाइंड सूरजमुखी तेल', category: 'Staples', categoryHi: 'अनाज', image: '🫗', unit: '1 L' },
  { id: 'sugar-1kg', name: 'Sugar', nameHi: 'चीनी', category: 'Staples', categoryHi: 'अनाज', image: '🍬', unit: '1 kg' },
  { id: 'dal-1kg', name: 'Toor Dal', nameHi: 'तूर दाल', category: 'Pulses', categoryHi: 'दालें', image: '🫘', unit: '1 kg' },
  { id: 'onion-1kg', name: 'Onion', nameHi: 'प्याज', category: 'Vegetables', categoryHi: 'सब्ज़ियाँ', image: '🧅', unit: '1 kg' },
  { id: 'potato-1kg', name: 'Potato', nameHi: 'आलू', category: 'Vegetables', categoryHi: 'सब्ज़ियाँ', image: '🥔', unit: '1 kg' },
  { id: 'tomato-1kg', name: 'Tomato', nameHi: 'टमाटर', category: 'Vegetables', categoryHi: 'सब्ज़ियाँ', image: '🍅', unit: '1 kg' },
  { id: 'soap-3pack', name: 'Bathing Soap (3 pack)', nameHi: 'नहाने का साबुन (3 पैक)', category: 'Personal Care', categoryHi: 'पर्सनल केयर', image: '🧼', unit: '3 pcs' },
  { id: 'tea-250g', name: 'Tea Leaves', nameHi: 'चाय पत्ती', category: 'Beverages', categoryHi: 'पेय पदार्थ', image: '🍵', unit: '250 g' },
  { id: 'bread-400g', name: 'White Bread', nameHi: 'ब्रेड', category: 'Bakery', categoryHi: 'बेकरी', image: '🍞', unit: '400 g' },
  { id: 'egg-12', name: 'Eggs', nameHi: 'अंडे', category: 'Dairy', categoryHi: 'डेयरी', image: '🥚', unit: '12 pcs' },
  { id: 'banana-6', name: 'Banana', nameHi: 'केला', category: 'Fruits', categoryHi: 'फल', image: '🍌', unit: '6 pcs' },
  { id: 'biscuit-pack', name: 'Cream Biscuits', nameHi: 'क्रीम बिस्कुट', category: 'Snacks', categoryHi: 'स्नैक्स', image: '🍪', unit: '300 g' },
  { id: 'maggi-4pack', name: 'Instant Noodles (4 pack)', nameHi: 'इंस्टेंट नूडल्स (4 पैक)', category: 'Snacks', categoryHi: 'स्नैक्स', image: '🍜', unit: '4 pcs' },
];

export const platformPrices: PlatformPrice[] = [
  // Milk
  { productId: 'milk-1l', platformId: 'dmart', brand: 'Amul', packSize: '1 L', basePrice: 66, mrp: 68, gstPercent: 0, discount: 2, available: true },
  { productId: 'milk-1l', platformId: 'blinkit', brand: 'Amul', packSize: '1 L', basePrice: 68, mrp: 68, gstPercent: 0, discount: 0, available: true },
  { productId: 'milk-1l', platformId: 'jiomart', brand: 'Amul', packSize: '1 L', basePrice: 67, mrp: 68, gstPercent: 0, discount: 1, available: true },
  { productId: 'milk-1l', platformId: 'instamart', brand: 'Amul', packSize: '1 L', basePrice: 68, mrp: 68, gstPercent: 0, discount: 0, couponCode: 'MILK10', couponDiscount: 5, available: true },

  // Atta
  { productId: 'atta-5kg', platformId: 'dmart', brand: 'Aashirvaad', packSize: '5 kg', basePrice: 255, mrp: 290, gstPercent: 0, discount: 35, available: true },
  { productId: 'atta-5kg', platformId: 'blinkit', brand: 'Aashirvaad', packSize: '5 kg', basePrice: 275, mrp: 290, gstPercent: 0, discount: 15, available: true },
  { productId: 'atta-5kg', platformId: 'jiomart', brand: 'Aashirvaad', packSize: '5 kg', basePrice: 265, mrp: 290, gstPercent: 0, discount: 25, couponCode: 'ATTA20', couponDiscount: 10, available: true },
  { productId: 'atta-5kg', platformId: 'instamart', brand: 'Pillsbury', packSize: '5 kg', basePrice: 260, mrp: 280, gstPercent: 0, discount: 20, available: true, alternativeProduct: true },

  // Rice
  { productId: 'rice-5kg', platformId: 'dmart', brand: 'India Gate', packSize: '5 kg', basePrice: 425, mrp: 475, gstPercent: 5, discount: 50, available: true },
  { productId: 'rice-5kg', platformId: 'blinkit', brand: 'India Gate', packSize: '5 kg', basePrice: 455, mrp: 475, gstPercent: 5, discount: 20, available: true },
  { productId: 'rice-5kg', platformId: 'jiomart', brand: 'Daawat', packSize: '5 kg', basePrice: 440, mrp: 470, gstPercent: 5, discount: 30, available: true, alternativeProduct: true },
  { productId: 'rice-5kg', platformId: 'instamart', brand: 'India Gate', packSize: '5 kg', basePrice: 450, mrp: 475, gstPercent: 5, discount: 25, available: true },

  // Oil
  { productId: 'oil-1l', platformId: 'dmart', brand: 'Fortune', packSize: '1 L', basePrice: 135, mrp: 150, gstPercent: 5, discount: 15, available: true },
  { productId: 'oil-1l', platformId: 'blinkit', brand: 'Fortune', packSize: '1 L', basePrice: 145, mrp: 150, gstPercent: 5, discount: 5, available: true },
  { productId: 'oil-1l', platformId: 'jiomart', brand: 'Fortune', packSize: '1 L', basePrice: 140, mrp: 150, gstPercent: 5, discount: 10, available: true },
  { productId: 'oil-1l', platformId: 'instamart', brand: 'Saffola', packSize: '1 L', basePrice: 155, mrp: 165, gstPercent: 5, discount: 10, available: true, alternativeProduct: true },

  // Sugar
  { productId: 'sugar-1kg', platformId: 'dmart', brand: 'Trust', packSize: '1 kg', basePrice: 42, mrp: 48, gstPercent: 5, discount: 6, available: true },
  { productId: 'sugar-1kg', platformId: 'blinkit', brand: 'Trust', packSize: '1 kg', basePrice: 46, mrp: 48, gstPercent: 5, discount: 2, available: true },
  { productId: 'sugar-1kg', platformId: 'jiomart', brand: 'Trust', packSize: '1 kg', basePrice: 44, mrp: 48, gstPercent: 5, discount: 4, available: true },
  { productId: 'sugar-1kg', platformId: 'instamart', brand: 'Trust', packSize: '1 kg', basePrice: 45, mrp: 48, gstPercent: 5, discount: 3, available: true },

  // Dal
  { productId: 'dal-1kg', platformId: 'dmart', brand: 'Tata Sampann', packSize: '1 kg', basePrice: 155, mrp: 175, gstPercent: 0, discount: 20, available: true },
  { productId: 'dal-1kg', platformId: 'blinkit', brand: 'Tata Sampann', packSize: '1 kg', basePrice: 168, mrp: 175, gstPercent: 0, discount: 7, available: true },
  { productId: 'dal-1kg', platformId: 'jiomart', brand: 'Tata Sampann', packSize: '1 kg', basePrice: 160, mrp: 175, gstPercent: 0, discount: 15, available: true },
  { productId: 'dal-1kg', platformId: 'instamart', brand: 'Tata Sampann', packSize: '1 kg', basePrice: 165, mrp: 175, gstPercent: 0, discount: 10, available: true },

  // Onion
  { productId: 'onion-1kg', platformId: 'dmart', brand: 'Fresh', packSize: '1 kg', basePrice: 30, mrp: 40, gstPercent: 0, discount: 10, available: true },
  { productId: 'onion-1kg', platformId: 'blinkit', brand: 'Fresh', packSize: '1 kg', basePrice: 38, mrp: 40, gstPercent: 0, discount: 2, available: true },
  { productId: 'onion-1kg', platformId: 'jiomart', brand: 'Fresh', packSize: '1 kg', basePrice: 35, mrp: 40, gstPercent: 0, discount: 5, available: true },
  { productId: 'onion-1kg', platformId: 'instamart', brand: 'Fresh', packSize: '1 kg', basePrice: 36, mrp: 40, gstPercent: 0, discount: 4, available: true },

  // Potato
  { productId: 'potato-1kg', platformId: 'dmart', brand: 'Fresh', packSize: '1 kg', basePrice: 28, mrp: 35, gstPercent: 0, discount: 7, available: true },
  { productId: 'potato-1kg', platformId: 'blinkit', brand: 'Fresh', packSize: '1 kg', basePrice: 32, mrp: 35, gstPercent: 0, discount: 3, available: true },
  { productId: 'potato-1kg', platformId: 'jiomart', brand: 'Fresh', packSize: '1 kg', basePrice: 30, mrp: 35, gstPercent: 0, discount: 5, available: true },
  { productId: 'potato-1kg', platformId: 'instamart', brand: 'Fresh', packSize: '1 kg', basePrice: 33, mrp: 35, gstPercent: 0, discount: 2, available: true },

  // Tomato
  { productId: 'tomato-1kg', platformId: 'dmart', brand: 'Fresh', packSize: '1 kg', basePrice: 35, mrp: 45, gstPercent: 0, discount: 10, available: true },
  { productId: 'tomato-1kg', platformId: 'blinkit', brand: 'Fresh', packSize: '1 kg', basePrice: 42, mrp: 45, gstPercent: 0, discount: 3, available: true },
  { productId: 'tomato-1kg', platformId: 'jiomart', brand: 'Fresh', packSize: '1 kg', basePrice: 38, mrp: 45, gstPercent: 0, discount: 7, available: true },
  { productId: 'tomato-1kg', platformId: 'instamart', brand: 'Fresh', packSize: '1 kg', basePrice: 40, mrp: 45, gstPercent: 0, discount: 5, available: false },

  // Soap
  { productId: 'soap-3pack', platformId: 'dmart', brand: 'Lux', packSize: '3 × 100g', basePrice: 115, mrp: 135, gstPercent: 18, discount: 20, available: true },
  { productId: 'soap-3pack', platformId: 'blinkit', brand: 'Lux', packSize: '3 × 100g', basePrice: 128, mrp: 135, gstPercent: 18, discount: 7, available: true },
  { productId: 'soap-3pack', platformId: 'jiomart', brand: 'Lux', packSize: '3 × 100g', basePrice: 120, mrp: 135, gstPercent: 18, discount: 15, available: true },
  { productId: 'soap-3pack', platformId: 'instamart', brand: 'Dove', packSize: '3 × 100g', basePrice: 165, mrp: 180, gstPercent: 18, discount: 15, available: true, alternativeProduct: true },

  // Tea
  { productId: 'tea-250g', platformId: 'dmart', brand: 'Tata Tea Gold', packSize: '250 g', basePrice: 115, mrp: 130, gstPercent: 5, discount: 15, available: true },
  { productId: 'tea-250g', platformId: 'blinkit', brand: 'Tata Tea Gold', packSize: '250 g', basePrice: 125, mrp: 130, gstPercent: 5, discount: 5, available: true },
  { productId: 'tea-250g', platformId: 'jiomart', brand: 'Tata Tea Gold', packSize: '250 g', basePrice: 118, mrp: 130, gstPercent: 5, discount: 12, available: true },
  { productId: 'tea-250g', platformId: 'instamart', brand: 'Red Label', packSize: '250 g', basePrice: 110, mrp: 125, gstPercent: 5, discount: 15, available: true, alternativeProduct: true },

  // Bread
  { productId: 'bread-400g', platformId: 'dmart', brand: 'Harvest Gold', packSize: '400 g', basePrice: 38, mrp: 45, gstPercent: 0, discount: 7, available: true },
  { productId: 'bread-400g', platformId: 'blinkit', brand: 'Harvest Gold', packSize: '400 g', basePrice: 42, mrp: 45, gstPercent: 0, discount: 3, available: true },
  { productId: 'bread-400g', platformId: 'jiomart', brand: 'Harvest Gold', packSize: '400 g', basePrice: 40, mrp: 45, gstPercent: 0, discount: 5, available: true },
  { productId: 'bread-400g', platformId: 'instamart', brand: 'Modern', packSize: '400 g', basePrice: 40, mrp: 42, gstPercent: 0, discount: 2, available: true, alternativeProduct: true },

  // Eggs
  { productId: 'egg-12', platformId: 'dmart', brand: 'Farm Fresh', packSize: '12 pcs', basePrice: 72, mrp: 84, gstPercent: 0, discount: 12, available: true },
  { productId: 'egg-12', platformId: 'blinkit', brand: 'Farm Fresh', packSize: '12 pcs', basePrice: 79, mrp: 84, gstPercent: 0, discount: 5, available: true },
  { productId: 'egg-12', platformId: 'jiomart', brand: 'Farm Fresh', packSize: '12 pcs', basePrice: 75, mrp: 84, gstPercent: 0, discount: 9, available: true },
  { productId: 'egg-12', platformId: 'instamart', brand: 'Farm Fresh', packSize: '6 pcs', basePrice: 42, mrp: 45, gstPercent: 0, discount: 3, available: true, packSizeMismatch: true, normalizedPricePerUnit: 7 },

  // Banana
  { productId: 'banana-6', platformId: 'dmart', brand: 'Fresh', packSize: '6 pcs', basePrice: 30, mrp: 40, gstPercent: 0, discount: 10, available: true },
  { productId: 'banana-6', platformId: 'blinkit', brand: 'Fresh', packSize: '6 pcs', basePrice: 35, mrp: 40, gstPercent: 0, discount: 5, available: true },
  { productId: 'banana-6', platformId: 'jiomart', brand: 'Fresh', packSize: '6 pcs', basePrice: 32, mrp: 40, gstPercent: 0, discount: 8, available: true },
  { productId: 'banana-6', platformId: 'instamart', brand: 'Fresh', packSize: '6 pcs', basePrice: 34, mrp: 40, gstPercent: 0, discount: 6, available: true },

  // Biscuit
  { productId: 'biscuit-pack', platformId: 'dmart', brand: 'Britannia', packSize: '300 g', basePrice: 30, mrp: 40, gstPercent: 12, discount: 10, available: true },
  { productId: 'biscuit-pack', platformId: 'blinkit', brand: 'Britannia', packSize: '300 g', basePrice: 36, mrp: 40, gstPercent: 12, discount: 4, available: true },
  { productId: 'biscuit-pack', platformId: 'jiomart', brand: 'Britannia', packSize: '300 g', basePrice: 32, mrp: 40, gstPercent: 12, discount: 8, available: true },
  { productId: 'biscuit-pack', platformId: 'instamart', brand: 'Oreo', packSize: '300 g', basePrice: 38, mrp: 40, gstPercent: 12, discount: 2, available: true, alternativeProduct: true },

  // Maggi
  { productId: 'maggi-4pack', platformId: 'dmart', brand: 'Maggi', packSize: '4 × 70g', basePrice: 48, mrp: 56, gstPercent: 12, discount: 8, available: true },
  { productId: 'maggi-4pack', platformId: 'blinkit', brand: 'Maggi', packSize: '4 × 70g', basePrice: 52, mrp: 56, gstPercent: 12, discount: 4, available: true },
  { productId: 'maggi-4pack', platformId: 'jiomart', brand: 'Maggi', packSize: '4 × 70g', basePrice: 50, mrp: 56, gstPercent: 12, discount: 6, available: true },
  { productId: 'maggi-4pack', platformId: 'instamart', brand: 'Maggi', packSize: '4 × 70g', basePrice: 54, mrp: 56, gstPercent: 12, discount: 2, available: true },
];

export const cities = [
  { name: 'Mumbai', nameHi: 'मुंबई', pincode: '400001' },
  { name: 'Delhi', nameHi: 'दिल्ली', pincode: '110001' },
  { name: 'Bangalore', nameHi: 'बेंगलुरु', pincode: '560001' },
  { name: 'Hyderabad', nameHi: 'हैदराबाद', pincode: '500001' },
  { name: 'Pune', nameHi: 'पुणे', pincode: '411001' },
  { name: 'Chennai', nameHi: 'चेन्नई', pincode: '600001' },
  { name: 'Ahmedabad', nameHi: 'अहमदाबाद', pincode: '380001' },
  { name: 'Jaipur', nameHi: 'जयपुर', pincode: '302001' },
];
