import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Target, TrendingUp, PiggyBank, Calendar, Award, Zap, X } from 'lucide-react';

const API_BASE = "http://localhost:8080/api";

const SavingsDashboard = ({ userId, onClose }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`${API_BASE}/saving-goals/user/${userId}`);
        const data = await response.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching goals:', error);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchGoals();
    }
  }, [userId]);

  const stats = useMemo(() => {
    const totalGoals = goals.length;
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
    const totalRemaining = totalTarget - totalSaved;
    const completed = goals.filter(g => g.savedAmount >= g.targetAmount).length;
    const avgProgress = totalGoals > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return { totalGoals, totalTarget, totalSaved, totalRemaining, completed, avgProgress };
  }, [goals]);

  const pieData = goals.map(g => ({
    name: g.goalName,
    value: g.savedAmount,
    target: g.targetAmount,
    remaining: Math.max(0, g.targetAmount - g.savedAmount)
  }));

  const barData = goals.map(g => ({
    name: g.goalName.length > 10 ? g.goalName.substring(0, 10) + '...' : g.goalName,
    Saved: g.savedAmount,
    Target: g.targetAmount,
    Remaining: Math.max(0, g.targetAmount - g.savedAmount)
  }));

  const progressData = goals.map(g => ({
    name: g.goalName.length > 12 ? g.goalName.substring(0, 12) + '...' : g.goalName,
    progress: ((g.savedAmount / g.targetAmount) * 100).toFixed(1)
  }));

  const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
  const currency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="text-center mt-4 font-semibold text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header with Close Button */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-xl">
                  <PiggyBank className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Savings Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">Track your financial goals visually</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 px-6 py-3 rounded-xl border-2 border-purple-200">
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgProgress.toFixed(1)}%</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-red-50 rounded-xl transition-all group"
                  title="Close Dashboard"
                >
                  <X className="w-6 h-6 text-gray-600 group-hover:text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Goals</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalGoals}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-green-100 hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Saved</p>
              <p className="text-3xl font-bold text-green-600">{currency(stats.totalSaved)}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-orange-100 hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className="text-3xl font-bold text-orange-600">{currency(stats.totalRemaining)}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100 hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-purple-600">{stats.completed}</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pie Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 rounded-lg">
                  🍰
                </div>
                Savings Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => currency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-2 rounded-lg">
                  📊
                </div>
                Goals Comparison
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => currency(value)} />
                  <Legend />
                  <Bar dataKey="Saved" fill="#10B981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Target" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-green-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-lg">
                  📈
                </div>
                Progress Tracking
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Horizontal Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-orange-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 p-2 rounded-lg">
                  💰
                </div>
                Remaining to Save
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => currency(value)} />
                  <Bar dataKey="Remaining" fill="#F59E0B" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 rounded-lg">
                📋
              </div>
              Goals Summary
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-4 font-bold text-gray-700">Goal Name</th>
                    <th className="text-right p-4 font-bold text-gray-700">Target</th>
                    <th className="text-right p-4 font-bold text-gray-700">Saved</th>
                    <th className="text-right p-4 font-bold text-gray-700">Remaining</th>
                    <th className="text-center p-4 font-bold text-gray-700">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map((goal) => {
                    const progress = ((goal.savedAmount / goal.targetAmount) * 100).toFixed(1);
                    return (
                      <tr key={goal.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                        <td className="p-4 font-semibold text-gray-800">{goal.goalName}</td>
                        <td className="p-4 text-right text-blue-600 font-semibold">{currency(goal.targetAmount)}</td>
                        <td className="p-4 text-right text-green-600 font-semibold">{currency(goal.savedAmount)}</td>
                        <td className="p-4 text-right text-orange-600 font-semibold">
                          {currency(Math.max(0, goal.targetAmount - goal.savedAmount))}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-purple-600 min-w-[45px]">{progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SavingsDashboard;