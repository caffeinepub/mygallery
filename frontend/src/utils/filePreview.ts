import type { FileMetadata } from '@/backend';

export type FileCategory = 'image' | 'video' | 'pdf' | 'office' | 'unsupported';

/**
 * Determines if a file can be previewed in-app
 */
export function isPreviewableInApp(file: FileMetadata): boolean {
  const category = getFileCategory(file.mimeType);
  return category === 'image' || category === 'video' || category === 'pdf' || category === 'office';
}

/**
 * Categorizes a file based on its MIME type
 */
export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  
  // Office documents
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    mimeType === 'application/vnd.ms-powerpoint'
  ) {
    return 'office';
  }
  
  return 'unsupported';
}

/**
 * Gets a human-readable file type label
 */
export function getFileTypeLabel(mimeType: string): string {
  const category = getFileCategory(mimeType);
  
  switch (category) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'pdf':
      return 'PDF Document';
    case 'office':
      if (mimeType.includes('word')) return 'Word Document';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Excel Spreadsheet';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PowerPoint Presentation';
      return 'Office Document';
    default:
      return 'File';
  }
}
