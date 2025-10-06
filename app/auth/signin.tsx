import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import Banner from '@/components/Banner';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY, GLASS } from '@/theme/colors';

export default function SignIn() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<{
    visible: boolean;
    type: 'error' | 'success';
    message: string;
  }>({
    visible: false,
    type: 'error',
    message: ''
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const showBanner = (type: 'error' | 'success', message: string) => {
    setBanner({ visible: true, type, message });
  };

  const dismissBanner = () => {
    setBanner(prev => ({ ...prev, visible: false }));
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await login(email, password);
      showBanner('success', 'Login successful!');
    } catch (error: any) {
      showBanner('error', error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradientBackground}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Banner
              type={banner.type}
              message={banner.message}
              visible={banner.visible}
              onDismiss={dismissBanner}
            />

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Title Section with Gradient Card */}
            <View style={styles.titleCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.titleCardGradient}
              >
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={COLORS.gradientPrimary}
                    style={styles.iconGradient}
                  >
                    <LogIn size={28} color={COLORS.textLight} />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue to KidPlan</Text>
              </LinearGradient>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                style={styles.formCardGradient}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={[
                      styles.input,
                      errors.email && styles.inputError
                    ]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.inputPlaceholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[
                    styles.passwordContainer,
                    errors.password && styles.passwordContainerError
                  ]}>
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={COLORS.inputPlaceholder}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={COLORS.textSecondary} />
                      ) : (
                        <Eye size={20} color={COLORS.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push('/auth/forgot-password')}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={handleSignIn}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isLoading ? [COLORS.textMuted, COLORS.textSecondary] : COLORS.gradientPrimary}
                    style={styles.signInButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.signInButtonText}>
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    ...GLASS.cardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCard: {
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  titleCardGradient: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.lg,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  title: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  formCardGradient: {
    padding: SPACING.xxl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBackground,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.inputBackground,
  },
  passwordContainerError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  signInButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  signInButtonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.bold,
  },
});
