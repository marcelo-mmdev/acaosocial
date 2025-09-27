import { NextResponse } from "next/server"
import prisma from 'prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const personId = url.searchParams.get('personId')
  const delivererId = url.searchParams.get('delivererId')
  const where:any = {}
  if (personId) where.personId = Number(personId)
  if (delivererId) where.delivererId = Number(delivererId)
  const deliveries = await prisma.delivery.findMany({ where, include: { person: true, deliverer: true }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(deliveries)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { personId, delivererId, year, month } = body
  try {
    const d = await prisma.delivery.create({ data: { personId: Number(personId), delivererId: Number(delivererId), year: Number(year), month: Number(month) } })
    return NextResponse.json(d, { status: 201 })
  } catch (e:any) {
    // handle unique constraint
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
