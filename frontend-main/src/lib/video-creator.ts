export class VideoCreator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext('2d')!;
  }

  async createVideoFromAudioAndImage(
    audioFile: File, 
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        // Load the image
        const image = await this.loadImage(imageFile);
        
        // Load the audio
        const audioContext = new AudioContext();
        const audioBuffer = await audioFile.arrayBuffer();
        const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
        
        // Set up canvas stream
        const canvasStream = this.canvas.captureStream(30); // 30 FPS
        
        // Create audio stream
        const audioStream = await this.createAudioStream(audioFile);
        
        // Combine streams
        const combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ]);

        // Set up MediaRecorder with fallback options
        let options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9,opus' };

        // Try different formats if the preferred one isn't supported
        if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
          console.log('VP9/Opus not supported, trying VP8/Opus');
          options = { mimeType: 'video/webm;codecs=vp8,opus' };
        }

        if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
          console.log('VP8/Opus not supported, trying default WebM');
          options = { mimeType: 'video/webm' };
        }

        if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
          console.log('WebM not supported, using default');
          options = {};
        }

        console.log('Using MediaRecorder with options:', options);
        this.mediaRecorder = new MediaRecorder(combinedStream, options);

        this.chunks = [];
        
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.chunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const videoBlob = new Blob(this.chunks, { type: 'video/webm' });
          console.log('Video creation completed:', {
            size: videoBlob.size,
            type: videoBlob.type,
            chunks: this.chunks.length
          });
          resolve(videoBlob);
        };

        this.mediaRecorder.onerror = (event) => {
          reject(new Error('MediaRecorder error'));
        };

        // Start recording
        this.mediaRecorder.start();

        // Draw the image on canvas for the duration of the audio
        const duration = decodedAudio.duration * 1000; // Convert to milliseconds
        const startTime = Date.now();
        
        const drawFrame = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Clear canvas
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          
          // Draw background (black)
          this.ctx.fillStyle = '#000000';
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
          
          // Draw image (centered and scaled to fit)
          this.drawImageCentered(image);
          
          // Optional: Add some visual effects or text
          this.addVideoEffects(progress);
          
          if (onProgress) {
            onProgress(progress);
          }
          
          if (progress < 1) {
            requestAnimationFrame(drawFrame);
          } else {
            // Stop recording after audio duration
            setTimeout(() => {
              this.mediaRecorder?.stop();
            }, 100);
          }
        };

        drawFrame();

      } catch (error) {
        reject(error);
      }
    });
  }

  private async loadImage(imageFile: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private async createAudioStream(audioFile: File): Promise<MediaStream> {
    const audio = new Audio();
    audio.src = URL.createObjectURL(audioFile);
    
    // Create audio context and connect to destination
    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);
    const destination = audioContext.createMediaStreamDestination();
    
    source.connect(destination);
    source.connect(audioContext.destination); // Also play through speakers
    
    audio.play();
    
    return destination.stream;
  }

  private drawImageCentered(image: HTMLImageElement) {
    const canvasAspect = this.canvas.width / this.canvas.height;
    const imageAspect = image.width / image.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspect > canvasAspect) {
      // Image is wider than canvas
      drawWidth = this.canvas.width;
      drawHeight = this.canvas.width / imageAspect;
      drawX = 0;
      drawY = (this.canvas.height - drawHeight) / 2;
    } else {
      // Image is taller than canvas
      drawHeight = this.canvas.height;
      drawWidth = this.canvas.height * imageAspect;
      drawX = (this.canvas.width - drawWidth) / 2;
      drawY = 0;
    }
    
    this.ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  private addVideoEffects(progress: number) {
    // Optional: Add title text, progress bar, or other effects
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
    
    // Add progress bar
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(50, this.canvas.height - 30, (this.canvas.width - 100) * progress, 10);
  }

  cleanup() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}
