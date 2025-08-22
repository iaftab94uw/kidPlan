import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Bell,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  User,
  Camera
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();

  const upcomingEvents = [
    {
      id: 1,
      title: "Emma's Piano Lesson",
      time: "4:00 PM",
      location: "Music Academy",
      child: "Emma",
      color: "#22C55E",
      avatar: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    },
    {
      id: 2,
      title: "Football Practice",
      time: "6:00 PM",
      location: "Community Center",
      child: "Jack",
      color: "#F97316",
      avatar: "https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    }
  ];

  const quickActions = [
    {
      icon: Calendar,
      title: "Add Event",
      color: "#3B82F6",
      background: "#EBF4FF"
    },
    {
      icon: User,
      title: "Add Member",
      color: "#10B981",
      background: "#ECFDF5",
      action: () => router.push('/add-family-member')
    },
    {
      icon: Users,
      title: "Schedule",
      color: "#8B5CF6",
      background: "#F3E8FF",
      action: () => router.push('/schedule')
    },
    {
      icon: Camera,
      title: "Add Photos",
      color: "#F59E0B",
      background: "#FFFBEB",
      action: () => router.push('/add-photo')
    }
  ];

  const familyStats = [
    {
      label: "Events Today",
      value: "3",
      icon: Calendar,
      color: "#3B82F6"
    },
    {
      label: "This Week",
      value: "8",
      icon: Clock,
      color: "#10B981"
    },
    {
      label: "Family Members",
      value: "4",
      icon: Users,
      color: "#8B5CF6"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.userName}>Sarah Johnson</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#FFFFFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Family Stats */}
        <View style={styles.statsContainer}>
          {familyStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.quickActionCard, { backgroundColor: action.background }]}
                onPress={action.action}
              >
                <action.icon size={24} color={action.color} />
                <Text style={[styles.quickActionText, { color: action.color }]}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/today-schedule')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color="#0e3c67" />
            </TouchableOpacity>
          </View>
          
          {upcomingEvents.map((event) => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => router.push(`/event-detail/${event.id}`)}
            >
              <Image source={{ uri: event.avatar }} style={styles.eventAvatar} />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <View style={styles.eventMetaItem}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.eventMetaText}>{event.time}</Text>
                  </View>
                  <View style={styles.eventMetaItem}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.eventMetaText}>{event.location}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Family Members Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/(tabs)/family')}
            >
              <Text style={styles.seeAllText}>Manage</Text>
              <ChevronRight size={16} color="#0e3c67" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScroll}>
            <TouchableOpacity 
              style={styles.memberCard}
              onPress={() => router.push('/member-detail/1')}
            >
              <Image 
                source={{ uri: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" }} 
                style={styles.memberAvatar} 
              />
              <Text style={styles.memberName}>Emma</Text>
              <Text style={styles.memberAge}>8 years</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.memberCard}
              onPress={() => router.push('/member-detail/2')}
            >
              <Image 
                source={{ uri: "https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" }} 
                style={styles.memberAvatar} 
              />
              <Text style={styles.memberName}>Jack</Text>
              <Text style={styles.memberAge}>6 years</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addMemberCard}
              onPress={() => router.push('/add-family-member')}
            >
              <Plus size={24} color="#6B7280" />
              <Text style={styles.addMemberText}>Add Member</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Co-Parenting Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week's Schedule</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/week-schedule')}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <ChevronRight size={16} color="#0e3c67" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.scheduleCard}
            onPress={() => router.push('/schedule-detail/1')}
          >
            <View style={styles.scheduleHeader}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>Weekend with Dad</Text>
                <Text style={styles.scheduleDate}>Sat 24 - Sun 25 Aug</Text>
              </View>
              <View style={styles.scheduleParentBadge}>
                <Text style={styles.scheduleParentText}>Co-Parent</Text>
              </View>
            </View>
            <View style={styles.scheduleDetails}>
              <View style={styles.scheduleDetailRow}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.scheduleDetailText}>Dad's House</Text>
              </View>
              <Text style={styles.scheduleActivities}>Swimming, Movie night, Cooking together</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.scheduleCard}
            onPress={() => router.push('/schedule-detail/2')}
          >
            <View style={styles.scheduleHeader}>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleTitle}>School Week</Text>
                <Text style={styles.scheduleDate}>Mon 26 - Fri 30 Aug</Text>
              </View>
              <View style={[styles.scheduleParentBadge, { backgroundColor: '#E6F3FF' }]}>
                <Text style={[styles.scheduleParentText, { color: '#0e3c67' }]}>You</Text>
              </View>
            </View>
            <View style={styles.scheduleDetails}>
              <View style={styles.scheduleDetailRow}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.scheduleDetailText}>Home</Text>
              </View>
              <Text style={styles.scheduleActivities}>School, homework, piano lessons</Text>
            </View>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: '#0e3c67',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0e3c67',
    fontWeight: '500',
    marginRight: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  eventMeta: {
    gap: 8,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  eventColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  membersScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  memberAge: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  addMemberCard: {
    width: 100,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginRight: 12,
  },
  addMemberText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  scheduleDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  scheduleParentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scheduleParentText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  scheduleDetails: {
    gap: 8,
  },
  scheduleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleDetailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  scheduleActivities: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});