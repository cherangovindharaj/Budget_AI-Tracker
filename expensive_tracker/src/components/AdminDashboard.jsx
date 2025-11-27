import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, TrendingUp, Shield, LogOut, Trash2, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [users, setUsers] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setAdminData(JSON.parse(user));
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all users
      const usersRes = await fetch('http://localhost:8080/api/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // Fetch all expenses (you need to modify backend to support this)
      // For now, we'll just count transactions per user
      let totalTransactions = 0;
      let totalAmount = 0;

      for (const user of users) {
        try {
          const expensesRes = await fetch(`http://localhost:8080/api/expenses/user/${user.id}`);
          if (expensesRes.ok) {
            const expenses = await expensesRes.json();
            totalTransactions += expenses.length;
            totalAmount += expenses.reduce((sum, e) => sum + e.amount, 0);
          }
        } catch (err) {
          console.error('Error fetching expenses:', err);
        }
      }

      setStats({
        totalUsers: users.length,
        totalTransactions,
        totalAmount
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('User deleted successfully');
        fetchAllData();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-white text-opacity-90">Budget AI Management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <UserIcon className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">
                  {adminData?.username || 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-opacity-90 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Admin!
          </h2>
          <p className="text-gray-600">Manage users and monitor system activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-gray-600">Total Users</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalTransactions}</h3>
            <p className="text-sm text-gray-600">Total Transactions</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <IndianRupee className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              ₹{stats.totalAmount.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Total Amount</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-500">
            <h3 className="text-xl font-bold text-white">User Management</h3>
            <p className="text-sm text-white text-opacity-90">View and manage all registered users</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Username</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className={`border-b hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 text-sm text-gray-900">{user.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;