const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==================== FASTING ====================
export const fastingAPI = {
  getActive: (userId: string) => fetchAPI(`/fasting/active?userId=${userId}`),
  getHistory: (userId: string, limit = 30) => 
    fetchAPI(`/fasting/history?userId=${userId}&limit=${limit}`),
  start: (data: { userId: string; windowType: string; targetHours: number }) =>
    fetchAPI('/fasting/start', { method: 'POST', body: JSON.stringify(data) }),
  end: (fastingId: string, data: { hungerLevel?: number; energyLevel?: number; notes?: string }) =>
    fetchAPI(`/fasting/end/${fastingId}`, { method: 'POST', body: JSON.stringify(data) }),
  getStats: (userId: string) => fetchAPI(`/fasting/stats?userId=${userId}`),
};

// ==================== AVOIDANCES ====================
export const avoidanceAPI = {
  getByDate: (userId: string, date: string) =>
    fetchAPI(`/avoidances?userId=${userId}&date=${date}`),
  toggle: (data: { userId: string; date: string; type: string; avoided: boolean; customName?: string }) =>
    fetchAPI('/avoidances/toggle', { method: 'POST', body: JSON.stringify(data) }),
  getStats: (userId: string) => fetchAPI(`/avoidances/stats?userId=${userId}`),
};

// ==================== WALKING ====================
export const walkingAPI = {
  getByDate: (userId: string, date: string) =>
    fetchAPI(`/walking?userId=${userId}&date=${date}`),
  update: (data: { userId: string; date: string; [key: string]: unknown }) =>
    fetchAPI('/walking', { method: 'POST', body: JSON.stringify(data) }),
  getStats: (userId: string) => fetchAPI(`/walking/stats?userId=${userId}`),
};

// ==================== EXERCISE ====================
export const exerciseAPI = {
  getByDate: (userId: string, date: string) =>
    fetchAPI(`/exercise?userId=${userId}&date=${date}`),
  add: (data: { userId: string; [key: string]: unknown }) =>
    fetchAPI('/exercise', { method: 'POST', body: JSON.stringify(data) }),
  delete: (sessionId: string) =>
    fetchAPI(`/exercise/${sessionId}`, { method: 'DELETE' }),
  getStats: (userId: string) => fetchAPI(`/exercise/stats?userId=${userId}`),
};

// ==================== HYDRATION ====================
export const hydrationAPI = {
  getByDate: (userId: string, date: string) =>
    fetchAPI(`/hydration?userId=${userId}&date=${date}`),
  addEntry: (data: { userId: string; date: string; amount: number; type: string; time: string }) =>
    fetchAPI('/hydration/entry', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: { userId: string; date: string; [key: string]: unknown }) =>
    fetchAPI('/hydration', { method: 'POST', body: JSON.stringify(data) }),
};

// ==================== SLEEP ====================
export const sleepAPI = {
  getByDate: (userId: string, date: string) =>
    fetchAPI(`/sleep?userId=${userId}&date=${date}`),
  add: (data: { userId: string; [key: string]: unknown }) =>
    fetchAPI('/sleep', { method: 'POST', body: JSON.stringify(data) }),
  getStats: (userId: string) => fetchAPI(`/sleep/stats?userId=${userId}`),
};

// ==================== MINDFUL EATING ====================
export const mindfulEatingAPI = {
  getByDate: (userId: string, date: string) =>
    fetchAPI(`/mindful-eating?userId=${userId}&date=${date}`),
  update: (data: { userId: string; date: string; [key: string]: unknown }) =>
    fetchAPI('/mindful-eating', { method: 'POST', body: JSON.stringify(data) }),
};

// ==================== PROGRESS ====================
export const progressAPI = {
  getByDate: (userId: string, date: string) =>
    fetchAPI(`/progress?userId=${userId}&date=${date}`),
  update: (data: { userId: string; date: string; [key: string]: unknown }) =>
    fetchAPI('/progress', { method: 'POST', body: JSON.stringify(data) }),
  getHistory: (userId: string, limit = 90) =>
    fetchAPI(`/progress/history?userId=${userId}&limit=${limit}`),
};

// ==================== CHECK-IN ====================
export const checkInAPI = {
  getByDate: (userId: string, date: string) =>
    fetchAPI(`/checkin?userId=${userId}&date=${date}`),
  save: (data: { userId: string; date: string; [key: string]: unknown }) =>
    fetchAPI('/checkin', { method: 'POST', body: JSON.stringify(data) }),
  getWeekly: (userId: string, weekStart: string) =>
    fetchAPI(`/checkin/weekly?userId=${userId}&weekStart=${weekStart}`),
  getMonthlyGoals: (userId: string, month: string) =>
    fetchAPI(`/checkin/goals?userId=${userId}&month=${month}`),
  saveGoals: (data: { userId: string; month: string; goals: unknown[] }) =>
    fetchAPI('/checkin/goals', { method: 'POST', body: JSON.stringify(data) }),
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
  getDailySummary: (userId: string, date: string) =>
    fetchAPI(`/dashboard/daily?userId=${userId}&date=${date}`),
  getWeeklySummary: (userId: string, weekStart: string) =>
    fetchAPI(`/dashboard/weekly?userId=${userId}&weekStart=${weekStart}`),
};

// ==================== USER ====================
export const userAPI = {
  getOrCreate: (email: string, name: string) =>
    fetchAPI('/user', { method: 'POST', body: JSON.stringify({ email, name }) }),
  get: (userId: string) => fetchAPI(`/user/${userId}`),
};
