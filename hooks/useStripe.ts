import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../supabase/client';

export function useStripe() {
  const { user } = useAuth();

  const createCheckoutSession = useCallback(
    async (priceId: string, mode: 'payment' | 'subscription') => {
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Get the current session to access the token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            mode,
            success_url: `${window.location.origin}/subscription/success`,
            cancel_url: `${window.location.origin}/subscription`,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      return url;
    },
    [user]
  );

  return {
    createCheckoutSession,
  };
}
