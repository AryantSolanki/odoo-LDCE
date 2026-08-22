import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = ({
  stateMode = 'loaded',
  onStateModeChange,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [statePickerOpen, setStatePickerOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = (path) => {
    if (path === '/dashboard') return { title: 'Dashboard', category: 'Overview' };
    if (path === '/trips') return { title: 'My Trips', category: 'Itineraries' };
    if (path === '/trips/new') return { title: 'Plan New Trip', category: 'Wizard' };
    if (path.startsWith('/trips/')) return { title: 'Trip Details', category: 'Itineraries' };
    if (path === '/explore') return { title: 'Explore Destinations', category: 'Discovery' };
    if (path === '/calendar') return { title: 'Travel Calendar', category: 'Schedule' };
    if (path === '/settings') return { title: 'Settings', category: 'Preferences' };
    return { title: 'GlobeTrotter', category: 'Travel SaaS' };
  };

  const currentInfo = getPageTitle(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between transition-all">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <Globe className="w-6 h-6 text-brand-600" />
        </div>

        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>GlobeTrotter</span>
            <span>/</span>
            <span className="text-brand-600">{currentInfo.category}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none mt-0.5 tracking-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Center Search Bar (Hidden on small screens) */}
      <div className="hidden lg:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search trips, cities, flights or collaborators..."
            className="w-full h-9 bg-slate-100/80 hover:bg-slate-100 text-slate-900 placeholder:text-slate-400 text-xs rounded-xl pl-9 pr-4 border border-transparent focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notifications Icon Button */}
        <button
          className="relative text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-travel-500 ring-2 ring-white" />
        </button>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={user?.name || 'User'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
              }}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-slate-200 p-2 z-40 text-xs animate-slide-up">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-900 text-sm truncate">{user?.name || 'Alex Morgan'}</p>
                <p className="text-slate-500 truncate">{user?.email || 'alex.morgan@example.com'}</p>
              </div>

              <Link
                to="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Profile & Settings</span>
              </Link>

              <Link
                to="/explore"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Compass className="w-4 h-4 text-slate-400" />
                <span>Explore Destinations</span>
              </Link>

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
