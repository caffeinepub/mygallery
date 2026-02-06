/**
 * Attempts to open a URL in a new tab/window
 * Returns a promise that resolves to true if successful, false if blocked
 * 
 * Uses page visibility detection to distinguish between:
 * - True popup blocking (window.open returns null, page stays visible)
 * - Successful navigation (page loses focus/visibility)
 */
export function openExternally(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      let resolved = false;
      let visibilityChanged = false;
      let blurOccurred = false;

      // Track if page loses visibility or focus (indicates successful navigation)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          visibilityChanged = true;
        }
      };

      const handleBlur = () => {
        blurOccurred = true;
      };

      // Add listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('pagehide', handleVisibilityChange);

      // Cleanup function
      const cleanup = () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('pagehide', handleVisibilityChange);
      };

      // Attempt to open the window
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

      // If window.open returns null, it's likely blocked
      if (!newWindow) {
        // Wait a short time to see if visibility changes anyway (some browsers delay the event)
        setTimeout(() => {
          cleanup();
          if (!resolved) {
            resolved = true;
            // If page lost visibility/focus, consider it successful despite null return
            resolve(visibilityChanged || blurOccurred);
          }
        }, 150);
      } else {
        // Window reference returned - likely successful
        // Wait briefly to confirm (some browsers may still block)
        setTimeout(() => {
          cleanup();
          if (!resolved) {
            resolved = true;
            resolve(true);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to open external window:', error);
      resolve(false);
    }
  });
}

/**
 * Downloads a file from a URL
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}
