import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { School, SchoolsListingResponse, SchoolsListingParams } from '@/types/schools';
import { useAuth } from '@/hooks/useAuth';

interface UseSchoolsReturn {
  schools: School[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  refetch: () => void;
  fetchSchools: (params?: SchoolsListingParams) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  toggleSchoolSync: (schoolId: string, userId?: string) => Promise<{ success: boolean; updatedSchool?: School }>;
}

export const useSchools = (token: string, initialParams?: SchoolsListingParams): UseSchoolsReturn => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0
  });
  const [currentParams, setCurrentParams] = useState<SchoolsListingParams>(initialParams || {});
  const { setUser, setToken } = useAuth();

  const fetchSchools = useCallback(async (params?: SchoolsListingParams, append = false) => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      // Set default values
      const page = params?.page || currentParams.page || 1;
      const limit = params?.limit || currentParams.limit || 100;
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      const searchParam = params?.search !== undefined ? params.search : currentParams.search;
      const postcodeParam = params?.postcode !== undefined ? params.postcode : currentParams.postcode;
      const milesParam = params?.miles !== undefined ? params.miles : currentParams.miles;
      
      if (searchParam && searchParam.trim()) {
        queryParams.append('search', searchParam.trim());
      }
      
      if (postcodeParam && postcodeParam.trim()) {
        queryParams.append('postcode', postcodeParam.trim());
      }
      
      if (milesParam !== undefined && milesParam !== null) {
        queryParams.append('miles', milesParam.toString());
      }

      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.GET_SCHOOLS_LISTING)}?${queryParams.toString()}`;
      
      console.log('=== FETCH SCHOOLS API ===');
      console.log('URL:', url);
      console.log('Method: GET');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schools: ${response.status}`);
      }

      const data: SchoolsListingResponse = await response.json();
      
      console.log('Response:', data);
      console.log('=== END FETCH SCHOOLS API ===');

      if (data.success && data.data) {
        if (append) {
          setSchools(prev => [...prev, ...data.data.schools]);
        } else {
          setSchools(data.data.schools);
        }
        
        setPagination({
          page: data.data.page,
          limit: data.data.limit,
          total: data.data.total,
          totalPages: data.data.totalPages
        });
        
        // Update current params for next requests
        setCurrentParams({
          page: data.data.page,
          limit: data.data.limit,
          search: params?.search !== undefined ? params.search : currentParams.search,
          postcode: params?.postcode !== undefined ? params.postcode : currentParams.postcode,
          miles: params?.miles !== undefined ? params.miles : currentParams.miles
        });
      } else {
        throw new Error(data.message || 'Failed to fetch schools');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  }, [token, currentParams]);

  const loadMore = useCallback(async () => {
    if (pagination.page < pagination.totalPages && !loading) {
      await fetchSchools({ 
        ...currentParams, 
        page: pagination.page + 1 
      }, true);
    }
  }, [fetchSchools, pagination, currentParams, loading]);

  const refetch = useCallback(() => {
    fetchSchools(currentParams);
  }, [fetchSchools, currentParams]);

  const toggleSchoolSync = useCallback(async (schoolId: string, userId?: string): Promise<{ success: boolean; updatedSchool?: School }> => {
    if (!token) {
      setError('No authentication token available');
      return { success: false };
    }

    try {
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.TOGGLE_SCHOOL_SYNC)}/${schoolId}`;
      
      console.log('=== TOGGLE SCHOOL SYNC API ===');
      console.log('URL:', url);
      console.log('Method: POST');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle school sync: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Toggle Sync Response:', data);
      console.log('=== END TOGGLE SCHOOL SYNC API ===');

      if (data.success) {
        let updatedSchool: School | undefined;
        
        // Update the local schools state to reflect the sync change
        setSchools(prevSchools => {
          const updatedSchools = prevSchools.map(school => {
            if (school._id === schoolId) {
              if (userId) {
                // Check if user ID is currently in syncedToCalendar
                const isCurrentlySynced = school.syncedToCalendar?.includes(userId) || false;
                
                let updatedSyncedToCalendar;
                if (isCurrentlySynced) {
                  // Remove user ID from syncedToCalendar
                  updatedSyncedToCalendar = school.syncedToCalendar?.filter(id => id !== userId) || [];
                } else {
                  // Add user ID to syncedToCalendar
                  updatedSyncedToCalendar = [...(school.syncedToCalendar || []), userId];
                }
                
                console.log(`School ${schoolId} sync toggled:`, {
                  userId: userId,
                  wasSynced: isCurrentlySynced,
                  nowSynced: !isCurrentlySynced,
                  syncedToCalendar: updatedSyncedToCalendar
                });
                
                updatedSchool = { ...school, syncedToCalendar: updatedSyncedToCalendar };
                return updatedSchool;
              } else {
                // Fallback to API response if user ID not provided
                const updatedSyncedToCalendar = data.data?.syncedToCalendar || school.syncedToCalendar;
                console.log(`Updated school ${schoolId} syncedToCalendar from API:`, updatedSyncedToCalendar);
                updatedSchool = { ...school, syncedToCalendar: updatedSyncedToCalendar };
                return updatedSchool;
              }
            }
            return school;
          });
          
          return updatedSchools;
        });
        
        return { success: true, updatedSchool };
      } else {
        throw new Error(data.message || 'Failed to toggle school sync');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error toggling school sync:', err);
      return { success: false };
    }
  }, [token]);

  const hasMore = pagination.page < pagination.totalPages;

  useEffect(() => {
    if (token) {
      fetchSchools(initialParams);
    }
  }, [token]);

  return {
    schools,
    loading,
    error,
    pagination,
    refetch,
    fetchSchools,
    loadMore,
    hasMore,
    toggleSchoolSync,
  };
};
