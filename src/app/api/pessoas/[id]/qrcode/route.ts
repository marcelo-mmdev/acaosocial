import { NextResponse } from "next/server"
import prisma from 'prisma'
import QRCode from 'qrcode'

export async function GET(req: Request, { params }: any) {
  const id = Number(params.id)
  const pessoa = await prisma.person.findUnique({ where: { id } })
  if (!pessoa) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const payload = { id: pessoa.id, name: pessoa.name, cpf: pessoa.cpf }
  const dataUrl = await QRCode.toDataURL(JSON.stringify(payload))
  return NextResponse.json({ dataUrl })
}
