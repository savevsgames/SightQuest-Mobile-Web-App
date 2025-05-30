# SightQuest Developer Documentation

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Core Technologies](#core-technologies)
- [Project Structure](#project-structure)
- [Routing System](#routing-system)
- [Authentication](#authentication)
- [Database & Backend](#database--backend)
- [State Management](#state-management)
- [Vision Tests](#vision-tests)
- [Charts & History](#charts--history)
- [Theme System](#theme-system)
- [Stripe Integration](#stripe-integration)
- [Future Improvements](#future-improvements)

## Architecture Overview

SightQuest is a modern web-first React Native application built using Expo's managed workflow. The application follows a client-server architecture with Supabase handling the backend services and Stripe managing payments.

### Key Design Decisions

1. **Web-First Approach**: While the app is cross-platform capable, it's optimized for web deployment using Expo's web platform.
2. **Managed Workflow**: Using Expo's managed workflow for simplified development and deployment.
3. **Type Safety**: Comprehensive TypeScript implementation throughout the codebase.
4. **Component Architecture**: Modular component design with clear separation of concerns.

## Core Technologies

### Expo (SDK 52.0.30)
- Managed workflow for cross-platform development
- Web-optimized configuration
- Built-in development tools and APIs

### Expo Router (4.0.17)
- File-based routing system
- Type-safe navigation
- Nested navigation support

### React Native
- Cross-platform UI components
- Native performance optimizations
- Platform-specific adaptations

### TypeScript
- Static type checking
- Enhanced developer experience
- Improved code reliability

## Project Structure

```
project/
├── app/                    # Application routes
│   ├── (tabs)/            # Tab-based navigation routes
│   ├── auth/              # Authentication routes
│   └── _layout.tsx        # Root layout configuration
├── components/            # Reusable components
│   ├── history/          # History-related components
│   └── tests/            # Vision test components
├── contexts/             # React Context providers
├── hooks/               # Custom React hooks
├── lib/                # Utility functions and configurations
├── supabase/           # Supabase configurations and migrations
└── types/              # TypeScript type definitions
```

### Key Directories Explained

#### `/app` Directory
Contains all route-based components following Expo Router's file-based routing convention. The directory structure directly maps to the application's URL structure.

#### `/components` Directory
Houses reusable UI components organized by feature or functionality. Each component follows a single responsibility principle and maintains its own styles.

#### `/contexts` Directory
Contains React Context providers for global state management:
- AuthContext: User authentication state
- ThemeContext: Application theming
- FeatureFlagContext: Feature toggle management

## Routing System

### Tab Navigation
The primary navigation structure uses Expo Router's tab navigation:

```typescript
// app/(tabs)/_layout.tsx
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tests" options={{ title: 'Tests' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

### Route Protection
Protected routes use the `useProtectedRoute` hook:

```typescript
export function useProtectedRoute(redirectTo: string = '/auth/login') {
  const { user, authInitialized } = useAuth();

  useEffect(() => {
    if (!authInitialized) return;
    if (!user) {
      router.replace(redirectTo);
    }
  }, [authInitialized, user, redirectTo]);

  return {
    isAuthenticated: !!user,
    isLoading: !authInitialized
  };
}
```

## Authentication

### Implementation
Authentication is handled through Supabase Auth with email/password authentication:

```typescript
const AuthContext = createContext<AuthContextType>({
  user: null,
  authInitialized: false,
  signUp: async () => {},
  login: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});
```

### User Flow
1. User signs up/logs in through auth screens
2. Supabase creates auth session
3. User profile is created/fetched from database
4. Auth state is maintained through AuthContext

## Database & Backend

### Supabase Schema

#### Users Table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  is_pro boolean DEFAULT false,
  subscription_ends_at timestamptz,
  settings jsonb DEFAULT '{}'::jsonb,
  calibrated_ppi float CHECK (calibrated_ppi >= 72 AND calibrated_ppi <= 600)
);
```

#### Tests Table
```sql
CREATE TABLE tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  test_type text NOT NULL,
  questions jsonb NOT NULL,
  answers jsonb NOT NULL,
  metrics jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Row Level Security (RLS)
Comprehensive RLS policies ensure data security:

```sql
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## State Management

### Context System
The application uses React Context for global state management:

1. **AuthContext**: Handles user authentication state
2. **ThemeContext**: Manages application theming
3. **FeatureFlagContext**: Controls feature availability
4. **VisualAcuityContext**: Manages vision test calculations

### Local State
Component-level state uses React's useState and useReducer hooks where appropriate.

## Vision Tests

### Test Types
1. **Letter Acuity Test**
   - Measures visual acuity using Sloan letters
   - Calculates Snellen score (20/x)
   - Tracks response time and accuracy

2. **Contrast Sensitivity Test**
   - Light and dark background variants
   - Progressive contrast reduction
   - Measures minimum detectable contrast

3. **Color Blindness Test**
   - Ishihara-style plates
   - Detects common color vision deficiencies
   - Provides detailed analysis of results

### Test Implementation
Each test follows a common pattern:
1. Calibration check
2. Instructions display
3. Test execution
4. Results calculation
5. Data storage

## Charts & History

### Chart Implementation
Uses react-native-chart-kit with custom styling:

```typescript
const chartConfig = {
  backgroundColor: theme.surface,
  backgroundGradientFrom: theme.surface,
  backgroundGradientTo: theme.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => theme.primary,
  labelColor: (opacity = 1) => theme.textSecondary,
};
```

### Data Visualization
- Line charts for progress tracking
- Custom tooltips for detailed information
- Responsive design with horizontal scrolling
- Date range filtering

## Theme System

### Theme Configuration
```typescript
export const colors = {
  light: {
    primary: '#0284C7',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
  },
  dark: {
    primary: '#0EA5E9',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
  }
};
```

### Theme Usage
```typescript
const { isDark } = useTheme();
const theme = isDark ? colors.dark : colors.light;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
  },
});
```

## Stripe Integration

### Architecture
- Stripe Checkout for payment processing
- Supabase Edge Functions for secure API calls
- Webhook handling for subscription management

### Database Tables
```sql
CREATE TABLE stripe_customers (
  customer_id text PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE stripe_subscriptions (
  subscription_id text PRIMARY KEY,
  customer_id text REFERENCES stripe_customers(customer_id),
  status stripe_subscription_status NOT NULL,
  price_id text
);
```

### Subscription Flow
1. User initiates subscription
2. Redirect to Stripe Checkout
3. Webhook processes payment
4. Update user subscription status
5. Grant pro features access

## Future Improvements

### Technical Improvements
1. **Performance Optimization**
   - Implement virtualized lists for test history
   - Optimize chart rendering for large datasets
   - Add image caching for Ishihara plates

2. **Testing Coverage**
   - Add unit tests for core components
   - Implement E2E testing with Cypress
   - Add visual regression testing

3. **Accessibility**
   - Improve screen reader support
   - Add keyboard navigation
   - Implement high contrast mode

### Feature Enhancements
1. **Vision Tests**
   - Add astigmatism test
   - Implement depth perception test
   - Add peripheral vision test
   - Support for multiple test distances

2. **Data Analysis**
   - Advanced analytics dashboard
   - Export test history
   - Comparative analysis
   - Trend predictions

3. **User Experience**
   - Guided test calibration
   - Interactive tutorials
   - Progress achievements
   - Social sharing features

4. **Integration**
   - Eye care professional portal
   - Appointment scheduling
   - Test result sharing
   - Electronic health records integration

### Infrastructure
1. **Deployment**
   - Add staging environment
   - Implement CI/CD pipeline
   - Add automated database backups
   - Implement rate limiting

2. **Monitoring**
   - Error tracking system
   - Usage analytics
   - Performance monitoring
   - User behavior tracking

3. **Security**
   - Regular security audits
   - HIPAA compliance
   - Data encryption at rest
   - Two-factor authentication

### Business Features
1. **Subscription System**
   - Family plans
   - Enterprise licensing
   - Referral program
   - Bulk discounts

2. **Professional Features**
   - Practice management
   - Patient records
   - Automated reporting
   - Custom branding

This documentation serves as a comprehensive guide for developers working on the SightQuest project. It outlines the current implementation details and provides a roadmap for future improvements. Regular updates to this document are encouraged as the project evolves.