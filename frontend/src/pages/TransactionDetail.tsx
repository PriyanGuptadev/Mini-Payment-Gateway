import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionService } from '../services/merchant.service';
import { useAuthStore } from '../store/authStore';

interface TransactionDetail {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  customer_email: string;
  reference_id: string;
  signature: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export const TransactionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (id) {
      loadTransaction();
    }
  }, [user, navigate, id]);

  const loadTransaction = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await transactionService.getTransaction(id);
      setTransaction(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/transactions')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Transactions
            </button>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </main>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/transactions')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Transactions
            </button>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">Transaction not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/transactions')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Transactions
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
          <div></div>
        </div>
      </nav>

      {}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {}
          <div className={`px-6 py-4 border-b ${getStatusColor(transaction.status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Transaction Status</h2>
                <p className="text-sm mt-1">
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(transaction.status)}`}>
                {transaction.status.toUpperCase()}
              </span>
            </div>
          </div>

          {}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Reference ID
                  </label>
                  <p className="text-lg font-mono text-gray-900">{transaction.reference_id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-sm font-mono text-gray-600 break-all">{transaction._id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Amount
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Customer Email
                  </label>
                  <p className="text-lg text-gray-900">{transaction.customer_email}</p>
                </div>
              </div>

              {}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Created At
                  </label>
                  <p className="text-lg text-gray-900">{formatDate(transaction.createdAt)}</p>
                </div>

                {transaction.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Last Updated
                    </label>
                    <p className="text-lg text-gray-900">{formatDate(transaction.updatedAt)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Signature
                  </label>
                  <p className="text-xs font-mono text-gray-600 break-all bg-gray-50 p-2 rounded">
                    {transaction.signature}
                  </p>
                </div>
              </div>
            </div>

            {}
            {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(transaction.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {}
            <div className="mt-8 pt-6 border-t flex gap-4">
              <button
                onClick={() => navigate('/transactions')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Back to List
              </button>
              {transaction.status === 'pending' && (
                <button
                  onClick={() => navigate('/checkout')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Process Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
