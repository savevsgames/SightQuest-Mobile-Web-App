import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function Index() {
  useFrameworkReady();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (user && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading]);

  return (
    <LinearGradient colors={['#E0F2FE', '#ECFEFF']} style={[styles.container]}>
      <Animated.View
        style={styles.logoContainer}
        entering={FadeIn.delay(300).duration(800)}
      >
        <Image
          source={require('@/assets/images/logo-blue-light.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>SightQuest</Text>
      </Animated.View>

      <Animated.View
        style={styles.taglineContainer}
        entering={FadeInDown.delay(600).duration(1000)}
      >
        <Text style={styles.tagline}>Embark on a journey to</Text>
        <Text style={styles.taglineSecond}>better vision.</Text>
      </Animated.View>

      <Animated.View
        style={styles.buttonContainer}
        entering={FadeInDown.delay(1200).duration(800)}
      >
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => router.push('/auth/sign-up')}
        >
          <Text style={styles.signUpButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#0C4A6E',
    marginTop: 16,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 22,
    color: '#0E7490',
    textAlign: 'center',
  },
  taglineSecond: {
    fontFamily: 'Inter-Medium',
    fontSize: 22,
    color: '#0E7490',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  signUpButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: '#F0F9FF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  loginButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#0284C7',
  },
});
