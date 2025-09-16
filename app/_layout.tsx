import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/hooks/useAuth';
import { AppEventsProvider } from '@/hooks/useAppEvents';
import { NotificationProvider } from '@/components/NotificationProvider';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <AppEventsProvider>
        <NotificationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" backgroundColor="#0e3c67" />
        </NotificationProvider>
      </AppEventsProvider>
    </AuthProvider>
  );
}
