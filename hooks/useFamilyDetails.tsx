import { useState, useEffect } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';

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
  parents?: FamilyMember[];
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
  const { setUser, setToken } = useAuth();

  const fetchFamilyDetails = async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.FAMILY_DETAILS}`;
      const headers = getAuthHeaders(token);
      
      console.log('=== USE FAMILY DETAILS API ===');
      console.log('URL:', url);
      console.log('Method: GET');
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch family details: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Response:', data);
      console.log('=== END USE FAMILY DETAILS API ===');
      
      if (data.success) {
        console.log('=== FAMILY DETAILS API SUCCESS ===');
        console.log('Family data received:', data.data);
        console.log('Children:', data.data.children);
        console.log('Parents:', data.data.parents);
        console.log('CoParents:', data.data.coParents);
        console.log('Others:', data.data.others);
        console.log('=== END FAMILY DETAILS API ===');
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
    if (!familyData) {
      // console.log('getAllFamilyMembers: No familyData available');
      return [];
    }
    
    // console.log('getAllFamilyMembers: Processing familyData:', familyData);
    
    const allMembers: FamilyMember[] = [];
    const seenIds = new Set<string>();
    
    // Add children
    if (familyData.children) {
      // console.log('Adding children:', familyData.children);
      familyData.children.forEach(child => {
        if (!seenIds.has(child._id)) {
          allMembers.push(child);
          seenIds.add(child._id);
        }
      });
    }
    
    // Add parents
    if (familyData.parents) {
      // console.log('Adding parents:', familyData.parents);
      familyData.parents.forEach(parent => {
        if (!seenIds.has(parent._id)) {
          allMembers.push(parent);
          seenIds.add(parent._id);
        }
      });
    }
    
    // Add co-parents
    if (familyData.coParents) {
      familyData.coParents.forEach(coParent => {
        if (!seenIds.has(coParent._id)) {
          allMembers.push(coParent);
          seenIds.add(coParent._id);
        }
      });
    }
    
    // Add others
    if (familyData.others) {
      // console.log('Adding others:', familyData.others);
      familyData.others.forEach(other => {
        if (!seenIds.has(other._id)) {
          allMembers.push(other);
          seenIds.add(other._id);
        }
      });
    }
    
    // console.log('getAllFamilyMembers: Final result (unique):', allMembers);
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
