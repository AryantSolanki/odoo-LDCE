import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Plus,
  Compass,
  Menu,
  X,
  Calendar,
  Settings,
  LogOut,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const MobileNav = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  const tabs = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Trips', path: '/trips', icon: MapPin },
    { label: 'Plan', path: '/trips/new', icon: Plus, isAction: true },
    { label: 'Explore', path: '/explore', icon: Compass },
  ];

  return (
    <>
      {/* Bottom Bar Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          if (tab.isAction) {
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center"
              >
                <div className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/30 -mt-5 border-2 border-white">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-brand-600 mt-0.5">{tab.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-medium transition-colors ${
                  isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center px-3 py-1 rounded-xl text-[10px] font-medium text-slate-500 hover:text-slate-900"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Slide-out Mobile Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-slate-900 text-white h-full shadow-2xl flex flex-col z-10 animate-fade-in">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-brand-500" />
                <span className="font-bold text-base tracking-tight">GlobeTrotter</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt={user?.name || 'User'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                }}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{user?.name || 'Alex Morgan'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'alex.morgan@example.com'}</p>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Navigation</p>
              <NavLink
                to="/dashboard"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/trips"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <MapPin className="w-5 h-5" />
                <span>My Trips</span>
              </NavLink>

              <NavLink
                to="/trips/new"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-travel-400 hover:bg-slate-800 font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>Plan New Trip</span>
              </NavLink>

              <NavLink
                to="/explore"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <Compass className="w-5 h-5" />
                <span>Explore Destinations</span>
              </NavLink>

              <NavLink
                to="/calendar"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <Calendar className="w-5 h-5" />
                <span>Travel Calendar</span>
              </NavLink>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Account</p>
                <NavLink
                  to="/settings"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </NavLink>

                <NavLink
                  to="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin Analytics</span>
                </NavLink>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 text-sm font-semibold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
