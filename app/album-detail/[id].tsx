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
  TextInput,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Grid2x2 as Grid, List, Plus, Camera, Upload, X, Edit3, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGallery } from '@/hooks/useGallery';
import { useImageUpload } from '@/hooks/useImageUpload';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { AlbumDetailResponse, AlbumDetailData } from '@/types/gallery';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

export default function AlbumDetail() {
  const router = useRouter();
  const { id: albumId } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { gallery, albums: apiAlbums, media: apiMedia, loading: galleryLoading, error: galleryError, addMedia, isAddingMedia, deleteMedia, isDeletingMedia, refetch } = useGallery(token || '');
  const { uploadProgress, selectAndUploadImage, resetUpload } = useImageUpload();
  const insets = useSafeAreaInsets();
  
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
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    coverImage: ''
  });
  const [editCoverImage, setEditCoverImage] = useState<string>('');
  const [editUploadProgress, setEditUploadProgress] = useState({
    isUploading: false,
    progress: 0,
    error: null as string | null
  });

  // Handle photo preview
  const handlePhotoPreview = (photo: any) => {
    setSelectedPhoto(photo);
    setShowPhotoPreviewModal(true);
  };

  // Handle cover image selection for edit modal
  const handleSelectCoverImage = async () => {
    try {
      setEditUploadProgress({ isUploading: true, progress: 0, error: null });
      
      const imageUrl = await selectAndUploadImage();
      if (imageUrl) {
        setEditCoverImage(imageUrl);
        setEditForm(prev => ({ ...prev, coverImage: imageUrl }));
      }
      
      setEditUploadProgress({ isUploading: false, progress: 0, error: null });
    } catch (error) {
      console.error('Error selecting cover image:', error);
      setEditUploadProgress({ 
        isUploading: false, 
        progress: 0, 
        error: 'Failed to select image. Please try again.' 
      });
    }
  };

  // Handle album update
  const handleUpdateAlbum = async () => {
    if (!token || !albumId) {
      Alert.alert('Error', 'No authentication token or album ID available');
      return;
    }

    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Album name is required');
      return;
    }

    try {
      const url = getApiUrl(`${API_CONFIG.ENDPOINTS.UPDATE_ALBUM}/${albumId}`);
      const headers = getAuthHeaders(token);
      
      const updateData = {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        coverImage: editForm.coverImage.trim()
      };

      console.log('=== UPDATING ALBUM ===');
      console.log('URL:', url);
      console.log('Data:', updateData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (response.ok && data.success) {
        setShowEditModal(false);
        setEditForm({ name: '', description: '', coverImage: '' });
        
        // Update local albumDetail state immediately for instant UI feedback
        if (albumDetail) {
          setAlbumDetail({
            ...albumDetail,
            album: {
              ...albumDetail.album,
              name: editForm.name.trim(),
              description: editForm.description.trim(),
              coverImage: editForm.coverImage.trim(),
              updatedAt: new Date().toISOString()
            }
          });
        }
        
        // Refresh album data from server to ensure consistency
        await refetch();
        await fetchAlbumDetail();
        
        Alert.alert('Success', 'Album updated successfully!');
      } else {
        Alert.alert('Error', data.error || 'Failed to update album');
      }
    } catch (error) {
      console.error('Error updating album:', error);
      Alert.alert('Error', 'Failed to update album. Please try again.');
    }
  };

  // Handle album deletion
  const handleDeleteAlbum = async () => {
    if (!token || !albumId) {
      Alert.alert('Error', 'No authentication token or album ID available');
      return;
    }

    try {
      const url = getApiUrl(`${API_CONFIG.ENDPOINTS.DELETE_ALBUM}/${albumId}`);
      const headers = getAuthHeaders(token);
      
      console.log('=== DELETING ALBUM ===');
      console.log('URL:', url);
      console.log('Album ID:', albumId);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (response.ok && data.success) {
        // Close the edit modal
        setShowEditModal(false);
        
        // Show success message
        Alert.alert('Success', 'Album deleted successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate back to photos tab after successful deletion
              router.back();
            }
          }
        ]);
        
        // Refresh gallery data to remove the deleted album
        await refetch();
      } else {
        Alert.alert('Error', data.error || 'Failed to delete album');
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      Alert.alert('Error', 'Failed to delete album. Please try again.');
    }
  };

  // Handle photo download
  const handleDownloadPhoto = async (photo: any) => {
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
  const handleSharePhoto = async (photo: any) => {
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
  const handleDeletePhoto = async (photo: any) => {
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
                Alert.alert('Success', 'Photo deleted successfully!', [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Close the photo preview modal
                      setShowPhotoPreviewModal(false);
                      setSelectedPhoto(null);
                      // Refresh album data to update the UI
                      if (albumId) {
                        fetchAlbumDetail();
                      }
                    }
                  }
                ]);
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
        
        // Refresh album data to show the new photo immediately
        await refetch();
        await fetchAlbumDetail();
        
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
    // Calculate photo size: screen width - horizontal padding, divided by 3
    // justifyContent: 'space-between' will handle spacing automatically
    const horizontalPadding = 40; // 20px padding on each side
    const photoSize = (width - horizontalPadding) / 3;

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

    // Always use 3-column grid for consistent sizing regardless of photo count

    return (
      <FlatList
        data={albumMedia}
        numColumns={3}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.photosGrid}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity 
            style={styles.photoCard}
            onPress={() => handlePhotoPreview(item)}
            activeOpacity={0.8}
            delayPressIn={0}
            delayPressOut={0}
          >
            <Image 
              source={{ uri: item.url }} 
              style={styles.photoImage}
              resizeMode="cover"
            />
            {item.caption && (
              <View style={styles.photoOverlay}>
                <Text style={styles.photoCaption} numberOfLines={1}>
                  {item.caption}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
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
            onPress={() => handlePhotoPreview(media)}
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
            style={styles.editButton}
            onPress={() => {
              const currentCoverImage = albumInfo?.coverImage || 'https://dummyjson.com/image/150';
              setEditForm({
                name: albumInfo?.name || '',
                description: albumInfo?.description || '',
                coverImage: currentCoverImage
              });
              setEditCoverImage(currentCoverImage);
              setEditUploadProgress({ isUploading: false, progress: 0, error: null });
              setShowEditModal(true);
            }}
          >
            <Edit3 size={20} color="#6B7280" />
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
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="formSheet"
        statusBarTranslucent={false}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Modern Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity 
                onPress={() => setShowUploadModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Add Photo to Album</Text>
                <Text style={styles.modalSubtitle}>Upload photos to this album</Text>
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
                      onPress={handleSelectMediaPhoto}
                    >
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Caption Section */}
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Caption (Optional)</Text>
                <View style={styles.inputGroup}>
                  <View style={styles.textAreaContainer}>
                    <TextInput
                      style={styles.modernTextArea}
                      value={newMedia.caption}
                      onChangeText={(text) => setNewMedia(prev => ({ ...prev, caption: text }))}
                      placeholder="Add a caption for this photo..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                    />
                    <Text style={styles.characterCount}>{newMedia.caption.length}/200</Text>
                  </View>
                </View>
              </View>

              {/* Tips Section */}
              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>💡 Tips</Text>
                <View style={styles.tipsList}>
                  <Text style={styles.tipItem}>• Add meaningful captions to make photos easier to find</Text>
                  <Text style={styles.tipItem}>• Photos are automatically organised by date</Text>
                  <Text style={styles.tipItem}>• You can always edit captions later</Text>
                </View>
              </View>
            </View>
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

      {/* Edit Album Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="formSheet"
        statusBarTranslucent={false}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Modern Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity 
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Edit Album</Text>
                <Text style={styles.modalSubtitle}>Update your album details</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.createButton,
                  (editUploadProgress.isUploading || !editForm.name.trim()) && styles.createButtonDisabled
                ]}
                onPress={handleUpdateAlbum}
                disabled={editUploadProgress.isUploading || !editForm.name.trim()}
              >
                {editUploadProgress.isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* Cover Image Section */}
              <View style={[styles.coverImageSection, {marginTop: 10}]}>
                <Text style={styles.sectionTitle}>Cover Photo</Text>
                
                {editCoverImage && editCoverImage.trim() !== '' && !editUploadProgress.isUploading ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: editCoverImage }} 
                      style={styles.coverImagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.floatingChangeButton}
                      onPress={handleSelectCoverImage}
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
                    onPress={handleSelectCoverImage}
                    disabled={editUploadProgress.isUploading}
                  >
                    <View style={styles.selectPhotoIconContainer}>
                      <Camera size={32} color="#0e3c67" />
                    </View>
                    <Text style={styles.selectPhotoTitle}>
                      {editUploadProgress.isUploading ? 'Uploading...' : 'Add Cover Photo'}
                    </Text>
                    <Text style={styles.selectPhotoSubtitle}>
                      Tap to select from gallery
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Upload Progress */}
                {editUploadProgress.isUploading && (
                  <View style={styles.uploadProgressCard}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>Uploading Photo</Text>
                      <Text style={styles.progressPercentage}>{Math.round(editUploadProgress.progress)}%</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${editUploadProgress.progress}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )}

                {/* Upload Error */}
                {editUploadProgress.error && (
                  <View style={styles.uploadErrorCard}>
                    <Text style={styles.uploadErrorTitle}>Upload Failed</Text>
                    <Text style={styles.uploadErrorText}>{editUploadProgress.error}</Text>
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={handleSelectCoverImage}
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
                      value={editForm.name}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                      placeholder="Enter album name"
                      placeholderTextColor="#9CA3AF"
                      maxLength={50}
                    />
                    <Text style={styles.characterCount}>{editForm.name.length}/50</Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <View style={styles.textAreaContainer}>
                    <TextInput
                      style={styles.modernTextArea}
                      value={editForm.description}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                      placeholder="Tell the story behind this album..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      maxLength={200}
                    />
                    <Text style={styles.characterCount}>{editForm.description.length}/200</Text>
                  </View>
                </View>
              </View>

              {/* Album Stats Section */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Album Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{albumMedia.length}</Text>
                    <Text style={styles.statLabel}>Photos</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {albumInfo?.createdAt ? new Date(albumInfo.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                    </Text>
                    <Text style={styles.statLabel}>Created</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                      {albumInfo?.updatedAt ? new Date(albumInfo.updatedAt).toLocaleDateString('en-GB') : 'N/A'}
                    </Text>
                    <Text style={styles.statLabel}>Updated</Text>
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

              {/* Album Actions Section */}
              <View style={styles.albumActionsSection}>
                <TouchableOpacity 
                  style={styles.deleteAlbumButton}
                  onPress={() => {
                    Alert.alert(
                      'Delete Album',
                      `Are you sure you want to delete "${albumInfo?.name}"? This will permanently delete the album and all ${albumMedia.length} photos in it. This action cannot be undone.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: handleDeleteAlbum }
                      ]
                    );
                  }}
                >
                  <Text style={styles.deleteAlbumButtonText}>Delete Album</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    marginBottom: 16,
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
  photosGrid: {
    paddingHorizontal: 20,
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
    padding: 8,
  },
  photoCaption: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
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
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Edit Modal Styles
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  
  // Modern Modal Styles (matching create album modal)
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
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
  
  // Form Container
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  progressText: {
    fontSize: 14,
    color: '#0e3c67',
    marginLeft: 8,
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
  uploadErrorText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 12,
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
  
  // Stats Section
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
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
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
  
  // Album Actions Section
  albumActionsSection: {
    marginVertical: 32,
  },
  deleteAlbumButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteAlbumButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
