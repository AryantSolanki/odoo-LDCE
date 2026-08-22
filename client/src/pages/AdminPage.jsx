import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Compass,
  MapPin,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  BarChart3,
  Globe,
  Award,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { SkeletonMetrics, SkeletonCard } from '../components/ui/Skeleton';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'trips' | 'destinations'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [tripQuery, setTripQuery] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, analyticsData, usersData, tripsData] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminAnalytics(),
        apiService.getAdminUsers(),
        apiService.getAdminTrips(),
      ]);

      setStats(statsData);
      setAnalytics(analyticsData);
      setUsersList(usersData);
      setTripsList(tripsData);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error loading admin data',
        message: err.message || 'Could not fetch platform analytics.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'System Administrator' ? 'Explorer Member' : 'System Administrator';
    try {
      await apiService.updateUserRole(userId, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      addToast({
        type: 'success',
        title: 'User Role Updated',
        message: `User role changed to ${newRole}.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to update role',
        message: err.message,
      });
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await apiService.deleteUserAdmin(userId);
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      addToast({
        type: 'success',
        title: 'User Deleted',
        message: `Account for ${name} removed.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to delete user',
        message: err.message,
      });
    }
  };

  const handleDeleteTrip = async (tripId, title) => {
    if (!window.confirm(`Are you sure you want to delete trip "${title}"?`)) return;
    try {
      await apiService.deleteTrip(tripId);
      setTripsList((prev) => prev.filter((t) => t.id !== tripId));
      addToast({
        type: 'success',
        title: 'Trip Removed',
        message: `Trip "${title}" deleted by administrator.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error deleting trip',
        message: err.message,
      });
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userQuery.toLowerCase())
  );

  const filteredTrips = tripsList.filter(
    (t) =>
      t.title.toLowerCase().includes(tripQuery.toLowerCase()) ||
      t.user_name.toLowerCase().includes(tripQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-600/10 text-brand-600">
                <ShieldCheck className="w-7 h-7 text-brand-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  Admin & Platform Analytics
                  <Badge variant="primary" showDot className="text-xs">
                    Live System
                  </Badge>
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Monitor overall user adoption, top booked destinations, multi-city travel volume, and moderate itineraries.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchAdminData}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Top Summary Metrics Cards */}
        {loading ? (
          <SkeletonMetrics />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card hoverEffect className="relative overflow-hidden border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Registered Users</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{stats?.total_users || 148}</h3>
                    <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +14% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect className="relative overflow-hidden border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Multi-City Trips</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{stats?.total_trips || 35}</h3>
                    <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +28% creation velocity
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-travel-50 text-travel-600 flex items-center justify-center">
                    <Compass className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect className="relative overflow-hidden border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Planned Travel Volume</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">
                      ${(stats?.total_planned_budget || 188500).toLocaleString()}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">Avg budget: $2,450 / trip</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hoverEffect className="relative overflow-hidden border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top Destination City</p>
                    <h3 className="text-2xl font-extrabold text-slate-900 mt-2 truncate max-w-[140px]">
                      {stats?.top_destination || 'Tokyo, Japan'}
                    </h3>
                    <p className="text-xs font-medium text-brand-600 mt-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> 42 itineraries scheduled
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Platform Analytics
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            User Management ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'trips'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            Trip Moderation ({tripsList.length})
          </button>
        </div>

        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Creation Trends Chart */}
              <Card className="lg:col-span-2 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center justify-between">
                    <span>Trip & User Growth Velocity</span>
                    <span className="text-xs font-semibold text-slate-500">2026 Q2-Q3 Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="h-64 flex items-end gap-4 pt-8 px-2 border-b border-slate-200">
                      {analytics?.monthly_trend?.map((item) => {
                        const maxVal = 90;
                        const heightPct = Math.round((item.trips / maxVal) * 100);
                        return (
                          <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                            <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.trips} trips
                            </div>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-brand-600 to-indigo-400 group-hover:brightness-110 transition-all shadow-sm"
                            />
                            <span className="text-xs font-semibold text-slate-600 mt-1">{item.month}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-[11px] font-semibold uppercase text-slate-500">Growth Velocity</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">+42% MoM</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-[11px] font-semibold uppercase text-slate-500">Avg Destinations / Trip</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">3.4 Cities</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-[11px] font-semibold uppercase text-slate-500">Public Share Rate</p>
                        <p className="text-lg font-bold text-slate-900 mt-0.5">64% Public</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Interest Distribution */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Activity Interest Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.activity_distribution?.map((act) => {
                    const totalActs = analytics.activity_distribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
                    const pct = Math.round((act.count / totalActs) * 100);
                    return (
                      <div key={act.category} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{act.category}</span>
                          <span className="text-slate-500">{act.count} booked ({pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-gradient-to-r from-travel-500 to-amber-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Top Destinations Grid */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span>Top Booked Destination Cities</span>
                  <Badge variant="primary">Master Destination Data</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics?.top_cities?.map((c) => (
                    <div key={c.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                        <p className="text-xs text-slate-500">{c.country}</p>
                        <p className="text-xs font-semibold text-brand-600 mt-2">${c.avgCost} / day avg</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">{c.tripsCount}</span>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Stops Scheduled</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <Card className="border-slate-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">Platform User Accounts</CardTitle>
                <p className="text-xs text-slate-500">Manage user access permissions, role assignments, and member records.</p>
              </div>

              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search users by name or email..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Joined Date</th>
                      <th className="py-3 px-4">Trips Created</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-600/10 text-brand-600 font-bold flex items-center justify-center border border-brand-200">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={u.role.includes('Admin') ? 'primary' : 'secondary'}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{u.createdAt}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{u.tripsCount} trips</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleUserRole(u.id, u.role)}
                              className="text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Toggle User Role"
                            >
                              Toggle Role
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: TRIP MODERATION */}
        {activeTab === 'trips' && (
          <Card className="border-slate-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">Platform Travel Itineraries</CardTitle>
                <p className="text-xs text-slate-500">Review all created trips across users, inspect public status, or moderate content.</p>
              </div>

              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search trips or owner..."
                  value={tripQuery}
                  onChange={(e) => setTripQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                      <th className="py-3 px-4">Trip Title</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Travel Dates</th>
                      <th className="py-3 px-4">Budget</th>
                      <th className="py-3 px-4">Stops</th>
                      <th className="py-3 px-4">Sharing</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredTrips.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {t.destinations?.join(' • ')}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 text-xs">{t.user_name}</p>
                          <p className="text-[11px] text-slate-500">{t.user_email}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {t.startDate} to {t.endDate}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">${t.budget?.toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{t.stopsCount} stops</td>
                        <td className="py-3 px-4">
                          {t.isPublic ? (
                            <Badge variant="success">Public Shared</Badge>
                          ) : (
                            <Badge variant="neutral">Private</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/trips/${t.id}`)}
                              className="text-slate-500 hover:text-brand-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                              title="View Itinerary"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {t.isPublic && (
                              <button
                                onClick={() => window.open(`/shared/${t.publicId}`, '_blank')}
                                className="text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Open Shared Public View"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTrip(t.id, t.title)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete Trip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
};
