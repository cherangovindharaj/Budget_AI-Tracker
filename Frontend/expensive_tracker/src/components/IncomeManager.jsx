import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit, IndianRupee } from 'lucide-react';

const IncomeManager = ({ userId, onClose, onIncomeAdded }) => {
  const [incomes, setIncomes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    incomeDate: new Date().toISOString().split('T')[0]
  });

  const categories = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Other'];

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/incomes/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setIncomes(data);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        userId: userId,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        incomeDate: formData.incomeDate
      };

      const url = editingIncome 
        ? `http://localhost:8080/api/incomes/${editingIncome.id}`
        : 'http://localhost:8080/api/incomes';
      
      const method = editingIncome ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormData({ amount: '', category: '', description: '', incomeDate: new Date().toISOString().split('T')[0] });
        setShowAddForm(false);
        setEditingIncome(null);
        fetchIncomes();
        if (onIncomeAdded) onIncomeAdded();
        alert(editingIncome ? 'Income updated!' : 'Income added!');
      } else {
        alert('Failed to save income');
      }
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Error saving income');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      amount: income.amount.toString(),
      category: income.category,
      description: income.description || '',
      incomeDate: income.incomeDate
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/incomes/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchIncomes();
        if (onIncomeAdded) onIncomeAdded();
        alert('Income deleted!');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Income Manager</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Your Incomes</h3>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingIncome(null);
                setFormData({ amount: '', category: '', description: '', incomeDate: new Date().toISOString().split('T')[0] });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={20} />
              Add Income
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.incomeDate}
                    onChange={(e) => setFormData({...formData, incomeDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Add notes..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingIncome ? 'Update' : 'Add')} Income
              </button>
            </form>
          )}

          {incomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No incomes recorded yet. Add your first income!
            </div>
          ) : (
            <div className="space-y-3">
              {incomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        {income.category}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {new Date(income.incomeDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    {income.description && (
                      <p className="text-sm text-gray-600 mt-1">{income.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-green-600">
                      +₹{parseFloat(income.amount).toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(income)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeManager;