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
  Clock,
  MapPin,
  User,
  Plus,
  Filter
} from 'lucide-react-native';

export default function TodaySchedule() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { familyData, getAllFamilyMembers } = useFamilyDetails(token || '');
  
  const [filter, setFilter] = useState('all'); // 'all' or family member ID
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <Text style={styles.headerTitle}>Today's Schedule</Text>
          {/* <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity> */}
        </View>

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
                  onPress={() => router.push(`/event-detail/${event._id}`)}
                >
                  <View style={[styles.eventColorBar, { backgroundColor: event.color || '#0e3c67' }]} />
                  <View style={styles.eventAvatar}>
                    <User size={24} color="#6B7280" />
                  </View>
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <View style={styles.eventTitleContainer}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {event.eventType !== 'Schedule' && (
                          <View style={[styles.eventTypeBadge, { backgroundColor: event.color || '#0e3c67' }]}>
                            <Text style={styles.eventTypeText}>
                              {event.eventType === 'Holiday' ? 'HOLIDAY' : 'EVENT'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                        <Text style={styles.statusText}>{getStatusText(status)}</Text>
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
                      <View style={styles.eventMetaItem}>
                        <User size={16} color="#6B7280" />
                        <Text style={styles.eventMetaText}>{getFamilyMemberNames(event)}</Text>
                      </View>
                    </View>
                    {(event.description || event.activities || event.notes) && (
                      <Text style={styles.eventNotes}>
                        {event.description || event.activities || event.notes}
                      </Text>
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
    borderRadius: 16,
    marginBottom: 16,
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
  eventAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
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
  eventNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
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