import React, { useState } from 'react';
import { User, Bell, Lock, Shield, Save } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex.morgan@example.com');
  const [location, setLocation] = useState(user?.location || 'San Francisco, CA');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your profile and preferences have been updated.',
      });
    }, 400);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Account & Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your personal details, travel preferences, and security settings.
          </p>
        </div>

        <form onSubmit={handleSave}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Update your public profile and home currency defaults.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm"
                />
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-[11px] text-slate-400 mt-1">JPG, GIF or PNG. Max size 2MB.</p>
                </div>
              </div>

              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Primary Base City / Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppShell>
  );
};
