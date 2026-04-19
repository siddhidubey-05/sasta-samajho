import React, { useState } from "react";

const BudgetPlanner: React.FC = () => {
  const [formData, setFormData] = useState({
    monthlyBudget: "",
    startDate: "",
    endDate: ""
  });

  const calculateTargets = () => {
    const budget = parseFloat(formData.monthlyBudget);
    if (!budget || isNaN(budget)) return { weekly: 0, daily: 0 };
    return {
      weekly: Math.round(budget / 4),
      daily: Math.round(budget / 30)
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targets = calculateTargets();
    alert(`
🎉 BUDGET PLAN CREATED SUCCESSFULLY!

💰 Monthly Budget: ₹${parseFloat(formData.monthlyBudget).toLocaleString()}
📅 From: ${formData.startDate}
📅 To: ${formData.endDate}

📊 AUTOMATIC TARGETS:
✅ Weekly Target: ₹${targets.weekly}
✅ Daily Target: ₹${targets.daily}

⭐ Start saving on groceries!
    `);
    // Reset form
    setFormData({ monthlyBudget: "", startDate: "", endDate: "" });
  };

  const targets = calculateTargets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            💰 Smart Budget Planner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plan your monthly grocery budget and get automatic weekly/daily targets!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Monthly Budget */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                💵 Monthly Grocery Budget
              </label>
              <input
                type="number"
                className="w-full p-5 text-2xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all duration-300 hover:shadow-lg"
                placeholder="Enter budget (e.g. 5000)"
                value={formData.monthlyBudget}
                onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                required
                min="0"
                step="100"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📅 Start Date
                </label>
                <input
                  type="date"
                  className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📅 End Date
                </label>
                <input
                  type="date"
                  className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Live Targets */}
            {formData.monthlyBudget && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">₹{targets.weekly}</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Weekly Target</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">₹{targets.daily}</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Daily Target</div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-xl font-bold text-gray-800 mb-1">30 Days</div>
                  <div className="text-sm text-gray-500">Tracking Period</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 px-8 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
            >
              🚀 Create My Budget Plan & Start Saving!
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;