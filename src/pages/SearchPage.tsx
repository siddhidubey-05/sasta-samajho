import { useState } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LiveProductCard from '@/components/LiveProductCard';
import { Input } from '@/components/ui/input';
import { useLiveProducts } from '@/hooks/useLiveProducts';

const CATEGORIES: { en: string; hi: string; query: string }[] = [
  { en: 'Dairy', hi: 'डेयरी', query: 'dairy milk paneer curd' },
  { en: 'Staples', hi: 'अनाज', query: 'atta rice dal oil' },
  { en: 'Snacks', hi: 'स्नैक्स', query: 'snacks chips biscuits namkeen' },
  { en: 'Beverages', hi: 'पेय', query: 'tea coffee juice cold drink' },
  { en: 'Personal Care', hi: 'पर्सनल केयर', query: 'soap shampoo toothpaste' },
  { en: 'Household', hi: 'घरेलू', query: 'detergent floor cleaner dishwash' },
  { en: 'Fruits', hi: 'फल', query: 'fresh fruits apple banana' },
  { en: 'Vegetables', hi: 'सब्ज़ी', query: 'fresh vegetables onion potato tomato' },
];

const SearchPage = () => {
  const { language } = useAppStore();
  const isHi = language === 'hi';
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0].en);

  const activeCategory = CATEGORIES.find((c) => c.en === selectedCategory);
  const effectiveQuery = query.trim();
  const effectiveCategory = effectiveQuery.length >= 2 ? '' : activeCategory?.query || '';

  const { data, isLoading, isError, error } = useLiveProducts({
    query: effectiveQuery,
    category: effectiveCategory,
    limit: 16,
  });

  const products = data?.products || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-6">
        <h1 className="mb-1 text-2xl font-bold">
          {isHi ? '🔍 लाइव सामान खोजें' : '🔍 Live Product Search'}
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          {isHi
            ? 'SerpAPI से रीयल-टाइम भारतीय किराने के उत्पाद'
            : 'Real-time Indian grocery products powered by SerpAPI'}
        </p>

        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={isHi ? 'दूध, आटा, चावल, तेल...' : 'Milk, atta, rice, oil...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.en}
              onClick={() => {
                setSelectedCategory(cat.en);
                setQuery('');
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat.en && !effectiveQuery
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isHi ? cat.hi : cat.en}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg border border-border bg-muted/40"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-semibold text-destructive">
              {isHi ? 'उत्पाद लोड नहीं हो सके' : 'Could not load products'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="py-20 text-center">
            <span className="text-5xl">🔍</span>
            <p className="mt-4 text-lg font-semibold text-muted-foreground">
              {isHi ? 'कोई सामान नहीं मिला' : 'No items found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isHi ? 'कुछ और खोजें' : 'Try a different search'}
            </p>
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              {isHi
                ? `${products.length} लाइव उत्पाद मिले`
                : `Found ${products.length} live products`}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <LiveProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
