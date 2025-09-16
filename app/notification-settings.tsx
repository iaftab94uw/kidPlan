import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Bell, BellOff, Volume2, VolumeX, Vibrate, Settings } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationSettings as NotificationSettingsType } from '@/types/notifications';
import { IOSNotificationTest } from '@/components/IOSNotificationTest';

export default function NotificationSettings() {
  const router = useRouter();
  const {
    settings,
    updateSettings,
    openSettings,
    pushToken,
    isRegistered,
    isLoading,
    scheduledNotifications,
    cancelAllNotifications,
  } = useNotifications();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleSetting = async (key: keyof NotificationSettingsType, value: boolean) => {
    setIsUpdating(true);
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating notification setting:', error);
      Alert.alert('Error', 'Failed to update notification setting');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenSystemSettings = async () => {
    try {
      await openSettings();
    } catch (error) {
      console.error('Error opening system settings:', error);
      Alert.alert('Error', 'Failed to open system settings');
    }
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllNotifications();
              Alert.alert('Success', 'All notifications have been cleared');
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({
    title,
    description,
    value,
    onValueChange,
    icon: Icon,
    disabled = false,
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: any;
    disabled?: boolean;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, disabled && styles.iconContainerDisabled]}>
          <Icon size={20} color={disabled ? '#9CA3AF' : '#0e3c67'} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, disabled && styles.settingDescriptionDisabled]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || isUpdating}
        trackColor={{ false: '#E5E7EB', true: '#0e3c67' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

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

      <ScrollView style={styles.content}>
        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Push Notifications</Text>
              <View style={styles.statusValue}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#0e3c67" />
                ) : isRegistered ? (
                  <View style={styles.statusIndicator}>
                    <Bell size={16} color="#10B981" />
                    <Text style={styles.statusTextActive}>Enabled</Text>
                  </View>
                ) : (
                  <View style={styles.statusIndicator}>
                    <BellOff size={16} color="#EF4444" />
                    <Text style={styles.statusTextInactive}>Disabled</Text>
                  </View>
                )}
              </View>
            </View>
            {pushToken && (
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenLabel}>Push Token:</Text>
                <Text style={styles.tokenValue} numberOfLines={2}>
                  {pushToken}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.systemSettingsButton}
              onPress={handleOpenSystemSettings}
            >
              <Settings size={16} color="#0e3c67" />
              <Text style={styles.systemSettingsText}>Open System Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              title="Push Notifications"
              description="Receive push notifications from the app"
              value={settings.pushNotifications}
              onValueChange={(value) => handleToggleSetting('pushNotifications', value)}
              icon={Bell}
            />
            <SettingRow
              title="Event Reminders"
              description="Get reminded about upcoming events"
              value={settings.eventReminders}
              onValueChange={(value) => handleToggleSetting('eventReminders', value)}
              icon={Bell}
              disabled={!settings.pushNotifications}
            />
            <SettingRow
              title="Family Updates"
              description="Notifications about family member changes"
              value={settings.familyUpdates}
              onValueChange={(value) => handleToggleSetting('familyUpdates', value)}
              icon={Bell}
              disabled={!settings.pushNotifications}
            />
            <SettingRow
              title="Photo Updates"
              description="Notifications when new photos are uploaded"
              value={settings.photoUpdates}
              onValueChange={(value) => handleToggleSetting('photoUpdates', value)}
              icon={Bell}
              disabled={!settings.pushNotifications}
            />
            <SettingRow
              title="Schedule Reminders"
              description="Reminders about upcoming schedules"
              value={settings.scheduleReminders}
              onValueChange={(value) => handleToggleSetting('scheduleReminders', value)}
              icon={Bell}
              disabled={!settings.pushNotifications}
            />
          </View>
        </View>

        {/* Sound & Vibration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Vibration</Text>
          <View style={styles.settingsCard}>
            <SettingRow
              title="Sound"
              description="Play sound for notifications"
              value={settings.soundEnabled}
              onValueChange={(value) => handleToggleSetting('soundEnabled', value)}
              icon={settings.soundEnabled ? Volume2 : VolumeX}
            />
            <SettingRow
              title="Vibration"
              description="Vibrate for notifications"
              value={settings.vibrationEnabled}
              onValueChange={(value) => handleToggleSetting('vibrationEnabled', value)}
              icon={Vibrate}
            />
          </View>
        </View>

        {/* Scheduled Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
          <View style={styles.settingsCard}>
            <View style={styles.scheduledInfo}>
              <Text style={styles.scheduledCount}>
                {scheduledNotifications.length} notification{scheduledNotifications.length !== 1 ? 's' : ''} scheduled
              </Text>
              {scheduledNotifications.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearAllNotifications}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* iOS Notification Test */}
        <IOSNotificationTest />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#0e3c67',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  statusValue: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statusTextInactive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  tokenContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'monospace',
  },
  systemSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    gap: 8,
  },
  systemSettingsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0e3c67',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerDisabled: {
    backgroundColor: '#F3F4F6',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingTitleDisabled: {
    color: '#9CA3AF',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingDescriptionDisabled: {
    color: '#D1D5DB',
  },
  scheduledInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  scheduledCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
});