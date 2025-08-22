import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Calendar, Users, Camera, MessageSquare, Clock } from 'lucide-react-native';

export default function NotificationSettings() {
  const router = useRouter();
  
  // Notification states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [familyUpdates, setFamilyUpdates] = useState(true);
  const [photoSharing, setPhotoSharing] = useState(false);
  const [messages, setMessages] = useState(true);
  const [schoolUpdates, setSchoolUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const notificationSections = [
    {
      title: "General",
      items: [
        {
          icon: Bell,
          title: "Push Notifications",
          subtitle: "Enable all push notifications",
          value: pushNotifications,
          onToggle: setPushNotifications,
          color: "#0e3c67"
        }
      ]
    },
    {
      title: "Family Activities",
      items: [
        {
          icon: Calendar,
          title: "Event Reminders",
          subtitle: "Notifications for upcoming events",
          value: eventReminders,
          onToggle: setEventReminders,
          color: "#0e3c67"
        },
        {
          icon: Users,
          title: "Family Updates",
          subtitle: "When family members add events",
          value: familyUpdates,
          onToggle: setFamilyUpdates,
          color: "#0e3c67"
        },
        {
          icon: Camera,
          title: "Photo Sharing",
          subtitle: "When new photos are shared",
          value: photoSharing,
          onToggle: setPhotoSharing,
          color: "#0e3c67"
        },
        {
          icon: MessageSquare,
          title: "Messages",
          subtitle: "Family chat and updates",
          value: messages,
          onToggle: setMessages,
          color: "#0e3c67"
        }
      ]
    },
    {
      title: "School & Education",
      items: [
        {
          icon: Bell,
          title: "School Updates",
          subtitle: "Term dates and school events",
          value: schoolUpdates,
          onToggle: setSchoolUpdates,
          color: "#0e3c67"
        }
      ]
    },
    {
      title: "Summary",
      items: [
        {
          icon: Clock,
          title: "Weekly Digest",
          subtitle: "Weekly summary of family activities",
          value: weeklyDigest,
          onToggle: setWeeklyDigest,
          color: "#0e3c67"
        }
      ]
    },
    {
      title: "Notification Style",
      items: [
        {
          icon: Bell,
          title: "Sound",
          subtitle: "Play sound for notifications",
          value: soundEnabled,
          onToggle: setSoundEnabled,
          color: "#0e3c67"
        },
        {
          icon: Bell,
          title: "Vibration",
          subtitle: "Vibrate for notifications",
          value: vibrationEnabled,
          onToggle: setVibrationEnabled,
          color: "#0e3c67"
        }
      ]
    }
  ];

  const renderNotificationItem = (item: any) => {
    return (
      <View key={item.title} style={styles.notificationItem}>
        <View style={[styles.notificationIcon, { backgroundColor: `${item.color}20` }]}>
          <item.icon size={20} color={item.color} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationSubtitle}>{item.subtitle}</Text>
        </View>
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E7EB', true: '#0e3c67' }}
          thumbColor={item.value ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
        </View>

        {/* Notification Sections */}
        {notificationSections.map((section) => (
          <View key={section.title} style={styles.notificationSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map(renderNotificationItem)}
            </View>
          </View>
        ))}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Notifications</Text>
          <Text style={styles.infoText}>
            You can customize which notifications you receive to stay informed about your family's activities. 
            Turn off notifications you don't need to reduce interruptions.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionItems: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});