export interface NotificationPreferences {
  emailVideoUploads: boolean;
  emailNewFollowers: boolean;
  emailNewLikes: boolean;
  emailNewComments: boolean;
  pushNewMessages: boolean;
  pushMentions: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailVideoUploads: true, // Default to enabled for video uploads
  emailNewFollowers: false,
  emailNewLikes: false,
  emailNewComments: false,
  pushNewMessages: true,
  pushMentions: true,
};

const STORAGE_KEY = 'musngr_notification_preferences';

export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Error reading notification preferences:', error);
  }

  return DEFAULT_PREFERENCES;
}

export function setNotificationPreferences(preferences: Partial<NotificationPreferences>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = getNotificationPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
}

export function shouldSendEmailNotification(type: keyof NotificationPreferences): boolean {
  const preferences = getNotificationPreferences();
  return preferences[type] === true;
}
