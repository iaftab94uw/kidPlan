import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { Gallery, GalleryData, Album, Media, GalleryResponse, CreateGalleryResponse, CreateAlbumRequest, CreateAlbumResponse } from '@/types/gallery';

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

  const fetchGallery = useCallback(async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.FETCH_GALLERY);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        // If 404, treat as "Gallery not found" (expected for new users)
        if (response.status === 404) {
          console.log('Gallery not found (404) - this is expected for new users');
          setGallery(null);
          setAlbums([]);
          setMedia([]);
          setError(null); // Don't treat this as an error
          return;
        }
        
        const errorText = await response.text();
        console.log('Gallery fetch error response:', errorText);
        throw new Error(`Failed to fetch gallery: ${response.status} - ${errorText}`);
      }

      const data: GalleryResponse = await response.json();

      if (data.success && data.data) {
        setGallery(data.data.gallery);
        setAlbums(data.data.albums || []);
        setMedia(data.data.media || []);
      } else {
        throw new Error(data.error || 'Failed to fetch gallery');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching gallery:', err);
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
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Gallery create error response:', errorText);
        throw new Error(`Failed to create gallery: ${response.status} - ${errorText}`);
      }

      const data: CreateGalleryResponse = await response.json();

      if (data.success && data.data) {
        setGallery(data.data);
        return true;
      } else {
        throw new Error(data.error || 'Failed to create gallery');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
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
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(albumData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Album create error response:', errorText);
        throw new Error(`Failed to create album: ${response.status} - ${errorText}`);
      }

      const data: CreateAlbumResponse = await response.json();

      if (data.success && data.data) {
        // Add the new album to the albums list
        setAlbums(prev => [...prev, data.data!]);
        return true;
      } else {
        throw new Error(data.error || 'Failed to create album');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error creating album:', err);
      return false;
    } finally {
      setIsCreatingAlbum(false);
    }
  }, [token]);

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
