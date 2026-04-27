import { useState, useMemo } from 'react';
import { AlertCircle, TrendingDown, Zap, Clock, Gift, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CartItem } from '@/types';
import { products, platformPrices } from '@/data/mockData';
import { productPrices } from '@/data/productPrices';

interface SmartSuggestionsCardProps {
  cart: CartItem[];
  isHi?: boolean;
}

interface PriceDropSuggestion {
  productId: string;
  productName: string;
  platform: string;
  currentPrice: number;
  futurePrice: number;
  savings: number;
  daysToWait: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  specialEvent?: string;
}

// Festival and seasonal sale dates for 2026
const getFestivalInfo = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${month}-${day}`;

  const festivals: Record<string, { name: string; discount: number; nameHi: string }> = {
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

// Platform-specific deals
const getPlatformDealInfo = (dayOfWeek: number) => {
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

const SmartSuggestionsCard = ({ cart, isHi = false }: SmartSuggestionsCardProps) => {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const recommendations: PriceDropSuggestion[] = useMemo(() => {
    if (cart.length === 0) return [];

    const recs: PriceDropSuggestion[] = [];
    const today = new Date();

    cart.forEach((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);
      const priceData = productPrices[cartItem.productId as keyof typeof productPrices];
      const platformData = platformPrices.filter((p) => p.productId === cartItem.productId);

      if (product && priceData && platformData.length > 0) {
        const productName = isHi ? product.nameHi : product.name;

        // Calculate current best price
        let bestCurrentPrice = Infinity;
        let bestFuturePrice = Infinity;
        let bestFuturePlatform = 'dmart';

        Object.entries(priceData.prices).forEach(([platform, currentPrice]) => {
          bestCurrentPrice = Math.min(bestCurrentPrice, currentPrice);

          // Calculate future price based on trends
          let futurePrice = currentPrice;
          const trend = priceData.trend || 'stable';

          if (trend === 'decreasing') {
            futurePrice = currentPrice * 0.85;
          } else if (trend === 'increasing') {
            futurePrice = currentPrice * 1.08;
          } else {
            futurePrice = currentPrice * 0.92;
          }

          if (futurePrice < bestFuturePrice) {
            bestFuturePrice = futurePrice;
            bestFuturePlatform = platform;
          }
        });

        const currentCost = bestCurrentPrice * cartItem.quantity;
        const futureCost = bestFuturePrice * cartItem.quantity;
        const savings = currentCost - futureCost;

        // Get platform deal for recommended day
        const daysAhead = priceData.nextDrop || 2;
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + daysAhead);

        let reason = priceData.reason || 'Market-driven price adjustments';
        let daysToWait = daysAhead;
        let specialEvent: string | undefined;

        // Check for festivals
        const festival = getFestivalInfo(futureDate);
        if (festival) {
          specialEvent = isHi ? festival.nameHi : festival.name;
          reason = `${isHi ? festival.nameHi : festival.name} - Expect ${festival.discount}% discount`;
          daysToWait = Math.ceil((futureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Check for platform-specific deals
        const platformDeal = getPlatformDealInfo(futureDate.getDay());
        if (platformDeal && platformDeal.discount > 5) {
          reason = isHi ? platformDeal.reasonHi : platformDeal.reason;
          bestFuturePlatform = platformDeal.platform;
        }

        recs.push({
          productId: cartItem.productId,
          productName,
          platform: bestFuturePlatform.charAt(0).toUpperCase() + bestFuturePlatform.slice(1),
          currentPrice: currentCost,
          futurePrice: futureCost,
          savings: Math.max(0, savings),
          daysToWait: Math.max(0, daysToWait),
          reason,
          confidence: savings > 50 ? 'high' : savings > 20 ? 'medium' : 'low',
          specialEvent,
        });
      }
    });

    return recs.sort((a, b) => b.savings - a.savings);
  }, [cart, isHi]);

  if (cart.length === 0 || recommendations.length === 0) {
    return null;
  }

  const topSavings = recommendations.reduce((sum, r) => sum + r.savings, 0);
  const avgWaitDays = Math.round(
    recommendations.reduce((sum, r) => sum + r.daysToWait, 0) / recommendations.length
  );

  return (
    <div className="space-y-4">
      {/* Main Recommendation Card */}
      <Card className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 dark:border-green-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500 p-3">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                  {isHi ? '💡 स्मार्ट खरीदारी सुझाव' : '💡 Smart Shopping Tips'}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {isHi ? 'कीमत ड्रॉप की भविष्यवाणी के साथ बचत करें' : 'Save with price drop predictions'}
                </p>
              </div>
            </div>
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              ₹{topSavings.toFixed(0)} {isHi ? 'बचाएं' : 'Save'}
            </Badge>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg bg-white dark:bg-green-900 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isHi ? 'सर्वश्रेष्ठ समय' : 'Best Time to Buy'}
                  </p>
                  <p className="font-bold text-sm">In {avgWaitDays} days</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-green-900 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isHi ? 'प्रतीक्षा' : 'Wait Time'}
                  </p>
                  <p className="font-bold text-sm">~{avgWaitDays} {isHi ? 'दिन' : 'days'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-green-900 p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isHi ? 'छूट' : 'Avg Savings'}
                  </p>
                  <p className="font-bold text-sm">
                    ~{recommendations.length > 0
                      ? Math.round(
                          (topSavings / (recommendations.length * 100)) * 100
                        )
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Section */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">
              {isHi ? '📋 आइटम-दर-आइटम सुझाव' : '📋 Item Recommendations'}:
            </p>

            {recommendations.slice(0, 5).map((rec) => (
              <div
                key={rec.productId}
                className="rounded-lg border border-green-200 bg-white dark:bg-green-900/30 p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setExpandedProduct(expandedProduct === rec.productId ? null : rec.productId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-green-900 dark:text-green-100">{rec.productName}</h4>
                      <Badge
                        variant={rec.confidence === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {rec.confidence === 'high'
                          ? isHi ? '🎯 उच्च' : '🎯 High'
                          : rec.confidence === 'medium'
                            ? isHi ? '⭐ माध्यम' : '⭐ Medium'
                            : isHi ? '✓ कम' : '✓ Low'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {isHi ? '📍 ' : '📍 '}<strong>{rec.platform}</strong> - {isHi ? 'में खरीदें' : 'for best price'}
                    </p>
                    {rec.specialEvent && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-2">
                        🎉 {rec.specialEvent}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{rec.savings.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isHi ? 'बचा सकते हैं' : 'to save'}
                    </div>
                  </div>
                </div>

                {expandedProduct === rec.productId && (
                  <div className="mt-4 border-t border-green-200 dark:border-green-700 pt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-orange-50 dark:bg-orange-950 rounded p-2">
                        <p className="text-xs text-muted-foreground">
                          {isHi ? 'अभी' : 'Now'}
                        </p>
                        <p className="font-bold text-orange-600 dark:text-orange-400">₹{rec.currentPrice.toFixed(0)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900 rounded p-2">
                        <p className="text-xs text-muted-foreground">
                          {isHi ? 'भविष्य' : 'Future'}
                        </p>
                        <p className="font-bold text-green-600 dark:text-green-400">₹{rec.futurePrice.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 rounded p-3">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900 dark:text-blue-100">{rec.reason}</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            {isHi ? '⏱️ प्रतीक्षा: ' : '⏱️ Wait: '}{rec.daysToWait} {isHi ? 'दिन' : 'days'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {recommendations.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                {isHi ? `और ${recommendations.length - 5} सुझाव` : `+${recommendations.length - 5} more recommendations`}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Smart Purchase Strategy */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
              {isHi ? '💭 खरीदारी की रणनीति' : '💭 Shopping Strategy'}
            </h4>
            <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
              <li>✓ {isHi ? 'अगले दो दिन में प्रतीक्षा करें' : 'Wait 2-3 days for better prices'}</li>
              <li>✓ {isHi ? 'प्लेटफॉर्म विशेष के लिए एक नज़र रखें' : 'Watch for platform-specific deals'}</li>
              <li>✓ {isHi ? 'त्योहारों के समय बड़ी बिक्री की उम्मीद करें' : 'Expect bigger discounts during festivals'}</li>
              <li>✓ {isHi ? 'सप्ताहांत पर अतिरिक्त छूट के लिए ट्रैक करें' : 'Check for weekend flash sales'}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SmartSuggestionsCard;
