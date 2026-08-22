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

// Simulated latency helper
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // ==========================================
  // Auth & User Services
  // ==========================================
  login: async (email, password) => {
    await delay(350);
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }
    if (email.includes('error')) {
      throw new Error('Invalid credentials. Please verify your email and password.');
    }
    const token = 'mock_jwt_token_' + Date.now();
    const existing = apiService.getCurrentUser();
    const user = { ...existing, email };
    localStorage.setItem('gt_auth_token', token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    return { token, user };
  },

  signup: async ({ name, email, password }) => {
    await delay(350);
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
  // Phase 1: City Search & Metadata API
  // ==========================================
  searchCities: async ({
    q = '',
    country = 'all',
    region = 'all',
    costIndex = 'all',
    category = 'all',
    sortBy = 'popular',
  } = {}) => {
    await delay(180);
    let results = [...MOCK_CITIES];

    // Text search by name, country, or description
    if (q && q.trim()) {
      const term = q.toLowerCase().trim();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.country.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term))
      );
    }

    // Country filter
    if (country && country !== 'all') {
      results = results.filter((c) => c.country.toLowerCase() === country.toLowerCase());
    }

    // Region filter
    if (region && region !== 'all') {
      results = results.filter((c) => c.region.toLowerCase() === region.toLowerCase());
    }

    // Cost Index filter
    if (costIndex && costIndex !== 'all') {
      results = results.filter((c) => c.cost_index.toLowerCase() === costIndex.toLowerCase());
    }

    // Category filter
    if (category && category !== 'all') {
      results = results.filter(
        (c) =>
          c.categories &&
          c.categories.some((cat) => cat.toLowerCase() === category.toLowerCase())
      );
    }

    // Sort order
    if (sortBy === 'popular') {
      results.sort((a, b) => b.popularity - a.popularity);
    } else if (sortBy === 'cost_asc') {
      results.sort((a, b) => a.avg_daily_cost - b.avg_daily_cost);
    } else if (sortBy === 'cost_desc') {
      results.sort((a, b) => b.avg_daily_cost - a.avg_daily_cost);
    } else if (sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    }

    return results;
  },

  getCityById: async (cityId) => {
    await delay(100);
    const city = MOCK_CITIES.find((c) => Number(c.id) === Number(cityId));
    if (!city) throw new Error('City not found.');
    // Embed city activities
    const activities = MOCK_MASTER_ACTIVITIES.filter((a) => Number(a.city_id) === Number(cityId));
    return { ...city, activities };
  },

  getDestinations: async () => {
    await delay(150);
    return MOCK_CITIES;
  },

  // Saved Destinations
  getSavedDestinations: async () => {
    await delay(100);
    return getStoredSavedDestinations();
  },

  toggleSaveDestination: async (city) => {
    await delay(150);
    let list = getStoredSavedDestinations();
    const exists = list.some((item) => Number(item.cityId) === Number(city.id));
    if (exists) {
      list = list.filter((item) => Number(item.cityId) !== Number(city.id));
    } else {
      list.unshift({
        id: 'sd_' + Date.now(),
        cityId: city.id,
        cityName: city.name,
        country: city.country,
        image_url: city.image_url,
        savedAt: 'Just now',
        avgDailyCost: city.avg_daily_cost,
      });
    }
    saveStoredSavedDestinations(list);
    return { saved: !exists, list };
  },

  // ==========================================
  // Phase 2: Activity Search & Catalog API
  // ==========================================
  searchActivities: async ({
    q = '',
    cityId = null,
    category = 'all',
    maxCost = null,
    maxDuration = null,
    sortBy = 'rating',
  } = {}) => {
    await delay(150);
    let results = [...MOCK_MASTER_ACTIVITIES];

    if (cityId) {
      results = results.filter((a) => Number(a.city_id) === Number(cityId));
    }

    if (q && q.trim()) {
      const term = q.toLowerCase().trim();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.cityName.toLowerCase().includes(term) ||
          (a.description && a.description.toLowerCase().includes(term))
      );
    }

    if (category && category !== 'all') {
      results = results.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }

    if (maxCost !== null && maxCost !== '' && Number(maxCost) > 0) {
      results = results.filter((a) => a.cost <= Number(maxCost));
    }

    if (maxDuration !== null && maxDuration !== '' && Number(maxDuration) > 0) {
      results = results.filter((a) => a.duration_hours <= Number(maxDuration));
    }

    if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'cost_asc') {
      results.sort((a, b) => a.cost - b.cost);
    } else if (sortBy === 'cost_desc') {
      results.sort((a, b) => b.cost - a.cost);
    } else if (sortBy === 'duration') {
      results.sort((a, b) => a.duration_hours - b.duration_hours);
    }

    return results;
  },

  // ==========================================
  // Phase 3: Budget Analysis & Calculations
  // ==========================================
  getTripBudget: async (tripId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId)) || trips[0];
    if (!trip) throw new Error('Trip not found');

    const budgetLimit = Number(trip.budgetTotal) || 2500;
    const stops = trip.stops || [];

    // Calculate dates & duration
    let totalDays = 1;
    if (trip.startDate && trip.endDate) {
      const s = new Date(trip.startDate);
      const e = new Date(trip.endDate);
      totalDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
    }

    // 1. Transport Cost
    const transportTotal = stops.reduce((sum, s) => sum + Number(s.transportCost || 0), 0);

    // 2. Stay Cost
    const stayTotal = stops.reduce((sum, s) => {
      let nights = 1;
      if (s.startDate && s.endDate) {
        const sD = new Date(s.startDate);
        const eD = new Date(s.endDate);
        nights = Math.max(1, Math.round((eD - sD) / (1000 * 60 * 60 * 24)));
      }
      return sum + Number(s.stayCostPerNight || 0) * nights;
    }, 0);

    // 3. Activities Cost
    const allActivities = stops.flatMap((s) => s.activities || []);
    const activitiesTotal = allActivities.reduce((sum, a) => sum + Number(a.cost || 0), 0);

    // 4. Meals Cost: Calculated using city avg_meal_cost (3 meals/day) or default $25/meal
    const mealsTotal = stops.reduce((sum, s) => {
      const cityObj = MOCK_CITIES.find((c) => c.name.toLowerCase() === s.cityName.toLowerCase());
      const avgMealCost = cityObj ? cityObj.avg_meal_cost : 25;
      let days = 1;
      if (s.startDate && s.endDate) {
        const sD = new Date(s.startDate);
        const eD = new Date(s.endDate);
        days = Math.max(1, Math.round((eD - sD) / (1000 * 60 * 60 * 24)));
      }
      return sum + avgMealCost * 3 * days;
    }, 0);

    // 5. Other Expenses
    const expenses = trip.expenses || [];
    const otherExpensesTotal = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    // Total Estimated Cost
    const totalEstimatedCost =
      transportTotal + stayTotal + activitiesTotal + mealsTotal + otherExpensesTotal;
    const avgDailyCost = Math.round(totalEstimatedCost / totalDays);
    const targetDailyBudget = Math.round(budgetLimit / totalDays);
    const overBudget = totalEstimatedCost > budgetLimit;
    const budgetDifference = Math.round(budgetLimit - totalEstimatedCost);

    // Category Percentages for Recharts Donut
    const baseTotal = totalEstimatedCost || 1;
    const categories = [
      {
        category: 'Stay & Hotels',
        amount: stayTotal,
        percentage: Math.round((stayTotal / baseTotal) * 100),
        color: '#4F46E5', // Brand Indigo
      },
      {
        category: 'Transport',
        amount: transportTotal,
        percentage: Math.round((transportTotal / baseTotal) * 100),
        color: '#0EA5E9', // Sky
      },
      {
        category: 'Meals & Dining',
        amount: mealsTotal,
        percentage: Math.round((mealsTotal / baseTotal) * 100),
        color: '#10B981', // Emerald
      },
      {
        category: 'Activities & Tours',
        amount: activitiesTotal,
        percentage: Math.round((activitiesTotal / baseTotal) * 100),
        color: '#F97316', // Travel Orange
      },
      {
        category: 'Other / Transit',
        amount: otherExpensesTotal,
        percentage: Math.round((otherExpensesTotal / baseTotal) * 100),
        color: '#8B5CF6', // Purple
      },
    ];

    // Day-by-Day Spending Breakdown for Recharts Bar Chart
    const dailySpending = [];
    const sDate = new Date(trip.startDate || '2026-10-15');

    for (let d = 0; d < totalDays; d++) {
      const curr = new Date(sDate);
      curr.setDate(curr.getDate() + d);
      const dateStr = curr.toISOString().split('T')[0];
      const monthDayStr = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Find which stop corresponds to this day
      const currentStop = stops.find((s) => {
        if (!s.startDate || !s.endDate) return false;
        return dateStr >= s.startDate && dateStr <= s.endDate;
      }) || stops[0];

      const cityObj = currentStop
        ? MOCK_CITIES.find((c) => c.name.toLowerCase() === currentStop.cityName.toLowerCase())
        : null;

      const dayMeals = cityObj ? cityObj.avg_meal_cost * 3 : 75;
      const dayStay = currentStop ? Number(currentStop.stayCostPerNight || 0) : 100;
      const dayTransport =
        currentStop && currentStop.startDate === dateStr ? Number(currentStop.transportCost || 0) : 0;

      const dayActs = allActivities
        .filter((a) => a.date === dateStr)
        .reduce((sum, a) => sum + Number(a.cost || 0), 0);

      const dayExp = expenses
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const dayTotal = dayStay + dayMeals + dayTransport + dayActs + dayExp;
      const isOver = dayTotal > targetDailyBudget;

      dailySpending.push({
        date: dateStr,
        dayLabel: `Day ${d + 1} (${monthDayStr})`,
        cityName: currentStop ? currentStop.cityName : 'In Transit',
        total: dayTotal,
        stay: dayStay,
        meals: dayMeals,
        transport: dayTransport,
        activities: dayActs,
        other: dayExp,
        targetDailyBudget,
        isOverBudget: isOver,
      });
    }

    const overBudgetDays = dailySpending.filter((d) => d.isOverBudget);

    return {
      trip_id: trip.id,
      trip_title: trip.title,
      budget_limit: budgetLimit,
      total_days: totalDays,
      transport: transportTotal,
      stay: stayTotal,
      activities: activitiesTotal,
      meals: mealsTotal,
      other_expenses: otherExpensesTotal,
      total_estimated_cost: totalEstimatedCost,
      average_daily_cost: avgDailyCost,
      target_daily_budget: targetDailyBudget,
      over_budget: overBudget,
      budget_difference: budgetDifference,
      categories,
      dailySpending,
      overBudgetDays,
      expenses,
    };
  },

  addExpense: async (tripId, expenseData) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found');

    if (!trip.expenses) trip.expenses = [];
    const newExpense = {
      id: 'exp_' + Date.now(),
      category: expenseData.category || 'Other',
      amount: Number(expenseData.amount) || 0,
      date: expenseData.date || trip.startDate,
      description: expenseData.description || '',
    };
    trip.expenses.push(newExpense);
    saveStoredTrips(trips);
    return newExpense;
  },

  deleteExpense: async (tripId, expenseId) => {
    await delay(150);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found');

    trip.expenses = (trip.expenses || []).filter((e) => String(e.id) !== String(expenseId));
    saveStoredTrips(trips);
    return { success: true };
  },

  // ==========================================
  // Phase 4: Trip Timeline & Schedule Generation
  // ==========================================
  getTripTimeline: async (tripId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId)) || trips[0];
    if (!trip) throw new Error('Trip not found');

    const stops = trip.stops || [];
    let totalDays = 1;
    if (trip.startDate && trip.endDate) {
      const s = new Date(trip.startDate);
      const e = new Date(trip.endDate);
      totalDays = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
    }

    const sDate = new Date(trip.startDate || '2026-10-15');
    const days = [];

    for (let i = 0; i < totalDays; i++) {
      const curr = new Date(sDate);
      curr.setDate(curr.getDate() + i);
      const dateStr = curr.toISOString().split('T')[0];

      // Identify active stop
      const stop = stops.find((s) => {
        if (!s.startDate || !s.endDate) return false;
        return dateStr >= s.startDate && dateStr <= s.endDate;
      }) || stops[0];

      const events = [];

      // If first day of a stop, add arrival event
      if (stop && stop.startDate === dateStr) {
        events.push({
          id: `evt_arr_${stop.id}`,
          stopId: stop.id,
          eventType: 'stop_arrival',
          title: `Arrival in ${stop.cityName}`,
          description: stop.transportMode ? `Via ${stop.transportMode}` : 'Check-in',
          cityName: stop.cityName,
          cost: stop.transportCost || 0,
          time: '08:30 AM',
          notes: stop.notes,
          isCompleted: true,
        });
      }

      // Add activities scheduled for this date
      if (stop && stop.activities) {
        stop.activities
          .filter((a) => a.date === dateStr)
          .forEach((act) => {
            events.push({
              id: act.id,
              stopId: stop.id,
              activityId: act.id,
              eventType: 'activity',
              title: act.title,
              description: act.description,
              cityName: stop.cityName,
              category: act.category,
              cost: act.cost || 0,
              time: act.time || '11:00 AM',
              isCompleted: !!act.isCompleted,
            });
          });
      }

      // If last day of a stop (and not end of entire trip), add departure event
      if (stop && stop.endDate === dateStr && i < totalDays - 1) {
        events.push({
          id: `evt_dep_${stop.id}`,
          stopId: stop.id,
          eventType: 'stop_departure',
          title: `Depart ${stop.cityName}`,
          description: `Check-out and transfer to next destination`,
          cityName: stop.cityName,
          cost: 0,
          time: '06:00 PM',
          isCompleted: false,
        });
      }

      days.push({
        date: dateStr,
        dayNumber: i + 1,
        cityName: stop ? stop.cityName : 'In Transit',
        country: stop ? stop.country : '',
        stopId: stop ? stop.id : null,
        events,
      });
    }

    return {
      trip_id: trip.id,
      trip_title: trip.title,
      start_date: trip.startDate,
      end_date: trip.endDate,
      total_days: totalDays,
      days,
    };
  },

  // ==========================================
  // Phase 5: Sharing & Public Itinerary API
  // ==========================================
  shareTrip: async (tripId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
    if (!trip) throw new Error('Trip not found');

    if (!trip.publicId) {
      trip.publicId = 'gt_pub_' + Math.random().toString(36).substring(2, 10);
    }
    trip.isPublic = true;
    saveStoredTrips(trips);

    const shareUrl = `${window.location.origin}/shared/${trip.publicId}`;
    return {
      trip_id: trip.id,
      public_id: trip.publicId,
      share_url: shareUrl,
      is_public: true,
    };
  },

  getSharedTrip: async (publicId) => {
    await delay(300);
    const trips = getStoredTrips();
    const trip = trips.find(
      (t) => String(t.publicId) === String(publicId) || String(t.id) === String(publicId)
    );
    if (!trip) {
      throw new Error('Shared itinerary not found or has expired.');
    }
    return trip;
  },

  copySharedTrip: async (publicId) => {
    await delay(350);
    const trips = getStoredTrips();
    const sourceTrip = trips.find(
      (t) => String(t.publicId) === String(publicId) || String(t.id) === String(publicId)
    );
    if (!sourceTrip) throw new Error('Source trip not found.');

    const newTrip = {
      ...JSON.parse(JSON.stringify(sourceTrip)),
      id: 'trip_' + Date.now(),
      publicId: 'gt_pub_' + Math.random().toString(36).substring(2, 10),
      title: `${sourceTrip.title} (My Copy)`,
      status: 'Planning',
      statusVariant: 'warning',
      isPublic: false,
    };

    trips.unshift(newTrip);
    saveStoredTrips(trips);
    return newTrip;
  },

  // ==========================================
  // Trips Core CRUD
  // ==========================================
  getDashboardData: async () => {
    await delay(300);
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
    await delay(250);
    return getStoredTrips();
  },

  getTripById: async (tripId) => {
    await delay(200);
    const trips = getStoredTrips();
    const trip = trips.find((t) => String(t.id) === String(tripId));
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
};

