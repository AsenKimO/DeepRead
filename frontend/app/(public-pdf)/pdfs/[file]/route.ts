// app/(public-pdf)/pdfs/[file]/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ROOT_PDF_DIR = path.join(process.cwd(), "..", "public/pdfs");

export async function GET(
  _req: NextRequest,
  { params }: { params: { file: string } }
) {
  const filename = params.file;

  // basic sanitization
  if (!filename.endsWith(".pdf") || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const absPath = path.join(ROOT_PDF_DIR, filename);

  try {
    const data = await fs.readFile(absPath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
