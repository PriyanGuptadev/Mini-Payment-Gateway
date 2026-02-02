import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantService, transactionService } from '../services/merchant.service';
import { useAuthStore } from '../store/authStore';

interface Merchant {
  _id: string;
  business_name: string;
  api_key: string;
  status: string;
}

interface Stats {
  total_transactions: number;
  completed_transactions: number;
  failed_transactions: number;
  total_amount: number;
  success_rate: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateMerchant, setShowCreateMerchant] = useState(false);
  const [formData, setFormData] = useState({ business_name: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      loadDashboard();
    }
  }, [user, navigate]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const merchantData = await merchantService.getMerchant();
      setMerchant(merchantData);
      
      const statsResponse = await merchantService.getStats();
      setStats(statsResponse.stats || statsResponse);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setShowCreateMerchant(true);
      } else {
        setError(err.response?.data?.error || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMerchant = await merchantService.createMerchant({
        business_name: formData.business_name,
      });
      setMerchant(newMerchant);
      setShowCreateMerchant(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create merchant');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showCreateMerchant ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Merchant Account</h2>
            <form onSubmit={handleCreateMerchant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Your Business Name"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Merchant Account
              </button>
            </form>
          </div>
        ) : merchant ? (
          <>
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Total Transactions</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_transactions || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed_transactions || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Failed</h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed_transactions || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {stats.success_rate != null && !isNaN(stats.success_rate) 
                      ? stats.success_rate.toFixed(1) + '%' 
                      : '0.0%'}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Merchant Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <p className="text-gray-900">{merchant.business_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-4 py-2 bg-gray-100 rounded text-sm font-mono">
                      {merchant.api_key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(merchant.api_key)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    merchant.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {merchant.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/transactions')}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Transactions
              </button>
              <button
                onClick={() => navigate('/checkout')}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Checkout
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};


