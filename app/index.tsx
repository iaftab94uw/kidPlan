import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // The AuthProvider will handle the authentication check and routing
    // We just need to show the splash screen while it's loading
    console.log('Splash screen - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
  }, [isAuthenticated, isLoading]);

  // If authentication check is complete, let the AuthProvider handle routing
  if (!isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.tagline}>Smart Family Scheduling</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e3c67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
});