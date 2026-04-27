import React, { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { productPrices } from "@/data/productPrices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MonthlyPlannerSummary from "@/components/MonthlyPlannerSummary";
import { TrendingUp, Calendar, Target, CheckCircle, Sparkles } from "lucide-react";

const BudgetPlanner: React.FC = () => {
  const { cart, language } = useAppStore();
  const isHi = language === 'hi';

  const [formData, setFormData] = useState({
    monthlyBudget: "",
    startDate: "",
    endDate: ""
  });
  const [showSummary, setShowSummary] = useState(false);
  const [planCreated, setPlanCreated] = useState(false);

  const calculateTargets = () => {
    const budget = parseFloat(formData.monthlyBudget);
    if (!budget || isNaN(budget)) return { weekly: 0, daily: 0 };
    return {
      weekly: Math.round(budget / 4),
      daily: Math.round(budget / 30)
    };
  };

  // Calculate current cart spend
  const currentCartSpend = useMemo(() => {
    let total = 0;
    cart.forEach((item) => {
      const priceData = productPrices[item.productId as keyof typeof productPrices];
      if (priceData) {
        const cheapestPrice = Math.min(...Object.values(priceData.prices));
        total += cheapestPrice * item.quantity;
      }
    });
    return Math.round(total * 100) / 100;
  }, [cart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(formData.monthlyBudget);
    
    // Save to localStorage
    localStorage.setItem('current-month-budget', budget.toString());
    localStorage.setItem('current-month-start', formData.startDate);
    localStorage.setItem('current-month-end', formData.endDate);
    
    setPlanCreated(true);
    
    // Show summary after a brief delay
    setTimeout(() => {
      setShowSummary(true);
    }, 300);
  };

  const targets = calculateTargets();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex-1 min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {isHi ? '💰 स्मार्ट बजट योजनाकार' : '💰 Smart Budget Planner'}
              </h1>
              <Sparkles className="h-8 w-8 text-teal-600" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {isHi
                ? 'अपना मासिक बजट बनाएं और स्वचालित लक्ष्य प्राप्त करें'
                : 'Plan your monthly grocery budget and get automatic smart targets!'}
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Success State */}
            {planCreated && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">
                    {isHi ? '✅ बजट योजना सफलतापूर्वक बनाई गई!' : '✅ Budget Plan Created Successfully!'}
                  </h2>
                </div>
                <p className="text-emerald-100">
                  {isHi
                    ? 'आपकी व्यापक बजट विश्लेषण तैयार है। विस्तृत सारांश देखने के लिए नीचे क्लिक करें।'
                    : 'Your comprehensive budget analysis is ready. Click below to view detailed summary.'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
              {/* Monthly Budget Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  {isHi ? '💵 मासिक किराना बजट' : '💵 Monthly Grocery Budget'}
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    className="w-full pl-12 pr-5 py-5 text-3xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 hover:shadow-lg hover:border-emerald-200"
                    placeholder={isHi ? "बजट दर्ज करें (जैसे 5000)" : "Enter budget (e.g. 5000)"}
                    value={formData.monthlyBudget}
                    onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                    required
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-teal-600" />
                    {isHi ? '📅 प्रारंभ तिथि' : '📅 Start Date'}
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-transparent transition-all hover:shadow-md"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-cyan-600" />
                    {isHi ? '📅 समाप्ति तिथि' : '📅 End Date'}
                  </label>
                  <input
                    type="date"
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500 focus:border-transparent transition-all hover:shadow-md"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Live Targets Preview */}
              {formData.monthlyBudget && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl border-2 border-emerald-200 animate-in slide-in-from-bottom-4 duration-300">
                  <Card className="p-4 bg-white/60 backdrop-blur border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <div className="text-xs font-semibold text-gray-600 uppercase">
                        {isHi ? 'साप्ताहिक लक्ष्य' : 'Weekly'}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">₹{targets.weekly}</div>
                  </Card>
                  <Card className="p-4 bg-white/60 backdrop-blur border border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-teal-600" />
                      <div className="text-xs font-semibold text-gray-600 uppercase">
                        {isHi ? 'दैनिक लक्ष्य' : 'Daily'}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-teal-600">₹{targets.daily}</div>
                  </Card>
                  <Card className="p-4 bg-white/60 backdrop-blur border border-cyan-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-cyan-600" />
                      <div className="text-xs font-semibold text-gray-600 uppercase">
                        {isHi ? 'अवधि' : 'Period'}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-cyan-600">30 {isHi ? 'दिन' : 'Days'}</div>
                  </Card>
                </div>
              )}

              {/* Current Cart Info */}
              {cart.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                  <p className="text-sm text-blue-900">
                    <strong>{isHi ? '📊 मौजूदा कार्ट:' : '📊 Current Cart:'}</strong> {cart.length} {isHi ? 'सामान' : 'items'} • <strong>₹{currentCartSpend}</strong>
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-6 px-8 rounded-2xl text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  {isHi ? '✅ बजट योजना बनाएं' : '✅ Create Budget Plan'} & {isHi ? 'सारांश देखें' : 'View Summary'}
                </Button>
                
                {planCreated && (
                  <Button
                    type="button"
                    onClick={() => setShowSummary(true)}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-5 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-2"
                  >
                    {isHi ? '📊 विस्तृत सारांश देखें' : '📊 View Detailed Summary'}
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Info Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white/60 backdrop-blur border border-emerald-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {isHi ? 'स्वचालित विश्लेषण' : 'Smart Analysis'}
              </h3>
              <p className="text-sm text-gray-600">
                {isHi
                  ? 'आपकी खरीदारी का विस्तृत विश्लेषण प्राप्त करें'
                  : 'Get detailed analysis of your shopping'}
              </p>
            </Card>

            <Card className="p-6 bg-white/60 backdrop-blur border border-teal-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {isHi ? 'बचत सुझाव' : 'Savings Tips'}
              </h3>
              <p className="text-sm text-gray-600">
                {isHi
                  ? 'सस्ते विकल्प और बचत के उपाय खोजें'
                  : 'Find cheaper alternatives to save more'}
              </p>
            </Card>

            <Card className="p-6 bg-white/60 backdrop-blur border border-cyan-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {isHi ? 'मासिक तुलना' : 'Month Comparison'}
              </h3>
              <p className="text-sm text-gray-600">
                {isHi
                  ? 'पिछले महीने से तुलना करें'
                  : 'Compare with previous month'}
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Monthly Planner Summary Modal */}
      <MonthlyPlannerSummary
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        cartItems={cart}
        monthlyBudget={parseFloat(formData.monthlyBudget) || 5000}
        isHi={isHi}
      />
    </div>
  );
};

export default BudgetPlanner;