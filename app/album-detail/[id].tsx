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
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Grid2x2 as Grid, List, Plus, Camera, Upload } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGallery } from '@/hooks/useGallery';
import { useImageUpload } from '@/hooks/useImageUpload';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { AlbumDetailResponse, AlbumDetailData } from '@/types/gallery';

const { width } = Dimensions.get('window');

export default function AlbumDetail() {
  const router = useRouter();
  const { id: albumId } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { gallery, albums: apiAlbums, media: apiMedia, loading: galleryLoading, error: galleryError, addMedia, isAddingMedia, refetch } = useGallery(token || '');
  const { uploadProgress, selectAndUploadImage, resetUpload } = useImageUpload();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newMedia, setNewMedia] = useState({
    caption: '',
    imageUrl: ''
  });
  const [albumDetail, setAlbumDetail] = useState<AlbumDetailData | null>(null);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [albumError, setAlbumError] = useState<string | null>(null);

  // Find the current album
  const currentAlbum = apiAlbums.find(album => album._id === albumId);
  
  // Use album detail data if available, otherwise fallback to filtered media
  const albumMedia = albumDetail?.mediaList || (apiMedia || []).filter(media => media.albumId === albumId);
  const albumInfo = albumDetail?.album || currentAlbum;

  // Fetch album details
  const fetchAlbumDetail = async () => {
    if (!token || !albumId) {
      setAlbumError('No authentication token or album ID available');
      return;
    }

    setAlbumLoading(true);
    setAlbumError(null);

    try {
      const url = getApiUrl(`${API_CONFIG.ENDPOINTS.FETCH_ALBUM_DETAIL}/${albumId}`);
      const headers = getAuthHeaders(token);
      
      console.log('=== FETCH ALBUM DETAIL ===');
      console.log('URL:', url);
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch album detail: ${response.status}`);
      }

      const data: AlbumDetailResponse = await response.json();
      
      console.log('Album detail response:', data);
      console.log('=== END FETCH ALBUM DETAIL ===');

      if (data.success && data.data) {
        setAlbumDetail(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch album detail');
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setAlbumError(errorMessage);
      console.error('Error fetching album detail:', err);
    } finally {
      setAlbumLoading(false);
    }
  };

  // Fetch album details on mount
  useEffect(() => {
    if (albumId) {
      fetchAlbumDetail();
    }
  }, [albumId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      await fetchAlbumDetail(); // Also refresh album details
    } catch (error) {
      console.error('Error refreshing album:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSelectMediaPhoto = async () => {
    try {
      console.log('=== SELECTING MEDIA PHOTO ===');
      console.log('Album ID:', albumId);
      console.log('Current album:', currentAlbum?.name);
      const imageUrl = await selectAndUploadImage();
      if (imageUrl) {
        console.log('Image selected successfully:', imageUrl);
        setNewMedia(prev => ({ ...prev, imageUrl }));
      } else {
        console.log('No image selected');
      }
    } catch (error) {
      console.error('Error selecting media photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handleUploadMedia = async () => {
    console.log('=== UPLOADING MEDIA TO ALBUM ===');
    console.log('Gallery:', gallery?._id);
    console.log('Album ID:', albumId);
    console.log('Image URL:', newMedia.imageUrl);
    console.log('Caption:', newMedia.caption);
    
    if (!gallery || !newMedia.imageUrl.trim()) {
      Alert.alert('Error', 'Please select a photo to upload');
      return;
    }

    if (uploadProgress.isUploading) {
      Alert.alert('Please Wait', 'Please wait for the photo upload to complete.');
      return;
    }

    try {
      const mediaData = {
        galleryId: gallery._id,
        albumId: albumId,
        type: 'image' as const,
        url: newMedia.imageUrl,
        caption: newMedia.caption.trim()
      };

      console.log('Media data to upload:', mediaData);
      const success = await addMedia(mediaData);
      console.log('Upload success:', success);
      
      if (success) {
        setShowUploadModal(false);
        setNewMedia({ caption: '', imageUrl: '' });
        resetUpload();
        Alert.alert('Success', 'Photo uploaded to album successfully!');
      } else {
        Alert.alert('Error', 'Failed to upload photo. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  const renderPhotoGrid = () => {
    const photoSize = (width - 60) / 3;

    if (albumMedia.length === 0) {
      return (
        <View style={styles.noPhotosCard}>
          <Camera size={32} color="#9CA3AF" />
          <Text style={styles.noPhotosTitle}>No photos in this album</Text>
          <Text style={styles.noPhotosSubtitle}>Add your first photo to this album</Text>
          <TouchableOpacity 
            style={styles.uploadPhotoButton}
            onPress={() => {
              console.log('=== EMPTY STATE UPLOAD BUTTON CLICKED (GRID) ===');
              console.log('Album ID:', albumId);
              setShowUploadModal(true);
            }}
          >
            <Text style={styles.uploadPhotoButtonText}>Add Photo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.photoGrid}>
        {albumMedia.map((media) => (
          <TouchableOpacity 
            key={media._id} 
            style={[styles.photoGridItem, { width: photoSize, height: photoSize }]}
            onPress={() => Alert.alert('Coming Soon', 'Photo detail screen will be implemented soon!')}
          >
            <Image source={{ uri: media.url }} style={styles.photoGridImage} />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoTitle}>{media.caption || 'Photo'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPhotoList = () => {
    if (albumMedia.length === 0) {
      return (
        <View style={styles.noPhotosCard}>
          <Camera size={32} color="#9CA3AF" />
          <Text style={styles.noPhotosTitle}>No photos in this album</Text>
          <Text style={styles.noPhotosSubtitle}>Add your first photo to this album</Text>
          <TouchableOpacity 
            style={styles.uploadPhotoButton}
            onPress={() => {
              console.log('=== EMPTY STATE UPLOAD BUTTON CLICKED (GRID) ===');
              console.log('Album ID:', albumId);
              setShowUploadModal(true);
            }}
          >
            <Text style={styles.uploadPhotoButtonText}>Add Photo</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.photoList}>
        {albumMedia.map((media) => (
          <TouchableOpacity 
            key={media._id} 
            style={styles.photoListItem}
            onPress={() => Alert.alert('Coming Soon', 'Photo detail screen will be implemented soon!')}
          >
            <Image source={{ uri: media.url }} style={styles.photoListImage} />
            <View style={styles.photoListContent}>
              <Text style={styles.photoListTitle}>{media.caption || 'Photo'}</Text>
              <Text style={styles.photoListDate}>
                {new Date(media.createdAt).toLocaleDateString('en-GB')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Show loading state
  if (galleryLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0e3c67" />
          <Text style={styles.loadingText}>Loading album...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state
  if (albumLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0e3c67" />
          <Text style={styles.loadingText}>Loading album...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (albumError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error loading album</Text>
          <Text style={styles.errorSubtitle}>{albumError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchAlbumDetail()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if album not found
  if (!albumInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Album not found</Text>
          <Text style={styles.errorSubtitle}>This album may have been deleted or moved.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{albumInfo.name}</Text>
          <Text style={styles.headerSubtitle}>{albumMedia.length} photos</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List size={20} color="#6B7280" /> : <Grid size={20} color="#6B7280" />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              console.log('=== OPENING UPLOAD MODAL ===');
              console.log('Album ID:', albumId);
              console.log('Album name:', albumInfo?.name);
              setShowUploadModal(true);
            }}
          >
            <Plus size={20} color="#FFFFFF" />
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
      >
        {/* Album Info */}
        <View style={styles.albumInfo}>
          <View style={styles.albumCoverContainer}>
            <Image 
              source={{ uri: albumInfo.coverImage || 'https://dummyjson.com/image/150' }} 
              style={styles.albumCover}
            />
          </View>
          <View style={styles.albumDetails}>
            <Text style={styles.albumName}>{albumInfo.name}</Text>
            {albumInfo.description && (
              <Text style={styles.albumDescription}>{albumInfo.description}</Text>
            )}
            <Text style={styles.albumStats}>
              {albumMedia.length} photos • Created {new Date(albumInfo.createdAt).toLocaleDateString('en-GB')}
            </Text>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <View style={styles.photosHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => {
                console.log('=== ADD PHOTOS BUTTON CLICKED ===');
                console.log('Album ID:', albumId);
                setShowUploadModal(true);
              }}
            >
              <Upload size={16} color="#0e3c67" />
              <Text style={styles.uploadButtonText}>Add Photos</Text>
            </TouchableOpacity>
          </View>
          
          {viewMode === 'grid' ? renderPhotoGrid() : renderPhotoList()}
        </View>
      </ScrollView>

      {/* Upload Modal */}
      {showUploadModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Photo to Album</Text>
              <TouchableOpacity 
                onPress={() => setShowUploadModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Photo Selection */}
              <View style={styles.photoSelectionSection}>
                <Text style={styles.sectionTitle}>Select Photo</Text>
                
                {newMedia.imageUrl && !uploadProgress.isUploading ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: newMedia.imageUrl }} 
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.changePhotoButton}
                      onPress={handleSelectMediaPhoto}
                    >
                      <Camera size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.selectPhotoCard}
                    onPress={handleSelectMediaPhoto}
                    disabled={uploadProgress.isUploading}
                  >
                    <Camera size={32} color="#0e3c67" />
                    <Text style={styles.selectPhotoTitle}>
                      {uploadProgress.isUploading ? 'Uploading...' : 'Select Photo'}
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
              </View>

              {/* Caption Section */}
              <View style={styles.captionSection}>
                <Text style={styles.sectionTitle}>Caption (Optional)</Text>
                <TextInput
                  style={styles.captionInput}
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

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowUploadModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.uploadActionButton,
                    (isAddingMedia || uploadProgress.isUploading || !newMedia.imageUrl.trim()) && styles.uploadActionButtonDisabled
                  ]}
                  onPress={handleUploadMedia}
                  disabled={isAddingMedia || uploadProgress.isUploading || !newMedia.imageUrl.trim()}
                >
                  {(isAddingMedia || uploadProgress.isUploading) ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.uploadActionButtonText}>Upload to Album</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#0e3c67',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumInfo: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  albumCoverContainer: {
    marginRight: 16,
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  albumDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  albumName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  albumDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  albumStats: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  photosSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  photosHeader: {
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#0e3c67',
    marginLeft: 4,
    fontWeight: '500',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoGridItem: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  photoListImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  photoListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  photoListTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  photoListDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  noPhotosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noPhotosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noPhotosSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  uploadPhotoButton: {
    backgroundColor: '#0e3c67',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadPhotoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  modalContent: {
    padding: 20,
  },
  photoSelectionSection: {
    marginBottom: 24,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectPhotoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  selectPhotoTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  uploadProgressCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#0e3c67',
    marginLeft: 8,
  },
  captionSection: {
    marginBottom: 24,
  },
  captionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  uploadActionButton: {
    flex: 1,
    backgroundColor: '#0e3c67',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadActionButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  uploadActionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
