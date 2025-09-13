import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Add Buffer for base64 conversion (like in your working code)
global.Buffer = require('buffer').Buffer;

// These environment variables will be available after connecting to Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'SET' : 'NOT SET');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key available:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing');
      return false;
    }
    
    // Test with a simple query with timeout
    const testPromise = supabase.storage.listBuckets();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
    
    const { data, error } = await Promise.race([testPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      if (error.message?.includes('Network request failed')) {
        console.error('Network connection issue detected');
      }
      return false;
    }
    console.log('Supabase connection successful, buckets:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('Connection timeout - check internet connection');
    }
    return false;
  }
};

// Helper function to upload image to Supabase Storage (based on working implementation)
export const uploadImage = async (uri: string, fileName: string, bucket: string = 'profile-images') => {
  try {
    console.log('Starting upload for URI:', uri);
    
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }
    
    let arrayBuffer: ArrayBuffer;
    
    if (Platform.OS === 'web') {
      // For web platform, use fetch to get the image data
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error('Failed to fetch image data');
      }
      arrayBuffer = await response.arrayBuffer();
      console.log('Web ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
    } else {
      // For native platforms, use FileSystem
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('Base64 image length:', base64Image.length);
      
      if (!base64Image || base64Image.length === 0) {
        throw new Error('Failed to read image as base64');
      }
      
      // Convert base64 to ArrayBuffer
      arrayBuffer = Buffer.from(base64Image, 'base64');
      console.log('Native ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
    }
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('Failed to read image data');
    }
    
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    console.log('Uploading to Supabase:', {
      bucket,
      fileName: uniqueFileName,
      arrayBufferSize: arrayBuffer.byteLength,
      supabaseUrl: supabaseUrl
    });

    // Upload to Supabase Storage with timeout
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(uniqueFileName, arrayBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout - please check your internet connection')), 30000);
    });

    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
      
      // Provide more specific error messages
      if (error.message?.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Upload timed out. Please check your internet connection and try again.');
      } else {
        throw new Error(error.message || 'Upload failed. Please try again.');
      }
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
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to upload image';
    
    if (error.message?.includes('Network request failed')) {
      errorMessage = 'Network connection failed. Please check your internet connection and try again.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Upload timed out. Please check your internet connection and try again.';
    } else if (error.message?.includes('Supabase configuration')) {
      errorMessage = 'Upload service configuration error. Please contact support.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};