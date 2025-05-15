// app/reader/page.tsx
// ... other imports and code

// Check if we're in a Chrome extension context
const chromeStorage = window.chrome?.storage?.local;
if (chromeStorage) {
  // Try to get the PDF URL from Chrome storage
  chromeStorage.get(["currentPdfUrl"], function (result) {
    if (result.currentPdfUrl) {
      setPdfUrl(result.currentPdfUrl);
      const fileName = result.currentPdfUrl.split("/").pop() || "Document";
      setPdfName(fileName);

      // Clear the storage to avoid conflicts on future loads
      chromeStorage.remove(["currentPdfUrl"]);
    }
  });
}

// ... rest of the code
