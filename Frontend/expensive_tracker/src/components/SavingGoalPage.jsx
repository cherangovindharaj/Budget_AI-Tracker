import React, { useEffect, useMemo, useState } from "react";
import { Plus, Target, TrendingUp, Calendar, Trash2, PiggyBank, CheckCircle, X } from "lucide-react";

// API Configuration
const API_BASE = "http://localhost:8080/api";
const API = {
  list: (userId) => `${API_BASE}/saving-goals/user/${userId}`,
  create: () => `${API_BASE}/saving-goals`,
  addAmount: (id, amount) => `${API_BASE}/saving-goals/${id}/add?amount=${amount}`,
  remove: (id) => `${API_BASE}/saving-goals/${id}`,
};

const currency = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

// Enhanced Progress Bar with Animation
const ProgressBar = ({ percent }) => (
  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
    <div
      className="h-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 transition-all duration-500 ease-out shadow-lg"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    >
      <div className="h-full w-full bg-white/20 animate-pulse"></div>
    </div>
  </div>
);

// Enhanced Stat Card
const Stat = ({ label, value, icon: Icon, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all duration-300`}>
    <div className="flex items-center justify-between mb-2">
      <div className="text-white/80 text-sm font-medium">{label}</div>
      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
        <Icon size={20} />
      </div>
    </div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

// Enhanced Add Goal Modal
const AddGoalModal = ({ open, onClose, onCreate, userId }) => {
  const [goalName, setGoalName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [initial, setInitial] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setGoalName("");
      setTarget("");
      setDeadline("");
      setInitial("");
    }
  }, [open]);

  const disable = !goalName.trim() || !target || Number(target) <= 0 || !deadline;

  const handleSubmit = async () => {
    setSaving(true);
    const body = {
  userId,
  goalName: goalName.trim(),
  targetAmount: Number(target),
  savedAmount: initial && Number(initial) > 0 ? Number(initial) : 0,
  deadline
};

   

    await onCreate(body);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center px-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl transform animate-scaleIn">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Add Saving Goal</h3>
                <p className="text-purple-100 text-sm mt-1">Create your financial target</p>
              </div>
            </div>
            <button
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all hover:rotate-90 transform duration-300"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Saving Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-purple-300"
              placeholder="e.g., New Phone, Emergency Fund"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Target Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-purple-500 transition-colors">
                ₹
              </span>
              <input
                type="number"
                min="0"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-bold text-lg hover:border-purple-300"
                placeholder="25000"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-semibold hover:border-purple-300"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-700">Initial Amount</label>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
            </div>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-lg group-focus-within:text-purple-500 transition-colors">
                ₹
              </span>
              <input
                type="number"
                min="0"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-bold text-lg hover:border-purple-300"
                placeholder="3000 (if you already have some savings)"
                value={initial}
                onChange={(e) => setInitial(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            className="flex-1 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={disable || saving}
            className={`flex-1 py-3 rounded-xl text-white font-bold transition-all ${
              disable || saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:shadow-xl transform hover:-translate-y-1"
            }`}
            onClick={handleSubmit}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </span>
            ) : (
              "🎯 Create Goal"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Goal Card
const GoalCard = ({ g, onAddAmount, onDelete }) => {
  const percent = g.targetAmount ? Math.min(100, (g.savedAmount / g.targetAmount) * 100) : 0;
  const remaining = Math.max(0, (g.targetAmount || 0) - (g.savedAmount || 0));
  const [quickAmt, setQuickAmt] = useState("");
  const isCompleted = percent >= 100;

  return (
    <div className={`bg-white border-2 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
      isCompleted ? "border-green-300 bg-gradient-to-br from-green-50 to-white" : "border-purple-200 hover:border-purple-300"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-xl ${isCompleted ? "bg-green-100" : "bg-purple-100"}`}>
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Target className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-800">{g.goalName}</h3>
              {isCompleted && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Completed! 🎉
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Calendar size={14} />
              <span>
                Deadline:{" "}
                {g.deadline
                  ? new Date(g.deadline).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(g.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
          title="Delete Goal"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="text-xs text-blue-600 font-semibold mb-1">Target</div>
          <div className="text-lg font-bold text-blue-700">{currency(g.targetAmount)}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="text-xs text-green-600 font-semibold mb-1">Saved</div>
          <div className="text-lg font-bold text-green-700">{currency(g.savedAmount)}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="text-xs text-orange-600 font-semibold mb-1">Remaining</div>
          <div className="text-lg font-bold text-orange-700">{currency(remaining)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="text-xs text-purple-600 font-semibold mb-1">Progress</div>
          <div className="text-lg font-bold text-purple-700">{Math.round(percent)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <ProgressBar percent={percent} />
      </div>

      {/* Add Amount Section */}
      {!isCompleted && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold group-focus-within:text-green-600 transition-colors">
              ₹
            </span>
            <input
              type="number"
              min="0"
              placeholder="Add amount to save"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-semibold hover:border-green-300"
              value={quickAmt}
              onChange={(e) => setQuickAmt(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              if (!quickAmt || Number(quickAmt) <= 0) return;
              onAddAmount(g.id, Number(quickAmt));
              setQuickAmt("");
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            💰 Add
          </button>
        </div>
      )}
    </div>
  );
};

// Main Savings Goal Page
const SavingGoalPage = () => {
  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  const userId = user?.id;

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(API.list(userId));
      const data = await r.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const totals = useMemo(() => {
    const totalGoals = goals.length;
    const completed = goals.filter((g) => g.savedAmount >= g.targetAmount).length;
    const totalSaved = goals.reduce((s, g) => s + (g.savedAmount || 0), 0);
    return { totalGoals, completed, totalSaved };
  }, [goals]);

  const createGoal = async (payload) => {
    try {
      const response = await fetch(API.create(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create goal:", response.status, errorText);
        alert("Failed to create goal: " + (errorText || response.status));
        return;
      }
      
      alert("✅ Saving goal created successfully!");
      setOpen(false);
      await load();
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Network error while creating goal. Please check your connection.");
    }
  };

  const addAmount = async (id, amount) => {
    try {
      const response = await fetch(API.addAmount(id, amount), { method: "PUT" });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to add amount:", response.status, errorText);
        alert("Failed to add amount: " + (errorText || response.status));
        return;
      }
      
      alert("✅ Amount added successfully!");
      await load();
    } catch (error) {
      console.error("Error adding amount:", error);
      alert("Network error while adding amount.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this saving goal?")) return;
    
    try {
      const response = await fetch(API.remove(id), { method: "DELETE" });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to delete goal:", response.status, errorText);
        alert("Failed to delete goal: " + (errorText || response.status));
        return;
      }
      
      alert("🗑️ Saving goal deleted successfully!");
      await load();
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Network error while deleting goal.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b shadow-lg sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 p-3 rounded-2xl shadow-xl animate-pulse">
                <PiggyBank className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Savings Goals
                </h2>
                <p className="text-gray-500 text-sm mt-1">Create goals and track your progress</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Add Saving Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Stat
            label="Total Goals"
            value={totals.totalGoals}
            icon={Target}
            gradient="from-blue-500 via-blue-600 to-blue-700"
          />
          <Stat
            label="Completed Goals"
            value={totals.completed}
            icon={CheckCircle}
            gradient="from-green-500 via-emerald-600 to-green-700"
          />
          <Stat
            label="Total Saved"
            value={currency(totals.totalSaved)}
            icon={TrendingUp}
            gradient="from-purple-500 via-pink-500 to-purple-600"
          />
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-12 text-center shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading your goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white border-2 border-purple-200 rounded-2xl p-12 text-center shadow-xl">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <PiggyBank size={48} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No saving goals yet</h3>
            <p className="text-gray-600 mb-6">Start your savings journey by creating your first goal!</p>
            <button
              onClick={() => setOpen(true)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white font-bold hover:shadow-xl transition-all transform hover:scale-105"
            >
              🎯 Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {goals.map((g) => (
              <GoalCard key={g.id} g={g} onAddAmount={addAmount} onDelete={remove} />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <AddGoalModal open={open} onClose={() => setOpen(false)} onCreate={createGoal} userId={userId} />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SavingGoalPage;