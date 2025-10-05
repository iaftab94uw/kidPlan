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
import { COLORS, SHADOWS } from '@/theme/colors';



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
    <SafeAreaView style={styles.container}>
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

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#0e3c67" />
            </TouchableOpacity>
            <Text style={styles.headerBrand}>KidPlan</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {!emailSent ? (
              <>
                {/* Title */}
                <View style={styles.titleSection}>
                  <View style={styles.iconContainer}>
                    <Mail size={48} color="#0e3c67" />
                  </View>
                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>
                    No worries! Enter your email address and we'll send you instructions to reset your password.
                  </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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
                      placeholderTextColor="#9CA3AF"
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
                  >
                    <Text style={styles.resetButtonText}>
                      {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Success State */}
                <View style={styles.successSection}>
                  <View style={styles.successIconContainer}>
                    <CheckCircle size={64} color="#059669" />
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
              </>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/signin')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
  bannerClose: {
    padding: 4,
  },
  errorText: {
    color: '#DC2626',
  },
  successText: {
    color: '#059669',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerBrand: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.cardBackground,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  resendButton: {
    backgroundColor: COLORS.secondaryBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resendButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: Platform.OS === 'android' ? 60 : 32,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});