EyeGuard-MobileApp

# SightQuest-Mobile-Web-App

# SightQuest

SightQuest is a modern web-first React Native application built using Expo's managed workflow. The app enables users to monitor and understand their visual health through interactive vision tests, analytics, and subscription features.

---

## Table of Contents

- [SightQuest-Mobile-Web-App](#sightquest-mobile-web-app)
- [SightQuest](#sightquest)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Core Technologies](#core-technologies)
  - [Project Structure](#project-structure)
  - [Routing System](#routing-system)
  - [Authentication](#authentication)
  - [Database \& Backend](#database--backend)
  - [State Management](#state-management)
  - [Vision Tests](#vision-tests)
  - [Charts \& History](#charts--history)
  - [Theme System](#theme-system)
  - [Stripe Integration](#stripe-integration)
  - [Future Improvements](#future-improvements)
  - [Contributing](#contributing)

---

## Architecture Overview

SightQuest follows a client-server architecture:

- **Frontend:** Expo-managed React Native app, optimized for web deployment.
- **Backend:** Supabase for authentication, database, and storage.
- **Payments:** Stripe for subscription management.

**Key Design Decisions:**

- Web-first, but cross-platform ready.
- Modular, type-safe, and component-driven.
- Managed workflow for simplified development and deployment.

---

## Core Technologies

- **Expo SDK:** Managed workflow, web-optimized, cross-platform.
- **Expo Router:** File-based, type-safe navigation.
- **React Native:** Native UI components, platform-specific optimizations.
- **TypeScript:** Static typing for reliability.
- **Supabase:** Auth, database, storage, and backend logic.
- **Stripe:** Subscription and payment processing.

---

## Project Structure

```
project/
├── app/                    # Route-based components (Expo Router)
│   ├── (tabs)/            # Tab navigation routes
│   ├── auth/              # Authentication routes
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── history/          # History and chart components
│   └── tests/            # Vision test components
├── contexts/             # React Context providers
├── hooks/                # Custom hooks
├── lib/                  # Utilities and configs
├── supabase/             # Supabase client/config
└── types/                # TypeScript types
```

---

## Routing System

- **Tab Navigation:** Main navigation uses Expo Router's tab system.
- **Protected Routes:** `useProtectedRoute` hook redirects unauthenticated users.
- **Auth Flow:** `/auth/login` and `/auth/sign-up` for authentication.

---

## Authentication

- **Supabase Auth:** Email/password authentication.
- **AuthContext:** Maintains user state, session, and profile.
- **User Flow:**
  1. User signs up/logs in.
  2. Supabase creates session.
  3. User profile is created/fetched.
  4. Auth state is managed globally.

---

## Database & Backend

- **Supabase Postgres:** Stores users, tests, subscriptions.
- **Row Level Security:** Ensures users can only access their own data.

---

## State Management

- **Contexts:** Auth, Theme, FeatureFlag, VisualAcuity.
- **Local State:** Managed with React's `useState` and `useReducer`.

---

## Vision Tests

- **Letter Acuity Test:** Measures visual acuity (Snellen score).
- **Contrast Sensitivity Test:** Light/dark backgrounds, minimum detectable contrast.
- **Color Blindness Test:** Ishihara plates, detects color vision deficiencies.
- **Additional Tests:** More tests will be added, and test logic will be improved in next development cycle.
- **Test Flow:** Calibration → Instructions → Test → Results → Data Storage.

---

## Charts & History

- **Charts:** Uses `react-native-chart-kit` for progress visualization.
- **Features:** Line charts, tooltips, responsive design, date filtering.

---

## Theme System

- **Light/Dark Themes:** Managed via ThemeContext.
- **Customizable Colors:** Easily switch between light and dark modes.

---

## Stripe Integration

- **Checkout:** Stripe Checkout for payments.
- **Edge Functions:** Supabase Edge Functions for secure API calls.
- **Webhooks:** Handle subscription status updates.
- **Database:** `stripe_customers` and `stripe_subscriptions` tables.

---

## Future Improvements

- **Performance:** Virtualized lists, optimized chart rendering, image caching.
- **Testing:** Unit, E2E, and visual regression tests.
- **Accessibility:** Screen reader support, keyboard navigation, high contrast mode.
- **Features:** More vision tests, advanced analytics, export, sharing, professional portal.
- **Infrastructure:** Staging, CI/CD, backups, monitoring, security audits.
- **Business:** Family plans, enterprise licensing, referral programs, professional features.

---

## Contributing

See the codebase and [BREAKDOWN.md](./BREAKDOWN.md) for more technical details and roadmap.

---

**This README provides a comprehensive overview of the SightQuest app. For deeper technical details, see BREAKDOWN.md.**
