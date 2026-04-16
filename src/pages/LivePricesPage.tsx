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

const ProductRow = ({ product, isCheapest }: { product: LiveProduct; isCheapest: boolean }) => (
  <div className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${isCheapest ? 'border-savings bg-savings/5' : 'border-border'}`}>
    {product.thumbnail ? (
      <img src={product.thumbnail} alt={product.title} className="h-12 w-12 rounded-md object-cover" />
    ) : (
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-lg">🛒</div>
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">{product.title}</p>
      <p className="text-xs text-muted-foreground">{product.source}</p>
      {product.delivery && <p className="text-[10px] text-muted-foreground">{product.delivery}</p>}
    </div>
    <div className="flex flex-col items-end gap-1">
      <span className={`text-lg font-bold ${isCheapest ? 'text-savings' : ''}`}>
        {product.price > 0 ? `₹${product.price}` : product.priceFormatted || '—'}
      </span>
      {isCheapest && (
        <Badge variant="secondary" className="bg-savings/10 text-savings text-[10px]">
          <TrendingDown className="mr-0.5 h-2.5 w-2.5" /> Cheapest
        </Badge>
      )}
    </div>
    <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
      <ExternalLink className="h-4 w-4" />
    </a>
  </div>
);

export default LivePricesPage;
