import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import prisma from 'prisma'

export async function GET(){
  const now = new Date(); const year = now.getFullYear(); const month = now.getMonth()+1
  const items = await prisma.delivery.findMany({ where:{ year, month }, include:{ person:true, deliverer:true } })
  const doc = new PDFDocument(); const chunks:Buffer[] = []
  doc.on('data', c=>chunks.push(c))
  doc.fontSize(14).text('Relatório de Entregas')
  items.forEach(i=> doc.text(`${i.person.name} - ${i.deliverer.name} - ${i.createdAt.toLocaleString()}`))
  doc.end()
  const body = await new Promise<Buffer>(res=> doc.on('end', ()=> res(Buffer.concat(chunks)) ))
  return new NextResponse(body, { headers:{ 'Content-Type':'application/pdf', 'Content-Disposition':'attachment; filename="report.pdf"' } })
}
