import type { FileMetadata } from '@/backend';
import { getFileCategory, type FileCategory } from './filePreview';

export type FileOpenAction = 
  | { type: 'in-app-viewer' }
  | { type: 'download-only' }
  | { type: 'office-preview' };

/**
 * Determines the primary action when a user taps/clicks a file
 */
export function getFileOpenAction(file: FileMetadata): FileOpenAction {
  const category = getFileCategory(file.mimeType);
  
  switch (category) {
    case 'image':
    case 'video':
    case 'pdf':
      // PDFs, images, and videos open in the in-app viewer
      return { type: 'in-app-viewer' };
    
    case 'office':
      // Office documents open in-app preview with option to open in new tab
      return { type: 'office-preview' };
    
    case 'unsupported':
    default:
      // Unsupported files download directly
      return { type: 'download-only' };
  }
}

/**
 * Checks if a file should open in the in-app viewer
 */
export function shouldOpenInViewer(file: FileMetadata): boolean {
  const action = getFileOpenAction(file);
  return action.type === 'in-app-viewer' || action.type === 'office-preview';
}

/**
 * Checks if a file should download directly without attempting to open
 */
export function shouldDownloadDirectly(file: FileMetadata): boolean {
  const action = getFileOpenAction(file);
  return action.type === 'download-only';
}

/**
 * Checks if a file is an Office document that supports preview + new tab open
 */
export function isOfficeDocument(file: FileMetadata): boolean {
  const category = getFileCategory(file.mimeType);
  return category === 'office';
}
