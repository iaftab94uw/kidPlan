import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { Gallery, GalleryData, Album, Media, GalleryResponse, CreateGalleryResponse, CreateAlbumRequest, CreateAlbumResponse } from '@/types/gallery';
import { makeAuthenticatedApiCall } from '@/utils/apiUtils';
import { useAuth } from '@/hooks/useAuth';

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
}

export const useGallery = (token: string): UseGalleryReturn => {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGallery, setIsCreatingGallery] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const { setUser, setToken } = useAuth();

  const fetchGallery = useCallback(async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.FETCH_GALLERY);
      
      const data = await makeAuthenticatedApiCall(
        url,
        {
          method: 'GET',
        },
        token,
        setUser,
        setToken
      );

      if (data.success && data.data) {
        setGallery(data.data.gallery);
        setAlbums(data.data.albums || []);
        setMedia(data.data.media || []);
      } else if (data.error === 'Gallery not found' || data.error?.includes('404')) {
        // Gallery not found is expected for new users
        console.log('Gallery not found - this is expected for new users');
        setGallery(null);
        setAlbums([]);
        setMedia([]);
        setError(null);
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
  }, [token, setUser, setToken]);

  const createGallery = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError('No authentication token available');
      return false;
    }

    setIsCreatingGallery(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.CREATE_GALLERY);
      
      const data = await makeAuthenticatedApiCall(
        url,
        {
          method: 'POST',
        },
        token,
        setUser,
        setToken
      );

      if (data.success && data.data) {
        setGallery(data.data);
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
  }, [token, setUser, setToken]);

  const createAlbum = useCallback(async (albumData: CreateAlbumRequest): Promise<boolean> => {
    if (!token) {
      setError('No authentication token available');
      return false;
    }

    setIsCreatingAlbum(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.CREATE_ALBUM);
      
      const data = await makeAuthenticatedApiCall(
        url,
        {
          method: 'POST',
          body: JSON.stringify(albumData),
        },
        token,
        setUser,
        setToken
      );

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
  }, [token, setUser, setToken]);

  const refetch = () => {
    fetchGallery();
  };

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
  };
};
