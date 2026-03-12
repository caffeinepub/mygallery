(function() {
  "use strict";
  self.onmessage = async (e) => {
    const { file, itemId } = e.data;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const response = {
        itemId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        bytes
      };
      self.postMessage(response, { transfer: [bytes.buffer] });
    } catch (error) {
      const response = {
        itemId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        bytes: new Uint8Array(0),
        error: error instanceof Error ? error.message : "Failed to read file"
      };
      self.postMessage(response);
    }
  };
})();
