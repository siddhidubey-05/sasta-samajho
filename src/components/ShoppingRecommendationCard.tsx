import { ShoppingRecommendation, getShoppingRecommendation } from '@/lib/smartSuggestions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, Zap, Clock } from 'lucide-react';

interface ShoppingRecommendationCardProps {
  productId: string;
  productName: string;
  platformPrices: Record<string, number>;
  quantity?: number;
  isHi?: boolean;
}

const ShoppingRecommendationCard = ({
  productId,
  productName,
  platformPrices,
  quantity = 1,
  isHi = false,
}: ShoppingRecommendationCardProps) => {
  const recommendation = getShoppingRecommendation(productId, platformPrices);

  if (!recommendation) {
    return null;
  }

  const totalSavings = recommendation.savings * quantity;

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-sm">{productName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
              💚 {recommendation.recommendedPlatform}
            </Badge>
            {recommendation.shouldWait && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
                <Clock className="h-3 w-3 mr-1" />
                {isHi ? `${recommendation.waitDays} दिन` : `${recommendation.waitDays} days`}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">₹{recommendation.price}</div>
          <div className="text-xs text-muted-foreground">per unit</div>
        </div>
      </div>

      <div className="space-y-2">
        {totalSavings > 0 && (
          <div className="flex items-center gap-2 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 p-2 rounded">
            <TrendingDown className="h-4 w-4" />
            <span>
              {isHi ? 'बचत:' : 'Save'}: ₹{totalSavings.toFixed(0)} ({quantity > 1 ? `${quantity}x` : ''})
            </span>
          </div>
        )}

        {recommendation.shouldWait && (
          <div className="flex items-start gap-2 text-sm bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 p-2 rounded">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">{isHi ? 'कीमत कम होने वाली है' : 'Price Drop Expected'}</div>
              <div className="text-xs mt-1">{recommendation.reason}</div>
              {recommendation.waitDays && (
                <div className="text-xs mt-1">
                  {isHi ? 'अपेक्षित:' : 'Expected in'} ~{recommendation.waitDays}{isHi ? ' दिन' : ' days'}
                </div>
              )}
            </div>
          </div>
        )}

        {!recommendation.shouldWait && (
          <div className="flex items-start gap-2 text-sm bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 p-2 rounded">
            <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">{isHi ? 'अभी खरीदें' : 'Buy Now'}</div>
              <div className="text-xs mt-1">{recommendation.reason}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
        <div className="text-xs text-muted-foreground">
          {isHi ? 'सुझाव:' : 'Recommendation:'} {recommendation.recommendedPlatform} पर {isHi ? 'खरीदें' : 'is best'} - ₹{(recommendation.price * quantity).toFixed(0)}{isHi ? ' कुल' : ' total'}
        </div>
      </div>
    </Card>
  );
};

export default ShoppingRecommendationCard;
