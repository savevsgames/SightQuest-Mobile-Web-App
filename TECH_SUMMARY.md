# SightQuest Technical Stack Overview

This document provides a comprehensive overview of the technical stack used in SightQuest, serving as a reference for similar cross-platform applications.

## Core Technologies

### Frontend Framework
- **React Native (0.79.2)**: Cross-platform mobile framework
- **Expo SDK (53.0.9)**: Managed workflow for simplified development
- **Expo Router (4.0.17)**: File-based routing system with type safety
- **TypeScript**: Static typing and enhanced developer experience

### Backend & Database
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication
  - Storage for user avatars

### State Management
- **React Context**: Global state management
  - AuthContext: User authentication state
  - ThemeContext: Application theming
  - FeatureFlagContext: Feature toggles
  - Custom contexts for specific features

### UI & Styling
- **React Native StyleSheet**: Native styling solution
- **@expo-google-fonts/inter**: Typography management
  - Inter_400Regular
  - Inter_500Medium
  - Inter_600SemiBold
  - Inter_700Bold

### Animation & Gestures
- **react-native-reanimated (3.17.4)**: Advanced animations
- **react-native-gesture-handler (2.24.0)**: Native gesture handling

### Navigation
- **expo-router**: File-based routing
  - Tab navigation
  - Stack navigation
  - Type-safe routes

### Data Fetching
- **@supabase/supabase-js**: Supabase client
- **react-native-url-polyfill**: URL compatibility

## Platform Compatibility

### Web Support
- **react-native-web (0.20.0)**: Web rendering
- **react-dom (19.0.0)**: Web DOM manipulation
- Platform-specific code using `Platform.select()`

### Mobile Support
- iOS and Android through Expo managed workflow
- Native features through Expo modules
- Safe area handling with `react-native-safe-area-context`

## Development Tools

### Build & Development
- **expo-cli**: Development tooling
- **TypeScript**: Type checking
- **Prettier**: Code formatting

### Environment Variables
- Expo's built-in env system
- `.env` file support
- Type-safe environment variables

## Recommended Additions for Medical Notes App

### AI Integration
- **OpenAI GPT-4**
  - Chat completion API
  - Function calling for structured data
  - System prompts for medical context

### Real-time Chat
- **Redis**
  - Temporary chat storage
  - Session management
  - Message queuing

### Database Schema Extensions
```sql
-- Chat Sessions
CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id),
  role text CHECK (role IN ('user', 'assistant', 'system')),
  content text,
  created_at timestamptz DEFAULT now()
);

-- Chat Summaries
CREATE TABLE chat_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  start_date timestamptz,
  end_date timestamptz,
  summary text,
  created_at timestamptz DEFAULT now()
);
```

### Additional Dependencies
```json
{
  "dependencies": {
    "openai": "^4.28.0",
    "redis": "^4.6.13",
    "date-fns": "^3.6.0"
  }
}
```

## Key Architecture Decisions

1. **Web-First Approach**
   - Primary platform is web
   - Mobile support through React Native Web
   - Platform-specific code when needed

2. **Type Safety**
   - TypeScript throughout
   - Type-safe routing with Expo Router
   - Type-safe API calls

3. **Authentication & Security**
   - Supabase authentication
   - Row Level Security (RLS)
   - Secure environment variables

4. **Real-time Features**
   - Supabase real-time subscriptions
   - WebSocket connections
   - Optimistic updates

5. **Data Persistence**
   - PostgreSQL for permanent storage
   - Redis for temporary chat storage
   - Local storage for offline support

## Performance Considerations

1. **Code Splitting**
   - Automatic through Expo Router
   - Lazy loading of routes
   - Dynamic imports where needed

2. **Asset Optimization**
   - Image optimization
   - Font loading strategy
   - Bundle size management

3. **State Management**
   - Context API for global state
   - Local state for component-level data
   - Memoization where needed

## Testing Strategy

1. **Unit Testing**
   - Jest for component testing
   - React Native Testing Library
   - Mock service workers

2. **Integration Testing**
   - End-to-end with Cypress
   - API integration tests
   - Authentication flows

3. **Performance Testing**
   - Lighthouse scores
   - Bundle size monitoring
   - Performance metrics tracking

## Deployment

1. **Web Deployment**
   - Netlify for static hosting
   - Edge functions for API routes
   - Environment variable management

2. **Mobile Deployment**
   - Expo Application Services (EAS)
   - Over-the-air updates
   - App store submissions

## Monitoring & Analytics

1. **Error Tracking**
   - Error boundary implementation
   - Error logging service
   - User feedback collection

2. **Performance Monitoring**
   - Real User Monitoring (RUM)
   - API performance tracking
   - Resource utilization

3. **Usage Analytics**
   - User behavior tracking
   - Feature adoption metrics
   - A/B testing capability

## Security Measures

1. **Authentication**
   - JWT-based auth
   - Session management
   - Role-based access control

2. **Data Protection**
   - End-to-end encryption for chats
   - Data encryption at rest
   - Secure data transmission

3. **Compliance**
   - HIPAA compliance measures
   - Data retention policies
   - Audit logging

This technical stack provides a solid foundation for building a medical notes application with AI capabilities while maintaining cross-platform compatibility and scalability.