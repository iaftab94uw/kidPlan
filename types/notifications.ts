export interface NotificationSettings {
  pushNotifications: boolean;
  eventReminders: boolean;
  familyUpdates: boolean;
  photoUpdates: boolean;
  scheduleReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'low' | 'default' | 'high' | 'max';
  enabled: boolean;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  channelId: string;
  data?: Record<string, any>;
}

export interface EventReminderNotification {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  reminderMinutes: number; // Minutes before event
}

export interface FamilyUpdateNotification {
  memberId: string;
  memberName: string;
  updateType: 'added' | 'updated' | 'deleted';
  message: string;
}

export interface PhotoUpdateNotification {
  albumId: string;
  albumName: string;
  photoCount: number;
  uploadedBy: string;
}

export interface ScheduleReminderNotification {
  scheduleId: string;
  scheduleName: string;
  startDate: string;
  endDate: string;
  responsibleParent: string;
}

export const NOTIFICATION_CHANNELS = {
  DEFAULT: 'default',
  FAMILY: 'family',
  EVENTS: 'events',
  PHOTOS: 'photos',
  SCHEDULES: 'schedules',
} as const;

export const NOTIFICATION_TEMPLATES = {
  EVENT_REMINDER: {
    id: 'event_reminder',
    title: 'Event Reminder',
    body: 'You have an event "{eventTitle}" starting in {minutes} minutes',
    channelId: NOTIFICATION_CHANNELS.EVENTS,
  },
  FAMILY_MEMBER_ADDED: {
    id: 'family_member_added',
    title: 'New Family Member',
    body: '{memberName} has been added to your family',
    channelId: NOTIFICATION_CHANNELS.FAMILY,
  },
  FAMILY_MEMBER_UPDATED: {
    id: 'family_member_updated',
    title: 'Family Member Updated',
    body: '{memberName}\'s profile has been updated',
    channelId: NOTIFICATION_CHANNELS.FAMILY,
  },
  PHOTO_UPLOADED: {
    id: 'photo_uploaded',
    title: 'New Photos',
    body: '{uploadedBy} uploaded {photoCount} photos to {albumName}',
    channelId: NOTIFICATION_CHANNELS.PHOTOS,
  },
  SCHEDULE_REMINDER: {
    id: 'schedule_reminder',
    title: 'Schedule Reminder',
    body: 'Schedule "{scheduleName}" starts tomorrow',
    channelId: NOTIFICATION_CHANNELS.SCHEDULES,
  },
} as const;
