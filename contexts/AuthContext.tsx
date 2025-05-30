import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabase/client';

type User = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isPro: boolean;
  subscriptionEndsAt?: Date;
  settings: Record<string, any>;
  calibrated_ppi?: number;
};

type AuthContextType = {
  user: User | null;
  authInitialized: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  authInitialized: false,
  isLoading: true,
  signUp: async () => {},
  login: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- add this line

  useEffect(() => {
    setIsLoading(true); // <-- set loading true at start
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } else if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false); // <-- set loading false if no session
      }
      setAuthInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsLoading(true); // <-- set loading true on auth state change
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false); // <-- set loading false if no session
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (authUser: any) => {
    try {
      // Get the latest user data to ensure we have the email
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser?.email) {
        throw new Error('Failed to get user data');
      }

      // First, check if the user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!profile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .upsert({
            id: authUser.id,
            email: currentUser.email,
            is_pro: false,
            settings: {},
            calibrated_ppi: 96,
          })
          .select()
          .single();

        if (createError) throw createError;

        setUser({
          id: newProfile.id,
          email: currentUser.email,
          isPro: newProfile.is_pro,
          settings: newProfile.settings || {},
          calibrated_ppi: newProfile.calibrated_ppi,
        });
      } else {
        // Profile exists, use it
        setUser({
          id: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          isPro: profile.is_pro,
          subscriptionEndsAt: profile.subscription_ends_at
            ? new Date(profile.subscription_ends_at)
            : undefined,
          settings: profile.settings || {},
          calibrated_ppi: profile.calibrated_ppi,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(null);
    } finally {
      setIsLoading(false); // <-- always set loading false after profile load
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
    } catch (error: any) {
      console.error('Error signing up:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw loginError;
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error logging out:', error);
      throw new Error(error.message || 'Failed to log out');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
          settings: updates.settings,
          calibrated_ppi: updates.calibrated_ppi,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local user state
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authInitialized,
        isLoading, // <-- add this to context value
        signUp,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
