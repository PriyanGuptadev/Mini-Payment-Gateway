import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantService } from '../services/merchant.service';
import { useAuthStore } from '../store/authStore';

export const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [webhook, setWebhook] = useState('');
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleRotateCredentials = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await merchantService.rotateCredentials();
      setSuccess(`API credentials rotated successfully! New API Key: ${response.merchant?.api_key || 'N/A'}. Please update your application with the new credentials immediately.`);
      setShowRotateConfirm(false);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to rotate credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await merchantService.updateWebhook(webhook);
      setSuccess('Webhook URL updated successfully');
      setWebhook('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">API Credentials</h2>
          <p className="text-gray-600 mb-4">
            Rotate your API credentials periodically for enhanced security. Your old credentials will no longer work after rotation.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> After rotating credentials, you'll need to update them in your application immediately. The old credentials will stop working.
            </p>
          </div>

          {showRotateConfirm ? (
            <div className="space-y-4">
              <p className="text-gray-900 font-semibold">Are you sure you want to rotate your API credentials?</p>
              <div className="flex space-x-4">
                <button
                  onClick={handleRotateCredentials}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                >
                  {loading ? 'Rotating...' : 'Yes, Rotate'}
                </button>
                <button
                  onClick={() => setShowRotateConfirm(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowRotateConfirm(true)}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Rotate Credentials
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhook Configuration</h2>
          <p className="text-gray-600 mb-4">
            Configure your webhook URL to receive transaction status updates. We'll send POST requests to this URL when transaction status changes.
          </p>

          <form onSubmit={handleUpdateWebhook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
              <input
                type="url"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="https://your-domain.com/webhook"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter a valid HTTPS URL where you want to receive webhook notifications.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Update Webhook URL'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
