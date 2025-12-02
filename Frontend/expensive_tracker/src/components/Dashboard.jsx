import React, { useState, useEffect } from "react";
import IncomeManager from "./IncomeManager";
import CommunityForum from './CommunityForum';
import AIExpenseDashboard from './AIExpenseDashboard';

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PieChart as PieIcon,
  Trash2,
  Search,
  MessageSquare,
  Sparkles,
  X,
  Lightbulb,
  Activity,
  AlertTriangle,
  Zap,
  ChevronRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import SavingsDashboard from './SavingsDashboard';

// Category colors for pie chart - vibrant and distinct colors
const dynamicColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#C084FC",
  "#F9A8D4", "#FDBA8C", "#A3E635", "#FBBF24", "#60A5FA",
  "#34D399", "#F87171", "#F59E0B", "#8B5CF6", "#EC4899"
];


const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [showSavingsDashboard, setShowSavingsDashboard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [totalIncome, setTotalIncome] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [showIncomeManager, setShowIncomeManager] = useState(false);
  const [showCommunityForum, setShowCommunityForum] = useState(false);
  const [aiWidgetOpen, setAiWidgetOpen] = useState(false);
  const [activeAITab, setActiveAITab] = useState('tips');
  const [showFullAIDashboard, setShowFullAIDashboard] = useState(false);


  const [stats, setStats] = useState({
    totalExpenses: 0,
    categoryTotals: {},
  });

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Savings",
    "Other",
  ];

  // AI Insights Data - Dynamic based on user's actual data
  const aiInsights = {
    tips: [
      stats.totalExpenses > 0 && Object.keys(stats.categoryTotals).length > 0
        ? `Your ${Object.keys(stats.categoryTotals).sort((a, b) => stats.categoryTotals[b] - stats.categoryTotals[a])[0] || 'Food'} spending is your highest category. Consider budgeting ₹${Math.round(stats.totalExpenses * 0.15)}/week.`
        : "Start tracking your expenses to get personalized tips!",
      totalIncome - stats.totalExpenses >= totalIncome * 0.2
        ? "Excellent! You're maintaining a healthy savings rate of over 20%."
        : "Try the 50-30-20 rule: 50% needs, 30% wants, 20% savings.",
      expenses.length > 20 
        ? "You have many transactions. Consider consolidating small purchases to save time."
        : "Keep tracking your expenses regularly for better insights."
    ].filter(Boolean),
    alerts: [
      stats.totalExpenses > totalIncome * 0.7 && totalIncome > 0
        ? `You've spent ${((stats.totalExpenses / totalIncome) * 100).toFixed(0)}% of your income this month`
        : null,
      stats.totalExpenses > totalIncome && totalIncome > 0
        ? "⚠️ Warning: Expenses exceed income!"
        : null,
      expenses.length > 50 
        ? "High transaction volume detected this month" 
        : null
    ].filter(Boolean),
    health: {
      status: totalIncome - stats.totalExpenses > totalIncome * 0.2 
        ? "Excellent" 
        : totalIncome - stats.totalExpenses > 0 
        ? "Good" 
        : "Needs Attention",
      savingsRate: totalIncome > 0 
        ? (((totalIncome - stats.totalExpenses) / totalIncome) * 100).toFixed(0) 
        : 0,
      emoji: totalIncome - stats.totalExpenses > totalIncome * 0.2 
        ? "😊" 
        : totalIncome - stats.totalExpenses > 0 
        ? "😐" 
        : "😟"
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    const user = sessionStorage.getItem("user") || localStorage.getItem("user");

    if (!token || !user) {
      window.location.href = "/";
      return;
    }

    const parsedUser = JSON.parse(user);
    setUserData(parsedUser);
    fetchExpenses(parsedUser.id);
    fetchIncomes(parsedUser.id);
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, filterCategory]);

  const fetchExpenses = async (userId) => {
    const response = await fetch(`http://localhost:8080/api/expenses/user/${userId}`);
    const data = await response.json();
    setExpenses(Array.isArray(data) ? data : []);
    calculateStats(Array.isArray(data) ? data : []);
    calculateMonthlySpending(Array.isArray(data) ? data : []);
  };

  const fetchIncomes = async (userId) => {
    const response = await fetch(`http://localhost:8080/api/incomes/user/${userId}`);
    const data = await response.json();
    const total = data.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
    setTotalIncome(total);
  };

  const calculateStats = (expenseList) => {
    const total = expenseList.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    const categoryTotals = {};
    expenseList.forEach((exp) => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + parseFloat(exp.amount || 0);
    });

    setStats({ totalExpenses: total, categoryTotals });
  };

  // Calculate monthly spending for last 6 months
  const calculateMonthlySpending = (expenseList) => {
    const monthlyTotals = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get last 6 months
    const today = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[date.getMonth()]}`;
      
      last6Months.push({
        key: monthKey,
        label: monthLabel,
        amount: 0
      });
      monthlyTotals[monthKey] = 0;
    }

    // Calculate spending for each month
    expenseList.forEach((exp) => {
      if (exp.date) {
        const expDate = new Date(exp.date);
        const monthKey = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyTotals.hasOwnProperty(monthKey)) {
          monthlyTotals[monthKey] += parseFloat(exp.amount || 0);
        }
      }
    });

    // Map to chart data
    const chartData = last6Months.map(month => ({
      month: month.label,
      spending: parseFloat(monthlyTotals[month.key].toFixed(2))
    }));

    setMonthlyData(chartData);
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (filterCategory !== "All")
      filtered = filtered.filter((exp) => exp.category === filterCategory);

    if (searchTerm)
      filtered = filtered.filter((exp) =>
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    setFilteredExpenses(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await fetch(`http://localhost:8080/api/expenses/${id}`, { method: "DELETE" });
    fetchExpenses(userData.id);
  };

  const barData = [
    { name: "This Month", Income: totalIncome, Expenses: stats.totalExpenses },
  ];

  // Group by category for pie chart
  const pieData = Object.entries(stats.categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Custom label with percentage only
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };
  // Calculate current month spending and percentage change
  const currentMonthSpending = monthlyData.length > 0 
    ? parseFloat(monthlyData[monthlyData.length - 1].spending.toFixed(2))
    : 0;
  
  const previousMonthSpending = monthlyData.length > 1 
    ? parseFloat(monthlyData[monthlyData.length - 2].spending.toFixed(2))
    : 0;
  
  const percentageChange = previousMonthSpending > 0 
    ? (((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100).toFixed(0)
    : 0;

  // Handler for opening Full AI Dashboard
  const handleOpenFullAI = () => {
    console.log('Opening Full AI Dashboard'); // Debug log
    setAiWidgetOpen(false);
    setShowFullAIDashboard(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Budget AI</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-6">Welcome back, {userData?.username}!</h2>
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowIncomeManager(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold flex items-center gap-3 text-base"
          >
            <TrendingUp className="w-5 h-5" />
            Manage Income
          </button>
          <button
            onClick={() => setShowCommunityForum(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold flex items-center gap-3 text-base ml-4"
          >
            <MessageSquare className="w-5 h-5" />
            Community Forum
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SummaryCard Icon={TrendingUp} title="Income" value={totalIncome} color="green" />
          <SummaryCard Icon={TrendingDown} title="Expenses" value={stats.totalExpenses} color="red" />
          <SummaryCard Icon={IndianRupee} title="Balance" value={totalIncome - stats.totalExpenses} color="blue" />
          <SummaryCard Icon={PieIcon} title="Transactions" value={expenses.length} color="purple" />
        </div>

        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowSavingsDashboard(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
          >
            📊 View Savings Dashboard
          </button>
        </div>
        {showIncomeManager && userData && (
          <IncomeManager
            userId={userData.id}
            onClose={() => setShowIncomeManager(false)}
            onIncomeAdded={() => fetchIncomes(userData.id)}
          />
        )}

        {/* Monthly Spending Graph */}
        <div className="bg-white p-6 rounded-xl shadow-lg border mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">Monthly Spending</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-gray-900">₹{currentMonthSpending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <span className={`text-sm font-semibold px-2 py-1 rounded ${
                percentageChange >= 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
              }`}>
                {percentageChange >= 0 ? '+' : ''}{percentageChange}%
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Last 6 Months</p>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value) => [`₹${parseFloat(value).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Spending']}
              />
              <Line 
                type="monotone" 
                dataKey="spending" 
                stroke="#c29544"
                strokeWidth={2}
                dot={{ fill: '#c29544', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Income vs Expenses Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-xl font-bold mb-4">Income vs Expenses</h3>
            <ResponsiveContainer width="65%" height={300}>    
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => `₹${parseFloat(value).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                />
                <Bar
                  dataKey="Income"
                  fill="#16a34a"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="Expenses"
                  fill="#dc2626"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Spending Breakdown Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <h3 className="text-xl font-bold mb-4">Spending by Category</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={dynamicColors[index % dynamicColors.length]}
                        stroke="#ffffff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={50}
                    wrapperStyle={{ paddingTop: '15px' }}
                    formatter={(value, entry) => {
                      const percent = ((entry.payload.value / stats.totalExpenses) * 100).toFixed(1);
                      return (
                        <span style={{ color: '#374151', fontSize: '13px', fontWeight: 600 }}>
                          {value} ({percent}%)
                        </span>
                      );
                    }}
                    iconType="circle"
                    iconSize={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      padding: '8px 12px'
                    }}
                    formatter={(value, name) => {
                      const percent = ((value / stats.totalExpenses) * 100).toFixed(1);
                      return [`₹${parseFloat(value).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${percent}%)`, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-semibold">No expenses yet</p>
                <p className="text-sm mt-2">Add some expenses to see the breakdown</p>
              </div>
            )}
          </div>
        </div>

        <ExpenseList
          filteredExpenses={filteredExpenses}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setFilterCategory={setFilterCategory}
          handleDelete={handleDelete}
          categories={categories}
        />
      </main>

      {showSavingsDashboard && userData && (
        <SavingsDashboard 
          userId={userData.id} 
          onClose={() => setShowSavingsDashboard(false)} 
        />
      )}

      {showCommunityForum && userData && (
        <CommunityForum
          userData={userData}
          onClose={() => setShowCommunityForum(false)}
        />
      )}

      {showFullAIDashboard && userData && (
        <AIExpenseDashboard
          userData={userData}
          expenses={expenses}
          totalIncome={totalIncome}
          stats={stats}
          onClose={() => setShowFullAIDashboard(false)}
        />
      )}

      {/* FLOATING AI WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        {!aiWidgetOpen ? (
          <button
            onClick={() => setAiWidgetOpen(true)}
            className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 group"
          >
            <Sparkles className="w-8 h-8 animate-pulse" />
            {aiInsights.alerts.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                {aiInsights.alerts.length}
              </span>
            )}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              AI Insights Available
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-gray-900"></div>
            </div>
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-96 max-h-[600px] overflow-hidden border-2 border-purple-200 animate-slideIn">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI Assistant</h3>
                  <p className="text-xs text-blue-100">Smart Financial Insights</p>
                </div>
              </div>
              <button
                onClick={() => setAiWidgetOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b bg-gray-50">
              <WidgetTab
                active={activeAITab === 'tips'}
                onClick={() => setActiveAITab('tips')}
                icon={<Lightbulb className="w-4 h-4" />}
                label="Tips"
                badge={aiInsights.tips.length}
              />
              <WidgetTab
                active={activeAITab === 'alerts'}
                onClick={() => setActiveAITab('alerts')}
                icon={<AlertTriangle className="w-4 h-4" />}
                label="Alerts"
                badge={aiInsights.alerts.length}
              />
              <WidgetTab
                active={activeAITab === 'health'}
                onClick={() => setActiveAITab('health')}
                icon={<Activity className="w-4 h-4" />}
                label="Health"
              />
            </div>

            <div className="p-4 overflow-y-auto max-h-[420px]">
              {activeAITab === 'tips' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-gray-800">Smart Saving Tips</h4>
                  </div>
                  {aiInsights.tips.map((tip, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                      <div className="flex gap-3">
                        <span className="text-2xl">💡</span>
                        <p className="text-sm text-gray-700 flex-1">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeAITab === 'alerts' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h4 className="font-bold text-gray-800">Spending Alerts</h4>
                  </div>
                  {aiInsights.alerts.length > 0 ? (
                    <>
                      {aiInsights.alerts.map((alert, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                          <div className="flex gap-3">
                            <span className="text-2xl">⚠️</span>
                            <p className="text-sm text-gray-700 flex-1">{alert}</p>
                          </div>
                        </div>
                      ))}
                      {stats.totalExpenses > 0 && (
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Budget Used</span>
                            <span className="font-bold text-orange-900">
                              {totalIncome > 0 ? ((stats.totalExpenses / totalIncome) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all" 
                              style={{width: `${Math.min(100, totalIncome > 0 ? (stats.totalExpenses / totalIncome) * 100 : 0)}%`}}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-4xl mb-2 block">✅</span>
                      <p className="font-semibold">All Good!</p>
                      <p className="text-sm">No spending alerts</p>
                    </div>
                  )}
                </div>
              )}

              {activeAITab === 'health' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-gray-800">Financial Health</h4>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 text-center">
                    <span className="text-5xl mb-3 block">{aiInsights.health.emoji}</span>
                    <h3 className="text-2xl font-bold text-green-900 mb-1">{aiInsights.health.status}</h3>
                    <p className="text-sm text-gray-600">Your financial status</p>
                  </div>
                  <div className="bg-white border-2 border-green-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">Savings Rate</span>
                      <span className="text-xl font-bold text-green-600">{aiInsights.health.savingsRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all" 
                        style={{width: `${Math.min(100, Math.max(0, aiInsights.health.savingsRate))}%`}}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Target: 20% • {aiInsights.health.savingsRate >= 20 ? "Great job! 🎉" : "Keep going! 💪"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Monthly Income</span>
                      <span className="font-bold text-green-900">₹{totalIncome.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Total Expenses</span>
                      <span className="font-bold text-green-900">₹{stats.totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Net Savings</span>
                      <span className={`font-bold ${totalIncome - stats.totalExpenses >= 0 ? 'text-green-900' : 'text-red-600'}`}>
                        ₹{(totalIncome - stats.totalExpenses).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <button 
                onClick={handleOpenFullAI}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span>Open Full AI Dashboard</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const SummaryCard = ({ Icon, title, value, color }) => {
  const colorClasses = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600"
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (title === 'Transactions') return val; // Don't add decimal to transaction count
      return `₹${val.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    return val;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <Icon className={colorClasses[color]} size={24} />
        <span className="text-gray-600 text-sm font-medium">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]} mt-2`}>
        {formatValue(value)}
      </p>
    </div>
  );
};

const ExpenseList = ({
  filteredExpenses,
  searchTerm,
  setSearchTerm,
  setFilterCategory,
  handleDelete,
  categories,
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border">
    <h3 className="text-xl font-bold mb-4">Recent Expenses</h3>
    <div className="flex gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search expenses..."
          className="w-full pl-10 border-2 border-gray-200 p-2.5 rounded-lg focus:border-purple-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <select 
        className="border-2 border-gray-200 p-2.5 rounded-lg focus:border-purple-500 focus:outline-none font-medium" 
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="All">All Categories</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </div>

    <div className="max-h-96 overflow-y-auto">
      {filteredExpenses.length > 0 ? (
        filteredExpenses.map((expense) => (
          <div key={expense.id} className="flex justify-between items-center py-3 border-b hover:bg-gray-50 px-2 rounded transition-colors">
            <div>
              <span className="font-semibold text-gray-800">{expense.category}</span>
              <p className="text-gray-500 text-sm">{expense.description || 'No description'}</p>
              <p className="text-gray-400 text-xs">
                {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString("en-IN") : "-"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-red-600 font-bold text-lg">₹{parseFloat(expense.amount).toFixed(2)}</p>
              <button 
                onClick={() => handleDelete(expense.id)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="text-red-600" size={18} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-gray-500">
          <TrendingDown size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">No expenses found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  </div>
);

const WidgetTab = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-2 text-sm font-semibold transition-all flex items-center justify-center gap-1 relative ${
      active
        ? 'bg-white text-purple-600 border-b-2 border-purple-600'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

export default Dashboard;