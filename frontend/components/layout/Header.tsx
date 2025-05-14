// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold text-xl">DeepRead</span>
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button asChild variant="outline">
            <Link href="/reader">Open Reader</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
