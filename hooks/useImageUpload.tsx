import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, testSupabaseConnection } from '@/config/supabase';

interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UseImageUploadReturn {
  uploadProgress: UploadProgress;
  selectAndUploadImage: () => Promise<string | null>;
  uploadImageFromUri: (uri: string) => Promise<string | null>;
  resetUpload: () => void;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const resetUpload = useCallback(() => {
    setUploadProgress({
      isUploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  const uploadImageFromUri = useCallback(async (uri: string): Promise<string | null> => {
    setUploadProgress({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      // Test Supabase connection first
      console.log('Testing Supabase connection before upload...');
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) {
        throw new Error('Supabase connection failed. Please check your internet connection and try again.');
      }

      // Simulate progress updates during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 20, 90),
        }));
      }, 200);

      // Generate a unique filename for album covers
      const timestamp = Date.now();
      const fileName = `album_cover_${timestamp}.jpg`;
      
      // Upload to Supabase Storage in the 'albums' bucket
      const result = await uploadImage(uri, fileName, 'albums');

      clearInterval(progressInterval);

      if (result.success && result.url) {
        setUploadProgress({
          isUploading: false,
          progress: 100,
          error: null,
        });
        
        // Reset progress after a short delay
        setTimeout(() => {
          resetUpload();
        }, 1000);

        return result.url;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });
      console.error('Image upload error:', error);
      return null;
    }
  }, [resetUpload]);

  const selectAndUploadImage = useCallback(async (): Promise<string | null> => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setUploadProgress({
          isUploading: false,
          progress: 0,
          error: 'Permission needed to access photo library',
        });
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for album covers
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      // Upload the selected image
      return await uploadImageFromUri(result.assets[0].uri);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to select image';
      setUploadProgress({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });
      console.error('Image selection error:', error);
      return null;
    }
  }, [uploadImageFromUri]);

  return {
    uploadProgress,
    selectAndUploadImage,
    uploadImageFromUri,
    resetUpload,
  };
};
