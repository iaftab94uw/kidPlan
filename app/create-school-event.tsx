import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  ArrowLeft,
  X,
  ChevronDown,
  Check,
  Clock,
  MapPin,
  User,
  Calendar as CalendarIcon,
  GraduationCap
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyDetails } from '@/hooks/useFamilyDetails';
import { useSchools } from '@/hooks/useSchools';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { EventType } from '@/types/calendar';

interface SchoolEventForm {
  title: string;
  eventType: EventType;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  schoolId: string;
  familyMembers: string[];
  description: string;
}

const schoolEventTypes = [
  { id: 'School' as EventType, label: 'School Event', color: '#3B82F6' },
  { id: 'School_Holiday' as EventType, label: 'School Holiday', color: '#EF4444' },
];

export default function CreateSchoolEvent() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { user, token } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<SchoolEventForm>({
    title: '',
    eventType: 'School',
    eventDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    startTime: '09:00',
    endTime: '17:00',
    location: '',
    schoolId: (searchParams.schoolId as string) || '',
    familyMembers: [],
    description: ''
  });

  // UI state
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Hooks
  const { familyData, getAllFamilyMembers } = useFamilyDetails(token || '');
  const { schools, loading: schoolsLoading, fetchSchools } = useSchools(token || '');

  // Load data on mount
  useEffect(() => {
    if (token) {
      getAllFamilyMembers();
      fetchSchools({ page: 1, limit: 100 }); // Load schools for selection
    }
  }, [token]);

  // Update school name when schools data loads and we have a pre-selected school
  useEffect(() => {
    if (searchParams.schoolId && schools.length > 0 && !formData.schoolId) {
      const selectedSchool = schools.find(school => school._id === searchParams.schoolId);
      if (selectedSchool) {
        setFormData(prev => ({ ...prev, schoolId: selectedSchool._id }));
      }
    }
  }, [schools, searchParams.schoolId, formData.schoolId]);

  // Helper functions
  const formatTimeDisplay = useCallback((time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  // Generate time slots with 15-minute intervals (memoized)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(timeString);
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  }, []);

  const formatDateDisplay = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const getFamilyMembers = useCallback(() => {
    const allMembers = getAllFamilyMembers();
    
    // If no family data is available, return empty array
    if (!familyData || allMembers.length === 0) {
      return [];
    }
    
    const familyMembers = [
      { id: 'all', label: 'All Family Members' }
    ];
    
    allMembers.forEach(member => {
      familyMembers.push({
        id: member._id,
        label: member.name || 'Family Member'
      });
    });
    
    return familyMembers;
  }, [getAllFamilyMembers, familyData]);

  const handleTimeChange = (time: Date, type: 'start' | 'end') => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    setFormData(prev => ({
      ...prev,
      [type === 'start' ? 'startTime' : 'endTime']: timeString
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        eventDate: selectedDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
  };

  const toggleFamilyMember = (memberId: string) => {
    setFormData(prev => {
      if (memberId === 'all') {
        // If "all" is selected, clear all other selections and select only "all"
        return {
          ...prev,
          familyMembers: prev.familyMembers.includes('all') ? [] : ['all']
        };
      } else {
        // If individual member is selected, remove "all" if it exists and toggle the member
        const newMembers = prev.familyMembers.includes('all') 
          ? [memberId] // Remove "all" and add this member
          : prev.familyMembers.includes(memberId)
            ? prev.familyMembers.filter(id => id !== memberId) // Remove this member
            : [...prev.familyMembers, memberId]; // Add this member
        
        return {
          ...prev,
          familyMembers: newMembers
        };
      }
    });
  };

  const handleCreateEvent = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!formData.schoolId) {
      Alert.alert('Error', 'Please select a school');
      return;
    }

    if (!formData.familyMembers.length) {
      Alert.alert('Error', 'Please select at least one family member');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'No authentication token available');
      return;
    }

    if (!familyData?._id) {
      Alert.alert('Error', 'No family found. Please create a family first.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Family', onPress: () => router.push('/family') }
      ]);
      return;
    }

    setIsCreating(true);

    try {
      // Prepare family members array - if "all" is selected, get all family member IDs
      let familyMembersToSend: string[] = [];
      if (formData.familyMembers.includes('all')) {
        // Get all family member IDs (excluding "all")
        const allMembers = getAllFamilyMembers();
        familyMembersToSend = allMembers.map(member => member._id);
      } else {
        // Use selected individual family members
        familyMembersToSend = formData.familyMembers;
      }

      const requestBody = {
        familyId: familyData?._id,
        title: formData.title,
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        startTime: formatTimeDisplay(formData.startTime),
        endTime: formatTimeDisplay(formData.endTime),
        location: formData.location,
        schoolId: formData.schoolId,
        familyMembers: familyMembersToSend,
        description: formData.description
      };

      const url = getApiUrl(API_CONFIG.ENDPOINTS.CREATE_SCHOOL_EVENT);
      const headers = getAuthHeaders(token);

      console.log('=== CREATE SCHOOL EVENT API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Selected family members:', formData.familyMembers);
      console.log('Family members to send:', familyMembersToSend);
      console.log('Body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        Alert.alert('Success', 'School event created successfully!', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        throw new Error(data.message || 'Failed to create school event');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', `Failed to create school event: ${errorMessage}`);
      console.error('Create school event error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create School Event</Text>
        <TouchableOpacity 
          style={[
            styles.createButton,
            (!formData.title.trim() || !formData.schoolId || !formData.familyMembers.length || isCreating) && styles.createButtonDisabled
          ]}
          onPress={handleCreateEvent}
          disabled={!formData.title.trim() || !formData.schoolId || !formData.familyMembers.length || isCreating}
        >
          <Text style={[
            styles.createButtonText,
            (!formData.title.trim() || !formData.schoolId || !formData.familyMembers.length || isCreating) && styles.createButtonTextDisabled
          ]}>
            {isCreating ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content}>
        {/* Event Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Event Title</Text>
          <TextInput
            style={styles.textInput}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
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
            <Text style={styles.dropdownButtonText}>
              {schoolEventTypes.find(type => type.id === formData.eventType)?.label}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
          
          {showEventTypeDropdown && (
            <View style={styles.dropdownMenu}>
              {schoolEventTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.dropdownItem,
                    formData.eventType === type.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, eventType: type.id }));
                    setShowEventTypeDropdown(false);
                  }}
                >
                  <View style={[styles.typeColorDot, { backgroundColor: type.color }]} />
                  <Text style={[
                    styles.dropdownItemText,
                    formData.eventType === type.id && styles.dropdownItemTextSelected
                  ]}>
                    {type.label}
                  </Text>
                  {formData.eventType === type.id && (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* School Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>School</Text>
          <TouchableOpacity
            style={[styles.dropdownButton, searchParams.schoolId && styles.dropdownButtonDisabled]}
            onPress={() => !searchParams.schoolId && setShowSchoolDropdown(!showSchoolDropdown)}
            disabled={!!searchParams.schoolId}
          >
            <Text style={[styles.dropdownButtonText, searchParams.schoolId && styles.dropdownButtonTextDisabled]}>
              {formData.schoolId 
                ? schools.find(school => school._id === formData.schoolId)?.name || searchParams.schoolName || 'Select School'
                : 'Select School'
              }
            </Text>
            {!searchParams.schoolId && <ChevronDown size={20} color="#6B7280" />}
          </TouchableOpacity>
          
          {showSchoolDropdown && (
            <View style={styles.dropdownMenu}>
              {schoolsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0e3c67" />
                  <Text style={styles.loadingText}>Loading schools...</Text>
                </View>
              ) : (
                schools.map((school) => (
                  <TouchableOpacity
                    key={school._id}
                    style={[
                      styles.dropdownItem,
                      formData.schoolId === school._id && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, schoolId: school._id }));
                      setShowSchoolDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      formData.schoolId === school._id && styles.dropdownItemTextSelected
                    ]}>
                      {school.name}
                    </Text>
                    {formData.schoolId === school._id && (
                      <Check size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Event Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Event Date</Text>
          <TouchableOpacity
            style={styles.textInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.timeText}>{formatDateDisplay(formData.eventDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Time Fields */}
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.fieldLabel}>Start Time</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.timeText}>{formatTimeDisplay(formData.startTime)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeField}>
            <Text style={styles.fieldLabel}>End Time</Text>
            <TouchableOpacity
              style={styles.textInput}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.timeText}>{formatTimeDisplay(formData.endTime)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={{marginTop:24}}></View>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="Enter location"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Family Members */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Family Members</Text>
          {getFamilyMembers().length === 0 ? (
            <View style={styles.noFamilyContainer}>
              <Text style={styles.noFamilyTitle}>No Family Found</Text>
              <Text style={styles.noFamilyMessage}>
                You need to create a family first before creating school events.
              </Text>
              <TouchableOpacity 
                style={styles.createFamilyButton}
                onPress={() => router.push('/family')}
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
                    formData.familyMembers.includes(member.id) && styles.memberOptionSelected
                  ]}
                  onPress={() => toggleFamilyMember(member.id)}
                >
                  <Text style={[
                    styles.memberLabel,
                    formData.familyMembers.includes(member.id) && styles.memberLabelSelected
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
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Add notes or description"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Bottom Spacing for Android */}
        <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.overlay}>
            <SafeAreaView style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Select Event Date</Text>
                <TouchableOpacity onPress={handleDatePickerDone}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerContent}>
                <DateTimePicker
                  value={new Date(formData.eventDate)}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                  textColor="#000000"
                  accentColor="#0e3c67"
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}

      {/* Start Time Picker Modal */}
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
                    formData.startTime === item.value && styles.timeSlotSelected
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, startTime: item.value }));
                    setShowStartTimePicker(false);
                  }}
                >
                  <Text style={[
                    styles.timeSlotText,
                    formData.startTime === item.value && styles.timeSlotTextSelected
                  ]}>
                    {item.label}
                  </Text>
                  {formData.startTime === item.value && (
                    <Check size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </SafeAreaView>
        </Modal>
      )}

      {/* End Time Picker Modal */}
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
                    formData.endTime === item.value && styles.timeSlotSelected
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, endTime: item.value }));
                    setShowEndTimePicker(false);
                  }}
                >
                  <Text style={[
                    styles.timeSlotText,
                    formData.endTime === item.value && styles.timeSlotTextSelected
                  ]}>
                    {item.label}
                  </Text>
                  {formData.endTime === item.value && (
                    <Check size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  createButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  createButtonText: {
    color: '#0e3c67',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonTextDisabled: {
    color: 'rgba(14, 60, 103, 0.5)',
  },
  content: {
    flex: 1,
    padding: 16,
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
  dropdownButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  dropdownButtonTextDisabled: {
    color: '#6B7280',
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
  typeColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeField: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },
  memberScrollView: {
    marginTop: 8,
  },
  memberScrollContent: {
    paddingRight: 16,
  },
  memberOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
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
    color: '#6B7280',
    textAlign: 'center',
  },
  memberLabelSelected: {
    color: '#0e3c67',
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  timePickerModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timePickerCancel: {
    fontSize: 16,
    color: '#6B7280',
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
  // Date Picker Modal Styles (matching calendar.tsx)
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
  // Time Slot Styles (matching calendar.tsx)
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
  // No Family Error Styles
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
  bottomSpacing: {
    height: Platform.OS === 'android' ? 60 : 20,
  },
});
