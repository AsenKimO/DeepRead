// app/page.tsx
import { Hero } from "@/components/landing/Hero";
import { UploadArea } from "@/components/landing/UploadArea";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 py-8 md:py-16">
      <Hero />
      <UploadArea />
    </div>
  );
}
