import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Filter, Plus, Grid3x3 as Grid3X3, List, Camera, FolderPlus, X, Check, Search } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGallery } from '@/hooks/useGallery';
import { useImageUpload } from '@/hooks/useImageUpload';

const { width } = Dimensions.get('window');

export default function Photos() {
  const router = useRouter();
  const { token } = useAuth();
  const { gallery, albums: apiAlbums, media: apiMedia, loading: galleryLoading, error: galleryError, createGallery, isCreatingGallery, createAlbum, isCreatingAlbum } = useGallery(token || '');
  const { uploadProgress, selectAndUploadImage, resetUpload } = useImageUpload();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGalleryModal, setShowCreateGalleryModal] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);

  // Debug modal state changes
  useEffect(() => {
    console.log('Create Album Modal state changed to:', showCreateAlbumModal);
  }, [showCreateAlbumModal]);
  const [newAlbum, setNewAlbum] = useState({
    name: '',
    coverImage: 'https://dummyjson.com/image/150',
    description: ''
  });

  // Auto-show create gallery modal if no gallery exists
  // This ensures the modal appears every time user comes back to photos tab without a gallery
  useEffect(() => {
    if (!galleryLoading && !gallery && !galleryError) {
      setShowCreateGalleryModal(true);
    }
  }, [galleryLoading, gallery, galleryError]);

  // Reset modal state when gallery is created
  // This automatically closes the modal once gallery is successfully created
  useEffect(() => {
    if (gallery) {
      setShowCreateGalleryModal(false);
    }
  }, [gallery]);

  const [photos, setPhotos] = useState([
    {
      id: 1,
      uri: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
      date: "2024-08-15",
      album: "Emma's Activities",
      familyMember: "Emma",
      title: "Piano Recital"
    },
    {
      id: 2,
      uri: "https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
      date: "2024-08-14",
      album: "Jack's Sports",
      familyMember: "Jack",
      title: "Football Practice"
    },
    {
      id: 3,
      uri: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
      date: "2024-08-13",
      album: "Family Time",
      familyMember: "Both",
      title: "Weekend Fun"
    },
    {
      id: 4,
      uri: "https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
      date: "2024-08-12",
      album: "School Events",
      familyMember: "Both",
      title: "School Assembly"
    },
    {
      id: 5,
      uri: "https://images.pexels.com/photos/1146603/pexels-photo-1146603.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
      date: "2024-08-11",
      album: "Emma's Activities",
      familyMember: "Emma",
      title: "Ballet Class"
    },
    {
      id: 6,
      uri: "https://images.pexels.com/photos/8613364/pexels-photo-8613364.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
      date: "2024-08-10",
      album: "Jack's Sports",
      familyMember: "Jack",
      title: "Swimming Lesson"
    }
  ]);

  const [albums, setAlbums] = useState([
    {
      id: 1,
      name: "Emma's Activities",
      photoCount: 12,
      coverPhoto: "https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      color: "#22C55E"
    },
    {
      id: 2,
      name: "Jack's Sports",
      photoCount: 8,
      coverPhoto: "https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      color: "#F97316"
    },
    {
      id: 3,
      name: "Family Time",
      photoCount: 15,
      coverPhoto: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      color: "#3B82F6"
    },
    {
      id: 4,
      name: "School Events",
      photoCount: 6,
      coverPhoto: "https://images.pexels.com/photos/1346155/pexels-photo-1346155.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2",
      color: "#8B5CF6"
    }
  ]);

  const familyMembers = [
    { id: 'Emma', name: 'Emma', avatar: 'https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    { id: 'Jack', name: 'Jack', avatar: 'https://images.pexels.com/photos/1765110/pexels-photo-1765110.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' },
    { id: 'Both', name: 'Both Children', avatar: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2' }
  ];

  const filterOptions = [
    { id: 'all', label: 'All Photos', type: 'general' },
    { id: 'recent', label: 'Recent Photos', type: 'general' },
    { id: 'Emma', label: 'Emma', type: 'member' },
    { id: 'Jack', label: 'Jack', type: 'member' },
    { id: 'Both', label: 'Both Children', type: 'member' }
  ];

  const getFilteredPhotos = () => {
    let filtered = photos;

    if (activeFilter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = photos.filter(photo => new Date(photo.date) >= oneWeekAgo);
    } else if (activeFilter !== 'all') {
      filtered = photos.filter(photo => photo.familyMember === activeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(photo => 
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.album.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getActiveFilterLabel = () => {
    const filter = filterOptions.find(f => f.id === activeFilter);
    return filter ? filter.label : 'All Photos';
  };

  const handleCreateGallery = async () => {
    try {
      const success = await createGallery();
      if (success) {
        Alert.alert('Success', 'Gallery created successfully! You can now create albums and upload photos.');
        // Modal will be closed automatically by useEffect when gallery state updates
      } else {
        Alert.alert('Error', 'Failed to create gallery. Please try again.');
      }
    } catch (error) {
      console.error('Error creating gallery:', error);
      Alert.alert('Error', 'Failed to create gallery. Please try again.');
    }
  };

  const handleCreateAlbum = () => {
    console.log('Create Album button pressed');
    console.log('Gallery exists:', !!gallery);
    console.log('Current modal state:', showCreateAlbumModal);
    
    // Check if gallery exists first
    if (!gallery) {
      console.log('No gallery found, showing create gallery modal');
      setShowCreateGalleryModal(true);
      return;
    }

    console.log('Gallery exists, showing create album modal');
    // Reset form and show modal
    setNewAlbum({
      name: '',
      coverImage: '',
      description: ''
    });
    setShowCreateAlbumModal(true);
    console.log('Modal state set to true');
  };

  const handleSelectCoverPhoto = async () => {
    try {
      const imageUrl = await selectAndUploadImage();
      if (imageUrl) {
        setNewAlbum(prev => ({ ...prev, coverImage: imageUrl }));
      }
    } catch (error) {
      console.error('Error selecting cover photo:', error);
      Alert.alert('Error', 'Failed to select cover photo. Please try again.');
    }
  };

  const handleSaveAlbum = async () => {
    if (!gallery || !newAlbum.name.trim()) {
      Alert.alert('Error', 'Please enter an album name');
      return;
    }

    // Don't allow saving while upload is in progress
    if (uploadProgress.isUploading) {
      Alert.alert('Please Wait', 'Please wait for the cover photo upload to complete.');
      return;
    }

    try {
      const albumData = {
        galleryId: gallery._id,
        name: newAlbum.name.trim(),
        coverImage: newAlbum.coverImage,
        description: newAlbum.description.trim()
      };

      const success = await createAlbum(albumData);
      if (success) {
        setShowCreateAlbumModal(false);
        resetUpload(); // Reset upload state
        Alert.alert('Success', 'Album created successfully!');
      } else {
        Alert.alert('Error', 'Failed to create album. Please try again.');
      }
    } catch (error) {
      console.error('Error creating album:', error);
      Alert.alert('Error', 'Failed to create album. Please try again.');
    }
  };

  const handleUploadPhoto = async () => {
    // Check if gallery exists first
    if (!gallery) {
      setShowCreateGalleryModal(true);
      return;
    }

    // Original upload photo logic
    try {
      Alert.alert(
        'Upload Photo',
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
                  const newPhoto = {
                    id: photos.length + 1,
                    uri: result.assets[0].uri,
                    date: new Date().toISOString().split('T')[0],
                    album: "Recent Photos",
                    familyMember: "Both",
                    title: "New Photo"
                  };
                  setPhotos(prev => [newPhoto, ...prev]);
                  Alert.alert('Success', 'Photo uploaded successfully!');
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
                  const newPhoto = {
                    id: photos.length + 1,
                    uri: result.assets[0].uri,
                    date: new Date().toISOString().split('T')[0],
                    album: "Recent Photos",
                    familyMember: "Both",
                    title: "New Photo"
                  };
                  setPhotos(prev => [newPhoto, ...prev]);
                  Alert.alert('Success', 'Photo uploaded successfully!');
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

  const renderPhotoGrid = () => {
    const filteredPhotos = getFilteredPhotos();
    const photoSize = (width - 60) / 3;

    return (
      <View style={styles.photoGrid}>
        {filteredPhotos.map((photo) => (
          <TouchableOpacity 
            key={photo.id} 
            style={[styles.photoGridItem, { width: photoSize, height: photoSize }]}
            onPress={() => Alert.alert('Coming Soon', 'Photo detail screen will be implemented soon!')}
          >
            <Image source={{ uri: photo.uri }} style={styles.photoGridImage} />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoTitle}>{photo.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPhotoList = () => {
    const filteredPhotos = getFilteredPhotos();

    return (
      <View style={styles.photoList}>
        {filteredPhotos.map((photo) => (
          <TouchableOpacity 
            key={photo.id} 
            style={styles.photoListItem}
            onPress={() => Alert.alert('Coming Soon', 'Photo detail screen will be implemented soon!')}
          >
            <Image source={{ uri: photo.uri }} style={styles.photoListImage} />
            <View style={styles.photoListContent}>
              <Text style={styles.photoListTitle}>{photo.title}</Text>
              <Text style={styles.photoListAlbum}>{photo.album}</Text>
              <Text style={styles.photoListDate}>
                {new Date(photo.date).toLocaleDateString('en-GB')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Show loading state while checking gallery
  if (galleryLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0e3c67" />
          <Text style={styles.loadingText}>Loading gallery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if there's an error (but not "Gallery not found")
  if (galleryError && galleryError !== 'Gallery not found') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {galleryError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              // Force a re-render by updating a state
              setShowCreateGalleryModal(false);
              // The useGallery hook will automatically refetch on mount
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Photos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.viewModeButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <List size={20} color="#FFFFFF" />
              ) : (
                <Grid3X3 size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filter Display */}
        {activeFilter !== 'all' && (
          <View style={styles.activeFilterContainer}>
            <Text style={styles.activeFilterText}>
              Showing: {getActiveFilterLabel()}
            </Text>
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getFilteredPhotos().length}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{albums.length}</Text>
            <Text style={styles.statLabel}>Albums</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {photos.filter(p => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(p.date) >= oneWeekAgo;
              }).length}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions} pointerEvents="box-none">
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleUploadPhoto}
            >
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                console.log('BUTTON TOUCHED - Create Album');
                handleCreateAlbum();
              }}
              onPressIn={() => console.log('BUTTON PRESS IN - Create Album')}
              onPressOut={() => console.log('BUTTON PRESS OUT - Create Album')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              delayPressIn={0}
              delayPressOut={0}
            >
              <FolderPlus size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Create Album</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Albums Section */}
        <View style={styles.albumsSection}>
          <Text style={styles.sectionTitle}>Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.albumsScroll}>
            {albums.map((album) => (
              <TouchableOpacity 
                key={album.id} 
                style={styles.albumCard}
                onPress={() => Alert.alert('Coming Soon', 'Album detail screen will be implemented soon!')}
              >
                <Image source={{ uri: album.coverPhoto }} style={styles.albumCover} />
                <View style={[styles.albumColorBar, { backgroundColor: album.color }]} />
                <Text style={styles.albumName}>{album.name}</Text>
                <Text style={styles.albumCount}>{album.photoCount} photos</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Photos' : getActiveFilterLabel()}
          </Text>
          {viewMode === 'grid' ? renderPhotoGrid() : renderPhotoList()}
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
                <Text style={styles.modalTitle}>Filter Photos</Text>
                <TouchableOpacity 
                  style={styles.doneButton}
                  onPress={() => setShowFilterModal(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Search */}
              <View style={styles.searchSection}>
                <Text style={styles.filterSectionTitle}>Search</Text>
                <View style={styles.searchContainer}>
                  <Search size={20} color="#6B7280" />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search photos by title or album"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* General Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>General</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      activeFilter === 'all' && styles.filterOptionSelected
                    ]}
                    onPress={() => setActiveFilter('all')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      activeFilter === 'all' && styles.filterOptionTextSelected
                    ]}>All Photos</Text>
                    {activeFilter === 'all' && (
                      <Check size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.filterOption,
                      activeFilter === 'recent' && styles.filterOptionSelected
                    ]}
                    onPress={() => setActiveFilter('recent')}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      activeFilter === 'recent' && styles.filterOptionTextSelected
                    ]}>Recent Photos</Text>
                    {activeFilter === 'recent' && (
                      <Check size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Family Member Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Filter by Family Member</Text>
                <View style={styles.memberFilterOptions}>
                  {familyMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberFilterOption,
                        activeFilter === member.id && styles.memberFilterOptionSelected
                      ]}
                      onPress={() => setActiveFilter(member.id)}
                    >
                      <Image source={{ uri: member.avatar }} style={styles.memberFilterAvatar} />
                      <Text style={[
                        styles.memberFilterText,
                        activeFilter === member.id && styles.memberFilterTextSelected
                      ]}>
                        {member.name}
                      </Text>
                      {activeFilter === member.id && (
                        <View style={styles.memberFilterCheck}>
                          <Check size={16} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Album Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Filter by Album</Text>
                <View style={styles.albumFilterOptions}>
                  {albums.map((album) => (
                    <TouchableOpacity
                      key={album.id}
                      style={[
                        styles.albumFilterOption,
                        activeFilter === album.name && styles.albumFilterOptionSelected
                      ]}
                      onPress={() => setActiveFilter(album.name)}
                    >
                      <Image source={{ uri: album.coverPhoto }} style={styles.albumFilterCover} />
                      <View style={styles.albumFilterContent}>
                        <Text style={[
                          styles.albumFilterName,
                          activeFilter === album.name && styles.albumFilterNameSelected
                        ]}>
                          {album.name}
                        </Text>
                        <Text style={styles.albumFilterCount}>{album.photoCount} photos</Text>
                      </View>
                      {activeFilter === album.name && (
                        <Check size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Create Gallery Modal */}
        <Modal
          visible={showCreateGalleryModal}
          animationType="slide"
          presentationStyle="formSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowCreateGalleryModal(false);
                    // User can still access the modal again by trying to upload/create album
                  }}
                  style={styles.closeButton}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Create Gallery</Text>
                <View style={{ width: 36 }} />
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <View style={styles.modalContent}>
              <View style={styles.createGalleryContainer}>
                <Text style={styles.createGalleryTitle}>Welcome to Photos!</Text>
                <Text style={styles.createGalleryDescription}>
                  To start organizing your family photos, we need to create a gallery for you first. 
                  This will allow you to create albums and upload photos.
                </Text>
                
                <View style={styles.createGalleryActions}>
                  <TouchableOpacity 
                    style={styles.createGalleryButton}
                    onPress={handleCreateGallery}
                    disabled={isCreatingGallery}
                  >
                    {isCreatingGallery ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.createGalleryButtonText}>Create Gallery</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.cancelGalleryButton}
                    onPress={() => {
                      setShowCreateGalleryModal(false);
                      // User can still access the modal again by trying to upload/create album
                    }}
                  >
                    <Text style={styles.cancelGalleryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
                <Text style={styles.modalTitle}>Create Album</Text>
                <TouchableOpacity 
                  style={[
                    styles.doneButton,
                    (isCreatingAlbum || uploadProgress.isUploading) && styles.doneButtonDisabled
                  ]}
                  onPress={handleSaveAlbum}
                  disabled={isCreatingAlbum || uploadProgress.isUploading}
                >
                  {(isCreatingAlbum || uploadProgress.isUploading) ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.doneButtonText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.modalHeaderDivider} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formContainer}>
                {/* Album Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Album Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newAlbum.name}
                    onChangeText={(text) => setNewAlbum(prev => ({ ...prev, name: text }))}
                    placeholder="Enter album name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Cover Image */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Cover Image</Text>
                  
                  {/* Photo Selection Button */}
                  <TouchableOpacity 
                    style={styles.selectPhotoButton}
                    onPress={handleSelectCoverPhoto}
                    disabled={uploadProgress.isUploading}
                  >
                    <Camera size={20} color="#0e3c67" />
                    <Text style={styles.selectPhotoButtonText}>
                      {uploadProgress.isUploading ? 'Uploading...' : 'Select Photo'}
                    </Text>
                  </TouchableOpacity>

                  {/* Upload Progress */}
                  {uploadProgress.isUploading && (
                    <View style={styles.uploadProgressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${uploadProgress.progress}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        Uploading... {Math.round(uploadProgress.progress)}%
                      </Text>
                    </View>
                  )}

                  {/* Upload Error */}
                  {uploadProgress.error && (
                    <View style={styles.uploadErrorContainer}>
                      <Text style={styles.uploadErrorText}>
                        {uploadProgress.error}
                      </Text>
                      <TouchableOpacity 
                        style={styles.uploadRetryButton}
                        onPress={handleSelectCoverPhoto}
                      >
                        <Text style={styles.uploadRetryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Image Preview */}
                  {newAlbum.coverImage && !uploadProgress.isUploading && (
                    <View style={styles.imagePreview}>
                      <Image 
                        source={{ uri: newAlbum.coverImage }} 
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        style={styles.changePhotoButton}
                        onPress={handleSelectCoverPhoto}
                      >
                        <Text style={styles.changePhotoButtonText}>Change Photo</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={newAlbum.description}
                    onChangeText={(text) => setNewAlbum(prev => ({ ...prev, description: text }))}
                    placeholder="Enter album description (optional)"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '500',
  },
  clearFilterButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearFilterText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#0e3c67',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 50,
    zIndex: 1,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  albumsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  albumsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  albumCard: {
    backgroundColor: '#FFFFFF',
    width: 140,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  albumCover: {
    width: '100%',
    height: 100,
  },
  albumColorBar: {
    height: 4,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    padding: 12,
    paddingBottom: 4,
  },
  albumCount: {
    fontSize: 12,
    color: '#6B7280',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  photosSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoGridItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  photoTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  photoList: {
    gap: 12,
  },
  photoListItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoListImage: {
    width: 80,
    height: 80,
  },
  photoListContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  photoListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  photoListAlbum: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  photoListDate: {
    fontSize: 12,
    color: '#9CA3AF',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  doneButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  doneButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  searchSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterOptionSelected: {
    backgroundColor: '#0e3c67',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  memberFilterOptions: {
    gap: 8,
  },
  memberFilterOption: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  memberFilterOptionSelected: {
    backgroundColor: '#0e3c67',
  },
  memberFilterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberFilterText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
  memberFilterTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  memberFilterCheck: {
    position: 'absolute',
    right: 16,
  },
  albumFilterOptions: {
    gap: 8,
  },
  albumFilterOption: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  albumFilterOptionSelected: {
    backgroundColor: '#0e3c67',
  },
  albumFilterCover: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  albumFilterContent: {
    flex: 1,
  },
  albumFilterName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  albumFilterNameSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  albumFilterCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Loading and Error States
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
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Create Gallery Modal Styles
  createGalleryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  createGalleryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  createGalleryDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createGalleryActions: {
    width: '100%',
    gap: 12,
  },
  createGalleryButton: {
    backgroundColor: '#0e3c67',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0e3c67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createGalleryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelGalleryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelGalleryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  // Album Creation Modal Styles
  formContainer: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePreview: {
    marginTop: 12,
    alignItems: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  // Photo Selection and Upload Styles
  selectPhotoButton: {
    backgroundColor: '#F0F7FF',
    borderWidth: 2,
    borderColor: '#0e3c67',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectPhotoButtonText: {
    color: '#0e3c67',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadProgressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0e3c67',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  uploadErrorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  uploadErrorText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 8,
  },
  uploadRetryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  uploadRetryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  changePhotoButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  changePhotoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});