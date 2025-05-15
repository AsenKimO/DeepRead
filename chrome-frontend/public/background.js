chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "openInReader" && message.pdfUrl) {
    fetch(message.pdfUrl)
      .then(res => res.blob())
      .then(blob => {
        const fileName = message.pdfUrl.split("/").pop() || "document.pdf";
        const formData = new FormData();
        formData.append("file", new File([blob], fileName, { type: "application/pdf" }));

        return fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });
      })
      .then(res => res.json())
      .then(({ url }) => {
        chrome.tabs.create({
          url: `http://localhost:3000/reader?pdfUrl=${encodeURIComponent(url)}&pdfName=${encodeURIComponent(url.split("/").pop())}`,
        });
      })
      .catch(console.error);
  }
});