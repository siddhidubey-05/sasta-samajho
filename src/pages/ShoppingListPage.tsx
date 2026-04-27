import { useState, useEffect } from 'react';
import { ShoppingCart, TrendingDown, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import { productPrices } from '@/data/productPrices';
import { analyzeCart } from '@/lib/smartSuggestions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShoppingRecommendationCard from '@/components/ShoppingRecommendationCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface CartItemWithDetails {
  productId: string;
  productName: string;
  quantity: number;
  prices: Record<string, number>;
}

const ShoppingListPage = () => {
  const { cart, language } = useAppStore();
  const isHi = language === 'hi';

  const [cartDetails, setCartDetails] = useState<CartItemWithDetails[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    // Prepare cart details
    const details: CartItemWithDetails[] = cart.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const priceData = productPrices[item.productId as keyof typeof productPrices];

      return {
        productId: item.productId,
        productName: product ? (isHi ? product.nameHi : product.name) : 'Unknown',
        quantity: item.quantity,
        prices: priceData?.prices || {},
      };
    });

    setCartDetails(details);

    // Analyze cart
    const allPlatformPrices: Record<string, Record<string, number>> = {};
    details.forEach((item) => {
      allPlatformPrices[item.productId] = item.prices;
    });

    const cartAnalysis = analyzeCart(cart, allPlatformPrices);
    setAnalysis(cartAnalysis);
  }, [cart, language, isHi]);

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center py-20">
          <span className="text-6xl">📋</span>
          <h2 className="mt-4 text-xl font-bold">
            {isHi ? 'खरीदारी की सूची खाली है' : 'Shopping List is Empty'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isHi ? 'कार्ट में सामान जोड़ें' : 'Add items to your cart'}
          </p>
          <Link to="/search">
            <Button className="mt-4 gap-2 gradient-primary text-primary-foreground">
              <ShoppingCart className="h-4 w-4" />
              {isHi ? 'सामान खोजें' : 'Search Items'}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate totals by platform
  const platformTotals: Record<string, number> = {};
  Object.keys(productPrices).forEach((productKey: any) => {
    const priceData = productPrices[productKey];
    cartDetails.forEach((item) => {
      if (item.productId === productKey) {
        Object.entries(priceData.prices).forEach(([platform, price]) => {
          platformTotals[platform] = (platformTotals[platform] || 0) + (price as number) * item.quantity;
        });
      }
    });
  });

  const cheapestPlatform = Object.entries(platformTotals).reduce((best, [platform, total]) => 
    total < best.total ? { platform, total } : best
  , { platform: 'dmart', total: Infinity });

  const maxTotal = Math.max(...Object.values(platformTotals));
  const maxSavings = maxTotal - cheapestPlatform.total;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            {isHi ? '📋 स्मार्ट खरीदारी सूची' : '📋 Smart Shopping List'}
          </h1>
          <p className="text-muted-foreground">
            {isHi
              ? 'प्रत्येक सामान के लिए सर्वोत्तम कीमत खोजें और अधिकतम बचत करें'
              : 'Find the best price for each item and maximize your savings'}
          </p>
        </div>

        {/* Strategy Card */}
        {analysis && (
          <Card className="mb-8 gradient-primary text-primary-foreground p-6">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg">{isHi ? 'स्मार्ट रणनीति' : 'Smart Strategy'}</h3>
                <p className="mt-2 text-sm opacity-90">{analysis.bestStrategy}</p>
                <div className="mt-3 text-sm font-semibold">
                  {isHi ? 'कुल बचत:' : 'Total Potential Savings:'} ₹{analysis.totalSavings.toFixed(0)}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Platform Comparison Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{isHi ? 'प्लेटफॉर्म तुलना' : 'Platform Comparison'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(platformTotals).map(([platform, total]) => {
              const savings = maxTotal - total;
              const isCheapest = platform === cheapestPlatform.platform;
              return (
                <Card
                  key={platform}
                  className={`p-4 ${isCheapest ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </span>
                    {isCheapest && (
                      <Badge className="bg-green-600 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {isHi ? 'सबसे सस्ता' : 'Cheapest'}
                      </Badge>
                    )}
                  </div>
                  <div className="text-2xl font-bold">₹{total.toFixed(0)}</div>
                  {savings > 0 && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <TrendingDown className="h-3 w-3" />
                      ₹{savings.toFixed(0)} {isHi ? 'बचत' : 'save'}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Shopping Recommendations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{isHi ? 'खरीदारी सुझाव' : 'Shopping Recommendations'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartDetails.map((item) => (
              <ShoppingRecommendationCard
                key={item.productId}
                productId={item.productId}
                productName={item.productName}
                platformPrices={item.prices}
                quantity={item.quantity}
                isHi={isHi}
              />
            ))}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{isHi ? 'विस्तृत विवरण' : 'Detailed Breakdown'}</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-semibold">{isHi ? 'सामान' : 'Item'}</th>
                    <th className="text-center p-4 font-semibold">{isHi ? 'मात्रा' : 'Qty'}</th>
                    <th className="text-right p-4 font-semibold">{isHi ? 'DMart' : 'DMart'}</th>
                    <th className="text-right p-4 font-semibold">{isHi ? 'Blinkit' : 'Blinkit'}</th>
                    <th className="text-right p-4 font-semibold">{isHi ? 'JioMart' : 'JioMart'}</th>
                    <th className="text-right p-4 font-semibold">{isHi ? 'Instamart' : 'Instamart'}</th>
                    <th className="text-right p-4 font-semibold">{isHi ? 'सबसे सस्ता' : 'Cheapest'}</th>
                  </tr>
                </thead>
                <tbody>
                  {cartDetails.map((item, idx) => {
                    const dmart = (item.prices['dmart'] || 0) * item.quantity;
                    const blinkit = (item.prices['blinkit'] || 0) * item.quantity;
                    const jiomart = (item.prices['jiomart'] || 0) * item.quantity;
                    const instamart = (item.prices['instamart'] || 0) * item.quantity;
                    const cheapest = Math.min(dmart, blinkit, jiomart, instamart);

                    return (
                      <tr
                        key={item.productId}
                        className={idx % 2 === 0 ? 'bg-muted/30' : ''}
                      >
                        <td className="p-4 font-semibold">{item.productName}</td>
                        <td className="text-center p-4">{item.quantity}</td>
                        <td className="text-right p-4">₹{dmart.toFixed(0)}</td>
                        <td className="text-right p-4">₹{blinkit.toFixed(0)}</td>
                        <td className="text-right p-4">₹{jiomart.toFixed(0)}</td>
                        <td className="text-right p-4">₹{instamart.toFixed(0)}</td>
                        <td className="text-right p-4 font-bold text-green-600 dark:text-green-400">
                          ₹{cheapest.toFixed(0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t font-bold bg-muted">
                  <tr>
                    <td colSpan={2} className="p-4">
                      {isHi ? 'कुल' : 'Total'}
                    </td>
                    <td className="text-right p-4">₹{platformTotals['dmart']?.toFixed(0) || '0'}</td>
                    <td className="text-right p-4">₹{platformTotals['blinkit']?.toFixed(0) || '0'}</td>
                    <td className="text-right p-4">₹{platformTotals['jiomart']?.toFixed(0) || '0'}</td>
                    <td className="text-right p-4">₹{platformTotals['instamart']?.toFixed(0) || '0'}</td>
                    <td className="text-right p-4 text-green-600 dark:text-green-400">
                      ₹{cheapestPlatform.total.toFixed(0)}
                    </td>
                  </tr>
                  <tr className="bg-green-50 dark:bg-green-950/50">
                    <td colSpan={2} className="p-4">
                      {isHi ? '📊 कुल बचत' : '📊 Total Savings'}
                    </td>
                    <td colSpan={5} className="text-right p-4 text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{maxSavings.toFixed(0)} ({((maxSavings / maxTotal) * 100).toFixed(1)}%)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 justify-center mb-8">
          <Link to="/kirana-comparison">
            <Button variant="outline" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              {isHi ? 'किराना स्टोर से तुलना करें' : 'Compare with Kirana Stores'}
            </Button>
          </Link>
          <Link to="/price-alerts">
            <Button className="gradient-primary text-primary-foreground gap-2">
              <TrendingDown className="h-4 w-4" />
              {isHi ? 'कीमत सतर्कता सेट करें' : 'Set Price Alerts'}
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShoppingListPage;
