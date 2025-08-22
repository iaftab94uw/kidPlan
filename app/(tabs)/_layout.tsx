import { Tabs } from 'expo-router';
import { Calendar, Chrome as Home, Users, Camera, Menu } from 'lucide-react-native';
import { View, Text } from 'react-native';

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
  }}>
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: focused ? '#0e3c67' : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      shadowColor: focused ? '#0e3c67' : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: focused ? 0.3 : 0,
      shadowRadius: 4,
      elevation: focused ? 4 : 0,
    }}>
      <Icon size={20} color={focused ? '#FFFFFF' : color} />
    </View>
    <Text style={{
      fontSize: 9,
      fontWeight: focused ? '700' : '600',
      color: focused ? '#0e3c67' : color,
      textAlign: 'center',
      numberOfLines: 1,
    }}>
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
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingBottom: 16,
          paddingTop: 12,
          height: 100,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: 8,
        },
        tabBarActiveTintColor: '#0e3c67',
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
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