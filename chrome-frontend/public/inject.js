// chrome-frontend/public/inject.js
console.log("DeepRead PDF Assistant loaded");

// Check if we're on a PDF page
const isPdfPage = document.contentType === 'application/pdf' || 
                 window.location.href.toLowerCase().includes('.pdf') 
                 && window.location.href.startsWith('file') ||
                 window.location.href.includes('google.com/viewer');

if (isPdfPage) {
  // Add a floating button to the page that directs to our reader
  const button = document.createElement('div');
  button.innerHTML = `
    <div style="
      position: fixed;
      top: 10px;
      right: 20px;
      background: linear-gradient(153deg, rgb(116, 56, 216), rgb(18, 150, 170) 74%);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-weight: bold;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    ">
      Open in DeepRead
    </div>
  `;
  const innerDiv = button.firstElementChild; // grabs the element that has the gradient bg
  
  document.body.appendChild(button);
  
  // When the button is clicked, open our reader
  button.addEventListener("click", () => {
    // visual feedback
    innerDiv.textContent = "Loading…";
    innerDiv.style.cursor = "wait";
    innerDiv.style.opacity = "0.8";
    innerDiv.style.pointerEvents = "none"; // prevent double‑clicks

    const pdfUrl = window.location.href;

    // send message to background script
    chrome.runtime.sendMessage({
      action: "openInReader",
      pdfUrl: pdfUrl,
    });
  });
}