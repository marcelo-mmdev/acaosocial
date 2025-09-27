import { NextResponse } from 'next/server'
import prisma from 'prisma'

export async function GET(req:Request){
  const now = new Date(); const year = now.getFullYear(); const month = now.getMonth()+1
  const items = await prisma.delivery.findMany({ where:{ year, month }, include:{ person:true, deliverer:true } })
  const rows = items.map(i=> ({ personId: i.personId, personName: i.person.name, delivererId: i.delivererId, delivererName: i.deliverer.name, deliveredAt: i.createdAt.toISOString() }) )
  const csv = rows.map(r=> Object.values(r).join(',')).join('\n')
  return new NextResponse(csv, { headers: { 'Content-Type':'text/csv', 'Content-Disposition':'attachment; filename="report.csv"' } })
}
