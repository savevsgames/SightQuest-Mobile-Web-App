import { Stack } from 'expo-router';

export default function TestsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="letter-acuity" />
      <Stack.Screen name="contrast-sensitivity-light" />
      <Stack.Screen name="contrast-sensitivity-dark" />
      <Stack.Screen name="color-blindness" />
    </Stack>
  );
}