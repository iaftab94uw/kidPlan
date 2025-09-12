import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';

// Add Buffer for base64 conversion (like in your working code)
global.Buffer = require('buffer').Buffer;

// These environment variables will be available after connecting to Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'SET' : 'NOT SET');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful, buckets:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// Helper function to upload image to Supabase Storage (based on working implementation)
export const uploadImage = async (uri: string, fileName: string, bucket: string = 'profile-images') => {
  try {
    console.log('Starting upload for URI:', uri);
    
    // Read the image as base64 using FileSystem (this is the key difference)
    const base64Image = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('Base64 image length:', base64Image.length);
    
    if (!base64Image || base64Image.length === 0) {
      throw new Error('Failed to read image as base64');
    }
    
    // Convert base64 to ArrayBuffer (this is how your working code does it)
    const arrayBuffer = Buffer.from(base64Image, 'base64');
    
    console.log('ArrayBuffer size:', arrayBuffer.length, 'bytes');
    
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    console.log('Uploading to Supabase:', {
      bucket,
      fileName: uniqueFileName,
      arrayBufferSize: arrayBuffer.length
    });

    // Upload to Supabase Storage using update method (like your working code)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, arrayBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
      throw error;
    }

    console.log('Upload successful, data:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);

    console.log('Public URL:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error: any) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error?.message || 'Failed to upload image'
    };
  }
};