"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { NavigationControls } from "./NavigationControls";

import { ReadingProgress } from "./ReadingProgress";

// Provide TypeScript with the `pdfjsLib` definition injected by the PDF.js CDN script
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface PDFViewerProps {
  url: string;
  name: string;
}

export function PDFViewer({ url, name }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // In case the PDF.js script loads *before* this component hydrates,
  // detect its presence and mark it as loaded.
  useEffect(() => {
    if (!isScriptLoaded && typeof window !== "undefined" && window.pdfjsLib) {
      // Same workerSrc safeguard when script loads before hydration
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setIsScriptLoaded(true);
    }
  }, [isScriptLoaded]);

  useEffect(() => {
    if (!isScriptLoaded) return;

    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) return;

    let loadedPdfRef: any = null;

    const loadPdf = async () => {
      try {
        let loadingTask;
        // If the URL is a blob: URL we need to fetch the data first,
        // because the PDF.js worker cannot XHR a blob URL.
        if (url.startsWith("blob:")) {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        } else {
          loadingTask = pdfjsLib.getDocument(url);
        }

        const loadedPdf = await loadingTask.promise;
        setPdf(loadedPdf);
        loadedPdfRef = loadedPdf;
        setTotalPages(loadedPdf.numPages);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPdf();

    // Clean‑up: destroy the PDF loaded by this effect run
    return () => {
      if (loadedPdfRef) {
        loadedPdfRef.destroy();
      }
    };
  }, [url, isScriptLoaded]);

  useEffect(() => {
    if (!isScriptLoaded || !pdf || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (error) {
        console.error("Error rendering page:", error);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, isScriptLoaded]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changeZoom = (newScale: number) => {
    setScale(newScale);
  };

  const handleScriptLoad = () => {
    if (window.pdfjsLib) {
      // Tell PDF.js where to fetch its worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    setIsScriptLoaded(true);
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
        onLoad={handleScriptLoad}
        strategy="afterInteractive"
      />

      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="font-medium truncate max-w-[20rem]" title={name}>
            {name}
          </h1>
          <NavigationControls
            currentPage={currentPage}
            totalPages={totalPages}
            scale={scale}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            onZoomChange={changeZoom}
          />
        </div>

        <div className="flex-1 overflow-auto flex justify-center p-4 bg-muted/20">
          {!isScriptLoaded ? (
            <div className="flex items-center justify-center">
              Loading PDF.js...
            </div>
          ) : (
            <canvas ref={canvasRef} className="shadow-lg" />
          )}
        </div>

        <div className="p-2 border-t">
          <ReadingProgress currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}
