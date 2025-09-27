import { NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  const body = await req.json()
  const { filename, data } = body
  if (!filename || !data) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const buffer = Buffer.from(data, 'base64')
  const filePath = path.join(uploadsDir, filename)
  fs.writeFileSync(filePath, buffer)
  return NextResponse.json({ url: '/uploads/' + filename })
}
