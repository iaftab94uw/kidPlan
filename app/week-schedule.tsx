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
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyDetails } from '@/hooks/useFamilyDetails';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { CalendarEvent } from '@/types/calendar';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  ChevronRight
} from 'lucide-react-native';

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

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>This Week's Schedule</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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
                  onPress={() => router.push(`/event-detail/${event._id}`)}
                >
                  <View style={[styles.scheduleColorBar, { backgroundColor: event.color || '#0e3c67' }]} />
                  <View style={styles.scheduleAvatar}>
                    <User size={24} color="#6B7280" />
                  </View>
                  <View style={styles.scheduleContent}>
                    <View style={styles.scheduleHeader}>
                      <Text style={styles.scheduleName}>{event.title}</Text>
                      <View style={[
                        styles.scheduleParentBadge, 
                        { backgroundColor: event.eventType === 'Schedule' ? '#E6F3FF' : '#FEF3C7' }
                      ]}>
                        <Text style={[
                          styles.scheduleParentText,
                          { color: event.eventType === 'Schedule' ? '#0e3c67' : '#F59E0B' }
                        ]}>
                          {event.eventType === 'Schedule' ? getFamilyMemberNames(event) : 'Event'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.scheduleDate}>
                      {formatEventTime(event)}
                    </Text>
                    <View style={styles.scheduleMeta}>
                      {event.location && (
                        <View style={styles.scheduleMetaItem}>
                          <MapPin size={16} color="#6B7280" />
                          <Text style={styles.scheduleMetaText}>{event.location}</Text>
                        </View>
                      )}
                    </View>
                    {(event.description || event.activities || event.notes) && (
                      <Text style={styles.scheduleActivities}>
                        {event.description || event.activities || event.notes}
                      </Text>
                    )}
                    {(event.notes && event.eventType === 'Schedule') && (
                      <View style={styles.scheduleNotes}>
                        <Text style={styles.scheduleNotesText}>{event.notes}</Text>
                      </View>
                    )}
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },
  scheduleColorBar: {
    width: 4,
    height: '100%',
    minHeight: 120,
  },
  scheduleAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
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
    marginBottom: 8,
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
  scheduleActivities: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 8,
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