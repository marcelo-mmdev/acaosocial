import { NextResponse } from "next/server"
import QRCode from "qrcode"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nome = searchParams.get("nome")
  const cpf = searchParams.get("cpf")

  if (!nome || !cpf) {
    return NextResponse.json({ error: "Nome e CPF são obrigatórios" }, { status: 400 })
  }

  const qrValue = `${nome}-${cpf}`
  const qrDataUrl = await QRCode.toDataURL(qrValue)

  return NextResponse.json({ qr: qrDataUrl })
}
