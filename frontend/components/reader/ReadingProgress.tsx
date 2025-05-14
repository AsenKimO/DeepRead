// components/reader/ReadingProgress.tsx
import { Progress } from "@/components/ui/progress";

interface ReadingProgressProps {
  currentPage: number;
  totalPages: number;
}

export function ReadingProgress({
  currentPage,
  totalPages,
}: ReadingProgressProps) {
  const progressPercentage = totalPages ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Reading Progress</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} className="h-1.5" />
    </div>
  );
}
