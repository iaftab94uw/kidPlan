import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { Gallery, GalleryData, Album, Media, GalleryResponse, CreateGalleryResponse, CreateAlbumRequest, CreateAlbumResponse } from '@/types/gallery';
import { useAuth } from '@/hooks/useAuth';
import { deleteImage } from '@/config/supabase';

interface AddMediaRequest {
  galleryId: string;
  albumId?: string | null;
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

interface UseGalleryReturn {
  gallery: Gallery | null;
  albums: Album[];
  media: Media[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createGallery: () => Promise<boolean>;
  isCreatingGallery: boolean;
  createAlbum: (albumData: CreateAlbumRequest) => Promise<boolean>;
  isCreatingAlbum: boolean;
  addMedia: (mediaData: AddMediaRequest) => Promise<boolean>;
  isAddingMedia: boolean;
  deleteMedia: (mediaId: string, mediaUrl?: string) => Promise<boolean>;
  isDeletingMedia: boolean;
  needsGalleryCreation: boolean;
}

export const useGallery = (token: string): UseGalleryReturn => {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);
  const [needsGalleryCreation, setNeedsGalleryCreation] = useState(false);

  const fetchGallery = useCallback(async (skipAutoCreate = false) => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.FETCH_GALLERY);
      const headers = getAuthHeaders(token);
      
      console.log('=== FETCH GALLERY API ===');
      console.log('URL:', url);
      console.log('Method: GET');
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END FETCH GALLERY API ===');

      if (data.success && data.data) {
        setGallery(data.data.gallery);
        setAlbums(data.data.albums || []);
        setMedia(data.data.media || []);
        setError(null);
        setNeedsGalleryCreation(false);
      } else if (!response.ok && (data.error === 'Gallery not found' || response.status === 404)) {
        // Gallery not found is expected for new users - show create gallery modal
        console.log('Gallery not found - user needs to create gallery');
        setGallery(null);
        setAlbums([]);
        setMedia([]);
        setError(null);
        setNeedsGalleryCreation(true);
      } else if (!response.ok) {
        throw new Error(`Failed to fetch gallery: ${response.status}`);
      } else {
        throw new Error(data.error || 'Failed to fetch gallery');
      }
    } catch (err) {
      let errorMessage = 'An unknown error occurred';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'Server configuration issue. Please contact support.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Error fetching gallery:', err);
      
      // Set fallback empty state for better UX
      setGallery(null);
      setAlbums([]);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createGallery = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError('No authentication token available');
      return false;
    }

    setIsCreatingGallery(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.CREATE_GALLERY);
      const headers = getAuthHeaders(token);
      
      console.log('=== CREATE GALLERY API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to create gallery: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END CREATE GALLERY API ===');

      if (data.success && data.data) {
        setGallery(data.data);
        setNeedsGalleryCreation(false);
        return true;
      } else {
        throw new Error(data.error || 'Failed to create gallery');
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
      
      setError(errorMessage);
      console.error('Error creating gallery:', err);
      return false;
    } finally {
      setIsCreatingGallery(false);
    }
  }, [token]);

  const createAlbum = useCallback(async (albumData: CreateAlbumRequest): Promise<boolean> => {
    if (!token) {
      setError('No authentication token available');
      return false;
    }

    setIsCreatingAlbum(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.CREATE_ALBUM);
      const headers = getAuthHeaders(token);
      
      console.log('=== CREATE ALBUM API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', albumData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(albumData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create album: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END CREATE ALBUM API ===');

      if (data.success && data.data) {
        // Add the new album to the albums list
        setAlbums(prev => [...prev, data.data!]);
        return true;
      } else {
        throw new Error(data.error || 'Failed to create album');
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
      
      setError(errorMessage);
      console.error('Error creating album:', err);
      return false;
    } finally {
      setIsCreatingAlbum(false);
    }
  }, [token]);

  const addMedia = useCallback(async (mediaData: AddMediaRequest): Promise<boolean> => {
    if (!token) {
      setError('No authentication token available');
      return false;
    }

    setIsAddingMedia(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.ADD_MEDIA);
      const headers = getAuthHeaders(token);
      
      console.log('=== ADD MEDIA API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      console.log('Headers:', headers);
      console.log('Body:', mediaData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(mediaData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add media: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END ADD MEDIA API ===');

      if (data.success && data.data) {
        // Add the new media to the media list
        setMedia(prev => [...prev, data.data!]);
        return true;
      } else {
        throw new Error(data.error || 'Failed to add media');
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
      
      setError(errorMessage);
      console.error('Error adding media:', err);
      return false;
    } finally {
      setIsAddingMedia(false);
    }
  }, [token]);

  const deleteMedia = useCallback(async (mediaId: string, mediaUrl?: string): Promise<boolean> => {
    if (!token) {
      setError('No authentication token available');
      return false;
    }

    setIsDeletingMedia(true);
    setError(null);

    try {
      // First, delete from Supabase storage if mediaUrl is provided
      if (mediaUrl) {
        console.log('=== DELETING FROM SUPABASE STORAGE ===');
        console.log('Media URL:', mediaUrl);
        
        const storageResult = await deleteImage(mediaUrl, 'profile-images');
        
        if (!storageResult.success) {
          console.warn('Failed to delete from storage, but continuing with database deletion:', storageResult.error);
          // Don't throw error here - we'll still try to delete from database
        } else {
          console.log('Successfully deleted from Supabase storage');
        }
        console.log('=== END SUPABASE STORAGE DELETE ===');
      }

      // Then delete from database
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.DELETE_MEDIA)}/${mediaId}`;
      const headers = getAuthHeaders(token);
      
      console.log('=== DELETE MEDIA API ===');
      console.log('URL:', url);
      console.log('Method: DELETE');
      console.log('Headers:', headers);
      console.log('Media ID:', mediaId);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete media: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END DELETE MEDIA API ===');

      if (data.success) {
        // Remove the deleted media from the media list
        setMedia(prev => prev.filter(media => media._id !== mediaId));
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete media');
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
      
      setError(errorMessage);
      console.error('Error deleting media:', err);
      return false;
    } finally {
      setIsDeletingMedia(false);
    }
  }, [token]);

  const refetch = useCallback(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    if (token) {
      fetchGallery();
    }
  }, [token, fetchGallery]);

  return {
    gallery,
    albums,
    media,
    loading,
    error,
    refetch,
    createGallery,
    isCreatingGallery,
    createAlbum,
    isCreatingAlbum,
    addMedia,
    isAddingMedia,
    deleteMedia,
    isDeletingMedia,
    needsGalleryCreation,
  };
};
