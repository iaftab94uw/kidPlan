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
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  ChevronRight,
  Edit,
  Trash2,
  School
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/theme/colors';

export default function WeekSchedule() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { familyData, getAllFamilyMembers } = useFamilyDetails(token || '');
  
  const [filter, setFilter] = useState('all'); // 'all' or family member ID
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current week's start and end dates
  const getCurrentWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Go to Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Go to Saturday
    
    return { startOfWeek, endOfWeek };
  };

  // Fetch this week's events from API
  const fetchWeekEvents = useCallback(async () => {
    if (!token) return;
    
    try {
      const { startOfWeek, endOfWeek } = getCurrentWeekDates();
      
      // Format dates as YYYY-MM-DD
      const startStr = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
      const endStr = `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfWeek.getDate()).padStart(2, '0')}`;
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.GET_CALENDAR_EVENTS);
      const apiUrl = `${url}?startDate=${startStr}&endDate=${endStr}`;
      
      console.log('Fetching week events:', apiUrl);
      console.log('Week range:', startStr, 'to', endStr);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch week events: ${response.status}`);
      }

      const data = await response.json();
      console.log('Week events response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setWeekEvents(data.data);
        setError(null);
      } else {
        setWeekEvents([]);
        setError('No events found for this week');
      }
    } catch (error) {
      console.error('Error fetching week events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      setWeekEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWeekEvents();
  }, [fetchWeekEvents]);

  // Load events on mount
  useEffect(() => {
    if (token) {
      fetchWeekEvents();
    }
  }, [token, fetchWeekEvents]);

  const getFilteredEvents = () => {
    if (filter === 'all') return weekEvents;
    
    return weekEvents.filter(event => {
      // For Schedule events, filter by responsible parent
      if (event.eventType === 'Schedule') {
        if (filter === 'primary') {
          return event.responsibleParent === 'Primary';
        } else if (filter === 'secondary') {
          return event.responsibleParent === 'Secondary';
        }
      }
      
      // For regular events, filter by family member ID
      if (event.familyMembers && Array.isArray(event.familyMembers)) {
        return event.familyMembers.includes(filter);
      }
      
      return false;
    });
  };

  // Get family members for filter buttons
  const familyMembers = getAllFamilyMembers() || [];

  // Helper function to format event time/date
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

  // Helper function to determine event status
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'upcoming': return 'Upcoming';
      case 'in-progress': return 'In Progress';
      case 'schedule': return 'Scheduled';
      default: return 'Unknown';
    }
  };

  const getParentBadgeColor = (parentType: string) => {
    return parentType === 'primary' ? '#E6F3FF' : '#FEF3C7';
  };

  const getParentTextColor = (parentType: string) => {
    return parentType === 'primary' ? '#0e3c67' : '#F59E0B';
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
                  fetchWeekEvents();
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
                fetchWeekEvents();
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
          <Text style={styles.headerTitle}>This Week's Schedule</Text>
        </LinearGradient>

        {/* Week Overview */}
        <View style={styles.weekOverview}>
          <Text style={styles.weekTitle}>
            Week of {new Date().toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.scheduleCount}>{getFilteredEvents().length} events</Text>
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
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'primary' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('primary')}
          >
            <Text style={[
              styles.filterButtonText,
              filter === 'primary' && styles.filterButtonTextActive
            ]}>You</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'secondary' && styles.filterButtonActive
            ]}
            onPress={() => setFilter('secondary')}
          >
            <Text style={[
              styles.filterButtonText,
              filter === 'secondary' && styles.filterButtonTextActive
            ]}>Co-Parent</Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <View style={styles.schedulesSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0e3c67" />
              <Text style={styles.loadingText}>Loading this week's events...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Unable to load events</Text>
              <Text style={styles.errorSubtitle}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchWeekEvents}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : getFilteredEvents().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No events this week</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all' 
                  ? "You have no events scheduled for this week." 
                  : "No events found for the selected family member."
                }
              </Text>
            </View>
          ) : (
            getFilteredEvents().map((event) => {
              return (
                <TouchableOpacity 
                  key={event._id} 
                  style={styles.scheduleCard}
                  // onPress={() => router.push(`/event-detail/${event._id}`)}
                >
                  <View style={[styles.scheduleColorBar, { backgroundColor: event.color || '#0e3c67' }]} />
                  <View style={styles.scheduleContent}>
                    <View style={styles.scheduleHeader}>
                      <View style={styles.scheduleTitleContainer}>
                        <View style={styles.scheduleIconContainer}>
                          <Text style={styles.scheduleTypeIcon}>{getEventTypeIcon(event.eventType)}</Text>
                        </View>
                        <View style={styles.scheduleTitleContent}>
                          <Text style={styles.scheduleName}>{event.title}</Text>
                          <Text style={styles.scheduleDateRange}>{formatEventTime(event)}</Text>
                        </View>
                      </View>
                      <View style={styles.scheduleHeaderRight}>
                        <Text style={styles.scheduleType}>{event.eventType}</Text>
                        {/* Hide edit and delete buttons for school events */}
                        {event.eventType !== 'School_Event' && event.eventType !== 'School_Holiday' && (
                          <View style={styles.scheduleActions}>
                            <TouchableOpacity
                              style={styles.scheduleActionButton}
                              onPress={() => handleEditEvent(event)}
                            >
                              <Edit size={16} color="#6B7280" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.scheduleActionButton}
                              onPress={() => handleDeleteEvent(event)}
                            >
                              <Trash2 size={16} color="#DC2626" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.scheduleMeta}>
                      <View style={styles.scheduleMetaItem}>
                        <Clock size={16} color="#6B7280" />
                        <Text style={styles.scheduleMetaText}>{formatEventTime(event)}</Text>
                      </View>
                      {event.location && (
                        <View style={styles.scheduleMetaItem}>
                          <MapPin size={16} color="#6B7280" />
                          <Text style={styles.scheduleMetaText}>{event.location}</Text>
                        </View>
                      )}
                      {(event.eventType === 'School' || event.eventType === 'School_Holiday' || event.eventType === 'School_Event') && event.school && (
                        <View style={styles.scheduleMetaItem}>
                          <School size={16} color="#6B7280" />
                          <Text style={styles.scheduleMetaText}>{event.school.name}</Text>
                        </View>
                      )}
                      {event.responsibleParent && (
                        <View style={styles.scheduleMetaItem}>
                          <User size={16} color="#6B7280" />
                          <Text style={styles.scheduleMetaText}>{event.responsibleParent}</Text>
                        </View>
                      )}
                    </View>
                    {event.description && (
                      <Text style={styles.scheduleDescription}>{event.description}</Text>
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
  weekOverview: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  scheduleCount: {
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
  schedulesSection: {
    padding: 20,
  },
  scheduleCard: {
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
  scheduleColorBar: {
    width: 4,
  },
  scheduleContent: {
    flex: 1,
    padding: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
  },
  scheduleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(14, 60, 103, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scheduleTitleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  scheduleTypeIcon: {
    fontSize: 18,
    color: '#0e3c67',
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  scheduleDateRange: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  scheduleType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'capitalize',
  },
  scheduleHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleParentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scheduleParentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  scheduleMeta: {
    gap: 8,
  },
  scheduleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleMetaText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
  },
  scheduleNotes: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  scheduleNotesText: {
    fontSize: 12,
    color: '#6B7280',
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