import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Users, Camera, Shield } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AuthWelcome() {
  const router = useRouter();

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Sync school calendars and family events"
    },
    {
      icon: Users,
      title: "Co-Parenting",
      description: "Coordinate seamlessly with your partner"
    },
    {
      icon: Camera,
      title: "Memory Sharing",
      description: "Capture and share precious moments"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your family data stays protected"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image 
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeTitle}>Welcome to KidPlan</Text>
            <Text style={styles.welcomeSubtitle}>
              The smart way to organise your family's schedule and create lasting memories
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <feature.icon size={24} color="#0e3c67" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/signin')}
            >
              <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0e3c67',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  featuresSection: {
    paddingVertical: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 8,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0e3c67',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  buttonSection: {
    paddingBottom: Platform.OS === 'android' ? 60 : 20,
  },
  primaryButton: {
    backgroundColor: '#0e3c67',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0e3c67',
    fontSize: 14,
    fontWeight: '500',
  },
});