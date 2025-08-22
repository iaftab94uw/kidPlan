import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Image
} from 'react-native';
import { User, Bell, Shield, Smartphone, CircleHelp as HelpCircle, LogOut, ChevronRight, Moon, Globe, Calendar, Users, Camera, Zap, CreditCard } from 'lucide-react-native';

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          title: "Profile Settings",
          subtitle: "Edit your personal information",
          action: "navigate",
          color: "#0e3c67"
        },
        {
          icon: Users,
          title: "Family Members",
          subtitle: "Manage children and co-parents",
          action: "navigate",
          color: "#0e3c67"
        },
        {
          icon: CreditCard,
          title: "Subscription",
          subtitle: "Manage your KidPlan Pro subscription",
          action: "navigate",
          color: "#0e3c67"
        }
      ]
    },
    {
      title: "App Settings",
      items: [
        {
          icon: Bell,
          title: "Notifications",
          subtitle: "Control push notifications",
          action: "toggle",
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
          color: "#0e3c67"
        },
        {
          icon: Moon,
          title: "Dark Mode",
          subtitle: "Switch between light and dark themes",
          action: "toggle",
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
          color: "#0e3c67"
        },
        {
          icon: Globe,
          title: "Language",
          subtitle: "English (UK)",
          action: "navigate",
          color: "#0e3c67"
        },
        {
          icon: Calendar,
          title: "Calendar Sync",
          subtitle: "Sync with device calendars",
          action: "navigate",
          color: "#0e3c67"
        }
      ]
    },
    {
      title: "Privacy & Security",
      items: [
        {
          icon: Shield,
          title: "Privacy Settings",
          subtitle: "Control data sharing and visibility",
          action: "navigate",
          color: "#0e3c67"
        },
        {
          icon: Smartphone,
          title: "Location Services",
          subtitle: "Share location with family members",
          action: "toggle",
          value: locationEnabled,
          onToggle: setLocationEnabled,
          color: "#0e3c67"
        },
        {
          icon: Camera,
          title: "Photo Permissions",
          subtitle: "Manage photo access and sharing",
          action: "navigate",
          color: "#0e3c67"
        }
      ]
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          title: "Help & FAQ",
          subtitle: "Get answers to common questions",
          action: "navigate",
          color: "#0e3c67"
        },
        {
          icon: Zap,
          title: "Feature Requests",
          subtitle: "Suggest new features",
          action: "navigate",
          color: "#0e3c67"
        }
      ]
    }
  ];

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity key={item.title} style={styles.settingItem}>
        <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
          <item.icon size={20} color={item.color} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        {item.action === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E5E7EB', true: '#0e3c67' }}
            thumbColor={item.value ? '#FFFFFF' : '#9CA3AF'}
          />
        ) : (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sarah Johnson</Text>
            <Text style={styles.profileEmail}>sarah.johnson@email.com</Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>KidPlan Pro</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <View key={group.title} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>KidPlan</Text>
          <Text style={styles.appInfoVersion}>Version 2.1.0</Text>
          <Text style={styles.appInfoCopyright}>© 2024 KidPlan Ltd. All rights reserved.</Text>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton}>
          <LogOut size={20} color="#DC2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

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
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#0e3c67',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  profileBadge: {
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  profileBadgeText: {
    fontSize: 12,
    color: '#0e3c67',
    fontWeight: '500',
  },
  editProfileButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editProfileText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  groupItems: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0e3c67',
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});