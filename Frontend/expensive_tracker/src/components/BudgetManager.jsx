import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

const BudgetManager = ({ userId, onClose }) => {
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limitAmount: '',
    period: 'MONTHLY'
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

  useEffect(() => {
    fetchBudgets();
    fetchAlerts();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/budgets/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/budgets/alerts/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        userId: userId,
        category: formData.category,
        limitAmount: parseFloat(formData.limitAmount),
        period: formData.period
      };

      const response = await fetch('http://localhost:8080/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormData({ category: '', limitAmount: '', period: 'MONTHLY' });
        setShowAddForm(false);
        fetchBudgets();
        fetchAlerts();
        alert('Budget saved successfully!');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Error saving budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/budgets/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBudgets();
        fetchAlerts();
        alert('Budget deleted!');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Budget Manager</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {alerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                alert.status === 'EXCEEDED' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={alert.status === 'EXCEEDED' ? 'text-red-600' : 'text-yellow-600'} size={24} />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{alert.category} Budget Alert</h3>
                    <p className="text-sm text-gray-700">
                      Spent ₹{alert.spent.toFixed(2)} of ₹{alert.limit.toFixed(2)} ({alert.percentage.toFixed(1)}%)
                    </p>
                    {alert.status === 'EXCEEDED' && (
                      <p className="text-sm text-red-600 font-semibold mt-1">Budget exceeded!</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Your Budgets</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus size={20} />
              Add Budget
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Limit Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.limitAmount}
                    onChange={(e) => setFormData({...formData, limitAmount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                Save Budget
              </button>
            </form>
          )}

          {budgets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No budgets set yet. Add your first budget!
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        {budget.category}
                      </span>
                      <span className="text-gray-600">{budget.period}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Limit: ₹{budget.limitAmount.toFixed(2)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;