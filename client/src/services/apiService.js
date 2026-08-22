import {
  MOCK_USER,
  MOCK_TRIPS,
  MOCK_RECOMMENDED_DESTINATIONS,
  MOCK_BUDGET_SUMMARY,
  MOCK_ACTIVITIES
} from './mockData';

// Simulated delay helper
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // Auth Services
  login: async (email, password) => {
    await delay(600);
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }
    if (email.includes('error')) {
      throw new Error('Invalid credentials. Please verify your email and password.');
    }
    const token = 'mock_jwt_token_' + Date.now();
    const user = { ...MOCK_USER, email };
    localStorage.setItem('gt_auth_token', token);
    localStorage.setItem('gt_user', JSON.stringify(user));
    return { token, user };
  },

  signup: async ({ name, email, password }) => {
    await delay(700);
    if (!name || !email || !password) {
      throw new Error('All required fields must be completed.');
    }
    const token = 'mock_jwt_token_' + Date.now();
    const user = {
      id: 'usr_' + Math.floor(Math.random() * 1000),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      role: 'Explorer Member',
      location: 'New Member',
      joinedDate: 'Just now',
    };
    localStorage.setItem('gt_auth_token', token);
    localStorage.setItem('gt_user', JSON.stringify(user));
    return { token, user };
  },

  forgotPassword: async (email) => {
    await delay(500);
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }
    return { success: true, message: `Password reset link sent to ${email}` };
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem('gt_auth_token');
    localStorage.removeItem('gt_user');
    return { success: true };
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('gt_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return MOCK_USER;
      }
    }
    return MOCK_USER;
  },

  // Trips & Dashboard Services
  getDashboardData: async () => {
    await delay(500);
    const user = apiService.getCurrentUser();
    return {
      user,
      trips: MOCK_TRIPS,
      recommendedDestinations: MOCK_RECOMMENDED_DESTINATIONS,
      budgetSummary: MOCK_BUDGET_SUMMARY,
      recentActivities: MOCK_ACTIVITIES,
    };
  },

  getTrips: async () => {
    await delay(400);
    return MOCK_TRIPS;
  },

  getTripById: async (tripId) => {
    await delay(300);
    const trip = MOCK_TRIPS.find((t) => t.id === tripId) || MOCK_TRIPS[0];
    return trip;
  },

  createTrip: async (tripData) => {
    await delay(600);
    const newTrip = {
      id: 'trip_' + Date.now(),
      title: tripData.title || 'New Adventure',
      subtitle: tripData.subtitle || 'Multi-city Trip',
      citiesCount: tripData.citiesCount || 1,
      durationDays: tripData.durationDays || 7,
      startDate: tripData.startDate || '2026-11-01',
      endDate: tripData.endDate || '2026-11-08',
      coverImage: tripData.coverImage || MOCK_TRIPS[0].coverImage,
      status: 'Planning',
      statusVariant: 'warning',
      budgetTotal: Number(tripData.budgetTotal) || 3000,
      budgetSpent: 0,
      destinations: tripData.destinations || ['Tokyo'],
      collaboratorsCount: 1,
      progressPercentage: 10,
    };
    MOCK_TRIPS.unshift(newTrip);
    return newTrip;
  },

  getDestinations: async () => {
    await delay(300);
    return MOCK_RECOMMENDED_DESTINATIONS;
  },
};
