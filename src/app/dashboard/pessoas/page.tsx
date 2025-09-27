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

  const qrRef = useRef<HTMLCanvasElement | null>(null)

  // --- API ---
  const fetchPessoas = async () => {
    try {
      const res = await fetch("/api/pessoas");
      if (!res.ok) {
        const j = await res.json().catch(()=>null);
        console.error("Erro fetch /api/pessoas:", j || res.statusText);
        return;
      }
      const json = await res.json();
      const mapped = (json.data || []).map((p: any) => ({
        ...p,
        nome: p.nome ?? p.name,
        id: String(p.id),
      }));
      setPessoas(mapped);
    } catch (err) {
      console.error("Erro ao carregar pessoas:", err);
    }
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  const handleAddPessoa = async (novaPessoa: Pessoa) => {
    await fetch("/api/pessoas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaPessoa),
    });
    setAbrirAdd(false);
    await fetchPessoas();
  };

  const handleEditPessoa = async (pessoa: Pessoa) => {
    await fetch(`/api/pessoas/${pessoa.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pessoa),
    });
    setEditPessoa(null);
    await fetchPessoas();
  };

  const handleDeletePessoa = async (id: string) => {
    await fetch(`/api/pessoas/${id}`, { method: "DELETE" });
    await fetchPessoas();
  };


  // --- PDF Carteirinha ---
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
    p.nome?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-4 bg-white shadow-sm">
          <MobileSidebar />
          <h1 className="ml-4 font-semibold">Pessoas</h1>
        </header>

        <main className="flex-1 p-6 bg-gray-50">
          <div className="p-6 space-y-4">
            {/* Ações topo */}
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Pesquisar pessoas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={() => setAbrirAdd(true)}>Adicionar Pessoa</Button>
            </div>

            {/* Tabela */}
            <DataTable
              columns={getColumns({
                onEdit: (pessoa) => setEditPessoa(pessoa),
                onDelete: handleDeletePessoa,
                onCarteirinha: (pessoa) => setCarteirinhaPessoa(pessoa),
              })}
              data={filteredPessoas}
            />

            {/* Adicionar */}
            <Dialog open={abrirAdd} onOpenChange={setAbrirAdd}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Pessoa</DialogTitle>
                  <DialogDescription>Preencha os dados abaixo</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const novaPessoa: Pessoa = {
                      id: "",
                      nome: String(fd.get("nome")),
                      cpf: String(fd.get("cpf")),
                      rg: String(fd.get("rg")),
                      endereco: String(fd.get("endereco")),
                      telefone: String(fd.get("telefone")),
                      dataNascimento: String(fd.get("dataNascimento")),
                    }
                    handleAddPessoa(novaPessoa)
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                >
                  <Input name="nome" placeholder="Nome" required />
                  <Input name="cpf" placeholder="CPF" required />
                  <Input name="rg" placeholder="RG" required />
                  <Input name="endereco" placeholder="Endereço" required />
                  <Input name="telefone" placeholder="Telefone" required />
                  <Input name="dataNascimento" type="date" required />
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setAbrirAdd(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Editar */}
            {editPessoa && (
              <Dialog open={!!editPessoa} onOpenChange={() => setEditPessoa(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Pessoa</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      const pessoaEditada: Pessoa = {
                        ...editPessoa,
                        nome: String(fd.get("nome")),
                        cpf: String(fd.get("cpf")),
                        rg: String(fd.get("rg")),
                        endereco: String(fd.get("endereco")),
                        telefone: String(fd.get("telefone")),
                        dataNascimento: String(fd.get("dataNascimento")),
                      }
                      handleEditPessoa(pessoaEditada)
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                  >
                    <Input name="nome" defaultValue={editPessoa.nome} required />
                    <Input name="cpf" defaultValue={editPessoa.cpf} required />
                    <Input name="rg" defaultValue={editPessoa.rg} required />
                    <Input name="endereco" defaultValue={editPessoa.endereco} required />
                    <Input name="telefone" defaultValue={editPessoa.telefone} required />
                    <Input name="dataNascimento" type="date" defaultValue={editPessoa.dataNascimento} required />
                    <div className="md:col-span-2 flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setEditPessoa(null)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Salvar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {/* Carteirinha */}
            {carteirinhaPessoa && (
              <Dialog open={!!carteirinhaPessoa} onOpenChange={() => setCarteirinhaPessoa(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Carteirinha</DialogTitle>
                  </DialogHeader>
                  <div className="bg-[#f5f9f4] border-2 border-green-900 shadow-md rounded-xl p-5 relative">
                    <div className="text-center text-xs font-semibold text-green-900 space-y-1">
                      <p>REPÚBLICA FEDERATIVA DA CIDADE DE TACAIMBÓ</p>
                      <p>CARTEIRA DA SEC. ASSISTÊNCIA SOCIAL</p>
                    </div>
                    <div className="flex mt-4 gap-4">
                      <div className="w-20 h-24 border bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 rounded-md">
                        FOTO 3x4
                      </div>
                      <div className="flex-1 text-sm space-y-1">
                        <p><strong>Nome:</strong> {carteirinhaPessoa.nome}</p>
                        <p><strong>CPF:</strong> {carteirinhaPessoa.cpf}</p>
                        <p><strong>RG:</strong> {carteirinhaPessoa.rg}</p>
                        <p><strong>Nascimento:</strong> {carteirinhaPessoa.dataNascimento}</p>
                        <p><strong>Endereço:</strong> {carteirinhaPessoa.endereco}</p>
                        <p><strong>Telefone:</strong> {carteirinhaPessoa.telefone}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <QRCodeCanvas ref={qrRef} value={`${carteirinhaPessoa.nome} - ${carteirinhaPessoa.cpf}`} size={128} includeMargin />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => handleDownloadPDF(carteirinhaPessoa)}>Baixar PDF</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
