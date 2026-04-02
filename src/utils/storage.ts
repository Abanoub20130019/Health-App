import type { User } from '../types';

const STORAGE_KEYS = {
  USER: 'vitality_user',
  LAST_SYNC: 'vitality_last_sync',
  OFFLINE_QUEUE: 'vitality_offline_queue',
  SETTINGS: 'vitality_settings',
};

export const storage = {
  // User
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Last sync
  getLastSync: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  },
  setLastSync: (date: string) => {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, date);
  },

  // Offline queue
  getOfflineQueue: (): unknown[] => {
    const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return data ? JSON.parse(data) : [];
  },
  addToOfflineQueue: (action: Record<string, unknown>) => {
    const queue = storage.getOfflineQueue();
    queue.push({ ...action, timestamp: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },
  clearOfflineQueue: () => {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  },

  // Settings
  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      fastingWindow: '16:8',
      stepGoal: 10000,
      waterGoal: 2500,
      sleepGoal: 8,
      darkMode: false,
      notifications: true,
    };
  },
  setSettings: (settings: unknown) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
};
