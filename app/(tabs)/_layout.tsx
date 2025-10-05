import { Tabs } from 'expo-router';
import { Calendar, Chrome as Home, Users, Camera, Menu } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { COLORS } from '@/theme/colors';

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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: focused ? COLORS.accent : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      shadowColor: focused ? COLORS.accent : 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: focused ? 0.5 : 0,
      shadowRadius: 10,
      elevation: focused ? 6 : 0,
    }}>
      <Icon size={20} color={focused ? COLORS.primary : color} />
    </View>
    <Text
      style={{
        fontSize: 10,
        fontWeight: focused ? '700' : '600',
        color: focused ? COLORS.accent : color,
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
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.secondaryBackground,
            borderTopWidth: 0,
            paddingBottom: 20,
            paddingTop: 12,
            height: 110,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.4,
            shadowRadius: 15,
            elevation: 12,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: 0,
          },
          tabBarActiveTintColor: COLORS.textPrimary,
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
    </View>
  );
}