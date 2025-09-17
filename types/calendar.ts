// Calendar Events Types

export type EventType = 'Personal' | 'School' | 'School_Holiday' | 'Activity' | 'Holiday' | 'Medical' | 'Schedule';

export interface CalendarEvent {
  _id: string;
  familyId?: string;
  title: string;
  eventType: EventType;
  eventDate?: string; // For single-day events
  startDate?: string; // For multi-day events
  endDate?: string; // For multi-day events
  startTime?: string;
  endTime?: string;
  location?: string;
  familyMembers?: string[];
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  color: string;
  // Schedule-specific fields
  responsibleParent?: string;
  activities?: string;
  notes?: string;
  // School-specific fields
  school?: {
    _id: string;
    name: string;
  };
}

export interface CalendarEventsResponse {
  success: boolean;
  message: string;
  data: CalendarEvent[];
}

export interface CalendarEventsParams {
  startDate?: string;
  endDate?: string;
}
