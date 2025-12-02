import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Lightbulb, PieChart, DollarSign, Activity } from 'lucide-react';

const ExpenseTrackerDashboard = () => {
  const [activeTab, setActiveTab] = useState('tips');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // API Base URL
  const API_BASE = 'http://localhost:8080/api/ai';

  // Sample data for testing
  const sampleExpenses = [
    { category: "Food", amount: 12000 },
    { category: "Transport", amount: 5000 },
    { category: "Shopping", amount: 8000 },
    { category: "Bills", amount: 10000 }
  ];

  const callAPI = async (endpoint, data) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const renderExpenseTips = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          Expense Tips AI
        </h2>
        <p className="text-purple-100">Get personalized tips based on your spending</p>
      </div>
      
      <button
        onClick={() => callAPI('/expense-tips', sampleExpenses)}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        Analyze My Spending
      </button>

      {result && !result.error && (
        <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-purple-900">💡 Smart Tips</h3>
          <div className="space-y-3">
            {result.tips.map((tip, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl">💡</span>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-sm text-gray-600">
              Total Analyzed: ₹{result.totalAnalyzed?.toFixed(0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderBudgetSuggestion = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <PieChart className="w-6 h-6" />
          Budget Planner AI
        </h2>
        <p className="text-blue-100">50-30-20 Rule Based Budget</p>
      </div>
      
      <button
        onClick={() => callAPI('/budget-suggestion', {
          income: 50000,
          expenses: 35000,
          topCategories: ["Food", "Transport", "Shopping"]
        })}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        Generate Budget Plan
      </button>

      {result && !result.error && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{result.healthEmoji}</span>
            <div>
              <h3 className="font-bold text-lg text-blue-900">Health: {result.healthStatus}</h3>
              <p className="text-sm text-gray-600">Savings Rate: {result.currentSavingsRate?.toFixed(1)}%</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-blue-900">📊 Suggested Budget</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.suggestedBudget || {}).map(([cat, amt]) => (
                <div key={cat} className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{cat}</p>
                  <p className="font-bold text-blue-900">₹{amt.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-blue-900">💡 Recommendations</h4>
            <div className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <p key={idx} className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{rec}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMonthlyAnalytics = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Monthly Analytics AI
        </h2>
        <p className="text-green-100">Financial Health Assessment</p>
      </div>
      
      <button
        onClick={() => callAPI('/monthly-analytics', {
          totalIncome: 50000,
          totalExpenses: 35000,
          categoryBreakdown: {
            "Food": 12000,
            "Transport": 5000,
            "Shopping": 8000,
            "Bills": 10000
          }
        })}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        Analyze This Month
      </button>

      {result && !result.error && (
        <div className="bg-white border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{result.healthEmoji}</span>
            <div>
              <h3 className="font-bold text-xl text-green-900">{result.financialHealth}</h3>
              <p className="text-sm text-gray-600">Net Savings: ₹{result.netSavings?.toFixed(0)}</p>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-green-900">📈 Key Insights</h4>
            <div className="space-y-2">
              {result.insights.map((insight, idx) => (
                <div key={idx} className="bg-green-50 p-3 rounded-lg text-gray-700">
                  {insight}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-green-900">📊 Trends</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.trends || {}).map(([key, val]) => (
                <div key={key} className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="font-bold text-green-900">{val.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSpendingAlerts = () => (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Spending Alerts AI
        </h2>
        <p className="text-orange-100">Real-time Overspending Warnings</p>
      </div>
      
      <button
        onClick={() => callAPI('/spending-alerts', {
          weeklySpending: 8000,
          monthlyBudget: 30000,
          daysRemaining: 20
        })}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition"
      >
        Check Spending Status
      </button>

      {result && !result.error && (
        <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{result.alertEmoji}</span>
            <div>
              <h3 className="font-bold text-xl text-orange-900">Alert: {result.alertLevel}</h3>
              <p className="text-sm text-gray-600">Projected: ₹{result.projectedSpending?.toFixed(0)}</p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-orange-50 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Remaining Budget</span>
              <span className={`font-bold ${result.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{result.remainingBudget?.toFixed(0)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${result.remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{width: `${Math.min(100, Math.abs(result.remainingBudget) / 300)}%`}}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-orange-900">⚠️ Alert Messages</h4>
            <div className="space-y-2">
              {result.messages.map((msg, idx) => (
                <p key={idx} className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg">{msg}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCategorySuggestion = () => {
    const [description, setDescription] = useState('');

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-lg text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Category Detector AI
          </h2>
          <p className="text-indigo-100">Auto-detect expense categories</p>
        </div>
        
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter expense description (e.g., 'Bought groceries from supermarket')"
            className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() => callAPI('/suggest-category', { description, amount: 2500 })}
          disabled={!description}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Detect Category
        </button>

        {result && !result.error && (
          <div className="bg-white border-2 border-indigo-200 rounded-lg p-6">
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-bold text-lg text-indigo-900 mb-2">
                Suggested: {result.suggestedCategory}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{width: `${result.confidence}%`}}
                  />
                </div>
                <span className="font-bold text-indigo-900">{result.confidence?.toFixed(0)}%</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{result.confidenceLabel} Confidence</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-indigo-900">🔄 Alternatives</h4>
              <div className="flex flex-wrap gap-2">
                {result.alternativeCategories.map((cat, idx) => (
                  <span key={idx} className="bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full text-sm font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'tips', label: 'Expense Tips', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'budget', label: 'Budget Plan', icon: <PieChart className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="w-5 h-5" /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'category', label: 'Auto-Detect', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <DollarSign className="w-10 h-10 text-green-600" />
            AI Expense Tracker
          </h1>
          <p className="text-gray-600">Smart Financial Management - 100% FREE</p>
          <p className="text-sm text-gray-500">No API Keys • Pure Java Logic • Works Offline</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResult(null); }}
                className={`flex-1 min-w-max px-4 py-3 flex items-center justify-center gap-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">AI Processing...</p>
            </div>
          )}

          {!loading && (
            <>
              {activeTab === 'tips' && renderExpenseTips()}
              {activeTab === 'budget' && renderBudgetSuggestion()}
              {activeTab === 'analytics' && renderMonthlyAnalytics()}
              {activeTab === 'alerts' && renderSpendingAlerts()}
              {activeTab === 'category' && renderCategorySuggestion()}
            </>
          )}

          {result?.error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-bold text-red-900 mb-2">Connection Error</h3>
              <p className="text-red-700 mb-3">{result.error}</p>
              <p className="text-sm text-red-600">Make sure backend is running on port 8080</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💰 100% FREE • No OpenAI • No External APIs • Pure Java Logic</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTrackerDashboard;