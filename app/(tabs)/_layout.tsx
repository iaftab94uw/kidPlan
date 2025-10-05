import { Tabs } from 'expo-router';
import { Calendar, Chrome as Home, Users, Camera, Menu } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/theme/colors';

const TabBarIcon = ({ icon: Icon, color, focused, title }: {
  icon: any;
  color: string;
  focused: boolean;
  title: string;
}) => (
  <View style={{
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    width: '100%',
    minWidth: 80,
  }}>
    <View style={{
      paddingHorizontal: focused ? 16 : 12,
      paddingVertical: focused ? 10 : 10,
      borderRadius: BORDER_RADIUS.pill,
      backgroundColor: focused ? COLORS.primary : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      shadowColor: focused ? COLORS.primary : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: focused ? 0.2 : 0,
      shadowRadius: 8,
      elevation: focused ? 3 : 0,
    }}>
      <Icon size={22} color={focused ? COLORS.textLight : COLORS.textSecondary} />
    </View>
    <Text
      style={{
        fontSize: TYPOGRAPHY.xs,
        fontWeight: focused ? TYPOGRAPHY.bold : TYPOGRAPHY.medium,
        color: focused ? COLORS.primary : COLORS.textMuted,
        textAlign: 'center',
        maxWidth: '100%',
        minWidth: 80,
        paddingHorizontal: 4,
      }}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {title}
    </Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          paddingBottom: 20,
          paddingTop: 12,
          height: 110,
          ...SHADOWS.large,
          borderTopLeftRadius: BORDER_RADIUS.xl,
          borderTopRightRadius: BORDER_RADIUS.xl,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          paddingHorizontal: 0,
          minWidth: 80,
          flex: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Home} color={color} focused={focused} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Calendar} color={color} focused={focused} title="Calendar" />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Users} color={color} focused={focused} title="Family" />
          ),
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: 'Photos',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Camera} color={color} focused={focused} title="Photos" />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon icon={Menu} color={color} focused={focused} title="More" />
          ),
        }}
      />
    </Tabs>
  );
}
