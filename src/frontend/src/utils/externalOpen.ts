/**
 * Attempts to open a URL in a new tab/window
 * Returns true if successful, false if blocked or failed
 */
export function openExternally(url: string): boolean {
  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    // Check if the window was blocked (null or undefined means blocked)
    if (!newWindow) {
      return false;
    }
    
    // Consider the open successful if window.open returned a window reference
    // Do not check newWindow.closed as it can be unreliable immediately after opening
    return true;
  } catch (error) {
    console.error('Failed to open external window:', error);
    return false;
  }
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
