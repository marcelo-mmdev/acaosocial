'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useSession } from 'next-auth/react'

export default function QRPage(){
  const { data: session } = useSession()
  const [scanning, setScanning] = useState(false)
  const qrRef = useRef<HTMLDivElement | null>(null)
  let html5Qr: any = null

  useEffect(()=>{
    return ()=>{ if (scanning && html5Qr){ html5Qr.stop().catch(()=>{}) } }
  },[])

  if (!session) return <div className='p-4 sm:p-6 max-w-3xl mx-auto'>Faça login para usar o leitor.</div>

  async function startScanner(){
    if (!qrRef.current) return
    setScanning(true)
    const config = { fps: 10, qrbox: { width: 250, height: 250 } }
    html5Qr = new Html5Qrcode('reader')
    try {
      await html5Qr.start({ facingMode: 'environment' }, config, (decodedText:any)=>{ onScan(decodedText) }, (err:any)=>{})
    } catch(e){
      console.error(e)
      alert('Falha ao acessar câmera: '+e)
    }
  }

  async function stopScanner(){
    if (html5Qr){ await html5Qr.stop(); html5Qr.clear(); }
    setScanning(false)
  }

  async function onScan(data:any){
    if (!data) return
    try {
      const payload = JSON.parse(data)
      const confirmMsg = `Confirmar entrega para ${payload.name}?`
      if (window.confirm(confirmMsg)){
        const now = new Date()
        const body = { personId: payload.id, delivererId: Number(session.user?.id || 0), year: now.getFullYear(), month: now.getMonth()+1 }
        const res = await fetch('/api/deliveries', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) })
        const j = await res.json()
        if (res.ok) alert('Entrega registrada!')
        else alert('Erro: '+ (j.error || JSON.stringify(j)))
      }
    } catch(e){
      console.error(e)
      alert('QR inválido')
    } finally {
      await stopScanner()
    }
  }

  return (
    <div className='p-4 sm:p-6 max-w-3xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Leitor de QRCode</h1>
      <div id='reader' ref={qrRef} style={{width:'100%', maxWidth:360}} />
      <div className='mt-4 flex gap-2 items-center'>
        {!scanning ? <button onClick={startScanner} className='px-3 py-1 bg-green-600 text-white rounded'>Iniciar Scanner</button> : <button onClick={stopScanner} className='px-3 py-1 bg-red-600 text-white rounded'>Parar Scanner</button>}
      </div>
    </div>
  )
}
