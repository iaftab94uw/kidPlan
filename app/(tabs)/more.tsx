import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY, GLASS } from '@/theme/colors';
import { 
  School, 
  User, 
  Bell, 
  CircleHelp as HelpCircle, 
  FileText,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function More() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const menuSections = [
    // {
    //   title: "Features",
    //   items: [
    //     {
    //       icon: School,
    //       title: "Schools",
    //       subtitle: "Find and sync school calendars",
    //       action: () => router.push('/schools'),
    //       color: "#0e3c67"
    //     }
    //   ]
    // },
    {
      title: "Account",
      items: [
        {
          icon: User,
          title: "Profile Settings",
          subtitle: "Edit your personal information",
          action: () => router.push('/profile-settings'),
          color: "#0e3c67"
        },
        {
          icon: Bell,
          title: "Notifications",
          subtitle: "Control push notifications",
          action: () => router.push('/notification-settings'),
          color: "#0e3c67"
        }
      ]
    },
    {
      title: "Legal",
      items: [
        {
          icon: FileText,
          title: "Terms & Conditions",
          subtitle: "Read our terms of service",
          action: () => {},
          color: "#0e3c67"
        },
        {
          icon: FileText,
          title: "Privacy Policy",
          subtitle: "How we protect your data",
          action: () => {},
          color: "#0e3c67"
        },
        {
          icon: HelpCircle,
          title: "Help & FAQ",
          subtitle: "Get answers to common questions",
          action: () => {},
          color: "#0e3c67"
        }
      ]
    }
  ];

  const renderMenuItem = (item: any) => {
    return (
      <TouchableOpacity key={item.title} style={styles.menuItem} onPress={item.action}>
        <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
          <item.icon size={20} color={item.color} />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <>
        <LinearGradient
          colors={COLORS.gradientBackground as any}
          locations={[0, 0.5, 1]}
        />
    
      {/* Top safe-area gradient to color status bar/notch */}
      <LinearGradient
        colors={COLORS.gradientHero as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topSafeArea}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView>
        {/* Header (gradient) */}
        <LinearGradient
          colors={COLORS.gradientHero as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>More</Text>
        </LinearGradient>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <Image 
            source={{ 
              uri: user?.profilePhoto || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" 
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user ? user.fullName : 'Loading...'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'Loading...'}
            </Text>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>
                {user?.role === 'SIMPLE_USER' ? 'KidPlan User' : user?.role || 'User'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/profile-settings')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={COLORS.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editProfileGradient}
            >
              <Text style={styles.editProfileText}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionItems}>
              {section.items.map(renderMenuItem)}
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
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient
            colors={[COLORS.errorLight || '#FEE2E2', COLORS.error || '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.signOutGradient}
          >
            <LogOut size={20} color="#FFFFFF" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      </SafeAreaView>
    </>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topSafeArea: {
    height: 60,
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
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
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  editProfileText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuSection: {
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
    ...SHADOWS.md,
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    flex: 1,
  },
  signOutText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  editProfileGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});