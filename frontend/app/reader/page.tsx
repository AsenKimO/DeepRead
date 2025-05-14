"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PDFViewer } from "@/components/reader/PDFViewer";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { toast } from "sonner";

export default function ReaderPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a PDF URL in localStorage
    const storedPdfUrl = localStorage.getItem("currentPdfUrl");
    const storedPdfName = localStorage.getItem("currentPdfName");

    if (storedPdfUrl) {
      setPdfUrl(storedPdfUrl);
      setPdfName(storedPdfName);
    } else {
      toast.error("No PDF selected");
      router.push("/");
    }
  }, [router]);

  if (!pdfUrl) {
    return <div className="container py-16 text-center">Loading...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-hidden">
        <PDFViewer url={pdfUrl} name={pdfName || "Document"} />
      </div>
      <div className="w-[30%] border-l">
        <ChatPanel />
      </div>
    </div>
  );
}
