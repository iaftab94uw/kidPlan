import { useState, useEffect } from 'react';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { CalendarEvent, CalendarEventsResponse, CalendarEventsParams } from '@/types/calendar';
import { makeAuthenticatedApiCall } from '@/utils/apiUtils';
import { useAuth } from '@/hooks/useAuth';

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  fetchEvents: (params?: CalendarEventsParams) => Promise<void>;
}

export const useCalendarEvents = (token: string, initialParams?: CalendarEventsParams): UseCalendarEventsReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken } = useAuth();

  const fetchEvents = async (params?: CalendarEventsParams) => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = getApiUrl(API_CONFIG.ENDPOINTS.GET_CALENDAR_EVENTS);
      
      // Add query parameters if provided
      if (params?.startDate || params?.endDate) {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        url += `?${queryParams.toString()}`;
      }

      const data = await makeAuthenticatedApiCall(
        url,
        {
          method: 'GET',
        },
        token,
        setUser,
        setToken
      );
      
      if (data.success) {
        setEvents(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch calendar events');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchEvents(initialParams);
  };

  useEffect(() => {
    if (token) {
      fetchEvents(initialParams);
    }
  }, [token]);

  return {
    events,
    loading,
    error,
    refetch,
    fetchEvents,
  };
};
