
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../../data/mock-db.json');

interface MockDatabase {
  users: Record<string, any>;
  merchants: Record<string, any>;
  transactions: Record<string, any>;
}

let mockDb: MockDatabase = {
  users: {},
  merchants: {},
  transactions: {},
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      mockDb = JSON.parse(data);
    }
  } catch (error) {
  }
}

function saveData() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(mockDb, null, 2));
  } catch (error) {
  }
}

loadData();

export const mockMongoDb = {
  createUser: (id: string, data: any) => {
    mockDb.users[id] = { _id: id, ...data, createdAt: new Date() };
    saveData();
    return mockDb.users[id];
  },

  findUser: (id: string) => {
    return mockDb.users[id] || null;
  },

  updateUser: (id: string, data: any) => {
    if (mockDb.users[id]) {
      mockDb.users[id] = { ...mockDb.users[id], ...data, updatedAt: new Date() };
      saveData();
    }
    return mockDb.users[id] || null;
  },

  createMerchant: (id: string, data: any) => {
    mockDb.merchants[id] = { _id: id, ...data, createdAt: new Date() };
    saveData();
    return mockDb.merchants[id];
  },

  findMerchant: (id: string) => {
    return mockDb.merchants[id] || null;
  },

  findMerchantByApiKey: (apiKey: string) => {
    return Object.values(mockDb.merchants).find((m: any) => m.apiKey === apiKey) || null;
  },

  updateMerchant: (id: string, data: any) => {
    if (mockDb.merchants[id]) {
      mockDb.merchants[id] = { ...mockDb.merchants[id], ...data, updatedAt: new Date() };
      saveData();
    }
    return mockDb.merchants[id] || null;
  },

  createTransaction: (id: string, data: any) => {
    mockDb.transactions[id] = { _id: id, ...data, createdAt: new Date() };
    saveData();
    return mockDb.transactions[id];
  },

  findTransaction: (id: string) => {
    return mockDb.transactions[id] || null;
  },

  findTransactionsByMerchant: (merchantId: string) => {
    return Object.values(mockDb.transactions).filter((t: any) => t.merchantId === merchantId) || [];
  },

  updateTransaction: (id: string, data: any) => {
    if (mockDb.transactions[id]) {
      mockDb.transactions[id] = { ...mockDb.transactions[id], ...data, updatedAt: new Date() };
      saveData();
    }
    return mockDb.transactions[id] || null;
  },

  getAllUsers: () => Object.values(mockDb.users),
  getAllMerchants: () => Object.values(mockDb.merchants),
  getAllTransactions: () => Object.values(mockDb.transactions),

  clearAll: () => {
    mockDb = { users: {}, merchants: {}, transactions: {} };
    saveData();
  },

  getStats: () => ({
    users: Object.keys(mockDb.users).length,
    merchants: Object.keys(mockDb.merchants).length,
    transactions: Object.keys(mockDb.transactions).length,
    dataFile: DATA_FILE,
  }),
};

export default mockMongoDb;
