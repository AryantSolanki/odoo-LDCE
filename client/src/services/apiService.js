import {
  MOCK_USER,
  INITIAL_TRIPS,
  MOCK_RECOMMENDED_DESTINATIONS,
  MOCK_BUDGET_SUMMARY,
  MOCK_ACTIVITIES,
  DEFAULT_COVER_IMAGES,
} from './mockData';

const STORAGE_KEY_TRIPS = 'globetrotter_trips_data';

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

// Simulated latency helper
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // Auth Services
  login: async (email, password) => {
    await delay(500);
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
    await delay(500);
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
    await delay(400);
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

  // Trips CRUD Services
  getDashboardData: async () => {
    await delay(400);
    const user = apiService.getCurrentUser();
    const trips = getStoredTrips();
    return {
      user,
      trips,
      recommendedDestinations: MOCK_RECOMMENDED_DESTINATIONS,
      budgetSummary: MOCK_BUDGET_SUMMARY,
      recentActivities: MOCK_ACTIVITIES,
    };
  },

  getTrips: async () => {
    await delay(300);
    return getStoredTrips();
  },

  getTripById: async (tripId) => {
    await delay(250);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) {
      // Fallback default
      return trips[0];
    }
    return trip;
  },

  createTrip: async (tripData) => {
    await delay(500);
    const trips = getStoredTrips();

    const destinations = tripData.destinations || [];
    const coverImg =
      tripData.coverImage ||
      DEFAULT_COVER_IMAGES[Math.floor(Math.random() * DEFAULT_COVER_IMAGES.length)].url;

    const newTrip = {
      id: 'trip_' + Date.now(),
      title: tripData.title || 'New Adventure',
      description: tripData.description || '',
      subtitle: destinations.length > 0 ? destinations.join(' • ') : 'Multi-city Route',
      citiesCount: destinations.length,
      durationDays: tripData.durationDays || 7,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      coverImage: coverImg,
      status: 'Planning',
      statusVariant: 'warning',
      budgetTotal: Number(tripData.budgetTotal) || 3000,
      budgetSpent: 0,
      destinations: destinations,
      collaboratorsCount: 1,
      progressPercentage: 15,
      stops: tripData.stops || [],
    };

    trips.unshift(newTrip);
    saveStoredTrips(trips);
    return newTrip;
  },

  updateTrip: async (tripId, updatedData) => {
    await delay(350);
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
    await delay(350);
    let trips = getStoredTrips();
    trips = trips.filter((t) => String(t.id) !== String(tripId));
    saveStoredTrips(trips);
    return { success: true, tripId };
  },

  // Stops CRUD Services inside a Trip
  addStop: async (tripId, stopData) => {
    await delay(300);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    if (!trip.stops) trip.stops = [];

    const newStop = {
      id: 'stop_' + Date.now(),
      cityName: stopData.cityName,
      country: stopData.country || '',
      startDate: stopData.startDate,
      endDate: stopData.endDate,
      orderIndex: trip.stops.length,
      transportMode: stopData.transportMode || 'Flight',
      transportCost: Number(stopData.transportCost) || 0,
      stayCostPerNight: Number(stopData.stayCostPerNight) || 0,
      notes: stopData.notes || '',
      activities: [],
    };

    trip.stops.push(newStop);

    // Update trip destinations list & count
    if (!trip.destinations.includes(stopData.cityName)) {
      trip.destinations.push(stopData.cityName);
    }
    trip.citiesCount = trip.destinations.length;
    trip.subtitle = trip.destinations.join(' • ');

    saveStoredTrips(trips);
    return { trip, stop: newStop };
  },

  updateStop: async (tripId, stopId, updatedStopData) => {
    await delay(300);
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

    // If city name changed, update trip destinations
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
    await delay(300);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stopToDelete = trip.stops.find((s) => String(s.id) === String(stopId));
    if (stopToDelete) {
      trip.stops = trip.stops.filter((s) => String(s.id) !== String(stopId));
      // Re-index remaining stops
      trip.stops.forEach((s, idx) => {
        s.orderIndex = idx;
      });

      // Update destinations list
      const remainingCities = trip.stops.map((s) => s.cityName);
      trip.destinations = [...new Set(remainingCities)];
      trip.citiesCount = trip.destinations.length;
      trip.subtitle = trip.destinations.length > 0 ? trip.destinations.join(' • ') : 'No stops added';
    }

    saveStoredTrips(trips);
    return trip;
  },

  reorderStops: async (tripId, reorderedStops) => {
    await delay(200);
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

  // Activities CRUD Services inside a Stop
  addActivity: async (tripId, stopId, activityData) => {
    await delay(300);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stop = trip.stops.find((s) => String(s.id) === String(stopId));
    if (!stop) throw new Error('Stop not found.');

    if (!stop.activities) stop.activities = [];

    const newActivity = {
      id: 'act_' + Date.now(),
      title: activityData.title,
      date: activityData.date,
      time: activityData.time || '10:00 AM',
      cost: Number(activityData.cost) || 0,
      category: activityData.category || 'Sightseeing',
      description: activityData.description || '',
      isCompleted: false,
    };

    stop.activities.push(newActivity);

    // Recalculate spent budget slightly
    trip.budgetSpent += newActivity.cost;

    saveStoredTrips(trips);
    return { trip, stop, activity: newActivity };
  },

  updateActivity: async (tripId, stopId, activityId, updatedActData) => {
    await delay(250);
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
      trip.budgetSpent = Math.max(0, trip.budgetSpent + diff);
    }

    saveStoredTrips(trips);
    return { trip, stop, activity: stop.activities[actIndex] };
  },

  deleteActivity: async (tripId, stopId, activityId) => {
    await delay(250);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found.');

    const stop = trip.stops.find((s) => String(s.id) === String(stopId));
    if (!stop) throw new Error('Stop not found.');

    const actToDelete = stop.activities.find((a) => String(a.id) === String(activityId));
    if (actToDelete) {
      trip.budgetSpent = Math.max(0, trip.budgetSpent - (actToDelete.cost || 0));
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

  getDestinations: async () => {
    await delay(200);
    return MOCK_RECOMMENDED_DESTINATIONS;
  },
};
