import { useState } from 'react';
import { X, TrendingDown, Zap, Calendar, AlertCircle, Target, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateAIPredictions, AIPricePrediction } from '@/lib/smartSuggestions';

interface SmartSuggestionsPopupProps {
  productIds: string[];
  isOpen: boolean;
  onClose: () => void;
  isHi?: boolean;
}

interface GroupedPrediction {
  productName: string;
  predictions: AIPricePrediction[];
  maxSavings: AIPricePrediction;
}

const SmartSuggestionsPopup = ({ productIds, isOpen, onClose, isHi = false }: SmartSuggestionsPopupProps) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'best'>('all');

  if (!isOpen || productIds.length === 0) return null;

  const predictions = generateAIPredictions(productIds);
  
  // Group predictions by product
  const grouped: Record<string, GroupedPrediction> = {};
  predictions.forEach((pred) => {
    if (!grouped[pred.productName]) {
      grouped[pred.productName] = {
        productName: pred.productName,
        predictions: [],
        maxSavings: pred,
      };
    }
    grouped[pred.productName].predictions.push(pred);
    if (pred.estimatedSavings > grouped[pred.productName].maxSavings.estimatedSavings) {
      grouped[pred.productName].maxSavings = pred;
    }
  });

  // Filter predictions
  let filteredGroups = Object.values(grouped);
  if (selectedFilter === 'high') {
    filteredGroups = filteredGroups.filter((g) =>
      g.predictions.some((p) => p.confidence === 'high')
    );
  } else if (selectedFilter === 'best') {
    filteredGroups = filteredGroups.map((g) => ({
      ...g,
      predictions: [g.maxSavings],
    }));
  }

  const totalPotentialSavings = predictions.reduce((sum, p) => sum + p.estimatedSavings, 0);
  const highConfidenceCount = predictions.filter((p) => p.confidence === 'high').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6" />
                <h2 className="text-2xl font-bold">
                  {isHi ? 'स्मार्ट खरीदारी सुझाव' : 'Smart Shopping Assistant'}
                </h2>
              </div>
              <p className="mt-2 text-sm text-purple-100">
                {isHi ? 'AI द्वारा आपके चयनित उत्पादों के लिए सर्वोत्तम समय और प्लेटफॉर्म खोजें'
                  : 'AI-powered predictions for your selected products'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white/20 p-3">
              <div className="text-xs text-purple-100">
                {isHi ? 'कुल बचत' : 'Total Savings'}
              </div>
              <div className="text-xl font-bold">₹{Math.round(totalPotentialSavings)}</div>
            </div>
            <div className="rounded-lg bg-white/20 p-3">
              <div className="text-xs text-purple-100">
                {isHi ? 'उच्च विश्वास' : 'High Confidence'}
              </div>
              <div className="text-xl font-bold">{highConfidenceCount}</div>
            </div>
            <div className="rounded-lg bg-white/20 p-3">
              <div className="text-xs text-purple-100">
                {isHi ? 'उत्पाद' : 'Products'}
              </div>
              <div className="text-xl font-bold">{productIds.length}</div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="sticky top-24 border-b bg-white p-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedFilter('all')}
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              {isHi ? 'सभी' : 'All'} ({predictions.length})
            </Button>
            <Button
              onClick={() => setSelectedFilter('high')}
              variant={selectedFilter === 'high' ? 'default' : 'outline'}
              size="sm"
            >
              {isHi ? 'उच्च विश्वास' : 'High Confidence'} ({highConfidenceCount})
            </Button>
            <Button
              onClick={() => setSelectedFilter('best')}
              variant={selectedFilter === 'best' ? 'default' : 'outline'}
              size="sm"
            >
              {isHi ? 'सर्वश्रेष्ठ डील' : 'Best Deals'} ({filteredGroups.length})
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">
                {isHi ? 'कोई सुझाव नहीं' : 'No recommendations available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <div key={group.productName}>
                  <h3 className="mb-3 font-semibold text-gray-800">{group.productName}</h3>
                  <div className="space-y-2">
                    {group.predictions.map((pred, idx) => (
                      <div
                        key={`${pred.productName}-${pred.platform}-${idx}`}
                        className={`rounded-lg border p-4 transition ${
                          pred.confidence === 'high'
                            ? 'border-green-200 bg-green-50'
                            : pred.confidence === 'medium'
                              ? 'border-yellow-200 bg-yellow-50'
                              : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          {/* Top Row - Platform and Savings */}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{pred.platform}</Badge>
                                <Badge
                                  className={
                                    pred.confidence === 'high'
                                      ? 'bg-green-600'
                                      : pred.confidence === 'medium'
                                        ? 'bg-yellow-600'
                                        : 'bg-gray-600'
                                  }
                                >
                                  {pred.confidence === 'high'
                                    ? isHi ? 'उच्च' : 'High'
                                    : pred.confidence === 'medium'
                                      ? isHi ? 'मध्यम' : 'Medium'
                                      : isHi ? 'कम' : 'Low'}
                                </Badge>
                              </div>
                            </div>
                            {pred.estimatedSavings > 0 && (
                              <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                                <TrendingDown className="h-5 w-5" />
                                ₹{pred.estimatedSavings}
                              </div>
                            )}
                          </div>

                          {/* Price Row */}
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-gray-500">{isHi ? 'मौजूदा' : 'Now'}: </span>
                              <span className="font-semibold">₹{pred.currentPrice}</span>
                            </div>
                            <div className="text-gray-400">→</div>
                            <div>
                              {pred.estimatedSavings > 0 ? (
                                <>
                                  <span className="text-gray-500">{isHi ? 'भविष्य' : 'Future'}: </span>
                                  <span className="font-semibold text-green-600">
                                    ₹{pred.predictedPrice}
                                  </span>
                                  <span className="ml-2 text-green-600">
                                    (-{pred.savingsPercentage}%)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-500">{isHi ? 'चेतावनी' : 'Rising'}: </span>
                                  <span className="font-semibold text-orange-600">
                                    ₹{pred.predictedPrice}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Details Row */}
                          <div className="flex flex-wrap gap-3 pt-2 text-xs">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {isHi ? 'सर्वश्रेष्ठ दिन' : 'Best Day'}: <span className="font-semibold">{pred.bestDayToBuy}</span>
                            </div>
                            {pred.daysToWait > 0 && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-4 w-4" />
                                {isHi ? 'प्रतीक्षा करें' : 'Wait'}: <span className="font-semibold">{pred.daysToWait} {isHi ? 'दिन' : 'days'}</span>
                              </div>
                            )}
                          </div>

                          {/* Reason */}
                          <div className="flex items-start gap-2 rounded bg-gray-50 p-2 pt-2">
                            <Target className="h-4 w-4 flex-shrink-0 text-purple-600 mt-0.5" />
                            <p className="text-xs text-gray-700">{pred.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-white p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-xs text-gray-600">
                {isHi
                  ? '💡 टिप्पणी: ये भविष्यवाणियां AI विश्लेषण पर आधारित हैं'
                  : '💡 Note: Predictions based on AI analysis & market patterns'}
              </p>
            </div>
            <Button onClick={onClose} className="gradient-primary">
              {isHi ? 'समझ गया' : 'Got it'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SmartSuggestionsPopup;
