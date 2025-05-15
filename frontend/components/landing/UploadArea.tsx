// components/landing/UploadArea.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUp, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error("Upload failed");
        return;
      }

      const { url } = await res.json();
      toast.success("PDF uploaded successfully!");

      router.push(
        `/reader?pdfUrl=${encodeURIComponent(url)}&pdfName=${encodeURIComponent(
          file.name
        )}`
      );
    } catch (err) {
      toast.error("Something went wrong – check your connection.");
      console.error(err);
    }
  };

  return (
    <section id="upload" className="container py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Upload Your Study Material</CardTitle>
          <CardDescription>
            Drag and drop your PDF file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center flex flex-col items-center justify-center gap-4 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25",
              file ? "bg-primary/5" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileUp className="h-12 w-12 text-muted-foreground" />

            {file ? (
              <div className="space-y-2">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>Drag and drop your PDF here</p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF files up to 50MB
                </p>
              </div>
            )}

            <div className="mt-4">
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {file ? "Choose a different file" : "Browse files"}
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={!file} className="w-full">
            Open in Reader
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
