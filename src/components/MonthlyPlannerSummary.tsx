import { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap,
  CheckCircle,
  DollarSign,
  Calendar,
  Target,
  Lightbulb,
  ArrowRight,
  Save,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { products, platformPrices } from '@/data/mockData';
import { productPrices } from '@/data/productPrices';

interface MonthlyPlannerSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Array<{ productId: string; quantity: number }>;
  monthlyBudget?: number;
  isHi?: boolean;
}

interface CheaperAlternative {
  currentProduct: string;
  currentPrice: number;
  alternativeProduct: string;
  alternativePrice: number;
  savings: number;
  savingsPercent: number;
}

const MonthlyPlannerSummary = ({
  isOpen,
  onClose,
  cartItems,
  monthlyBudget = 5000,
  isHi = false,
}: MonthlyPlannerSummaryProps) => {
  const [showEmergencyMode, setShowEmergencyMode] = useState(false);
  const [emergencySaveTarget, setEmergencySaveTarget] = useState<number | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Calculate current month spend
  const currentMonthSpend = useMemo(() => {
    let total = 0;
    cartItems.forEach((item) => {
      const priceData = productPrices[item.productId as keyof typeof productPrices];
      if (priceData) {
        const cheapestPrice = Math.min(...Object.values(priceData.prices));
        total += cheapestPrice * item.quantity;
      }
    });
    return Math.round(total * 100) / 100;
  }, [cartItems]);

  // Simulate last month spending (70-90% of current or actual from localStorage)
  const lastMonthSpend = useMemo(() => {
    const saved = localStorage.getItem('last-month-spend');
    if (saved) return parseFloat(saved);
    return Math.round(currentMonthSpend * (0.75 + Math.random() * 0.15) * 100) / 100;
  }, [currentMonthSpend]);

  // Calculate comparisons
  const spendDifference = currentMonthSpend - lastMonthSpend;
  const percentageChange = lastMonthSpend > 0 ? (spendDifference / lastMonthSpend) * 100 : 0;
  const isSavingMoney = spendDifference < 0;

  // Budget status
  const budgetRemaining = monthlyBudget - currentMonthSpend;
  const budgetPercentage = (currentMonthSpend / monthlyBudget) * 100;
  const budgetStatus =
    budgetPercentage > 100 ? 'over' : budgetPercentage > 80 ? 'warning' : 'good';

  // Find cheaper alternatives
  const cheaperAlternatives = useMemo((): CheaperAlternative[] => {
    const alternatives: CheaperAlternative[] = [];

    cartItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const priceData = productPrices[item.productId as keyof typeof productPrices];

      if (product && priceData) {
        const currentPrice = Math.min(...Object.values(priceData.prices));

        // Find similar or cheaper alternatives
        Object.entries(productPrices).forEach(([altId, altData]) => {
          if (altId !== item.productId) {
            const altProduct = products.find((p) => p.id === altId);
            if (
              altProduct &&
              altProduct.category === product.category &&
              altProduct.id !== product.id
            ) {
              const altPrice = Math.min(...Object.values(altData.prices));
              if (altPrice < currentPrice) {
                const savings = (currentPrice - altPrice) * item.quantity;
                const savingsPercent = ((currentPrice - altPrice) / currentPrice) * 100;

                if (alternatives.length < 3 && savings > 10) {
                  alternatives.push({
                    currentProduct: isHi ? product.nameHi : product.name,
                    currentPrice,
                    alternativeProduct: isHi ? altProduct.nameHi : altProduct.name,
                    alternativePrice: altPrice,
                    savings: Math.round(savings * 100) / 100,
                    savingsPercent: Math.round(savingsPercent * 10) / 10,
                  });
                }
              }
            }
          }
        });
      }
    });

    return alternatives.sort((a, b) => b.savings - a.savings).slice(0, 3);
  }, [cartItems, isHi]);

  // Calculate emergency savings suggestions
  const emargencySuggestions = useMemo(() => {
    if (!emergencySaveTarget) return [];
    
    const sortedAlternatives = [...cheaperAlternatives].sort((a, b) => b.savings - a.savings);
    let totalSavings = 0;
    const suggestions = [];

    for (const alt of sortedAlternatives) {
      if (totalSavings >= emergencySaveTarget) break;
      totalSavings += alt.savings;
      suggestions.push(alt);
    }

    return suggestions;
  }, [emergencySaveTarget, cheaperAlternatives]);

  const totalEmergencySavings = emargencySuggestions.reduce((sum, alt) => sum + alt.savings, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden border-0 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Target className="h-7 w-7" />
                <h2 className="text-2xl font-bold">
                  {isHi ? '📊 मासिक बजट सारांश' : '📊 Monthly Budget Summary'}
                </h2>
              </div>
              <p className="mt-2 text-sm text-emerald-50">
                {isHi
                  ? 'आपकी खरीदारी की सूची का विश्लेषण और बचत के सुझाव'
                  : 'Analyze your shopping list and smart savings suggestions'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Main Metrics - 3 Column Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Current Spend */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">
                  {isHi ? 'मौजूदा खर्च' : 'Current Spend'}
                </span>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-900">₹{currentMonthSpend}</div>
              <div className="mt-2 text-xs text-blue-700">
                {isHi ? 'इस महीने की खरीदारी' : 'This month shopping'}
              </div>
            </div>

            {/* Last Month Comparison */}
            <div
              className={`rounded-xl p-5 border ${
                isSavingMoney
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-semibold ${
                    isSavingMoney ? 'text-green-900' : 'text-orange-900'
                  }`}
                >
                  {isHi ? 'तुलना' : 'Comparison'}
                </span>
                {isSavingMoney ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <div
                className={`text-3xl font-bold ${
                  isSavingMoney ? 'text-green-900' : 'text-orange-900'
                }`}
              >
                {isSavingMoney ? '-' : '+'}₹{Math.abs(spendDifference)}
              </div>
              <div
                className={`mt-2 text-xs ${isSavingMoney ? 'text-green-700' : 'text-orange-700'}`}
              >
                {percentageChange.toFixed(1)}% {isHi ? 'मई में' : 'vs last month'}
              </div>
            </div>

            {/* Budget Status */}
            <div
              className={`rounded-xl p-5 border ${
                budgetStatus === 'over'
                  ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                  : budgetStatus === 'warning'
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                    : 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-semibold ${
                    budgetStatus === 'over'
                      ? 'text-red-900'
                      : budgetStatus === 'warning'
                        ? 'text-yellow-900'
                        : 'text-teal-900'
                  }`}
                >
                  {isHi ? 'बजट स्थिति' : 'Budget Status'}
                </span>
                {budgetStatus === 'over' ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : budgetStatus === 'warning' ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                )}
              </div>
              <div
                className={`text-3xl font-bold ${
                  budgetStatus === 'over'
                    ? 'text-red-900'
                    : budgetStatus === 'warning'
                      ? 'text-yellow-900'
                      : 'text-teal-900'
                }`}
              >
                {budgetStatus === 'over' ? '-' : '+'}₹{Math.abs(budgetRemaining)}
              </div>
              <div
                className={`mt-2 text-xs ${
                  budgetStatus === 'over'
                    ? 'text-red-700'
                    : budgetStatus === 'warning'
                      ? 'text-yellow-700'
                      : 'text-teal-700'
                }`}
              >
                {budgetPercentage.toFixed(0)}% {isHi ? 'खर्च' : 'spent'}
              </div>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{isHi ? 'बजट उपयोग' : 'Budget Usage'}</span>
              <span>{budgetPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  budgetStatus === 'over'
                    ? 'bg-red-500'
                    : budgetStatus === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Spending Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-violet-600" />
                <h3 className="font-semibold text-violet-900">
                  {isHi ? 'साप्ताहिक लक्ष्य' : 'Weekly Target'}
                </h3>
              </div>
              <div className="text-2xl font-bold text-violet-900">
                ₹{Math.round(monthlyBudget / 4)}
              </div>
              <div className="mt-2 text-xs text-violet-700">
                {isHi ? 'सप्ताह में औसतन' : 'Average per week'}
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-pink-600" />
                <h3 className="font-semibold text-pink-900">
                  {isHi ? 'दैनिक लक्ष्य' : 'Daily Target'}
                </h3>
              </div>
              <div className="text-2xl font-bold text-pink-900">
                ₹{Math.round(monthlyBudget / 30)}
              </div>
              <div className="mt-2 text-xs text-pink-700">
                {isHi ? 'प्रति दिन औसतन' : 'Average per day'}
              </div>
            </Card>
          </div>

          {/* Cheaper Alternatives Section */}
          {cheaperAlternatives.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">
                  {isHi ? '💡 सस्ते विकल्प उपलब्ध' : '💡 Cheaper Alternatives Available'}
                </h3>
              </div>

              <div className="space-y-3">
                {cheaperAlternatives.map((alt, idx) => (
                  <Card
                    key={idx}
                    className="p-4 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-100 text-amber-800">
                            {isHi ? 'वर्तमान' : 'Current'}
                          </Badge>
                          <span className="font-medium text-gray-900">{alt.currentProduct}</span>
                          <span className="text-sm text-gray-600">₹{alt.currentPrice}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-2">
                          <ArrowRight className="h-4 w-4 text-emerald-600" />
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {isHi ? 'सुझाव' : 'Suggested'}
                          </Badge>
                          <span className="font-medium text-gray-900">
                            {alt.alternativeProduct}
                          </span>
                          <span className="text-sm text-emerald-600">₹{alt.alternativePrice}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">₹{alt.savings}</div>
                        <div className="text-xs text-emerald-600">{alt.savingsPercent}% off</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Save Mode */}
          <Card className="p-5 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Save className="h-5 w-5 text-rose-600" />
                <h3 className="font-semibold text-gray-900">
                  {isHi ? '🚨 आपातकालीन बचत मोड' : '🚨 Emergency Save Mode'}
                </h3>
              </div>
              <Button
                onClick={() => setShowEmergencyMode(!showEmergencyMode)}
                size="sm"
                className={`${
                  showEmergencyMode
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-rose-200 hover:bg-rose-300 text-rose-900'
                }`}
              >
                {showEmergencyMode ? (isHi ? 'सक्रिय' : 'Active') : isHi ? 'सक्षम करें' : 'Enable'}
              </Button>
            </div>

            {showEmergencyMode && (
              <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                <p className="text-sm text-gray-700">
                  {isHi
                    ? 'कितनी बचत करना चाहते हैं? हम सुझाव देंगे कि कैसे करें।'
                    : 'How much do you want to save? We\'ll suggest alternatives.'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max={Math.max(...cheaperAlternatives.map((a) => a.savings))}
                    placeholder={isHi ? 'बचत राशि दर्ज करें' : 'Enter amount to save (₹)'}
                    className="flex-1 px-4 py-2 rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    value={emergencySaveTarget || ''}
                    onChange={(e) =>
                      setEmergencySaveTarget(e.target.value ? parseInt(e.target.value) : null)
                    }
                  />
                  <Button
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    {isHi ? 'सुझाव देखें' : 'Get Tips'}
                  </Button>
                </div>

                {showAlternatives && emergencySaveTarget && (
                  <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                    <div className="rounded-lg bg-white p-3">
                      <div className="text-sm font-semibold text-gray-900 mb-2">
                        {isHi ? 'सुझाए गए परिवर्तन:' : 'Suggested Changes:'}
                      </div>
                      <div className="space-y-2">
                        {emargencySuggestions.length === 0 ? (
                          <p className="text-xs text-gray-600">
                            {isHi ? 'इस लक्ष्य तक पहुंचने के लिए पर्याप्त विकल्प नहीं' : 'Not enough alternatives to reach this target'}
                          </p>
                        ) : (
                          emargencySuggestions.map((alt, idx) => (
                            <div key={idx} className="flex justify-between text-xs border-b pb-2">
                              <span className="text-gray-700">
                                {alt.currentProduct} → {alt.alternativeProduct}
                              </span>
                              <span className="font-bold text-emerald-600">+₹{alt.savings}</span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between font-bold">
                          <span>{isHi ? 'कुल बचत:' : 'Total Savings:'}</span>
                          <span className="text-emerald-600">₹{totalEmergencySavings}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Key Insights */}
          <Card className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-600" />
              {isHi ? '📈 प्रमुख अंतर्दृष्टि' : '📈 Key Insights'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {isSavingMoney ? (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {isHi
                      ? `बढ़िया! पिछले महीने की तुलना में ₹${Math.abs(spendDifference)} कम खर्च`
                      : `Great! You're saving ₹${Math.abs(spendDifference)} compared to last month`}
                  </span>
                </li>
              ) : (
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {isHi
                      ? `पिछले महीने की तुलना में खर्च ₹${spendDifference} अधिक है`
                      : `Spending increased by ₹${spendDifference} vs last month`}
                  </span>
                </li>
              )}

              {budgetStatus === 'good' && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {isHi
                      ? 'आप बजट में अच्छी स्थिति में हैं'
                      : 'You\'re within your budget - great job!'}
                  </span>
                </li>
              )}

              {budgetStatus === 'warning' && (
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {isHi
                      ? 'आप अपने बजट के करीब पहुंच रहे हैं'
                      : 'You\'re approaching your budget limit'}
                  </span>
                </li>
              )}

              {budgetStatus === 'over' && (
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {isHi
                      ? `आप बजट से ₹${Math.abs(budgetRemaining)} अधिक हैं`
                      : `You've exceeded your budget by ₹${Math.abs(budgetRemaining)}`}
                  </span>
                </li>
              )}

              {cheaperAlternatives.length > 0 && (
                <li className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>
                    {isHi
                      ? `सस्ते विकल्प से ₹${cheaperAlternatives.reduce((sum, alt) => sum + alt.savings, 0)} तक बचाएं`
                      : `Potential to save ₹${cheaperAlternatives.reduce((sum, alt) => sum + alt.savings, 0)} with alternatives`}
                  </span>
                </li>
              )}
            </ul>
          </Card>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-white p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {isHi ? 'बंद करें' : 'Close'}
          </Button>
          <Button className="gradient-primary text-white" onClick={onClose}>
            {isHi ? 'खरीदारी जारी रखें' : 'Continue Shopping'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyPlannerSummary;
