import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  RefreshControl,
  TextInput
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useFamilyDetails } from '@/hooks/useFamilyDetails';
import { useAppEvents } from '@/hooks/useAppEvents';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { CalendarEvent, EventType } from '@/types/calendar';
import { 
  Bell,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  User,
  Camera,
  CalendarDays,
  School,
  Heart,
  Briefcase
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const searchParams = useLocalSearchParams();
  const { subscribeToRefresh } = useAppEvents();
  
  // State for refresh functionality
  const [refreshing, setRefreshing] = useState(false);
  
  // Calendar Events hook
  const { 
    events: calendarEvents, 
    loading: eventsLoading, 
    error: eventsError, 
    refetch: refetchEvents
  } = useCalendarEvents(token || '');
  
  // Family Details hook
  const { 
    familyData, 
    loading: familyLoading, 
    error: familyError, 
    refetch: refetchFamily,
    getAllFamilyMembers 
  } = useFamilyDetails(token || '');
  
  // State for today's and this week's events
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [thisWeekEvents, setThisWeekEvents] = useState<CalendarEvent[]>([]);
  const [todayEventsLoading, setTodayEventsLoading] = useState(false);
  const [thisWeekEventsLoading, setThisWeekEventsLoading] = useState(false);
  const [schoolPostcode, setSchoolPostcode] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const getUserDisplayName = () => {
    if (user?.fullName) {
      return user.fullName;
    }
    return 'User';
  };

  // Helper function to get event type icon
  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'School_Event':
      case 'School_Holiday':
        return School;
      case 'Personal':
        return Heart;
      case 'Work':
        return Briefcase;
      case 'Schedule':
        return Users;
      default:
        return Calendar;
    }
  };

  // Helper function to get event type color
  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'School_Event':
        return '#059669'; // Green
      case 'School_Holiday':
        return '#DC2626'; // Red
      case 'Personal':
        return '#8B5CF6'; // Purple
      case 'Work':
        return '#0e3c67'; // Blue
      case 'Schedule':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
    }
  };

  const getEventTypeIcon2 = (eventType: EventType) => {
    switch (eventType) {
      case 'Personal':
        return '👤';
      case 'School':
        return '🎓';
      case 'School_Event':
        return '📚';
      case 'School_Holiday':
        return '🏫';
      case 'Activity':
        return '⚽';
      case 'Holiday':
        return '🎉';
      case 'Medical':
        return '🏥';
      case 'Schedule':
        return '📅';
      default:
        return '📅';
    }
  };

  // Helper functions for data processing
  const getTodayEvents = useCallback(() => {
    if (!Array.isArray(calendarEvents)) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return calendarEvents.filter(event => {
      if (!event) return false;
      
      const typeMatches = event.eventType !== 'Schedule'; // Exclude schedules from events count
      if (!typeMatches) return false;
      
      if (event.eventDate) {
        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      }
      
      if (event.startDate && event.endDate) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        return today >= startDate && today <= endDate;
      }
      
      return false;
    });
  }, [calendarEvents]);

  const getThisWeekEvents = useCallback(() => {
    if (!Array.isArray(calendarEvents)) return [];
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return calendarEvents.filter(event => {
      if (!event) return false;
      
      const typeMatches = event.eventType !== 'Schedule'; // Exclude schedules from events count
      if (!typeMatches) return false;
      
      if (event.eventDate) {
        const eventDate = new Date(event.eventDate);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      }
      
      if (event.startDate && event.endDate) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        return (startDate <= endOfWeek && endDate >= startOfWeek);
      }
      
      return false;
    });
  }, [calendarEvents]);

  // Fetch today's events from calendar API
  const fetchTodayEvents = useCallback(async () => {
    if (!token) return;
    
    setTodayEventsLoading(true);
    try {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`; // Format: YYYY-MM-DD
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.GET_CALENDAR_EVENTS);
      const apiUrl = `${url}?startDate=${todayStr}&endDate=${todayStr}`;
      
      console.log('Fetching today\'s schedule:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch today's events: ${response.status}`);
      }

      const data = await response.json();
      console.log('Today\'s events response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        // Show all calendar events, not just schedules
        console.log('Today\'s events:', data.data);
        setTodayEvents(data.data);
      } else {
        setTodayEvents([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s events:', error);
      setTodayEvents([]);
    } finally {
      setTodayEventsLoading(false);
    }
  }, [token]);

  // Fetch this week's events from calendar API
  const fetchThisWeekEvents = useCallback(async () => {
    if (!token) return;
    
    setThisWeekEventsLoading(true);
    try {
      const today = new Date();
      
      // Calculate start of week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      // Calculate end of week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startDateStr = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`; // Format: YYYY-MM-DD
      const endDateStr = `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfWeek.getDate()).padStart(2, '0')}`; // Format: YYYY-MM-DD
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.GET_CALENDAR_EVENTS);
      const apiUrl = `${url}?startDate=${startDateStr}&endDate=${endDateStr}`;
      
      console.log('Fetching this week\'s schedule:', apiUrl);
      console.log('Week range:', startDateStr, 'to', endDateStr);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch this week's events: ${response.status}`);
      }

      const data = await response.json();
      console.log('This week\'s events response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        // Show all calendar events, not just schedules
        console.log('This week\'s events:', data.data);
        setThisWeekEvents(data.data);
      } else {
        setThisWeekEvents([]);
      }
    } catch (error) {
      console.error('Error fetching this week\'s events:', error);
      setThisWeekEvents([]);
    } finally {
      setThisWeekEventsLoading(false);
    }
  }, [token]);

  // Refresh all data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchEvents(),
        refetchFamily(),
        fetchTodayEvents(),
        fetchThisWeekEvents()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchEvents, refetchFamily, fetchTodayEvents, fetchThisWeekEvents]);

  // Load events on mount
  useEffect(() => {
    if (token) {
      fetchTodayEvents();
      fetchThisWeekEvents();
    }
  }, [token, fetchTodayEvents, fetchThisWeekEvents]);

  // Create a stable refresh handler
  const handleRefreshEvent = useCallback((type: 'events' | 'schedules' | 'family' | 'all') => {
    console.log(`Home screen received refresh event for: ${type}`);
    
    switch (type) {
      case 'events':
        fetchTodayEvents();
        fetchThisWeekEvents();
        refetchEvents();
        break;
      case 'schedules':
        fetchTodayEvents();
        fetchThisWeekEvents();
        break;
      case 'family':
        refetchFamily();
        break;
      case 'all':
        fetchTodayEvents();
        fetchThisWeekEvents();
        refetchEvents();
        refetchFamily();
        break;
    }
  }, [fetchTodayEvents, fetchThisWeekEvents, refetchEvents, refetchFamily]);

  // Subscribe to refresh events instead of constantly refetching
  useEffect(() => {
    if (!token) return;

    const unsubscribe = subscribeToRefresh(handleRefreshEvent);
    return unsubscribe;
  }, [token, subscribeToRefresh, handleRefreshEvent]);

  // Handle navigation parameters (e.g., opening modals from home screen)
  useFocusEffect(
    useCallback(() => {
      if (searchParams.action === 'addEvent' || searchParams.action === 'addSchedule') {
        console.log('Clearing navigation parameters');
        router.replace('/');
      }
    }, [searchParams.action, router])
  );


  const quickActions = [
    {
      icon: Calendar,
      title: "Add Event",
      color: "#3B82F6",
      background: "#EBF4FF",
      action: () => {
        // Navigate to calendar tab and trigger add event modal
        router.push('/(tabs)/calendar?action=addEvent');
      }
    },
    {
      icon: User,
      title: "Add Member",
      color: "#10B981",
      background: "#ECFDF5",
      action: () => router.push('/add-family-member')
    },
    {
      icon: CalendarDays,
      title: "Schedule",
      color: "#8B5CF6",
      background: "#F3E8FF",
      action: () => {
        // Navigate to family tab and trigger schedule modal
        router.push('/(tabs)/family?action=addSchedule');
      }
    },
    {
      icon: Camera,
      title: "Add Photos",
      color: "#F59E0B",
      background: "#FFFBEB",
      action: () => router.push('/(tabs)/photos')
    }
  ];

  // Dynamic family stats
  const familyStats = [
    {
      label: "Events Today",
      value: getTodayEvents().length.toString(),
      icon: Calendar,
      color: "#3B82F6"
    },
    {
      label: "This Week",
      value: getThisWeekEvents().length.toString(),
      icon: Clock,
      color: "#10B981"
    },
    {
      label: "Family Members",
      value: (getAllFamilyMembers() || []).length.toString(),
      icon: Users,
      color: "#8B5CF6"
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0e3c67']}
            tintColor="#0e3c67"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
          </View>
          {/* <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#FFFFFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity> */}
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

        {/* Schools Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Schools</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/schools')}
            >
              <Text style={styles.seeAllText}>View All</Text>
              <ChevronRight size={16} color="#0e3c67" />
            </TouchableOpacity>
          </View>

          <View style={styles.schoolsCard}>
            <View style={styles.schoolsHeader}>
              <View style={styles.schoolsIconContainer}>
                <School size={32} color="#059669" />
              </View>
              <View style={styles.schoolsHeaderText}>
                <Text style={styles.schoolsTitle}>Find Your School</Text>
                <Text style={styles.schoolsSubtitle}>Sync school events & holidays to your calendar</Text>
              </View>
            </View>

            <View style={styles.schoolsSearchContainer}>
              <MapPin size={18} color="#6B7280" />
              <TextInput
                style={styles.schoolsSearchInput}
                placeholder="Enter postcode (e.g., NP20 6WJ)"
                value={schoolPostcode}
                onChangeText={setSchoolPostcode}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={styles.schoolsSearchButton}
              onPress={() => router.push({ pathname: '/schools', params: { postcode: schoolPostcode } })}
            >
              <Text style={styles.schoolsSearchButtonText}>Search Schools</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
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
          
          {todayEventsLoading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading today's schedules...</Text>
            </View>
          ) : todayEvents.length === 0 ? (
            <View style={styles.noDataCard}>
              <Calendar size={24} color="#9CA3AF" />
              <Text style={styles.noDataTitle}>No schedules today</Text>
              <Text style={styles.noDataSubtitle}>Your day is free! Add a schedule to get started.</Text>
            </View>
          ) : (
            todayEvents.slice(0, 2).map((event) => {
              const eventIcon = getEventTypeIcon2(event.eventType);
              const eventColor = getEventTypeColor(event.eventType);
              
              return (
                <TouchableOpacity 
                  key={event._id} 
                  style={styles.eventCard}
                  // onPress={() => router.push(`/event-detail/${event._id}`)}
                >
                  <View style={[styles.eventAvatar, { backgroundColor: `${eventColor}20` }]}>
                    <Text style={styles.eventEmojiIcon}>{eventIcon}</Text>
                  </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaItem}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.eventMetaText}>
                        {event.startDate && event.endDate ? (
                          `${new Date(event.startDate).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short' 
                          })} - ${new Date(event.endDate).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}`
                        ) : (
                          event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short' 
                          }) : 'Today'
                        )}
                      </Text>
                    </View>
                    <View style={styles.eventMetaItem}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.eventMetaText}>{event.location || event.school?.name || 'No location'}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.eventColorBar, { backgroundColor: eventColor }]} />
              </TouchableOpacity>
            );
            })
          )}
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
          
          {(() => {
            const familyMembers = getAllFamilyMembers() || [];
            console.log('=== HOME SCREEN FAMILY DEBUG ===');
            console.log('familyLoading:', familyLoading);
            console.log('familyData:', familyData);
            console.log('familyMembers count:', familyMembers.length);
            console.log('familyMembers:', familyMembers);
            console.log('=== END HOME SCREEN FAMILY DEBUG ===');
            
            if (familyLoading) {
              return (
                <View style={styles.loadingCard}>
                  <Text style={styles.loadingText}>Loading family members...</Text>
                </View>
              );
            } else if (familyMembers.length === 0) {
              return (
                <View style={styles.noDataCard}>
                  <Users size={24} color="#9CA3AF" />
                  <Text style={styles.noDataTitle}>No family members</Text>
                  <Text style={styles.noDataSubtitle}>Add your first family member to get started.</Text>
                </View>
              );
            } else {
              return (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.membersScroll}
                  contentContainerStyle={styles.membersScrollContent}
                >
                  {familyMembers.map((member, index) => (
                    <View 
                      key={`${member._id}-${index}`}
                      style={styles.memberCard}
                    >
                      <Image 
                        source={{ 
                          uri: member.profilePhoto || "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                        }} 
                        style={styles.memberAvatar} 
                      />
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberAge}>{member.age || 'Family Member'}</Text>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addMemberCard}
                    onPress={() => router.push('/add-family-member')}
                  >
                    <Plus size={24} color="#6B7280" />
                    <Text style={styles.addMemberText}>Add Member</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            }
          })()}
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
          
          {thisWeekEventsLoading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading this week's schedules...</Text>
            </View>
          ) : thisWeekEvents.length === 0 ? (
            <View style={styles.noDataCard}>
              <CalendarDays size={24} color="#9CA3AF" />
              <Text style={styles.noDataTitle}>No schedules this week</Text>
              <Text style={styles.noDataSubtitle}>Plan your week by adding co-parenting schedules.</Text>
            </View>
          ) : (
            thisWeekEvents.slice(0, 2).map((event) => {
              const eventIcon = getEventTypeIcon2(event.eventType);
              const eventColor = getEventTypeColor(event.eventType);
              
              return (
                <TouchableOpacity 
                  key={event._id}
                  style={styles.scheduleCard}
                  // onPress={() => router.push(`/event-detail/${event._id}`)}
                >
                <View style={styles.scheduleHeader}>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleTitle}>{event.title}</Text>
                    <Text style={styles.scheduleDate}>
                      {event.startDate && event.endDate ? (
                        `${new Date(event.startDate).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short' 
                        })} - ${new Date(event.endDate).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}`
                      ) : (
                        event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short' 
                        }) : 'This week'
                      )}
                    </Text>
                  </View>
                  <View style={[
                    styles.scheduleParentBadge, 
                    { backgroundColor: `${eventColor}20` }
                  ]}>
                    <Text style={styles.badgeEmojiIcon}>{eventIcon}</Text>
                    <Text style={[
                      styles.scheduleParentText, 
                      { color: eventColor }
                    ]}>
                      {event.eventType.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <View style={styles.scheduleDetails}>
                  <View style={styles.scheduleDetailRow}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.scheduleDetailText}>{event.location || event.school?.name || 'No location'}</Text>
                  </View>
                  <Text style={styles.scheduleActivities}>{event.activities || event.description || 'No description available'}</Text>
                </View>
              </TouchableOpacity>
              );
            })
          )}
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
    alignItems: 'center',
    justifyContent: 'center',
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
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventEmojiIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
  badgeEmojiIcon: {
    fontSize: 16,
    textAlign: 'center',
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
  membersScrollContent: {
    paddingRight: 20,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 100,
    height: 136,
    marginVertical:4,
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
    height: 136,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  // Schools Section Styles
  schoolsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  schoolsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  schoolsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  schoolsHeaderText: {
    flex: 1,
  },
  schoolsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  schoolsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  schoolsSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  schoolsSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  schoolsSearchButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  schoolsSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  // Loading and No Data States
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  noDataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});