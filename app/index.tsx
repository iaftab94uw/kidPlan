import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate checking authentication status
    const checkAuth = async () => {
      // In a real app, you'd check AsyncStorage or secure storage
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always redirect to auth
      // In production, check if user is logged in
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    };

    checkAuth();
  }, []);

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