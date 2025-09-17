import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  Platform,
  RefreshControl
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
  Check,
  ChevronRight
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useAppEvents } from '@/hooks/useAppEvents';
import { API_CONFIG, getAuthHeaders } from '@/config/api';
import { uploadImage } from '@/config/supabase';

const { width } = Dimensions.get('window');

export default function Family() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { user, token } = useAuth();
  const { triggerRefresh } = useAppEvents();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showFamilyNameModal, setShowFamilyNameModal] = useState(false);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [scheduleFilter, setScheduleFilter] = useState('all'); // 'all', 'primary', 'secondary'
  const [familyName, setFamilyName] = useState('');
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [isEditingFamilyName, setIsEditingFamilyName] = useState(false);
  const [familyData, setFamilyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [missingData, setMissingData] = useState<string[]>([]);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesPagination, setSchedulesPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0
  });
  const [currentScheduleFilter, setCurrentScheduleFilter] = useState('all');
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Helper function to convert color name to hex
  const getColorFromName = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'Red': '#FF6B6B',
      'Blue': '#4ECDC4',
      'Green': '#45B7D1',
      'Yellow': '#96CEB4',
      'Purple': '#FFEAA7',
      'Pink': '#DDA0DD',
      'Orange': '#98D8C8',
      'Brown': '#F7DC6F',
      'Black': '#BB8FCE',
      'White': '#85C1E9',
      'Gray': '#F8C471',
      'Cyan': '#82E0AA',
      'Magenta': '#F1948A',
      'Lime': '#F39C12',
      'Navy': '#D7BDE2',
      'Teal': '#A3E4D7',
      'Maroon': '#FAD7A0',
      'Olive': '#D5A6BD',
      'Silver': '#AED6F1',
      'Gold': '#A9DFBF',
      'Violet': '#F9E79F',
      'Indigo': '#D2B4DE',
      'Coral': '#7FB3D3',
      'Turquoise': '#76D7C4'
    };
    return colorMap[colorName] || '#FF6B6B'; // Default to red if color not found
  };

  // Helper function to convert hex color to color name
  const getColorNameFromHex = (hexColor: string) => {
    const colorMap: { [key: string]: string } = {
      '#FF6B6B': 'Red',
      '#4ECDC4': 'Blue',
      '#45B7D1': 'Green',
      '#96CEB4': 'Yellow',
      '#FFEAA7': 'Purple',
      '#DDA0DD': 'Pink',
      '#98D8C8': 'Orange',
      '#F7DC6F': 'Brown',
      '#BB8FCE': 'Black',
      '#85C1E9': 'White',
      '#F8C471': 'Gray',
      '#82E0AA': 'Cyan',
      '#F1948A': 'Magenta',
      '#F39C12': 'Lime',
      '#D7BDE2': 'Navy',
      '#A3E4D7': 'Teal',
      '#FAD7A0': 'Maroon',
      '#D5A6BD': 'Olive',
      '#AED6F1': 'Silver',
      '#A9DFBF': 'Gold',
      '#F9E79F': 'Violet',
      '#D2B4DE': 'Indigo',
      '#7FB3D3': 'Coral',
      '#76D7C4': 'Turquoise'
    };
    return colorMap[hexColor] || 'Red'; // Default to Red if color not found
  };
  
  // Fetch family details from API
  const fetchFamilyDetails = async () => {
    if (!token) {
      console.log('No token available');
      return;
    }

    try {
      setLoading(true);
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.FAMILY_DETAILS}`;
      const headers = getAuthHeaders(token);
      
      console.log('=== FETCH FAMILY DETAILS API ===');
      console.log('URL:', url);
      console.log('Method: GET');
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END FETCH FAMILY DETAILS API ===');
      
      if (data.success) {
        setFamilyData(data.data);
        
        // Check for missing or empty data
        const missing = [];
        if (!data.data.familyName || data.data.familyName.trim() === '') {
          missing.push('familyName');
        }
        if ((!data.data.children || data.data.children.length === 0) && 
            (!data.data.parents || data.data.parents.length === 0) && 
            (!data.data.coParents || data.data.coParents.length === 0)) {
          missing.push('members');
        }
        
        setMissingData(missing);
      } else {
        console.error('Failed to fetch family details:', data.message);
        // If no family exists, show family name modal
        if (data.message?.includes('not found') || data.message?.includes('no family')) {
          setShowFamilyNameModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching family details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch family schedules
  const fetchFamilySchedules = async (page = 1, filter = 'all') => {
    if (!token || !familyData?._id) {
      return;
    }

    try {
      setSchedulesLoading(true);
      
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.GET_FAMILY_SCHEDULES}?page=${page}&limit=25`;
      
      // Add responsible parent filter if not 'all'
      if (filter !== 'all') {
        const parentFilter = filter === 'primary' ? 'Primary' : 'Secondary';
        url += `&responsibleParent=${parentFilter}`;
      }
      
      const headers = getAuthHeaders(token);
      
      console.log('=== FETCH FAMILY SCHEDULES API ===');
      console.log('URL:', url);
      console.log('Method: GET');
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END FETCH FAMILY SCHEDULES API ===');
      
      if (data.success) {
        if (page === 1) {
          // First page - replace schedules
          setSchedules(data.data.schedules);
        } else {
          // Subsequent pages - append schedules
          setSchedules(prev => [...prev, ...data.data.schedules]);
        }
        
        setSchedulesPagination(data.data.pagination);
        setCurrentScheduleFilter(filter);
      } else {
        console.error('Failed to fetch schedules:', data.message);
      }
    } catch (error) {
      console.error('Error fetching family schedules:', error);
    } finally {
      setSchedulesLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh family details
      await fetchFamilyDetails();
      
      // Refresh schedules if family data is available
      if (familyData?._id) {
        await fetchFamilySchedules(1, currentScheduleFilter);
      }
      
      // Trigger refresh event for other screens
      triggerRefresh('family');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Check if user has a family name on component mount
  useEffect(() => {
    if (user) {
      fetchFamilyDetails();
    }
  }, [user, token]);

  // Fetch schedules when family data is available
  useEffect(() => {
    if (familyData?._id) {
      fetchFamilySchedules(1, 'all');
    }
  }, [familyData?._id]);

  const createFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication required');
      return;
    }

    try {
      setIsCreatingFamily(true);
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}/family/create`;
      const headers = getAuthHeaders(token);
      const body = {
        familyName: familyName.trim()
      };
      
      console.log('=== CREATE FAMILY API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END CREATE FAMILY API ===');
      
      if (data.success) {
        setFamilyData(data.data);
        setShowFamilyNameModal(false);
        Alert.alert('Success', 'Family created successfully!');
        // Refresh family details to update missing data
        fetchFamilyDetails();
      } else {
        throw new Error(data.message || 'Failed to create family');
      }
    } catch (error) {
      console.error('Create family error:', error);
      Alert.alert('Error', 'Failed to create family. Please try again.');
    } finally {
      setIsCreatingFamily(false);
    }
  };

  const updateFamilyName = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }

    if (!token || !familyData?._id) {
      Alert.alert('Error', 'Authentication or family data required');
      return;
    }

    try {
      setIsCreatingFamily(true);
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.UPDATE_FAMILY}`;
      const headers = getAuthHeaders(token);
      const body = {
        familyId: familyData._id,
        familyName: familyName.trim()
      };
      
      console.log('=== UPDATE FAMILY API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END UPDATE FAMILY API ===');
      
      if (data.success) {
        setFamilyData(data.data);
        setShowFamilyNameModal(false);
        setIsEditingFamilyName(false);
        setFamilyName(''); // Clear the input
        Alert.alert('Success', 'Family name updated successfully!');
        // Refresh family details to get updated data
        fetchFamilyDetails();
      } else {
        throw new Error(data.message || 'Failed to update family name');
      }
    } catch (error) {
      console.error('Update family name error:', error);
      Alert.alert('Error', 'Failed to update family name. Please try again.');
    } finally {
      setIsCreatingFamily(false);
    }
  };

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

  const handleSaveMember = async () => {
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

    if (!familyData?._id) {
      Alert.alert('Error', 'No family found. Please create a family first before adding members.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Family', onPress: () => {
          // Close the modal first
          setShowAddMemberModal(false);
          // Navigate to family creation or show family creation modal
          // You can add navigation logic here if needed
        }}
      ]);
      return;
    }

    try {
      setIsSavingMember(true);
      let finalImageUrl = newMember.avatar;
      
      // Upload image to Supabase if it's a local URI
      const avatarUri = newMember.avatar;
      if (avatarUri && typeof avatarUri === 'string' && !avatarUri.startsWith('http')) {
        try {
          const uploadResult = await uploadImage(avatarUri, 'family_member_photo.jpg');
          
          if (uploadResult.success && uploadResult.url) {
            finalImageUrl = uploadResult.url;
            console.log('Image uploaded to Supabase:', finalImageUrl);
          } else {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          Alert.alert('Error', 'Failed to upload profile image. Please try again.');
          return;
        }
      }

      const selectedRole = roles.find(r => r.id === newMember.role);
      const roleLabel = selectedRole?.label || newMember.role;

      // Prepare member data for API
      const memberData = {
        familyId: familyData._id,
        name: newMember.name.trim(),
        role: roleLabel,
        age: parseInt(newMember.age),
        favoriteColor: newMember.color, // Send hex color directly
        profilePhoto: finalImageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
      };

      // Call API to add family member
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.ADD_FAMILY_MEMBER}`;
      const headers = getAuthHeaders(token);
      
      console.log('=== ADD FAMILY MEMBER API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', memberData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(memberData),
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END ADD FAMILY MEMBER API ===');
      
      if (data.success) {
        // Update local family data with the new member
        setFamilyData(data.data);
        
        // Clear form and close modal
        setNewMember({ name: '', role: '', age: '', color: '#FF6B6B', avatar: null });
        setShowAddMemberModal(false);
        
        Alert.alert('Success', 'Family member added successfully!');
        
        // Refresh family details to get updated data
        fetchFamilyDetails();
      } else {
        throw new Error(data.message || 'Failed to add family member');
      }
    } catch (error) {
      console.error('Add family member error:', error);
      Alert.alert('Error', 'Failed to add family member. Please try again.');
    } finally {
      setIsSavingMember(false);
    }
  };

  // Handle edit member
  const handleEditMember = (member: any) => {
    // Find the role ID based on the role label
    const roleId = roles.find(r => r.label === member.role)?.id || 'other';
    
    setEditingMember({
      ...member,
      role: roleId, // Set the role ID for pre-selection
      color: member.favoriteColor // Use hex color directly
    });
    setShowEditMemberModal(true);
  };

  // Handle update member
  const handleUpdateMember = async () => {
    if (!editingMember.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!editingMember.role) {
      Alert.alert('Error', 'Please select a role');
      return;
    }
    if (!editingMember.age || editingMember.age.toString().trim() === '') {
      Alert.alert('Error', 'Please enter an age');
      return;
    }

    if (!familyData?._id) {
      Alert.alert('Error', 'No family found. Please create a family first before updating members.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Family', onPress: () => {
          // Close the modal first
          setShowEditMemberModal(false);
          // Navigate to family creation or show family creation modal
          // You can add navigation logic here if needed
        }}
      ]);
      return;
    }

    if (!editingMember._id) {
      Alert.alert('Error', 'Member not found. Please try again.');
      return;
    }

    try {
      setIsEditingMember(true);
      let finalImageUrl = editingMember.profilePhoto;
      
      // Upload image to Supabase if it's a local URI
      const avatarUri = editingMember.profilePhoto;
      if (avatarUri && typeof avatarUri === 'string' && !avatarUri.startsWith('http')) {
        try {
          const uploadResult = await uploadImage(avatarUri, 'family_member_photo.jpg');
          
          if (uploadResult.success && uploadResult.url) {
            finalImageUrl = uploadResult.url;
            console.log('Image uploaded to Supabase:', finalImageUrl);
          } else {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          Alert.alert('Error', 'Failed to upload profile image. Please try again.');
          return;
        }
      }

      const selectedRole = roles.find(r => r.id === editingMember.role);
      const roleLabel = selectedRole?.label || editingMember.role;

      // Prepare member data for API
      const memberData = {
        memberId: editingMember._id,
        familyId: familyData._id,
        name: editingMember.name.trim(),
        role: roleLabel,
        age: parseInt(editingMember.age),
        favoriteColor: editingMember.color, // Send hex color directly
        profilePhoto: finalImageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
      };

      // Call API to update family member
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.UPDATE_FAMILY_MEMBER}`;
      const headers = getAuthHeaders(token);
      
      console.log('=== UPDATE FAMILY MEMBER API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', memberData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(memberData),
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END UPDATE FAMILY MEMBER API ===');
      
      if (data.success) {
        // Update local family data with the updated member
        setFamilyData(data.data);
        
        // Clear form and close modal
        setEditingMember(null);
        setShowEditMemberModal(false);
        
        Alert.alert('Success', 'Family member updated successfully!');
        
        // Refresh family details to get updated data
        fetchFamilyDetails();
      } else {
        throw new Error(data.message || 'Failed to update family member');
      }
    } catch (error) {
      console.error('Update family member error:', error);
      Alert.alert('Error', 'Failed to update family member. Please try again.');
    } finally {
      setIsEditingMember(false);
    }
  };

  // Handle delete member
  const handleDeleteMember = async (member: any) => {
    Alert.alert(
      'Delete Family Member',
      `Are you sure you want to delete ${member.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!familyData?._id || !member._id) {
              Alert.alert('Error', 'Family or member not found. Please try again.');
              return;
            }

            try {
              const memberData = {
                familyId: familyData._id,
                memberId: member._id
              };

              const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.DELETE_FAMILY_MEMBER}`;
              const headers = getAuthHeaders(token);
              
              console.log('=== DELETE FAMILY MEMBER API ===');
              console.log('URL:', url);
              console.log('Method: DELETE');
              console.log('Headers:', headers);
              console.log('Body:', memberData);
              
              const response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(memberData),
              });

              const data = await response.json();
              
              console.log('Response:', data);
              console.log('=== END DELETE FAMILY MEMBER API ===');
              
              if (data.success) {
                // Update local family data
                setFamilyData(data.data);
                
                Alert.alert('Success', 'Family member deleted successfully!');
                
                // Refresh family details to get updated data
                fetchFamilyDetails();
              } else {
                throw new Error(data.message || 'Failed to delete family member');
              }
            } catch (error) {
              console.error('Delete family member error:', error);
              Alert.alert('Error', 'Failed to delete family member. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule({
      ...schedule,
      startDate: new Date(schedule.startDate),
      endDate: new Date(schedule.endDate),
      parent: schedule.responsibleParent === 'Primary' ? 'primary' : 'secondary'
    });
    setShowEditScheduleModal(true);
  };

  // Handle update schedule
  const handleUpdateSchedule = async () => {
    if (!editingSchedule.name.trim()) {
      Alert.alert('Error', 'Please enter a schedule name');
      return;
    }
    if (!editingSchedule.parent) {
      Alert.alert('Error', 'Please select a parent');
      return;
    }
    if (!editingSchedule.location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    try {
      setIsEditingSchedule(true);

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
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.UPDATE_SCHEDULE}`;
      const headers = getAuthHeaders(token);
      
      console.log('=== UPDATE SCHEDULE API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', scheduleData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END UPDATE SCHEDULE API ===');
      
      if (data.success) {
        // Clear form and close modal
        setEditingSchedule(null);
        setShowEditScheduleModal(false);
        
        Alert.alert('Success', 'Schedule updated successfully!');
        
        // Refresh schedules to get updated data
        fetchFamilySchedules(1, currentScheduleFilter);
      } else {
        throw new Error(data.message || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Update schedule error:', error);
      Alert.alert('Error', 'Failed to update schedule. Please try again.');
    } finally {
      setIsEditingSchedule(false);
    }
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (schedule: any) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete "${schedule.name}"?`,
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

              const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.DELETE_SCHEDULE}`;
              const headers = getAuthHeaders(token);
              
              console.log('=== DELETE SCHEDULE API ===');
              console.log('URL:', url);
              console.log('Method: DELETE');
              console.log('Headers:', headers);
              console.log('Body:', scheduleData);
              
              const response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(scheduleData),
              });

              const data = await response.json();
              
              console.log('Response:', data);
              console.log('=== END DELETE SCHEDULE API ===');
              
              if (data.success) {
                Alert.alert('Success', 'Schedule deleted successfully!');
                
                // Refresh schedules to get updated data
                fetchFamilySchedules(1, currentScheduleFilter);
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

  const handleSaveSchedule = async () => {
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

    if (!familyData?._id) {
      Alert.alert('Error', 'No family found. Please create a family first before creating schedules.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Family', onPress: () => {
          // Close the modal first
          setShowAddScheduleModal(false);
          // Navigate to family creation or show family creation modal
          // You can add navigation logic here if needed
        }}
      ]);
      return;
    }

    try {
      setIsCreatingSchedule(true);

      // Convert parent selection to API format
      const responsibleParent = newSchedule.parent === 'primary' ? 'Primary' : 'Secondary';

      // Prepare schedule data for API
      const scheduleData = {
        familyId: familyData._id,
        name: newSchedule.name.trim(),
        startDate: newSchedule.startDate.toISOString(),
        endDate: newSchedule.endDate.toISOString(),
        responsibleParent: responsibleParent,
        location: newSchedule.location.trim(),
        activities: newSchedule.activities || 'No activities specified',
        notes: newSchedule.notes || 'No additional notes'
      };

      // Call API to create schedule
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.CREATE_SCHEDULE}`;
      const headers = getAuthHeaders(token);
      
      console.log('=== CREATE SCHEDULE API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', scheduleData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END CREATE SCHEDULE API ===');
      
      if (data.success) {
        // Reset form and close modal
        setNewSchedule({
          name: '',
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          parent: '',
          location: '',
          activities: '',
          notes: ''
        });
        setShowAddScheduleModal(false);
        
        Alert.alert('Success', 'Schedule created successfully!');
        
        // Refresh schedules to show the new schedule
        fetchFamilySchedules(1, currentScheduleFilter);
      } else {
        throw new Error(data.message || 'Failed to create schedule');
      }
    } catch (error) {
      console.error('Create schedule error:', error);
      Alert.alert('Error', 'Failed to create schedule. Please try again.');
    } finally {
      setIsCreatingSchedule(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading family details...</Text>
        </View>
      ) : (
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
          <Text style={styles.headerTitle}>Family</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              // Check if family name exists
              if (!familyData?.familyName || familyData.familyName.trim() === '') {
                Alert.alert(
                  'Family Name Required',
                  'Please set up your family name first before adding members.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Set Family Name', onPress: () => setShowFamilyNameModal(true) }
                  ]
                );
              } else {
                setShowAddMemberModal(true);
              }
            }}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Family Overview */}
        {familyData ? (
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Text style={styles.overviewTitle}>
                {familyData.familyName}
              </Text>
              <TouchableOpacity onPress={() => {
                setFamilyName(familyData.familyName || '');
                setIsEditingFamilyName(true);
                setShowFamilyNameModal(true);
              }}>
                <Settings size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.familyStats}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#E6F3FF' }]}>
                  <Users size={20} color="#0e3c67" />
                </View>
                <Text style={styles.statLabel}>Parents</Text>
                <Text style={styles.statNumber}>
                  {(familyData.parents?.length || 0)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#E6F3FF' }]}>
                  <Baby size={20} color="#0e3c67" />
                </View>
                <Text style={styles.statLabel}>Children</Text>
                <Text style={styles.statNumber}>
                  {familyData.children?.length || 0}
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#E6F3FF' }]}>
                  <Heart size={20} color="#0e3c67" />
                </View>
                <Text style={styles.statLabel}>Active</Text>
                <Text style={styles.statNumber}>
                  {familyData.totalActive || 0}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.overviewCard}>
            <View style={styles.emptyFamilySection}>
              <View style={styles.emptyFamilyIcon}>
                <Users size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyFamilyTitle}>No Family Created Yet</Text>
              <Text style={styles.emptyFamilyDescription}>
                Create your family to start organizing family activities and managing members
              </Text>
              <TouchableOpacity 
                style={styles.emptyFamilyButton}
                onPress={() => setShowFamilyNameModal(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyFamilyButtonText}>Create Family</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}



        {/* Children */}
        {familyData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Children</Text>
            {familyData?.children && familyData.children.length > 0 ? (
            familyData.children.map((child: any) => (
              <View key={child._id} style={styles.memberCard}>
                <Image 
                  source={{ uri: child.profilePhoto || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }} 
                  style={styles.avatar} 
                />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{child.name}</Text>
                  <Text style={styles.memberDetails}>{child.age} years old</Text>
                  <Text style={styles.memberRole}>{child.role}</Text>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditMember(child)}
                  >
                    <Settings size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteMember(child)}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.memberColorBar, { backgroundColor: child.favoriteColor }]} />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Baby size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyStateTitle}>No children yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add your children to get started
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowAddMemberModal(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Add Child</Text>
              </TouchableOpacity>
            </View>
          )}
          </View>
        )}

        {/* Co-Parents */}
        {familyData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Co-Parents</Text>
            {familyData?.coParents && familyData.coParents.length > 0 ? (
            familyData.coParents.map((coParent: any) => (
              <View key={coParent._id} style={styles.parentCard}>
                <Image 
                  source={{ uri: coParent.profilePhoto || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }} 
                  style={styles.avatar} 
                />
                <View style={styles.parentInfo}>
                  <Text style={styles.parentName}>{coParent.name}</Text>
                  <Text style={styles.parentRole}>{coParent.role}</Text>
                  <Text style={styles.parentAge}>{coParent.age} years old</Text>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditMember(coParent)}
                  >
                    <Settings size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteMember(coParent)}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.memberColorBar, { backgroundColor: coParent.favoriteColor }]} />
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Users size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyStateTitle}>No co-parents yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Add co-parents to share family responsibilities
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowAddMemberModal(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Add Co-Parent</Text>
              </TouchableOpacity>
            </View>
          )}
          </View>
        )}

        {/* Others */}
        {familyData?.others && familyData.others.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Others</Text>
            {familyData.others.map((other: any) => (
              <View key={other._id} style={styles.memberCard}>
                <Image 
                  source={{ uri: other.profilePhoto || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }} 
                  style={styles.avatar} 
                />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{other.name}</Text>
                  <Text style={styles.memberDetails}>{other.age} years old</Text>
                  <Text style={styles.memberRole}>{other.role}</Text>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditMember(other)}
                  >
                    <Settings size={16} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteMember(other)}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.memberColorBar, { backgroundColor: other.favoriteColor }]} />
              </View>
            ))}
          </View>
        )}

        {/* Co-Parenting Schedule */}
        {familyData && (
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
                currentScheduleFilter === 'all' && styles.filterButtonActive
              ]}
              onPress={() => fetchFamilySchedules(1, 'all')}
            >
              <Text style={[
                styles.filterButtonText,
                currentScheduleFilter === 'all' && styles.filterButtonTextActive
              ]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                currentScheduleFilter === 'primary' && styles.filterButtonActive
              ]}
              onPress={() => fetchFamilySchedules(1, 'primary')}
            >
              <Text style={[
                styles.filterButtonText,
                currentScheduleFilter === 'primary' && styles.filterButtonTextActive
              ]}>Primary Parent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                currentScheduleFilter === 'secondary' && styles.filterButtonActive
              ]}
              onPress={() => fetchFamilySchedules(1, 'secondary')}
            >
              <Text style={[
                styles.filterButtonText,
                currentScheduleFilter === 'secondary' && styles.filterButtonTextActive
              ]}>Secondary Parent</Text>
            </TouchableOpacity>
          </View>

          {schedulesLoading && schedules.length === 0 ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>Loading schedules...</Text>
            </View>
          ) : schedules.length > 0 ? (
            <>
                              {schedules.map((schedule) => (
                  <View key={schedule._id} style={styles.scheduleCard}>
                    <View style={styles.scheduleHeader}>
                      <View>
                        <Text style={styles.scheduleName}>{schedule.name}</Text>
                        <Text style={styles.scheduleDate}>
                          {formatDateRange(new Date(schedule.startDate), new Date(schedule.endDate))}
                        </Text>
                      </View>
                      <View style={styles.scheduleHeaderRight}>
                        <View style={styles.scheduleParentBadge}>
                          <Text style={styles.scheduleParent}>
                            {schedule.responsibleParent === 'Primary' ? 'You' : 'Co-Parent'}
                          </Text>
                        </View>
                        <View style={styles.scheduleActions}>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleEditSchedule(schedule)}
                          >
                            <Settings size={16} color="#6B7280" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteSchedule(schedule)}
                          >
                            <X size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
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
              
              {/* Load More Button */}
              {schedulesPagination.page < schedulesPagination.totalPages && (
                <TouchableOpacity 
                  style={styles.loadMoreButton}
                  onPress={() => fetchFamilySchedules(schedulesPagination.page + 1, currentScheduleFilter)}
                  disabled={schedulesLoading}
                >
                  <Text style={styles.loadMoreButtonText}>
                    {schedulesLoading ? 'Loading...' : 'Load More'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Calendar size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyStateTitle}>No schedules yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Create your first co-parenting schedule to organize family time
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => setShowAddScheduleModal(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Add Schedule</Text>
              </TouchableOpacity>
            </View>
          )}
          </View>
        )}

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
                    (!newMember.name.trim() || !newMember.role || !newMember.age.trim() || isSavingMember) && styles.saveButtonDisabled
                  ]}
                  onPress={handleSaveMember}
                  disabled={!newMember.name.trim() || !newMember.role || !newMember.age.trim() || isSavingMember}
                >
                  <Text style={[
                    styles.saveButtonText,
                    (!newMember.name.trim() || !newMember.role || !newMember.age.trim() || isSavingMember) && styles.saveButtonTextDisabled
                  ]}>
                    {isSavingMember ? 'Saving...' : 'Save'}
                  </Text>
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
                      (!newSchedule.name.trim() || !newSchedule.parent || !newSchedule.location.trim() || isCreatingSchedule) && styles.saveButtonDisabled
                    ]}
                    onPress={handleSaveSchedule}
                    disabled={!newSchedule.name.trim() || !newSchedule.parent || !newSchedule.location.trim() || isCreatingSchedule}
                  >
                    <Text style={[
                      styles.saveButtonText,
                      (!newSchedule.name.trim() || !newSchedule.parent || !newSchedule.location.trim() || isCreatingSchedule) && styles.saveButtonTextDisabled
                    ]}>
                      {isCreatingSchedule ? 'Creating...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalHeaderDivider} />
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Schedule Name */}
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Name of Schedule</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newSchedule.name}
                    onChangeText={(text) => setNewSchedule(prev => ({ ...prev, name: text }))}
                    placeholder="Weekend with dad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Date Range */}
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Date Range</Text>
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
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Responsible Parent</Text>
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
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Location</Text>
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
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Activities</Text>
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
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Notes</Text>
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
                <Modal
                  visible={showStartDatePicker}
                  animationType="slide"
                  transparent={true}
                  onRequestClose={() => setShowStartDatePicker(false)}
                >
                  <View style={styles.datePickerOverlay}>
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
                          value={newSchedule.startDate}
                          mode="date"
                          display="spinner"
                          textColor="#000000"
                          accentColor="#0e3c67"
                          minimumDate={new Date()}       
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              setNewSchedule(prev => ({ 
                                ...prev, 
                                startDate: selectedDate,
                                // Auto-adjust end date if it's before start date
                                endDate: selectedDate > prev.endDate ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : prev.endDate
                              }));
                            }
                          }}
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
                  <View style={styles.datePickerOverlay}>
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
                          value={newSchedule.endDate}
                          mode="date"
                          textColor="#000000"
                          accentColor="#0e3c67"               
                          display="spinner"
                          minimumDate={new Date()}       
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              setNewSchedule(prev => ({ ...prev, endDate: selectedDate }));
                            }
                          }}
                        />
                      </View>
                    </SafeAreaView>
                  </View>
                </Modal>
              )}
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>

        {/* Family Name Modal */}
        <Modal
          visible={showFamilyNameModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowFamilyNameModal(false);
                    setIsEditingFamilyName(false);
                    setFamilyName('');
                  }}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>
                    {isEditingFamilyName ? 'Edit Family Name' : 'Welcome to Your Family'}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {isEditingFamilyName ? 'Update your family name' : 'Let\'s set up your family name'}
                  </Text>
                </View>
                <View style={styles.placeholderView} />
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.familyNameSection}>
                <View style={styles.familyNameIcon}>
                  <Users size={48} color="#0e3c67" />
                </View>
                <Text style={styles.familyNameTitle}>Create Your Family</Text>
                <Text style={styles.familyNameDescription}>
                  Give your family a name to get started. This will help organize your family activities and members.
                </Text>
                
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Family Name</Text>
                  <TextInput
                    style={[styles.textInput, styles.familyNameInput]}
                    value={familyName}
                    onChangeText={setFamilyName}
                    placeholder="e.g., The Smith Family"
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                  />
                </View>


                <TouchableOpacity 
                  style={[
                    styles.createFamilyButton,
                    (!familyName.trim() || isCreatingFamily) && styles.createFamilyButtonDisabled
                  ]}
                  onPress={isEditingFamilyName ? updateFamilyName : createFamily}
                  disabled={!familyName.trim() || isCreatingFamily}
                >
                  <Text style={[
                    styles.createFamilyButtonText,
                    (!familyName.trim() || isCreatingFamily) && styles.createFamilyButtonTextDisabled
                  ]}>
                    {isCreatingFamily ? (isEditingFamilyName ? 'Updating...' : 'Creating...') : (isEditingFamilyName ? 'Update Family' : 'Create Family')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Edit Family Member Modal */}
        <Modal
          visible={showEditMemberModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* Enhanced Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowEditMemberModal(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Edit Family Member</Text>
                  <Text style={styles.modalSubtitle}>Update family member details</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    (!editingMember?.name?.trim() || !editingMember?.role || !editingMember?.age || editingMember?.age?.toString().trim() === '' || isEditingMember) && styles.saveButtonDisabled
                  ]}
                  onPress={handleUpdateMember}
                  disabled={!editingMember?.name?.trim() || !editingMember?.role || !editingMember?.age || editingMember?.age?.toString().trim() === '' || isEditingMember}
                >
                  <Text style={[
                    styles.saveButtonText,
                    (!editingMember?.name?.trim() || !editingMember?.role || !editingMember?.age || editingMember?.age?.toString().trim() === '' || isEditingMember) && styles.saveButtonTextDisabled
                  ]}>
                    {isEditingMember ? 'Updating...' : 'Update'}
                  </Text>
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
                  onPress={() => {
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
                                quality: 0.6,
                              });

                              if (!result.canceled && result.assets[0]) {
                                setEditingMember(prev => ({ ...prev, profilePhoto: result.assets[0].uri }));
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
                                quality: 0.6,
                              });

                              if (!result.canceled && result.assets[0]) {
                                setEditingMember(prev => ({ ...prev, profilePhoto: result.assets[0].uri }));
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
                  }}
                >
                  {editingMember?.profilePhoto ? (
                    <Image source={{ uri: editingMember.profilePhoto }} style={styles.profilePhoto} />
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
                  value={editingMember?.name || ''}
                  onChangeText={(text) => setEditingMember(prev => ({ ...prev, name: text }))}
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
                        editingMember?.role === role.id && styles.roleOptionSelected
                      ]}
                      onPress={() => setEditingMember(prev => ({ ...prev, role: role.id }))}
                    >
                      <Text style={styles.roleEmoji}>{role.icon}</Text>
                      <Text style={[
                        styles.roleLabel,
                        editingMember?.role === role.id && styles.roleLabelSelected
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
                  value={editingMember?.age?.toString() || ''}
                  onChangeText={(text) => setEditingMember(prev => ({ ...prev, age: text }))}
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
                        editingMember?.color === color && styles.colorOptionSelected
                      ]}
                      onPress={() => setEditingMember(prev => ({ ...prev, color }))}
                    >
                      {editingMember?.color === color && (
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
                      (!editingSchedule?.name?.trim() || !editingSchedule?.parent || !editingSchedule?.location?.trim() || isEditingSchedule) && styles.saveButtonDisabled
                    ]}
                    onPress={handleUpdateSchedule}
                    disabled={!editingSchedule?.name?.trim() || !editingSchedule?.parent || !editingSchedule?.location?.trim() || isEditingSchedule}
                  >
                    <Text style={[
                      styles.saveButtonText,
                      (!editingSchedule?.name?.trim() || !editingSchedule?.parent || !editingSchedule?.location?.trim() || isEditingSchedule) && styles.saveButtonTextDisabled
                    ]}>
                      {isEditingSchedule ? 'Updating...' : 'Update'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalHeaderDivider} />
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Schedule Name */}
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Name of Schedule</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editingSchedule?.name || ''}
                    onChangeText={(text) => setEditingSchedule(prev => ({ ...prev, name: text }))}
                    placeholder="Weekend with dad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Date Range */}
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Date Range</Text>
                  <View style={styles.dateRangeContainer}>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Calendar size={16} color="#6B7280" />
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
                      <Calendar size={16} color="#6B7280" />
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
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Responsible Parent</Text>
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
                            setEditingSchedule(prev => ({ ...prev, parent: parent.id }));
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
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Location</Text>
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
                            setEditingSchedule(prev => ({ ...prev, location }));
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
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Activities</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={editingSchedule?.activities || ''}
                    onChangeText={(text) => setEditingSchedule(prev => ({ ...prev, activities: text }))}
                    placeholder="List all planned activities"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Notes */}
                <View style={styles.coParentingFieldGroup}>
                  <Text style={styles.coParentingfieldLabel}>Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={editingSchedule?.notes || ''}
                    onChangeText={(text) => setEditingSchedule(prev => ({ ...prev, notes: text }))}
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
                  value={editingSchedule?.startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setEditingSchedule(prev => ({ 
                        ...prev, 
                        startDate: selectedDate,
                        // Auto-adjust end date if it's before start date
                        endDate: selectedDate > (prev?.endDate || new Date()) ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : (prev?.endDate || new Date())
                      }));
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={editingSchedule?.endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(false);
                    if (selectedDate) {
                      setEditingSchedule(prev => ({ ...prev, endDate: selectedDate }));
                    }
                  }}
                  minimumDate={editingSchedule?.startDate || new Date()}
                />
              )}
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
        </ScrollView>
      )}
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
    paddingBottom:5,
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
  memberRole: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
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
  memberActions: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
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
  parentAge: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
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
    borderRadius: '50%',
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0e3c67',
    borderStyle: 'dashed',

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
    width: '100%'
  },
  fieldLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign:'center'
  },
  coParentingFieldGroup: {
    marginBottom: 28,
  },
  coParentingfieldLabel: {
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
    maxHeight: 220,
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
  // Date Picker Modal Styles
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModal: {
    height: 300,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '500',
  },
  datePickerDone: {
    fontSize: 16,
    color: '#0e3c67',
    fontWeight: '600',
  },
  datePickerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Empty State Styles
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: '#0e3c67',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  // Family Name Modal Styles
  familyNameSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  familyNameIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  familyNameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  familyNameDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  createFamilyButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 200,
  },
  createFamilyButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  createFamilyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  createFamilyButtonTextDisabled: {
    color: '#9CA3AF',
  },
  // Additional Family Name Modal Styles
  placeholderView: {
    width: 36,
    height: 36,
  },
  familyNameInput: {
    height: 56,
    fontSize: 16,
  },
  suggestionsSection: {
    marginBottom: 32,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  suggestionChipSelected: {
    backgroundColor: '#0e3c67',
    borderColor: '#0e3c67',
  },
  suggestionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  suggestionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Empty Family Styles
  emptyFamilySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyFamilyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyFamilyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyFamilyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  emptyFamilyButton: {
    backgroundColor: '#0e3c67',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyFamilyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  // Missing Data Styles
  missingDataSection: {
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
  missingDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  missingDataSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  missingDataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  missingDataIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  missingDataContent: {
    flex: 1,
  },
  missingDataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  missingDataDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  // Schedule Loading and Load More Styles
  loadingState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  // Schedule Actions Style
  scheduleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
});