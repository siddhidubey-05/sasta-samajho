import { useState, useMemo } from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';

const SearchPage = () => {
  const { language } = useAppStore();
  const isHi = language === 'hi';
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return cats;
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = query === '' ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.nameHi.includes(query) ||
        p.category.toLowerCase().includes(query.toLowerCase());
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesQuery && matchesCat;
    });
  }, [query, selectedCategory]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-6">
        <h1 className="mb-4 text-2xl font-bold">
          {isHi ? '🔍 सामान खोजें' : '🔍 Search Items'}
        </h1>

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
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'gradient-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {isHi ? 'सभी' : 'All'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {isHi ? products.find((p) => p.category === cat)?.categoryHi || cat : cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-5xl">🔍</span>
            <p className="mt-4 text-lg font-semibold text-muted-foreground">
              {isHi ? 'कोई सामान नहीं मिला' : 'No items found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isHi ? 'कुछ और खोजें' : 'Try a different search'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;
