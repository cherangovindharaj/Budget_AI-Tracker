import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import SavingGoalPage from "./components/SavingGoalPage";



import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import Transactions from './components/Transactions';
import BudgetPage from './components/BudgetPage';

import DashboardLayout from './layouts/DashboardLayout'; // ✅ Added

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && user) {
      setIsAuthenticated(true);
    }

    setLoading(false);

    const handleLogin = () => {
      setIsAuthenticated(true);
    };

    const handleLogout = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('userLoggedIn', handleLogin);
    window.addEventListener('userLoggedOut', handleLogout);

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
  <Routes>
    <Route 
      path="/" 
      element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage />} 
    />

    <Route 
      path="/dashboard" 
      element={isAuthenticated ? <DashboardLayout><Dashboard /></DashboardLayout> : <Navigate to="/" />} 
    />

    <Route 
      path="/expenses" 
      element={isAuthenticated ? <DashboardLayout><Transactions /></DashboardLayout> : <Navigate to="/" />} 
    />

    <Route 
      path="/budget" 
      element={isAuthenticated ? <DashboardLayout><BudgetPage /></DashboardLayout> : <Navigate to="/" />} 
    />

    <Route 
      path="/profile" 
      element={isAuthenticated ? <DashboardLayout><Profile /></DashboardLayout> : <Navigate to="/" />} 
    />
    <Route 
  path="/savings" 
  element={isAuthenticated ? <DashboardLayout><SavingGoalPage /></DashboardLayout> : <Navigate to="/" />}
/>


    <Route 
      path="/admin-dashboard" 
      element={isAuthenticated ? <DashboardLayout><AdminDashboard /></DashboardLayout> : <Navigate to="/" />} 
    />

    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

  
}

export default App;
