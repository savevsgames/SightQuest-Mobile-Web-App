import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

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