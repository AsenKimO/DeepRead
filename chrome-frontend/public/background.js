// chrome-frontend/public/background.js
// This is the background service worker that will run when the extension is installed

// Listen for when the user clicks on the extension icon
chrome.action.onClicked.addListener((tab) => {
    // Check if the current tab is a PDF viewer
    const isPdfViewer = tab.url.includes('.pdf') || 
                       tab.url.includes('google.com/viewer') || 
                       tab.url.includes('/pdf');
    
    if (isPdfViewer) {
      // Get the current PDF URL
      const pdfUrl = tab.url;
      
      // Store the PDF URL for use in the reader
      chrome.storage.local.set({ currentPdfUrl: pdfUrl }, () => {
        // Open the reader page
        chrome.tabs.create({ url: "http://localhost:3000/reader" });
      });
    } else {
      // If not a PDF, just open the extension popup
      // This code won't actually run when using the action.onClicked event
      // but it's here for future reference if you switch back to popup mode
      chrome.action.setPopup({ tabId: tab.id, popup: "index.html" });
    }
  });
  
  // Listen for installation
  chrome.runtime.onInstalled.addListener(() => {
    console.log("DeepRead PDF Assistant installed");
  });

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openInReader") {
      // Store the PDF URL
      chrome.storage.local.set({ currentPdfUrl: message.pdfUrl }, () => {
        // Open the reader page
        chrome.tabs.create({ url: "http://localhost:3000/reader?pdfUrl=/pdfs/Swift-Laputa.pdf&pdfName=Swift-Laputa.pdf" });
      });
    }
  });