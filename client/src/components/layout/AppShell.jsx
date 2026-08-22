import React from 'react';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../ui/Toast';

export const AppShell = ({
  children,
  stateMode,
  onStateModeChange,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-50 text-brand-900 font-sans antialiased overflow-x-hidden">
      {/* Floating Top Navbar */}
      <Navbar stateMode={stateMode} onStateModeChange={onStateModeChange} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-8 animate-fade-in mt-4">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
