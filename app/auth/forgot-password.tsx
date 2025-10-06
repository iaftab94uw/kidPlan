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
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import Banner from '@/components/Banner';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY, GLASS } from '@/theme/colors';



export default function ForgotPassword() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
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
  }>({});

  const showBanner = (type: 'error' | 'success', message: string) => {
    setBanner({ visible: true, type, message });
  };

  const dismissBanner = () => {
    setBanner(prev => ({ ...prev, visible: false }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      showBanner('error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      
      await forgotPassword(email);
      setEmailSent(true);
      showBanner('success', 'Password reset instructions sent to your email!');
      
      // Redirect to login screen after 2 seconds
      // setTimeout(() => {
      //   router.replace('/auth/signin');
      // }, 2000);
    } catch (error: any) {
      showBanner('error', error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setEmailSent(false);
    try {
      setIsLoading(true);
      
      await forgotPassword(email);
      setEmailSent(true);
      showBanner('success', 'Password reset instructions sent to your email!');
      
      // Redirect to login screen after 2 seconds
      // setTimeout(() => {
      //   router.replace('/auth/signin');
      // }, 2000);
    } catch (error: any) {
      showBanner('error', error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradientBackground as any}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Banner
              type={banner.type}
              message={banner.message}
              visible={banner.visible}
              onDismiss={dismissBanner}
            />

            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.titleCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                style={styles.titleCardGradient}
              >
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={COLORS.gradientPrimary as any}
                    style={styles.iconGradient}
                  >
                    <Mail size={28} color={COLORS.textLight} />
                  </LinearGradient>
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  No worries! Enter your email address and we'll send you instructions to reset your password.
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.formCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                style={styles.formCardGradient}
              >
                {!emailSent ? (
                  <>
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

                    <TouchableOpacity
                      style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                      onPress={handleResetPassword}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={isLoading ? [COLORS.textMuted, COLORS.textSecondary] as any : COLORS.gradientPrimary as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.resetButtonGradient}
                      >
                        <Text style={styles.resetButtonText}>
                          {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.successSection}>
                    <View style={styles.successIconContainer}>
                      <CheckCircle size={64} color={COLORS.success} />
                    </View>
                    <Text style={styles.successTitle}>Check Your Email</Text>
                    <Text style={styles.successSubtitle}>
                      We've sent password reset instructions to:
                    </Text>
                    <Text style={styles.emailAddress}>{email}</Text>
                    <Text style={styles.instructionText}>
                      Click the link in the email to reset your password. If you don't see the email, check your spam folder.
                    </Text>

                    <TouchableOpacity
                      style={styles.resendButton}
                      onPress={handleResendEmail}
                    >
                      <Text style={styles.resendButtonText}>Resend Email</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signin')}>
                <Text style={styles.footerLink}>Sign In</Text>
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
    ...GLASS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCard: {
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.large,
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
    ...SHADOWS.medium,
  },
  title: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
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
    ...SHADOWS.large,
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
  resetButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  resetButtonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.bold,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
  },
  successIconContainer: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.extrabold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emailAddress: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  resendButton: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
  },
  resendButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
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