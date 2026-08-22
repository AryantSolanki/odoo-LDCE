import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const LoginPage = () => {
  const [email, setEmail] = useState('demo@globetrotter.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'Successfully logged in to GlobeTrotter.',
      });
      navigate('/dashboard');
    } catch (err) {
      setErrors({ form: err.message || 'Login failed. Please check your credentials.' });
      addToast({
        type: 'error',
        title: 'Authentication Error',
        message: err.message || 'Login failed.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to manage your multi-city itineraries."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errors.form}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Remember for 30 days</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </div>
      </form>

      {/* Demo Quick Accounts */}
        <div className="pt-3 border-t border-slate-100 mt-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
            Quick Demo 1-Click Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('demo@globetrotter.com');
                setPassword('password123');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors"
            >
              Demo Traveler
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@globetrotter.com');
                setPassword('admin1234');
              }}
              className="px-3 py-1.5 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-[11px] font-semibold text-brand-700 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">
            Create account
          </Link>
        </p>
    </AuthLayout>
  );
};
