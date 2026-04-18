import { ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LiveProduct } from '@/hooks/useLiveProducts';
import { useState } from 'react';

interface Props {
  product: LiveProduct;
}

const LiveProductCard = ({ product }: Props) => {
  const [imgError, setImgError] = useState(false);

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
            <Star className="h-3 w-3 fill-current text-yellow-500" />
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

      <div className="mt-auto pt-3">
        <Button
          asChild
          size="sm"
          className="w-full gap-1.5 gradient-primary text-primary-foreground"
        >
          <a href={product.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            View Deal
          </a>
        </Button>
      </div>
    </div>
  );
};

export default LiveProductCard;
