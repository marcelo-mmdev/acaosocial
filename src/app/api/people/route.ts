import { NextResponse } from 'next/server'
import prisma from 'prisma'
import formidable from 'formidable'
import fs from 'fs'
export const runtime = 'nodejs'

export async function GET(){ const people = await prisma.person.findMany({ orderBy:{ name:'asc' } }); return NextResponse.json(people) }

export const POST = async (req:Request) => {
  const form = new formidable.IncomingForm({ multiples:false })
  return new Promise(async (resolve)=>{
    form.parse((req as any), async (err, fields, files)=>{
      if (err) { console.error(err); return resolve(new NextResponse('parse error',{ status:500 })) }
      try{
        const photo = files?.photo
        let photoPath = null
        if (photo && photo.filepath){
          const data = fs.readFileSync(photo.filepath)
          const filename = 'uploads/'+Date.now()+'_'+(photo.originalFilename||'photo.jpg')
          fs.mkdirSync('public/uploads',{ recursive:true })
          fs.writeFileSync('public/'+filename, data)
          photoPath = '/'+filename
        }
        const p = await prisma.person.create({ data: {
          name: fields.name as string,
          cpf: fields.cpf as string,
          rg: fields.rg as string || null,
          birthDate: fields.birthDate ? new Date(fields.birthDate as string) : null,
          address: fields.address as string || null,
          phone: fields.phone as string || null,
          photo: photoPath
        }})
        resolve(new NextResponse(JSON.stringify(p), { status:200 }))
      }catch(e:any){ console.error(e); resolve(new NextResponse(e.message,{ status:500 })) }
    })
  })
}

export async function PUT(req:Request){
  const body = await req.json()
  const { id, name, cpf, address, phone } = body
  const p = await prisma.person.update({ where:{ id: Number(id) }, data:{ name, cpf, address, phone } })
  return NextResponse.json(p)
}

export async function DELETE(req:Request,{ params }:{ params:{ id:string } }){
  await prisma.person.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok:true })
}
