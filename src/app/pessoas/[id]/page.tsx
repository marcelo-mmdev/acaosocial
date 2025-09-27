'use client'
import React, { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'

export default function PessoaDetail({ params }: any){
  const id = params.id
  const [p, setP] = useState<any>(null)
  useEffect(()=>{ fetch('/api/pessoas/'+id).then(r=>r.json()).then(setP) },[id])
  if (!p) return <div className='p-4 sm:p-6 max-w-3xl mx-auto'>Carregando...</div>

  async function gerarCarteirinha(){
    const q = await fetch('/api/pessoas/'+id+'/qrcode')
    const { dataUrl } = await q.json()
    const doc = new jsPDF({ orientation:'landscape', unit:'pt', format:[300,180] })
    doc.setFontSize(14)
    doc.text(p.name, 20, 40)
    doc.text('CPF: '+p.cpf, 20, 60)
    if (p.photo){ doc.addImage(p.photo,'JPEG',200,20,70,70) }
    doc.addImage(dataUrl,'PNG',20,80,80,80)
    doc.save('carteirinha_'+p.cpf+'.pdf')
  }

  return (
    <div className='p-4 sm:p-6 max-w-3xl mx-auto'>
      <h1 className='text-2xl font-bold'>{p.name}</h1>
      {p.photo && <img src={p.photo} alt='' width={120} style={{maxWidth:'100%',height:'auto'}}/>}
      <div>CPF: {p.cpf}</div>
      <div>Telefone: {p.telefone}</div>
      <h2 className='mt-4 font-semibold'>Entregas</h2>
      <ul>{p.deliveries?.map((d:any)=> <li key={d.id}>{d.year}/{d.month} por {d.deliverer?.name}</li>)}</ul>
      <div className='mt-4 space-x-2'>
        <button onClick={gerarCarteirinha} className='px-3 py-1 bg-sky-600 text-white rounded'>Gerar Carteirinha PDF</button>
      </div>
    </div>
  )
}
