import { useState, useEffect } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';

interface FamilyMember {
  _id: string;
  name: string;
  role: string;
  age?: string;
  profilePhoto?: string;
  favoriteColor?: string;
}

interface FamilyData {
  _id: string;
  familyName: string;
  children?: FamilyMember[];
  coParents?: FamilyMember[];
  others?: FamilyMember[];
}

interface FamilyDetailsResponse {
  success: boolean;
  message: string;
  data: FamilyData;
}

interface UseFamilyDetailsReturn {
  familyData: FamilyData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getAllFamilyMembers: () => FamilyMember[];
}

export const useFamilyDetails = (token: string): UseFamilyDetailsReturn => {
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFamilyDetails = async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = getApiUrl(API_CONFIG.ENDPOINTS.FAMILY_DETAILS);
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch family details: ${response.status}`);
      }

      const data: FamilyDetailsResponse = await response.json();
      
      if (data.success) {
        setFamilyData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch family details');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching family details:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchFamilyDetails();
  };

  const getAllFamilyMembers = (): FamilyMember[] => {
    if (!familyData) return [];
    
    const allMembers: FamilyMember[] = [];
    
    // Add children
    if (familyData.children) {
      allMembers.push(...familyData.children);
    }
    
    // Add co-parents
    if (familyData.coParents) {
      allMembers.push(...familyData.coParents);
    }
    
    // Add others
    if (familyData.others) {
      allMembers.push(...familyData.others);
    }
    
    return allMembers;
  };

  useEffect(() => {
    if (token) {
      fetchFamilyDetails();
    }
  }, [token]);

  return {
    familyData,
    loading,
    error,
    refetch,
    getAllFamilyMembers,
  };
};
