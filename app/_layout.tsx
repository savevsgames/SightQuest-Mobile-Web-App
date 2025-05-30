import { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { VisualAcuityProvider } from '@/contexts/VisualAcuityContext';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after fonts have loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // If fonts haven't loaded and there's no error, return null to keep showing the splash screen
  if (!fontsLoaded && !fontError) {
    return null;
  }

  console.log('Expo SDK Version (runtime):', Constants.expoVersion);

  return (
    <ThemeProvider>
      <AuthProvider>
        <FeatureFlagProvider>
          <VisualAcuityProvider>
            <View style={styles.container}>
              <View
                style={[
                  styles.phoneContainer,
                  Platform.OS === 'web' && (styles.phoneContainerWeb as any),
                ]}
              >
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  {/* <Stack.Screen name="auth" /> */}
                  <Stack.Screen name="about" />
                  <Stack.Screen
                    name="+not-found"
                    options={{ title: 'Not Found' }}
                  />
                </Stack>
                <StatusBar style="auto" />
              </View>
            </View>
          </VisualAcuityProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  } as const,
  phoneContainer: {
    flex: 1,
  } as const,
  phoneContainerWeb: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    height: '100%',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  } as const,
});
