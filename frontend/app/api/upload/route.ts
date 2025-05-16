// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const PDF_DIR = path.join(process.cwd(), "..", "public/pdfs");

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
  const filename = file.name
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .replace(/\s+/g, "_"); // sanitize
  console.log("Processing file:", filename);
  const dest = path.join(PDF_DIR, filename);
  await fs.writeFile(dest, Buffer.from(bytes));

  // Return the public URL so the client can load it
  const publicUrl = `/pdfs/${filename}`;

  // Make a POST request to backend to parse pdf
  const response = await fetch("http://localhost:8000/api/process_pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: filename,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.log(`PDF processing failed: ${error}`);
    return NextResponse.json(
      { error: `PDF processing failed: ${error}` },
      { status: 500 }
    );
  }

  const result = await response.json();
  console.log("PDF processed successfully:", {
    message: result.message,
    pdfInternalId: result.pdf_internal_id,
    originalFilename: result.original_filename,
    collectionName: result.collection_name_for_rag,
    pdfSessionId: result.pdf_session_id,
  });

  return NextResponse.json({ url: publicUrl });
}
