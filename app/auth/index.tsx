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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Calendar, Users, Camera, Shield, Sparkles, Heart } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY, GLASS } from '@/theme/colors';

const { width, height } = Dimensions.get('window');

export default function AuthWelcome() {
  const router = useRouter();

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Sync school calendars and manage family events effortlessly",
      gradient: [COLORS.accent, COLORS.accentDark],
    },
    {
      icon: Users,
      title: "Family Co-ordination",
      description: "Keep everyone in sync with shared calendars and updates",
      gradient: [COLORS.primary, COLORS.primaryDark],
    },
    {
      icon: Camera,
      title: "Memory Sharing",
      description: "Capture and share precious family moments securely",
      gradient: [COLORS.secondary, COLORS.secondaryDark],
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Your family's data is encrypted and protected",
      gradient: [COLORS.success, COLORS.successLight],
    }
  ];

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={COLORS.gradientHero}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.logoGradient}
              >
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>

            <View style={styles.heroTextContainer}>
              <View style={styles.sparkleContainer}>
                <Sparkles size={24} color={COLORS.secondary} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to KidPlan</Text>
              <Text style={styles.welcomeSubtitle}>
                The smart way to organize your family's schedule and create lasting memories together
              </Text>
            </View>
          </View>

          {/* Features Cards */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresSectionTitle}>Why families love KidPlan</Text>

            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                  style={styles.featureCardGradient}
                >
                  <LinearGradient
                    colors={feature.gradient}
                    style={styles.featureIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <feature.icon size={24} color={COLORS.textLight} />
                  </LinearGradient>

                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/auth/signup')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Get Started Free</Text>
                <Heart size={20} color={COLORS.textLight} fill={COLORS.textLight} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/signin')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Trusted by families worldwide 🌍
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 40 : 20,
  },
  heroSection: {
    paddingTop: 40,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.xxl,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...SHADOWS.xl,
  },
  logo: {
    width: 70,
    height: 70,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  sparkleContainer: {
    marginBottom: SPACING.sm,
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.xxxl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: TYPOGRAPHY.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: SPACING.sm,
  },
  featuresSection: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  featuresSectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  featureCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  featureCardGradient: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  buttonSection: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
  secondaryButton: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
  },
  footerText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: TYPOGRAPHY.sm,
    marginTop: SPACING.md,
  },
});
