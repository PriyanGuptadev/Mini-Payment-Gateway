import apiClient from './api';

export interface Merchant {
  _id: string;
  business_name: string;
  api_key: string;
  status: string;
  webhook_url?: string;
}

export interface Transaction {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  customer_email: string;
  reference_id: string;
  created_at: string;
}

export const merchantService = {
  createMerchant: async (data: { business_name: string; webhook_url?: string }) => {
    const response = await apiClient.post<Merchant>('/merchants', data);
    return response.data;
  },

  getMerchant: async () => {
    const response = await apiClient.get<Merchant>('/merchants');
    return response.data;
  },

  rotateCredentials: async () => {
    const response = await apiClient.post('/merchants/rotate-credentials', {});
    return response.data;
  },

  updateWebhook: async (webhookUrl: string) => {
    const response = await apiClient.put('/merchants/webhook', {
      webhook_url: webhookUrl,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/merchants/stats');
    return response.data;
  },
};

export const transactionService = {
  createCheckout: async (data: {
    amount: number;
    currency: string;
    customer_email: string;
    metadata?: Record<string, any>;
  }) => {
    const response = await apiClient.post('/transactions/checkout', data);
    return response.data;
  },

  processPayment: async (transactionId: string) => {
    const response = await apiClient.post('/transactions/pay', {
      transaction_id: transactionId,
    });
    return response.data;
  },

  getHistory: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: string;
    maxAmount?: string;
    limit?: number;
    skip?: number;
  }) => {
    const response = await apiClient.get('/transactions/history', { params });
    return response.data;
  },

  getTransaction: async (transactionId: string) => {
    const response = await apiClient.get(`/transactions/${transactionId}`);
    return response.data;
  },

  getSummary: async () => {
    const response = await apiClient.get('/transactions/summary');
    return response.data;
  },
};

export default {
  merchantService,
  transactionService,
};
