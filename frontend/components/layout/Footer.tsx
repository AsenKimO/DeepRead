// components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-center gap-2 md:flex-row md:justify-between mx-auto">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} DeepRead. All rights reserved.
        </p>
        <p className="text-sm text-muted-foreground">
          Built with Next.js, shadcn/ui, and react-pdf
        </p>
      </div>
    </footer>
  );
}
