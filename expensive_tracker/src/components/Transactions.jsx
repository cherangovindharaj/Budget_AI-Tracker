import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, Filter, TrendingDown, Calendar, X } from "lucide-react";

const Transactions = () => {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [userData, setUserData] = useState(null);

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other",
  ];

  const categoryColors = {
    Food: "bg-gradient-to-r from-pink-100 to-pink-50 text-pink-700 border-pink-300",
    Transport: "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border-blue-300",
    Shopping: "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-300",
    Bills: "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-300",
    Entertainment: "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-300",
    Health: "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-300",
    Education: "bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 border-indigo-300",
    Other: "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-300",
  };

  const categoryIcons = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Bills: "📄",
    Entertainment: "🎬",
    Health: "💊",
    Education: "📚",
    Other: "📌",
  };

  useEffect(() => {
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setUserData(parsed);
      fetchExpenses(parsed.id);
    } else {
      fetchExpenses();
    }
  }, []);

  const getId = (exp) => exp.id || exp._id || exp._doc?.id || exp._doc?._id;

  const fetchExpenses = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const url = userId
        ? `http://localhost:8080/api/expenses/user/${userId}`
        : `http://localhost:8080/api/expenses`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        console.error("Failed to fetch expenses", res.status);
        setExpenses([]);
        return;
      }
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setExpenses([]);
    }
  };

  const openAddModal = () => {
    setFormData({
      id: null,
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (expense) => {
    const id = getId(expense);
   let expenseDate = expense.expenseDate || "";

    
    // Better date handling
    try {
      if (expenseDate) {
        if (typeof expenseDate === 'string' && expenseDate.includes("T")) {
          expenseDate = expenseDate.split("T")[0];
        } else {
          const d = new Date(expenseDate);
          if (!isNaN(d.getTime())) {
            expenseDate = d.toISOString().split("T")[0];
          } else {
            expenseDate = new Date().toISOString().split("T")[0];
          }
        }
      } else {
        expenseDate = new Date().toISOString().split("T")[0];
      }
    } catch (err) {
      console.error("Date parsing error:", err);
      expenseDate = new Date().toISOString().split("T")[0];
    }

    setFormData({
      id,
      amount: expense.amount?.toString() ?? "",
      category: expense.category ?? "",
      date: expenseDate,
      description: expense.description ?? "",
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date) {
      alert("Please fill all required fields.");
      return;
    }
const payload = {
  userId: userData?.id,
  amount: parseFloat(formData.amount),
  category: formData.category,
  date: formData.date,
  description: formData.description,
};


    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };

      if (isEditing && formData.id) {
        const url = `http://localhost:8080/api/expenses/${formData.id}`;
        const res = await fetch(url, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });

        const text = await res.text();

        if (!res.ok) {
          alert("Failed to update expense: " + (text || res.status));
          setSaving(false);
          return;
        }

        alert("✅ Expense updated successfully!");
      } else {
        const url = "http://localhost:8080/api/expenses";
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const text = await res.text();

        if (!res.ok) {
          alert("Failed to add expense: " + (text || res.status));
          setSaving(false);
          return;
        }

        alert("✅ Expense added successfully!");
      }

      setFormData({
        id: null,
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      setIsEditing(false);
      setShowModal(false);
      setSaving(false);
      fetchExpenses(userData?.id);
    } catch (err) {
      console.error("Submit error:", err);
      alert("Network error while saving.");
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/expenses/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete failed:", res.status, text);
        alert("Failed to delete item");
        return;
      }

      alert("🗑️ Deleted successfully!");
      fetchExpenses(userData?.id);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error while deleting.");
    }
  };

  const filtered = expenses.filter((exp) => {
    const matchSearch =
      (exp.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (exp.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || exp.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalAmount = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalCategories = new Set(filtered.map((e) => e.category)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-28">
      <div className="bg-white border-b shadow-lg sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 p-3 rounded-2xl shadow-xl animate-pulse">
                <TrendingDown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  My Expenses
                </h1>
                <p className="text-gray-500 text-sm mt-1">Track and manage your spending</p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100 mb-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by category or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300"
              />
            </div>
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white cursor-pointer font-medium hover:border-purple-300"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 shadow-2xl text-white transform hover:scale-105 hover:-rotate-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-100 text-sm font-medium">Total Expenses</div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <TrendingDown size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{filtered.length}</div>
            <div className="text-blue-100 text-xs">Transactions</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 rounded-2xl p-6 shadow-2xl text-white transform hover:scale-105 hover:rotate-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="text-red-100 text-sm font-medium">Total Amount</div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <span className="text-2xl font-bold">₹</span>
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">₹{totalAmount.toFixed(2)}</div>
            <div className="text-red-100 text-xs">Spent this period</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-2xl text-white transform hover:scale-105 hover:-rotate-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="text-purple-100 text-sm font-medium">Categories</div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Filter size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold mb-1">{totalCategories}</div>
            <div className="text-purple-100 text-xs">Active categories</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 px-6 py-4 border-b-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-800">All Expenses</h2>
            <p className="text-sm text-gray-600 mt-1">Your complete transaction history</p>
          </div>

          <div className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <TrendingDown size={48} className="text-purple-500" />
                </div>
                <p className="text-gray-700 text-lg font-bold">No expenses found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((exp) => {
                  const id = getId(exp);
                  const colorClass = categoryColors[exp.category] || categoryColors.Other;
                  const icon = categoryIcons[exp.category] || categoryIcons.Other;
                  
                  return (
                    <div
                      key={id}
                      className="bg-gradient-to-r from-gray-50 to-white hover:from-purple-50 hover:via-pink-50 hover:to-purple-50 rounded-2xl p-5 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{icon}</span>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${colorClass} shadow-md`}>
                              {exp.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-gray-500">
                              <Calendar size={14} />
                              <span className="text-sm font-medium">
  {exp.expenseDate
    ? new Date(exp.expenseDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : "-"}
</span>

                             
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-gray-700 text-sm leading-relaxed ml-11">{exp.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right bg-gradient-to-r from-red-50 to-pink-50 px-4 py-2 rounded-xl border-2 border-red-200">
                            <div className="text-2xl font-black text-red-600">
                              ₹{Number(exp.amount).toFixed(2)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(exp)}
                              className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(id)}
                              className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
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
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isEditing ? "✏️ Edit Expense" : "➕ Add Expense"}
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">
                    {isEditing ? "Update your transaction details" : "Record your new expense"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition-all hover:rotate-90 transform duration-300"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-purple-500 transition-colors">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-bold text-lg hover:border-purple-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold bg-white cursor-pointer hover:border-purple-300"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                   <option key={c} value={c}>{categoryIcons[c]} {c}</option>

                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold hover:border-purple-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Add notes about this expense..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none hover:border-purple-300"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full py-4 rounded-xl text-white font-bold shadow-xl transition-all duration-300 text-lg ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                }`}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {isEditing ? "Updating..." : "Saving..."}
                  </span>
                ) : (
                  <span>{isEditing ? "💾 Update Expense" : "✅ Add Expense"}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;