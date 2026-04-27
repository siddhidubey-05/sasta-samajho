import { useMemo } from 'react';
import { TrendingDown, TrendingUp, Clock, AlertCircle, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CartItem } from '@/types';
import { products, platformPrices, platforms } from '@/data/mockData';
import { productPrices as mockProductPrices } from '@/data/productPrices';
import { getKiranaStores, getAverageKiranaPrice } from '@/lib/kiranaUtils';

interface CartPlatformComparisonProps {
  cart: CartItem[];
  isHi?: boolean;
}

interface PriceOption {
  source: string;
  productPrice: number;
  totalPrice: number;
  logo?: string;
  isCheapest: boolean;
  color?: string;
  deliveryFee?: number;
  platformFee?: number;
  handlingFee?: number;
  gst?: number;
}

interface ProductComparison {
  productId: string;
  productName: string;
  quantity: number;
  options: PriceOption[];
  recommendation: string;
  reasoning: string;
  trend?: 'increasing' | 'decreasing' | 'stable';
  daysToWait?: number;
}

export const CartPlatformComparison = ({ cart, isHi = false }: CartPlatformComparisonProps) => {
  const comparison = useMemo(() => {
    if (cart.length === 0) return [];

    return cart
      .map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId);
        if (!product) return null;

        const productName = isHi ? product.nameHi : product.name;

        // Get prices from all platforms
        const platformPricingData = platformPrices.filter((p) => p.productId === cartItem.productId);
        const mockData = mockProductPrices[cartItem.productId as keyof typeof mockProductPrices];

        const options: PriceOption[] = [];
        let minPrice = Infinity;

        // Add platform prices with ALL fees included
        platforms.forEach((platform) => {
          const priceData = platformPricingData.find((p) => p.platformId === platform.id);
          if (priceData && priceData.available) {
            // Calculate item price
            const itemPrice = (priceData.basePrice - priceData.discount) * cartItem.quantity;
            
            // Calculate GST
            const gst = (itemPrice * priceData.gstPercent) / 100;
            
            // Calculate delivery fee (free above threshold)
            const deliveryFee = itemPrice >= platform.deliveryThreshold ? 0 : platform.baseDeliveryFee;
            
            // Calculate platform and handling fees
            const platformFee = platform.platformFee;
            const handlingFee = platform.handlingFee;
            
            // Calculate coupon savings if applicable
            const couponSavings = priceData.couponDiscount || 0;
            
            // Total cost
            const totalPrice = itemPrice + gst + deliveryFee + platformFee + handlingFee - couponSavings;
            
            options.push({
              source: platform.name,
              productPrice: itemPrice,
              totalPrice,
              logo: platform.logo,
              isCheapest: false,
              color: platform.color,
              deliveryFee,
              platformFee,
              handlingFee,
              gst,
            });
            minPrice = Math.min(minPrice, totalPrice);
          }
        });

        // Add kirana store average if available (no fees)
        const kiranaPrice = getAverageKiranaPrice(product.name);
        if (kiranaPrice) {
          const totalKiranaPrice = kiranaPrice * cartItem.quantity;
          options.push({
            source: '🏪 Local Kirana',
            productPrice: totalKiranaPrice,
            totalPrice: totalKiranaPrice,
            isCheapest: false,
          });
          minPrice = Math.min(minPrice, totalKiranaPrice);
        }

        // Mark cheapest option
        options.forEach((opt) => {
          if (opt.totalPrice === minPrice) {
            opt.isCheapest = true;
          }
        });

        // Determine recommendation and reasoning
        let recommendation = options.find((o) => o.isCheapest)?.source || 'DMart Ready';
        let reasoning = 'Best price available today';
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        let daysToWait = 0;

        if (mockData) {
          trend = mockData.trend || 'stable';
          reasoning = mockData.reason || 'Current market rates';
          daysToWait = mockData.nextDrop || 0;

          // Add trend-based recommendations
          if (trend === 'decreasing') {
            recommendation += ' (Price dropping)';
            reasoning += ' - Prices are decreasing, might drop further in ' + (daysToWait || 3) + ' days';
          } else if (trend === 'increasing') {
            recommendation = options.find((o) => o.isCheapest)?.source || 'DMart Ready';
            reasoning = '⚠️ Prices rising - Buy now at ' + recommendation;
          }
        }

        return {
          productId: cartItem.productId,
          productName,
          quantity: cartItem.quantity,
          options: options.sort((a, b) => a.totalPrice - b.totalPrice),
          recommendation,
          reasoning,
          trend,
          daysToWait,
        };
      })
      .filter((item) => item !== null) as ProductComparison[];
  }, [cart, isHi]);

  if (comparison.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Zap className="h-5 w-5 text-primary" />
          {isHi ? '💰 सभी प्लेटफॉर्म तुलना' : '💰 Platform Comparison'}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {isHi ? 'सभी ऑनलाइन प्लेटफॉर्म और आपकी स्थानीय दुकान पर तुलना करें' : 'Compare prices across all online platforms and your local kirana stores'}
        </p>
      </div>

      {comparison.map((item) => (
        <Card key={item.productId} className="overflow-hidden border-border p-4">
          {/* Product Header */}
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{item.productName}</h3>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            {item.trend === 'decreasing' && (
              <Badge variant="secondary" className="gap-1 bg-green-50 text-green-700">
                <TrendingDown className="h-3 w-3" />
                {isHi ? 'कम हो रहा है' : 'Dropping'}
              </Badge>
            )}
            {item.trend === 'increasing' && (
              <Badge variant="destructive" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {isHi ? 'बढ़ रहा है' : 'Rising'}
              </Badge>
            )}
          </div>

          {/* Price Options Grid */}
          <div className="mb-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {item.options.map((option, idx) => (
              <div
                key={idx}
                className={`rounded-lg border-2 p-3 transition-all ${
                  option.isCheapest
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xl">{option.logo}</span>
                  {option.isCheapest && (
                    <Badge className="bg-green-600 text-white text-[10px] px-1.5">
                      {isHi ? 'सबसे सस्ता' : 'Cheapest'}
                    </Badge>
                  )}
                </div>
                <p className="mb-1 text-xs font-medium text-muted-foreground truncate">{option.source}</p>
                
                {/* Show breakdown for online platforms, not for kirana */}
                {option.deliveryFee !== undefined && (
                  <div className="mb-2 space-y-1 border-t pt-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isHi ? 'सामान' : 'Item'}:</span>
                      <span className="font-semibold">₹{option.productPrice.toFixed(0)}</span>
                    </div>
                    {option.gst && option.gst > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST:</span>
                        <span className="font-semibold">₹{option.gst.toFixed(0)}</span>
                      </div>
                    )}
                    {option.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isHi ? 'डिलीवरी' : 'Del'}:</span>
                        <span className="font-semibold">₹{option.deliveryFee.toFixed(0)}</span>
                      </div>
                    )}
                    {option.platformFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isHi ? 'प्लेटफॉर्म' : 'Plat'}:</span>
                        <span className="font-semibold">₹{option.platformFee.toFixed(0)}</span>
                      </div>
                    )}
                    {option.handlingFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isHi ? 'हैंडलिंग' : 'Hand'}:</span>
                        <span className="font-semibold">₹{option.handlingFee.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 flex justify-between font-bold">
                      <span>{isHi ? 'कुल' : 'Total'}:</span>
                      <span>₹{option.totalPrice.toFixed(0)}</span>
                    </div>
                  </div>
                )}
                
                {/* For kirana, just show total */}
                {option.deliveryFee === undefined && (
                  <p className={`text-lg font-bold ${option.isCheapest ? 'text-green-700' : ''}`}>
                    ₹{option.totalPrice.toFixed(0)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Smart Recommendation */}
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">{item.recommendation}</p>
                <p className="text-xs text-blue-800 mt-1">{item.reasoning}</p>
                {item.daysToWait > 0 && (
                  <p className="text-xs text-blue-800 mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {isHi ? `${item.daysToWait} दिन में कीमत कम होने की उम्मीद` : `Price drop expected in ${item.daysToWait} days`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Savings Calculation */}
          {item.options.length > 1 && (
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {isHi ? 'सबसे महंगे से बचत' : 'Savings vs. Most Expensive'}
                </span>
                <span className="font-bold text-green-600">
                  ₹{(Math.max(...item.options.map((o) => o.totalPrice)) - Math.min(...item.options.map((o) => o.totalPrice))).toFixed(0)}
                </span>
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Summary */}
      {comparison.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 p-4 mt-6">
          <div className="text-sm">
            <p className="font-semibold mb-2">
              {isHi ? '💡 कुल बचत अवसर' : '💡 Total Savings Opportunity'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isHi
                ? 'विभिन्न प्लेटफॉर्म्स और कीमतों की तुलना करके आप बहुत पैसा बचा सकते हैं। हर आइटम के लिए सर्वोत्तम विकल्प चुनें।'
                : 'By comparing different platforms and prices, you can save significantly. Choose the best option for each item.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CartPlatformComparison;
