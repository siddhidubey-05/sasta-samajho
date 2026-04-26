import { useState, useEffect } from 'react';
import { Trash2, Plus, Bell, TrendingDown, Zap, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import { productPrices, getCheapestPrice, getPriceDropPrediction } from '@/data/productPrices';
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
  targetPrice: number;
  currentPrice: number;
  createdAt: Date;
  notified: boolean;
  platform?: string;
  priceDropped: boolean;
  prediction?: {
    expectedDays: number;
    reason: string;
    expectedDropAmount: number;
  };
}

const PriceAlertsPage = () => {
  const { language } = useAppStore();
  const isHi = language === 'hi';
  
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newAlert, setNewAlert] = useState({ productId: '', targetPrice: '' });
  const [showForm, setShowForm] = useState(false);

  // Load alerts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('price-alerts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAlerts(parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
        })));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('price-alerts', JSON.stringify(alerts));
  }, [alerts]);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.productId || !newAlert.targetPrice) return;

    const product = products.find((p) => p.id === newAlert.productId);
    if (!product) return;

    const priceData = productPrices[newAlert.productId as keyof typeof productPrices];
    const currentPrice = getCheapestPrice(newAlert.productId) || 50;
    const targetPrice = parseFloat(newAlert.targetPrice);
    const prediction = getPriceDropPrediction(newAlert.productId);

    const alert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productId: newAlert.productId,
      productName: isHi ? product.nameHi : product.name,
      targetPrice,
      currentPrice,
      createdAt: new Date(),
      notified: currentPrice <= targetPrice,
      platform: 'All',
      priceDropped: currentPrice <= targetPrice,
      prediction: prediction || undefined,
    };

    setAlerts([...alerts, alert]);
    setNewAlert({ productId: '', targetPrice: '' });
    setShowForm(false);

    // Auto-trigger notification if price already dropped
    if (currentPrice <= targetPrice) {
      const msg = isHi
        ? `✅ कीमत पहले से ही कम है! ${product.nameHi} - ₹${currentPrice.toFixed(0)}`
        : `✅ Price already dropped! ${product.name} - ₹${currentPrice.toFixed(0)}`;
      console.log(msg);
    }
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const alertsTriggered = alerts.filter((a) => a.priceDropped).length;

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
              ? 'अपनी पसंदीदा वस्तुओं के लिए मूल्य सतर्कताएं सेट करें और सर्वोत्तम सौदे कभी न भूलें'
              : 'Set price alerts for your favorite items and never miss a great deal'}
          </p>
        </div>

        {/* Alert Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">
              {isHi ? 'कुल सतर्कताएं' : 'Total Alerts'}
            </div>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-savings" />
              {isHi ? 'कीमत कम हुई' : 'Price Dropped'}
            </div>
            <div className="text-2xl font-bold text-savings">{alertsTriggered}</div>
          </Card>
          <Card className="p-4 gradient-primary text-primary-foreground">
            <div className="text-sm opacity-90">
              {isHi ? 'संभावित बचत' : 'Potential Savings'}
            </div>
            <div className="text-2xl font-bold">
              ₹{alerts
                .filter((a) => a.priceDropped)
                .reduce((sum, a) => sum + (a.currentPrice - a.targetPrice), 0)
                .toFixed(0)}
            </div>
          </Card>
        </div>

        {/* Add Alert Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-6 gap-2 gradient-primary text-primary-foreground"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            {isHi ? 'नई सतर्कता जोड़ें' : 'Add New Alert'}
          </Button>
        )}

        {/* Add Alert Form */}
        {showForm && (
          <Card className="mb-6 p-6">
            <form onSubmit={handleAddAlert} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {isHi ? 'सामान चुनें' : 'Select Item'}
                </label>
                <Select value={newAlert.productId} onValueChange={(val) => setNewAlert({ ...newAlert, productId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder={isHi ? 'सामान चुनें...' : 'Choose item...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(productPrices).map((productId) => {
                      const product = products.find((p) => p.id === productId);
                      return product ? (
                        <SelectItem key={productId} value={productId}>
                          {isHi ? product.nameHi : product.name} ({product.unit})
                        </SelectItem>
                      ) : null;
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  {isHi ? 'लक्ष्य मूल्य (₹)' : 'Target Price (₹)'}
                </label>
                <Input
                  type="number"
                  placeholder={isHi ? 'जब कीमत इससे कम हो तो सूचित करें' : 'Alert when price drops below'}
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                  min="0"
                  step="10"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="gradient-primary text-primary-foreground flex-1">
                  {isHi ? 'सतर्कता जोड़ें' : 'Add Alert'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setNewAlert({ productId: '', targetPrice: '' });
                  }}
                  className="flex-1"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">
                {isHi ? 'कोई सतर्कताएं नहीं' : 'No Alerts Yet'}
              </h3>
              <p className="mb-4 text-muted-foreground">
                {isHi
                  ? 'मूल्य ट्रैकिंग शुरू करने के लिए अपनी पहली सतर्कता जोड़ें'
                  : 'Add your first alert to start tracking prices'}
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {isHi ? 'पहली सतर्कता जोड़ें' : 'Add First Alert'}
              </Button>
            </Card>
          ) : (
            alerts.map((alert) => {
              const triggered = alert.priceDropped;
              const savings = alert.currentPrice - alert.targetPrice;

              return (
                <Card
                  key={alert.id}
                  className={`p-4 transition-all ${
                    triggered ? 'border-savings bg-savings/5 ring-1 ring-savings/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{alert.productName}</h3>
                        {triggered && (
                          <Badge className="gradient-savings text-savings-foreground animate-pulse">
                            {isHi ? '🎉 कीमत कम हुई!' : '🎉 Price Dropped!'}
                          </Badge>
                        )}
                        {!triggered && alert.prediction && alert.prediction.expectedDays <= 3 && (
                          <Badge className="bg-orange-100 text-orange-800">
                            {isHi ? '⚡ जल्द ही' : '⚡ Coming Soon'}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-4">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isHi ? 'वर्तमान कीमत' : 'Current Price'}
                          </div>
                          <div className="text-lg font-bold">₹{alert.currentPrice.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {isHi ? 'लक्ष्य कीमत' : 'Target Price'}
                          </div>
                          <div className="text-lg font-bold text-primary">₹{alert.targetPrice.toFixed(0)}</div>
                        </div>
                        {triggered && (
                          <div>
                            <div className="text-xs text-muted-foreground">
                              {isHi ? 'बचत' : 'You Save'}
                            </div>
                            <div className="text-lg font-bold text-savings">₹{savings.toFixed(0)}</div>
                          </div>
                        )}
                        {alert.prediction && (
                          <div>
                            <div className="text-xs text-muted-foreground">
                              {isHi ? 'अनुमानित ड्रॉप' : 'Expected Drop'}
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              ₹{alert.prediction.expectedDropAmount}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price Prediction Section */}
                      {alert.prediction && !triggered && (
                        <div className="mt-3 rounded-lg bg-blue-50 p-3 border border-blue-200">
                          <div className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-semibold text-blue-900">
                                {isHi ? '📊 मूल्य कम होने की संभावना' : '📊 Price Drop Prediction'}
                              </h4>
                              <p className="text-sm text-blue-800 mt-1">
                                {isHi
                                  ? `${alert.prediction.expectedDays} दिनों में ₹${alert.prediction.expectedDropAmount} तक कम हो सकता है।`
                                  : `Expected to drop by ₹${alert.prediction.expectedDropAmount} in ${alert.prediction.expectedDays} days.`}
                              </p>
                              <p className="text-xs text-blue-700 mt-1">
                                <strong>{isHi ? 'कारण:' : 'Reason:'}</strong> {alert.prediction.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.platform}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {isHi ? 'सेट किया गया:' : 'Set:'} {new Date(alert.createdAt).toLocaleDateString(isHi ? 'hi-IN' : 'en-US')}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">
            {isHi ? 'ℹ️ कैसे काम करता है?' : 'ℹ️ How it Works'}
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✅ {isHi ? 'आप अपनी लक्ष्य कीमत सेट करते हैं' : 'Set your target price for any item'}</li>
            <li>✅ {isHi ? 'हम सभी प्लेटफ़ॉर्म पर कीमतें ट्रैक करते हैं' : 'We monitor prices across all platforms'}</li>
            <li>✅ {isHi ? 'जब कीमत आपके लक्ष्य तक पहुंचे तो आप सूचित होते हैं' : 'Get notified when price reaches your target'}</li>
            <li>✅ {isHi ? 'सर्वोत्तम सौदों पर कभी न भूलें!' : 'Never miss great deals again!'}</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PriceAlertsPage;
