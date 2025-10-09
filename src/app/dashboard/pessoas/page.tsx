// src/app/dashboard/pessoas/page.tsx
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
import imagem from "../../../image/logo-horizontal.png"


export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [search, setSearch] = useState("")
  const [editPessoa, setEditPessoa] = useState<Pessoa | null>(null)
  const [carteirinhaPessoa, setCarteirinhaPessoa] = useState<Pessoa | null>(null)
  const [abrirAdd, setAbrirAdd] = useState(false)

  // modal detalhe
  const [selectedPerson, setSelectedPerson] = useState<Pessoa | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // modal confirmação delete
  const [deleteCandidate, setDeleteCandidate] = useState<Pessoa | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const qrRef = useRef<HTMLCanvasElement | null>(null)

  // --- API: buscar lista (mapeia name->nome) ---
  const fetchPessoas = async () => {
    try {
      const res = await fetch("/api/pessoas")
      const json = await res.json()
      const raw = json.data || []
      // normaliza campos para o frontend (nome em pt)
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

  // adicionar pessoa (front envia objeto com "nome" — o back aceita name||nome)
  const handleAddPessoa = async (novaPessoa: Pessoa) => {
    await fetch("/api/pessoas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // envia tanto name quanto nome para segurança
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

  // abre modal de confirmação (não deleta direto)
  const handleAskDeletePessoa = (p: Pessoa) => {
    setDeleteCandidate(p)
    setConfirmDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return
    try {
      await fetch(`/api/pessoas/${deleteCandidate.id}`, { method: "DELETE" })
      setPessoas((prev) => prev.filter((x) => x.id !== deleteCandidate.id))
      setDeleteCandidate(null)
      setConfirmDeleteOpen(false)
      // atualizar lista por segurança
      fetchPessoas()
    } catch (err) {
      console.error("Erro ao deletar:", err)
      alert("Erro ao deletar pessoa")
    }
  }

  // REFRESH: pega detalhe atualizado de uma pessoa (inclui deliveries)
  const refreshSelectedPerson = useCallback(async (id?: string) => {
    if (!id) return
    try {
      const res = await fetch(`/api/pessoas/${id}`)
      if (!res.ok) return
      const json = await res.json()
      const data = json.data ?? json
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
    } catch (err) {
      console.error("Erro ao atualizar detalhes da pessoa:", err)
    }
  }, [])

  // pegar detalhe de uma pessoa (inicia com os dados do row e abre modal)
  const onView = async (p: Pessoa) => {
    try {
      // setamos um objeto inicial (pode vir das listagem) para exibir algo rápido
      setSelectedPerson(p)
      setDetailOpen(true)
      // e já pedimos a versão definitiva do servidor (com deliveries atualizadas)
      await refreshSelectedPerson(p.id)
    } catch (err) {
      console.error(err)
      alert("Erro ao carregar detalhes")
    }
  }

  // sempre que abrir o modal para uma pessoa já selecionada, atualiza as entregas
  useEffect(() => {
    if (detailOpen && selectedPerson?.id) {
      refreshSelectedPerson(selectedPerson.id)
    }
  }, [detailOpen, selectedPerson?.id, refreshSelectedPerson])

// Substitua sua função handleDownloadPDF atual por esta
const handleDownloadPDF = (pessoa: Pessoa) => {
  // Tamanho da carteirinha em milímetros (10cm x 7cm)
  const width = 100
  const height = 70
  const doc = new jsPDF("landscape", "mm", [height, width])

  // Fundo e borda
  doc.setFillColor(252, 253, 255)
  doc.roundedRect(0, 0, width, height, 4, 4, "F");
  doc.setDrawColor(11, 58, 97)
  doc.setLineWidth(0.8)
  doc.roundedRect(2, 2, width - 4, height - 4, 3, 3);

  // Logo (centralizada no topo)
  try {
    const logo = imagem.src // substitua por sua logo
    doc.addImage(logo, "PNG", width / 2 - 12, 4, 24, 10)
  } catch (err) {
    console.warn("Logo não encontrada ou inválida")
  }

  // Título
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(10, 10, 10)
  doc.text("SECRETARIA DE ASSISTÊNCIA SOCIAL", width / 2, 18, { align: "center" })
  doc.text("ALIMENTO DIREITO DE TODOS", width / 2, 23, { align: "center" })

  // Foto 3x4 (28mm x 36mm equivalente no formato original, mas proporcional)
  const photo = { x: 6, y: 27, w: 21, h: 28 }
  doc.setDrawColor(150)
  doc.rect(photo.x, photo.y, photo.w, photo.h)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(120)
  doc.text("FOTO 3x4", photo.x + photo.w / 2, photo.y + photo.h / 2 + 2, { align: "center" })

  // Dados da pessoa
  let x = photo.x + photo.w + 6
  let y = photo.y + 5
  const lh = 4

  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold")
    doc.text(`${label}: `, x, y)
    const lblW = doc.getTextWidth(`${label}: `)
    doc.setFont("helvetica", "normal")
    doc.text(value || "-", x + lblW, y)
    y += lh
  }

  row("Código", 101+pessoa.id)
  row("Nome", pessoa.nome)
  row("CPF", pessoa.cpf)
  row("Nascimento", pessoa.dataNascimento)
  row("Endereço", pessoa.endereco)
  row("Telefone", pessoa.telefone)

  // QR Code
  const canvas = qrRef.current
  if (canvas) {
    const dataUrl = canvas.toDataURL("image/png")
    const qrSize = 25
    const qrX = width - qrSize - 6
    const qrY = height - qrSize - 14
    doc.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize)
  }

  doc.save(`carteirinha-${pessoa.nome}.pdf`)
}


  // filtro por pesquisa
  const filteredPessoas = pessoas.filter((p) =>
    (p.nome || "").toLowerCase().includes(search.toLowerCase())
  )

  // meses para exibir no modal
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
            {/* Ações topo */}
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="Pesquisar pessoas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={() => setAbrirAdd(true)} className="bg-green-600 hover:bg-green-700 text-white">+ Beneficiário</Button>
            </div>

            {/* Tabela */}
            <DataTable
              columns={getColumns({
                onView,
                onEdit: (pessoa) => setEditPessoa(pessoa),
                onDelete: handleAskDeletePessoa,
                onCarteirinha: (pessoa) => setCarteirinhaPessoa(pessoa),
              })}
              data={filteredPessoas}
            />

            {/* ---------- Modal Adicionar ---------- */}
            <Dialog open={abrirAdd} onOpenChange={setAbrirAdd}>
              <DialogContent className="bg-gradient-to-br from-[#e3effc] to-[#3b3b3b]">
                <DialogHeader>
                  <DialogTitle className="--foreground">Adicionar Beneficiário</DialogTitle>
                  <DialogDescription className="--foreground">Preencha os dados abaixo</DialogDescription>
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

            {/* ---------- Modal Editar ---------- */}
            {editPessoa && (
              <Dialog open={!!editPessoa} onOpenChange={() => setEditPessoa(null)}>
                <DialogContent className="bg-gradient-to-br from-[#e3effc] to-[#3b3b3b]">
                  <DialogHeader>
                    <DialogTitle className="--foreground">Editar Beneficiário</DialogTitle>
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
                        deliveries: editPessoa.deliveries || [],
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

            {/* ---------- Modal Carteirinha ---------- */}
            {carteirinhaPessoa && (
              <Dialog open={!!carteirinhaPessoa} onOpenChange={() => setCarteirinhaPessoa(null)}>
                <DialogContent className="bg-gradient-to-br from-[#e3effc] to-[#3b3b3b]">
                  <DialogHeader>
                    <DialogTitle className="--foreground">Carteirinha</DialogTitle>
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
                      <QRCodeCanvas ref={qrRef} value={String(carteirinhaPessoa.id)} size={128} includeMargin />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => handleDownloadPDF(carteirinhaPessoa)}>Baixar PDF</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* ---------- Modal Detalhes (clicar no nome) ---------- */}
            <Dialog open={detailOpen} onOpenChange={(v) => { if (!v) setSelectedPerson(null); setDetailOpen(v) }}>
              <DialogContent className="bg-gradient-to-br from-[#e3effc] to-[#3b3b3b]">
                <DialogHeader>
                  <DialogTitle className="--foreground">Detalhes da Pessoa</DialogTitle>
                  <DialogDescription className="--foreground">Informações e histórico de entregas (cestas)</DialogDescription>
                </DialogHeader>

                {selectedPerson ? (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-28 border bg-gray-100 flex items-center justify-center">FOTO</div>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedPerson.nome}</h3>
                        <div>CPF: {selectedPerson.cpf}</div>
                        <div>RG: {selectedPerson.rg || "-"}</div>
                        <div>Nasc: {selectedPerson.dataNascimento || "-"}</div>
                        <div>Tel: {selectedPerson.telefone || "-"}</div>
                        <div>Endereço: {selectedPerson.endereco || "-"}</div>
                      </div>
                    </div>

                    {/* --- Status por mês do ano atual --- */}
                    <div>
                      <h4 className="font-semibold">Cestas recebidas no ano {new Date().getFullYear()}</h4>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {meses.map((m, idx) => {
                          const monthNumber = idx + 1
                          // procura entrega no mês/ano
                          const entrega = (selectedPerson.deliveries || []).find(
                            (d: any) =>
                              Number(d.year) === new Date().getFullYear() &&
                              Number(d.month) === monthNumber
                          )
                          // considera createdAt como deliveredAt quando deliveredAt não existir
                          const deliveredAt = entrega?.deliveredAt ?? entrega?.createdAt
                          const has = !!deliveredAt
                          return (
                            <div
                              key={m}
                              className={`p-2 rounded ${
                                has
                                  ? "bg-green-100 border border-green-400"
                                  : "bg-red-100 border border-red-300"
                              }`}
                            >
                              <div className="text-sm font-medium">{m}</div>
                              <div className="text-xs">
                                {has
                                  ? `Recebeu ✅ (${new Date(deliveredAt as string).toLocaleDateString()})`
                                  : "Não recebeu ❌"}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* --- Histórico de entregas --- */}
                    <div>
                      <h4 className="font-semibold">Histórico de entregas</h4>
                      <ul className="list-disc pl-5">
                        {(selectedPerson.deliveries || []).length === 0 && (
                          <li>Nenhuma entrega registrada</li>
                        )}
                        {(selectedPerson.deliveries || []).map((d: any) => {
                          const dt = d.deliveredAt ?? d.createdAt
                          return (
                            <li key={d.id}>
                              {d.year}/{String(d.month).padStart(2, "0")} —{" "}
                              {dt ? new Date(dt).toLocaleString() : "Não recebido"}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>Carregando...</div>
                )}
              </DialogContent>
            </Dialog>

            {/* ---------- Modal Confirmação Deletar ---------- */}
            <Dialog open={confirmDeleteOpen} onOpenChange={(v) => { if (!v) setDeleteCandidate(null); setConfirmDeleteOpen(v) }}>
              <DialogContent className="bg-gradient-to-br from-[#e3effc] to-[#3b3b3b]">
                <DialogHeader>
                  <DialogTitle className="--foreground">Confirmar exclusão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Tem certeza que deseja excluir <strong>{deleteCandidate?.nome}</strong>?</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setConfirmDeleteOpen(false); setDeleteCandidate(null) }}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleConfirmDelete}>Excluir</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </main>
      </div>
    </div>
  )
}
