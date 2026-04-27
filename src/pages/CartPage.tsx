import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import { calculateAllPlatforms, findCheapest } from '@/lib/calculations';
import ComparisonCard from '@/components/ComparisonCard';
import SmartSuggestionsCard from '@/components/SmartSuggestionsCard';
import CartPlatformComparison from '@/components/CartPlatformComparison';
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

  const liveSubtotal = liveCart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const liveGstPercent = 5;
  const liveGst = (liveSubtotal * liveGstPercent) / 100;
  const liveDiscountPercent = 5;
  const liveDiscount = (liveSubtotal * liveDiscountPercent) / 100;
  const liveDeliveryFee = liveSubtotal > 0 && liveSubtotal < 199 ? 25 : 0;
  const livePlatformFee = liveSubtotal > 0 ? 5 : 0;
  const liveHandlingFee = liveSubtotal > 0 ? 4 : 0;
  const liveFinalTotal = Math.max(
    0,
    liveSubtotal + liveGst + liveDeliveryFee + livePlatformFee + liveHandlingFee - liveDiscount
  );
  const liveTotal = liveSubtotal;

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearCart();
              clearLiveCart();
            }}
            className="text-destructive"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {isHi ? 'खाली करें' : 'Clear'}
          </Button>
        </div>

        {/* Smart Suggestions Section */}
        {(cart.length > 0 || liveCart.length > 0) && (
          <div className="mb-8">
            <SmartSuggestionsCard cart={cart} isHi={isHi} />
          </div>
        )}

        {/* Platform & Kirana Comparison Section */}
        {cart.length > 0 && (
          <div className="mb-8">
            <CartPlatformComparison cart={cart} isHi={isHi} />
          </div>
        )}

        {/* Live cart items (from SerpAPI search) */}
        {liveCart.length > 0 && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-card p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-muted-foreground">
                {isHi
                  ? `${liveCart.length} लाइव सामान`
                  : `${liveCart.length} live items`}
              </h2>
              <span className="text-sm font-bold text-primary">
                ₹{liveTotal.toFixed(0)}
              </span>
            </div>
            <div className="space-y-3">
              {liveCart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-10 w-10 rounded object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl">🛒</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.product.priceFormatted || `₹${item.product.price}`} · {item.product.source}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateLiveQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => addLiveToCart(item.product)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <a href={item.product.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeLiveFromCart(item.productId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live cart price breakdown */}
        {liveCart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-border bg-card p-4 shadow-card"
          >
            <h2 className="mb-3 text-sm font-bold text-muted-foreground">
              {isHi ? '💰 बिल विवरण' : '💰 Bill Details'}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isHi ? 'कुल कीमत (Subtotal)' : 'Items Subtotal'}
                </span>
                <span className="font-medium">₹{liveSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isHi ? `GST (${liveGstPercent}%)` : `GST (${liveGstPercent}%)`}
                </span>
                <span className="font-medium">+ ₹{liveGst.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isHi ? 'डिलीवरी फीस' : 'Delivery Fee'}
                </span>
                <span className="font-medium">
                  {liveDeliveryFee === 0 ? (
                    <span className="text-savings">{isHi ? 'मुफ्त' : 'FREE'}</span>
                  ) : (
                    `+ ₹${liveDeliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isHi ? 'प्लेटफ़ॉर्म फीस' : 'Platform Fee'}
                </span>
                <span className="font-medium">+ ₹{livePlatformFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isHi ? 'हैंडलिंग फीस' : 'Handling Fee'}
                </span>
                <span className="font-medium">+ ₹{liveHandlingFee.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isHi ? `डिस्काउंट (${liveDiscountPercent}%)` : `Discount (${liveDiscountPercent}%)`}
                </span>
                <span className="font-medium text-savings">- ₹{liveDiscount.toFixed(2)}</span>
              </div>
              <div className="my-2 border-t border-border" />
              <div className="flex items-center justify-between text-base">
                <span className="font-bold">
                  {isHi ? 'कुल भुगतान' : 'Grand Total'}
                </span>
                <span className="text-lg font-extrabold text-primary">
                  ₹{liveFinalTotal.toFixed(2)}
                </span>
              </div>
              {liveDiscount > 0 && (
                <p className="text-center text-xs text-savings">
                  {isHi
                    ? `🎉 आपने ₹${liveDiscount.toFixed(2)} बचाए!`
                    : `🎉 You saved ₹${liveDiscount.toFixed(2)}!`}
                </p>
              )}
            </div>
          </motion.div>
        )}
        {cart.length > 0 && (
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
        )}

        {/* Best savings banner — only for mock items */}
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

        {/* Platform comparison — only for mock items */}
        {cart.length > 0 && (
          <>
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
          </>
        )}

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
