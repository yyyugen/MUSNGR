export type PrivacyStatus = 'public' | 'private' | 'unlisted';
export type VideoSize = '1920x1080' | '1280x720' | '3840x2160';
export type VideoCategory = 'music' | 'entertainment' | 'education' | 'gaming' | 'howto' | 'news' | 'nonprofit' | 'people' | 'pets' | 'science' | 'sports' | 'travel' | 'autos';
export type BackgroundType = 'none' | 'create' | 'id3';
export type BackgroundStyle = 'white-black' | 'black-white' | 'gradient-blue' | 'gradient-purple' | 'gradient-sunset';
export type FontFamily = 'segoe' | 'arial' | 'helvetica' | 'times' | 'courier';
export type FontSize = '12' | '14' | '16' | '18' | '20' | '24' | '28' | '32' | '36' | '48';
export type TextAlignment = 'top' | 'middle' | 'bottom' | 'left' | 'right' | 'center';

export interface BackgroundOptions {
  type: BackgroundType;
  text: string;
  style: BackgroundStyle;
  font: FontFamily;
  fontSize: FontSize;
  alignment: TextAlignment;
}

export interface BasicOptions {
  privacy: PrivacyStatus;
  notifySubscribers: boolean;
  madeForKids: boolean;
  embeddable: boolean;
  publicStatsViewable: boolean;
  commentsEnabled: boolean;
  includeWatermark: boolean;
}

export interface AdvancedOptions {
  videoSize: VideoSize;
  category: VideoCategory;
  tags: string[];
  language: string;
  caption: boolean;
  license: 'youtube' | 'creativeCommon';
  recordingDate?: Date;
  location?: string;
  customThumbnail?: File;
}

export interface VideoOptions {
  basic: BasicOptions;
  advanced: AdvancedOptions;
  background: BackgroundOptions;
}

export const DEFAULT_VIDEO_OPTIONS: VideoOptions = {
  basic: {
    privacy: 'public',
    notifySubscribers: false,
    madeForKids: false,
    embeddable: true,
    publicStatsViewable: true,
    commentsEnabled: true,
    includeWatermark: false,
  },
  advanced: {
    videoSize: '1920x1080',
    category: 'music',
    tags: ['music', 'audio', 'musngr'],
    language: 'en',
    caption: false,
    license: 'youtube',
  },
  background: {
    type: 'none',
    text: '',
    style: 'white-black',
    font: 'segoe',
    fontSize: '24',
    alignment: 'bottom',
  },
};

// Helper functions
export const getYouTubeCategoryId = (category: VideoCategory): string => {
  const categoryMap: Record<VideoCategory, string> = {
    music: '10',
    entertainment: '24',
    education: '27',
    gaming: '20',
    howto: '26',
    news: '25',
    nonprofit: '29',
    people: '22',
    pets: '15',
    science: '28',
    sports: '17',
    travel: '19',
    autos: '2',
  };
  return categoryMap[category];
};

export const getVideoSizeDimensions = (size: VideoSize): { width: number; height: number } => {
  const sizeMap: Record<VideoSize, { width: number; height: number }> = {
    '1920x1080': { width: 1920, height: 1080 },
    '1280x720': { width: 1280, height: 720 },
    '3840x2160': { width: 3840, height: 2160 },
  };
  return sizeMap[size];
};

export const formatTagsForYouTube = (tags: string[]): string[] => {
  return tags
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 500); // YouTube limit
};
