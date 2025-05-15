"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { toast } from "sonner";

// Use dynamic import for the PDF Viewer
const PDFViewer = dynamic(
  () => import("@/components/reader/PDFViewer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        Loading PDF Viewer...
      </div>
    ),
  }
);

export default function ReaderPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const router = useRouter();

  // Reference to chat component methods
  const [chatRef, setChatRef] = useState<{
    addMessageFromText: (text: string) => void;
  } | null>(null);

  useEffect(() => {
    // Check for URL parameters first (from extension)
    const urlParams = new URLSearchParams(window.location.search);
    const urlPdfParam = urlParams.get("pdfUrl");

    if (urlPdfParam) {
      // PDF URL from URL parameter (extension)
      setPdfUrl(decodeURIComponent(urlPdfParam));
      const fileName = urlPdfParam.split("/").pop() || "Document";
      setPdfName(decodeURIComponent(fileName));
    } else {
      // Check localStorage (from direct upload)
      const storedPdfUrl = localStorage.getItem("currentPdfUrl");
      const storedPdfName = localStorage.getItem("currentPdfName");

      if (storedPdfUrl) {
        setPdfUrl(storedPdfUrl);
        setPdfName(storedPdfName);
      } else {
        toast.error("No PDF selected");
        router.push("/");
      }
    }

    // Check if we're in a Chrome extension context
    const chromeStorage = (window as any).chrome?.storage?.local;
    if (chromeStorage) {
      // Try to get the PDF URL from Chrome storage
      chromeStorage.get(
        ["currentPdfUrl"],
        function (result: { currentPdfUrl?: string }) {
          if (result.currentPdfUrl) {
            setPdfUrl(result.currentPdfUrl);
            const fileName =
              result.currentPdfUrl.split("/").pop() || "Document";
            setPdfName(fileName);

            // Clear the storage to avoid conflicts on future loads
            chromeStorage.remove(["currentPdfUrl"]);
          }
        }
      );
    }
  }, [router]);

  const handleTextSelected = (text: string) => {
    if (chatRef?.addMessageFromText) {
      chatRef.addMessageFromText(`Can you explain this: "${text}"`);
    }
  };

  if (!pdfUrl) {
    return (
      <div className="container py-16 flex justify-center">
        <div>Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-hidden">
        <PDFViewer
          url={pdfUrl}
          name={pdfName || "Document"}
          onTextSelected={handleTextSelected}
        />
      </div>
      <div className="w-[30%] border-l">
        <ChatPanel setChatRef={setChatRef} />
      </div>
    </div>
  );
}
