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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, User, Mail, Phone, MapPin, Calendar, CreditCard as Edit3 } from 'lucide-react-native';

export default function ProfileSettings() {
  const router = useRouter();
  
  const [profileData, setProfileData] = useState({
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+44 7700 900123',
    address: '123 Oak Street, Manchester, M1 2AB',
    dateOfBirth: '15/03/1989',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSelectPhoto = async () => {
    try {
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
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
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

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const profileFields = [
    {
      icon: User,
      label: 'Full Name',
      value: profileData.name,
      key: 'name',
      placeholder: 'Enter your full name'
    },
    {
      icon: Mail,
      label: 'Email Address',
      value: profileData.email,
      key: 'email',
      placeholder: 'Enter your email address',
      keyboardType: 'email-address'
    },
    {
      icon: Phone,
      label: 'Phone Number',
      value: profileData.phone,
      key: 'phone',
      placeholder: 'Enter your phone number',
      keyboardType: 'phone-pad'
    },
    {
      icon: MapPin,
      label: 'Address',
      value: profileData.address,
      key: 'address',
      placeholder: 'Enter your address',
      multiline: true
    },
    {
      icon: Calendar,
      label: 'Date of Birth',
      value: profileData.dateOfBirth,
      key: 'dateOfBirth',
      placeholder: 'DD/MM/YYYY'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
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
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity 
            style={styles.photoContainer}
            onPress={isEditing ? handleSelectPhoto : undefined}
          >
            <Image source={{ uri: profileData.avatar }} style={styles.profilePhoto} />
            {isEditing && (
              <View style={styles.photoOverlay}>
                <Camera size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoLabel}>
            {isEditing ? 'Tap to change photo' : 'Profile Photo'}
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
                  <TextInput
                    style={[styles.fieldInput, field.multiline && styles.multilineInput]}
                    value={field.value}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, [field.key]: text }))}
                    placeholder={field.placeholder}
                    placeholderTextColor="#9CA3AF"
                    keyboardType={field.keyboardType || 'default'}
                    multiline={field.multiline}
                    numberOfLines={field.multiline ? 3 : 1}
                  />
                ) : (
                  <Text style={styles.fieldValue}>{field.value}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoTitle}>Account Information</Text>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Account Type</Text>
            <View style={styles.accountBadge}>
              <Text style={styles.accountBadgeText}>KidPlan Pro</Text>
            </View>
          </View>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Member Since</Text>
            <Text style={styles.accountInfoValue}>January 2024</Text>
          </View>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Account ID</Text>
            <Text style={styles.accountInfoValue}>KP-2024-001234</Text>
          </View>
        </View>

        {/* Delete Account */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteWarning}>
            This action cannot be undone. All your data will be permanently deleted.
          </Text>
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
});