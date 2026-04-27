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
