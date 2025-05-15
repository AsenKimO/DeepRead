// components/reader/NavigationControls.tsx
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";

interface NavigationControlsProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onZoomChange: (scale: number) => void;
  onRotate: () => void;
}

export function NavigationControls({
  currentPage,
  totalPages,
  scale,
  onPreviousPage,
  onNextPage,
  onZoomChange,
  onRotate,
}: NavigationControlsProps) {
  const zoomIn = () => {
    onZoomChange(Math.min(scale + 0.2, 3));
  };

  const zoomOut = () => {
    onZoomChange(Math.max(scale - 0.2, 0.5));
  };

  const handleZoomSliderChange = (value: number[]) => {
    onZoomChange(value[0]);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center mr-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="mx-2 text-sm">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={zoomOut}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Slider
          className="w-24"
          min={0.5}
          max={3}
          step={0.1}
          value={[scale]}
          onValueChange={handleZoomSliderChange}
        />

        <Button
          variant="outline"
          size="icon"
          onClick={zoomIn}
          disabled={scale >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={onRotate}>
          <RotateCw className="h-4 w-4" />
        </Button>

        <span className="text-xs text-muted-foreground ml-1">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}
