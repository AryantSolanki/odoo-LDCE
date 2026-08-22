import {
  MOCK_USER,
  INITIAL_TRIPS,
  MOCK_CITIES,
  MOCK_MASTER_ACTIVITIES,
  MOCK_RECOMMENDED_DESTINATIONS,
  MOCK_BUDGET_SUMMARY,
  MOCK_ACTIVITIES,
  MOCK_SAVED_DESTINATIONS,
  DEFAULT_COVER_IMAGES,
} from './mockData';

const STORAGE_KEY_TRIPS = 'globetrotter_trips_data';
const STORAGE_KEY_SAVED_DESTINATIONS = 'globetrotter_saved_destinations';
const STORAGE_KEY_USER = 'gt_user';

// Helper to initialize and retrieve persisted trips
const getStoredTrips = () => {
  const data = localStorage.getItem(STORAGE_KEY_TRIPS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(INITIAL_TRIPS));
    return INITIAL_TRIPS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_TRIPS;
  }
};

const saveStoredTrips = (trips) => {
  localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
};

const getStoredSavedDestinations = () => {
  const data = localStorage.getItem(STORAGE_KEY_SAVED_DESTINATIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_SAVED_DESTINATIONS, JSON.stringify(MOCK_SAVED_DESTINATIONS));
    return MOCK_SAVED_DESTINATIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return MOCK_SAVED_DESTINATIONS;
  }
};

const saveStoredSavedDestinations = (list) => {
  localStorage.setItem(STORAGE_KEY_SAVED_DESTINATIONS, JSON.stringify(list));
};

const STORAGE_KEY_REGISTERED_USERS = 'gt_registered_users';

const DEFAULT_REGISTERED_USERS = [
  {
    id: 'usr_demo',
    email: 'demo@globetrotter.com',
    password: 'password123',
    name: 'Alex Morgan',
    role: 'user',
    roleLabel: 'Explorer Member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    location: 'San Francisco, CA',
    joinedDate: 'March 2024',
    preferredCurrency: 'USD',
    language: 'English',
  },
  {
    id: 'usr_admin',
    email: 'admin@globetrotter.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin',
    roleLabel: 'System Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    location: 'Global HQ',
    joinedDate: 'Jan 2024',
    preferredCurrency: 'USD',
    language: 'English',
  },
];

const getRegisteredUsers = () => {
  const data = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(DEFAULT_REGISTERED_USERS));
    return DEFAULT_REGISTERED_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_REGISTERED_USERS;
  }
};

const saveRegisteredUsers = (users) => {
  localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const API_BASE_URL = 'http://127.0.0.1:8000';

export const apiService = {
  // ==========================================
  // Auth & User Services
  // ==========================================
  login: async (email, password) => {
    await delay(300);
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try FastAPI Backend authentication first
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const isAdmin = data.user?.email?.toLowerCase().includes('admin');
        const userObj = {
          id: data.user.id,
          name: data.user.full_name,
          email: data.user.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.user.full_name)}`,
          role: isAdmin ? 'admin' : 'user',
          roleLabel: isAdmin ? 'System Administrator' : 'Explorer Member',
        };
        localStorage.setItem('gt_auth_token', data.access_token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userObj));
        return { token: data.access_token, user: userObj };
      } else if (response.status === 401 || response.status === 400 || response.status === 422) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Incorrect email or password. Access denied.');
      }
    } catch (err) {
      if (err.message && (err.message.includes('Incorrect email') || err.message.includes('Access denied'))) {
        throw err;
      }
      // Backend offline fallback -> check local registered users database
    }

    // 2. Standalone registered user database verification
    const registeredUsers = getRegisteredUsers();
    const foundUser = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      throw new Error(`No account found with email "${email}". Please check your email or sign up.`);
    }

    if (foundUser.password !== password) {
      throw new Error('Incorrect password. Please verify your password and try again.');
    }

    const token = 'gt_jwt_token_' + Date.now();
    const user = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      avatar: foundUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(foundUser.name)}`,
      role: foundUser.role,
      roleLabel: foundUser.roleLabel,
      location: foundUser.location || 'Explorer Member',
      joinedDate: foundUser.joinedDate || 'Member',
      preferredCurrency: foundUser.preferredCurrency || 'USD',
      language: foundUser.language || 'English',
    };

    localStorage.setItem('gt_auth_token', token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { token, user };
  },

  signup: async ({ name, email, password }) => {
    await delay(300);
    if (!name || !email || !password) {
      throw new Error('All required fields (Name, Email, Password) must be filled.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered in local database
    const registeredUsers = getRegisteredUsers();
    const existingLocal = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingLocal) {
      throw new Error(`An account with email "${email}" already exists. Please log in instead.`);
    }

    // Try FastAPI Backend Registration
    let backendUser = null;
    let backendToken = null;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email: cleanEmail, password }),
      });

      if (response.ok) {
        const data = await response.json();
        backendToken = data.access_token;
        backendUser = data.user;
      } else if (response.status === 400 || response.status === 422) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'A user with this email already exists.');
      }
    } catch (err) {
      if (err.message && err.message.includes('already exists')) {
        throw err;
      }
    }

    // Register user in local database
    const isAdmin = cleanEmail.includes('admin');
    const newUserRecord = {
      id: backendUser ? backendUser.id : 'usr_' + Date.now(),
      email: cleanEmail,
      password: password,
      name: name,
      role: isAdmin ? 'admin' : 'user',
      roleLabel: isAdmin ? 'System Administrator' : 'Explorer Member',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      joinedDate: 'Just now',
      preferredCurrency: 'USD',
      language: 'English',
    };

    registeredUsers.push(newUserRecord);
    saveRegisteredUsers(registeredUsers);

    const token = backendToken || ('gt_jwt_token_' + Date.now());
    const user = {
      id: newUserRecord.id,
      name: newUserRecord.name,
      email: newUserRecord.email,
      avatar: newUserRecord.avatar,
      role: newUserRecord.role,
      roleLabel: newUserRecord.roleLabel,
      location: 'New Member',
      joinedDate: 'Just now',
      preferredCurrency: 'USD',
      language: 'English',
    };

    localStorage.setItem('gt_auth_token', token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { token, user };
  },

  forgotPassword: async (email) => {
    await delay(300);
    if (!email || !email.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }
    return { success: true, message: `Password reset link sent to ${email}` };
  },

  logout: async () => {
    await delay(150);
    localStorage.removeItem('gt_auth_token');
    localStorage.removeItem(STORAGE_KEY_USER);
    return { success: true };
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('gt_auth_token');
    if (!token) return null; // Unauthenticated

    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return MOCK_USER;
      }
    }
    return MOCK_USER;
  },

  updateUserProfile: async (updatedData) => {
    await delay(300);
    const currentUser = apiService.getCurrentUser();
    const updated = { ...currentUser, ...updatedData };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    return updated;
  },

  deleteAccount: async () => {
    await delay(400);
    localStorage.removeItem('gt_auth_token');
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TRIPS);
    localStorage.removeItem(STORAGE_KEY_SAVED_DESTINATIONS);
    return { success: true };
  },

  // ==========================================
  // Trips Core Services
  // ==========================================
  getDashboardData: async () => {
    await delay(300);
    const user = apiService.getCurrentUser();
    const trips = getStoredTrips();
    
    let totalAllocated = 0;
    let totalSpent = 0;
    trips.forEach(t => {
      totalAllocated += (t.budgetTotal || 0);
      totalSpent += (t.budgetSpent || 0);
    });

    const budgetSummary = {
      totalAllocated: totalAllocated || 5000,
      totalSpent: totalSpent || 0,
      categories: [
        { name: 'Flights & Transport', amount: totalSpent * 0.4, percentage: 40, color: '#3b82f6' },
        { name: 'Accommodation', amount: totalSpent * 0.35, percentage: 35, color: '#10b981' },
        { name: 'Activities & Dining', amount: totalSpent * 0.25, percentage: 25, color: '#f59e0b' }
      ]
    };

    return {
      user,
      trips,
      recommendedDestinations: MOCK_RECOMMENDED_DESTINATIONS,
      budgetSummary,
      recentActivities: MOCK_ACTIVITIES,
    };
  },

  getTrips: async () => {
    await delay(250);
    return getStoredTrips();
  },

  getTripById: async (tripId) => {
    await delay(200);
    const trips = getStoredTrips();
    const cleanId = String(tripId).trim();
    const trip = trips.find(
      (t) => String(t.id).trim() === cleanId || String(t.publicId).trim() === cleanId
    );
    if (!trip) {
      return trips[0];
    }
    return trip;
  },

  createTrip: async (tripData) => {
    await delay(400);
    const trips = getStoredTrips();

    const destinations = tripData.destinations || [];
    const coverImg =
      tripData.coverImage ||
      DEFAULT_COVER_IMAGES[Math.floor(Math.random() * DEFAULT_COVER_IMAGES.length)].url;

    const newTrip = {
      id: 'trip_' + Date.now(),
      publicId: 'gt_pub_' + Math.random().toString(36).substring(2, 10),
      title: tripData.title || 'New Adventure',
      description: tripData.description || '',
      subtitle: destinations.length > 0 ? destinations.join(' • ') : 'Multi-city Route',
      citiesCount: destinations.length,
      durationDays: tripData.durationDays || 7,
      startDate: tripData.startDate || '2026-10-15',
      endDate: tripData.endDate || '2026-10-22',
      coverImage: coverImg,
      status: 'Planning',
      statusVariant: 'warning',
      budgetTotal: Number(tripData.budgetTotal) || 3000,
      budgetSpent: 0,
      destinations: destinations,
      collaboratorsCount: 1,
      progressPercentage: 15,
      isPublic: false,
      stops: tripData.stops || [],
      expenses: [],
    };

    trips.unshift(newTrip);
    saveStoredTrips(trips);
    return newTrip;
  },

  updateTrip: async (tripId, updatedData) => {
    await delay(250);
    const trips = getStoredTrips();
    const index = trips.findIndex((t) => String(t.id) === String(tripId));
    if (index === -1) throw new Error('Trip not found.');

    const currentTrip = trips[index];
    const updatedTrip = {
      ...currentTrip,
      ...updatedData,
      subtitle: updatedData.destinations
        ? updatedData.destinations.join(' • ')
        : currentTrip.destinations.join(' • '),
      citiesCount: updatedData.destinations
        ? updatedData.destinations.length
        : currentTrip.citiesCount,
    };

    trips[index] = updatedTrip;
    saveStoredTrips(trips);
    return updatedTrip;
  },

  deleteTrip: async (tripId) => {
    await delay(250);
    let trips = getStoredTrips();
    trips = trips.filter((t) => String(t.id) !== String(tripId));
    saveStoredTrips(trips);
    return { success: true, tripId };
  },

  // ==========================================
  // Stops Management
  // ==========================================
  addStop: async (tripId, stopData) => {
    await delay(250);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    if (!trip.stops) trip.stops = [];

    const newStop = {
      id: 'stop_' + Date.now(),
      cityName: stopData.cityName,
      country: stopData.country || '',
      startDate: stopData.startDate || trip.startDate,
      endDate: stopData.endDate || trip.endDate,
      orderIndex: trip.stops.length,
      transportMode: stopData.transportMode || 'Flight',
      transportCost: Number(stopData.transportCost) || 0,
      stayCostPerNight: Number(stopData.stayCostPerNight) || 0,
      notes: stopData.notes || '',
      activities: [],
    };

    trip.stops.push(newStop);

    if (!trip.destinations.includes(stopData.cityName)) {
      trip.destinations.push(stopData.cityName);
    }
    trip.citiesCount = trip.destinations.length;
    trip.subtitle = trip.destinations.join(' • ');

    saveStoredTrips(trips);
    return { trip, stop: newStop };
  },

  updateStop: async (tripId, stopId, updatedStopData) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stopIndex = trip.stops.findIndex((s) => String(s.id) === String(stopId));
    if (stopIndex === -1) throw new Error('Stop not found.');

    const oldCityName = trip.stops[stopIndex].cityName;
    trip.stops[stopIndex] = {
      ...trip.stops[stopIndex],
      ...updatedStopData,
    };

    if (updatedStopData.cityName && updatedStopData.cityName !== oldCityName) {
      const idx = trip.destinations.indexOf(oldCityName);
      if (idx !== -1) {
        trip.destinations[idx] = updatedStopData.cityName;
      } else {
        trip.destinations.push(updatedStopData.cityName);
      }
      trip.subtitle = trip.destinations.join(' • ');
    }

    saveStoredTrips(trips);
    return { trip, stop: trip.stops[stopIndex] };
  },

  deleteStop: async (tripId, stopId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stopToDelete = trip.stops.find((s) => String(s.id) === String(stopId));
    if (stopToDelete) {
      trip.stops = trip.stops.filter((s) => String(s.id) !== String(stopId));
      trip.stops.forEach((s, idx) => {
        s.orderIndex = idx;
      });

      const remainingCities = trip.stops.map((s) => s.cityName);
      trip.destinations = [...new Set(remainingCities)];
      trip.citiesCount = trip.destinations.length;
      trip.subtitle =
        trip.destinations.length > 0 ? trip.destinations.join(' • ') : 'No stops added';
    }

    saveStoredTrips(trips);
    return trip;
  },

  reorderStops: async (tripId, reorderedStops) => {
    await delay(150);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    trip.stops = reorderedStops.map((stop, idx) => ({
      ...stop,
      orderIndex: idx,
    }));

    trip.destinations = trip.stops.map((s) => s.cityName);
    trip.subtitle = trip.destinations.join(' • ');

    saveStoredTrips(trips);
    return trip;
  },

  // ==========================================
  // Activities inside a Stop
  // ==========================================
  addActivity: async (tripId, stopId, activityData) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stop = trip.stops.find((s) => String(s.id) === String(stopId));
    if (!stop) throw new Error('Stop not found.');

    if (!stop.activities) stop.activities = [];

    const newActivity = {
      id: 'act_' + Date.now(),
      title: activityData.title,
      date: activityData.date || stop.startDate,
      time: activityData.time || '10:00 AM',
      cost: Number(activityData.cost) || 0,
      category: activityData.category || 'Sightseeing',
      description: activityData.description || '',
      isCompleted: false,
    };

    stop.activities.push(newActivity);
    trip.budgetSpent = (trip.budgetSpent || 0) + newActivity.cost;

    saveStoredTrips(trips);
    return { trip, stop, activity: newActivity };
  },

  updateActivity: async (tripId, stopId, activityId, updatedActData) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stop = trip.stops.find((s) => String(s.id) === String(stopId));
    if (!stop) throw new Error('Stop not found.');

    const actIndex = stop.activities.findIndex((a) => String(a.id) === String(activityId));
    if (actIndex === -1) throw new Error('Activity not found.');

    const oldCost = stop.activities[actIndex].cost || 0;
    stop.activities[actIndex] = {
      ...stop.activities[actIndex],
      ...updatedActData,
    };

    if (updatedActData.cost !== undefined) {
      const diff = Number(updatedActData.cost) - oldCost;
      trip.budgetSpent = Math.max(0, (trip.budgetSpent || 0) + diff);
    }

    saveStoredTrips(trips);
    return { trip, stop, activity: stop.activities[actIndex] };
  },

  deleteActivity: async (tripId, stopId, activityId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stop = trip.stops.find((s) => String(s.id) === String(stopId));
    if (!stop) throw new Error('Stop not found.');

    const actToDelete = stop.activities.find((a) => String(a.id) === String(activityId));
    if (actToDelete) {
      trip.budgetSpent = Math.max(0, (trip.budgetSpent || 0) - (actToDelete.cost || 0));
      stop.activities = stop.activities.filter((a) => String(a.id) !== String(activityId));
    }

    saveStoredTrips(trips);
    return trip;
  },

  toggleActivityComplete: async (tripId, stopId, activityId) => {
    await delay(150);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stop = trip.stops.find((s) => String(s.id) === String(stopId));
    if (!stop) throw new Error('Stop not found.');

    const act = stop.activities.find((a) => String(a.id) === String(activityId));
    if (act) {
      act.isCompleted = !act.isCompleted;
    }

    saveStoredTrips(trips);
    return trip;
  },

  getTripTimeline: async (tripId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

    const days = [];
    let currentDate = new Date(start);
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      let stop = null;
      if (trip.stops && trip.stops.length > 0) {
        stop = trip.stops.find(s => s.startDate <= dateStr && s.endDate >= dateStr);
        if (!stop) {
            stop = trip.stops[0]; 
        }
      }

      const events = [];
      if (stop) {
        if (stop.startDate === dateStr) {
          events.push({
            id: `arr_${stop.id}`,
            eventType: 'stop_arrival',
            title: `Arrive in ${stop.cityName}`,
            time: '10:00 AM',
            cost: stop.transportCost || 0
          });
        }
        if (stop.endDate === dateStr && stop.startDate !== dateStr) {
            events.push({
                id: `dep_${stop.id}`,
                eventType: 'stop_departure',
                title: `Depart from ${stop.cityName}`,
                time: 'Evening',
                cost: 0
            });
        }
        const activities = (stop.activities || []).filter(a => a.date === dateStr);
        activities.forEach(act => {
          events.push({
            ...act,
            eventType: 'activity',
            activityId: act.id,
          });
        });
      }

      const expenses = (trip.expenses || []).filter(e => e.date === dateStr);
      expenses.forEach(e => {
        events.push({
            id: e.id,
            eventType: 'expense',
            title: `Expense: ${e.category}`,
            description: e.description,
            time: 'Day',
            cost: e.amount
        });
      });

      days.push({
        dayNumber: i,
        date: dateStr,
        cityName: stop ? stop.cityName : 'Planning',
        country: stop ? stop.country : '',
        stopId: stop ? stop.id : null,
        events,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      trip_id: trip.id,
      total_days: totalDays,
      days,
    };
  },

  getTripBudget: async (tripId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const budgetLimit = trip.budgetTotal || 5000;
    let transport = 0;
    let stay = 0;
    let activities = 0;
    let meals = 0;
    let other = 0;

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

    const dailySpending = [];
    const targetDailyBudget = Math.round(budgetLimit / totalDays);

    let currentDate = new Date(start);
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      let stop = null;
      if (trip.stops && trip.stops.length > 0) {
        stop = trip.stops.find(s => s.startDate <= dateStr && s.endDate >= dateStr);
      }
      
      let dayTransport = 0;
      let dayStay = 0;
      let dayActivities = 0;
      let dayMeals = 0;
      let dayOther = 0;
      
      if (stop) {
        if (stop.startDate === dateStr) {
          dayTransport += Number(stop.transportCost || 0);
        }
        dayStay += Number(stop.stayCostPerNight || 0);
        dayMeals += 45; 
        
        const acts = (stop.activities || []).filter(a => a.date === dateStr);
        acts.forEach(a => dayActivities += Number(a.cost || 0));
      }

      const dayExpenses = (trip.expenses || []).filter(e => e.date === dateStr);
      dayExpenses.forEach(e => {
        const amt = Number(e.amount || 0);
        if (e.category === 'Meals') dayMeals += amt;
        else if (e.category === 'Transport') dayTransport += amt;
        else if (e.category === 'Activities') dayActivities += amt;
        else if (e.category === 'Stay') dayStay += amt;
        else dayOther += amt;
      });

      const totalDay = dayTransport + dayStay + dayActivities + dayMeals + dayOther;

      dailySpending.push({
        dayLabel: `Day ${i}`,
        cityName: stop ? stop.cityName : 'In Transit',
        date: dateStr,
        transport: dayTransport,
        stay: dayStay,
        activities: dayActivities,
        meals: dayMeals,
        other: dayOther,
        total: totalDay,
        targetDailyBudget: targetDailyBudget,
        isOverBudget: totalDay > targetDailyBudget
      });

      transport += dayTransport;
      stay += dayStay;
      activities += dayActivities;
      meals += dayMeals;
      other += dayOther;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalEstimated = transport + stay + activities + meals + other;
    
    const categories = [
      { category: 'Transport', amount: transport, color: '#3b82f6', percentage: Math.round((transport/totalEstimated)*100) || 0 },
      { category: 'Stay', amount: stay, color: '#10b981', percentage: Math.round((stay/totalEstimated)*100) || 0 },
      { category: 'Meals', amount: meals, color: '#f59e0b', percentage: Math.round((meals/totalEstimated)*100) || 0 },
      { category: 'Activities', amount: activities, color: '#8b5cf6', percentage: Math.round((activities/totalEstimated)*100) || 0 },
      { category: 'Other', amount: other, color: '#64748b', percentage: Math.round((other/totalEstimated)*100) || 0 },
    ];

    return {
      budget_limit: budgetLimit,
      total_estimated_cost: totalEstimated,
      average_daily_cost: Math.round(totalEstimated / totalDays) || 0,
      target_daily_budget: targetDailyBudget,
      total_days: totalDays,
      transport,
      stay,
      activities,
      meals,
      other_expenses: other,
      over_budget: totalEstimated > budgetLimit,
      budget_difference: Math.abs(budgetLimit - totalEstimated),
      categories,
      dailySpending,
      overBudgetDays: dailySpending.filter(d => d.isOverBudget),
      expenses: trip.expenses || []
    };
  },

  addExpense: async (tripId, expenseData) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    if (!trip.expenses) trip.expenses = [];
    const newExpense = {
      id: 'exp_' + Date.now(),
      ...expenseData,
      amount: Number(expenseData.amount) || 0
    };
    trip.expenses.push(newExpense);
    trip.budgetSpent = (trip.budgetSpent || 0) + newExpense.amount;
    
    saveStoredTrips(trips);
    return { trip, expense: newExpense };
  },

  deleteExpense: async (tripId, expenseId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    if (trip.expenses) {
      const exp = trip.expenses.find(e => String(e.id) === String(expenseId));
      if (exp) {
        trip.budgetSpent = Math.max(0, (trip.budgetSpent || 0) - exp.amount);
        trip.expenses = trip.expenses.filter(e => String(e.id) !== String(expenseId));
      }
    }
    
    saveStoredTrips(trips);
    return trip;
  },

  getDestinations: async () => {
    await delay(150);
    return MOCK_CITIES;
  },

  getSavedDestinations: async () => {
    await delay(150);
    return getStoredSavedDestinations();
  },

  toggleSaveDestination: async (city) => {
    await delay(150);
    const savedList = getStoredSavedDestinations();
    const existingIndex = savedList.findIndex(s => String(s.cityId) === String(city.id));
    
    let saved = false;
    if (existingIndex >= 0) {
      savedList.splice(existingIndex, 1);
    } else {
      savedList.push({
        id: 'save_' + Date.now(),
        cityId: String(city.id),
        cityName: city.name,
        country: city.country,
        imageUrl: city.image_url,
        savedAt: new Date().toISOString()
      });
      saved = true;
    }
    
    saveStoredSavedDestinations(savedList);
    return { saved, list: savedList };
  },

  // ==========================================
  // Search & Explore Services
  // ==========================================
  searchCities: async (params = {}) => {
    try {
      const url = new URL(`${API_BASE_URL}/cities`);
      if (params.q) url.searchParams.append('q', params.q);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch cities');
      let cities = await res.json();

      // Apply frontend filters since backend only supports q and country
      if (params.region && params.region !== 'all') {
        // Mock region filtering since country/region mapping isn't exact
        // Assuming region corresponds loosely to countries for this demo
      }

      if (params.costIndex && params.costIndex !== 'all') {
        cities = cities.filter(c => {
          if (params.costIndex === 'Budget') return c.avg_daily_cost <= 75;
          if (params.costIndex === 'Moderate') return c.avg_daily_cost > 75 && c.avg_daily_cost <= 150;
          if (params.costIndex === 'Luxury') return c.avg_daily_cost > 150;
          return true;
        });
      }

      if (params.sortBy) {
        if (params.sortBy === 'cost_asc') cities.sort((a, b) => a.avg_daily_cost - b.avg_daily_cost);
        if (params.sortBy === 'cost_desc') cities.sort((a, b) => b.avg_daily_cost - a.avg_daily_cost);
        if (params.sortBy === 'rating') cities.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      return cities;
    } catch (err) {
      console.error('searchCities error:', err);
      throw err;
    }
  },

  searchActivities: async (params = {}) => {
    try {
      const url = new URL(`${API_BASE_URL}/activities`);
      if (params.q) url.searchParams.append('q', params.q);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch activities');
      let acts = await res.json();

      if (params.category && params.category !== 'all') {
        acts = acts.filter(a => a.category === params.category);
      }
      if (params.maxCost !== null && params.maxCost !== undefined) {
        acts = acts.filter(a => a.cost <= params.maxCost);
      }
      if (params.maxDuration !== null && params.maxDuration !== undefined) {
        acts = acts.filter(a => a.duration_hours <= params.maxDuration);
      }

      return acts;
    } catch (err) {
      console.error('searchActivities error:', err);
      throw err;
    }
  }
};
