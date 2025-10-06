import { Tabs } from 'expo-router';
import { Calendar, Chrome as Home, Users, Camera, Menu } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/theme/colors';
// try to load MaskedView if available for gradient text
let MaskedView: any = null;
try {
  // optional dependency - don't crash if not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MaskedView = require('@react-native-masked-view/masked-view').default;
} catch (e) {
  MaskedView = null;
}

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
    {focused ? (
      <LinearGradient
        colors={COLORS.gradientPrimary as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: BORDER_RADIUS.pill,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 4,
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Icon size={22} color={COLORS.textLight} />
      </LinearGradient>
    ) : (
      <View style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.pill,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
      }}>
        <Icon size={22} color={COLORS.textSecondary} />
      </View>
    )}
    {focused ? (
      MaskedView ? (
        <MaskedView
          style={{ width: 80, alignItems: 'center' }}
          maskElement={
            <View style={{ backgroundColor: 'transparent', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.xs,
                  fontWeight: TYPOGRAPHY.bold,
                  color: '#000',
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
          }
        >
          <LinearGradient
            colors={COLORS.gradientPrimary as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 80, alignItems: 'center' }}
          />
        </MaskedView>
      ) : (
        <Text
          style={{
            fontSize: TYPOGRAPHY.xs,
            fontWeight: TYPOGRAPHY.bold,
            color: COLORS.primary,
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
      )
    ) : (
      <Text
        style={{
          fontSize: TYPOGRAPHY.xs,
          fontWeight: TYPOGRAPHY.medium,
          color: COLORS.textMuted,
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
    )}
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
          ...SHADOWS.lg,
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
