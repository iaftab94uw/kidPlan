import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
// Removed react-native-calendars - using custom calendar component
import moment from 'moment';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  Platform,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Clock,
  MapPin,
  User,
  X,
  ChevronDown,
  Check,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Settings,
  School
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useFamilyDetails } from '@/hooks/useFamilyDetails';
import { useAppEvents } from '@/hooks/useAppEvents';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { CalendarEvent, EventType } from '@/types/calendar';
import { COLORS, SHADOWS } from '@/theme/colors';

const { width } = Dimensions.get('window');

export default function Calendar() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { user, token } = useAuth();
  const { triggerRefresh, subscribeToRefresh } = useAppEvents();
  const hasFetchedFamilyData = useRef(false);
  const lastFamilyFetchTime = useRef(0);
  const lastEventsFetchTime = useRef(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  // ...existing code...
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  // ...existing code...
  const [showEditEventModal, setShowEditEventModal] = useState(false);

  // Keep newEvent.eventDate in sync with selectedDate when modals are closed
  useEffect(() => {
    if (!showAddEventModal && !showEditEventModal) {
      setNewEvent(prev => ({ ...prev, eventDate: undefined }));
    } else if (showAddEventModal && !showEditEventModal) {
      setNewEvent(prev => ({ ...prev, eventDate: selectedDate.toISOString() }));
    }
  }, [selectedDate, showAddEventModal, showEditEventModal]);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<EventType | 'all'>('all');
  const [showEventTypeFilter, setShowEventTypeFilter] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Schedule editing state
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

  // Get holidays from API data
  const getHolidaysFromAPI = () => {
    return calendarEvents.filter(event => event.eventType === 'Holiday');
  };

  // Helper functions for calendar events
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

  const formatEventDate = (event: CalendarEvent) => {
    // Handle School_Holiday and School_Event types - use main event dates directly
    if ((event.eventType === 'School_Holiday' || event.eventType === 'School_Event') && event.eventDate) {
      // Extract only the date part to avoid timezone conversion
      const dateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
      return moment(dateStr).toDate(); // Parse as local date
    }
    
    // Default behavior for other event types
    if (event.eventDate) {
      // Extract only the date part to avoid timezone conversion
      const dateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
      return moment(dateStr).toDate(); // Parse as local date
    }
    if (event.startDate) {
      // Extract only the date part to avoid timezone conversion
      const dateStr = event.startDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
      return moment(dateStr).toDate(); // Parse as local date
    }
    return new Date();
  };

  const formatEventDateRange = (event: CalendarEvent) => {
    // Handle School_Holiday and School_Event types - use main event dates directly
    if ((event.eventType === 'School_Holiday' || event.eventType === 'School_Event') && event.eventDate && event.endDate) {
      // Extract only the date part to avoid timezone conversion
      const startDateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
      const endDateStr = event.endDate.split('T')[0]; // Get "2025-08-17" from "2025-08-17T19:00:00.000Z"
      const start = moment(startDateStr); // Parse as local date
      const end = moment(endDateStr); // Parse as local date
      
      if (start.isSame(end, 'day')) {
        return start.format('D MMM YYYY');
      }
      return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`;
    }
    
    // Default behavior for other event types
    if (event.eventDate) {
      // Extract only the date part to avoid timezone conversion
      const dateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
      const eventDate = moment(dateStr); // Parse as local date
      return eventDate.format('D MMM YYYY');
    }
    if (event.startDate && event.endDate) {
      // Extract only the date part to avoid timezone conversion
      const startDateStr = event.startDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
      const endDateStr = event.endDate.split('T')[0]; // Get "2025-08-17" from "2025-08-17T19:00:00.000Z"
      const start = moment(startDateStr); // Parse as local date
      const end = moment(endDateStr); // Parse as local date
      if (start.isSame(end, 'day')) {
        return start.format('D MMM YYYY');
      }
      return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`;
    }
    return 'No date';
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    if (event.startTime) {
      return event.startTime;
    }
    return 'All Day';
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh calendar events
      await refetchEvents();
      
      // Refresh family data
      await refetchFamily();
      
      // Trigger refresh event for home screen
      triggerRefresh('events');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Reset family data fetch flag when token changes (new login)
  useEffect(() => {
    if (token) {
      hasFetchedFamilyData.current = false;
    }
  }, [token]);

  // Subscribe to app-wide refresh events
  useEffect(() => {
    if (!token) return;

    const unsubscribe = subscribeToRefresh((type) => {
      console.log(`Calendar received refresh event: ${type}`);
      const now = Date.now();
      
      if (type === 'events' || type === 'all') {
        const timeSinceLastEventsFetch = now - lastEventsFetchTime.current;
        // Only fetch if more than 2 seconds have passed since last fetch
        if (timeSinceLastEventsFetch > 2000) {
          console.log('Calendar: Refreshing events due to app event');
          lastEventsFetchTime.current = now;
          refetchEvents();
        }
      }
      
      if (type === 'family' || type === 'all') {
        const timeSinceLastFamilyFetch = now - lastFamilyFetchTime.current;
        // Only fetch if more than 2 seconds have passed since last fetch
        if (timeSinceLastFamilyFetch > 2000) {
          console.log('Calendar: Refreshing family due to app event');
          lastFamilyFetchTime.current = now;
          refetchFamily();
        }
      }
    });

    return unsubscribe;
  }, [token, subscribeToRefresh, refetchEvents, refetchFamily]);

  // Refresh both events and family data when calendar screen becomes active (with debounce)
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        const now = Date.now();
        const timeSinceLastEventsFetch = now - lastEventsFetchTime.current;
        const timeSinceLastFamilyFetch = now - lastFamilyFetchTime.current;
        
        // Refresh events only if more than 30 seconds have passed (prevent API calls on date selection)
        if (timeSinceLastEventsFetch > 30000) {
          console.log('Calendar screen focused - refreshing events (30s debounce)');
          lastEventsFetchTime.current = now;
          refetchEvents();
        }
        
        // Refresh family data only if more than 60 seconds have passed
        if (timeSinceLastFamilyFetch > 60000) {
          console.log('Calendar screen focused - refreshing family data (60s debounce)');
          lastFamilyFetchTime.current = now;
          refetchFamily();
        }
      }
    }, [token, refetchEvents, refetchFamily])
  );
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Personal',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
    familyMember: 'all',
    eventDate: undefined as string | undefined, // ISO string or undefined
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const eventTypes = [
    { id: 'Personal', label: 'Personal', color: '#3B82F6' },
    { id: 'School', label: 'School', color: '#10B981' },
    { id: 'Activity', label: 'Activity', color: '#F59E0B' },
    { id: 'Holiday', label: 'Holiday', color: '#EF4444' },
    { id: 'Medical', label: 'Medical', color: '#8B5CF6' }
  ];

  // Schedule-specific options

  // State for Edit Event Date Picker
  const [showEditEventDatePicker, setShowEditEventDatePicker] = useState(false);
  const parentOptions = [
    { id: 'primary', label: 'Primary Parent' },
    { id: 'secondary', label: 'Secondary Parent' }
  ];

  const locationOptions = [
    'Home',
    'School',
    'Grandparents House',
    'Park',
    'Mall',
    'Library',
    'Sports Center',
    'Other'
  ];

  // Get dynamic family members
  const getFamilyMembers = () => {
    const allMembers = getAllFamilyMembers();
    const familyMembers = [
      { id: 'all', label: 'All Family Members' }
    ];
    
    allMembers.forEach(member => {
      familyMembers.push({
        id: member._id,
        label: member.name
      });
    });
    
    return familyMembers;
  };

  const hasActualFamilyMembers = () => {
    const allMembers = getAllFamilyMembers();
    return allMembers && allMembers.length > 0;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatTimeDisplay = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Generate time slots with 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(timeString);
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(t => t.id === type);
    return eventType ? eventType.color : '#3B82F6';
  };

  const hasEventsOnDate = (day: number) => {
    // Use moment for the date to check as well
    const dateToCheck = moment().year(currentDate.getFullYear()).month(currentDate.getMonth()).date(day).startOf('day');
    
    let hasEvents = calendarEvents.some(event => {
      const typeMatches = eventTypeFilter === 'all' || event.eventType === eventTypeFilter;
      if (!typeMatches) return false;

      // Handle School_Holiday and School_Event types - use main event dates directly
      if ((event.eventType === 'School_Holiday' || event.eventType === 'School_Event') && event.eventDate && event.endDate) {
        // Extract only the date part to avoid timezone conversion
        const startDateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
        const endDateStr = event.endDate.split('T')[0]; // Get "2025-08-17" from "2025-08-17T19:00:00.000Z"
        const startDate = moment(startDateStr); // Parse as local date
        const endDate = moment(endDateStr); // Parse as local date
        return dateToCheck.isBetween(startDate, endDate, 'day', '[]');
      }

      // Check if the date falls within the event's date range
      if (event.startDate && event.endDate) {
        // Extract only the date part to avoid timezone conversion
        const startDateStr = event.startDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
        const endDateStr = event.endDate.split('T')[0]; // Get "2025-08-17" from "2025-08-17T19:00:00.000Z"
        const startDate = moment(startDateStr); // Parse as local date
        const endDate = moment(endDateStr); // Parse as local date
        return dateToCheck.isBetween(startDate, endDate, 'day', '[]');
      } else if (event.eventDate) {
        // Single day event
        // Extract only the date part to avoid timezone conversion
        const dateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
        const eventDate = moment(dateStr); // Parse as local date
        return dateToCheck.isSame(eventDate, 'day');
      }
      return false;
    });

    return hasEvents;
  };

  const hasMultiDayEventsOnDate = (day: number) => {
    // Use moment for the date to check as well
    const dateToCheck = moment().year(currentDate.getFullYear()).month(currentDate.getMonth()).date(day).startOf('day');
    
    return calendarEvents.some(event => {
      const typeMatches = eventTypeFilter === 'all' || event.eventType === eventTypeFilter;
      if (!typeMatches) return false;

      // Handle School_Holiday and School_Event types - use main event dates directly
      if ((event.eventType === 'School_Holiday' || event.eventType === 'School_Event') && event.eventDate && event.endDate) {
        // Extract only the date part to avoid timezone conversion
        const startDateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
        const endDateStr = event.endDate.split('T')[0]; // Get "2025-08-17" from "2025-08-17T19:00:00.000Z"
        const startDate = moment(startDateStr); // Parse as local date
        const endDate = moment(endDateStr); // Parse as local date
        return dateToCheck.isBetween(startDate, endDate, 'day', '[]') && !startDate.isSame(endDate, 'day');
      }

      // Check if this is a multi-day event that spans this date
      if (event.startDate && event.endDate) {
        // Extract only the date part to avoid timezone conversion
        const startDateStr = event.startDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
        const endDateStr = event.endDate.split('T')[0]; // Get "2025-08-17" from "2025-08-17T19:00:00.000Z"
        const startDate = moment(startDateStr); // Parse as local date
        const endDate = moment(endDateStr); // Parse as local date
        return dateToCheck.isBetween(startDate, endDate, 'day', '[]') && !startDate.isSame(endDate, 'day');
      }
      return false;
    });
  };

  const isBankHoliday = (day: number) => {
    // Use moment for the date to check as well
    const dateToCheck = moment().year(currentDate.getFullYear()).month(currentDate.getMonth()).date(day).startOf('day');
    
    const holidays = getHolidaysFromAPI();
    return holidays.some(holiday => {
      const holidayDate = moment(formatEventDate(holiday)).startOf('day');
      return dateToCheck.isSame(holidayDate, 'day');
    });
  };

  const getBankHolidayName = (day: number) => {
    // Use moment for the date to check as well
    const dateToCheck = moment().year(currentDate.getFullYear()).month(currentDate.getMonth()).date(day).startOf('day');
    
    const holidays = getHolidaysFromAPI();
    const holiday = holidays.find(holiday => {
      const holidayDate = moment(formatEventDate(holiday)).startOf('day');
      return dateToCheck.isSame(holidayDate, 'day');
    });
    return holiday ? holiday.title : null;
  };

  const getBankHolidayColor = (day: number) => {
    // Use moment for the date to check as well
    const dateToCheck = moment().year(currentDate.getFullYear()).month(currentDate.getMonth()).date(day).startOf('day');
    
    const holidays = getHolidaysFromAPI();
    const holiday = holidays.find(holiday => {
      const holidayDate = moment(formatEventDate(holiday)).startOf('day');
      return dateToCheck.isSame(holidayDate, 'day');
    });
    return holiday ? holiday.color : '#DC2626'; // Default to red if no color found
  };

  // Memoize the function to prevent recreation on every render and improve performance
  const getEventsForSelectedDate = useCallback(() => {
    // Use moment for the selected date as well
    const selectedDateMoment = moment(selectedDate).startOf('day');
    
    let filteredEvents = calendarEvents.filter(event => {
      const typeMatches = eventTypeFilter === 'all' || event.eventType === eventTypeFilter;
      if (!typeMatches) return false;

      // Handle School_Holiday and School_Event types - use main event dates directly
      if ((event.eventType === 'School_Holiday' || event.eventType === 'School_Event') && event.eventDate && event.endDate) {
        // Extract only the date part to avoid timezone conversion
        const startDateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
        const endDateStr = event.endDate.split('T')[0]; // Get "2025-08-17" from "2025-08-17T19:00:00.000Z"
        const startDate = moment(startDateStr); // Parse as local date
        const endDate = moment(endDateStr); // Parse as local date
        return selectedDateMoment.isBetween(startDate, endDate, 'day', '[]');
      }

      // Check if the selected date falls within the event's date range
      if (event.startDate && event.endDate) {
        // Extract only the date part to avoid timezone conversion
        const startDateStr = event.startDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
        const endDateStr = event.endDate.split('T')[0]; // Get "2025-08-17" from "2025-08-17T19:00:00.000Z"
        const startDate = moment(startDateStr); // Parse as local date
        const endDate = moment(endDateStr); // Parse as local date
        return selectedDateMoment.isBetween(startDate, endDate, 'day', '[]');
      } else if (event.eventDate) {
        // Single day event
        // Extract only the date part to avoid timezone conversion
        const dateStr = event.eventDate.split('T')[0]; // Get "2025-06-26" from "2025-06-26T19:00:00.000Z"
        const eventDate = moment(dateStr); // Parse as local date
        return selectedDateMoment.isSame(eventDate, 'day');
      }
      return false;
    });
    
    // Sort events by start time
    return filteredEvents.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, [selectedDate, calendarEvents, eventTypeFilter]);

  const handleSaveEvent = async () => {
    const trimmedTitle = newEvent.title.trim();
    if (!trimmedTitle) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    if (trimmedTitle.length < 3) {
      Alert.alert('Error', 'Event title must be at least 3 characters long');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'No authentication token available');
      return;
    }

    if (!familyData?._id) {
      Alert.alert('Error', 'Family data not available');
      return;
    }

    setIsCreatingEvent(true);

    try {
      // Prepare family members array
      let familyMembers: string[] = [];
      if (newEvent.familyMember === 'all') {
        // Get all family member IDs
        const allMembers = getAllFamilyMembers();
        familyMembers = allMembers.map(member => member._id);
      } else {
        // Single family member
        familyMembers = [newEvent.familyMember];
      }

      // Use eventDate from picker if set, otherwise fallback to selectedDate
      let eventDateObj: Date;
      if (newEvent.eventDate) {
        eventDateObj = new Date(newEvent.eventDate);
      } else {
        eventDateObj = selectedDate;
      }
      const eventDate = `${eventDateObj.getFullYear()}-${String(eventDateObj.getMonth() + 1).padStart(2, '0')}-${String(eventDateObj.getDate()).padStart(2, '0')}`;
      console.log('Selected event date:', eventDateObj);
      console.log('Formatted event date:', eventDate);
      const eventData = {
        familyId: familyData?._id,
        title: newEvent.title,
        eventType: newEvent.type,
        eventDate: eventDate,
        startTime: formatTimeDisplay(newEvent.startTime),
        endTime: formatTimeDisplay(newEvent.endTime),
        location: newEvent.location || '',
        familyMembers: familyMembers,
        description: newEvent.description || ''
      };
      console.log('Creating event with data:', eventData);
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.CREATE_EVENT);
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token!),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Event created successfully!');
        
        // Reset form
        setNewEvent({
          title: '',
          type: 'Personal',
          startTime: '09:00',
          endTime: '10:00',
          location: '',
          description: '',
          familyMember: 'all',
          eventDate: undefined,
        });
        
        // Close modal
        setShowAddEventModal(false);
        
        // Refresh calendar events
        refetchEvents();
        
        // Trigger refresh event for home screen
        triggerRefresh('events');
      } else {
        throw new Error(data.message || 'Failed to create event');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', `Failed to create event: ${errorMessage}`);
      console.error('Create event error:', error);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    // Check if it's a schedule event
    if (event.eventType === 'Schedule') {
      handleEditSchedule(event);
    } else {
      // Regular event editing
      setEditingEvent(event);
      setNewEvent({
        title: event.title,
        type: event.eventType,
        startTime: event.startTime ? event.startTime.replace(' AM', '').replace(' PM', '') : '09:00',
        endTime: event.endTime ? event.endTime.replace(' AM', '').replace(' PM', '') : '10:00',
        location: event.location || '',
        description: event.description || '',
        familyMember: event.familyMembers && event.familyMembers.length > 1 ? 'all' : (event.familyMembers?.[0] || 'all'),
  eventDate: event.eventDate || undefined,
      });
      setShowEditEventModal(true);
    }
  };

  const handleEditSchedule = (schedule: CalendarEvent) => {
    setEditingSchedule({
      ...schedule,
      name: schedule.title,
      startDate: schedule.startDate ? new Date(schedule.startDate) : new Date(),
      endDate: schedule.endDate ? new Date(schedule.endDate) : new Date(),
      parent: schedule.responsibleParent === 'Primary' ? 'primary' : 'secondary',
      location: schedule.location || '',
      activities: schedule.activities || '',
      notes: schedule.notes || ''
    });
    setShowEditScheduleModal(true);
  };

  const handleUpdateEvent = async () => {
    const trimmedTitle = newEvent.title.trim();
    if (!trimmedTitle) {
      Alert.alert('Error', 'Please jk event title');
      return;
    }
    if (trimmedTitle.length < 3) {
      Alert.alert('Error', 'Event title must be at least 3 characters long');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'No authentication token available');
      return;
    }

    if (!editingEvent) {
      Alert.alert('Error', 'No event selected for editing');
      return;
    }

    setIsUpdatingEvent(true);

    try {
      // Prepare family members array
      let familyMembers: string[] = [];
      if (newEvent.familyMember === 'all') {
        // Get all family member IDs
        const allMembers = getAllFamilyMembers();
        familyMembers = allMembers.map(member => member._id);
      } else {
        // Single family member
        familyMembers = [newEvent.familyMember];
      }


      // Use eventDate from picker if set, otherwise fallback to selectedDate
      const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      let eventDateObj: Date;
      if (newEvent.eventDate) {
        eventDateObj = new Date(newEvent.eventDate);
      } else {
        eventDateObj = selectedDate;
      }
      const eventDate = formatDate(eventDateObj);

      const eventData = {
        eventId: editingEvent._id,
        title: newEvent.title,
        eventType: newEvent.type,
        eventDate: eventDate,
        startTime: formatTimeDisplay(newEvent.startTime),
        endTime: formatTimeDisplay(newEvent.endTime),
        location: newEvent.location || '',
        familyMembers: familyMembers,
        description: newEvent.description || '',
        ...(editingEvent.school && { schoolId: editingEvent.school._id })
      };

      const url = getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_EVENT);
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Event updated successfully!');
        
        // Reset form and close modal
        setEditingEvent(null);
        setShowEditEventModal(false);
        setNewEvent({
          title: '',
          type: 'Personal',
          startTime: '09:00',
          endTime: '10:00',
          location: '',
          description: '',
          familyMember: 'all',
          eventDate: undefined,
        });
        
        // Refresh calendar events
        refetchEvents();
        
        // Trigger refresh event for home screen
        triggerRefresh('events');
      } else {
        throw new Error(data.message || 'Failed to update event');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', `Failed to update event: ${errorMessage}`);
      console.error('Update event error:', error);
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
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

              setIsDeletingEvent(true);

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
                  
                  // Refresh calendar events
                  refetchEvents();
                  
                  // Trigger refresh event for home screen
                  triggerRefresh('events');
                } else {
                  throw new Error(data.message || 'Failed to delete event');
                }
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                Alert.alert('Error', `Failed to delete event: ${errorMessage}`);
                console.error('Delete event error:', error);
              } finally {
                setIsDeletingEvent(false);
              }
            }
          }
        ]
      );
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule?.name?.trim()) {
      Alert.alert('Error', 'Please enter a schedule name');
      return;
    }
    if (!editingSchedule?.parent) {
      Alert.alert('Error', 'Please select a parent');
      return;
    }
    if (!editingSchedule?.location?.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    try {
      setIsUpdatingSchedule(true);

      // Convert parent selection to API format
      const responsibleParent = editingSchedule.parent === 'primary' ? 'Primary' : 'Secondary';

      // Prepare schedule data for API
      const scheduleData = {
        scheduleId: editingSchedule._id,
        name: editingSchedule.name.trim(),
        startDate: editingSchedule.startDate.toISOString(),
        endDate: editingSchedule.endDate.toISOString(),
        responsibleParent: responsibleParent,
        location: editingSchedule.location.trim(),
        activities: editingSchedule.activities || 'No activities specified',
        notes: editingSchedule.notes || 'No additional notes'
      };

      // Call API to update schedule
      const url = getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_SCHEDULE);
      const headers = getAuthHeaders(token!);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear form and close modal
        setEditingSchedule(null);
        setShowEditScheduleModal(false);
        
        Alert.alert('Success', 'Schedule updated successfully!');
        
        // Refresh calendar events
        refetchEvents();
        
        // Trigger refresh event for home screen
        triggerRefresh('schedules');
      } else {
        throw new Error(data.message || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Update schedule error:', error);
      Alert.alert('Error', 'Failed to update schedule. Please try again.');
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

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
                
                // Refresh calendar events
                refetchEvents();
                
                // Trigger refresh event for home screen
                triggerRefresh('schedules');
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


  // Handle navigation parameters (e.g., opening add event modal from home screen)
  useEffect(() => {
    if (searchParams.action === 'addEvent') {
      console.log('Opening add event modal from navigation parameter');
      setShowAddEventModal(true);
      // Clear the parameter to avoid reopening on subsequent renders
      router.replace('/(tabs)/calendar');
    }
  }, [searchParams.action, router]);

  // Handle edit/delete navigation parameters when events are loaded
  useEffect(() => {
    if (!eventsLoading && calendarEvents.length > 0) {
      if (searchParams.action === 'editEvent' && searchParams.eventId) {
        console.log('Opening edit event modal from navigation parameter');
        // Find the event to edit
        const eventToEdit = calendarEvents.find(event => event._id === searchParams.eventId);
        if (eventToEdit) {
          handleEditEvent(eventToEdit);
          // Clear the parameter to avoid reopening on subsequent renders
          router.replace('/(tabs)/calendar');
        }
      } else if (searchParams.action === 'editSchedule' && searchParams.scheduleId) {
        console.log('Opening edit schedule modal from navigation parameter');
        // Find the schedule to edit
        const scheduleToEdit = calendarEvents.find(event => event._id === searchParams.scheduleId);
        if (scheduleToEdit) {
          handleEditSchedule(scheduleToEdit);
          // Clear the parameter to avoid reopening on subsequent renders
          router.replace('/(tabs)/calendar');
        }
      } else if (searchParams.action === 'deleteEvent' && searchParams.eventId) {
        console.log('Deleting event from navigation parameter');
        // Find the event to delete
        const eventToDelete = calendarEvents.find(event => event._id === searchParams.eventId);
        if (eventToDelete) {
          handleDeleteEvent(eventToDelete);
          // Clear the parameter to avoid reopening on subsequent renders
          router.replace('/(tabs)/calendar');
        }
      }
    }
  }, [searchParams.action, searchParams.eventId, searchParams.scheduleId, calendarEvents, eventsLoading, router]);


  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    // If selectedDate is not in the new month, select the 1st of the new month
    if (
      selectedDate.getMonth() !== newDate.getMonth() ||
      selectedDate.getFullYear() !== newDate.getFullYear()
    ) {
      setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };

  // Custom calendar component
  const CustomCalendar = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };
    
    const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
    
    const hasEventsOnDate = (day: number) => {
      const dateToCheck = moment().year(currentDate.getFullYear()).month(currentDate.getMonth()).date(day).startOf('day');
      
      return calendarEvents.some(event => {
        const typeMatches = eventTypeFilter === 'all' || event.eventType === eventTypeFilter;
        if (!typeMatches) return false;
        
        // Handle School_Event and School_Holiday with eventDate and endDate
        if ((event.eventType === 'School_Event' || event.eventType === 'School_Holiday') && event.eventDate && event.endDate) {
          const startDate = moment(event.eventDate.split('T')[0]).startOf('day');
          const endDate = moment(event.endDate.split('T')[0]).startOf('day');
          return dateToCheck.isBetween(startDate, endDate, null, '[]');
        }
        
        // Handle regular events with startDate and endDate
        if (event.startDate && event.endDate) {
          const startDate = moment(event.startDate.split('T')[0]).startOf('day');
          const endDate = moment(event.endDate.split('T')[0]).startOf('day');
          return dateToCheck.isBetween(startDate, endDate, null, '[]');
        }
        
        // Handle single-day events with only eventDate
        if (event.eventDate && !event.endDate) {
          const eventDate = moment(event.eventDate.split('T')[0]).startOf('day');
          return eventDate.isSame(dateToCheck);
        }
        
        return false;
      });
    };
    
    const renderCalendarDays = () => {
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDay = getFirstDayOfMonth(currentDate);
      const days = [];
      
      // Empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(
          <View key={`empty-${i}`} style={styles.calendarDay} />
        );
      }
      
      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const isSelected = selectedDate.getDate() === day && 
                          selectedDate.getMonth() === currentDate.getMonth() &&
                          selectedDate.getFullYear() === currentDate.getFullYear();
        const isToday = new Date().getDate() === day && 
                       new Date().getMonth() === currentDate.getMonth() &&
                       new Date().getFullYear() === currentDate.getFullYear();
        const hasEvents = hasEventsOnDate(day);
        
        days.push(
          <TouchableOpacity
            key={day}
            style={[
              styles.calendarDay,
              isSelected && styles.selectedDay,
              isToday && !isSelected && styles.todayDay
            ]}
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(day);
              setSelectedDate(newDate);
            }}
          >
            <Text style={[
              styles.calendarDayText,
              isSelected && styles.selectedDayText,
              isToday && !isSelected && styles.todayDayText
            ]}>
              {day}
            </Text>
            {hasEvents && (
              <View style={[
                styles.eventDot,
                isSelected && styles.selectedEventDot
              ]} />
            )}
          </TouchableOpacity>
        );
      }
      
      return days;
    };
    
    return (
      <View style={styles.customCalendar}>
        {/* Day Names */}
        <View style={styles.dayNamesRow}>
          {dayNames.map(dayName => (
            <View key={dayName} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{dayName}</Text>
            </View>
          ))}
        </View>
        
        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {renderCalendarDays()}
        </View>
      </View>
    );
  };

  // Memoize selectedDateEvents to prevent unnecessary re-renders when month changes
  const selectedDateEvents = useMemo(() => {
    return getEventsForSelectedDate();
  }, [selectedDate, calendarEvents, eventTypeFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0e3c67"
            colors={['#0e3c67']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setShowEventTypeFilter(!showEventTypeFilter)}
            >
              <Filter size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddEventModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Type Filter */}
        {showEventTypeFilter && (
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                eventTypeFilter === 'all' && styles.filterButtonActive
              ]}
              onPress={() => setEventTypeFilter('all')}
            >
              <Text style={[
                styles.filterButtonText,
                eventTypeFilter === 'all' && styles.filterButtonTextActive
              ]}>All</Text>
            </TouchableOpacity>
            {(['Personal', 'School', 'School_Event', 'School_Holiday', 'Activity', 'Holiday', 'Medical'] as EventType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  eventTypeFilter === type && styles.filterButtonActive
                ]}
                onPress={() => setEventTypeFilter(type)}
              >
                <Text style={[
                  styles.filterButtonText,
                  eventTypeFilter === type && styles.filterButtonTextActive
                ]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Month Navigation Header */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <ChevronLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <ChevronRight size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Smooth Horizontal Calendar using react-native-calendars */}
        {/* Custom Calendar Component - No Third Party Library */}
        <CustomCalendar />

        {/* Events for Selected Date */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>
            Events for {selectedDate.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>

          {eventsLoading ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : eventsError ? (
            <View style={styles.errorState}>
              <Text style={styles.errorTitle}>Error loading events</Text>
              <Text style={styles.errorSubtitle}>{eventsError}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={refetchEvents}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <TouchableOpacity key={event._id} style={styles.eventCard}>
                <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleContainer}>
                      <View style={styles.eventIconContainer}>
                        <Text style={styles.eventTypeIcon}>{getEventTypeIcon(event.eventType)}</Text>
                      </View>
                      <View style={styles.eventTitleContent}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventDateRange}>{formatEventDateRange(event)}</Text>
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
                            <Edit size={16} color={COLORS.white} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.eventActionDeleteButton}
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
            ))
          ) : (
            <View style={styles.noEvents}>
              <Text style={styles.noEventsText}>No events scheduled for this day</Text>
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={() => setShowAddEventModal(true)}
              >
                <Text style={styles.addEventText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Add Event Modal */}
        <Modal
          visible={showAddEventModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowAddEventModal(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>
                    Add Event for {selectedDate.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    (!newEvent.title.trim() || isCreatingEvent) && styles.saveButtonDisabled
                  ]}
                  onPress={handleSaveEvent}
                  disabled={!newEvent.title.trim() || isCreatingEvent}
                >
                  <Text style={[
                    styles.saveButtonText,
                    (!newEvent.title.trim() || isCreatingEvent) && styles.saveButtonTextDisabled
                  ]}>
                    {isCreatingEvent ? 'Creating...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Event Title */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Event Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEvent.title}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
                  placeholder="Enter event title"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Event Type */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Event Type</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowEventTypeDropdown(!showEventTypeDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>{newEvent.type}</Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
                
                {showEventTypeDropdown && (
                  <View style={styles.dropdownMenu}>
                    {eventTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.dropdownItem,
                          newEvent.type === type.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setNewEvent(prev => ({ ...prev, type: type.id }));
                          setShowEventTypeDropdown(false);
                        }}
                      >
                        <View style={[styles.typeColorDot, { backgroundColor: type.color }]} />
                        <Text style={[
                          styles.dropdownItemText,
                          newEvent.type === type.id && styles.dropdownItemTextSelected
                        ]}>
                          {type.label}
                        </Text>
                        {newEvent.type === type.id && (
                          <Check size={16} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Event Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Event Date</Text>
                <TouchableOpacity
                  style={styles.textInput}
                  onPress={() => setShowEditEventDatePicker(true)}
                >
                  <Text style={styles.timeText}>
                    {newEvent.eventDate
                      ? new Date(newEvent.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time Fields */}
          {/* Edit Event Date Picker */}
          {showEditEventDatePicker && (
            <Modal
              visible={showEditEventDatePicker}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowEditEventDatePicker(false)}
            >
              <View style={styles.overlay}>
                <SafeAreaView style={styles.datePickerModal}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowEditEventDatePicker(false)}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select Event Date</Text>
                    <TouchableOpacity onPress={() => setShowEditEventDatePicker(false)}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerContent}>
                    <DateTimePicker
                      value={newEvent.eventDate ? new Date(newEvent.eventDate) : selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDateValue) => {
                        if (selectedDateValue) {
                          setNewEvent(prev => ({ ...prev, eventDate: selectedDateValue.toISOString() }));
                        }
                      }}
                      textColor="#000000"
                      accentColor="#0e3c67"
                    />
                  </View>
                </SafeAreaView>
              </View>
            </Modal>
          )}
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>Start Time</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={styles.timeText}>{formatTimeDisplay(newEvent.startTime)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>End Time</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.timeText}>{formatTimeDisplay(newEvent.endTime)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEvent.location}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, location: text }))}
                  placeholder="Enter location"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Family Member */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Family Member</Text>
                {familyLoading ? (
                  <Text style={styles.loadingText}>Loading family members...</Text>
                ) : !hasActualFamilyMembers() ? (
                  <View style={styles.noFamilyContainer}>
                    <Text style={styles.noFamilyTitle}>No Family Found</Text>
                    <Text style={styles.noFamilyMessage}>
                      You need to create a family first before creating events.
                    </Text>
                    <TouchableOpacity 
                      style={styles.createFamilyButton}
                      onPress={() => {
                        setShowAddEventModal(false);
                        router.push('/family');
                      }}
                    >
                      <Text style={styles.createFamilyButtonText}>Go to Family</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.memberScrollView}
                    contentContainerStyle={styles.memberScrollContent}
                  >
                    {getFamilyMembers().map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          styles.memberOption,
                          newEvent.familyMember === member.id && styles.memberOptionSelected
                        ]}
                        onPress={() => setNewEvent(prev => ({ ...prev, familyMember: member.id }))}
                      >
                        <Text style={[
                          styles.memberLabel,
                          newEvent.familyMember === member.id && styles.memberLabelSelected
                        ]}>
                          {member.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newEvent.description}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
                  placeholder="Add notes or description"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          </SafeAreaView>

          {/* Custom Time Pickers */}
          {showStartTimePicker && (
            <Modal
              visible={showStartTimePicker}
              animationType="slide"
              presentationStyle="formSheet"
              onRequestClose={() => setShowStartTimePicker(false)}
            >
              <SafeAreaView style={styles.timePickerModal}>
                <View style={styles.timePickerHeader}>
                  <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                    <Text style={styles.timePickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.timePickerTitle}>Select Start Time</Text>
                  <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                    <Text style={styles.timePickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={timeSlots}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeSlotItem,
                        newEvent.startTime === item.value && styles.timeSlotSelected
                      ]}
                      onPress={() => {
                        setNewEvent(prev => ({ ...prev, startTime: item.value }));
                        setShowStartTimePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        newEvent.startTime === item.value && styles.timeSlotTextSelected
                      ]}>
                        {item.label}
                      </Text>
                      {newEvent.startTime === item.value && (
                        <Check size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </SafeAreaView>
            </Modal>
          )}

          {showEndTimePicker && (
            <Modal
              visible={showEndTimePicker}
              animationType="slide"
              presentationStyle="formSheet"
              onRequestClose={() => setShowEndTimePicker(false)}
            >
              <SafeAreaView style={styles.timePickerModal}>
                <View style={styles.timePickerHeader}>
                  <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                    <Text style={styles.timePickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.timePickerTitle}>Select End Time</Text>
                  <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                    <Text style={styles.timePickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={timeSlots}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeSlotItem,
                        newEvent.endTime === item.value && styles.timeSlotSelected
                      ]}
                      onPress={() => {
                        setNewEvent(prev => ({ ...prev, endTime: item.value }));
                        setShowEndTimePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        newEvent.endTime === item.value && styles.timeSlotTextSelected
                      ]}>
                        {item.label}
                      </Text>
                      {newEvent.endTime === item.value && (
                        <Check size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </SafeAreaView>
            </Modal>
          )}
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit Event Modal */}
        <Modal
          visible={showEditEventModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowEditEventModal(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>
                    Edit Event
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    (!newEvent.title.trim() || isUpdatingEvent) && styles.saveButtonDisabled
                  ]}
                  onPress={handleUpdateEvent}
                  disabled={!newEvent.title.trim() || isUpdatingEvent}
                >
                  <Text style={[
                    styles.saveButtonText,
                    (!newEvent.title.trim() || isUpdatingEvent) && styles.saveButtonTextDisabled
                  ]}>
                    {isUpdatingEvent ? 'Updating...' : 'Update'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Event Title */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Event Title</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEvent.title}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
                  placeholder="Enter event title"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Event Type */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Event Type</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowEventTypeDropdown(!showEventTypeDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>{newEvent.type}</Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
                
                {showEventTypeDropdown && (
                  <View style={styles.dropdownMenu}>
                    {eventTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.dropdownItem,
                          newEvent.type === type.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setNewEvent(prev => ({ ...prev, type: type.id }));
                          setShowEventTypeDropdown(false);
                        }}
                      >
                        <View style={[styles.typeColorDot, { backgroundColor: type.color }]} />
                        <Text style={[
                          styles.dropdownItemText,
                          newEvent.type === type.id && styles.dropdownItemTextSelected
                        ]}>
                          {type.label}
                        </Text>
                        {newEvent.type === type.id && (
                          <Check size={16} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Event Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Event Date</Text>
                <TouchableOpacity
                  style={styles.textInput}
                  onPress={() => setShowEditEventDatePicker(true)}
                >
                  <Text style={styles.timeText}>
                    {newEvent.eventDate
                      ? new Date(newEvent.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Edit Event Date Picker */}
              {showEditEventDatePicker && (
                <Modal
                  visible={showEditEventDatePicker}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setShowEditEventDatePicker(false)}
                >
                  <View style={styles.overlay}>
                    <SafeAreaView style={styles.datePickerModal}>
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={() => setShowEditEventDatePicker(false)}>
                          <Text style={styles.datePickerCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.datePickerTitle}>Select Event Date</Text>
                        <TouchableOpacity onPress={() => setShowEditEventDatePicker(false)}>
                          <Text style={styles.datePickerDone}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.datePickerContent}>
                        <DateTimePicker
                          value={newEvent.eventDate ? new Date(newEvent.eventDate) : selectedDate}
                          mode="date"
                          display="spinner"
                          onChange={(event, selectedDateValue) => {
                            if (selectedDateValue) {
                              setNewEvent(prev => ({ ...prev, eventDate: selectedDateValue.toISOString() }));
                            }
                          }}
                          textColor="#000000"
                          accentColor="#0e3c67"
                        />
                      </View>
                    </SafeAreaView>
                  </View>
                </Modal>
              )}
              
              {/* Time Fields */}
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>Start Time</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={styles.timeText}>{formatTimeDisplay(newEvent.startTime)}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.fieldLabel}>End Time</Text>
                  <TouchableOpacity
                    style={styles.textInput}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.timeText}>{formatTimeDisplay(newEvent.endTime)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Location</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEvent.location}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, location: text }))}
                  placeholder="Enter location"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Family Member */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Family Member</Text>
                {familyLoading ? (
                  <Text style={styles.loadingText}>Loading family members...</Text>
                ) : !hasActualFamilyMembers() ? (
                  <View style={styles.noFamilyContainer}>
                    <Text style={styles.noFamilyTitle}>No Family Found</Text>
                    <Text style={styles.noFamilyMessage}>
                      You need to create a family first before creating events.
                    </Text>
                    <TouchableOpacity 
                      style={styles.createFamilyButton}
                      onPress={() => {
                        setShowEditEventModal(false);
                        router.push('/family');
                      }}
                    >
                      <Text style={styles.createFamilyButtonText}>Go to Family</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.memberScrollView}
                    contentContainerStyle={styles.memberScrollContent}
                  >
                    {getFamilyMembers().map((member) => (
                      <TouchableOpacity
                        key={member.id}
                        style={[
                          styles.memberOption,
                          newEvent.familyMember === member.id && styles.memberOptionSelected
                        ]}
                        onPress={() => setNewEvent(prev => ({ ...prev, familyMember: member.id }))}
                      >
                        <Text style={[
                          styles.memberLabel,
                          newEvent.familyMember === member.id && styles.memberLabelSelected
                        ]}>
                          {member.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newEvent.description}
                  onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
                  placeholder="Add notes or description"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          </SafeAreaView>

          {/* Custom Time Pickers */}
          {showStartTimePicker && (
            <Modal
              visible={showStartTimePicker}
              animationType="slide"
              presentationStyle="formSheet"
              onRequestClose={() => setShowStartTimePicker(false)}
            >
              <SafeAreaView style={styles.timePickerModal}>
                <View style={styles.timePickerHeader}>
                  <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                    <Text style={styles.timePickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.timePickerTitle}>Select Start Time</Text>
                  <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                    <Text style={styles.timePickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={timeSlots}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeSlotItem,
                        newEvent.startTime === item.value && styles.timeSlotSelected
                      ]}
                      onPress={() => {
                        setNewEvent(prev => ({ ...prev, startTime: item.value }));
                        setShowStartTimePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        newEvent.startTime === item.value && styles.timeSlotTextSelected
                      ]}>
                        {item.label}
                      </Text>
                      {newEvent.startTime === item.value && (
                        <Check size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </SafeAreaView>
            </Modal>
          )}

          {showEndTimePicker && (
            <Modal
              visible={showEndTimePicker}
              animationType="slide"
              presentationStyle="formSheet"
              onRequestClose={() => setShowEndTimePicker(false)}
            >
              <SafeAreaView style={styles.timePickerModal}>
                <View style={styles.timePickerHeader}>
                  <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                    <Text style={styles.timePickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.timePickerTitle}>Select End Time</Text>
                  <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                    <Text style={styles.timePickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={timeSlots}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.timeSlotItem,
                        newEvent.endTime === item.value && styles.timeSlotSelected
                      ]}
                      onPress={() => {
                        setNewEvent(prev => ({ ...prev, endTime: item.value }));
                        setShowEndTimePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        newEvent.endTime === item.value && styles.timeSlotTextSelected
                      ]}>
                        {item.label}
                      </Text>
                      {newEvent.endTime === item.value && (
                        <Check size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </SafeAreaView>
            </Modal>
          )}
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit Schedule Modal */}
        <Modal
          visible={showEditScheduleModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowEditScheduleModal(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Edit Schedule</Text>
                  <Text style={styles.modalSubtitle}>Update schedule details</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    (!editingSchedule?.name?.trim() || !editingSchedule?.parent || !editingSchedule?.location?.trim() || isUpdatingSchedule) && styles.saveButtonDisabled
                  ]}
                  onPress={handleUpdateSchedule}
                  disabled={!editingSchedule?.name?.trim() || !editingSchedule?.parent || !editingSchedule?.location?.trim() || isUpdatingSchedule}
                >
                  <Text style={[
                    styles.saveButtonText,
                    (!editingSchedule?.name?.trim() || !editingSchedule?.parent || !editingSchedule?.location?.trim() || isUpdatingSchedule) && styles.saveButtonTextDisabled
                  ]}>
                    {isUpdatingSchedule ? 'Updating...' : 'Update'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Schedule Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Name of Schedule</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingSchedule?.name || ''}
                  onChangeText={(text) => setEditingSchedule((prev: any) => ({ ...prev, name: text }))}
                  placeholder="Weekend with dad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Date Range */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Date Range</Text>
                <View style={styles.dateRangeContainer}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <CalendarIcon size={16} color="#6B7280" />
                    <View style={styles.dateButtonContent}>
                      <Text style={styles.dateButtonLabel}>Start Date</Text>
                      <Text style={styles.dateButtonText}>
                        {editingSchedule?.startDate?.toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <CalendarIcon size={16} color="#6B7280" />
                    <View style={styles.dateButtonContent}>
                      <Text style={styles.dateButtonLabel}>End Date</Text>
                      <Text style={styles.dateButtonText}>
                        {editingSchedule?.endDate?.toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Parent Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Responsible Parent</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowParentDropdown(!showParentDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {editingSchedule?.parent ? parentOptions.find(p => p.id === editingSchedule.parent)?.label : 'Select parent'}
                  </Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
                
                {showParentDropdown && (
                  <View style={styles.dropdownMenu}>
                    {parentOptions.map((parent) => (
                      <TouchableOpacity
                        key={parent.id}
                        style={[
                          styles.dropdownItem,
                          editingSchedule?.parent === parent.id && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setEditingSchedule((prev: any) => ({ ...prev, parent: parent.id }));
                          setShowParentDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          editingSchedule?.parent === parent.id && styles.dropdownItemTextSelected
                        ]}>
                          {parent.label}
                        </Text>
                        {editingSchedule?.parent === parent.id && (
                          <Check size={16} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Location */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Location</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {editingSchedule?.location || 'Select location'}
                  </Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
                
                {showLocationDropdown && (
                  <View style={styles.dropdownMenu}>
                    {locationOptions.map((location) => (
                      <TouchableOpacity
                        key={location}
                        style={[
                          styles.dropdownItem,
                          editingSchedule?.location === location && styles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setEditingSchedule((prev: any) => ({ ...prev, location }));
                          setShowLocationDropdown(false);
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          editingSchedule?.location === location && styles.dropdownItemTextSelected
                        ]}>
                          {location}
                        </Text>
                        {editingSchedule?.location === location && (
                          <Check size={16} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Activities */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Activities</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editingSchedule?.activities || ''}
                  onChangeText={(text) => setEditingSchedule((prev: any) => ({ ...prev, activities: text }))}
                  placeholder="List all planned activities"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Notes */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editingSchedule?.notes || ''}
                  onChangeText={(text) => setEditingSchedule((prev: any) => ({ ...prev, notes: text }))}
                  placeholder="Add any additional notes"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          </SafeAreaView>

          {/* Date Pickers */}
          {showStartDatePicker && (
            <Modal
              visible={showStartDatePicker}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowStartDatePicker(false)}
            >
              <View style={styles.overlay}>
                <SafeAreaView style={styles.datePickerModal}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select Start Date</Text>
                    <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerContent}>
                    <DateTimePicker
                      value={editingSchedule?.startDate || new Date()}
                      mode="date"
                      display="spinner"
                      minimumDate={new Date()}       
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setEditingSchedule((prev: any) => ({ ...prev, startDate: selectedDate }));
                        }
                      }}
                      textColor="#000000"
                      accentColor="#0e3c67"
                    />
                  </View>
                </SafeAreaView>
              </View>
            </Modal>
          )}

          {showEndDatePicker && (
            <Modal
              visible={showEndDatePicker}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowEndDatePicker(false)}
            >
              <View style={styles.overlay}>
                <SafeAreaView style={styles.datePickerModal}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select End Date</Text>
                    <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerContent}>
                    <DateTimePicker
                      value={editingSchedule?.endDate || new Date()}
                      mode="date"
                      display="spinner"
                      minimumDate={new Date()}       
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setEditingSchedule((prev: any) => ({ ...prev, endDate: selectedDate }));
                        }
                      }}
                      textColor="#000000"
                      accentColor="#0e3c67"
                    />
                  </View>
                </SafeAreaView>
              </View>
            </Modal>
          )}
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    backgroundColor: COLORS.background,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,

  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: '#0e3c67',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.cardBackground,
  },
  // Custom Calendar Styles
  customCalendar: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
    width: '100%',
  },
  dayNameCell: {
    width: '14.28571%', // Match calendar day width
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  calendarDay: {
    width: '14.28571%', // Exactly 100/7 for proper Sunday alignment
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDay: {
    backgroundColor: '#EBF4FF',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todayDayText: {
    color: '#0e3c67',
    fontWeight: '600',
  },
  eventDot: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    transform: [{ translateX: -2 }],
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    zIndex: 2,
  },
  selectedEventDot: {
    backgroundColor: COLORS.white,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  calendar: {
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  // New styles for react-native-calendars horizontal calendar
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,

  },
  calendarWrapper: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: COLORS.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  calendarList: {
    borderRadius: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    width: (width - 76) / 7,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emptyDay: {
    width: (width - 76) / 7,
    height: 40,
  },
  dayCell: {
    width: (width - 76) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  bankHolidayDay: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
  },
  bankHolidayText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  holidayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventsSection: {
    padding: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  eventCard: {
  backgroundColor: COLORS.cardBackground,
  borderRadius: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: COLORS.border,
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
    marginLeft: -6

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
    color: COLORS.textPrimary,
  },
  eventDateRange: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
    eventActionDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.deleteBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Schedule Modal Styles
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  dateButtonContent: {
    flex: 1,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dateButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  // Date Picker Modal Styles (matching profile settings)
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)", // dim background
  },
  datePickerModal: {
    height: 300,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 10,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  datePickerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  datePickerCancel: {
    fontSize: 16,
    color: "#6B7280",
  },
  datePickerDone: {
    fontSize: 16,
    color: "#0e3c67",
    fontWeight: "600",
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
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  noEvents: {
    backgroundColor: COLORS.cardBackground,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noEventsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  addEventButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addEventText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingState: {
  backgroundColor: COLORS.cardBackground,
  padding: 32,
  borderRadius: 12,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: COLORS.border,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorState: {
    backgroundColor: COLORS.cardBackground,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalHeader: {
    backgroundColor: COLORS.cardBackground,
    paddingTop: 8,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalHeaderDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginTop: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  dropdownMenu: {
  backgroundColor: COLORS.cardBackground,
  borderRadius: 12,
  marginTop: 8,
  borderWidth: 1,
  borderColor: COLORS.border,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
  overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#3B82F6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropdownTrigger: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  typeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  timeField: {
    flex: 1,
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberScrollView: {
    maxHeight: 60,
  },
  memberScrollContent: {
    paddingRight: 20,
  },
  memberOption: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  memberOptionSelected: {
    borderColor: '#0e3c67',
    backgroundColor: '#F0F7FF',
  },
  memberLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  memberLabelSelected: {
    color: '#0e3c67',
    fontWeight: '700',
    textAlign: 'center',
  },
  // Time Picker Modal Styles
  timePickerModal: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timePickerCancel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timePickerDone: {
    fontSize: 16,
    color: '#0e3c67',
    fontWeight: '600',
  },
  timeSlotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // No Family Styles
  noFamilyContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  noFamilyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  noFamilyMessage: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  createFamilyButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFamilyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});