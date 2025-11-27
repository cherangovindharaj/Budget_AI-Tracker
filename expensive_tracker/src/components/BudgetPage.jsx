import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, AlertTriangle, Calendar, IndianRupee } from 'lucide-react';

const BudgetPage = () => {
  const [userData, setUserData] = useState(() => {
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    limitAmount: '',
    period: 'MONTHLY'
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

  useEffect(() => {
    if (userData?.id) {
      fetchBudgets();
      fetchExpenses();
    }
  }, [userData]);

  useEffect(() => {
    checkAlerts();
  }, [budgets, expenses]);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/budgets/user/${userData.id}`);
      if (response.ok) {
        const data = await response.json();
        setBudgets(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/expenses/user/${userData.id}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const checkAlerts = () => {
    const newAlerts = [];
    budgets.forEach(budget => {
      const spent = calculateSpent(budget.category, budget.period);
      const percentage = (spent / budget.limitAmount) * 100;
      
      if (percentage >= 100) {
        newAlerts.push({
          id: budget.id,
          category: budget.category,
          type: 'danger',
          message: `Budget exceeded!`,
          spent,
          limit: budget.limitAmount,
          percentage: percentage.toFixed(1)
        });
      } else if (percentage >= 80) {
        newAlerts.push({
          id: budget.id,
          category: budget.category,
          type: 'warning',
          message: `Approaching limit`,
          spent,
          limit: budget.limitAmount,
          percentage: percentage.toFixed(1)
        });
      }
    });
    setAlerts(newAlerts);
  };

  const calculateSpent = (category, period) => {
    const now = new Date();
    const filtered = expenses.filter(exp => {
      if (exp.category !== category) return false;
      const expDate = new Date(exp.expenseDate);
      
      if (period === 'MONTHLY') {
        return expDate.getMonth() === now.getMonth() && 
               expDate.getFullYear() === now.getFullYear();
      } else if (period === 'WEEKLY') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expDate >= weekAgo;
      }
      return false;
    });
    
    return filtered.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8080/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: userData.id
        })
      });

      if (response.ok) {
        fetchBudgets();
        setShowAddForm(false);
        setFormData({ category: '', limitAmount: '', period: 'MONTHLY' });
      }
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/budgets/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchBudgets();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-100';
    if (percentage >= 80) return 'bg-yellow-100';
    return 'bg-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-xl shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Budget Manager</h1>
                <p className="text-gray-600 mt-1">Track and control your spending limits</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Budget
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border-l-4 ${
                  alert.type === 'danger' 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-yellow-50 border-yellow-500'
                } shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-6 h-6 mt-0.5 ${
                    alert.type === 'danger' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-bold ${
                        alert.type === 'danger' ? 'text-red-900' : 'text-yellow-900'
                      }`}>
                        {alert.category} Budget Alert
                      </h4>
                      <span className={`text-sm font-semibold ${
                        alert.type === 'danger' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {alert.percentage}%
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${
                      alert.type === 'danger' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      Spent ₹{alert.spent.toFixed(2)} of ₹{alert.limit.toFixed(2)} - {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Budget Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Budget</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Limit
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.limitAmount}
                      onChange={(e) => setFormData({...formData, limitAmount: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-medium"
                >
                  Create Budget
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Budgets Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Budgets</h2>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No budgets set yet</h3>
            <p className="text-gray-600 mb-6">Create your first budget to start tracking your spending</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition font-medium shadow-lg"
            >
              Create First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map(budget => {
              const spent = calculateSpent(budget.category, budget.period);
              const percentage = (spent / budget.limitAmount) * 100;
              const remaining = budget.limitAmount - spent;

              return (
                <div key={budget.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                            {budget.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <Calendar className="w-4 h-4" />
                          <span>{budget.period}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete budget"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Spent</span>
                        <span className="font-bold text-gray-900">₹{spent.toFixed(2)}</span>
                      </div>

                      <div className={`w-full h-3 rounded-full overflow-hidden ${getProgressBgColor(percentage)}`}>
                        <div
                          className={`h-full ${getProgressColor(percentage)} transition-all duration-500 rounded-full`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-600">Limit: </span>
                          <span className="font-bold text-gray-900">₹{budget.limitAmount.toFixed(2)}</span>
                        </div>
                        <div className={`text-sm font-bold ${
                          percentage >= 100 ? 'text-red-600' :
                          percentage >= 80 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>

                      <div className={`pt-3 border-t border-gray-100 ${
                        remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>{remaining >= 0 ? 'Remaining' : 'Over Budget'}</span>
                          <span className="text-lg font-bold">
                            ₹{Math.abs(remaining).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;