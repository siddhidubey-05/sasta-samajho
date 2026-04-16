import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { platformPrices } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { cart, addToCart, updateQuantity, removeFromCart, language } = useAppStore();
  const isHi = language === 'hi';
  const cartItem = cart.find((i) => i.productId === product.id);

  const prices = platformPrices.filter((pp) => pp.productId === product.id && pp.available);
  const minPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.basePrice - p.discount)) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices.map((p) => p.basePrice - p.discount)) : 0;

  return (
    <div className="group rounded-lg border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-4xl">{product.image}</span>
        {minPrice < maxPrice && (
          <span className="rounded-full bg-savings/10 px-2 py-0.5 text-[10px] font-semibold text-savings">
            {isHi ? `₹${maxPrice - minPrice} बचत` : `Save ₹${maxPrice - minPrice}`}
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold leading-tight">
        {isHi ? product.nameHi : product.name}
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{product.unit}</p>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-foreground">₹{minPrice}</span>
        {minPrice < maxPrice && (
          <span className="text-xs text-muted-foreground line-through">₹{maxPrice}</span>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {isHi ? `${prices.length} प्लेटफ़ॉर्म पर उपलब्ध` : `Available on ${prices.length} platforms`}
      </p>

      <div className="mt-3">
        {cartItem ? (
          <div className="flex items-center justify-between rounded-md border border-primary bg-primary/5 px-2 py-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-semibold">{cartItem.quantity}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addToCart(product.id)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => addToCart(product.id)}
            className="w-full gap-1.5 gradient-primary text-primary-foreground"
            size="sm"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isHi ? 'कार्ट में डालें' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
