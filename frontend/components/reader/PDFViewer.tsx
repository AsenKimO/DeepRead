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
  onTextSelected?: (text: string) => void;
}

export function PDFViewer({ url, name, onTextSelected }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const rotateCW = () => setRotation((prev) => (prev + 90) % 360);
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
          loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
          });
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

  // Render the current page whenever `pdf`, `currentPage`, or `scale` changes
  useEffect(() => {
    if (!isScriptLoaded || !pdf || !canvasRef.current) return;

    // Keep a reference to the current render task so we can cancel it
    let renderTask: any;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Set canvas dimensions to match the viewport
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // Size the wrapper to the scaled dimensions so scrollbars cover the zoomed area
        if (wrapperRef.current) {
          wrapperRef.current.style.width = `${viewport.width * scale}px`;
          wrapperRef.current.style.height = `${viewport.height * scale}px`;
        }
        // Apply transform-based zoom without changing container size
        canvas.style.transformOrigin = "center center";
        canvas.style.transform = `rotate(${rotation}deg)`;

        // Cancel any in‑flight render before starting a new one
        if (renderTask && renderTask.cancel) {
          renderTask.cancel();
        }

        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
      } catch (error: any) {
        // Ignore "RenderingCancelledException" — that just means we re‑rendered quickly
        if (error?.name !== "RenderingCancelledException") {
          console.error("Error rendering page:", error);
        }
      }
    };

    renderPage();

    // Cleanup: cancel the render task if the effect re‑runs or unmounts
    return () => {
      if (renderTask && renderTask.cancel) {
        renderTask.cancel();
      }
    };
  }, [pdf, currentPage, scale, isScriptLoaded, rotation]);

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

      <div className="flex flex-col h-full w-full overflow-hidden">
        <div className="sticky top-0 z-10 w-full p-4 border-b flex justify-between items-center">
          <h1 className="font-medium truncate max-w-[20rem]" title={name}>
            {name}
          </h1>
          <NavigationControls
            currentPage={currentPage}
            totalPages={totalPages}
            scale={scale}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
            onZoomChange={(s) => {
              changeZoom(s);
              // scroll back to top-left so the user can see the now-larger page
              document.querySelector(".overflow-auto")?.scrollTo({ top: 0, left: 0 });
            }}
            onRotate={rotateCW}
          />
        </div>

        <div className="flex-1 min-h-0 w-full overflow-auto flex justify-start items-start p-4 bg-muted/20">
          {!isScriptLoaded ? (
            <div className="flex items-center justify-center">
              Loading PDF.js...
            </div>
          ) : (
            <div ref={wrapperRef} className="inline-block shadow-lg">
              <canvas ref={canvasRef} />
            </div>
          )}
        </div>

        <div className="p-2 border-t">
          <ReadingProgress currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}
