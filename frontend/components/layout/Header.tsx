// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Header() {
  const pdfName = "Swift-Laputa.pdf";
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold text-xl">DeepRead</span>
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
