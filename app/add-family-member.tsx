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
  KeyboardAvoidingView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft,
  Camera,
  User,
  Image as ImageIcon,
  Check
} from 'lucide-react-native';

export default function AddFamilyMember() {
  const router = useRouter();
  
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    age: '',
    color: '#22C55E',
    avatar: null as string | null
  });

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

    Alert.alert('Success', 'Family member added successfully!', [
      {
        text: 'OK',
        onPress: () => router.back()
      }
    ]);
  };

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
          <Text style={styles.headerTitle}>Add Family Member</Text>
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

        <View style={styles.content}>
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
        </View>
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
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
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
});