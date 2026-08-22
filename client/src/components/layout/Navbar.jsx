import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, NavLink } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Compass,
  MapPin,
  PlusCircle,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = ({
  stateMode = 'loaded',
  onStateModeChange,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Discover', path: '/explore' },
    { label: 'My Journeys', path: '/trips' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <div className={`sticky top-0 z-50 px-4 sm:px-6 pt-4 sm:pt-6 transition-all duration-300 ${scrolled ? 'pt-2 sm:pt-2' : ''}`}>
      <header className={`max-w-6xl mx-auto flex items-center justify-between h-16 sm:h-20 px-4 sm:px-8 bg-surface-card/80 backdrop-blur-xl rounded-full border border-surface-border transition-all duration-500 ${scrolled ? 'shadow-card bg-surface-card/95' : 'shadow-subtle'}`}>
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-brand-900 text-brand-50 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105">
            <Globe className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <span className="hidden sm:block text-xl font-editorial font-semibold tracking-wide text-brand-900">
            GlobeTrotter.
          </span>
        </Link>

        {/* Primary Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors ${
                  isActive ? 'text-brand-900 font-semibold' : 'text-brand-600 hover:text-brand-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Quick Search Button */}
          <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-surface-hover text-brand-700 hover:bg-brand-200 hover:text-brand-900 transition-colors">
            <Search className="w-4 h-4" />
          </button>

          {/* Primary CTA */}
          <Link
            to="/trips/new"
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-900 text-brand-50 text-sm font-medium hover:bg-brand-800 transition-colors shadow-subtle hover:shadow-card"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan Journey</span>
          </Link>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 pl-3 pr-1 rounded-full border border-surface-border hover:bg-surface-hover transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5 text-brand-600 hidden sm:block" />
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt={user?.name || 'User'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';
                }}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-surface-card rounded-2xl shadow-dropdown border border-surface-border p-2 z-40 text-sm animate-slide-up">
                <div className="px-3 py-3 border-b border-surface-border mb-1">
                  <p className="font-editorial font-bold text-brand-900 text-base truncate">{user?.name || 'Alex Morgan'}</p>
                  <p className="text-brand-600 text-xs truncate">{user?.email || 'alex.morgan@example.com'}</p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-700 hover:bg-surface-hover transition-colors"
                >
                  <User className="w-4 h-4 text-brand-500" />
                  <span>Account Settings</span>
                </Link>

                <div className="border-t border-surface-border mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-medium"
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
    </div>
  );
};
