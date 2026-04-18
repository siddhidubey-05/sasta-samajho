import { ExternalLink, Star, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LiveProduct } from '@/hooks/useLiveProducts';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

interface Props {
  product: LiveProduct;
}

const LiveProductCard = ({ product }: Props) => {
  const [imgError, setImgError] = useState(false);
  const { liveCart, addLiveToCart, updateLiveQuantity, removeLiveFromCart, language } = useAppStore();
  const isHi = language === 'hi';
  const cartItem = liveCart.find((i) => i.productId === product.id);

  const handleAdd = () => {
    addLiveToCart(product);
    toast.success(isHi ? 'कार्ट में जोड़ा गया' : 'Added to cart');
  };

  const handleRemove = () => {
    removeLiveFromCart(product.id);
    toast.success(isHi ? 'कार्ट से हटाया गया' : 'Removed from cart');
  };

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card p-4 shadow-card transition-all hover:shadow-card-hover">
      <div className="mb-3 flex items-start justify-between gap-2">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-20 w-20 rounded-lg object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="text-4xl">🛒</span>
        )}
        {product.rating && (
          <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">
            <Star className="h-3 w-3 fill-current text-savings" />
            {product.rating}
          </span>
        )}
      </div>

      <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{product.name}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{product.unit}</p>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-foreground">
          {product.priceFormatted || `₹${product.price}`}
        </span>
      </div>
      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">on {product.source}</p>

      <div className="mt-auto space-y-2 pt-3">
        {cartItem ? (
          <div className="flex items-center justify-between rounded-md border border-primary bg-primary/5 px-2 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateLiveQuantity(product.id, cartItem.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm font-semibold">{cartItem.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => addLiveToCart(product)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={handleRemove}
              aria-label="Remove from cart"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAdd}
            size="sm"
            className="w-full gap-1.5 gradient-primary text-primary-foreground"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isHi ? 'कार्ट में डालें' : 'Add to Cart'}
          </Button>
        )}

        <Button
          asChild
          size="sm"
          variant="outline"
          className="w-full gap-1.5"
        >
          <a href={product.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            {isHi ? 'डील देखें' : 'View Deal'}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default LiveProductCard;
