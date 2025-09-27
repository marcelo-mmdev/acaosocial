import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
export async function GET(_:Request, { params }:{ params:{ personId:string } }){
  const payload = params.personId
  const png = await QRCode.toBuffer(payload, { width:256 })
  return new NextResponse(png, { headers: { 'Content-Type':'image/png' } })
}
