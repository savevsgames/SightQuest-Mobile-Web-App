import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client'; // use the initialized client
import { useAuth } from '@/contexts/AuthContext';

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isPro: boolean;
  subscriptionEndsAt?: Date;
  settings: Record<string, any>;
  calibrated_ppi?: number;
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  subscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: number;
};

export function useUserProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select(
            `
            id,
            email,
            display_name,
            avatar_url,
            is_pro,
            subscription_ends_at,
            settings,
            calibrated_ppi,
            stripe_customers!inner (
              customer_id,
              stripe_subscriptions (
                subscription_id,
                status,
                price_id,
                current_period_start,
                current_period_end,
                cancel_at_period_end
              )
            )
          `
          )
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;

        if (!profileData) {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              is_pro: false,
              settings: {},
              calibrated_ppi: 96,
            })
            .select()
            .single();

          if (createError) throw createError;

          setProfile({
            id: newProfile.id,
            email: newProfile.email,
            isPro: newProfile.is_pro,
            settings: newProfile.settings || {},
            calibrated_ppi: newProfile.calibrated_ppi,
          });
        } else {
          const subscription =
            profileData.stripe_customers?.stripe_subscriptions?.[0];

          setProfile({
            id: profileData.id,
            email: profileData.email,
            displayName: profileData.display_name,
            avatarUrl: profileData.avatar_url,
            isPro: profileData.is_pro,
            settings: profileData.settings || {},
            subscriptionEndsAt: profileData.subscription_ends_at
              ? new Date(profileData.subscription_ends_at)
              : undefined,
            calibrated_ppi: profileData.calibrated_ppi,
            stripeCustomerId: profileData.stripe_customers?.customer_id,
            subscriptionStatus: subscription?.status,
            subscriptionId: subscription?.subscription_id,
            cancelAtPeriodEnd: subscription?.cancel_at_period_end,
            currentPeriodEnd: subscription?.current_period_end,
          });
        }
      } catch (err: any) {
        console.error('Error loading user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [authUser?.id]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
          settings: updates.settings,
          calibrated_ppi: updates.calibrated_ppi,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
  };
}
