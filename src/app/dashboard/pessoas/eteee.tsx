"use client"

import { useEffect, useRef, useState } from "react"
import { DataTable } from "../../../components/data-table"
import { getColumns, Pessoa } from "./columns"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"
import { QRCodeCanvas } from "qrcode.react"
import { jsPDF } from "jspdf"
import { MobileSidebar } from "../../../components/mobileSidebar"
import { Sidebar } from "../../../components/sidebar"

export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [search, setSearch] = useState("")
  const [editPessoa, setEditPessoa] = useState<Pessoa | null>(null)
  const [carteirinhaPessoa, setCarteirinhaPessoa] = useState<Pessoa | null>(null)
  const [abrirAdd, setAbrirAdd] = useState(false)

  const [selectedPerson, setSelectedPerson] = useState<Pessoa | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const qrRef = useRef<HTMLCanvasElement | null>(null)

  const fetchPessoas = async () => {
    try {
      const res = await fetch("/api/pessoas")
      const json = await res.json()
      const raw = json.data || []
      const mapped: Pessoa[] = raw.map((p: any) => ({
        id: String(p.id),
        nome: p.nome || p.name || "",
        cpf: p.cpf || "",
        rg: p.rg || "",
        endereco: p.endereco || p.address || "",
        telefone: p.telefone || p.phone || "",
        dataNascimento: p.dataNascimento || p.birthDate || "",
        deliveries: p.deliveries || [],
      }))
      setPessoas(mapped)
    } catch (err) {
      console.error("Erro ao carregar pessoas:", err)
      setPessoas([])
    }
  }

  useEffect(() => {
    fetchPessoas()
  }, [])

  const handleAddPessoa = async (novaPessoa: Pessoa) => {
    await fetch("/api/pessoas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: novaPessoa.nome,
        name: novaPessoa.nome,
        cpf: novaPessoa.cpf,
        rg: novaPessoa.rg,
        endereco: novaPessoa.endereco,
        telefone: novaPessoa.telefone,
        dataNascimento: novaPessoa.dataNascimento,
      }),
    })
    setAbrirAdd(false)
    fetchPessoas()
  }

  const handleEditPessoa = async (pessoa: Pessoa) => {
    await fetch(`/api/pessoas/${pessoa.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: pessoa.id,
        nome: pessoa.nome,
        name: pessoa.nome,
        cpf: pessoa.cpf,
        rg: pessoa.rg,
        endereco: pessoa.endereco,
        telefone: pessoa.telefone,
        dataNascimento: pessoa.dataNascimento,
      }),
    })
    setEditPessoa(null)
    fetchPessoas()
  }

  const handleDeletePessoa = async (id: string) => {
    await fetch(`/api/pessoas/${id}`, { method: "DELETE" })
    setPessoas((prev) => prev.filter((p) => p.id !== id))
  }

  const onView = async (p: Pessoa) => {
    try {
      const res = await fetch(`/api/pessoas/${p.id}`)
      if (!res.ok) {
        alert("Erro ao carregar detalhes")
        return
      }
      const data = await res.json()
      const person: Pessoa = {
        id: String(data.id),
        nome: data.nome || data.name || "",
        cpf: data.cpf || "",
        rg: data.rg || "",
        endereco: data.endereco || data.address || "",
        telefone: data.telefone || data.phone || "",
        dataNascimento: data.dataNascimento || data.birthDate || "",
        deliveries: data.deliveries || [],
      }
      setSelectedPerson(person)
      setDetailOpen(true)
    } catch (err) {
      console.error(err)
      alert("Erro ao carregar detalhes")
    }
  }

  const handleDownloadPDF = (pessoa: Pessoa) => {
    const doc = new jsPDF("portrait", "mm", "a4")
    const card = { x: 30, y: 30, w: 150, h: 90 }
    doc.setDrawColor(0, 100, 0)
    doc.setLineWidth(0.8)
    doc.rect(card.x, card.y, card.w, card.h)

    doc.setTextColor(0, 100, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("REPÚBLICA FEDERATIVA DA CIDADE DE TACAIMBÓ", card.x + card.w / 2, card.y + 10, { align: "center" })
    doc.text("CARTEIRA DA SEC. ASSISTÊNCIA SOCIAL", card.x + card.w / 2, card.y + 17, { align: "center" })

    const photo = { x: card.x + 8, y: card.y + 26, w: 28, h: 36 }
    doc.setDrawColor(150)
    doc.rect(photo.x, photo.y, photo.w, photo.h)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text("FOTO 3x4", photo.x + photo.w / 2, photo.y + photo.h / 2 + 2, { align: "center" })

    const startX = photo.x + photo.w + 8
    let y = photo.y + 6
    const lineH = 5
    doc.setFontSize(10)
    doc.setTextColor(0)

    const row = (label: string, value: string) => {
      const lbl = `${label}: `
      doc.setFont("helvetica", "bold")
      doc.text(lbl, startX, y)
      const lblW = doc.getTextWidth(lbl)
      doc.setFont("helvetica", "normal")
      doc.text(value || "-", startX + lblW, y)
      y += lineH
    }

    row("Nome", pessoa.nome)
    row("CPF", pessoa.cpf)
    row("RG", pessoa.rg)
    row("Nascimento", pessoa.dataNascimento)
    row("Endereço", pessoa.endereco)
    row("Telefone", pessoa.telefone)

    const canvas = qrRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png")
      const qrSize = 38
      const qrX = card.x + card.w - qrSize - 10
      const qrY = card.y + card.h - qrSize - 10
      doc.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize)
    }

    doc.save(`carteirinha-${pessoa.nome}.pdf`)
  }

  const filteredPessoas = pessoas.filter((p) =>
    (p.nome || "").toLowerCase().includes(search.toLowerCase())
  )

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-4 bg-white shadow-sm">
          <MobileSidebar />
          <h1 className="ml-4 font-semibold">Gerenciar Beneficíarios</h1>
        </header>

        <main className="flex-1 p-6 bg-gray-50">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Pesquisar pessoas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button
                onClick={() => setAbrirAdd(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + Beneficiário
              </Button>
            </div>

            <DataTable
              columns={getColumns({
                onView,
                onEdit: (pessoa) => setEditPessoa(pessoa),
                onDelete: handleDeletePessoa,
                onCarteirinha: (pessoa) => setCarteirinhaPessoa(pessoa),
              })}
              data={filteredPessoas}
            />

            {/* Modal Adicionar */}
            <Dialog open={abrirAdd} onOpenChange={setAbrirAdd}>
              <DialogContent className="bg-gradient-to-br from-green-50 to-green-100">
                <DialogHeader>
                  <DialogTitle className="text-green-700">Adicionar Beneficiário</DialogTitle>
                  <DialogDescription className="text-green-600">Preencha os dados abaixo</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const novaPessoa: Pessoa = {
                      id: "",
                      nome: String(fd.get("nome") || ""),
                      cpf: String(fd.get("cpf") || ""),
                      rg: String(fd.get("rg") || ""),
                      endereco: String(fd.get("endereco") || ""),
                      telefone: String(fd.get("telefone") || ""),
                      dataNascimento: String(fd.get("dataNascimento") || ""),
                      deliveries: [],
                    }
                    handleAddPessoa(novaPessoa)
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                >
                  <Input name="nome" placeholder="Nome" required />
                  <Input name="cpf" placeholder="CPF" required />
                  <Input name="rg" placeholder="RG" />
                  <Input name="endereco" placeholder="Endereço" />
                  <Input name="telefone" placeholder="Telefone" />
                  <Input name="dataNascimento" type="date" />
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setAbrirAdd(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      Salvar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Modal Editar */}
            {editPessoa && (
              <Dialog open={!!editPessoa} onOpenChange={() => setEditPessoa(null)}>
                <DialogContent className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <DialogHeader>
                    <DialogTitle className="text-blue-700">Editar Beneficiário</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      const pessoaEditada: Pessoa = {
                        ...editPessoa,
                        nome: String(fd.get("nome") || editPessoa.nome),
                        cpf: String(fd.get("cpf") || editPessoa.cpf),
                        rg: String(fd.get("rg") || editPessoa.rg),
                        endereco: String(fd.get("endereco") || editPessoa.endereco),
                        telefone: String(fd.get("telefone") || editPessoa.telefone),
                        dataNascimento: String(fd.get("dataNascimento") || editPessoa.dataNascimento),
                      }
                      handleEditPessoa(pessoaEditada)
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                  >
                    <Input name="nome" defaultValue={editPessoa.nome} required />
                    <Input name="cpf" defaultValue={editPessoa.cpf} required />
                    <Input name="rg" defaultValue={editPessoa.rg} />
                    <Input name="endereco" defaultValue={editPessoa.endereco} />
                    <Input name="telefone" defaultValue={editPessoa.telefone} />
                    <Input name="dataNascimento" type="date" defaultValue={editPessoa.dataNascimento} />
                    <div className="md:col-span-2 flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setEditPessoa(null)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Salvar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            
          </div>
        </main>
      </div>
    </div>
  )
}
