import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';

export interface SchoolEvent {
  _id: string;
  familyId: string;
  title: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  familyMembers: string[];
  description: string;
  school: string;
  reminder: {
    enabled: boolean;
    minutesBefore: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  color: string;
  __v: number;
}

export interface SchoolAddress {
  street: string;
  locality: string;
  address3: string;
  town: string;
  county: string;
  postcode: string;
}

export interface SchoolContact {
  head: {
    title: string;
    firstName: string;
    lastName: string;
  };
  web: string;
  tel: string;
}

export interface SchoolDetails {
  address: SchoolAddress;
  contact: SchoolContact;
  _id: string;
  la: string;
  name: string;
  type: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolEventsResponse {
  success: boolean;
  message: string;
  data: {
    school: SchoolDetails;
    events: SchoolEvent[];
  };
}

interface UseSchoolEventsReturn {
  schoolDetails: SchoolDetails | null;
  events: SchoolEvent[];
  loading: boolean;
  error: string | null;
  fetchSchoolEvents: (schoolId: string, authToken: string) => Promise<void>;
  refetch: () => void;
}

export const useSchoolEvents = (): UseSchoolEventsReturn => {
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(null);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const fetchSchoolEvents = useCallback(async (schoolId: string, authToken: string) => {
    if (!schoolId || !authToken) {
      setError('School ID and auth token are required');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentSchoolId(schoolId);
    setCurrentToken(authToken);

    try {
      const url = `${getApiUrl(API_CONFIG.ENDPOINTS.GET_SCHOOL_EVENTS)}?schoolId=${schoolId}`;
      const headers = getAuthHeaders(authToken);

      console.log('=== FETCH SCHOOL EVENTS API ===');
      console.log('URL:', url);
      console.log('Method: GET');
      console.log('Headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data: SchoolEventsResponse = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        throw new Error(`Failed to fetch school events: ${response.status} - ${data.message || 'Unknown error'}`);
      }

      if (data.success) {
        setSchoolDetails(data.data.school);
        setEvents(data.data.events);
        console.log('School events fetched successfully');
      } else {
        throw new Error(data.message || 'Failed to fetch school events');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching school events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (currentSchoolId && currentToken) {
      fetchSchoolEvents(currentSchoolId, currentToken);
    }
  }, [currentSchoolId, currentToken, fetchSchoolEvents]);

  return {
    schoolDetails,
    events,
    loading,
    error,
    fetchSchoolEvents,
    refetch,
  };
};
