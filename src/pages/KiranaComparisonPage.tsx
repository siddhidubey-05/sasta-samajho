import { useState, useEffect } from 'react';
import { Plus, Trash2, BarChart3, MapPin } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import { productPrices, getCheapestPrice } from '@/data/productPrices';
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
                {comparisons.map((comp) => (
                  <div
                    key={comp.productId}
                    className={`rounded-lg border p-4 ${
                      comp.betterOption === 'kirana'
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-savings/20 bg-savings/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold">{comp.productName}</h4>
                        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                          <div>
                            <span className="text-muted-foreground">
                              {isHi ? 'किराना:' : 'Kirana:'}
                            </span>
                            <div className="text-lg font-bold">₹{comp.kiranaPrice}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {isHi ? 'सबसे सस्ता ऑनलाइन:' : 'Cheapest Online:'}
                            </span>
                            <div className="text-lg font-bold">{comp.cheapestOnlinePlatform.toUpperCase()}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {isHi ? 'कीमत:' : 'Price:'}
                            </span>
                            <div className="text-lg font-bold">₹{comp.cheapestOnline}</div>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          comp.betterOption === 'kirana'
                            ? 'gradient-primary text-primary-foreground'
                            : 'gradient-savings text-savings-foreground'
                        }`}
                      >
                        {comp.betterOption === 'kirana'
                          ? `${isHi ? 'किराना सस्ता' : 'Kirana Better'} ₹${comp.savingsAtKirana}`
                          : `${isHi ? 'ऑनलाइन सस्ता' : 'Online Better'} ₹${comp.savingsOnline}`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

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
      <Footer />
    </div>
  );
};

export default KiranaComparisonPage;
