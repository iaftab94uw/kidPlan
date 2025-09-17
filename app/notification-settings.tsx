import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Bell, BellOff } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationSettings() {
  const router = useRouter();
  const {
    settings,
    updateSettings,
    isRegistered,
    isLoading,
  } = useNotifications();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    setIsUpdating(true);
    try {
      await updateSettings({ 
        pushNotifications: value,
        eventReminders: value,
        familyUpdates: value,
        photoUpdates: value,
        scheduleReminders: value,
        soundEnabled: value,
        vibrationEnabled: value
      });
    } catch (error) {
      console.error('Error updating notification setting:', error);
      Alert.alert('Error', 'Failed to update notification setting');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            {settings.pushNotifications ? (
              <Bell size={32} color="#FFFFFF" />
            ) : (
              <BellOff size={32} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.heroTitle}>
            {settings.pushNotifications ? 'Notifications On' : 'Notifications Off'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {settings.pushNotifications 
              ? 'Stay updated with important family events and reminders' 
              : 'You won\'t receive any notifications from the app'
            }
          </Text>
        </View>

        {/* Main Control Card */}
        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View style={styles.controlIconContainer}>
              {settings.pushNotifications ? (
                <Bell size={20} color="#0e3c67" />
              ) : (
                <BellOff size={20} color="#9CA3AF" />
              )}
            </View>
            <View style={styles.controlText}>
              <Text style={styles.controlTitle}>Push Notifications</Text>
              <Text style={styles.controlDescription}>
                {settings.pushNotifications 
                  ? 'Receive notifications from the app' 
                  : 'Notifications are currently disabled'
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            {isUpdating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0e3c67" />
                <Text style={styles.loadingText}>Updating...</Text>
              </View>
            ) : (
              <Switch
                value={settings.pushNotifications}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E5E7EB', true: '#0e3c67' }}
                thumbColor={settings.pushNotifications ? '#FFFFFF' : '#FFFFFF'}
                style={styles.switch}
              />
            )}
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: isLoading ? '#F59E0B' : isRegistered ? '#10B981' : '#EF4444' }
            ]}>
              <Text style={styles.statusIndicatorText}>
                {isLoading ? '⏳' : isRegistered ? '✓' : '⚠️'}
              </Text>
            </View>
            <Text style={styles.statusTitle}>Status</Text>
          </View>
          <Text style={styles.statusText}>
            {isLoading ? (
              'Checking notification status...'
            ) : isRegistered ? (
              'Notifications are properly configured and ready to receive updates'
            ) : (
              'Notification permissions may need to be enabled in your device settings'
            )}
          </Text>
        </View>

        {/* Benefits Section */}
        {settings.pushNotifications && (
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>What you'll receive:</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitIconText}>📅</Text>
                </View>
                <Text style={styles.benefitText}>Event reminders and updates</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitIconText}>👨‍👩‍👧‍👦</Text>
                </View>
                <Text style={styles.benefitText}>Family member notifications</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitIconText}>📸</Text>
                </View>
                <Text style={styles.benefitText}>Photo sharing updates</Text>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitIconText}>⏰</Text>
                </View>
                <Text style={styles.benefitText}>Schedule reminders</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0e3c67',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0e3c67',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  // Control Card
  controlCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  controlText: {
    flex: 1,
  },
  controlTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  controlDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  switchContainer: {
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#0e3c67',
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  // Status Card
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  // Benefits Card
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitIconText: {
    fontSize: 16,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
});