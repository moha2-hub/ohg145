import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 })
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf"
  ]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ success: false, message: "Invalid file type" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()
  const fileName = `receipt_${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads")
  await fs.mkdir(uploadDir, { recursive: true })
  const filePath = path.join(uploadDir, fileName)
  const arrayBuffer = await file.arrayBuffer()
  await fs.writeFile(filePath, Buffer.from(arrayBuffer))

  const publicUrl = `/uploads/${fileName}`
  return NextResponse.json({ success: true, url: publicUrl })
}
