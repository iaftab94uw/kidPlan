import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Bell, CheckCircle, XCircle } from 'lucide-react-native';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';

interface IOSNotificationTestProps {
  onTestComplete?: (success: boolean) => void;
}

export const IOSNotificationTest: React.FC<IOSNotificationTestProps> = ({ onTestComplete }) => {
  const { pushToken, isRegistered, error } = useNotifications();
  const [isTesting, setIsTesting] = useState(false);

  const testIOSNotification = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('iOS Only', 'This test is only available on iOS devices');
      return;
    }

    setIsTesting(true);
    
    try {
      // Test local notification
      await notificationService.scheduleLocalNotification({
        title: 'iOS Push Test',
        body: 'This is a test notification for iOS push notifications',
        data: { test: true },
        sound: true,
      });

      Alert.alert(
        'Test Notification Sent',
        'A test notification has been scheduled. You should receive it shortly.',
        [
          {
            text: 'OK',
            onPress: () => onTestComplete?.(true),
          },
        ]
      );
    } catch (error) {
      console.error('iOS notification test failed:', error);
      Alert.alert(
        'Test Failed',
        'Failed to send test notification. Please check your notification settings.',
        [
          {
            text: 'OK',
            onPress: () => onTestComplete?.(false),
          },
        ]
      );
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (error) return <XCircle size={20} color="#EF4444" />;
    if (isRegistered && pushToken) return <CheckCircle size={20} color="#10B981" />;
    return <Bell size={20} color="#6B7280" />;
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (isRegistered && pushToken) return 'Ready';
    return 'Not Registered';
  };

  const getStatusColor = () => {
    if (error) return '#EF4444';
    if (isRegistered && pushToken) return '#10B981';
    return '#6B7280';
  };

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Bell size={24} color="#0e3c67" />
        <Text style={styles.title}>iOS Push Notification Test</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            Status: {getStatusText()}
          </Text>
        </View>

        {pushToken && (
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenLabel}>Push Token:</Text>
            <Text style={styles.tokenValue} numberOfLines={2}>
              {pushToken}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.testButton, isTesting && styles.testButtonDisabled]}
        onPress={testIOSNotification}
        disabled={isTesting || !isRegistered}
      >
        <Text style={styles.testButtonText}>
          {isTesting ? 'Testing...' : 'Send Test Notification'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>iOS Push Notification Requirements:</Text>
        <Text style={styles.infoText}>• Physical iOS device (not simulator)</Text>
        <Text style={styles.infoText}>• Notification permissions granted</Text>
        <Text style={styles.infoText}>• Valid push token registered</Text>
        <Text style={styles.infoText}>• App running in foreground/background</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tokenContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  testButton: {
    backgroundColor: '#0e3c67',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e3c67',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
});
