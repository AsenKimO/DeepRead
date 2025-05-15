// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const PDF_DIR = path.join(process.cwd(), "public/pdfs");

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Make sure target dir exists
  await fs.mkdir(PDF_DIR, { recursive: true });

  // Remove any existing PDF so only one lives at a time
  const entries = await fs.readdir(PDF_DIR);
  await Promise.all(entries.map((e) => fs.unlink(path.join(PDF_DIR, e))));

  // Write the new PDF
  const bytes = await file.arrayBuffer();
  const filename = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_"); // sanitize
  const dest = path.join(PDF_DIR, filename);
  await fs.writeFile(dest, Buffer.from(bytes));

  // Return the public URL so the client can load it
  const publicUrl = `/pdfs/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
