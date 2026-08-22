import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services/apiService';
import { useToast } from '../../hooks/useToast';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await apiService.forgotPassword(email);
      setIsSent(true);
      addToast({
        type: 'success',
        title: 'Reset email sent',
        message: `Instructions sent to ${email}`,
      });
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={isSent ? 'Check your email' : 'Reset your password'}
      subtitle={
        isSent
          ? `We've sent a password reset link to ${email}`
          : "Enter your registered email address and we'll send reset instructions."
      }
    >
      {isSent ? (
        <div className="text-center space-y-6 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            Click the link inside the email to set a new password for your GlobeTrotter account. If you don't see it, check your spam folder.
          </p>

          <div className="pt-2 space-y-3">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => setIsSent(false)}
            >
              Resend Password Reset Link
            </Button>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors w-full py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Registered Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            error={error}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send Reset Instructions
            </Button>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors w-full py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
