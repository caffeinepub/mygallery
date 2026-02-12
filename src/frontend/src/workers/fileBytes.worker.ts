// Web Worker for reading file bytes off the main thread
export interface FileBytesRequest {
  file: File;
  itemId: string;
}

export interface FileBytesResponse {
  itemId: string;
  name: string;
  mimeType: string;
  size: number;
  bytes: Uint8Array;
  error?: string;
}

self.onmessage = async (e: MessageEvent<FileBytesRequest>) => {
  const { file, itemId } = e.data;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const response: FileBytesResponse = {
      itemId,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      bytes,
    };

    self.postMessage(response, { transfer: [bytes.buffer] });
  } catch (error) {
    const response: FileBytesResponse = {
      itemId,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      bytes: new Uint8Array(0),
      error: error instanceof Error ? error.message : 'Failed to read file',
    };

    self.postMessage(response);
  }
};
