import { BackgroundStyle, FontFamily, FontSize, TextAlignment } from '@/types/video-options';

export interface BackgroundGeneratorOptions {
  text: string;
  style: BackgroundStyle;
  font: FontFamily;
  fontSize: FontSize;
  alignment: TextAlignment;
  width?: number;
  height?: number;
}

export class BackgroundImageGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  generateBackground(options: BackgroundGeneratorOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const {
          text,
          style,
          font,
          fontSize,
          alignment,
          width = 1920,
          height = 1080
        } = options;

        // Set canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;

        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);

        // Apply background style
        this.applyBackgroundStyle(style, width, height);

        // Apply text if provided
        if (text.trim()) {
          this.applyText(text, font, fontSize, alignment, style, width, height);
        }

        // Convert to blob
        this.canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    });
  }

  private applyBackgroundStyle(style: BackgroundStyle, width: number, height: number) {
    const ctx = this.ctx;

    switch (style) {
      case 'white-black':
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        break;
      
      case 'black-white':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        break;
      
      case 'gradient-blue':
        const blueGradient = ctx.createLinearGradient(0, 0, 0, height);
        blueGradient.addColorStop(0, '#1e3a8a');
        blueGradient.addColorStop(1, '#3b82f6');
        ctx.fillStyle = blueGradient;
        ctx.fillRect(0, 0, width, height);
        break;
      
      case 'gradient-purple':
        const purpleGradient = ctx.createLinearGradient(0, 0, 0, height);
        purpleGradient.addColorStop(0, '#581c87');
        purpleGradient.addColorStop(1, '#a855f7');
        ctx.fillStyle = purpleGradient;
        ctx.fillRect(0, 0, width, height);
        break;
      
      case 'gradient-sunset':
        const sunsetGradient = ctx.createLinearGradient(0, 0, 0, height);
        sunsetGradient.addColorStop(0, '#f97316');
        sunsetGradient.addColorStop(0.5, '#ef4444');
        sunsetGradient.addColorStop(1, '#dc2626');
        ctx.fillStyle = sunsetGradient;
        ctx.fillRect(0, 0, width, height);
        break;
      
      default:
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
    }
  }

  private applyText(
    text: string, 
    font: FontFamily, 
    fontSize: FontSize, 
    alignment: TextAlignment, 
    style: BackgroundStyle,
    width: number, 
    height: number
  ) {
    const ctx = this.ctx;
    
    // Set font
    const fontFamily = this.getFontFamily(font);
    const fontSizeNum = parseInt(fontSize);
    ctx.font = `${fontSizeNum}pt ${fontFamily}`;
    
    // Set text color based on background style
    ctx.fillStyle = this.getTextColor(style);
    
    // Set text alignment
    ctx.textAlign = this.getTextAlign(alignment);
    ctx.textBaseline = 'middle';
    
    // Calculate text position
    const { x, y } = this.getTextPosition(alignment, width, height);
    
    // Handle multi-line text
    const lines = this.wrapText(text, width * 0.9, fontSizeNum);
    const lineHeight = fontSizeNum * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    
    // Adjust y position for multiple lines
    let startY = y;
    if (alignment === 'middle' || alignment === 'center') {
      startY = y - (totalTextHeight / 2) + (lineHeight / 2);
    } else if (alignment === 'bottom') {
      startY = y - totalTextHeight + lineHeight;
    }
    
    // Draw each line
    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeight);
      ctx.fillText(line, x, lineY);
    });
  }

  private getFontFamily(font: FontFamily): string {
    const fontMap: Record<FontFamily, string> = {
      segoe: 'Segoe UI, sans-serif',
      arial: 'Arial, sans-serif',
      helvetica: 'Helvetica, sans-serif',
      times: 'Times New Roman, serif',
      courier: 'Courier New, monospace'
    };
    return fontMap[font] || fontMap.segoe;
  }

  private getTextColor(style: BackgroundStyle): string {
    switch (style) {
      case 'white-black':
        return '#ffffff';
      case 'black-white':
        return '#000000';
      case 'gradient-blue':
      case 'gradient-purple':
      case 'gradient-sunset':
        return '#ffffff';
      default:
        return '#ffffff';
    }
  }

  private getTextAlign(alignment: TextAlignment): CanvasTextAlign {
    switch (alignment) {
      case 'left':
        return 'left';
      case 'right':
        return 'right';
      case 'center':
      case 'top':
      case 'middle':
      case 'bottom':
        return 'center';
      default:
        return 'center';
    }
  }

  private getTextPosition(alignment: TextAlignment, width: number, height: number): { x: number; y: number } {
    switch (alignment) {
      case 'top':
        return { x: width / 2, y: height * 0.1 };
      case 'middle':
      case 'center':
        return { x: width / 2, y: height / 2 };
      case 'bottom':
        return { x: width / 2, y: height * 0.9 };
      case 'left':
        return { x: width * 0.05, y: height / 2 };
      case 'right':
        return { x: width * 0.95, y: height / 2 };
      default:
        return { x: width / 2, y: height * 0.9 };
    }
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const ctx = this.ctx;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [text];
  }

  getPreviewDataUrl(options: BackgroundGeneratorOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      this.generateBackground(options)
        .then(() => {
          resolve(this.canvas.toDataURL('image/png'));
        })
        .catch(reject);
    });
  }
}
