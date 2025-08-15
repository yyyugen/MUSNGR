// Simple web-compatible ID3 tag extractor

export interface ID3TagData {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  picture?: {
    data: Uint8Array;
    format: string;
    type: string;
    description: string;
  };
}

export class ID3Extractor {
  static async extractTags(audioFile: File): Promise<ID3TagData> {
    // For now, return basic metadata from filename
    // This is a simplified version that works in the browser
    const fileName = audioFile.name.replace(/\.[^/.]+$/, ''); // Remove extension

    // Try to parse common filename patterns like "Artist - Title"
    const parts = fileName.split(' - ');
    const tags: ID3TagData = {};

    if (parts.length >= 2) {
      tags.artist = parts[0].trim();
      tags.title = parts.slice(1).join(' - ').trim();
    } else {
      tags.title = fileName;
    }

    // Note: For full ID3 tag support, we'd need a more complex implementation
    // or a different library that works properly in the browser
    return tags;
  }

  static createImageFromID3Picture(picture: ID3TagData['picture']): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!picture) {
        reject(new Error('No picture data provided'));
        return;
      }

      try {
        // Create blob from picture data
        const blob = new Blob([picture.data], { type: `image/${picture.format}` });
        
        // Create object URL
        const imageUrl = URL.createObjectURL(blob);
        
        // Verify it's a valid image by loading it
        const img = new Image();
        img.onload = () => {
          resolve(imageUrl);
        };
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Invalid image data'));
        };
        img.src = imageUrl;
      } catch (error) {
        reject(error);
      }
    });
  }

  static async extractAlbumArtwork(audioFile: File): Promise<string | null> {
    // For now, return null since we don't have full ID3 support
    // In a production app, you'd want to implement proper ID3 parsing
    console.log('Album artwork extraction not yet implemented for:', audioFile.name);
    return null;
  }

  static async getAudioMetadata(audioFile: File): Promise<{
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    genre?: string;
  }> {
    try {
      const tags = await this.extractTags(audioFile);
      return {
        title: tags.title,
        artist: tags.artist,
        album: tags.album,
        year: tags.year,
        genre: tags.genre
      };
    } catch (error) {
      console.error('Error extracting audio metadata:', error);
      return {};
    }
  }

  static generateSuggestedTitle(audioFile: File): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        const metadata = await this.getAudioMetadata(audioFile);
        
        if (metadata.title && metadata.artist) {
          resolve(`${metadata.artist} - ${metadata.title}`);
        } else if (metadata.title) {
          resolve(metadata.title);
        } else if (metadata.artist) {
          resolve(`${metadata.artist} - ${audioFile.name.replace(/\.[^/.]+$/, '')}`);
        } else {
          // Fallback to filename without extension
          resolve(audioFile.name.replace(/\.[^/.]+$/, ''));
        }
      } catch (error) {
        // Fallback to filename without extension
        resolve(audioFile.name.replace(/\.[^/.]+$/, ''));
      }
    });
  }

  static generateSuggestedDescription(audioFile: File): Promise<string> {
    return new Promise(async (resolve) => {
      try {
        const metadata = await this.getAudioMetadata(audioFile);
        
        let description = 'Created with Musngr\n\n';
        
        if (metadata.artist) {
          description += `Artist: ${metadata.artist}\n`;
        }
        
        if (metadata.album) {
          description += `Album: ${metadata.album}\n`;
        }
        
        if (metadata.year) {
          description += `Year: ${metadata.year}\n`;
        }
        
        if (metadata.genre) {
          description += `Genre: ${metadata.genre}\n`;
        }
        
        description += '\n#music #audio #musngr';
        
        if (metadata.genre) {
          description += ` #${metadata.genre.toLowerCase().replace(/\s+/g, '')}`;
        }
        
        resolve(description);
      } catch (error) {
        resolve('Created with Musngr\n\n#music #audio #musngr');
      }
    });
  }
}
