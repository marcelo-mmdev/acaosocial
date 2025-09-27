"use client"

import Image from "next/image"
import { Dialog, DialogContent } from "./ui/dialog"
import { QRCodeCanvas } from "qrcode.react"
import { Pessoa } from "../types/pessoa"

interface CarteirinhaModalProps {
  pessoa: Pessoa | null
  open: boolean
  onClose: () => void
}

export function CarteirinhaModal({ pessoa, open, onClose }: CarteirinhaModalProps) {
  if (!pessoa) return null

  const qrValue = `${pessoa.nome}-${pessoa.cpf}`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 bg-gray-100">
        <div className="w-full h-56 flex flex-row items-stretch rounded-lg shadow-lg overflow-hidden border border-gray-300">
          {/* Área da foto */}
          <div className="w-1/3 bg-gray-200 flex items-center justify-center">
            <Image
              src="/avatar-placeholder.png" // você pode trocar por upload futuramente
              alt="Foto da pessoa"
              width={120}
              height={120}
              className="rounded-md object-cover"
            />
          </div>

          {/* Área de dados */}
          <div className="flex-1 p-4 flex flex-col justify-between bg-white">
            <div>
              <h2 className="text-xl font-bold">{pessoa.nome}</h2>
              <p className="text-sm"><strong>CPF:</strong> {pessoa.cpf}</p>
              <p className="text-sm"><strong>RG:</strong> {pessoa.rg}</p>
              <p className="text-sm"><strong>Telefone:</strong> {pessoa.telefone}</p>
              <p className="text-sm"><strong>Nascimento:</strong> {pessoa.dataNascimento}</p>
              <p className="text-sm"><strong>Endereço:</strong> {pessoa.endereco}</p>
            </div>

            {/* QR Code no canto inferior direito */}
            <div className="flex justify-end mt-2">
              <QRCodeCanvas value={qrValue} size={80} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
