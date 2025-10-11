import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyDetails } from '@/hooks/useFamilyDetails';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { CalendarEvent, EventType } from '@/types/calendar';
import { 
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  Edit,
  Trash2,
  School
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/theme/colors';

export default function TodaySchedule() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { familyData, getAllFamilyMembers } = useFamilyDetails(token || '');
  
  const [filter, setFilter] = useState('all'); // 'all' or family member ID
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEventTypeIcon = (eventType: EventType) => {
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

  // Fetch today's events from API
  const fetchTodayEvents = useCallback(async () => {
    if (!token) return;
    
    try {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.GET_CALENDAR_EVENTS);
      const apiUrl = `${url}?startDate=${todayStr}&endDate=${todayStr}`;
      
      console.log('Fetching today\'s events:', apiUrl);
      
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
        setTodayEvents(data.data);
        setError(null);
      } else {
        setTodayEvents([]);
        setError('No events found for today');
      }
    } catch (error) {
      console.error('Error fetching today\'s events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      setTodayEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTodayEvents();
  }, [fetchTodayEvents]);

  // Load events on mount
  useEffect(() => {
    if (token) {
      fetchTodayEvents();
    }
  }, [token, fetchTodayEvents]);

  const getFilteredEvents = () => {
    if (filter === 'all') return todayEvents;
    
    // Filter by family member ID
    return todayEvents.filter(event => {
      if (event.familyMembers && Array.isArray(event.familyMembers)) {
        return event.familyMembers.includes(filter);
      }
      return false;
    });
  };

  // Get family members for filter buttons
  const familyMembers = getAllFamilyMembers() || [];

  // Helper function to determine event status based on time
  const getEventStatus = (event: CalendarEvent) => {
    // For Schedule events, no time-based status
    if (event.eventType === 'Schedule') {
      return 'schedule';
    }
    
    const now = new Date();
    const eventTime = event.startTime || event.eventDate;
    
    if (!eventTime) return 'upcoming';
    
    // For regular events, use time-based logic
    const eventDate = new Date(eventTime);
    const timeDiff = eventDate.getTime() - now.getTime();
    
    if (timeDiff < 0) return 'completed';
    if (timeDiff < 30 * 60 * 1000) return 'in-progress'; // 30 minutes
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'upcoming': return '#F59E0B';
      case 'in-progress': return '#3B82F6';
      case 'schedule': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'upcoming': return 'Upcoming';
      case 'in-progress': return 'In Progress';
      case 'schedule': return 'Scheduled';
      default: return 'Unknown';
    }
  };

  // Helper function to format event time
  const formatEventTime = (event: CalendarEvent) => {
    // For Schedule events, show date range if it's multi-day
    if (event.eventType === 'Schedule') {
      if (event.startDate && event.endDate) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        // Check if it's the same day
        if (startDate.toDateString() === endDate.toDateString()) {
          return startDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          });
        } else {
          // Multi-day event
          return `${startDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })} - ${endDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}`;
        }
      }
      return 'All Day';
    }
    
    // For regular events, show time
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    if (event.startTime) {
      return event.startTime;
    }
    if (event.eventDate) {
      return new Date(event.eventDate).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
    return 'Time TBD';
  };

  // Helper function to get family member names
  const getFamilyMemberNames = (event: CalendarEvent) => {
    // For Schedule events, show responsible parent
    if (event.eventType === 'Schedule' && event.responsibleParent) {
      return event.responsibleParent;
    }
    
    // For regular events, show family members
    if (event.familyMembers && Array.isArray(event.familyMembers) && event.familyMembers.length > 0) {
      const memberNames = event.familyMembers.map(memberId => {
        const member = familyMembers.find(m => m._id === memberId);
        return member ? member.name : 'Unknown';
      });
      
      return memberNames.length > 0 ? memberNames.join(', ') : 'All';
    }
    
    return 'All';
  };

  // Helper function for time formatting
  const formatTimeDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Handle edit event
  const handleEditEvent = (event: CalendarEvent) => {
    // Check if it's a schedule event
    if (event.eventType === 'Schedule') {
      handleEditSchedule(event);
    } else {
      // Navigate to calendar with edit action for regular events
      router.push({
        pathname: '/(tabs)/calendar',
        params: { action: 'editEvent', eventId: event._id }
      });
    }
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule: CalendarEvent) => {
    // Navigate to calendar with edit schedule action
    router.push({
      pathname: '/(tabs)/calendar',
      params: { action: 'editSchedule', scheduleId: schedule._id }
    });
  };

  // Handle delete event
  const handleDeleteEvent = (event: CalendarEvent) => {
    // Check if it's a schedule event
    if (event.eventType === 'Schedule') {
      handleDeleteSchedule(event);
    } else {
      // Regular event deletion
      Alert.alert(
        'Delete Event',
        `Are you sure you want to delete "${event.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              if (!token) {
                Alert.alert('Error', 'No authentication token available');
                return;
              }

              try {
                const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_EVENT)}/${event._id}`;
                const response = await fetch(url, {
                  method: 'DELETE',
                  headers: getAuthHeaders(token),
                });

                if (!response.ok) {
                  throw new Error(`Failed to delete event: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success) {
                  Alert.alert('Success', 'Event deleted successfully!');
                  
                  // Refresh events
                  fetchTodayEvents();
                } else {
                  throw new Error(data.message || 'Failed to delete event');
                }
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                Alert.alert('Error', `Failed to delete event: ${errorMessage}`);
                console.error('Delete event error:', error);
              }
            }
          }
        ]
      );
    }
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (schedule: CalendarEvent) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete "${schedule.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const scheduleData = {
                scheduleId: schedule._id
              };

              const url = getApiUrl(API_CONFIG.ENDPOINTS.DELETE_SCHEDULE);
              const headers = getAuthHeaders(token!);
              
              const response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(scheduleData),
              });

              const data = await response.json();
              
              if (data.success) {
                Alert.alert('Success', 'Schedule deleted successfully!');
                
                // Refresh events
                fetchTodayEvents();
              } else {
                throw new Error(data.message || 'Failed to delete schedule');
              }
            } catch (error) {
              console.error('Delete schedule error:', error);
              Alert.alert('Error', 'Failed to delete schedule. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
                                <LinearGradient
                                  colors={COLORS.gradientBackground as any}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.container}
                                >    
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0e3c67"
            colors={["#0e3c67"]}
          />
        }
      >
        {/* Header */}
                        <LinearGradient
                          colors={COLORS.gradientHero as any}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.header}
                        >        
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Today's Schedule</Text>
          {/* <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity> */}
        </LinearGradient>

        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-GB', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.eventCount}>{getFilteredEvents().length} events</Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive
            ]}>All</Text>
          </TouchableOpacity>
          {familyMembers.map((member) => (
            <TouchableOpacity
              key={member._id}
              style={[
                styles.filterButton,
                filter === member._id && styles.filterButtonActive
              ]}
              onPress={() => setFilter(member._id)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === member._id && styles.filterButtonTextActive
              ]}>{member.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events List */}
        <View style={styles.eventsSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0e3c67" />
              <Text style={styles.loadingText}>Loading today's events...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Unable to load events</Text>
              <Text style={styles.errorSubtitle}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchTodayEvents}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : getFilteredEvents().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No events today</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? "You have no events scheduled for today." 
                  : "No events found for the selected family member."
                }
              </Text>
            </View>
          ) : (
            getFilteredEvents().map((event) => {
              const status = getEventStatus(event);
              return (
                <TouchableOpacity 
                  key={event._id} 
                  style={styles.eventCard}
                  // onPress={() => router.push(`/event-detail/${event._id}`)}
                >
                  <View style={[styles.eventColorBar, { backgroundColor: event.color || '#0e3c67' }]} />
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <View style={styles.eventTitleContainer}>
                        <View style={styles.eventIconContainer}>
                          <Text style={styles.eventTypeIcon}>{getEventTypeIcon(event.eventType)}</Text>
                        </View>
                        <View style={styles.eventTitleContent}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventDateRange}>{formatEventTime(event)}</Text>
                        </View>
                      </View>
                      <View style={styles.eventHeaderRight}>
                        <Text style={styles.eventType}>{event.eventType}</Text>
                        {/* Hide edit and delete buttons for school events */}
                        {event.eventType !== 'School_Event' && event.eventType !== 'School_Holiday' && (
                          <View style={styles.eventActions}>
                            <TouchableOpacity
                              style={styles.eventActionButton}
                              onPress={() => handleEditEvent(event)}
                            >
                              <Edit size={16} color="#6B7280" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.eventActionButton}
                              onPress={() => handleDeleteEvent(event)}
                            >
                              <Trash2 size={16} color="#DC2626" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.eventMeta}>
                      <View style={styles.eventMetaItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.eventMetaText}>{formatEventTime(event)}</Text>
                      </View>
                      {event.location && (
                        <View style={styles.eventMetaItem}>
                          <MapPin size={16} color="#6B7280" />
                          <Text style={styles.eventMetaText}>{event.location}</Text>
                        </View>
                      )}
                      {(event.eventType === 'School' || event.eventType === 'School_Holiday' || event.eventType === 'School_Event') && event.school && (
                        <View style={styles.eventMetaItem}>
                          <School size={16} color="#6B7280" />
                          <Text style={styles.eventMetaText}>{event.school.name}</Text>
                        </View>
                      )}
                      {event.responsibleParent && (
                        <View style={styles.eventMetaItem}>
                          <User size={16} color="#6B7280" />
                          <Text style={styles.eventMetaText}>{event.responsibleParent}</Text>
                        </View>
                      )}
                    </View>
                    {event.description && (
                      <Text style={styles.eventDescription}>{event.description}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#0e3c67',
    borderColor: '#0e3c67',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  eventsSection: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 60, 103, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventTitleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTypeIcon: {
    fontSize: 18,
    color: '#0e3c67',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  eventDateRange: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'capitalize',
  },
  eventHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  eventActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventTypeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventMeta: {
    gap: 8,
    marginBottom: 8,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventMetaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
  },
  bottomSpacing: {
    height: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});