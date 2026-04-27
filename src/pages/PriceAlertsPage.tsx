import { useState, useEffect } from 'react';
import { Trash2, Plus, Bell, TrendingDown, Zap, AlertCircle, ShoppingCart, Filter, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import { productPrices, getCheapestPrice } from '@/data/productPrices';
import { comparePlatformPrices } from '@/lib/smartSuggestions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  platform: string;
  oldPrice: number;
  newPrice: number;
  percentageDrop: number;
  createdAt: Date;
  notified: boolean;
  bestCurrentDeal?: {
    platform: string;
    price: number;
  };
  category?: string;
  reason?: string;
}

const PriceAlertsPage = () => {
  const { cart, language } = useAppStore();
  const isHi = language === 'hi';
  
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'savings'>('savings');

  // Get watchlist (cart items)
  const watchlistProductIds = cart.map((item) => item.productId);

  // Get all unique categories from watchlist products
  const categories = Array.from(
    new Set(
      products
        .filter((p) => watchlistProductIds.includes(p.id))
        .map((p) => p.category)
    )
  );

  // Generate price drop alerts for watchlist products
  useEffect(() => {
    const generatedAlerts: PriceAlert[] = [];
    const seenPlatforms = new Set<string>();

    watchlistProductIds.forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      const priceData = productPrices[productId as keyof typeof productPrices];

      if (product && priceData) {
        const basePrice = priceData.basePrice;
        const platformComps = comparePlatformPrices(productId, 1);
        const bestDeal = platformComps.find((p) => p.isCheapest);

        // Generate alerts for price drops by platform
        Object.entries(priceData.prices).forEach(([platform, currentPrice]) => {
          const oldPrice = basePrice + Math.random() * 20; // Simulated old price
          const drop = oldPrice - currentPrice;
          const percentDrop = (drop / oldPrice) * 100;

          if (percentDrop > 3) { // Only show significant drops
            const key = `${productId}-${platform}`;
            if (!seenPlatforms.has(key)) {
              seenPlatforms.add(key);
              generatedAlerts.push({
                id: `alert-${productId}-${platform}-${Date.now()}`,
                productId,
                productName: isHi ? product.nameHi : product.name,
                platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                oldPrice: Math.round(oldPrice * 100) / 100,
                newPrice: Math.round(currentPrice * 100) / 100,
                percentageDrop: Math.round(percentDrop * 10) / 10,
                createdAt: new Date(),
                notified: false,
                bestCurrentDeal: bestDeal
                  ? {
                      platform: bestDeal.platform,
                      price: bestDeal.price,
                    }
                  : undefined,
                category: product.category,
                reason: priceData.reason,
              });
            }
          }
        });
      }
    });

    setAlerts(generatedAlerts.sort((a, b) => b.percentageDrop - a.percentageDrop));
  }, [cart, watchlistProductIds.length]);

  // Filter alerts
  const filteredAlerts = alerts
    .filter((alert) => platformFilter === 'all' || alert.platform === platformFilter)
    .filter((alert) => categoryFilter === 'all' || alert.category === categoryFilter)
    .sort((a, b) => {
      if (sortBy === 'savings') {
        return b.percentageDrop - a.percentageDrop;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const totalSavings = filteredAlerts.reduce((sum, a) => sum + (a.oldPrice - a.newPrice), 0);
  const totalDrops = filteredAlerts.length;

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            {isHi ? '🔔 मूल्य सतर्कताएं' : '🔔 Price Alerts'}
          </h1>
          <p className="text-muted-foreground">
            {isHi
              ? 'आपके कार्ट में जोड़े गए सामान के लिए कीमत में गिरावट को देखें'
              : 'Price drops for items in your cart and shopping list'}
          </p>
        </div>

        {watchlistProductIds.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mb-2 text-lg font-semibold">
              {isHi ? 'कोई सामान नहीं जोड़ा गया' : 'No Items in Your List'}
            </h3>
            <p className="mb-4 text-muted-foreground">
              {isHi
                ? 'मूल्य सतर्कताएं देखने के लिए कार्ट या शॉपिंग सूची में सामान जोड़ें'
                : 'Add items to your cart or shopping list to see price drops'}
            </p>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">
                  {isHi ? 'कुल कीमत कटौती' : 'Total Price Drops'}
                </div>
                <div className="text-2xl font-bold">{totalDrops}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-savings" />
                  {isHi ? 'कुल बचत' : 'Total Savings'}
                </div>
                <div className="text-2xl font-bold text-savings">₹{Math.round(totalSavings)}</div>
              </Card>
              <Card className="p-4 gradient-primary text-primary-foreground">
                <div className="text-sm opacity-90">
                  {isHi ? 'औसत कटौती' : 'Avg. Drop'}
                </div>
                <div className="text-2xl font-bold">
                  {totalDrops > 0 ? ((filteredAlerts.reduce((sum, a) => sum + a.percentageDrop, 0)) / totalDrops).toFixed(1) : 0}%
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" />
                <span className="font-semibold text-sm">
                  {isHi ? 'फ़िल्टर और क्रमांकन' : 'Filters & Sorting'}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {isHi ? 'प्लेटफॉर्म' : 'Platform'}
                  </label>
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {isHi ? 'सभी प्लेटफॉर्म' : 'All Platforms'}
                      </SelectItem>
                      <SelectItem value="Dmart">DMart</SelectItem>
                      <SelectItem value="Blinkit">Blinkit</SelectItem>
                      <SelectItem value="Jiomart">JioMart</SelectItem>
                      <SelectItem value="Instamart">Instamart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {isHi ? 'श्रेणी' : 'Category'}
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {isHi ? 'सभी श्रेणियां' : 'All Categories'}
                      </SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {isHi ? 'क्रमांकन' : 'Sort By'}
                  </label>
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'recent' | 'savings')}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">
                        {isHi ? 'सबसे अधिक बचत' : 'Highest Savings'}
                      </SelectItem>
                      <SelectItem value="recent">
                        {isHi ? 'सबसे नया' : 'Most Recent'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Alerts List */}
            {filteredAlerts.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mb-2 text-lg font-semibold">
                  {isHi ? 'कोई सतर्कताएं नहीं' : 'No Alerts Found'}
                </h3>
                <p className="text-muted-foreground">
                  {isHi ? 'चयनित फ़िल्टर के साथ कोई कीमत कटौती नहीं' : 'No price drops for your selected filters'}
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAlerts.map((alert) => {
                  const savings = alert.oldPrice - alert.newPrice;
                  const savingsPercentage = (savings / alert.oldPrice) * 100;
                  
                  return (
                    <Card
                      key={alert.id}
                      className="p-5 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/50 to-transparent hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Product Name and Category */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg text-gray-900">
                              {alert.productName}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {alert.category}
                            </Badge>
                            <Badge className="bg-green-600 text-white animate-pulse">
                              ↓ {alert.percentageDrop.toFixed(1)}%
                            </Badge>
                          </div>

                          {/* Main Info Section */}
                          <div className="mt-4 grid gap-3 sm:grid-cols-5">
                            {/* Platform */}
                            <div className="rounded-lg bg-white p-3 border">
                              <div className="text-xs text-muted-foreground font-semibold">
                                {isHi ? '📍 प्लेटफॉर्म' : '📍 Platform'}
                              </div>
                              <div className="mt-2 font-bold text-gray-900">
                                {alert.platform}
                              </div>
                            </div>

                            {/* Old Price */}
                            <div className="rounded-lg bg-white p-3 border">
                              <div className="text-xs text-muted-foreground font-semibold">
                                {isHi ? '⏮ पुरानी कीमत' : '⏮ Old Price'}
                              </div>
                              <div className="mt-2 font-bold text-gray-900 line-through opacity-70">
                                ₹{alert.oldPrice.toFixed(0)}
                              </div>
                            </div>

                            {/* New Price */}
                            <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                              <div className="text-xs text-muted-foreground font-semibold">
                                {isHi ? '🎯 नई कीमत' : '🎯 New Price'}
                              </div>
                              <div className="mt-2 font-bold text-green-700">
                                ₹{alert.newPrice.toFixed(0)}
                              </div>
                            </div>

                            {/* Savings */}
                            <div className="rounded-lg bg-green-100 p-3 border border-green-300">
                              <div className="text-xs text-muted-foreground font-semibold">
                                {isHi ? '💰 बचत' : '💰 You Save'}
                              </div>
                              <div className="mt-2 font-bold text-green-700">
                                ₹{savings.toFixed(0)}
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                {savingsPercentage.toFixed(1)}% off
                              </div>
                            </div>

                            {/* Best Deal */}
                            {alert.bestCurrentDeal && (
                              <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                                <div className="text-xs text-muted-foreground font-semibold">
                                  {isHi ? '🏆 सर्वश्रेष्ठ डील' : '🏆 Best Deal'}
                                </div>
                                <div className="mt-2 font-bold text-blue-700">
                                  {alert.bestCurrentDeal.platform}
                                </div>
                                <div className="text-xs text-blue-600">
                                  ₹{alert.bestCurrentDeal.price.toFixed(0)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Reason/Info */}
                          {alert.reason && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3 border border-blue-200">
                              <Zap className="h-4 w-4 flex-shrink-0 text-blue-600 mt-0.5" />
                              <p className="text-sm text-blue-800">{alert.reason}</p>
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="mt-3">
                            <Badge variant="outline" className="text-xs">
                              {isHi ? 'अपडेट किया गया:' : 'Updated:'} {new Date(alert.createdAt).toLocaleDateString(isHi ? 'hi-IN' : 'en-US')}
                            </Badge>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-200">
              <h3 className="mb-3 font-semibold text-blue-900">
                {isHi ? 'ℹ️ कैसे काम करता है?' : 'ℹ️ How it Works'}
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold">✅</span>
                  <span>
                    {isHi
                      ? 'हम आपके कार्ट में जोड़े गए सामान की कीमतें ट्रैक करते हैं'
                      : 'We track prices for items you add to cart'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">✅</span>
                  <span>
                    {isHi
                      ? 'सभी प्लेटफॉर्म पर कीमत की गिरावट देखें'
                      : 'See price drops across all platforms'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">✅</span>
                  <span>
                    {isHi
                      ? 'प्लेटफॉर्म और श्रेणी के अनुसार फ़िल्टर करें'
                      : 'Filter by platform and category'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">✅</span>
                  <span>
                    {isHi
                      ? 'सर्वोत्तम सौदों पर कभी न भूलें - स्मार्ट खरीदारी करें!'
                      : 'Never miss great deals - shop smarter!'}
                  </span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PriceAlertsPage;
