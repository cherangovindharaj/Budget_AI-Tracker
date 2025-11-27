import React, { useState } from 'react';
import { Eye, EyeOff, Wallet, TrendingUp, PiggyBank, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setMessage({ type: 'error', text: 'Please fill in all fields' });
        setLoading(false);
        return;
      }
    } else {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Please fill in all fields' });
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' });
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        
        // ✅ CHANGE: Save to sessionStorage instead of localStorage
        if (data.token) {
          sessionStorage.setItem('authToken', data.token);
        }
        if (data.user) {
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // ✅ CHANGE: Trigger custom event for App.jsx
        window.dispatchEvent(new Event('userLoggedIn'));
        
        // Clear form
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'An error occurred' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not connect to server. Please check your backend is running on port 8080.' });
      console.error('Connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300 opacity-10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1 text-white space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg p-3 rounded-2xl">
              <Wallet className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold">Budget AI</h1>
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
            Smart Expense Tracking Made Simple
          </h2>
          
          <p className="text-lg text-white text-opacity-90">
            Track expenses, set budgets, and get AI-powered insights to achieve your financial goals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4">
              <TrendingUp className="w-8 h-8 mb-2 mx-auto lg:mx-0" />
              <h3 className="font-semibold">Real-time Analytics</h3>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4">
              <PiggyBank className="w-8 h-8 mb-2 mx-auto lg:mx-0" />
              <h3 className="font-semibold">Smart Budgeting</h3>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-4">
              <BarChart3 className="w-8 h-8 mb-2 mx-auto lg:mx-0" />
              <h3 className="font-semibold">AI Insights</h3>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[450px]">
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h3>
              <p className="text-gray-500 mt-2">
                {isLogin ? 'Login to manage your expenses' : 'Start your financial journey today'}
              </p>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="Enter your username"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <button type="button" className="text-purple-600 hover:text-purple-700 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
              </button>
            </form>

            <div className="text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;