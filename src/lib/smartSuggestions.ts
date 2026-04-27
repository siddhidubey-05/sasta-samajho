// AI-like smart suggestions for price drops with reasons
import { productPrices } from '@/data/productPrices';

export interface PriceDrop {
  productId: string;
  productName: string;
  currentPrice: number;
  expectedPrice: number;
  dropAmount: number;
  dropPercentage: number;
  expectedDays: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  platform: string;
}

export interface AIPricePrediction {
  productId: string;
  productName: string;
  platform: string;
  currentPrice: number;
  predictedPrice: number;
  estimatedSavings: number;
  savingsPercentage: number;
  bestDayToBuy?: string;
  daysToWait: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ShoppingRecommendation {
  productId: string;
  productName: string;
  recommendedPlatform: string;
  price: number;
  savings: number;
  reason: string;
  shouldWait: boolean;
  waitDays?: number;
}

// AI Reasoning Engine for Price Drops
export const getPricePredictions = (): PriceDrop[] => {
  const predictions: PriceDrop[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();

  // Seasonal and periodic factors
  const seasonalFactors: Record<string, string> = {
    monsoon: 'Monsoon season bulk discounts expected',
    festival: 'Festival season sale preparations',
    newyear: 'New Year clearance sale',
    summer: 'Summer stock management discounts',
    winter: 'Winter deals on dry goods',
  };

  // Platform-specific patterns
  const platformPatterns: Record<string, { day: number; discount: number; reason: string }> = {
    dmart: { day: 0, discount: 5, reason: 'DMart weekly discounts on Sundays' },
    blinkit: { day: 3, discount: 6, reason: 'Blinkit Midweek flash sale' },
    jiomart: { day: 5, discount: 7, reason: 'JioMart Friday mega sale' },
    instamart: { day: 1, discount: 4, reason: 'Instamart Monday deals' },
  };

  // Process each product
  Object.entries(productPrices).forEach(([productId, priceData]) => {
    const basePrice = priceData.basePrice;

    // Generate predictions for each platform
    Object.entries(priceData.prices).forEach(([platform, currentPrice]) => {
      let expectedPrice = currentPrice;
      let dropAmount = 0;
      let expectedDays = priceData.nextDrop || 7;
      let reason = priceData.reason || 'Market driven adjustment';
      let confidence: 'high' | 'medium' | 'low' = 'medium';

      if (priceData.trend === 'decreasing') {
        // Expected to drop further
        expectedPrice = currentPrice * 0.92; // 8% additional drop
        dropAmount = currentPrice - expectedPrice;
        confidence = 'high';
        expectedDays = Math.min(priceData.nextDrop || 3, 5);
        reason = `${priceData.reason} + Decreasing trend suggests ${dropAmount.toFixed(0)} drop`;
      } else if (priceData.trend === 'increasing') {
        // Prices might increase
        expectedPrice = currentPrice * 1.05;
        dropAmount = 0;
        confidence = 'high';
        expectedDays = 0;
        reason = `⚠️ ${priceData.reason} - Prices may increase soon, buy now!`;
      } else {
        // Stable - normal drop prediction
        expectedPrice = currentPrice * 0.95;
        dropAmount = currentPrice - expectedPrice;
        confidence = 'medium';
        reason = priceData.reason || 'Regular market adjustments expected';
      }

      // Apply platform-specific patterns
      const pattern = platformPatterns[platform];
      if (pattern) {
        const daysUntilPattern = (pattern.day - dayOfWeek + 7) % 7;
        if (daysUntilPattern < expectedDays) {
          expectedPrice = Math.min(expectedPrice, currentPrice * (1 - pattern.discount / 100));
          dropAmount = currentPrice - expectedPrice;
          expectedDays = daysUntilPattern || 7;
          reason = pattern.reason;
          confidence = 'high';
        }
      }

      // Check seasonal factors
      const seasonalReason = getSeasonalReason(dayOfMonth);
      if (seasonalReason) {
        reason += ` + ${seasonalReason}`;
      }

      if (dropAmount > 0) {
        predictions.push({
          productId,
          productName: priceData.name,
          currentPrice,
          expectedPrice: Math.round(expectedPrice * 100) / 100,
          dropAmount: Math.round(dropAmount * 100) / 100,
          dropPercentage: Math.round((dropAmount / currentPrice) * 100 * 100) / 100,
          expectedDays: Math.max(expectedDays, 1),
          reason,
          confidence,
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        });
      }
    });
  });

  return predictions.sort((a, b) => b.dropAmount - a.dropAmount);
};

// Get seasonal reason based on date
export const getSeasonalReason = (dayOfMonth: number): string => {
  if (dayOfMonth >= 1 && dayOfMonth <= 5) return 'Start of month restocking deals';
  if (dayOfMonth >= 15 && dayOfMonth <= 18) return 'Mid-month clearance expected';
  if (dayOfMonth >= 25 && dayOfMonth <= 28) return 'End of month inventory reduction';
  return '';
};

// Get shopping recommendation for a specific product
export const getShoppingRecommendation = (
  productId: string,
  platformPrices: Record<string, number>
): ShoppingRecommendation | null => {
  const priceData = productPrices[productId as keyof typeof productPrices];
  if (!priceData) return null;

  // Find cheapest platform
  let cheapestPlatform = 'dmart';
  let cheapestPrice = platformPrices['dmart'] || priceData.prices.dmart;

  Object.entries(platformPrices).forEach(([platform, price]) => {
    if (price < cheapestPrice) {
      cheapestPrice = price;
      cheapestPlatform = platform;
    }
  });

  // Check if we should wait for a drop
  const predictions = getPricePredictions().filter((p) => p.productId === productId);
  const bestPrediction = predictions.find((p) => p.platform.toLowerCase() === cheapestPlatform);

  let shouldWait = false;
  let waitDays = 0;
  let savings = 0;
  let reason = `Cheapest on ${cheapestPlatform}`;

  if (bestPrediction && bestPrediction.confidence === 'high' && bestPrediction.expectedDays <= 7) {
    shouldWait = bestPrediction.dropAmount > (cheapestPrice * 0.05); // Wait if drop > 5%
    waitDays = bestPrediction.expectedDays;
    savings = bestPrediction.dropAmount;
    reason = bestPrediction.reason;
  } else {
    savings = cheapestPrice - Math.min(...Object.values(platformPrices));
  }

  return {
    productId,
    productName: priceData.name,
    recommendedPlatform: cheapestPlatform.charAt(0).toUpperCase() + cheapestPlatform.slice(1),
    price: cheapestPrice,
    savings,
    reason,
    shouldWait,
    waitDays: shouldWait ? waitDays : undefined,
  };
};

// Analyze entire cart and get shopping recommendations
export const analyzeCart = (
  cartItems: Array<{ productId: string; quantity: number }>,
  allPlatformPrices: Record<string, Record<string, number>>
): {
  recommendations: ShoppingRecommendation[];
  totalSavings: number;
  bestStrategy: string;
} => {
  const recommendations: ShoppingRecommendation[] = [];
  let totalSavings = 0;

  cartItems.forEach((item) => {
    const platformPrices = allPlatformPrices[item.productId];
    if (platformPrices) {
      const rec = getShoppingRecommendation(item.productId, platformPrices);
      if (rec) {
        recommendations.push(rec);
        totalSavings += rec.savings * item.quantity;
      }
    }
  });

  // Determine best strategy
  const shouldWaitCount = recommendations.filter((r) => r.shouldWait).length;
  const waitCount = recommendations.length;

  let bestStrategy = 'Buy now for best prices across platforms';
  if (shouldWaitCount === waitCount && waitCount > 0) {
    bestStrategy = 'Wait a few days - prices dropping across all items!';
  } else if (shouldWaitCount > 0) {
    bestStrategy = `Split purchase: Buy urgent items now, wait for ${shouldWaitCount} items to drop`;
  }

  return {
    recommendations,
    totalSavings,
    bestStrategy,
  };
};

// Get platform comparison for price alerts
export interface PlatformComparison {
  platform: string;
  price: number;
  delivery: number;
  totalWithDelivery: number;
  isCheapest: boolean;
}

export const comparePlatformPrices = (
  productId: string,
  quantity: number = 1,
  subtotal: number = 0
): PlatformComparison[] => {
  const priceData = productPrices[productId as keyof typeof productPrices];
  if (!priceData) return [];

  // Delivery fees by platform (threshold-based)
  const deliveryFees: Record<string, { fee: number; threshold: number }> = {
    dmart: { fee: 49, threshold: 1000 },
    blinkit: { fee: 25, threshold: 499 },
    jiomart: { fee: 39, threshold: 750 },
    instamart: { fee: 29, threshold: 399 },
  };

  const comparisons: PlatformComparison[] = [];
  const prices = Object.entries(priceData.prices);
  let minPrice = Infinity;

  prices.forEach(([platform, price]) => {
    const totalPrice = price * quantity;
    const deliveryInfo = deliveryFees[platform];
    const delivery = totalPrice >= deliveryInfo.threshold ? 0 : deliveryInfo.fee;
    const totalWithDelivery = totalPrice + delivery;

    comparisons.push({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      price,
      delivery,
      totalWithDelivery,
      isCheapest: false,
    });

    minPrice = Math.min(minPrice, totalWithDelivery);
  });

  // Mark cheapest
  comparisons.forEach((c) => {
    c.isCheapest = c.totalWithDelivery === minPrice;
  });

  return comparisons.sort((a, b) => a.totalWithDelivery - b.totalWithDelivery);
};

// Festival and seasonal sale dates for 2026
export const getFestivalInfo = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${month}-${day}`;

  const festivals: Record<string, { name: string; discount: number; nameHi: string; daysAway?: number }> = {
    '4-27': { name: 'Spring Season Sale', nameHi: 'वसंत मौसमी बिक्री', discount: 8 },
    '5-15': { name: 'Summer Clearance', nameHi: 'गर्मी की सफाई बिक्री', discount: 12 },
    '7-7': { name: 'Mid-Year Mega Sale', nameHi: 'मध्य-वर्ष मेगा बिक्री', discount: 15 },
    '8-15': { name: 'Independence Day Sale', nameHi: 'स्वतंत्रता दिवस बिक्री', discount: 10 },
    '9-16': { name: 'Janmashtami Sale', nameHi: 'जन्माष्टमी बिक्री', discount: 8 },
    '10-2': { name: 'Gandhi Jayanti Sale', nameHi: 'गांधी जयंती बिक्री', discount: 7 },
    '10-12': { name: 'Diwali Bonanza', nameHi: 'दिवाली महोत्सव', discount: 20 },
    '11-1': { name: 'Post-Diwali Sale', nameHi: 'दिवाली के बाद बिक्री', discount: 15 },
    '12-25': { name: 'Christmas Special', nameHi: 'क्रिसमस विशेष', discount: 12 },
    '1-26': { name: 'Republic Day Sale', nameHi: 'गणतंत्र दिवस बिक्री', discount: 9 },
  };

  return festivals[dateStr];
};

// Platform-specific deals pattern
export const getPlatformDealInfo = (dayOfWeek: number) => {
  const deals: Record<number, { platform: string; discount: number; reason: string; reasonHi: string }> = {
    0: { platform: 'dmart', discount: 5, reason: 'Sunday mega sale on staples', reasonHi: 'रविवार को अनाज पर मेगा बिक्री' },
    1: { platform: 'instamart', discount: 4, reason: 'Monday morning deals', reasonHi: 'सोमवार की सुबह की डील' },
    2: { platform: 'blinkit', discount: 6, reason: 'Tuesday flash sale', reasonHi: 'मंगलवार फ्लैश सेल' },
    3: { platform: 'blinkit', discount: 6, reason: 'Wednesday midweek special', reasonHi: 'बुधवार को मध्य सप्ताह विशेष' },
    4: { platform: 'jiomart', discount: 7, reason: 'Thursday fresh delivery deals', reasonHi: 'गुरुवार ताजा डिलीवरी डील' },
    5: { platform: 'jiomart', discount: 7, reason: 'Friday mega sale', reasonHi: 'शुक्रवार मेगा बिक्री' },
    6: { platform: 'instamart', discount: 5, reason: 'Saturday weekend sale', reasonHi: 'शनिवार सप्ताहांत बिक्री' },
  };

  return deals[dayOfWeek];
};

// Get payday discount info
export const getPaydayInfo = (dayOfMonth: number) => {
  // Payday cycles: 5th, 15th, 25th of month
  if (dayOfMonth >= 3 && dayOfMonth <= 6) {
    return { isPayday: true, discount: 10, reason: 'Early month payday sales - 10% cashback offers' };
  }
  if (dayOfMonth >= 13 && dayOfMonth <= 17) {
    return { isPayday: true, discount: 8, reason: 'Mid-month payday promotions - Super deals' };
  }
  if (dayOfMonth >= 23 && dayOfMonth <= 27) {
    return { isPayday: true, discount: 12, reason: 'Late month payday mega sale - Highest discounts' };
  }
  return { isPayday: false, discount: 0, reason: '' };
};

// Enhanced AI prediction for selected products (used in Smart Suggestions popup)
export const generateAIPredictions = (productIds: string[]): AIPricePrediction[] => {
  const predictions: AIPricePrediction[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();
  
  // Get day names for better messaging
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  productIds.forEach((productId) => {
    const priceData = productPrices[productId as keyof typeof productPrices];
    if (!priceData) return;

    Object.entries(priceData.prices).forEach(([platform, currentPrice]) => {
      let predictedPrice = currentPrice;
      let daysToWait = 0;
      let bestDayToBuy = '';
      let reason = priceData.reason || 'Market driven adjustment';
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      let totalDiscount = 0;

      // Check festival upcoming
      const nextFestival = getFestivalUpcoming(today);
      if (nextFestival && nextFestival.daysAway! <= 7) {
        totalDiscount += nextFestival.discount;
        reason = `Festival Sale Coming - ${nextFestival.name}`;
        confidence = 'high';
        daysToWait = nextFestival.daysAway || 3;
        bestDayToBuy = getDateString(getDateDaysFromNow(nextFestival.daysAway || 3));
      }

      // Check payday cycles
      const paydayInfo = getPaydayInfo(dayOfMonth);
      if (paydayInfo.isPayday) {
        totalDiscount += paydayInfo.discount;
        reason = paydayInfo.reason;
        confidence = 'high';
      }

      // Check platform-specific patterns
      const platformDeal = getPlatformDealInfo(dayOfWeek);
      if (platformDeal && platformDeal.platform === platform) {
        totalDiscount += platformDeal.discount;
        reason = `${reason} + ${platformDeal.reason}`;
        confidence = 'high';
        daysToWait = 1;
        bestDayToBuy = dayNames[(dayOfWeek + 1) % 7];
      }

      // Apply trend-based prediction
      if (priceData.trend === 'decreasing') {
        totalDiscount += 8;
        reason += ' (Decreasing trend)';
        daysToWait = Math.min(priceData.nextDrop || 2, 3);
        confidence = 'high';
      } else if (priceData.trend === 'increasing') {
        totalDiscount = -5; // Price might go up
        reason = '⚠️ Price rising - Buy now!';
        confidence = 'high';
        daysToWait = 0;
      }

      // Calculate predicted price
      if (totalDiscount > 0) {
        predictedPrice = currentPrice * (1 - totalDiscount / 100);
        confidence = totalDiscount >= 15 ? 'high' : totalDiscount >= 8 ? 'medium' : 'low';
      }

      if (!bestDayToBuy && daysToWait > 0) {
        bestDayToBuy = dayNames[(dayOfWeek + Math.min(daysToWait, 6)) % 7];
      }

      predictions.push({
        productId,
        productName: priceData.name,
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        currentPrice,
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        estimatedSavings: Math.round((currentPrice - predictedPrice) * 100) / 100,
        savingsPercentage: totalDiscount > 0 ? Math.round(totalDiscount * 10) / 10 : 0,
        bestDayToBuy: bestDayToBuy || dayNames[(dayOfWeek + Math.min(daysToWait, 6)) % 7],
        daysToWait: Math.max(daysToWait, 0),
        reason,
        confidence,
      });
    });
  });

  return predictions.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
};

// Helper to get upcoming festival
export const getFestivalUpcoming = (fromDate: Date) => {
  const festivals = [
    { month: 5, day: 15, name: 'Summer Clearance', discount: 12, daysAway: 18 },
    { month: 7, day: 7, name: 'Mid-Year Mega Sale', discount: 15, daysAway: 71 },
    { month: 8, day: 15, name: 'Independence Day Sale', discount: 10, daysAway: 110 },
    { month: 10, day: 12, name: 'Diwali Bonanza', discount: 20, daysAway: 168 },
  ];

  const today = fromDate.getMonth() + 1;
  const todayDate = fromDate.getDate();

  // Find nearest upcoming festival
  let nearest = null;
  let minDays = 365;

  festivals.forEach((f) => {
    let daysAway = 0;
    if (f.month > today) {
      daysAway = (f.month - today) * 30 + (f.day - todayDate);
    } else if (f.month === today && f.day > todayDate) {
      daysAway = f.day - todayDate;
    } else {
      // Next year
      daysAway = 365 - todayDate + f.day + (f.month - 1) * 30;
    }

    if (daysAway < minDays && daysAway > 0 && daysAway <= 60) {
      minDays = daysAway;
      nearest = { ...f, daysAway };
    }
  });

  return nearest;
};

// Helper to get date string
export const getDateString = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Helper to get date N days from now
export const getDateDaysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
