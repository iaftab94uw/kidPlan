import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
  import { Plus, Camera, Search, Filter, MoveVertical as MoreVertical, FolderPlus, X, Check, Grid3X3, List, Trash2 } from 'lucide-react-native';
  import { useAuth } from '@/hooks/useAuth';
  import { useGallery } from '@/hooks/useGallery';
  import { useImageUpload } from '@/hooks/useImageUpload';
  import { Album, Media } from '@/types/gallery';
  import * as ImagePicker from 'expo-image-picker';
  import * as FileSystem from 'expo-file-system/legacy';
  import * as Sharing from 'expo-sharing';
  import * as MediaLibrary from 'expo-media-library';

  const { width } = Dimensions.get('window');

export default function Photos() {
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { gallery, albums: apiAlbums, media: apiMedia, loading: galleryLoading, error: galleryError, createGallery, isCreatingGallery, createAlbum, isCreatingAlbum, addMedia, isAddingMedia, deleteMedia, isDeletingMedia, refetch, needsGalleryCreation } = useGallery(token || '');
  
  const { uploadProgress, selectAndUploadImage, resetUpload } = useImageUpload();
  
  const [viewMode, setViewMode] = useState<'grid'>('grid');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGalleryModal, setShowCreateGalleryModal] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [showUploadMediaModal, setShowUploadMediaModal] = useState(false);
  const [selectedAlbumForUpload, setSelectedAlbumForUpload] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showViewAllAlbumsModal, setShowViewAllAlbumsModal] = useState(false);
  const [showViewAllPhotosModal, setShowViewAllPhotosModal] = useState(false);
  const [albumsViewMode, setAlbumsViewMode] = useState<'grid' | 'list'>('grid');
  const [photosViewMode, setPhotosViewMode] = useState<'grid' | 'list'>('grid');
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Media | null>(null);

  // Note: We don't automatically show create gallery modal here
  // It will be shown when user tries to create album or upload photo





    const [newAlbum, setNewAlbum] = useState({
      name: '',
      coverImage: 'https://dummyjson.com/image/150',
      description: ''
    });

    const [newMedia, setNewMedia] = useState({
      caption: '',
      imageUrl: ''
    });

    useEffect(() => {
      refetch();
    }, []);

    // Note: Removed useFocusEffect to prevent infinite API calls
    // Users can pull to refresh to get updated data after album deletion

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

    // Photos are now fetched from API via useGallery hook (apiMedia)

    // Albums are now fetched from API via useGallery hook

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
    try {
      let filtered = apiMedia || [];
      
      // Ensure filtered is an array
      if (!Array.isArray(filtered)) {
        console.warn('apiMedia is not an array:', typeof filtered);
        filtered = [];
      }

      if (activeFilter === 'recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(media => {
          try {
            return media && media.createdAt && new Date(media.createdAt) >= oneWeekAgo;
          } catch (error) {
            console.warn('Error filtering by date:', error);
            return false;
          }
        });
      } else if (activeFilter !== 'all') {
        // Filter by album name if it matches
        const album = (apiAlbums || []).find(album => album && album.name === activeFilter);
        if (album && album._id) {
          filtered = filtered.filter(media => media && media.albumId === album._id);
        }
      }

      if (searchQuery && searchQuery.trim()) {
        filtered = filtered.filter(media => {
          try {
            return media && (
              (media.caption && media.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
              ((apiAlbums || []).find(album => album && album._id === media.albumId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
          } catch (error) {
            console.warn('Error filtering by search:', error);
            return false;
          }
        });
      }

      return filtered;
    } catch (error) {
      console.error('Error in getFilteredPhotos:', error);
      return [];
    }
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

    // Handle photo preview
    const handlePhotoPreview = (photo: Media) => {
      setSelectedPhoto(photo);
      setShowPhotoPreviewModal(true);
    };

    // Handle photo download
    const handleDownloadPhoto = async (photo: Media) => {
      try {
        Alert.alert('Downloading', 'Please wait while the photo is being downloaded...');
        
        // Request media library permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to save photos to your gallery.');
          return;
        }
        
        const filename = `photo_${photo._id}_${Date.now()}.jpg`;
        const fileUri = FileSystem.documentDirectory + filename;
        
        // Download the photo
        const downloadResult = await FileSystem.downloadAsync(photo.url, fileUri);
        
        if (downloadResult.status === 200) {
          // Save to Photos gallery
          const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
          
          Alert.alert('Success', 'Photo saved to your Photos gallery!', [
            { text: 'OK', style: 'default' }
          ]);
          
          // Clean up temporary file
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        } else {
          Alert.alert('Error', 'Failed to download photo. Please try again.');
        }
      } catch (error) {
        console.error('Error downloading photo:', error);
        Alert.alert('Error', 'Failed to download photo. Please try again.');
      }
    };

    // Handle photo share
    const handleSharePhoto = async (photo: Media) => {
      try {
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (!isAvailable) {
          Alert.alert('Error', 'Sharing is not available on this device.');
          return;
        }

        Alert.alert('Sharing', 'Preparing photo for sharing...');
        
        const filename = `photo_${photo._id}_${Date.now()}.jpg`;
        const fileUri = FileSystem.documentDirectory + filename;
        
        const downloadResult = await FileSystem.downloadAsync(photo.url, fileUri);
        
        if (downloadResult.status === 200) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Share Photo',
            UTI: 'public.jpeg'
          });
        } else {
          Alert.alert('Error', 'Failed to prepare photo for sharing. Please try again.');
        }
      } catch (error) {
        console.error('Error sharing photo:', error);
        Alert.alert('Error', 'Failed to share photo. Please try again.');
      }
    };

    // Handle photo delete
    const handleDeletePhoto = async (photo: Media) => {
      Alert.alert(
        'Delete Photo',
        'Are you sure you want to delete this photo? This action cannot be undone.',
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
                const success = await deleteMedia(photo._id, photo.url);
                if (success) {
                  Alert.alert('Success', 'Photo deleted successfully!');
                  setShowPhotoPreviewModal(false);
                  setSelectedPhoto(null);
                } else {
                  Alert.alert('Error', 'Failed to delete photo. Please try again.');
                }
              } catch (error) {
                console.error('Error deleting photo:', error);
                Alert.alert('Error', 'Failed to delete photo. Please try again.');
              }
            },
          },
        ]
      );
    };

    const handleCreateAlbum = () => {
      console.log('Create Album button pressed');
      console.log('Gallery exists:', !!gallery);
      console.log('Needs gallery creation:', needsGalleryCreation);
      console.log('Current modal state:', showCreateAlbumModal);
      
      // Check if gallery exists or needs to be created
      if (!gallery || needsGalleryCreation) {
        console.log('No gallery found or needs creation, showing create gallery modal');
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

    const handleSelectMediaPhoto = async () => {
      try {
        const imageUrl = await selectAndUploadImage();
        if (imageUrl) {
          setNewMedia(prev => ({ ...prev, imageUrl }));
        }
      } catch (error) {
        console.error('Error selecting media photo:', error);
        Alert.alert('Error', 'Failed to select photo. Please try again.');
      }
    };

    const handleUploadMedia = async () => {
      if (!gallery || !newMedia.imageUrl.trim()) {
        Alert.alert('Error', 'Please select a photo to upload');
        return;
      }

      // Don't allow saving while upload is in progress
      if (uploadProgress.isUploading) {
        Alert.alert('Please Wait', 'Please wait for the photo upload to complete.');
                    return;
                  }
                  
      try {
        const mediaData = {
          galleryId: gallery._id,
          albumId: selectedAlbumForUpload, // null for direct gallery upload
          type: 'image' as const,
          url: newMedia.imageUrl,
          caption: newMedia.caption.trim()
        };

        const success = await addMedia(mediaData);
        if (success) {
          setShowUploadMediaModal(false);
          setSelectedAlbumForUpload(null);
          setNewMedia({ caption: '', imageUrl: '' });
          resetUpload();
          Alert.alert('Success', 'Media uploaded successfully!');
        } else {
          Alert.alert('Error', 'Failed to upload media. Please try again.');
                  }
                } catch (error) {
        console.error('Error uploading media:', error);
        Alert.alert('Error', 'Failed to upload media. Please try again.');
      }
    };

    const openUploadModal = (albumId?: string) => {
      setSelectedAlbumForUpload(albumId || null);
      setShowUploadMediaModal(true);
    };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      refetch();
    } catch (error) {
      console.error('Error refreshing gallery:', error);
    } finally {
      setRefreshing(false);
    }
  };

    const handleUploadPhoto = async () => {
      // Check if gallery exists first
      if (!gallery) {
        setShowCreateGalleryModal(true);
                    return;
                  }

      // Open upload modal for direct gallery upload
      openUploadModal();
    };






    // Show loading state while checking gallery
    if (galleryLoading) {
      return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0e3c67" />
            <Text style={styles.loadingText}>Loading gallery...</Text>
          </View>
        </View>
      );
    }

    // Show error state if there's an error (but not "Gallery not found")
    if (galleryError && galleryError !== 'Gallery not found') {
      return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {galleryError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => window.location.reload()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header - Fixed outside ScrollView */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Photos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0e3c67"
              colors={['#0e3c67']}
            />
          }
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
        >

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
              <Text style={styles.statNumber}>{(apiAlbums || []).length}</Text>
              <Text style={styles.statLabel}>Albums</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {(apiMedia || []).filter(media => {
                  const oneWeekAgo = new Date();
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                  return new Date(media.createdAt) >= oneWeekAgo;
                }).length}
              </Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { flex: 1, marginRight: 6 }]}
              onPress={handleUploadPhoto}
              activeOpacity={0.8}
            >
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Upload Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionButton, { flex: 1, marginLeft: 6 }]}
              onPress={handleCreateAlbum}
              activeOpacity={0.8}
            >
              <FolderPlus size={20} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Create Album</Text>
            </TouchableOpacity>
          </View>

          {/* Albums Section */}
          <View style={styles.albumsSection}>
            <View style={styles.albumsHeader}>
              <Text style={styles.albumsTitle}>Albums</Text>
              {(apiAlbums && apiAlbums.length > 0) && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => setShowViewAllAlbumsModal(true)}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {(apiAlbums && apiAlbums.length > 0) ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumsList}
                decelerationRate="fast"
                snapToInterval={176}
                snapToAlignment="start"
              >
                {apiAlbums.map((item) => (
                  <TouchableOpacity 
                    key={item._id}
                    style={styles.albumCard}
                    onPress={() => {
                      console.log('Album pressed:', item.name);
                      router.push(`/album-detail/${item._id}`);
                    }}
                    activeOpacity={0.7}
                    delayPressIn={0}
                    delayPressOut={0}
                  >
                    <Image 
                      source={{ uri: item.coverImage || 'https://dummyjson.com/image/150' }} 
                      style={styles.albumCoverImage}
                      resizeMode="cover"
                    />
                    <View style={styles.albumOverlay}>
                      <Text style={styles.albumName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.albumCount}>
                        {item?.mediaCount} photos
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <FolderPlus size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Albums Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Create your first album to organize your photos
                </Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={handleCreateAlbum}
                >
                  <Text style={styles.emptyStateButtonText}>Create Album</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Photos Section */}
          <View style={styles.photosSection}>
            <View style={styles.photosHeader}>
              <Text style={styles.photosTitle}>All Photos</Text>
              {getFilteredPhotos().length > 0 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => setShowViewAllPhotosModal(true)}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {getFilteredPhotos().length > 0 ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={getFilteredPhotos()}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.horizontalPhotoCard}
                    onPress={() => handlePhotoPreview(item)}
                    activeOpacity={0.8}
                    delayPressIn={0}
                    delayPressOut={0}
                  >
                    <Image 
                      source={{ uri: item.url }} 
                      style={styles.horizontalPhotoImage}
                      resizeMode="cover"
                    />
                    {item.caption && (
                      <View style={styles.horizontalPhotoOverlay}>
                        <Text style={styles.horizontalPhotoCaption} numberOfLines={1}>
                          {item.caption}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.horizontalPhotosList}
                decelerationRate="fast"
                snapToInterval={120}
                snapToAlignment="start"
              />
            ) : (
              <View style={styles.emptyState}>
                <Camera size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Photos Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Upload your first photo to get started
                </Text>
                <TouchableOpacity 
                  style={styles.emptyStateButton}
                  onPress={handleUploadPhoto}
                >
                  <Text style={styles.emptyStateButtonText}>Upload Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>


          {/* Filter Modal */}
          <Modal
            visible={showFilterModal}
            animationType="slide"
            presentationStyle="formSheet"
          >
            <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
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
                    {apiAlbums.map((album) => (
                      <TouchableOpacity
                        key={album._id}
                        style={[
                          styles.albumFilterOption,
                          activeFilter === album.name && styles.albumFilterOptionSelected
                        ]}
                        onPress={() => setActiveFilter(album.name)}
                      >
                        <Image source={{ uri: album.coverImage || 'https://dummyjson.com/image/150' }} style={styles.albumFilterCover} />
                        <View style={styles.albumFilterContent}>
                          <Text style={[
                            styles.albumFilterName,
                            activeFilter === album.name && styles.albumFilterNameSelected
                          ]}>
                            {album.name}
                          </Text>
                          <Text style={styles.albumFilterCount}>Album</Text>
                        </View>
                        {activeFilter === album.name && (
                          <Check size={16} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* Create Gallery Modal */}
          <Modal
            visible={showCreateGalleryModal}
            animationType="slide"
            presentationStyle="formSheet"
          >
            <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
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
            </View>
          </Modal>

          {/* Create Album Modal */}
          <Modal
            visible={showCreateAlbumModal}
            animationType="slide"
            presentationStyle="formSheet"
            statusBarTranslucent={false}
          >
            <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
              {/* Modern Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity 
                    onPress={() => setShowCreateAlbumModal(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>Create New Album</Text>
                    <Text style={styles.modalSubtitle}>Organize your memories</Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.createButton,
                      (isCreatingAlbum || uploadProgress.isUploading || !newAlbum.name.trim()) && styles.createButtonDisabled
                    ]}
                    onPress={handleSaveAlbum}
                    disabled={isCreatingAlbum || uploadProgress.isUploading || !newAlbum.name.trim()}
                  >
                    {(isCreatingAlbum || uploadProgress.isUploading) ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.createButtonText}>Create</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                  {/* Cover Image Section */}
                  <View style={styles.coverImageSection}>
                    <Text style={styles.sectionTitle}>Cover Photo</Text>
                    
                    {newAlbum.coverImage && !uploadProgress.isUploading ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image 
                          source={{ uri: newAlbum.coverImage }} 
                          style={styles.coverImagePreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity 
                          style={styles.floatingChangeButton}
                          onPress={handleSelectCoverPhoto}
                          activeOpacity={0.8}
                        >
                          <Camera size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.changePhotoHint}>
                          <Text style={styles.changePhotoHintText}>Tap to change photo</Text>
                  </View>
                      </View>
                    ) : (
                    <TouchableOpacity 
                        style={styles.selectPhotoCard}
                      onPress={handleSelectCoverPhoto}
                      disabled={uploadProgress.isUploading}
                    >
                        <View style={styles.selectPhotoIconContainer}>
                          <Camera size={32} color="#0e3c67" />
                        </View>
                        <Text style={styles.selectPhotoTitle}>
                          {uploadProgress.isUploading ? 'Uploading...' : 'Add Cover Photo'}
                        </Text>
                        <Text style={styles.selectPhotoSubtitle}>
                          Tap to select from gallery
                      </Text>
                    </TouchableOpacity>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress.isUploading && (
                      <View style={styles.uploadProgressCard}>
                        <View style={styles.progressHeader}>
                          <Text style={styles.progressTitle}>Uploading Photo</Text>
                          <Text style={styles.progressPercentage}>{Math.round(uploadProgress.progress)}%</Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View 
                            style={[
                              styles.progressBarFill, 
                              { width: `${uploadProgress.progress}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    )}

                    {/* Upload Error */}
                    {uploadProgress.error && (
                      <View style={styles.uploadErrorCard}>
                        <Text style={styles.uploadErrorTitle}>Upload Failed</Text>
                        <Text style={styles.uploadErrorText}>{uploadProgress.error}</Text>
                        <TouchableOpacity 
                          style={styles.retryButton}
                          onPress={handleSelectCoverPhoto}
                        >
                          <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Album Details Section */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Album Details</Text>
                    
                    {/* Album Name */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Album Name *</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.modernTextInput}
                          value={newAlbum.name}
                          onChangeText={(text) => setNewAlbum(prev => ({ ...prev, name: text }))}
                          placeholder="Enter album name"
                          placeholderTextColor="#9CA3AF"
                          maxLength={50}
                        />
                        <Text style={styles.characterCount}>{newAlbum.name.length}/50</Text>
                      </View>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Description</Text>
                      <View style={styles.textAreaContainer}>
                        <TextInput
                          style={styles.modernTextArea}
                          value={newAlbum.description}
                          onChangeText={(text) => setNewAlbum(prev => ({ ...prev, description: text }))}
                          placeholder="Tell the story behind this album..."
                          placeholderTextColor="#9CA3AF"
                          multiline
                          numberOfLines={4}
                          maxLength={200}
                        />
                        <Text style={styles.characterCount}>{newAlbum.description.length}/200</Text>
                      </View>
                    </View>
                  </View>

                  {/* Tips Section */}
                  <View style={styles.tipsSection}>
                    <Text style={styles.tipsTitle}>💡 Tips</Text>
                    <View style={styles.tipsList}>
                      <Text style={styles.tipItem}>• Choose a meaningful cover photo</Text>
                      <Text style={styles.tipItem}>• Use descriptive names for easy finding</Text>
                      <Text style={styles.tipItem}>• Add details to remember special moments</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* Upload Media Modal */}
          <Modal
            visible={showUploadMediaModal}
            animationType="slide"
            presentationStyle="formSheet"
            statusBarTranslucent={false}
          >
            <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
              {/* Modern Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity 
                    onPress={() => setShowUploadMediaModal(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>
                      {selectedAlbumForUpload ? 'Upload to Album' : 'Upload to Gallery'}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedAlbumForUpload ? 'Add photos to this album' : 'Add photos to your gallery'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.createButton,
                      (isAddingMedia || uploadProgress.isUploading || !newMedia.imageUrl.trim()) && styles.createButtonDisabled
                    ]}
                    onPress={handleUploadMedia}
                    disabled={isAddingMedia || uploadProgress.isUploading || !newMedia.imageUrl.trim()}
                  >
                    {(isAddingMedia || uploadProgress.isUploading) ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.createButtonText}>Upload</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                  {/* Photo Selection Section */}
                  <View style={styles.coverImageSection}>
                    <Text style={styles.sectionTitle}>Select Photo</Text>
                    
                    {newMedia.imageUrl && !uploadProgress.isUploading ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image 
                          source={{ uri: newMedia.imageUrl }} 
                          style={styles.coverImagePreview}
                          resizeMode="cover"
                        />
                        <TouchableOpacity 
                          style={styles.floatingChangeButton}
                          onPress={handleSelectMediaPhoto}
                          activeOpacity={0.8}
                        >
                          <Camera size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.changePhotoHint}>
                          <Text style={styles.changePhotoHintText}>Tap to change photo</Text>
                      </View>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.selectPhotoCard}
                        onPress={handleSelectMediaPhoto}
                        disabled={uploadProgress.isUploading}
                      >
                        <View style={styles.selectPhotoIconContainer}>
                          <Camera size={32} color="#0e3c67" />
                        </View>
                        <Text style={styles.selectPhotoTitle}>
                          {uploadProgress.isUploading ? 'Uploading...' : 'Select Photo'}
                        </Text>
                        <Text style={styles.selectPhotoSubtitle}>
                          Tap to choose from gallery
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress.isUploading && (
                      <View style={styles.uploadProgressCard}>
                        <ActivityIndicator size="small" color="#0e3c67" />
                        <Text style={styles.progressText}>
                          Uploading... {uploadProgress.progress}%
                        </Text>
                  </View>
                    )}

                    {/* Upload Error */}
                    {uploadProgress.error && (
                      <View style={styles.uploadErrorCard}>
                        <Text style={styles.uploadErrorText}>{uploadProgress.error}</Text>
                      </View>
                    )}
                  </View>

                  {/* Caption Section */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Caption (Optional)</Text>
                    <View style={styles.inputGroup}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Add a caption for this photo..."
                      placeholderTextColor="#9CA3AF"
                        value={newMedia.caption}
                        onChangeText={(text) => setNewMedia(prev => ({ ...prev, caption: text }))}
                      multiline
                        numberOfLines={3}
                        maxLength={200}
                      />
                      <Text style={styles.characterCount}>
                        {newMedia.caption.length}/200
                      </Text>
                    </View>
                  </View>

                  {/* Tips Section */}
                  <View style={styles.tipsSection}>
                    <Text style={styles.tipsTitle}>💡 Tips</Text>
                    <Text style={styles.tipText}>
                      • Add meaningful captions to make your photos easier to find{'\n'}
                      • Photos are automatically organized by date{'\n'}
                      • You can always edit captions later
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* View All Albums Modal */}
          <Modal
            visible={showViewAllAlbumsModal}
            animationType="slide"
            presentationStyle="formSheet"
            statusBarTranslucent={false}
          >
            <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity 
                    onPress={() => setShowViewAllAlbumsModal(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>All Albums</Text>
                    <Text style={styles.modalSubtitle}>{apiAlbums?.length || 0} albums</Text>
                  </View>
                  <View style={styles.viewModeButtons}>
                    <TouchableOpacity 
                      style={[styles.viewModeButton, albumsViewMode === 'grid' && styles.viewModeButtonActive]}
                      onPress={() => setAlbumsViewMode('grid')}
                    >
                      <Grid3X3 size={18} color={albumsViewMode === 'grid' ? '#FFFFFF' : '#6B7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.viewModeButton, albumsViewMode === 'list' && styles.viewModeButtonActive]}
                      onPress={() => setAlbumsViewMode('list')}
                    >
                      <List size={18} color={albumsViewMode === 'list' ? '#FFFFFF' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {apiAlbums && apiAlbums.length > 0 ? (
                  <View style={styles.viewAllSection}>
                    <View style={albumsViewMode === 'grid' ? styles.viewAllAlbumsGrid : styles.viewAllAlbumsList}>
                      {apiAlbums.map((album) => (
                        <TouchableOpacity 
                          key={album._id}
                          style={albumsViewMode === 'grid' ? styles.viewAllAlbumCard : styles.viewAllAlbumCardList}
                          onPress={() => {
                            setShowViewAllAlbumsModal(false);
                            router.push(`/album-detail/${album._id}`);
                          }}
                          activeOpacity={0.8}
                        >
                          <Image 
                            source={{ uri: album.coverImage || 'https://dummyjson.com/image/150' }} 
                            style={albumsViewMode === 'grid' ? styles.viewAllAlbumImage : styles.viewAllAlbumImageList}
                            resizeMode="cover"
                          />
                          <View style={albumsViewMode === 'grid' ? styles.viewAllAlbumInfo : styles.viewAllAlbumInfoList}>
                            <Text style={styles.viewAllAlbumName} numberOfLines={2}>
                              {album.name}
                            </Text>
                            <Text style={styles.viewAllAlbumCount}>
                              {apiMedia?.filter(media => media.albumId === album._id).length || 0} photos
                            </Text>
                            {album.description && (
                              <Text style={styles.viewAllAlbumDescription} numberOfLines={albumsViewMode === 'grid' ? 2 : 3}>
                                {album.description}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.viewAllEmptyState}>
                    <Text style={styles.viewAllEmptyTitle}>No Albums Yet</Text>
                    <Text style={styles.viewAllEmptyDescription}>
                      Create your first album to organize your photos!
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </Modal>

          {/* View All Photos Modal */}
          <Modal
            visible={showViewAllPhotosModal}
            animationType="slide"
            presentationStyle="formSheet"
            statusBarTranslucent={false}
          >
            <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity 
                    onPress={() => setShowViewAllPhotosModal(false)}
                    style={styles.closeButton}
                  >
                    <X size={24} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>All Photos</Text>
                    <Text style={styles.modalSubtitle}>{getFilteredPhotos().length} photos</Text>
                  </View>
                  <View style={styles.viewModeButtons}>
                    <TouchableOpacity 
                      style={[styles.viewModeButton, photosViewMode === 'grid' && styles.viewModeButtonActive]}
                      onPress={() => setPhotosViewMode('grid')}
                    >
                      <Grid3X3 size={18} color={photosViewMode === 'grid' ? '#FFFFFF' : '#6B7280'} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.viewModeButton, photosViewMode === 'list' && styles.viewModeButtonActive]}
                      onPress={() => setPhotosViewMode('list')}
                    >
                      <List size={18} color={photosViewMode === 'list' ? '#FFFFFF' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {getFilteredPhotos().length > 0 ? (
                  <View style={styles.viewAllSection}>
                    <View style={photosViewMode === 'grid' ? styles.viewAllPhotosGrid : styles.viewAllPhotosList}>
                      {getFilteredPhotos().map((photo) => (
                        <TouchableOpacity 
                          key={photo._id}
                          style={photosViewMode === 'grid' ? styles.viewAllPhotoCard : styles.viewAllPhotoCardList}
                          onPress={() => {
                            setShowViewAllPhotosModal(false);
                            handlePhotoPreview(photo);
                          }}
                          activeOpacity={0.8}
                        >
                          <Image 
                            source={{ uri: photo.url }} 
                            style={photosViewMode === 'grid' ? styles.viewAllPhotoImage : styles.viewAllPhotoImageList}
                            resizeMode="cover"
                          />
                          {photosViewMode === 'list' ? (
                            <View style={styles.viewAllPhotoListContent}>
                              <Text style={styles.viewAllPhotoListTitle} numberOfLines={2}>
                                {photo.caption || 'Untitled Photo'}
                              </Text>
                              <Text style={styles.viewAllPhotoListDate}>
                                {new Date(photo.createdAt).toLocaleDateString('en-GB')}
                              </Text>
                            </View>
                          ) : (
                            photo.caption && (
                              <View style={styles.viewAllPhotoOverlay}>
                                <Text style={styles.viewAllPhotoCaption} numberOfLines={1}>
                                  {photo.caption}
                                </Text>
                              </View>
                            )
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.viewAllEmptyState}>
                    <Text style={styles.viewAllEmptyTitle}>No Photos Yet</Text>
                    <Text style={styles.viewAllEmptyDescription}>
                      Upload your first photo to get started!
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </Modal>

          {/* Photo Preview Modal */}
          <Modal
            visible={showPhotoPreviewModal}
            animationType="fade"
            presentationStyle="overFullScreen"
            statusBarTranslucent={true}
          >
            <View style={[styles.photoPreviewContainer, { paddingTop: insets.top }]}>
              {/* Header */}
              <View style={styles.photoPreviewHeader}>
                <TouchableOpacity 
                  onPress={() => setShowPhotoPreviewModal(false)}
                  style={styles.photoPreviewCloseButton}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
                {selectedPhoto && (
                  <View style={styles.photoPreviewInfo}>
                    <Text style={styles.photoPreviewTitle} numberOfLines={1}>
                      {selectedPhoto.caption || 'Untitled Photo'}
                    </Text>
                    <Text style={styles.photoPreviewDate}>
                      {new Date(selectedPhoto.createdAt).toLocaleDateString('en-GB')}
                    </Text>
                  </View>
                )}
                <View style={styles.photoPreviewActions}>
                  <TouchableOpacity 
                    style={styles.photoPreviewActionButton}
                    onPress={() => selectedPhoto && handleDownloadPhoto(selectedPhoto)}
                  >
                    <Text style={styles.photoPreviewActionText}>Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.photoPreviewActionButton}
                    onPress={() => selectedPhoto && handleSharePhoto(selectedPhoto)}
                  >
                    <Text style={styles.photoPreviewActionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.photoPreviewDeleteButton}
                    onPress={() => selectedPhoto && handleDeletePhoto(selectedPhoto)}
                    disabled={isDeletingMedia}
                  >
                    {isDeletingMedia ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Trash2 size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Photo Content */}
              <View style={styles.photoPreviewContent}>
                {selectedPhoto && (
                  <Image 
                    source={{ uri: selectedPhoto.url }} 
                    style={styles.photoPreviewImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
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
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: '#F8FAFC',
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
      paddingHorizontal: 20,
      paddingBottom: 20,
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
      borderColor: '#E5E7EB',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: '#111827',
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    selectPhotoButton: {
      backgroundColor: '#F3F4F6',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
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
      height: 4,
      backgroundColor: '#E5E7EB',
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#0e3c67',
    },
    progressText: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
    },
    uploadErrorContainer: {
      backgroundColor: '#FEF2F2',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    uploadErrorText: {
      color: '#DC2626',
      fontSize: 14,
      marginBottom: 8,
    },
    uploadRetryButton: {
      backgroundColor: '#DC2626',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    uploadRetryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    imagePreview: {
      marginTop: 12,
    },
    previewImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: 8,
    },
    
    // Modern Album Modal Styles
    modalTitleContainer: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 16,
    },
    modalSubtitle: {
      fontSize: 14,
      color: '#64748B',
      fontWeight: '500',
    },
    createButton: {
      backgroundColor: '#0e3c67',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 80,
    },
    createButtonDisabled: {
      backgroundColor: '#94A3B8',
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    
    // Cover Image Section
    coverImageSection: {
      marginBottom: 32,
    },
    selectPhotoCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#E2E8F0',
      borderStyle: 'dashed',
    },
    selectPhotoIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#F0F9FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    selectPhotoTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1E293B',
      marginBottom: 8,
    },
    selectPhotoSubtitle: {
      fontSize: 14,
      color: '#64748B',
    },
    imagePreviewContainer: {
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
    },
    coverImagePreview: {
      width: '100%',
      height: 200,
      borderRadius: 16,
    },
    floatingChangeButton: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#0e3c67',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    changePhotoHint: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    changePhotoHintText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '500',
    },
    
    // Upload Progress
    uploadProgressCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      marginTop: 16,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1E293B',
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: '600',
      color: '#0e3c67',
    },
    progressBarContainer: {
      height: 6,
      backgroundColor: '#F1F5F9',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#0e3c67',
      borderRadius: 3,
    },
    
    // Upload Error
    uploadErrorCard: {
      backgroundColor: '#FEF2F2',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#FECACA',
      marginTop: 16,
    },
    uploadErrorTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#DC2626',
      marginBottom: 8,
    },
    
    // Details Section
    detailsSection: {
      marginBottom: 32,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1E293B',
      marginBottom: 8,
    },
    inputContainer: {
      position: 'relative',
    },
    modernTextInput: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: '#1E293B',
    },
    textAreaContainer: {
      position: 'relative',
    },
    modernTextArea: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: '#1E293B',
      minHeight: 100,
      textAlignVertical: 'top',
    },
    characterCount: {
      position: 'absolute',
      bottom: 8,
      right: 12,
      fontSize: 12,
      color: '#94A3B8',
    },
    
    // Tips Section
    tipsSection: {
      backgroundColor: '#F0F9FF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#BAE6FD',
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#0369A1',
      marginBottom: 12,
    },
    tipText: {
      fontSize: 14,
      color: '#0369A1',
      lineHeight: 20,
    },
    tipsList: {
      gap: 6,
    },
    tipItem: {
      fontSize: 14,
      color: '#0369A1',
      lineHeight: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    
    // Albums Section Styles
    albumsSection: {
      marginTop: 20,
      paddingHorizontal: 20,
      zIndex: 10,
    },
    albumsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    albumsTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
    },
    viewAllButton: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    viewAllText: {
      fontSize: 14,
      color: '#0e3c67',
      fontWeight: '600',
    },
    albumsFlatList: {
      flexGrow: 0,
    },
    albumsList: {
      paddingRight: 20,
    },
    albumCard: {
      width: 160,
      height: 200,
      marginRight: 16,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      zIndex: 1,
    },
    albumCoverImage: {
      width: '100%',
      height: '100%',
    },
    albumOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 12,
    },
    albumName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    albumCount: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
    },
    
    // Photos Section Styles
    photosSection: {
      marginTop: 20,
      paddingHorizontal: 20,
      zIndex: 10,
    },
    photosHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    photosTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
    },
    photosCount: {
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '500',
    },
    photosGrid: {
      paddingBottom: 20,
    },
    photoCard: {
      flex: 1,
      aspectRatio: 1,
      margin: 2,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    photoImage: {
      width: '100%',
      height: '100%',
    },
    photoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    photoCaption: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '500',
    },
    
    // Horizontal Photos Styles
    horizontalPhotosList: {
      paddingRight: 20,
    },
    horizontalPhotoCard: {
      width: 108,
      height: 130,
      marginRight: 12,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    horizontalPhotoImage: {
      width: '100%',
      height: '100%',
    },
    horizontalPhotoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    horizontalPhotoCaption: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '500',
    },
    
    // View All Modal Styles
    viewAllSection: {
      marginBottom: 32,
    },
    viewAllSectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 16,
    },
    viewAllAlbumsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    viewAllAlbumCard: {
      width: '48%',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    viewAllAlbumImage: {
      width: '100%',
      height: 120,
    },
    viewAllAlbumInfo: {
      padding: 12,
    },
    viewAllAlbumName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 4,
    },
    viewAllAlbumCount: {
      fontSize: 12,
      color: '#6B7280',
      fontWeight: '500',
      marginBottom: 4,
    },
    viewAllAlbumDescription: {
      fontSize: 12,
      color: '#9CA3AF',
      lineHeight: 16,
    },
    viewAllPhotosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    viewAllPhotoCard: {
      width: '32%',
      aspectRatio: 1,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    viewAllPhotoImage: {
      width: '100%',
      height: '100%',
    },
    viewAllPhotoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    viewAllPhotoCaption: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '500',
    },
    viewAllEmptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    viewAllEmptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 8,
      textAlign: 'center',
    },
    viewAllEmptyDescription: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 24,
    },
    
    // View Mode Buttons
    viewModeButtons: {
      flexDirection: 'row',
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
      padding: 2,
    },
    viewModeButton: {
      width: 32,
      height: 32,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewModeButtonActive: {
      backgroundColor: '#0e3c67',
    },
    
    // List View Styles for Albums
    viewAllAlbumsList: {
      gap: 12,
    },
    viewAllAlbumCardList: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      flexDirection: 'row',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    viewAllAlbumImageList: {
      width: 100,
      height: 100,
    },
    viewAllAlbumInfoList: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
    },
    
    // List View Styles for Photos
    viewAllPhotosList: {
      gap: 12,
    },
    viewAllPhotoCardList: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      flexDirection: 'row',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      alignItems: 'center',
      minHeight: 100,
      marginBottom: 8,
    },
    viewAllPhotoImageList: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    viewAllPhotoListContent: {
      flex: 1,
      padding: 12,
      justifyContent: 'center',
    },
    viewAllPhotoListTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 4,
    },
    viewAllPhotoListDate: {
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 12,
    },
    
    // Photo Preview Modal Styles
    photoPreviewContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },
    photoPreviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    photoPreviewCloseButton: {
      padding: 8,
    },
    photoPreviewInfo: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 16,
    },
    photoPreviewTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    photoPreviewDate: {
      fontSize: 14,
      color: '#9CA3AF',
      marginTop: 2,
    },
    photoPreviewActions: {
      flexDirection: 'row',
      gap: 12,
    },
    photoPreviewActionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
    },
    photoPreviewActionText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#FFFFFF',
    },
    photoPreviewDeleteButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
      borderRadius: 20,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoPreviewContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoPreviewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    
    // Empty State Styles
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1F2937',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyStateSubtitle: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    emptyStateButton: {
      backgroundColor: '#0e3c67',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    emptyStateButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });