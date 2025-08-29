import { createClient } from '@supabase/supabase-js';

// These environment variables will be available after connecting to Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload image to Supabase Storage
export const uploadImage = async (uri: string, fileName: string, bucket: string = 'profile-images') => {
  try {
    // Convert image URI to blob for upload
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image'
    };
  }
};