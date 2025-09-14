import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  RefreshControl,
  FlatList,
  Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useGallery } from '@/hooks/useGallery';
import { useImageUpload } from '@/hooks/useImageUpload';
import { 
  Plus,
  Camera,
  Image as ImageIcon,
  Grid3X3,
  List,
  Search,
  Filter,
  MoreVertical,
  Heart,
  Share,
  Download
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const ALBUM_ITEM_WIDTH = (width - 60) / 2; // 2 columns with margins
const PHOTO_ITEM_WIDTH = (width - 45) / 3; // 3 columns with margins

export default function Photos() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { 
    gallery, 
    albums, 
    media, 
    loading, 
    error, 
    refetch, 
    createGallery, 
    isCreatingGallery,
    createAlbum,
    isCreatingAlbum
  } = useGallery(token || '');
  
  const { uploadProgress, selectAndUploadImage, resetUpload } = useImageUpload();

  const [viewMode, setViewMode] = useState<'albums' | 'all'>('albums');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fix: Add layout state to ensure proper rendering
  const [layoutReady, setLayoutReady] = useState(false);

  // Fix: Use useFocusEffect to ensure proper initialization
  useFocusEffect(
    useCallback(() => {
      // Reset layout state when screen comes into focus
      setLayoutReady(false);
      
      // Small delay to ensure layout is ready
      const timer = setTimeout(() => {
        setLayoutReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing photos:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCreateGallery = async () => {
    try {
      const success = await createGallery();
      if (success) {
        Alert.alert('Success', 'Gallery created successfully!');
        refetch();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create gallery. Please try again.');
    }
  };

  const handleCreateAlbum = async () => {
    if (!gallery) {
      Alert.alert('Error', 'Please create a gallery first');
      return;
    }

    try {
      // First, select and upload a cover image
      const coverImageUrl = await selectAndUploadImage();
      
      if (!coverImageUrl) {
        Alert.alert('Error', 'Please select a cover image for the album');
        return;
      }

      // For demo purposes, using default values
      const albumData = {
        galleryId: gallery._id,
        name: `Album ${albums.length + 1}`,
        coverImage: coverImageUrl,
        description: 'New family album'
      };

      const success = await createAlbum(albumData);
      if (success) {
        Alert.alert('Success', 'Album created successfully!');
        refetch();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create album. Please try again.');
    }
  };

  const handleAddPhotos = async () => {
    try {
      const imageUrl = await selectAndUploadImage();
      if (imageUrl) {
        Alert.alert('Success', 'Photo uploaded successfully!');
        refetch();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleBulkAction = (action: 'delete' | 'share' | 'download') => {
    Alert.alert(
      'Bulk Action',
      `${action} ${selectedPhotos.length} selected photos?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Implement bulk action logic here
            setSelectedPhotos([]);
            setIsSelectionMode(false);
          }
        }
      ]
    );
  };

  // Fix: Render album item with proper touch handling
  const renderAlbumItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity 
      key={item._id}
      style={[
        styles.albumItem,
        { width: ALBUM_ITEM_WIDTH }
      ]}
      onPress={() => router.push(`/album-detail/${item._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.albumCover}>
        <Image 
          source={{ uri: item.coverImage || 'https://images.pexels.com/photos/1169084/pexels-photo-1169084.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2' }} 
          style={styles.albumCoverImage}
          resizeMode="cover"
        />
        <View style={styles.albumOverlay}>
          <Text style={styles.albumPhotoCount}>
            {media.filter(m => m.albumId === item._id).length} photos
          </Text>
        </View>
      </View>
      <Text style={styles.albumName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.albumDate}>
        {new Date(item.createdAt).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short',
          year: 'numeric'
        })}
      </Text>
    </TouchableOpacity>
  );

  // Fix: Render photo item with proper touch handling
  const renderPhotoItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity 
      key={item._id}
      style={[
        styles.photoItem,
        { width: PHOTO_ITEM_WIDTH },
        selectedPhotos.includes(item._id) && styles.photoItemSelected
      ]}
      onPress={() => {
        if (isSelectionMode) {
          togglePhotoSelection(item._id);
        } else {
          router.push(`/photo-detail/${item._id}`);
        }
      }}
      onLongPress={() => {
        if (!isSelectionMode) {
          setIsSelectionMode(true);
          togglePhotoSelection(item._id);
        }
      }}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.url }} 
        style={styles.photoImage}
        resizeMode="cover"
      />
      {selectedPhotos.includes(item._id) && (
        <View style={styles.photoSelectedOverlay}>
          <View style={styles.photoSelectedIcon}>
            <Heart size={16} color="#FFFFFF" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  // Fix: Don't render content until layout is ready
  if (!layoutReady) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Photos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={() => setViewMode(viewMode === 'albums' ? 'all' : 'albums')}
          >
            {viewMode === 'albums' ? (
              <Grid3X3 size={20} color="#FFFFFF" />
            ) : (
              <List size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleAddPhotos}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Upload Progress */}
      {uploadProgress.isUploading && (
        <View style={styles.uploadProgress}>
          <Text style={styles.uploadProgressText}>
            Uploading... {Math.round(uploadProgress.progress)}%
          </Text>
        </View>
      )}

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <TouchableOpacity 
            style={styles.selectionCancelButton}
            onPress={() => {
              setIsSelectionMode(false);
              setSelectedPhotos([]);
            }}
          >
            <Text style={styles.selectionCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.selectionCount}>
            {selectedPhotos.length} selected
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.selectionActionButton}
              onPress={() => handleBulkAction('share')}
            >
              <Share size={20} color="#0e3c67" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.selectionActionButton}
              onPress={() => handleBulkAction('download')}
            >
              <Download size={20} color="#0e3c67" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load photos</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : !gallery ? (
        <View style={styles.emptyContainer}>
          <Camera size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Gallery Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your family gallery to start sharing photos and memories.
          </Text>
          <TouchableOpacity 
            style={styles.createGalleryButton}
            onPress={handleCreateGallery}
            disabled={isCreatingGallery}
          >
            <Text style={styles.createGalleryButtonText}>
              {isCreatingGallery ? 'Creating...' : 'Create Gallery'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'albums' && styles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('albums')}
            >
              <Text style={[
                styles.viewToggleText,
                viewMode === 'albums' && styles.viewToggleTextActive
              ]}>Albums</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === 'all' && styles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode('all')}
            >
              <Text style={[
                styles.viewToggleText,
                viewMode === 'all' && styles.viewToggleTextActive
              ]}>All Photos</Text>
            </TouchableOpacity>
          </View>

          {/* Albums View */}
          {viewMode === 'albums' && (
            <FlatList
              data={albums}
              renderItem={renderAlbumItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              contentContainerStyle={styles.albumsContainer}
              columnWrapperStyle={styles.albumsRow}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#0e3c67"
                  colors={["#0e3c67"]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyAlbumsContainer}>
                  <ImageIcon size={48} color="#9CA3AF" />
                  <Text style={styles.emptyAlbumsTitle}>No Albums Yet</Text>
                  <Text style={styles.emptyAlbumsSubtitle}>
                    Create your first album to organize your family photos.
                  </Text>
                  <TouchableOpacity 
                    style={styles.createAlbumButton}
                    onPress={handleCreateAlbum}
                    disabled={isCreatingAlbum}
                  >
                    <Text style={styles.createAlbumButtonText}>
                      {isCreatingAlbum ? 'Creating...' : 'Create Album'}
                    </Text>
                  </TouchableOpacity>
                </View>
              }
              // Fix: Add these props to ensure proper scrolling
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              getItemLayout={(data, index) => ({
                length: 200, // Approximate item height
                offset: 200 * Math.floor(index / 2),
                index,
              })}
            />
          )}

          {/* All Photos View */}
          {viewMode === 'all' && (
            <FlatList
              data={media}
              renderItem={renderPhotoItem}
              keyExtractor={(item) => item._id}
              numColumns={3}
              contentContainerStyle={styles.photosContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#0e3c67"
                  colors={["#0e3c67"]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyPhotosContainer}>
                  <Camera size={48} color="#9CA3AF" />
                  <Text style={styles.emptyPhotosTitle}>No Photos Yet</Text>
                  <Text style={styles.emptyPhotosSubtitle}>
                    Start capturing and sharing your family moments.
                  </Text>
                  <TouchableOpacity 
                    style={styles.addPhotosButton}
                    onPress={handleAddPhotos}
                  >
                    <Text style={styles.addPhotosButtonText}>Add Photos</Text>
                  </TouchableOpacity>
                </View>
              }
              // Fix: Add these props to ensure proper scrolling
              removeClippedSubviews={false}
              initialNumToRender={15}
              maxToRenderPerBatch={15}
              windowSize={10}
              getItemLayout={(data, index) => ({
                length: PHOTO_ITEM_WIDTH + 4, // Item width + margin
                offset: (PHOTO_ITEM_WIDTH + 4) * Math.floor(index / 3),
                index,
              })}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
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
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadProgress: {
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1E7FF',
  },
  uploadProgressText: {
    fontSize: 14,
    color: '#0e3c67',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectionCancelButton: {
    paddingVertical: 8,
  },
  selectionCancelText: {
    fontSize: 16,
    color: '#0e3c67',
    fontWeight: '500',
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 16,
  },
  selectionActionButton: {
    padding: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: '#0e3c67',
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewToggleTextActive: {
    color: '#FFFFFF',
  },
  // Albums styles
  albumsContainer: {
    padding: 20,
    paddingTop: 20,
  },
  albumsRow: {
    justifyContent: 'space-between',
  },
  albumItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  albumCover: {
    position: 'relative',
    height: 120,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  albumPhotoCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  albumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  albumDate: {
    fontSize: 12,
    color: '#6B7280',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  emptyAlbumsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyAlbumsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyAlbumsSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createAlbumButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createAlbumButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Photos styles
  photosContainer: {
    padding: 15,
    paddingTop: 20,
  },
  photoItem: {
    marginBottom: 4,
    marginHorizontal: 2,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoItemSelected: {
    borderWidth: 3,
    borderColor: '#0e3c67',
  },
  photoImage: {
    width: '100%',
    height: PHOTO_ITEM_WIDTH,
  },
  photoSelectedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  photoSelectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0e3c67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPhotosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyPhotosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyPhotosSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addPhotosButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPhotosButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty states
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createGalleryButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
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
  // Error states
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});