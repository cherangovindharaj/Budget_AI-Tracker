import React, { useState, useEffect } from 'react';
import { X, Lightbulb, PieChart, Activity, AlertTriangle, CheckCircle, TrendingUp, Sparkles, Brain, Target, Zap, ArrowLeft } from 'lucide-react';

const AIExpenseDashboard = ({ userData, expenses, totalIncome, stats, onClose }) => {
  const [activeTab, setActiveTab] = useState('tips');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [categoryInput, setCategoryInput] = useState('');

  // API Base URL
  const API_BASE = 'http://localhost:8080/api/ai';

  // Prepare expense data for API
  const expenseData = Object.entries(stats.categoryTotals).map(([category, amount]) => ({
    category,
    amount
  }));

  const topCategories = Object.keys(stats.categoryTotals)
    .sort((a, b) => stats.categoryTotals[b] - stats.categoryTotals[a])
    .slice(0, 3);

  const categoryBreakdown = stats.categoryTotals;

  // API Call Function
  const callAI = async (endpoint, data) => {
    setLoading(true);
    setAiResponse(null);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      setAiResponse(result);
    } catch (error) {
      setAiResponse({ error: error.message });
    }
    setLoading(false);
  };

  // Auto-load expense tips on mount
  useEffect(() => {
    if (expenseData.length > 0) {
      callAI('/expense-tips', expenseData);
    }
  }, []);

  const renderExpenseTips = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl">
            <Lightbulb className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">AI Expense Analyzer</h2>
            <p className="text-purple-100 mt-1">Get personalized tips based on your spending patterns</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => callAI('/expense-tips', expenseData)}
        disabled={loading || expenseData.length === 0}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <Brain className="w-6 h-6" />
        {loading ? 'Analyzing...' : 'Analyze My Spending Patterns'}
      </button>

      {aiResponse && !aiResponse.error && aiResponse.tips && (
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-7 h-7 text-purple-600" />
            <h3 className="font-bold text-2xl text-purple-900">AI-Generated Smart Tips</h3>
          </div>
          <div className="space-y-4">
            {aiResponse.tips.map((tip, idx) => (
              <div key={idx} className="flex gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:shadow-md transition-all">
                <div className="flex-shrink-0">
                  <div className="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed text-lg">{tip}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Amount Analyzed</p>
                <p className="text-3xl font-bold text-purple-900">₹{aiResponse.totalAnalyzed?.toFixed(0).toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 px-6 py-3 rounded-xl">
                <p className="text-sm text-gray-600 font-semibold">Categories</p>
                <p className="text-2xl font-bold text-purple-900">{expenseData.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBudgetSuggestion = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl">
            <PieChart className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Smart Budget Planner</h2>
            <p className="text-blue-100 mt-1">50-30-20 Rule Based AI Budget Recommendation</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => callAI('/budget-suggestion', {
          income: totalIncome,
          expenses: stats.totalExpenses,
          topCategories: topCategories
        })}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        <Target className="w-6 h-6" />
        {loading ? 'Calculating...' : 'Generate AI Budget Plan'}
      </button>

      {aiResponse && !aiResponse.error && aiResponse.suggestedBudget && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <span className="text-6xl">{aiResponse.healthEmoji}</span>
            <div className="flex-1">
              <h3 className="font-bold text-2xl text-blue-900">Financial Health: {aiResponse.healthStatus}</h3>
              <p className="text-lg text-gray-600 mt-1">Current Savings Rate: <span className="font-bold text-blue-700">{aiResponse.currentSavingsRate?.toFixed(1)}%</span></p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              AI-Suggested Budget Allocation
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(aiResponse.suggestedBudget || {}).map(([cat, amt]) => (
                <div key={cat} className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-100 hover:shadow-md transition-all">
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{cat}</p>
                  <p className="font-bold text-2xl text-blue-900 mt-1">₹{amt.toFixed(0).toLocaleString()}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{width: `${(amt / totalIncome) * 100}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl">
            <h4 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
              <Lightbulb className="w-6 h-6" />
              AI Recommendations
            </h4>
            <div className="space-y-3">
              {aiResponse.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMonthlyAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl">
            <Activity className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">AI Financial Health Check</h2>
            <p className="text-green-100 mt-1">Comprehensive monthly analysis & insights</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => callAI('/monthly-analytics', {
          totalIncome: totalIncome,
          totalExpenses: stats.totalExpenses,
          categoryBreakdown: categoryBreakdown
        })}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        <TrendingUp className="w-6 h-6" />
        {loading ? 'Analyzing...' : 'Run AI Health Analysis'}
      </button>

      {aiResponse && !aiResponse.error && aiResponse.financialHealth && (
        <div className="bg-white border-2 border-green-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <span className="text-6xl">{aiResponse.healthEmoji}</span>
            <div className="flex-1">
              <h3 className="font-bold text-3xl text-green-900">{aiResponse.financialHealth}</h3>
              <p className="text-lg text-gray-600 mt-1">Net Savings: <span className="font-bold text-green-700">₹{aiResponse.netSavings?.toFixed(0).toLocaleString()}</span></p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-xl mb-4 text-green-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              AI-Generated Key Insights
            </h4>
            <div className="space-y-3">
              {aiResponse.insights.map((insight, idx) => (
                <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-100">
                  <div className="flex gap-3">
                    <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed flex-1">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xl mb-4 text-green-900 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Financial Trends
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(aiResponse.trends || {}).map(([key, val]) => (
                <div key={key} className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-100">
                  <p className="text-sm text-gray-600 font-semibold capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-bold text-3xl text-green-900">{val.toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSpendingAlerts = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">AI Spending Alert System</h2>
            <p className="text-orange-100 mt-1">Real-time overspending detection & warnings</p>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => {
          const weeklySpending = stats.totalExpenses / 4;
          const monthlyBudget = totalIncome * 0.7;
          const today = new Date();
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const daysRemaining = daysInMonth - today.getDate();
          
          callAI('/spending-alerts', {
            weeklySpending: weeklySpending,
            monthlyBudget: monthlyBudget,
            daysRemaining: daysRemaining
          });
        }}
        disabled={loading}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
      >
        <Zap className="w-6 h-6" />
        {loading ? 'Checking...' : 'Check Spending Status Now'}
      </button>

      {aiResponse && !aiResponse.error && aiResponse.alertLevel && (
        <div className="bg-white border-2 border-orange-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
            <span className="text-6xl">{aiResponse.alertEmoji}</span>
            <div className="flex-1">
              <h3 className="font-bold text-3xl text-orange-900">Alert Level: {aiResponse.alertLevel}</h3>
              <p className="text-lg text-gray-600 mt-1">Projected Spending: <span className="font-bold text-orange-700">₹{aiResponse.projectedSpending?.toFixed(0).toLocaleString()}</span></p>
            </div>
          </div>

          <div className="mb-6 p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">Remaining Budget</span>
              <span className={`font-bold text-3xl ${aiResponse.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{aiResponse.remainingBudget?.toFixed(0).toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all ${aiResponse.remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{width: `${Math.min(100, Math.abs((aiResponse.remainingBudget / (totalIncome * 0.7)) * 100))}%`}}
              />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xl mb-4 text-orange-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              AI Alert Messages
            </h4>
            <div className="space-y-3">
              {aiResponse.messages.map((msg, idx) => (
                <div key={idx} className="flex gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-100">
                  <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed flex-1">{msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCategorySuggestion = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-xl">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">AI Category Detector</h2>
            <p className="text-indigo-100 mt-1">Automatic expense categorization using AI</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white border-2 border-indigo-200 rounded-2xl p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Expense Description</label>
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          placeholder="e.g., 'Bought groceries from supermarket' or 'Taxi to airport'"
          className="w-full p-4 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 text-lg"
        />
      </div>

      <button
        onClick={() => callAI('/suggest-category', { 
          description: categoryInput, 
          amount: 2500 
        })}
        disabled={!categoryInput.trim() || loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <Brain className="w-6 h-6" />
        {loading ? 'Detecting...' : 'Detect Category with AI'}
      </button>

      {aiResponse && !aiResponse.error && aiResponse.suggestedCategory && (
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-8 shadow-xl">
          <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
            <h3 className="font-bold text-2xl text-indigo-900 mb-4">
              ✨ AI Detected: <span className="text-indigo-600">{aiResponse.suggestedCategory}</span>
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold text-gray-600">Confidence Level:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all"
                  style={{width: `${aiResponse.confidence}%`}}
                />
              </div>
              <span className="font-bold text-xl text-indigo-900">{aiResponse.confidence?.toFixed(0)}%</span>
            </div>
            <p className="text-sm font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full inline-block">
              {aiResponse.confidenceLabel} Confidence
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xl mb-4 text-indigo-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Alternative Suggestions
            </h4>
            <div className="flex flex-wrap gap-3">
              {aiResponse.alternativeCategories.map((cat, idx) => (
                <span 
                  key={idx} 
                  className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 px-5 py-3 rounded-xl text-base font-semibold border-2 border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'tips', label: 'Expense Tips', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'budget', label: 'Budget Plan', icon: <PieChart className="w-5 h-5" /> },
    { id: 'analytics', label: 'Monthly Analytics', icon: <Activity className="w-5 h-5" /> },
    { id: 'alerts', label: 'Spending Alerts', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'category', label: 'Category Detector', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="hover:bg-white/20 p-2 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Brain className="w-8 h-8" />
                  AI Financial Intelligence Dashboard
                </h1>
                <p className="text-blue-100 mt-1">Powered by Smart Java Logic </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-md overflow-x-auto sticky top-[88px] z-10">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id); 
                  setAiResponse(null); 
                  setCategoryInput('');
                }}
                className={`flex-1 min-w-max px-6 py-4 flex items-center justify-center gap-2 font-semibold transition-all ${
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

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-176px)]">
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-xl font-semibold text-gray-700">AI Processing Your Data...</p>
              <p className="text-sm text-gray-500 mt-2">Analyzing patterns and generating insights</p>
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

          {aiResponse?.error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="font-bold text-2xl text-red-900 mb-3">Connection Error</h3>
              <p className="text-red-700 text-lg mb-4">{aiResponse.error}</p>
              <p className="text-sm text-red-600 bg-red-100 px-4 py-2 rounded-lg inline-block">
                Make sure backend is running on <strong>http://localhost:8080</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 text-center sticky bottom-0">
          <p className="text-sm text-gray-600">
            💰 <strong></strong> • No API Keys • No External Dependencies • Pure Java Logic
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIExpenseDashboard;