import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  Plus, 
  Camera, 
  Grid2x2 as Grid, 
  List, 
  Filter,
  X,
  Image as ImageIcon,
  User,
  ChevronDown,
  Check,
  ArrowLeft,
  ChevronRight
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const photoSize = (width - 60) / 3;

interface Photo {
  id: number;
  url: string;
  caption: string;
  taggedMember: string;
  date: string;
  albumId?: number;
}

interface Album {
  id: number;
  name: string;
  description: string;
  coverPhoto: string;
  photoCount: number;
  createdDate: string;
}

interface FamilyMember {
  id: number;
  name: string;
  avatar: string;
  role: string;
  age: string;
}

export default function Photos() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false);
  const [showFamilyMemberPicker, setShowFamilyMemberPicker] = useState(false);
  const [showAlbumDetail, setShowAlbumDetail] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showMemberGallery, setShowMemberGallery] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'recent', 'album', 'member'
  const [selectedFilterMember, setSelectedFilterMember] = useState<string>('');
  const [selectedFilterAlbum, setSelectedFilterAlbum] = useState<number | null>(null);

  const [familyMembers] = useState<FamilyMember[]>([
    {
      id: 1,
      name: "Emma Johnson",
      avatar: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      role: "Daughter",
      age: "8 years old"
    },
    {
      id: 2,
      name: "Jack Johnson", 
      avatar: "https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      role: "Son",
      age: "6 years old"
    },
    {
      id: 3,
      name: "Sarah Johnson",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      role: "Mother",
      age: "35 years old"
    },
    {
      id: 4,
      name: "Michael Johnson",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      role: "Father",
      age: "37 years old"
    }
  ]);

  const [albums, setAlbums] = useState<Album[]>([
    {
      id: 1,
      name: "School Events",
      description: "Photos from school activities and events",
      coverPhoto: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2",
      photoCount: 24,
      createdDate: "2 days ago"
    },
    {
      id: 2,
      name: "Family Outings",
      description: "Fun family trips and outdoor adventures",
      coverPhoto: "https://images.pexels.com/photos/1146603/pexels-photo-1146603.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2",
      photoCount: 156,
      createdDate: "1 week ago"
    },
    {
      id: 3,
      name: "Birthdays",
      description: "Birthday celebrations and special moments",
      coverPhoto: "https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2",
      photoCount: 89,
      createdDate: "3 weeks ago"
    }
  ]);

  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: 1,
      url: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      caption: "Emma's ballet practice session",
      taggedMember: "Emma Johnson",
      date: "Today",
      albumId: 1
    },
    {
      id: 2,
      url: "https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      caption: "Jack scoring his first goal!",
      taggedMember: "Jack Johnson",
      date: "Yesterday",
      albumId: 2
    },
    {
      id: 3,
      url: "https://images.pexels.com/photos/1729931/pexels-photo-1729931.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      caption: "Family dinner celebration",
      taggedMember: "Sarah Johnson",
      date: "Yesterday",
      albumId: 3
    },
    {
      id: 4,
      url: "https://images.pexels.com/photos/8613364/pexels-photo-8613364.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      caption: "Emma in the school play",
      taggedMember: "Emma Johnson",
      date: "2 days ago",
      albumId: 1
    },
    {
      id: 5,
      url: "https://images.pexels.com/photos/1146603/pexels-photo-1146603.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      caption: "Park adventure with Jack",
      taggedMember: "Jack Johnson",
      date: "3 days ago",
      albumId: 2
    }
  ]);

  const [newAlbum, setNewAlbum] = useState({
    name: '',
    description: ''
  });

  const [newPhoto, setNewPhoto] = useState({
    url: '',
    caption: '',
    taggedMember: '',
    albumId: null as number | null
  });

  const getFilteredPhotos = () => {
    switch (activeFilter) {
      case 'recent':
        return photos.filter(photo => photo.date === 'Today' || photo.date === 'Yesterday');
      case 'member':
        return selectedFilterMember ? photos.filter(photo => photo.taggedMember === selectedFilterMember) : photos;
      case 'album':
        return selectedFilterAlbum ? photos.filter(photo => photo.albumId === selectedFilterAlbum) : photos;
      default:
        return photos;
    }
  };

  const getFilterDisplayText = () => {
    switch (activeFilter) {
      case 'recent':
        return 'Recent Photos';
      case 'member':
        return selectedFilterMember ? `${selectedFilterMember}'s Photos` : 'All Photos';
      case 'album':
        const album = albums.find(a => a.id === selectedFilterAlbum);
        return album ? `${album.name} Album` : 'All Photos';
      default:
        return 'All Photos';
    }
  };

  const applyFilter = (filterType: string, member?: string, albumId?: number) => {
    setActiveFilter(filterType);
    if (member) setSelectedFilterMember(member);
    if (albumId) setSelectedFilterAlbum(albumId);
    setShowFilterModal(false);
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
                  aspect: [4, 3],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  setNewPhoto(prev => ({ ...prev, url: result.assets[0].uri }));
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
                  aspect: [4, 3],
                  quality: 0.8,
                });

                if (!result.canceled && result.assets[0]) {
                  setNewPhoto(prev => ({ ...prev, url: result.assets[0].uri }));
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

  const handleCreateAlbum = () => {
    if (!newAlbum.name.trim()) {
      Alert.alert('Error', 'Please enter an album name');
      return;
    }

    const albumToAdd: Album = {
      id: albums.length + 1,
      name: newAlbum.name,
      description: newAlbum.description || 'No description',
      coverPhoto: "https://images.pexels.com/photos/1146754/pexels-photo-1146754.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2",
      photoCount: 0,
      createdDate: "Just now"
    };

    setAlbums(prev => [...prev, albumToAdd]);
    Alert.alert('Success', 'Album created successfully!');
    
    setNewAlbum({ name: '', description: '' });
    setShowCreateAlbumModal(false);
  };

  const handleUploadPhoto = () => {
    if (!newPhoto.url) {
      Alert.alert('Error', 'Please select a photo');
      return;
    }
    if (!newPhoto.caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }
    if (!newPhoto.taggedMember) {
      Alert.alert('Error', 'Please tag a family member');
      return;
    }

    const photoToAdd: Photo = {
      id: photos.length + 1,
      url: newPhoto.url,
      caption: newPhoto.caption,
      taggedMember: newPhoto.taggedMember,
      date: "Just now",
      albumId: newPhoto.albumId
    };

    setPhotos(prev => [...prev, photoToAdd]);
    
    // Update album photo count if photo is added to an album
    if (newPhoto.albumId) {
      setAlbums(prev => prev.map(album => 
        album.id === newPhoto.albumId 
          ? { ...album, photoCount: album.photoCount + 1 }
          : album
      ));
    }

    Alert.alert('Success', 'Photo uploaded successfully!');
    
    setNewPhoto({ url: '', caption: '', taggedMember: '', albumId: null });
    setShowUploadPhotoModal(false);
  };

  const getPhotosForAlbum = (albumId: number) => {
    return photos.filter(photo => photo.albumId === albumId);
  };

  const getPhotosForMember = (memberName: string) => {
    return photos.filter(photo => photo.taggedMember === memberName);
  };

  const renderPhotoItem = ({ item }: { item: Photo }) => {
    if (viewMode === 'grid') {
          <TouchableOpacity style={styles.likeButton}>
            <Heart size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.listPhotoItem}>
        <Image source={{ uri: item.url }} style={styles.listPhoto} />
        <View style={styles.listPhotoInfo}>
            <Share size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Photos</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Filter size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <List size={20} color="#ffffff" />
              ) : (
                <Grid size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filter Display */}
        {activeFilter !== 'all' && (
          <View style={styles.activeFilterContainer}>
            <Text style={styles.activeFilterText}>Showing: {getFilterDisplayText()}</Text>
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={() => {
                setActiveFilter('all');
                setSelectedFilterMember('');
                setSelectedFilterAlbum(null);
              }}
            >
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getFilteredPhotos().length}</Text>
            <Text style={styles.statLabel}>{activeFilter === 'all' ? 'Total Photos' : 'Filtered'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{albums.length}</Text>
            <Text style={styles.statLabel}>Albums</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{photos.filter(p => p.date === 'Today' || p.date === 'Yesterday').length}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setShowUploadPhotoModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E6F3FF' }]}>
              <Camera size={24} color="#0e3c67" />
            </View>
            <Text style={styles.quickActionText}>Upload Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setShowCreateAlbumModal(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E6F3FF' }]}>
              <Plus size={24} color="#0e3c67" />
            </View>
            <Text style={styles.quickActionText}>Create Album</Text>
          </TouchableOpacity>
        </View>

        {/* Albums Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photo Albums</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => setShowCreateAlbumModal(true)}
            >
              <Text style={styles.seeAllText}>Create</Text>
              <ChevronRight size={16} color="#0e3c67" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumsScroll}>
            {albums.map((album) => (
              <TouchableOpacity 
                key={album.id} 
                style={styles.albumCard}
                onPress={() => {
                  setSelectedAlbum(album);
                  setShowAlbumDetail(true);
                }}
              >
                <Image source={{ uri: album.coverPhoto }} style={styles.albumCover} />
                <View style={styles.albumInfo}>
                  <Text style={styles.albumName}>{album.name}</Text>
                  <Text style={styles.albumCount}>{album.photoCount} photos</Text>
                  <Text style={styles.albumDate}>{album.createdDate}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Family Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Photo Galleries</Text>
          <View style={styles.membersGrid}>
            {familyMembers.map((member) => {
              const memberPhotos = getPhotosForMember(member.name);
              return (
                <TouchableOpacity 
                  key={member.id} 
                  style={styles.memberGalleryCard}
                  onPress={() => {
                    setSelectedMember(member);
                    setShowMemberGallery(true);
                  }}
                >
                  <Image source={{ uri: member.avatar }} style={styles.memberGalleryAvatar} />
                  <Text style={styles.memberGalleryName}>{member.name}</Text>
                  <Text style={styles.memberGalleryCount}>{memberPhotos.length} photos</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{getFilterDisplayText()}</Text>
          <FlatList
            data={getFilteredPhotos().slice(0, 9)}
            renderItem={renderPhotoItem}
            numColumns={viewMode === 'grid' ? 3 : 1}
            key={viewMode}
            scrollEnabled={false}
            contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : styles.listContainer}
          />
        </View>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowFilterModal(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Filter Photos</Text>
                  <Text style={styles.modalSubtitle}>Choose how to view your photos</Text>
                </View>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.saveButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Filter Options */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Filter Options</Text>
                
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    activeFilter === 'all' && styles.filterOptionSelected
                  ]}
                  onPress={() => applyFilter('all')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    activeFilter === 'all' && styles.filterOptionTextSelected
                  ]}>All Photos</Text>
                  {activeFilter === 'all' && <Check size={20} color="#FFFFFF" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    activeFilter === 'recent' && styles.filterOptionSelected
                  ]}
                  onPress={() => applyFilter('recent')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    activeFilter === 'recent' && styles.filterOptionTextSelected
                  ]}>Recent Photos</Text>
                  {activeFilter === 'recent' && <Check size={20} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>

              {/* Filter by Family Member */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Filter by Family Member</Text>
                {familyMembers.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.filterOption,
                      activeFilter === 'member' && selectedFilterMember === member.name && styles.filterOptionSelected
                    ]}
                    onPress={() => applyFilter('member', member.name)}
                  >
                    <Image source={{ uri: member.avatar }} style={styles.filterMemberAvatar} />
                    <View style={styles.filterMemberInfo}>
                      <Text style={[
                        styles.filterOptionText,
                        activeFilter === 'member' && selectedFilterMember === member.name && styles.filterOptionTextSelected
                      ]}>{member.name}</Text>
                      <Text style={[
                        styles.filterMemberRole,
                        activeFilter === 'member' && selectedFilterMember === member.name && styles.filterMemberRoleSelected
                      ]}>{member.role}</Text>
                    </View>
                    {activeFilter === 'member' && selectedFilterMember === member.name && (
                      <Check size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Filter by Album */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Filter by Album</Text>
                {albums.map((album) => (
                  <TouchableOpacity
                    key={album.id}
                    style={[
                      styles.filterOption,
                      activeFilter === 'album' && selectedFilterAlbum === album.id && styles.filterOptionSelected
                    ]}
                    onPress={() => applyFilter('album', undefined, album.id)}
                  >
                    <Image source={{ uri: album.coverPhoto }} style={styles.filterAlbumCover} />
                    <View style={styles.filterAlbumInfo}>
                      <Text style={[
                        styles.filterOptionText,
                        activeFilter === 'album' && selectedFilterAlbum === album.id && styles.filterOptionTextSelected
                      ]}>{album.name}</Text>
                      <Text style={[
                        styles.filterAlbumCount,
                        activeFilter === 'album' && selectedFilterAlbum === album.id && styles.filterAlbumCountSelected
                      ]}>{album.photoCount} photos</Text>
                    </View>
                    {activeFilter === 'album' && selectedFilterAlbum === album.id && (
                      <Check size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
        {/* Create Album Modal */}
        <Modal
          visible={showCreateAlbumModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowCreateAlbumModal(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Create Album</Text>
                  <Text style={styles.modalSubtitle}>Organise your family photos</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    !newAlbum.name.trim() && styles.saveButtonDisabled
                  ]}
                  onPress={handleCreateAlbum}
                  disabled={!newAlbum.name.trim()}
                >
                  <Text style={[
                    styles.saveButtonText,
                    !newAlbum.name.trim() && styles.saveButtonTextDisabled
                  ]}>Create</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Album Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAlbum.name}
                  onChangeText={(text) => setNewAlbum(prev => ({ ...prev, name: text }))}
                  placeholder="Enter album name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newAlbum.description}
                  onChangeText={(text) => setNewAlbum(prev => ({ ...prev, description: text }))}
                  placeholder="Describe what this album is for"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Upload Photo Modal */}
        <Modal
          visible={showUploadPhotoModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => setShowUploadPhotoModal(false)}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Upload Photo</Text>
                  <Text style={styles.modalSubtitle}>Add a new family memory</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    (!newPhoto.url || !newPhoto.caption.trim() || !newPhoto.taggedMember) && styles.saveButtonDisabled
                  ]}
                  onPress={handleUploadPhoto}
                  disabled={!newPhoto.url || !newPhoto.caption.trim() || !newPhoto.taggedMember}
                >
                  <Text style={[
                    styles.saveButtonText,
                    (!newPhoto.url || !newPhoto.caption.trim() || !newPhoto.taggedMember) && styles.saveButtonTextDisabled
                  ]}>Upload</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Photo Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Select Photo</Text>
                <TouchableOpacity 
                  style={styles.photoSelector}
                  onPress={handleSelectPhoto}
                >
                  {newPhoto.url ? (
                    <Image source={{ uri: newPhoto.url }} style={styles.selectedPhoto} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <ImageIcon size={32} color="#6B7280" />
                      <Text style={styles.photoPlaceholderText}>Tap to select photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Caption */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Caption</Text>
                <TextInput
                  style={styles.textInput}
                  value={newPhoto.caption}
                  onChangeText={(text) => setNewPhoto(prev => ({ ...prev, caption: text }))}
                  placeholder="Add a caption for this photo"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Tag Family Member */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Tag Family Member</Text>
                <TouchableOpacity
                  style={styles.textInput}
                  onPress={() => setShowFamilyMemberPicker(true)}
                >
                  <Text style={[
                    styles.memberPickerText,
                    !newPhoto.taggedMember && styles.memberPickerPlaceholder
                  ]}>
                    {newPhoto.taggedMember || 'Select family member'}
                  </Text>
                  <ChevronDown size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Album Selection (Optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Add to Album (Optional)</Text>
                <View style={styles.albumGrid}>
                  <TouchableOpacity
                    style={[
                      styles.albumOption,
                      !newPhoto.albumId && styles.albumOptionSelected
                    ]}
                    onPress={() => setNewPhoto(prev => ({ ...prev, albumId: null }))}
                  >
                    <Text style={[
                      styles.albumOptionText,
                      !newPhoto.albumId && styles.albumOptionTextSelected
                    ]}>No Album</Text>
                  </TouchableOpacity>
                  {albums.map((album) => (
                    <TouchableOpacity
                      key={album.id}
                      style={[
                        styles.albumOption,
                        newPhoto.albumId === album.id && styles.albumOptionSelected
                      ]}
                      onPress={() => setNewPhoto(prev => ({ ...prev, albumId: album.id }))}
                    >
                      <Text style={[
                        styles.albumOptionText,
                        newPhoto.albumId === album.id && styles.albumOptionTextSelected
                      ]}>{album.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>

          {/* Family Member Picker Modal */}
          {showFamilyMemberPicker && (
            <Modal
              visible={showFamilyMemberPicker}
              animationType="slide"
              presentationStyle="formSheet"
              onRequestClose={() => setShowFamilyMemberPicker(false)}
            >
              <SafeAreaView style={styles.pickerModal}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowFamilyMemberPicker(false)}>
                    <Text style={styles.pickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>Select Family Member</Text>
                  <TouchableOpacity onPress={() => setShowFamilyMemberPicker(false)}>
                    <Text style={styles.pickerDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={familyMembers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.memberPickerItem,
                        newPhoto.taggedMember === item.name && styles.memberPickerItemSelected
                      ]}
                      onPress={() => {
                        setNewPhoto(prev => ({ ...prev, taggedMember: item.name }));
                        setShowFamilyMemberPicker(false);
                      }}
                    >
                      <Image source={{ uri: item.avatar }} style={styles.memberPickerAvatar} />
                      <View style={styles.memberPickerInfo}>
                        <Text style={[
                          styles.memberPickerName,
                          newPhoto.taggedMember === item.name && styles.memberPickerNameSelected
                        ]}>
                          {item.name}
                        </Text>
                        <Text style={[
                          styles.memberPickerRole,
                          newPhoto.taggedMember === item.name && styles.memberPickerRoleSelected
                        ]}>
                          {item.role}
                        </Text>
                      </View>
                      {newPhoto.taggedMember === item.name && (
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

        {/* Album Detail Modal */}
        <Modal
          visible={showAlbumDetail}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SafeAreaView style={styles.albumDetailContainer}>
            <View style={styles.albumDetailHeader}>
              <TouchableOpacity 
                onPress={() => setShowAlbumDetail(false)}
                style={styles.backButton}
              >
                <ArrowLeft size={24} color="#0e3c67" />
              </TouchableOpacity>
              <View style={styles.albumDetailInfo}>
                <Text style={styles.albumDetailTitle}>{selectedAlbum?.name}</Text>
                <Text style={styles.albumDetailCount}>{selectedAlbum?.photoCount} photos</Text>
              </View>
            </View>
            
            {selectedAlbum && (
              <FlatList
                data={getPhotosForAlbum(selectedAlbum.id)}
                renderItem={renderPhotoItem}
                numColumns={3}
                contentContainerStyle={styles.albumPhotosGrid}
                showsVerticalScrollIndicator={false}
              />
            )}
          </SafeAreaView>
        </Modal>

        {/* Member Gallery Modal */}
        <Modal
          visible={showMemberGallery}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SafeAreaView style={styles.memberGalleryContainer}>
            <View style={styles.memberGalleryHeader}>
              <TouchableOpacity 
                onPress={() => setShowMemberGallery(false)}
                style={styles.backButton}
              >
                <ArrowLeft size={24} color="#0e3c67" />
              </TouchableOpacity>
              <View style={styles.memberGalleryInfo}>
                <Text style={styles.memberGalleryTitle}>{selectedMember?.name}</Text>
                <Text style={styles.memberGallerySubtitle}>
                  {selectedMember && getPhotosForMember(selectedMember.name).length} photos
                </Text>
              </View>
            </View>

            {/* Member Details */}
            {selectedMember && (
              <View style={styles.memberDetailsCard}>
                <Image source={{ uri: selectedMember.avatar }} style={styles.memberDetailAvatar} />
                <View style={styles.memberDetailInfo}>
                  <Text style={styles.memberDetailName}>{selectedMember.name}</Text>
                  <Text style={styles.memberDetailRole}>{selectedMember.role} • {selectedMember.age}</Text>
                </View>
              </View>
            )}
            
            {selectedMember && (
              <FlatList
                data={getPhotosForMember(selectedMember.name)}
                renderItem={renderPhotoItem}
                numColumns={3}
                contentContainerStyle={styles.memberPhotosGrid}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyGallery}>
                    <Camera size={48} color="#9CA3AF" />
                    <Text style={styles.emptyGalleryText}>No photos yet</Text>
                    <Text style={styles.emptyGallerySubtext}>Photos tagged with {selectedMember.name} will appear here</Text>
                  </View>
                }
              />
            )}
          </SafeAreaView>
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
    marginRight: 8,
  },
  activeFilterContainer: {
    backgroundColor: '#E6F3FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#0e3c67',
    fontWeight: '600',
  },
  clearFilterButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearFilterText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
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
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0e3c67',
    fontWeight: '500',
    marginRight: 4,
  },
  albumsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  albumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  albumCover: {
    width: '100%',
    height: 120,
  },
  albumInfo: {
    padding: 12,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  albumCount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  albumDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memberGalleryCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: (width - 56) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memberGalleryAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  memberGalleryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  memberGalleryCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  gridContainer: {
    gap: 8,
  },
  listContainer: {
    gap: 12,
  },
  gridPhotoItem: {
    width: photoSize,
    height: photoSize,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
  },
  listPhotoItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listPhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  listPhotoInfo: {
    flex: 1,
  },
  listPhotoCaption: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listPhotoDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Filter Modal Styles
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  filterOption: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterOptionSelected: {
    backgroundColor: '#0e3c67',
    borderColor: '#0e3c67',
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  filterMemberInfo: {
    flex: 1,
  },
  filterMemberRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  filterMemberRoleSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterAlbumCover: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  filterAlbumInfo: {
    flex: 1,
  },
  filterAlbumCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  filterAlbumCountSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  photoSelector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  memberPickerText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  memberPickerPlaceholder: {
    color: '#9CA3AF',
  },
  albumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  albumOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  albumOptionSelected: {
    borderColor: '#0e3c67',
    backgroundColor: '#F0F7FF',
  },
  albumOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  albumOptionTextSelected: {
    color: '#0e3c67',
    fontWeight: '700',
  },
  // Family Member Picker Modal
  pickerModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerCancel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  pickerDone: {
    fontSize: 16,
    color: '#0e3c67',
    fontWeight: '600',
  },
  memberPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  memberPickerItemSelected: {
    backgroundColor: '#0e3c67',
  },
  memberPickerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  memberPickerInfo: {
    flex: 1,
  },
  memberPickerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  memberPickerNameSelected: {
    color: '#FFFFFF',
  },
  memberPickerRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  memberPickerRoleSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Album Detail Modal
  albumDetailContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  albumDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  albumDetailInfo: {
    flex: 1,
  },
  albumDetailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  albumDetailCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  albumPhotosGrid: {
    padding: 20,
    gap: 8,
  },
  // Member Gallery Modal
  memberGalleryContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  memberGalleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  memberGalleryInfo: {
    flex: 1,
  },
  memberGalleryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  memberGallerySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  memberDetailsCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberDetailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  memberDetailInfo: {
    flex: 1,
  },
  memberDetailName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberDetailRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  memberPhotosGrid: {
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyGallery: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyGalleryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyGallerySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});