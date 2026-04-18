import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import { calculateAllPlatforms, findCheapest } from '@/lib/calculations';
import ComparisonCard from '@/components/ComparisonCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const CartPage = () => {
  const {
    cart,
    liveCart,
    language,
    removeFromCart,
    updateQuantity,
    clearCart,
    addLiveToCart,
    updateLiveQuantity,
    removeLiveFromCart,
    clearLiveCart,
  } = useAppStore();
  const isHi = language === 'hi';

  const summaries = useMemo(() => calculateAllPlatforms(cart), [cart]);
  const cheapest = useMemo(() => (cart.length > 0 ? findCheapest(summaries) : null), [summaries, cart]);
  const maxTotal = cart.length > 0 ? Math.max(...summaries.map((s) => s.finalTotal)) : 0;

  const liveTotal = liveCart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  if (cart.length === 0 && liveCart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center py-20">
          <span className="text-6xl">🛒</span>
          <h2 className="mt-4 text-xl font-bold">
            {isHi ? 'कार्ट खाली है' : 'Cart is Empty'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isHi ? 'सामान डालें और कीमतें कम्पेयर करें' : 'Add items and compare prices'}
          </p>
          <Link to="/search">
            <Button className="mt-4 gap-2 gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              {isHi ? 'सामान खोजें' : 'Search Items'}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="container flex-1 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isHi ? '🛒 कार्ट कम्पेयर' : '🛒 Cart Compare'}
          </h1>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {isHi ? 'खाली करें' : 'Clear'}
          </Button>
        </div>

        {/* Cart items */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-card">
          <h2 className="mb-3 text-sm font-bold text-muted-foreground">
            {isHi ? `${cart.length} सामान कार्ट में` : `${cart.length} items in cart`}
          </h2>
          <div className="space-y-3">
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return (
                <div key={item.productId} className="flex items-center gap-3">
                  <span className="text-2xl">{product.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {isHi ? product.nameHi : product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{product.unit}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best savings banner */}
        {cheapest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-xl gradient-savings p-5 text-center text-savings-foreground"
          >
            <p className="text-xs font-medium opacity-80">
              {isHi ? '💡 सबसे सस्ता विकल्प' : '💡 Cheapest Option'}
            </p>
            <p className="mt-1 text-2xl font-extrabold">
              ₹{cheapest.finalTotal.toFixed(0)}
            </p>
            <p className="text-sm font-semibold">
              {isHi
                ? `${cheapest.platformId === 'dmart' ? 'DMart' : cheapest.platformId === 'blinkit' ? 'Blinkit' : cheapest.platformId === 'jiomart' ? 'JioMart' : 'Instamart'} पर`
                : `on ${cheapest.platformId === 'dmart' ? 'DMart' : cheapest.platformId === 'blinkit' ? 'Blinkit' : cheapest.platformId === 'jiomart' ? 'JioMart' : 'Instamart'}`
              }
            </p>
            {maxTotal > cheapest.finalTotal && (
              <p className="mt-2 text-sm">
                {isHi
                  ? `🎉 आप ₹${(maxTotal - cheapest.finalTotal).toFixed(0)} बचा सकते हैं!`
                  : `🎉 You save ₹${(maxTotal - cheapest.finalTotal).toFixed(0)}!`
                }
              </p>
            )}
          </motion.div>
        )}

        {/* Platform comparison */}
        <h2 className="mb-4 text-lg font-bold">
          {isHi ? '📊 प्लेटफ़ॉर्म तुलना' : '📊 Platform Comparison'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {summaries
            .sort((a, b) => a.finalTotal - b.finalTotal)
            .map((summary) => (
              <motion.div
                key={summary.platformId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ComparisonCard
                  summary={summary}
                  isCheapest={cheapest?.platformId === summary.platformId}
                  savingsVsMax={maxTotal - summary.finalTotal}
                />
              </motion.div>
            ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          {isHi
            ? '⚠️ कीमतें स्टॉक, पिनकोड, समय और ऑफर्स के अनुसार बदल सकती हैं।'
            : '⚠️ Prices may vary by stock, pincode, time, and offers.'
          }
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
