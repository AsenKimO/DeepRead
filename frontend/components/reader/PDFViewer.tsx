("use client");

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { NavigationControls } from "./NavigationControls";
import { ReadingProgress } from "./ReadingProgress";

interface PDFViewerProps {
  url: string;
  name: string;
  onTextSelected?: (text: string) => void;
}

// Load the worker we ship in /public to avoid CDN‑version mismatches.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export function PDFViewer({ url, name }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);

  const rotateCW = () => setRotation((prev) => (prev + 90) % 360);

  /* ---------- navigation helpers ---------- */
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, numPages));
  const goToPreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const changeZoom = (newScale: number) => setScale(newScale);

  /* ---------- render ---------- */
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Top bar with filename & controls */}
      <div className="sticky top-0 z-10 w-full p-4 border-b flex justify-between items-center">
        <h1 className="font-medium truncate max-w-[20rem]" title={name}>
          {name}
        </h1>

        <NavigationControls
          currentPage={currentPage}
          totalPages={numPages}
          scale={scale}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
          onZoomChange={(s) => {
            changeZoom(s);
            document
              .querySelector(".overflow-auto")
              ?.scrollTo({ top: 0, left: 0 });
          }}
          onRotate={rotateCW}
        />
      </div>

      {/* PDF display */}
      <div className="flex-1 min-h-0 w-full overflow-auto flex justify-center items-start p-4 bg-muted/20">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setCurrentPage(1);
          }}
          loading={<div className="flex items-center">Loading PDF…</div>}
          error={<div className="text-red-600">Failed to load PDF.</div>}
        >
          {numPages > 0 && (
            <Page
              pageNumber={currentPage}
              scale={scale}
              rotate={rotation}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onRenderSuccess={() => {
                /* optional future hook for selection/highlights */
              }}
            />
          )}
        </Document>
      </div>

      {/* Progress bar */}
      <div className="p-2 border-t">
        <ReadingProgress currentPage={currentPage} totalPages={numPages} />
      </div>
    </div>
  );
}
