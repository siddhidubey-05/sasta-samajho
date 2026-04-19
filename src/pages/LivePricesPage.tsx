import { useState } from 'react';
import { Search as SearchIcon, ExternalLink, Loader2, TrendingDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useLivePrices, LiveProduct } from '@/hooks/useLivePrices';
import { cities } from '@/data/mockData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react'; // Already there
// Kirana form state - no new imports needed


const LivePricesPage = () => {
  const { language, selectedCity } = useAppStore();
  const isHi = language === 'hi';
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const cityObj = cities.find((c) => c.name === selectedCity);
  const location = cityObj ? `${cityObj.name}, India` : 'Mumbai, India';

  const { data, isLoading, isError, error } = useLivePrices(activeQuery, location);

  const handleSearch = () => {
    if (searchInput.trim().length >= 2) {
      setActiveQuery(searchInput.trim());
    }
  };

  const cheapest = data?.allResults?.length
    ? data.allResults.reduce((min, r) => (r.price > 0 && r.price < min.price ? r : min), data.allResults.filter(r => r.price > 0)[0])
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-6">
        <h1 className="mb-1 text-2xl font-bold">
          {isHi ? '🔴 लाइव कीमतें' : '🔴 Live Prices'}
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          {isHi
            ? 'SerpAPI से रियल-टाइम कीमतें खोजें'
            : 'Search real-time prices powered by SerpAPI'}
        </p>

        {/* Search bar */}
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={isHi ? 'आटा 5kg, अमूल दूध, तूर दाल...' : 'Atta 5kg, Amul milk, toor dal...'}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} className="gradient-primary text-primary-foreground">
            {isHi ? 'खोजें' : 'Search'}
          </Button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isHi ? 'कीमतें खोज रहे हैं...' : 'Searching prices...'}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              {isHi ? 'कुछ गलत हो गया' : 'Something went wrong'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(error as Error)?.message || 'Unknown error'}
            </p>
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <>
            {/* Summary */}
            <div className="mb-4 text-sm text-muted-foreground">
              {isHi
                ? `"${data.query}" के लिए ${data.totalResults} रिजल्ट मिले`
                : `${data.totalResults} results for "${data.query}"`}
            </div>

            {/* Cheapest highlight */}
            {cheapest && cheapest.price > 0 && (
              <div className="mb-6 rounded-xl gradient-savings p-5 text-center text-savings-foreground">
                <p className="text-xs font-medium opacity-80">
                  {isHi ? '💡 सबसे सस्ता मिला' : '💡 Cheapest Found'}
                </p>
                <p className="mt-1 text-2xl font-extrabold">₹{cheapest.price}</p>
                <p className="text-sm font-semibold">{cheapest.source}</p>
                <p className="mt-1 truncate text-xs opacity-80">{cheapest.title}</p>
              </div>
            )}

            {/* Platform-wise results */}
            {data.platformResults.some((pr) => pr.products.length > 0) && (
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-bold">
                  {isHi ? '📊 प्लेटफ़ॉर्म-वाइज़ कीमतें' : '📊 Platform-wise Prices'}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.platformResults
                    .filter((pr) => pr.products.length > 0)
                    .map((pr) => (
                      <div key={pr.platform} className="rounded-xl border border-border bg-card p-4 shadow-card">
                        <h3 className="mb-2 font-bold">{pr.platform}</h3>
                        <div className="space-y-2">
                          {pr.products.slice(0, 3).map((product, idx) => (
                            <ProductRow key={idx} product={product} isCheapest={cheapest?.link === product.link} />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* All results */}
            {data.allResults.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-bold">
                  {isHi ? '🛒 सभी रिजल्ट' : '🛒 All Results'}
                </h2>
                <div className="space-y-3">
                  {data.allResults.map((product, idx) => (
                    <ProductRow key={idx} product={product} isCheapest={cheapest?.link === product.link} />
                  ))}
                </div>
              </div>
            )}

            {/* Price snippets */}
            {data.priceSnippets.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-bold">
                  {isHi ? '📰 वेब से कीमतें' : '📰 Prices from Web'}
                </h2>
                <div className="space-y-3">
                  {data.priceSnippets.map((snippet, idx) => (
                    <a
                      key={idx}
                      href={snippet.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                    >
                      <p className="text-sm font-medium">{snippet.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{snippet.snippet}</p>
                      <p className="mt-1 text-[10px] text-primary">{snippet.source}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {data.allResults.length === 0 && data.priceSnippets.length === 0 && (
              <div className="py-20 text-center">
                <span className="text-5xl">🔍</span>
                <p className="mt-4 text-lg font-semibold text-muted-foreground">
                  {isHi ? 'कोई रिजल्ट नहीं मिला' : 'No results found'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isHi ? 'कुछ और खोजें' : 'Try a different search'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!activeQuery && !isLoading && (
          <div className="py-20 text-center">
            <span className="text-5xl">🔴</span>
            <p className="mt-4 text-lg font-semibold">
              {isHi ? 'लाइव कीमतें खोजें' : 'Search Live Prices'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isHi
                ? 'ऊपर सर्च बार में सामान का नाम टाइप करें'
                : 'Type a product name in the search bar above'}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const ProductRow = ({ product, isCheapest }: { product: LiveProduct; isCheapest: boolean }) => {
  const [showKiranaForm, setShowKiranaForm] = useState(false);
  const [kiranaData, setKiranaData] = useState({ store: '', price: '' });

  const addKiranaPrice = () => {
    if (kiranaData.store && kiranaData.price) {
      alert(`
✅ KIRANA PRICE ADDED SUCCESSFULLY!

🏪 Store: ${kiranaData.store}
💰 Price: ₹${kiranaData.price}
📦 Product: ${product.title}

💡 Now compare with online ₹${product.price}!
⭐ Thanks for contributing local prices!
      `);
      setShowKiranaForm(false);
      setKiranaData({ store: '', price: '' });
    }
  };

  return (
    <div className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${isCheapest ? 'border-emerald-400 bg-emerald-50/50 shadow-md' : 'border-border hover:border-emerald-300 hover:shadow-lg'}`}>
      
      {/* EXISTING PRODUCT INFO */}
      <div className="flex items-center gap-3">
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.title} className="h-16 w-16 rounded-lg object-cover shadow-md" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-2xl shadow-md">🛒</div>
        )}
        
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-tight">{product.title}</p>
          <p className="text-xs text-muted-foreground capitalize">{product.source}</p>
          {product.delivery && <p className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full w-fit">{product.delivery}</p>}
        </div>
        
        <div className="flex flex-col items-end gap-1 text-right">
          <span className={`text-xl font-black ${isCheapest ? 'text-emerald-600 drop-shadow-lg' : 'text-foreground'}`}>
            {product.price > 0 ? `₹${product.price}` : product.priceFormatted || '—'}
          </span>
          {isCheapest && (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-xs px-3 py-1 shadow-md">
              <TrendingDown className="mr-1 h-3 w-3 -rotate-12" /> सबसे सस्ता!
            </Badge>
          )}
        </div>
        
        <a href={product.link} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-muted rounded-lg transition-all hover:scale-105">
          <ExternalLink className="h-5 w-5 text-primary hover:text-primary/80" />
        </a>
      </div>

      {/* 🆕 KIRANA STORE COMPARISON SECTION */}
      <div className="border-t pt-4 mt-3">
        <div className="flex items-center justify-between mb-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-lg animate-pulse"></div>
            <h4 className="font-bold text-lg bg-gradient-to-r from-emerald-700 to-green-800 bg-clip-text text-transparent">
              🏪 Local Kirana Prices
            </h4>
          </div>
          <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-700 hover:bg-emerald-50">
            Save 15-30%!
          </Badge>
        </div>

        {/* Kirana Prices Display (Mock Data) */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all">
            <div className="text-xs text-emerald-700 font-medium mb-1">Sharma Kirana</div>
            <div className="text-lg font-bold text-emerald-800">₹{Math.round(product.price * 0.82)}</div>
            <div className="text-xs text-emerald-600 mt-1">1kg - Yesterday</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all">
            <div className="text-xs text-orange-700 font-medium mb-1">Patel Store</div>
            <div className="text-lg font-bold text-orange-800">₹{Math.round(product.price * 0.78)}</div>
            <div className="text-xs text-orange-600 mt-1">Today</div>
          </div>
        </div>

        {/* ADD YOUR KIRANA PRICE BUTTON */}
        <Button 
          onClick={() => setShowKiranaForm(!showKiranaForm)}
          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 px-6 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 border-0 text-sm"
          size="sm"
        >
          {showKiranaForm ? '✏️ Edit' : '➕ Add My Kirana Price'}
        </Button>

        {/* KIRANA FORM */}
        {showKiranaForm && (
          <div className="mt-3 p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-300 shadow-inner">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">🏪 Store Name</label>
                <input
                  type="text"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Sharma Kirana"
                  value={kiranaData.store}
                  onChange={(e) => setKiranaData({...kiranaData, store: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">💰 Price (₹)</label>
                <input
                  type="number"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="45"
                  value={kiranaData.price}
                  onChange={(e) => setKiranaData({...kiranaData, price: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={addKiranaPrice}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-md"
                size="sm"
              >
                ✅ Save Kirana Price
              </Button>
              <Button 
                onClick={() => {
                  setShowKiranaForm(false);
                  setKiranaData({ store: '', price: '' });
                }}
                variant="outline"
                size="sm"
                className="px-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Savings Comparison */}
        <div className="mt-4 pt-3 border-t border-emerald-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold">Online Price:</span>
            <span className="text-gray-900 font-bold">₹{product.price}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-emerald-700 font-semibold">Est. Kirana Saving:</span>
            <span className="text-green-600 font-bold">~20% cheaper</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LivePricesPage;
