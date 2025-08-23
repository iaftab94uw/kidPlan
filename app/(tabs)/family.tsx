import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  Plus,
  Settings,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Heart,
  Users,
  Baby,
  X,
  Camera,
  User,
  Image as ImageIcon,
  Filter,
  ChevronDown,
  Check
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Family() {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [scheduleFilter, setScheduleFilter] = useState('all'); // 'all', 'primary', 'secondary'
  const [coParents, setCoParents] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Mother",
      age: "35 years old",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      status: "online",
      phone: "+44 7700 900123",
      email: "sarah.johnson@email.com",
      color: "#E91E63",
      type: "parent"
    },
    {
      id: 2,
      name: "Michael Johnson",
      role: "Father",
      age: "37 years old",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      status: "offline",
      phone: "+44 7700 900456",
      email: "michael.johnson@email.com",
      color: "#2196F3",
      type: "parent"
    }
  ]);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    age: '',
    color: '#22C55E',
    avatar: null as string | null
  });

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    parent: '',
    location: '',
    activities: '',
    notes: ''
  });

  const [coParentingSchedules, setCoParentingSchedules] = useState([
    {
      id: 1,
      name: "Weekend with Dad",
      startDate: new Date(2024, 7, 24),
      endDate: new Date(2024, 7, 25),
      parent: "secondary",
      location: "Dad's House",
      activities: "Swimming, Film night, Cooking together",
      notes: "Pick up at 6 PM Friday, drop off Sunday 7 PM"
    },
    {
      id: 2,
      name: "School Week",
      startDate: new Date(2024, 7, 26),
      endDate: new Date(2024, 7, 30),
      parent: "primary",
      location: "Home",
      activities: "School, homework, piano lessons",
      notes: "Regular school routine"
    },
    {
      id: 3,
      name: "Grandparents Visit",
      startDate: new Date(2024, 8, 1),
      endDate: new Date(2024, 8, 3),
      parent: "secondary",
      location: "Grandparents House",
      activities: "Baking, gardening, story time",
      notes: "Annual summer visit"
    }
  ]);

  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 1,
      name: "Emma Johnson",
      role: "Daughter",
      age: "8 years old",
      school: "Oakwood Primary School",
      avatar: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      nextEvent: "Ballet Class - 4:00 PM",
      color: "#22C55E",
      type: "child"
    },
    {
      id: 2,
      name: "Jack Johnson",
      role: "Son",
      age: "6 years old",
      school: "Oakwood Primary School",
      avatar: "https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      nextEvent: "Football Practice - 6:00 PM",
      color: "#F97316",
      type: "child"
    }
  ]);

  const roles = [
    { id: 'father', label: 'Father', icon: '👨' },
    { id: 'mother', label: 'Mother', icon: '👩' },
    { id: 'son', label: 'Son', icon: '👦' },
    { id: 'daughter', label: 'Daughter', icon: '👧' },
    { id: 'other', label: 'Other', icon: '👤' }
  ];

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#F39C12', '#D7BDE2', '#A3E4D7',
    '#FAD7A0', '#D5A6BD', '#AED6F1', '#A9DFBF',
    '#F9E79F', '#D2B4DE', '#7FB3D3', '#76D7C4'
  ];

  const parentOptions = [
    { id: 'primary', label: 'Primary Parent (YOU)' },
    { id: 'secondary', label: 'Secondary Parent' }
  ];

  const locationOptions = [
    "Dad's House",
            "Mum's House",
    'Grandparents House',
    'School',
    'Community Center',
    'Park',
    'Other'
  ];

  const getFilteredSchedules = () => {
    if (scheduleFilter === 'all') return coParentingSchedules;
    return coParentingSchedules.filter(schedule => schedule.parent === scheduleFilter);
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const end = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${start} - ${end}`;
  };

  const getParentLabel = (parentType: string) => {
    return parentType === 'primary' ? 'You' : 'Co-Parent';
  };

  const handleSelectPhoto = async () => {
    try {
      Alert.alert(
        'Select Photo',
        'Choose photo source',
        [
          {
            text: 'Camera',
            onPress: async () => {
              try {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraPermission.status !== 'granted') {
                  Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
                  return;
                }
                
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  setNewMember(prev => ({ ...prev, avatar: result.assets[0].uri }));
                }
              } catch (error) {
                console.error('Camera error:', error);
                Alert.alert('Error', 'Failed to open camera. Please try again.');
              }
            }
          },
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission needed', 'Please grant photo library permissions to select photos.');
                  return;
                }

                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  setNewMember(prev => ({ ...prev, avatar: result.assets[0].uri }));
                }
              } catch (error) {
                console.error('Gallery error:', error);
                Alert.alert('Error', 'Failed to open photo library. Please try again.');
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    }
  };

  const handleSaveMember = () => {
    if (!newMember.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!newMember.role) {
      Alert.alert('Error', 'Please select a role');
      return;
    }
    if (!newMember.age.trim()) {
      Alert.alert('Error', 'Please enter an age');
      return;
    }

    const selectedRole = roles.find(r => r.id === newMember.role);
    const isChild = newMember.role === 'son' || newMember.role === 'daughter';
    const isParent = newMember.role === 'father' || newMember.role === 'mother';
    
    // Create new member object
    const newMemberObject = {
      id: isChild ? familyMembers.length + 1 : coParents.length + 1,
      name: newMember.name,
      role: selectedRole?.label || newMember.role,
      age: newMember.age + (newMember.age.includes('year') ? '' : ' years old'),
      avatar: newMember.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`,
      color: newMember.color,
      type: isChild ? 'child' : 'parent'
    };

    if (isChild) {
      // Add to children list
      const childMember = {
        ...newMemberObject,
        school: 'School TBD',
        nextEvent: 'No upcoming events'
      };
      setFamilyMembers(prevMembers => [...prevMembers, childMember]);
    } else if (isParent) {
      // Add to co-parents list
      const parentMember = {
        ...newMemberObject,
        status: 'offline',
        phone: '+44 7700 900000',
        email: `${newMember.name.toLowerCase().replace(' ', '.')}@email.com`
      };
      setCoParents(prevParents => [...prevParents, parentMember]);
    } else {
      // For 'other' role, add to children list by default
      const otherMember = {
        ...newMemberObject,
        school: '',
        nextEvent: 'No upcoming events',
        type: 'child'
      };
      setFamilyMembers(prevMembers => [...prevMembers, otherMember]);
    }
    
    Alert.alert('Success', 'Family member added successfully!');
    setNewMember({ name: '', role: '', age: '', color: '#FF6B6B', avatar: null });
    setShowAddMemberModal(false);
  };

  const handleSaveSchedule = () => {
    if (!newSchedule.name.trim()) {
      Alert.alert('Error', 'Please enter a schedule name');
      return;
    }
    if (!newSchedule.parent) {
      Alert.alert('Error', 'Please select a parent');
      return;
    }
    if (!newSchedule.location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    const scheduleToAdd = {
      id: coParentingSchedules.length + 1,
      name: newSchedule.name,
      startDate: newSchedule.startDate,
      endDate: newSchedule.endDate,
      parent: newSchedule.parent,
      location: newSchedule.location,
      activities: newSchedule.activities || 'No activities specified',
      notes: newSchedule.notes || 'No additional notes'
    };

    setCoParentingSchedules(prevSchedules => [...prevSchedules, scheduleToAdd]);
    Alert.alert('Success', 'Schedule added successfully!');
    
    // Reset form
    setNewSchedule({
      name: '',
      startDate: new Date(),
      endDate: new Date(),
      parent: '',
      location: '',
      activities: '',
      notes: ''
    });
    setShowAddScheduleModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Family</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddMemberModal(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Family Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>The Johnson Family</Text>
            <TouchableOpacity>
              <Settings size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.familyStats}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#E6F3FF' }]}>
                <Users size={20} color="#0e3c67" />
              </View>
              <Text style={styles.statLabel}>Parents</Text>
              <Text style={styles.statNumber}>2</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#E6F3FF' }]}>
                <Baby size={20} color="#0e3c67" />
              </View>
              <Text style={styles.statLabel}>Children</Text>
              <Text style={styles.statNumber}>2</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#E6F3FF' }]}>
                <Heart size={20} color="#0e3c67" />
              </View>
              <Text style={styles.statLabel}>Active</Text>
              <Text style={styles.statNumber}>4</Text>
            </View>
          </View>
        </View>

        {/* Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children</Text>
          {familyMembers.filter(member => member.type === 'child').map((member) => (
            <TouchableOpacity key={member.id} style={styles.memberCard}>
              <Image source={{ uri: member.avatar }} style={styles.avatar} />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberDetails}>{member.age}</Text>
              </View>
              <View style={[styles.memberColorBar, { backgroundColor: member.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Co-Parents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Co-Parents</Text>
          {[...coParents, ...familyMembers.filter(member => member.type === 'parent')].map((parent) => (
            <TouchableOpacity key={parent.id} style={styles.parentCard}>
              <Image source={{ uri: parent.avatar }} style={styles.avatar} />
              <View style={styles.parentInfo}>
                <Text style={styles.parentName}>{parent.name}</Text>
                <Text style={styles.parentRole}>{parent.role}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Co-Parenting Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Co-Parenting Schedule</Text>
            <TouchableOpacity 
              style={styles.addScheduleButton}
              onPress={() => setShowAddScheduleModal(true)}
            >
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Filter Options */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                scheduleFilter === 'all' && styles.filterButtonActive
              ]}
              onPress={() => setScheduleFilter('all')}
            >
              <Text style={[
                styles.filterButtonText,
                scheduleFilter === 'all' && styles.filterButtonTextActive
              ]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                scheduleFilter === 'primary' && styles.filterButtonActive
              ]}
              onPress={() => setScheduleFilter('primary')}
            >
              <Text style={[
                styles.filterButtonText,
                scheduleFilter === 'primary' && styles.filterButtonTextActive
              ]}>Primary Parent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                scheduleFilter === 'secondary' && styles.filterButtonActive
              ]}
              onPress={() => setScheduleFilter('secondary')}
            >
              <Text style={[
                styles.filterButtonText,
                scheduleFilter === 'secondary' && styles.filterButtonTextActive
              ]}>Secondary Parent</Text>
            </TouchableOpacity>
          </View>

          {getFilteredSchedules().map((schedule) => (
            <View key={schedule.id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <View>
                  <Text style={styles.scheduleName}>{schedule.name}</Text>
                  <Text style={styles.scheduleDate}>{formatDateRange(schedule.startDate, schedule.endDate)}</Text>
                </View>
                <View style={styles.scheduleParentBadge}>
                  <Text style={styles.scheduleParent}>{getParentLabel(schedule.parent)}</Text>
                </View>
              </View>
              <View style={styles.scheduleDetails}>
                <View style={styles.scheduleDetailItem}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.scheduleDetailText}>{schedule.location}</Text>
                </View>
                <View style={styles.scheduleDetailItem}>
                  <Text style={styles.scheduleActivities}>{schedule.activities}</Text>
                </View>
                {schedule.notes && (
                  <View style={styles.scheduleNotes}>
                    <Text style={styles.scheduleNotesText}>{schedule.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Add Family Member Modal */}
        <Modal
          visible={showAddMemberModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* Enhanced Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowAddMemberModal(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Add Family Member</Text>
                  <Text style={styles.modalSubtitle}>Create a new family profile</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    (!newMember.name.trim() || !newMember.role || !newMember.age.trim()) && styles.saveButtonDisabled
                  ]}
                  onPress={handleSaveMember}
                  disabled={!newMember.name.trim() || !newMember.role || !newMember.age.trim()}
                >
                  <Text style={[
                    styles.saveButtonText,
                    (!newMember.name.trim() || !newMember.role || !newMember.age.trim()) && styles.saveButtonTextDisabled
                  ]}>Save</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Profile Photo */}
              <View style={styles.photoSection}>
                <Text style={styles.photoSectionTitle}>Profile Photo</Text>
                <TouchableOpacity 
                  style={styles.photoContainer}
                  onPress={handleSelectPhoto}
                >
                  {newMember.avatar ? (
                    <Image source={{ uri: newMember.avatar }} style={styles.profilePhoto} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <View style={styles.photoPlaceholderIcon}>
                        <ImageIcon size={28} color="#0e3c67" />
                      </View>
                      <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                    </View>
                  )}
                  <View style={styles.photoOverlay}>
                    <Camera size={20} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.photoLabel}>Tap to add or change photo</Text>
              </View>

              {/* Name Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={newMember.name}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, name: text }))}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Role Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Role</Text>
                <View style={styles.roleGrid}>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role.id}
                      style={[
                        styles.roleOption,
                        newMember.role === role.id && styles.roleOptionSelected
                      ]}
                      onPress={() => setNewMember(prev => ({ ...prev, role: role.id }))}
                    >
                      <Text style={styles.roleEmoji}>{role.icon}</Text>
                      <Text style={[
                        styles.roleLabel,
                        newMember.role === role.id && styles.roleLabelSelected
                      ]}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Age Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={newMember.age}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, age: text }))}
                  placeholder="Enter age"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

                      {/* Favourite Colour */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Favourite Colour</Text>
                                  <Text style={styles.fieldDescription}>Choose a colour that represents this family member</Text>
                <View style={styles.colorGrid}>
                  {colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newMember.color === color && styles.colorOptionSelected
                      ]}
                      onPress={() => setNewMember(prev => ({ ...prev, color }))}
                    >
                      {newMember.color === color && (
                        <View style={styles.colorSelected}>
                          <View style={styles.colorCheckmark} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Add Schedule Modal */}
        <Modal
          visible={showAddScheduleModal}
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
                    onPress={() => setShowAddScheduleModal(false)}
                    style={styles.closeButton}
                  >
                    <X size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>Add Schedule</Text>
                    <Text style={styles.modalSubtitle}>Create a new co-parenting schedule</Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.saveButton,
                      (!newSchedule.name.trim() || !newSchedule.parent || !newSchedule.location.trim()) && styles.saveButtonDisabled
                    ]}
                    onPress={handleSaveSchedule}
                    disabled={!newSchedule.name.trim() || !newSchedule.parent || !newSchedule.location.trim()}
                  >
                    <Text style={[
                      styles.saveButtonText,
                      (!newSchedule.name.trim() || !newSchedule.parent || !newSchedule.location.trim()) && styles.saveButtonTextDisabled
                    ]}>Save</Text>
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
                    value={newSchedule.name}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, name: text }))}
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
                      <Calendar size={16} color="#6B7280" />
                      <View style={styles.dateButtonContent}>
                        <Text style={styles.dateButtonLabel}>Start Date</Text>
                        <Text style={styles.dateButtonText}>
                          {newSchedule.startDate.toLocaleDateString('en-GB', { 
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
                      <Calendar size={16} color="#6B7280" />
                      <View style={styles.dateButtonContent}>
                        <Text style={styles.dateButtonLabel}>End Date</Text>
                        <Text style={styles.dateButtonText}>
                          {newSchedule.endDate.toLocaleDateString('en-GB', { 
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
                      {newSchedule.parent ? parentOptions.find(p => p.id === newSchedule.parent)?.label : 'Select parent'}
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
                            newSchedule.parent === parent.id && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setNewSchedule(prev => ({ ...prev, parent: parent.id }));
                            setShowParentDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            newSchedule.parent === parent.id && styles.dropdownItemTextSelected
                          ]}>
                            {parent.label}
                          </Text>
                          {newSchedule.parent === parent.id && (
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
                      {newSchedule.location || 'Select location'}
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
                            newSchedule.location === location && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setNewSchedule(prev => ({ ...prev, location }));
                            setShowLocationDropdown(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            newSchedule.location === location && styles.dropdownItemTextSelected
                          ]}>
                            {location}
                          </Text>
                          {newSchedule.location === location && (
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
                    value={newSchedule.activities}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, activities: text }))}
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
                    value={newSchedule.notes}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, notes: text }))}
                    placeholder="Additional notes or instructions"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </ScrollView>

              {/* Date Pickers */}
              {showStartDatePicker && (
                <DateTimePicker
                  value={newSchedule.startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setNewSchedule(prev => ({ 
                        ...prev, 
                        startDate: selectedDate,
                        // Auto-adjust end date if it's before start date
                        endDate: selectedDate > prev.endDate ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : prev.endDate
                      }));
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={newSchedule.endDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(false);
                    if (selectedDate) {
                      setNewSchedule(prev => ({ ...prev, endDate: selectedDate }));
                    }
                  }}
                  minimumDate={newSchedule.startDate}
                />
              )}
            </SafeAreaView>
          </KeyboardAvoidingView>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  familyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addScheduleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0e3c67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
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
  memberCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  nextEvent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextEventText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  memberColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  parentCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  parentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  parentRole: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  contactInfo: {
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
  scheduleName: {
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
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scheduleParent: {
    fontSize: 14,
    color: '#0e3c67',
    fontWeight: '500',
  },
  scheduleDetails: {
    gap: 8,
  },
  scheduleDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleDetailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  scheduleActivities: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
  scheduleNotes: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  scheduleNotesText: {
    fontSize: 14,
    color: '#374151',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  photoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  photoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0e3c67',
    borderStyle: 'dashed',
    position: 'relative',
  },
  photoPlaceholderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#E6F3FF',
  },
  photoPlaceholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0e3c67',
    textAlign: 'center',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0e3c67',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  photoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 28,
  },
  fieldLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fieldDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
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
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  roleOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 90,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleOptionSelected: {
    borderColor: '#0e3c67',
    backgroundColor: '#F0F7FF',
    transform: [{ scale: 1.02 }],
  },
  roleEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  roleLabelSelected: {
    color: '#0e3c67',
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  colorOptionSelected: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  colorSelected: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  // Schedule Modal Styles
  keyboardAvoidingView: {
    flex: 1,
  },
  dateRangeContainer: {
    gap: 12,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateButtonContent: {
    marginLeft: 12,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
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
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#0e3c67',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});