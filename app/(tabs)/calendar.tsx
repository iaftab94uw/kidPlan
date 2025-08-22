import React, { useState } from 'react';
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
  FlatList
} from 'react-native';
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
  Check
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // UK Bank Holidays for 2024-2025
  const ukBankHolidays = [
    // 2024 holidays
    { date: new Date(2024, 0, 1), name: "New Year's Day" },
    { date: new Date(2024, 2, 29), name: "Good Friday" },
    { date: new Date(2024, 3, 1), name: "Easter Monday" },
    { date: new Date(2024, 4, 6), name: "Early May Bank Holiday" },
    { date: new Date(2024, 4, 27), name: "Spring Bank Holiday" },
    { date: new Date(2024, 7, 26), name: "Summer Bank Holiday" },
    { date: new Date(2024, 11, 25), name: "Christmas Day" },
    { date: new Date(2024, 11, 26), name: "Boxing Day" },
    
    // 2025 holidays
    { date: new Date(2025, 0, 1), name: "New Year's Day" },
    { date: new Date(2025, 3, 18), name: "Good Friday" },
    { date: new Date(2025, 3, 21), name: "Easter Monday" },
    { date: new Date(2025, 4, 5), name: "Early May Bank Holiday" },
    { date: new Date(2025, 4, 26), name: "Spring Bank Holiday" },
    { date: new Date(2025, 7, 25), name: "Summer Bank Holiday" },
    { date: new Date(2025, 11, 25), name: "Christmas Day" },
    { date: new Date(2025, 11, 26), name: "Boxing Day" },
  ];

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Emma's Piano Lesson",
      time: "4:00 PM - 5:00 PM",
      startTime: "16:00",
      endTime: "17:00",
      location: "Music Academy",
      child: "Emma",
      color: "#22C55E",
      type: "activity",
      date: new Date().toDateString()
    },
    {
      id: 2,
      title: "School Assembly",
      time: "9:00 AM - 10:00 AM",
      startTime: "09:00",
      endTime: "10:00",
      location: "Oakwood Primary",
      child: "Both",
      color: "#3B82F6",
      type: "school",
      date: new Date().toDateString()
    },
    {
      id: 3,
      title: "Football Practice",
      time: "6:00 PM - 7:30 PM",
      startTime: "18:00",
      endTime: "19:30",
      location: "Community Center",
      child: "Jack",
      color: "#F97316",
      type: "activity",
      date: new Date().toDateString()
    }
  ]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Personal',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
    familyMember: 'Both'
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

  const familyMembers = [
    { id: 'Both', label: 'Both Children' },
    { id: 'Emma', label: 'Emma' },
    { id: 'Jack', label: 'Jack' }
  ];

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
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.some(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === dateToCheck.toDateString();
    });
  };

  const isBankHoliday = (day: number) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return ukBankHolidays.some(holiday => 
      holiday.date.toDateString() === dateToCheck.toDateString()
    );
  };

  const getBankHolidayName = (day: number) => {
    const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const holiday = ukBankHolidays.find(holiday => 
      holiday.date.toDateString() === dateToCheck.toDateString()
    );
    return holiday ? holiday.name : null;
  };

  const getEventsForSelectedDate = () => {
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
    
    // Add bank holiday if it exists for selected date
    const holidayName = getBankHolidayName(selectedDate.getDate());
    if (holidayName && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear()) {
      const bankHolidayEvent = {
        id: 'bank-holiday',
        title: holidayName,
        time: 'All Day',
        startTime: '00:00',
        endTime: '23:59',
        location: 'UK',
        child: 'All',
        color: '#DC2626',
        type: 'holiday',
        date: selectedDate.toDateString()
      };
      filteredEvents.unshift(bankHolidayEvent);
    }
    
    // Sort events by start time
    return filteredEvents.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  const handleSaveEvent = () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    const eventTypeColor = getEventTypeColor(newEvent.type);
    const startTime = formatTimeDisplay(newEvent.startTime);
    const endTime = formatTimeDisplay(newEvent.endTime);
    
    const eventToAdd = {
      id: events.length + 1,
      title: newEvent.title,
      time: `${startTime} - ${endTime}`,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location || 'No location',
      child: newEvent.familyMember,
      color: eventTypeColor,
      type: newEvent.type.toLowerCase(),
      date: selectedDate.toDateString()
    };

    setEvents(prevEvents => [...prevEvents, eventToAdd]);
    Alert.alert('Success', 'Event added successfully!');
    
    // Reset form
    setNewEvent({
      title: '',
      type: 'Personal',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      description: '',
      familyMember: 'Both'
    });
    setShowAddEventModal(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.emptyDay} />);
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
      const isBankHol = isBankHoliday(day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDay,
            isToday && !isSelected && styles.todayDay,
            isBankHol && !isSelected && styles.bankHolidayDay
          ]}
          onPress={() => {
            const newDate = new Date(currentDate);
            newDate.setDate(day);
            setSelectedDate(newDate);
          }}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && !isSelected && styles.todayDayText,
            isBankHol && !isSelected && styles.bankHolidayText
          ]}>
            {day}
          </Text>
          {hasEvents && (
            <View style={[styles.eventDot, { backgroundColor: '#0e3c67' }]} />
          )}
          {isBankHol && (
            <View style={[styles.holidayDot, { backgroundColor: '#DC2626' }]} />
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const selectedDateEvents = getEventsForSelectedDate();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Filter size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddEventModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Navigation */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <ChevronRight size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {dayNames.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.daysGrid}>
            {renderCalendarDays()}
          </View>
        </View>

        {/* Events for Selected Date */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>
            Events for {selectedDate.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>

          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventType}>{event.type}</Text>
                  </View>
                  <View style={styles.eventMeta}>
                    <View style={styles.eventMetaItem}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.eventMetaText}>{event.time}</Text>
                    </View>
                    <View style={styles.eventMetaItem}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.eventMetaText}>{event.location}</Text>
                    </View>
                    <View style={styles.eventMetaItem}>
                      <User size={16} color="#6B7280" />
                      <Text style={styles.eventMetaText}>{event.child}</Text>
                    </View>
                  </View>
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
                    !newEvent.title.trim() && styles.saveButtonDisabled
                  ]}
                  onPress={handleSaveEvent}
                  disabled={!newEvent.title.trim()}
                >
                  <Text style={[
                    styles.saveButtonText,
                    !newEvent.title.trim() && styles.saveButtonTextDisabled
                  ]}>Save</Text>
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
                <View style={styles.memberGrid}>
                  {familyMembers.map((member) => (
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
                </View>
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
        </Modal>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  calendar: {
    backgroundColor: '#FFFFFF',
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
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    width: (width - 72) / 7,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: (width - 72) / 7,
    height: 40,
  },
  dayCell: {
    width: (width - 72) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#0e3c67',
    borderRadius: 20,
  },
  todayDay: {
    backgroundColor: '#E6F3FF',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDayText: {
    color: '#0e3c67',
    fontWeight: '600',
  },
  bankHolidayDay: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
  },
  bankHolidayText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 2,
  },
  holidayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 2,
    right: 8,
  },
  eventsSection: {
    padding: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
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
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
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
    marginLeft: 8,
  },
  noEvents: {
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
    marginBottom: 16,
  },
  addEventButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addEventText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
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
    color: '#111827',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#0e3c67',
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
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
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
    color: '#111827',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
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
    color: '#111827',
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
  memberOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: 100,
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
    color: '#6B7280',
  },
  memberLabelSelected: {
    color: '#0e3c67',
    fontWeight: '700',
  },
  // Time Picker Modal Styles
  timePickerModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
    fontWeight: '500',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    backgroundColor: '#0e3c67',
  },
  timeSlotText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});