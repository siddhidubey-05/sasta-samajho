import { useState, useEffect } from 'react';
import { Plus, Trash2, BarChart3, MapPin, TrendingDown, TrendingUp, DollarSign, Store, Info } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import { productPrices, getCheapestPrice } from '@/data/productPrices';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartSuggestionsPopup from '@/components/SmartSuggestionsPopup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface KiranaStore {
  id: string;
  name: string;
  location: string;
  prices: Record<string, number>;
  createdAt: Date;
  totalProductsTracked: number;
}

export interface KiranaPriceComparison {
  productId: string;
  productName: string;
  kiranaPrice: number;
  onlinesPrices: {
    dmart: number;
    blinkit: number;
    jiomart: number;
    instamart: number;
  };
  cheapestOnline: number;
  cheapestOnlinePlatform: string;
  savingsAtKirana: number;
  savingsOnline: number;
  betterOption: 'kirana' | 'online';
}

const KiranaComparisonPage = () => {
  const { language } = useAppStore();
  const isHi = language === 'hi';

  const [stores, setStores] = useState<KiranaStore[]>([]);
  const [newStore, setNewStore] = useState({ name: '', location: '', productId: '', price: '' });
  const [showForm, setShowForm] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [comparisons, setComparisons] = useState<KiranaPriceComparison[]>([]);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);

  // Load stores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kirana-stores');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStores(parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
        })));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save stores to localStorage
  useEffect(() => {
    localStorage.setItem('kirana-stores', JSON.stringify(stores));
  }, [stores]);

  // Generate comparisons when store is selected
  useEffect(() => {
    if (selectedStore) {
      const store = stores.find((s) => s.id === selectedStore);
      if (store) {
        const comps: KiranaPriceComparison[] = [];
        Object.entries(store.prices).forEach(([productId, kiranaPrice]) => {
          const product = products.find((p) => p.id === productId);
          const prices = productPrices[productId as keyof typeof productPrices];
          
          if (product && prices) {
            const onlinesPrices = prices.prices;
            const cheapestOnline = Math.min(...Object.values(onlinesPrices));
            const cheapestPlatform = Object.entries(onlinesPrices).find(
              ([_, p]) => p === cheapestOnline
            )?.[0] || 'dmart';

            comps.push({
              productId,
              productName: isHi ? product.nameHi : product.name,
              kiranaPrice,
              onlinesPrices,
              cheapestOnline,
              cheapestOnlinePlatform: cheapestPlatform,
              savingsAtKirana: cheapestOnline - kiranaPrice,
              savingsOnline: kiranaPrice - cheapestOnline,
              betterOption: kiranaPrice < cheapestOnline ? 'kirana' : 'online',
            });
          }
        });
        setComparisons(comps);
        // Show smart suggestions popup after a short delay
        if (comps.length > 0) {
          setTimeout(() => setShowSmartSuggestions(true), 500);
        }
      }
    } else {
      setComparisons([]);
    }
  }, [selectedStore, stores, language]);

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.name || !newStore.location || !newStore.productId || !newStore.price) return;

    let store = stores.find((s) => s.name === newStore.name && s.location === newStore.location);

    if (!store) {
      store = {
        id: `store-${Date.now()}`,
        name: newStore.name,
        location: newStore.location,
        prices: {},
        createdAt: new Date(),
        totalProductsTracked: 0,
      };
      setStores([...stores, store]);
    } else {
      store = {
        ...store,
        prices: {
          ...store.prices,
          [newStore.productId]: parseFloat(newStore.price),
        },
        totalProductsTracked: Object.keys({
          ...store.prices,
          [newStore.productId]: parseFloat(newStore.price),
        }).length,
      };
      setStores(stores.map((s) => (s.id === store.id ? store : s)));
    }

    setNewStore({ name: '', location: '', productId: '', price: '' });
    setShowForm(false);
    setSelectedStore(store.id);
  };

  const handleDeleteStore = (id: string) => {
    setStores(stores.filter((s) => s.id !== id));
    if (selectedStore === id) {
      setSelectedStore('');
    }
  };

  const totalKiranaSavings = comparisons
    .filter((c) => c.betterOption === 'kirana')
    .reduce((sum, c) => sum + c.savingsAtKirana, 0);

  const totalOnlineSavings = comparisons
    .filter((c) => c.betterOption === 'online')
    .reduce((sum, c) => sum + c.savingsOnline, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            {isHi ? '🏪 किराना स्टोर तुलना' : '🏪 Kirana Store Comparison'}
          </h1>
          <p className="text-muted-foreground">
            {isHi
              ? 'अपने स्थानीय किराना स्टोर की कीमतें दर्ज करें और ऑनलाइन प्लेटफॉर्म के साथ तुलना करें'
              : 'Add local kirana store prices and compare with online platforms'}
          </p>
        </div>

        {/* Info Alert about Real Data */}
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>{isHi ? '💡 महत्वपूर्ण:' : '💡 Important:'}</strong> {isHi ? 'आप जो कीमतें दर्ज करेंगे वह आपके स्थानीय किराना स्टोर की वास्तविक कीमतें होंगी। इन्हें अपनी खरीदारी से पहले अपडेट रखें ताकि सटीक तुलना मिले। ऑनलाइन प्लेटफॉर्म की कीमतें स्वचालित रूप से अपडेट होती हैं।' : 'Enter real prices from your local kirana stores. Keep prices updated for accurate comparisons. Online platform prices are automatically updated.'}
          </AlertDescription>
        </Alert>

        {/* Stores List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {isHi ? 'आपके किराना स्टोर' : 'Your Kirana Stores'}
            </h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 gradient-primary text-primary-foreground"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              {isHi ? 'स्टोर जोड़ें' : 'Add Store'}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6 p-6">
              <form onSubmit={handleAddPrice} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {isHi ? 'स्टोर का नाम' : 'Store Name'}
                    </label>
                    <Input
                      placeholder={isHi ? 'जैसे: राज किराना' : 'e.g., Raj Kirana'}
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {isHi ? 'स्थान' : 'Location'}
                    </label>
                    <Input
                      placeholder={isHi ? 'जैसे: बांद्रा, मुंबई' : 'e.g., Bandra, Mumbai'}
                      value={newStore.location}
                      onChange={(e) => setNewStore({ ...newStore, location: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {isHi ? 'सामान' : 'Product'}
                    </label>
                    <Select
                      value={newStore.productId}
                      onValueChange={(val) => setNewStore({ ...newStore, productId: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isHi ? 'सामान चुनें' : 'Select product'} />
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
                      {isHi ? 'कीमत (₹)' : 'Price (₹)'}
                    </label>
                    <Input
                      type="number"
                      placeholder={isHi ? 'कीमत दर्ज करें' : 'Enter price'}
                      value={newStore.price}
                      onChange={(e) => setNewStore({ ...newStore, price: e.target.value })}
                      min="0"
                      step="5"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="gradient-primary text-primary-foreground flex-1">
                    {isHi ? 'कीमत जोड़ें' : 'Add Price'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Stores Display */}
          {stores.length === 0 ? (
            <Card className="p-12 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">
                {isHi ? 'कोई स्टोर नहीं जोड़े गए' : 'No Stores Added'}
              </h3>
              <p className="mb-4 text-muted-foreground">
                {isHi ? 'अपना पहला किराना स्टोर जोड़ें' : 'Add your first kirana store to get started'}
              </p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {stores.map((store) => (
                <Card
                  key={store.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedStore === store.id ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  onClick={() => setSelectedStore(store.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">{store.location}</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        {store.totalProductsTracked} {isHi ? 'सामान' : 'products'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStore(store.id);
                      }}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Results */}
        {selectedStore && comparisons.length > 0 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4 gradient-primary text-primary-foreground">
                <div className="text-sm opacity-90">
                  {isHi ? 'किराने में कुल बचत' : 'Total Kirana Savings'}
                </div>
                <div className="text-3xl font-bold">₹{totalKiranaSavings.toFixed(0)}</div>
              </Card>
              <Card className="p-4 gradient-savings text-savings-foreground">
                <div className="text-sm opacity-90">
                  {isHi ? 'ऑनलाइन में कुल बचत' : 'Total Online Savings'}
                </div>
                <div className="text-3xl font-bold">₹{totalOnlineSavings.toFixed(0)}</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-lg">
                <BarChart3 className="h-5 w-5" />
                {isHi ? 'विस्तृत तुलना' : 'Detailed Comparison'}
              </h3>
              <div className="space-y-4">
                {comparisons.map((comp) => {
                  const savings = comp.betterOption === 'kirana' ? comp.savingsAtKirana : comp.savingsOnline;
                  return (
                    <Card
                      key={comp.productId}
                      className={`p-4 ${
                        comp.betterOption === 'kirana'
                          ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                          : 'border-savings/50 bg-savings/5 dark:bg-savings/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{comp.productName}</h4>
                            {comp.betterOption === 'kirana' ? (
                              <Badge className="bg-primary text-primary-foreground">
                                <Store className="h-3 w-3 mr-1" />
                                {isHi ? 'किराना सस्ता' : 'Kirana Cheaper'}
                              </Badge>
                            ) : (
                              <Badge className="bg-savings text-savings-foreground">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {isHi ? 'ऑनलाइन सस्ता' : 'Online Cheaper'}
                              </Badge>
                            )}
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg bg-white dark:bg-slate-900 p-3">
                              <div className="text-xs text-muted-foreground font-semibold">
                                {isHi ? '🏪 किराना स्टोर' : '🏪 Kirana'}
                              </div>
                              <div className="mt-1">
                                <div className="text-2xl font-bold text-primary">₹{comp.kiranaPrice}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {isHi ? 'प्रति यूनिट' : 'per unit'}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg bg-white dark:bg-slate-900 p-3">
                              <div className="text-xs text-muted-foreground font-semibold">
                                {isHi ? '🌐 सबसे सस्ता ऑनलाइन' : '🌐 Cheapest Online'}
                              </div>
                              <div className="mt-1">
                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {comp.cheapestOnlinePlatform.toUpperCase()}
                                </div>
                                <div className="text-2xl font-bold">₹{comp.cheapestOnline}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {isHi ? 'प्रति यूनिट' : 'per unit'}
                                </div>
                              </div>
                            </div>

                            <div className={`rounded-lg p-3 ${
                              comp.betterOption === 'kirana'
                                ? 'bg-primary/20 dark:bg-primary/20'
                                : 'bg-savings/20 dark:bg-savings/20'
                            }`}>
                              <div className="text-xs font-semibold">
                                {isHi ? '💰 बचत / अतिरिक्त खर्च' : '💰 You Save/Spend'}
                              </div>
                              <div className={`mt-1 text-2xl font-bold ${
                                comp.betterOption === 'kirana'
                                  ? 'text-primary'
                                  : 'text-savings'
                              }`}>
                                {comp.betterOption === 'kirana' ? '✓' : '✗'} ₹{savings.toFixed(0)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {isHi 
                                  ? (comp.betterOption === 'kirana' ? 'प्रति यूनिट सस्ता' : 'प्रति यूनिट महंगा')
                                  : (comp.betterOption === 'kirana' ? 'per unit' : 'per unit')
                                }
                              </div>
                            </div>
                          </div>

                          {/* Recommendation */}
                          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800">
                            <div className="text-sm">
                              <strong>{isHi ? "💡 सुझाव:" : "💡 Recommendation:"}</strong> {isHi ? "इस प्रोडक्ट को" : "Buy from"} <strong>
                                {comp.betterOption === "kirana" ? isHi ? "किराना स्टोर" : "Kirana Store" : comp.cheapestOnlinePlatform.toUpperCase()}
                              </strong> {isHi ? "से खरीदें। आप" : "to save"} <strong className={comp.betterOption === "kirana" ? "text-primary" : "text-savings"}>₹{savings.toFixed(0)}</strong> {isHi ? "बचा सकते हैं।" : "per unit."}</div>
                            </div>
                          </div>
                        </div>
                      </Card>
                  );
                })}
              </div>
            </Card>

            {/* Info Section */}
            <div className="mt-8 rounded-lg bg-green-50 p-4">
              <h3 className="mb-2 font-semibold text-green-900">
                {isHi ? '💡 कैसे उपयोग करें' : '💡 How to Use'}
              </h3>
              <ul className="space-y-1 text-sm text-green-800">
                <li>✅ {isHi ? 'अपने स्थानीय किराना स्टोर की कीमतें दर्ज करें' : 'Enter prices from your local kirana store'}</li>
                <li>✅ {isHi ? 'हम ऑनलाइन प्लेटफॉर्म के साथ तुलना करते हैं' : 'We compare with online platforms'}</li>
                <li>✅ {isHi ? 'कहां से खरीदना सस्ता है यह जानें' : 'See where you can get the best price'}</li>
                <li>✅ {isHi ? 'स्मार्ट खरीदारी करें और पैसे बचाएं!' : 'Shop smart and save money!'}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <Footer />
      {/* Smart Suggestions Popup */}
      <SmartSuggestionsPopup
        productIds={comparisons.map((c) => c.productId)}
        isOpen={showSmartSuggestions}
        onClose={() => setShowSmartSuggestions(false)}
        isHi={isHi}
      />
    </div>
  );
};

export default KiranaComparisonPage;
