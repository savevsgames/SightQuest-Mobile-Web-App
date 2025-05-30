import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../supabase/client';



export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Handling email confirmation with params:', params);

        if (params.type === 'email_confirmation') {
          const accessToken = params.access_token as string;
          const refreshToken = params.refresh_token as string;

          if (!accessToken || !refreshToken) {
            throw new Error('No tokens found in URL');
          }

          console.log('Setting session with tokens');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          console.log('Getting user data');
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) throw userError || new Error('No user found');

          // Create user profile if it doesn't exist
          const { data: existingProfile } = await supabase
            .from('users')
            .select()
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            const { error: createError } = await supabase.from('users').insert({
              id: user.id,
              email: user.email,
              is_pro: false,
              settings: {},
            });

            if (createError) throw createError;
          }

          console.log('Email confirmation successful, redirecting to home');
          router.replace('/(tabs)');
        } else {
          console.log('Not an email confirmation, redirecting to login');
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Error handling email confirmation:', error);
        router.replace('/auth/login?error=confirmation-failed');
      }
    };

    handleEmailConfirmation();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0284C7" />
      <Text style={styles.text}>Verifying your email...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  text: {
    marginTop: 16,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#0E7490',
  },
});
