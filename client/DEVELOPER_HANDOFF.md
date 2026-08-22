# GlobeTrotter Frontend Foundation & Developer Handoff Guide

Welcome to the **GlobeTrotter** shared frontend architecture! This repository contains the complete design system, responsive application shell, component library, authentication flows, interactive dashboard, mock API layer, and routing structure.

---

## Quick Start for Developers

```bash
# 1. Install dependencies
npm install

# 2. Start local Vite development server
npm run dev

# 3. Build production bundle for verification
npm run build
```

---

## Technology Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (v3)
- **Icons**: Lucide React (`lucide-react`)
- **Routing**: React Router v6 (`react-router-dom`)
- **State & Notifications**: React Context (`AuthContext`, `ToastContext`) + custom hooks (`useAuth`, `useToast`)
- **Service Layer**: Asynchronous API facade in `src/services/apiService.js`

---

## Design System Tokens & Classes

### 1. Color Palette
- **Brand Primary**: Deep Indigo / Violet (`bg-brand-600`, `text-brand-600`, `#4F46E5` / `#6366F1`)
- **Travel Accent**: Warm Sun Orange (`bg-travel-500`, `text-travel-500`, `#F97316`)
- **Surface Background**: Light Neutral (`bg-slate-50`, `#F8FAFC`)
- **Cards & Elevated Surfaces**: Pure White (`bg-white`)
- **Dark Sidebar Surface**: Deep Slate (`bg-slate-900` / `#0F172A`)
- **Typography & Headlines**: Slate 900 (`text-slate-900`, `#0F172A`)
- **Status Indicators**:
  - Success: `bg-emerald-50 text-emerald-700`
  - Warning: `bg-amber-50 text-amber-700`
  - Danger: `bg-rose-50 text-rose-700`

### 2. Geometry & Spacing
- **Border Radius**: 12px (`rounded-xl`) and 16px (`rounded-2xl`)
- **Content Max Width**: 1280px (`max-w-7xl mx-auto`)
- **Padding Scale**: Desktop `px-6 py-8`, Mobile `px-4 py-6` (8px-based grid)
- **Input & Button Heights**: `h-10` (medium) and `h-11` / `h-12` (large)

---

## Shared UI Component Library (`src/components/ui/`)

### 1. `Button`
```jsx
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

<Button
  variant="primary" // 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size="md"         // 'sm' | 'md' | 'lg'
  isLoading={false}
  leftIcon={<Plus className="w-4 h-4" />}
  onClick={() => {}}
>
  Plan New Trip
</Button>
```

### 2. `Input`
```jsx
import { Input } from '@/components/ui/Input';
import { Mail } from 'lucide-react';

<Input
  label="Email Address"
  type="email"
  placeholder="name@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  leftIcon={<Mail className="w-4 h-4" />}
  error={errors.email}
  required
/>
```

### 3. `Select`
```jsx
import { Select } from '@/components/ui/Select';

<Select
  label="Filter Status"
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  options={[
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
  ]}
/>
```

### 4. `Card` Family
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

<Card hoverEffect>
  <CardHeader>
    <CardTitle>Tokyo Itinerary</CardTitle>
    <CardDescription>4 Days in Shinjuku & Shibuya</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
</Card>
```

### 5. `Badge`
```jsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="primary" showDot>Upcoming</Badge>
```

### 6. `Modal`
```jsx
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add Activity"
  footer={<Button onClick={() => setIsOpen(false)}>Save</Button>}
>
  <p>Modal body content</p>
</Modal>
```

### 7. Toast Notifications (`useToast`)
```jsx
import { useToast } from '@/hooks/useToast';

const { addToast } = useToast();

addToast({
  type: 'success', // 'success' | 'error' | 'warning' | 'info'
  title: 'Trip Saved!',
  message: 'Your itinerary changes have been saved.',
});
```

### 8. Empty, Loading, and Error States
```jsx
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, SkeletonMetrics } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

<EmptyState
  title="No trips found"
  description="Get started by creating your first multi-city trip."
  actionLabel="Plan New Trip"
  onAction={handleCreate}
/>
```

---

## App Shell Layout (`AppShell`)

Every new page added to the application should be wrapped with `AppShell` to inherit the global desktop sidebar, responsive top navbar, mobile bottom navigation, and notification toasts.

```jsx
import { AppShell } from '@/components/layout/AppShell';

export const MyNewPage = () => {
  return (
    <AppShell>
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Feature Page</h2>
        {/* Your feature components here */}
      </div>
    </AppShell>
  );
};
```

---

## API Service Layer (`src/services/apiService.js`)

To integrate with backend endpoints later, replace the async methods inside `src/services/apiService.js` with standard `fetch()` or `axios` calls:

- `login(email, password)`
- `signup({ name, email, password })`
- `getDashboardData()`
- `getTrips()`
- `getTripById(id)`
- `createTrip(tripData)`
- `getDestinations()`

---

## Route Overview

| Path | Component | Purpose |
| --- | --- | --- |
| `/login` | `LoginPage` | User login & validation |
| `/signup` | `SignupPage` | Account creation & validation |
| `/forgot-password` | `ForgotPasswordPage` | Password recovery |
| `/dashboard` | `DashboardPage` | Main dashboard with interactive state switchers |
| `/trips` | `TripsPage` | My trips grid & filters |
| `/trips/new` | `NewTripPage` | Multi-city itinerary creation wizard stub |
| `/trips/:id` | `TripDetailsPage` | Multi-city itinerary timeline & details |
| `/explore` | `ExplorePage` | Destination catalog & discovery |
| `/calendar` | `CalendarPage` | Scheduled travel calendar |
| `/settings` | `SettingsPage` | User profile & app preferences |

---

## Developer Testing Features

On the **Dashboard** page, click the top navbar dropdown labeled **UI State: Loaded** to toggle live previews of:
1. **Loaded (Default)**: Full rich SaaS dashboard.
2. **Empty State**: New user view with no trips.
3. **Loading (Skeleton)**: Shimmer skeleton card placeholders.
4. **Error State**: Friendly error alert with retry button.
