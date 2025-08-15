import { useState, useCallback } from 'react';
import { 
  VideoOptions, 
  DEFAULT_VIDEO_OPTIONS, 
  BasicOptions, 
  AdvancedOptions, 
  BackgroundOptions,
  PrivacyStatus,
  VideoSize,
  VideoCategory,
  BackgroundType,
  BackgroundStyle,
  FontFamily,
  FontSize,
  TextAlignment
} from '@/types/video-options';

export function useVideoOptions() {
  const [options, setOptions] = useState<VideoOptions>(DEFAULT_VIDEO_OPTIONS);

  // Basic options updaters
  const updatePrivacy = useCallback((privacy: PrivacyStatus) => {
    setOptions(prev => ({
      ...prev,
      basic: { ...prev.basic, privacy }
    }));
  }, []);

  const updateBasicOption = useCallback((key: keyof BasicOptions, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      basic: { ...prev.basic, [key]: value }
    }));
  }, []);

  // Advanced options updaters
  const updateVideoSize = useCallback((videoSize: VideoSize) => {
    setOptions(prev => ({
      ...prev,
      advanced: { ...prev.advanced, videoSize }
    }));
  }, []);

  const updateCategory = useCallback((category: VideoCategory) => {
    setOptions(prev => ({
      ...prev,
      advanced: { ...prev.advanced, category }
    }));
  }, []);

  const updateTags = useCallback((tags: string[]) => {
    setOptions(prev => ({
      ...prev,
      advanced: { ...prev.advanced, tags }
    }));
  }, []);

  const addTag = useCallback((tag: string) => {
    if (tag.trim() && !options.advanced.tags.includes(tag.trim())) {
      setOptions(prev => ({
        ...prev,
        advanced: { 
          ...prev.advanced, 
          tags: [...prev.advanced.tags, tag.trim()]
        }
      }));
    }
  }, [options.advanced.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setOptions(prev => ({
      ...prev,
      advanced: { 
        ...prev.advanced, 
        tags: prev.advanced.tags.filter(tag => tag !== tagToRemove)
      }
    }));
  }, []);

  const updateAdvancedOption = useCallback((key: keyof AdvancedOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      advanced: { ...prev.advanced, [key]: value }
    }));
  }, []);

  const updateCustomThumbnail = useCallback((thumbnail: File | undefined) => {
    setOptions(prev => ({
      ...prev,
      advanced: { ...prev.advanced, customThumbnail: thumbnail }
    }));
  }, []);

  // Background options updaters
  const updateBackgroundType = useCallback((type: BackgroundType) => {
    setOptions(prev => ({
      ...prev,
      background: { ...prev.background, type }
    }));
  }, []);

  const updateBackgroundText = useCallback((text: string) => {
    setOptions(prev => ({
      ...prev,
      background: { ...prev.background, text }
    }));
  }, []);

  const updateBackgroundStyle = useCallback((style: BackgroundStyle) => {
    setOptions(prev => ({
      ...prev,
      background: { ...prev.background, style }
    }));
  }, []);

  const updateBackgroundFont = useCallback((font: FontFamily) => {
    setOptions(prev => ({
      ...prev,
      background: { ...prev.background, font }
    }));
  }, []);

  const updateBackgroundFontSize = useCallback((fontSize: FontSize) => {
    setOptions(prev => ({
      ...prev,
      background: { ...prev.background, fontSize }
    }));
  }, []);

  const updateBackgroundAlignment = useCallback((alignment: TextAlignment) => {
    setOptions(prev => ({
      ...prev,
      background: { ...prev.background, alignment }
    }));
  }, []);

  const updateBackgroundOption = useCallback((key: keyof BackgroundOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      background: { ...prev.background, [key]: value }
    }));
  }, []);

  // Reset to defaults
  const resetOptions = useCallback(() => {
    setOptions(DEFAULT_VIDEO_OPTIONS);
  }, []);

  // Get formatted options for API
  const getFormattedOptions = useCallback(() => {
    return {
      privacy: options.basic.privacy,
      notifySubscribers: options.basic.notifySubscribers,
      madeForKids: options.basic.madeForKids,
      embeddable: options.basic.embeddable,
      publicStatsViewable: options.basic.publicStatsViewable,
      commentsEnabled: options.basic.commentsEnabled,
      includeWatermark: options.basic.includeWatermark,
      videoSize: options.advanced.videoSize,
      category: options.advanced.category,
      tags: options.advanced.tags,
      language: options.advanced.language,
      caption: options.advanced.caption,
      license: options.advanced.license,
      backgroundType: options.background.type,
      backgroundText: options.background.text,
      backgroundStyle: options.background.style,
      backgroundFont: options.background.font,
      backgroundFontSize: options.background.fontSize,
      backgroundAlignment: options.background.alignment,
    };
  }, [options]);

  return {
    options,
    // Basic options
    updatePrivacy,
    updateBasicOption,
    // Advanced options
    updateVideoSize,
    updateCategory,
    updateTags,
    addTag,
    removeTag,
    updateAdvancedOption,
    updateCustomThumbnail,
    // Background options
    updateBackgroundType,
    updateBackgroundText,
    updateBackgroundStyle,
    updateBackgroundFont,
    updateBackgroundFontSize,
    updateBackgroundAlignment,
    updateBackgroundOption,
    // Utilities
    resetOptions,
    getFormattedOptions,
  };
}
