import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Grid2x2 as Grid, List, Filter, FolderPlus, Camera } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useGallery } from '@/hooks/useGallery';
import { Album, Media } from '@/types/gallery';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/theme/colors';

const { width } = Dimensions.get('window');

export default function Gallery() {
  const router = useRouter();
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const { gallery, albums: apiAlbums, media: apiMedia, loading: galleryLoading, error: galleryError, refetch } = useGallery(token || '');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refetch();
  }, []);

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

  // Album Card Component
  const AlbumCard = ({ album }: { album: Album }) => {
    if (!album) {
      return null;
    }
    
    return (
      <View style={styles.albumCardContainer}>
        <TouchableOpacity 
          style={styles.albumCard}
          onPress={() => router.push(`/album-detail/${album._id}`)}
          activeOpacity={0.8}
        >
          <Image source={{ uri: album.coverImage || 'https://dummyjson.com/image/150' }} style={styles.albumCover} />
          <View style={[styles.albumColorBar, { backgroundColor: '#0e3c67' }]} />
          <Text style={styles.albumName}>{album.name}</Text>
          <Text style={styles.albumCount}>Album</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Photo Card Component
  const PhotoCard = ({ media }: { media: Media }) => {
    const photoSize = (width - 60) / 3;

    return (
      <TouchableOpacity 
        style={[styles.photoGridItem, { width: photoSize, height: photoSize }]}
        onPress={() => {
          console.log('Photo tapped:', media.caption || 'Photo');
          // Navigate to photo detail when implemented
        }}
        activeOpacity={0.8}
      >
        <Image source={{ uri: media.url }} style={styles.photoGridImage} />
        <View style={styles.photoOverlay}>
          <Text style={styles.photoTitle}>{media.caption || 'Photo'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPhotoGrid = () => {
    if (galleryLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0e3c67" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      );
    }

    if (apiMedia.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Camera size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptySubtitle}>Upload your first photo to get started</Text>
        </View>
      );
    }

    return (
      <View style={styles.photoGrid}>
        {apiMedia.map((media) => (
          <PhotoCard key={media._id} media={media} />
        ))}
      </View>
    );
  };

  const renderPhotoList = () => {
    if (galleryLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0e3c67" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      );
    }

    if (apiMedia.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Camera size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptySubtitle}>Upload your first photo to get started</Text>
        </View>
      );
    }

    return (
      <View style={styles.photoList}>
        {apiMedia.map((media) => {
          const album = apiAlbums.find(album => album._id === media.albumId);
          return (
            <TouchableOpacity 
              key={media._id} 
              style={styles.photoListItem}
              onPress={() => {
                console.log('Photo list item tapped:', media.caption || 'Photo');
                // Navigate to photo detail when implemented
              }}
              activeOpacity={0.8}
            >
              <Image source={{ uri: media.url }} style={styles.photoListImage} />
              <View style={styles.photoListContent}>
                <Text style={styles.photoListTitle}>{media.caption || 'Photo'}</Text>
                <Text style={styles.photoListAlbum}>{album?.name || 'Gallery'}</Text>
                <Text style={styles.photoListDate}>
                  {new Date(media.createdAt).toLocaleDateString('en-GB')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Show loading state while checking gallery
  if (galleryLoading) {
    return (
                              <LinearGradient
                              colors={COLORS.gradientBackground as any}
                              style={styles.container}
                              locations={[0, 0.5, 1]}
                            >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0e3c67" />
          <Text style={styles.loadingText}>Loading gallery...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Show error state if there's an error
  if (galleryError && galleryError !== 'Gallery not found') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {galleryError}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gallery</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.viewModeButton}
            onPress={() => {
              const newMode = viewMode === 'grid' ? 'list' : 'grid';
              setViewMode(newMode);
            }}
          >
            {viewMode === 'grid' ? (
              <List size={20} color="#FFFFFF" />
            ) : (
              <Grid size={20} color="#FFFFFF" />
            )}
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
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{apiMedia.length}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{apiAlbums.length}</Text>
            <Text style={styles.statLabel}>Albums</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {apiMedia.filter(media => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(media.createdAt) >= oneWeekAgo;
              }).length}
            </Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Albums Section */}
        <View style={styles.albumsSection}>
          <Text style={styles.sectionTitle}>Albums ({apiAlbums.length})</Text>
          {galleryLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0e3c67" />
              <Text style={styles.loadingText}>Loading albums...</Text>
            </View>
          ) : apiAlbums.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FolderPlus size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No albums yet</Text>
              <Text style={styles.emptySubtitle}>Create your first album to organise your photos</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.albumsScroll}
              contentContainerStyle={styles.albumsScrollContent}
            >
              {apiAlbums.map((album) => (
                <AlbumCard key={album._id} album={album} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>All Photos ({apiMedia.length})</Text>
          {viewMode === 'grid' ? renderPhotoGrid() : renderPhotoList()}
        </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
  albumsScrollContent: {
    paddingRight: 20,
    flexDirection: 'row',
  },
  albumCardContainer: {
    marginRight: 12,
  },
  albumCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 60) / 3,
    borderRadius: 12,
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
    marginRight: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 40,
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
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
