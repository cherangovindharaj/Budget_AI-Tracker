import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Shield, IndianRupee, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import IncomeManager from './IncomeManager';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [showIncomeManager, setShowIncomeManager] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      fetchExpenses(parsedUser.id);
      fetchIncomes(parsedUser.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/');
    }
  }, [navigate]);

  const fetchExpenses = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/expenses/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
        setTotalExpenses(total);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchIncomes = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/incomes/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const total = data.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
        setTotalIncome(total);
      } else {
        console.error('Failed to fetch incomes:', response.status);
        setTotalIncome(0);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
      setTotalIncome(0);
    }
  };

  const handleIncomeUpdate = () => {
    if (userData?.id) {
      fetchIncomes(userData.id);
      fetchExpenses(userData.id);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-12 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-4xl font-bold text-white">
                    {userData.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {userData.username}
                  </h1>
                  <p className="text-purple-100">{userData.email}</p>
                </div>
              </div>
              <button
                onClick={() => alert('Edit profile feature coming soon!')}
                className="flex items-center gap-2 px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-semibold text-gray-900">{userData.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    USER
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
              <button
                onClick={() => setShowIncomeManager(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg hover:from-green-700 hover:to-emerald-600 transition font-medium"
              >
                <TrendingUp className="w-4 h-4" />
                Manage Income
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <IndianRupee className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-700">Total Income</span>
                </div>
                <h3 className="text-3xl font-bold text-green-600">
                  ₹{totalIncome.toFixed(2)}
                </h3>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-red-700">Total Expenses</span>
                </div>
                <h3 className="text-3xl font-bold text-red-600">
                  ₹{totalExpenses.toFixed(2)}
                </h3>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <IndianRupee className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">Balance</span>
                </div>
                <h3 className={`text-3xl font-bold ${
                  (totalIncome - totalExpenses) >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  ₹{(totalIncome - totalExpenses).toFixed(2)}
                </h3>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-semibold text-gray-900">{userData.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showIncomeManager && (
        <IncomeManager 
          userId={userData?.id} 
          onClose={() => setShowIncomeManager(false)}
          onIncomeAdded={handleIncomeUpdate}
        />
      )}
    </div>
  );
};

export default Profile;