import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
  Platform,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Camera, User, Mail, MapPin, Calendar, CreditCard as Edit3 } from 'lucide-react-native';
import { uploadImage } from '@/config/supabase';

export default function ProfileSettings() {
  const router = useRouter();
  const { user, deleteAccount, updateProfile } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    address: user?.address || '',
    dateOfBirth: user?.birthdate ? formatDateForDisplay(user.birthdate) : '',
    avatar: user?.profilePhoto || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Format date from API format (ISO string) to display format (DD/MM/YYYY)
  function formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Format date from display format (DD/MM/YYYY) to API format (YYYY-MM-DD)
  function formatDateForAPI(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toISOString();
  }

  // Handle date picker change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = formatDateForDisplay(selectedDate.toISOString());
      setProfileData(prev => ({ ...prev, dateOfBirth: formattedDate }));
    }
  };

  const handleSelectPhoto = async () => {
    try {
      if (isUploadingImage) {
        Alert.alert('Please wait', 'Image upload is in progress...');
        return;
      }

      Alert.alert(
        'Change Profile Photo',
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
                  // Just update local state, don't upload yet
                  setProfileData(prev => ({ ...prev, avatar: result.assets[0].uri }));
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
                    // Just update local state, don't upload yet
                    setProfileData(prev => ({ ...prev, avatar: result.assets[0].uri }));
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



  const handleSave = async () => {
    try {
      // Validate required fields
      if (!profileData.name.trim()) {
        Alert.alert('Error', 'Full name is required.');
        return;
      }

      // Check if we have a new image that needs to be uploaded
      let finalImageUrl = profileData.avatar;
      
      // If the avatar is a local file URI (not a Supabase URL), upload it first
      if (profileData.avatar && !profileData.avatar.startsWith('http')) {
        try {
          setIsUploadingImage(true);
          
          // Upload the image to Supabase using the correct method
          const uploadResult = await uploadImage(profileData.avatar, 'profile_photo.jpg');
          
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
        } finally {
          setIsUploadingImage(false);
        }
      }

      // Format the data for the API
      const updateData = {
        fullName: profileData.name.trim(),
        profilePhoto: finalImageUrl || user?.profilePhoto || '',
        birthdate: profileData.dateOfBirth ? formatDateForAPI(profileData.dateOfBirth) : '',
        address: profileData.address || '',
      };

      // Call the update profile API
      const success = await updateProfile(updateData);
      
      if (success) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
      // If success is false, it means unauthorized error was handled by the auth hook
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Success', 'Your account has been deleted successfully.');
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const profileFields = [
    {
      icon: User,
      label: 'Full Name',
      value: profileData.name,
      key: 'name',
      placeholder: 'Enter your full name',
      keyboardType: 'default' as const,
      editable: true
    },
    {
      icon: Mail,
      label: 'Email Address',
      value: profileData.email,
      key: 'email',
      placeholder: 'Enter your email address',
      keyboardType: 'email-address' as const,
      editable: false
    },
    {
      icon: MapPin,
      label: 'Address',
      value: profileData.address,
      key: 'address',
      placeholder: 'Enter your address',
      multiline: true,
      keyboardType: 'default' as const,
      editable: true
    },
    {
      icon: Calendar,
      label: 'Date of Birth',
      value: profileData.dateOfBirth,
      key: 'dateOfBirth',
      placeholder: 'DD/MM/YYYY',
      keyboardType: 'default' as const,
      isDatePicker: true,
      editable: true
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isUploadingImage}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? (isUploadingImage ? 'Saving...' : 'Save') : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={isEditing ? handleSelectPhoto : undefined}
            disabled={isUploadingImage}
          >
            <Image source={{ uri: profileData.avatar }} style={styles.profilePhoto} />
            {isEditing && !isUploadingImage && (
              <View style={styles.photoOverlay}>
                <Camera size={20} color="#FFFFFF" />
              </View>
            )}
            {isUploadingImage && (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoLabel}>
            {isUploadingImage ? 'Uploading to Supabase...' : isEditing ? 'Tap to change photo (will upload when saved)' : 'Profile Photo'}
          </Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.fieldsSection}>
          {profileFields.map((field) => (
            <View key={field.key} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={styles.fieldContainer}>
                <View style={[styles.fieldIcon, { backgroundColor: '#E6F3FF' }]}>
                  <field.icon size={20} color="#0e3c67" />
                </View>
                {isEditing ? (
                  field.isDatePicker ? (
                    <TouchableOpacity
                      style={styles.fieldInput}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={[styles.fieldValue, { color: field.value ? '#111827' : '#9CA3AF' }]}>
                        {field.value || field.placeholder}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TextInput
                      style={[styles.fieldInput, field.multiline && styles.multilineInput]}
                      value={field.value}
                      onChangeText={(text) => setProfileData(prev => ({ ...prev, [field.key]: text }))}
                      placeholder={field.placeholder}
                      placeholderTextColor="#9CA3AF"
                      keyboardType={field.keyboardType}
                      multiline={field.multiline}
                      numberOfLines={field.multiline ? 3 : 1}
                      editable={field.editable}
                    />
                  )
                ) : (
                  <Text style={styles.fieldValue}>{field.value || 'Not set'}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Date Picker Modal */}
        <Modal
  visible={showDatePicker}
  animationType="slide"
  transparent={true} // important to allow custom sizing
  onRequestClose={() => setShowDatePicker(false)}
>
  <View style={styles.overlay}>
    <SafeAreaView style={styles.datePickerModal}>
      {/* Header */}
      <View style={styles.datePickerHeader}>
        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
          <Text style={styles.datePickerCancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
          <Text style={styles.datePickerDone}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.datePickerContent}>
                 <DateTimePicker
           value={selectedDate}
           mode="date"
           display="spinner"
           onChange={handleDateChange}
           maximumDate={new Date()}
           minimumDate={new Date(1900, 0, 1)}
           textColor="#000000"
           accentColor="#0e3c67"
         />
      </View>
    </SafeAreaView>
  </View>
</Modal>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoTitle}>Account Information</Text>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Account Type</Text>
            <View style={styles.accountBadge}>
              <Text style={styles.accountBadgeText}>{user?.role || 'User'}</Text>
            </View>
          </View>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Member Since</Text>
            <Text style={styles.accountInfoValue}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { 
                month: 'long', 
                year: 'numeric' 
              }) : 'Not available'}
            </Text>
          </View>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Account ID</Text>
            <Text style={styles.accountInfoValue}>{user?._id || 'Not available'}</Text>
          </View>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Email Verified</Text>
            <Text style={styles.accountInfoValue}>
              {user?.isEmailVerified ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        {/* Delete Account */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteWarning}>
            This action cannot be undone. All your data will be permanently deleted.
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0e3c67',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  photoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  fieldsSection: {
    margin: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldValue: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
  },
  accountInfo: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  accountInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  accountInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  accountInfoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  accountBadge: {
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accountBadgeText: {
    fontSize: 12,
    color: '#0e3c67',
    fontWeight: '600',
  },
  dangerZone: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteWarning: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 32,
  },
  // Date Picker Modal Styles
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
  },
  datePickerCancel: {
    fontSize: 16,
    color: "red",
  },
  datePickerDone: {
    fontSize: 16,
    color: "blue",
  },
  datePickerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});