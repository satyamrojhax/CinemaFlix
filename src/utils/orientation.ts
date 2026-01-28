"use client";

/**
 * Utility for handling screen orientation and fullscreen auto-landscape functionality
 */

export class OrientationManager {
  private static instance: OrientationManager;
  private originalOrientation: string | null = null;

  private constructor() {
    this.bindEvents();
  }

  public static getInstance(): OrientationManager {
    if (!OrientationManager.instance) {
      OrientationManager.instance = new OrientationManager();
    }
    return OrientationManager.instance;
  }

  private bindEvents(): void {
    if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in screen) {
      // Listen for fullscreen changes
      document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
      document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
      document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
      document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
    }
  }

  private handleFullscreenChange(): void {
    const isFullscreen = this.isFullscreen();
    
    if (isFullscreen) {
      // Store original orientation before entering fullscreen
      this.originalOrientation = this.getCurrentOrientation();
      
      // Force landscape mode on mobile devices
      this.forceLandscape();
    } else {
      // Restore original orientation when exiting fullscreen
      this.restoreOrientation();
    }
  }

  private isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  private getCurrentOrientation(): string {
    if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in screen) {
      return (screen.orientation?.type || (screen as any).mozOrientation || 'unknown').replace('primary', 'portrait');
    }
    return 'unknown';
  }

  private forceLandscape(): void {
    if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in screen && (screen.orientation as any)?.lock) {
      // Try to lock to landscape
      (screen.orientation as any).lock('landscape')
        .then(() => {
          console.log('Successfully locked to landscape mode');
        })
        .catch((error: any) => {
          console.warn('Could not lock to landscape:', error);
          // Fallback: try to rotate using CSS transform
          this.applyLandscapeTransform();
        });
    } else {
      // Fallback for browsers that don't support orientation lock
      this.applyLandscapeTransform();
    }
  }

  private restoreOrientation(): void {
    // Remove any applied transforms
    const videoContainer = document.querySelector('[data-video-container]') as HTMLElement;
    if (videoContainer) {
      videoContainer.style.transform = '';
      videoContainer.style.transformOrigin = '';
      videoContainer.style.width = '';
      videoContainer.style.height = '';
      videoContainer.style.position = '';
      videoContainer.style.top = '';
      videoContainer.style.left = '';
      videoContainer.style.zIndex = '';
    }

    // Try to unlock orientation
    if (typeof window !== 'undefined' && 'screen' in window && 'orientation' in screen && (screen.orientation as any)?.unlock) {
      (screen.orientation as any).unlock();
    }
  }

  private applyLandscapeTransform(): void {
    // Apply CSS transform to force landscape appearance
    const videoContainer = document.querySelector('[data-video-container]') as HTMLElement;
    if (videoContainer && this.isMobile()) {
      const isPortrait = window.innerHeight > window.innerWidth;
      
      if (isPortrait) {
        // Rotate the container to simulate landscape
        videoContainer.style.transform = 'rotate(90deg)';
        videoContainer.style.transformOrigin = 'center center';
        videoContainer.style.width = '100vh';
        videoContainer.style.height = '100vw';
        videoContainer.style.position = 'fixed';
        videoContainer.style.top = '0';
        videoContainer.style.left = '0';
        videoContainer.style.zIndex = '9999';
      }
    }
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public requestFullscreen(element: HTMLElement): Promise<void> {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      return (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      return (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      return (element as any).msRequestFullscreen();
    }
    return Promise.reject(new Error('Fullscreen not supported'));
  }

  public exitFullscreen(): Promise<void> {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      return (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      return (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      return (document as any).msExitFullscreen();
    }
    return Promise.reject(new Error('Fullscreen exit not supported'));
  }
}

export default OrientationManager;
