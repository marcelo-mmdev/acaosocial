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

// 📦 Funções de máscara e formatação
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{4})$/, "$1-$2")
}

const formatDate = (value: string) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "-";
  return `${day}/${month}/${year}`;
};


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

  // máscaras para os inputs do modal
  const [cpfValue, setCpfValue] = useState("")
  const [telefoneValue, setTelefoneValue] = useState("")

  const qrRef = useRef<HTMLCanvasElement | null>(null)

  // --- API: buscar lista (mapeia name->nome) ---
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

  // ✅ Verifica se já existe CPF cadastrado
  const cpfJaExiste = (cpf: string, ignorarId?: string) => {
    const clean = cpf.replace(/\D/g, "")
    return pessoas.some((p) => p.cpf.replace(/\D/g, "") === clean && p.id !== ignorarId)
  }

  // Adicionar pessoa
  const handleAddPessoa = async (novaPessoa: Pessoa) => {
    if (cpfJaExiste(novaPessoa.cpf)) {
      alert("⚠️ CPF já cadastrado!")
      return
    }

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
    if (cpfJaExiste(pessoa.cpf, pessoa.id)) {
      alert("⚠️ CPF já cadastrado!")
      return
    }

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

  // Deletar pessoa
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return
    try {
      await fetch(`/api/pessoas/${deleteCandidate.id}`, { method: "DELETE" })
      setPessoas((prev) => prev.filter((x) => x.id !== deleteCandidate.id))
      setDeleteCandidate(null)
      setConfirmDeleteOpen(false)
      fetchPessoas()
    } catch (err) {
      console.error("Erro ao deletar:", err)
      alert("Erro ao deletar pessoa")
    }
  }

  const refreshSelectedPerson = useCallback(async (id?: string) => {
    if (!id) return
    try {
      const res = await fetch(`/api/pessoas/${id}`)
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
      console.error("Erro ao atualizar detalhes:", err)
    }
  }, [])
  
const handleDownloadPDF = (pessoa: Pessoa) => {
  const cardW = 100; // largura da carteirinha (mm)
  const cardH = 70;  // altura (mm)
  const borderRadius = 5;
  const marginTop = 20;
  const spacing = 1; // espaço entre frente e verso

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const offsetY = (doc.internal.pageSize.getHeight() - cardH) / 2;
  const offsetX = (pageW - (cardW * 2 + spacing)) / 2;

  const drawCardFront = () => {
    const x = offsetX;
    const y = offsetY;

    // fundo e borda
    doc.setFillColor(252, 253, 255);
    doc.roundedRect(x, y, cardW, cardH, borderRadius, borderRadius, "F");
    doc.setDrawColor(11, 58, 97);
    doc.setLineWidth(0.8);
    doc.roundedRect(x + 1, y + 1, cardW - 2, cardH - 2, borderRadius - 1, borderRadius - 1);

    // logo
    try {
      const logo = imagem.src;
      doc.addImage(logo, "PNG", x + (cardW - 30) / 2, y + 5, 30, 10);
    } catch {}

    // cabeçalho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text("SECRETARIA DE ASSISTÊNCIA SOCIAL", x + cardW / 2, y + 20, { align: "center" });
    doc.text("ALIMENTO DIREITO DE TODOS", x + cardW / 2, y + 25, { align: "center" });

    // moldura da foto
    const photo = { x: x + 6, y: y + 32, w: 22, h: 28 };
    doc.setDrawColor(180);
    doc.roundedRect(photo.x, photo.y, photo.w, photo.h, 2, 2);
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text("FOTO 3x4", photo.x + photo.w / 2, photo.y + photo.h / 2 + 2, { align: "center" });

    // dados da pessoa
    let dx = photo.x + photo.w + 4;
    let dy = photo.y + 2;
    const lh = 5;
    const textMaxWidth = cardW - (photo.w + 16);

    const row = (label: string, value?: string | null) => {
      const labelText = `${label}: `;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60); // cor do rótulo (cinza escuro)
      doc.text(labelText, dx, dy);

      const lblW = doc.getTextWidth(labelText);
      const textX = dx + lblW;

      // Quebra de linha automática se o texto for longo
      const wrappedText = doc.splitTextToSize(value || "-", textMaxWidth - lblW);

      // texto do valor em preto
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(wrappedText, textX, dy);

      // avança Y considerando linhas quebradas
      dy += lh * wrappedText.length;
    };

    row("Código", String(pessoa.id));
    row("Nome", pessoa.nome);
    row("CPF", formatCPF(pessoa.cpf));
    row("DN", formatDate(pessoa.dataNascimento));
    row("End", pessoa.endereco);
    row("Telefone", formatPhone(pessoa.telefone));

    // QR pequeno (sem borda)
   {/*} const qrSize = 24;
    const qrX = x + cardW - qrSize - 2;
    const qrY = y + cardH - qrSize - 18;
    const canvas = qrRef.current;

    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL("image/png");
        // 🔸 Removido o doc.roundedRect() da borda
        doc.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      } catch (err) {
        console.warn("Erro ao adicionar QR pequeno:", err);
      }
    }*/}
  };


  const drawCardBack = () => {
    const x = offsetX + cardW + spacing;
    const y = offsetY;

    // fundo e borda
    doc.setFillColor(252, 253, 255);
    doc.roundedRect(x, y, cardW, cardH, borderRadius, borderRadius, "F");
    doc.setDrawColor(11, 58, 97);
    doc.setLineWidth(0.8);
    doc.roundedRect(x + 1, y + 1, cardW - 2, cardH - 2, borderRadius - 1, borderRadius - 1);

    // QR grande
    const canvas = qrRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const bigQR = 40;
      doc.addImage(dataUrl, "PNG", x + (cardW - bigQR) / 2, y + (cardH - bigQR) / 2 - 9, bigQR, bigQR);
    }

    // nome e CPF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(pessoa.nome, x + cardW / 2, y + cardH - 18, { align: "center" });
    doc.text(pessoa.cpf, x + cardW / 2, y + cardH - 14, { align: "center" });

    // rodapé
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(
      "Prefeitura Municipal • Secretaria de Assistência Social",
      x + cardW / 2,
      y + cardH - 8,
      { align: "center" }
    );
  };

  // desenhar frente e verso
  drawCardFront();
  drawCardBack();

  // salvar
  doc.save(`carteirinha-${pessoa.nome}.pdf`);
};


  const filteredPessoas = pessoas.filter((p) =>
    (p.nome + p.cpf).toLowerCase().includes(search.toLowerCase())
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
          <h1 className="ml-4 font-semibold">Gerenciar Beneficiários</h1>
        </header>
        <main className="flex-1 p-6 bg-gray-50">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
              <Button onClick={() => setAbrirAdd(true)} className="bg-green-600 hover:bg-green-700 text-white">
                + Beneficiário
              </Button>
            </div>

            <DataTable
              columns={getColumns({
                onView: (p) => {
                  setSelectedPerson(p)
                  setDetailOpen(true)
                  refreshSelectedPerson(p.id)
                },
                onEdit: (p) => {
                  setEditPessoa(p)
                  setCpfValue(formatCPF(p.cpf))
                  setTelefoneValue(formatPhone(p.telefone))
                },
                onDelete: (p) => {
                  setDeleteCandidate(p)
                  setConfirmDeleteOpen(true)
                },
                onCarteirinha: (p) => setCarteirinhaPessoa(p),
              })}
              data={filteredPessoas}
            />

            {/* ---------- Modal Adicionar ---------- */}
            <Dialog open={abrirAdd} onOpenChange={setAbrirAdd}>
              <DialogContent className="bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
                <DialogHeader>
                  <DialogTitle>Adicionar Beneficiário</DialogTitle>
                  <DialogDescription>Preencha os dados abaixo</DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const novaPessoa: Pessoa = {
                      id: "",
                      nome: String(fd.get("nome") || ""),
                      cpf: cpfValue,
                      rg: String(fd.get("rg") || ""),
                      endereco: String(fd.get("endereco") || ""),
                      telefone: telefoneValue,
                      dataNascimento: String(fd.get("dataNascimento") || ""),
                      deliveries: [],
                    }
                    handleAddPessoa(novaPessoa)
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                >
                  <Input name="nome" placeholder="Nome" required />
                  <Input
                    name="cpf"
                    placeholder="CPF"
                    value={cpfValue}
                    onChange={(e) => setCpfValue(formatCPF(e.target.value))}
                    required
                  />
                  <Input name="rg" placeholder="RG" />
                  <Input name="endereco" placeholder="Endereço" />
                  <Input
                    name="telefone"
                    placeholder="Telefone"
                    value={telefoneValue}
                    onChange={(e) => setTelefoneValue(formatPhone(e.target.value))}
                  />
                  <Input name="dataNascimento" type="date" />
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <Button type="button" onClick={() => setAbrirAdd(false)} className="bg-red-600 hover:bg-red-700 text-white">
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
                <DialogContent className="bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
                  <DialogHeader>
                    <DialogTitle>Editar Beneficiário</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      const pessoaEditada: Pessoa = {
                        ...editPessoa,
                        nome: String(fd.get("nome") || editPessoa.nome),
                        cpf: cpfValue,
                        rg: String(fd.get("rg") || editPessoa.rg),
                        endereco: String(fd.get("endereco") || editPessoa.endereco),
                        telefone: telefoneValue,
                        dataNascimento: String(fd.get("dataNascimento") || editPessoa.dataNascimento),
                        deliveries: editPessoa.deliveries || [],
                      }
                      handleEditPessoa(pessoaEditada)
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                  >
                    <Input name="nome" defaultValue={editPessoa.nome} required />
                    <Input
                      name="cpf"
                      value={cpfValue}
                      onChange={(e) => setCpfValue(formatCPF(e.target.value))}
                      required
                    />
                    <Input name="rg" defaultValue={editPessoa.rg} />
                    <Input name="endereco" defaultValue={editPessoa.endereco} />
                    <Input
                      name="telefone"
                      value={telefoneValue}
                      onChange={(e) => setTelefoneValue(formatPhone(e.target.value))}
                    />
                    <Input name="dataNascimento" type="date" defaultValue={editPessoa.dataNascimento} />
                    <div className="md:col-span-2 flex justify-end gap-3">
                      <Button type="button" onClick={() => setEditPessoa(null)} className="bg-red-600 hover:bg-red-700 text-white">
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
                <DialogContent className="bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
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
                        <p><strong>Código:</strong> {carteirinhaPessoa.id}</p>
                        <p><strong>Nome:</strong> {carteirinhaPessoa.nome}</p>
                        <p><strong>CPF:</strong> {carteirinhaPessoa.cpf}</p>
                        <p><strong>RG:</strong> {carteirinhaPessoa.rg}</p>
                        <p><strong>Nascimento:</strong> {formatDate(carteirinhaPessoa.dataNascimento)}</p>
                        <p><strong>Endereço:</strong> {carteirinhaPessoa.endereco}</p>
                        <p><strong>Telefone:</strong> {carteirinhaPessoa.telefone}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <QRCodeCanvas ref={qrRef} value={String(carteirinhaPessoa.id)} size={128} includeMargin />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => handleDownloadPDF(carteirinhaPessoa)} className="bg-blue-600 hover:bg-blue-700 text-white">Baixar PDF</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* ---------- Modal Detalhes (clicar no nome) ---------- */}
            <Dialog open={detailOpen} onOpenChange={(v) => { if (!v) setSelectedPerson(null); setDetailOpen(v) }}>
              <DialogContent className="bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
                <DialogHeader>
                  <DialogTitle className="--foreground">Detalhes</DialogTitle>
                  <DialogDescription className="--foreground">Informações e histórico de entregas (cestas)</DialogDescription>
                </DialogHeader>

                {selectedPerson ? (
                  <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-28 border bg-gray-100 flex items-center justify-center">FOTO</div>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedPerson.nome}</h3>

                        {/* CPF formatado */}
                        <div>
                          CPF:{" "}
                          {selectedPerson.cpf
                            ? selectedPerson.cpf
                                .replace(/\D/g, "")
                                .replace(/(\d{3})(\d)/, "$1.$2")
                                .replace(/(\d{3})(\d)/, "$1.$2")
                                .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
                            : "-"}
                        </div>

                        <div>RG: {selectedPerson.rg || "-"}</div>
                        <div>Nasc: {selectedPerson.dataNascimento || "-"}</div>

                        {/* Telefone formatado */}
                        <div>
                          Tel:{" "}
                          {selectedPerson.telefone
                            ? selectedPerson.telefone
                                .replace(/\D/g, "")
                                .replace(/(\d{2})(\d)/, "($1) $2")
                                .replace(/(\d{5})(\d{4})$/, "$1-$2")
                            : "-"}
                        </div>

                        <div>Endereço: {selectedPerson.endereco || "-"}</div>
                      </div>
                    </div>

                    {/* --- Status por mês do ano atual --- */}
                    <div>
                      <h4 className="font-semibold">
                        Cestas recebidas no ano {new Date().getFullYear()}
                      </h4>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {meses.map((m, idx) => {
                          const monthNumber = idx + 1;
                          const entrega = (selectedPerson.deliveries || []).find(
                            (d: any) =>
                              Number(d.year) === new Date().getFullYear() &&
                              Number(d.month) === monthNumber
                          );
                          const deliveredAt = entrega?.deliveredAt ?? entrega?.createdAt;
                          const has = !!deliveredAt;
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
                          );
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
                          const dt = d.deliveredAt ?? d.createdAt;
                          return (
                            <li key={d.id}>
                              {d.year}/{String(d.month).padStart(2, "0")} —{" "}
                              {dt ? new Date(dt).toLocaleString() : "Não recebido"}
                            </li>
                          );
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
              <DialogContent className="bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
                <DialogHeader>
                  <DialogTitle className="--foreground">Confirmar exclusão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Tem certeza que deseja excluir <strong>{deleteCandidate?.nome}</strong>?</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setConfirmDeleteOpen(false); setDeleteCandidate(null) }}  className="bg-red-600 hover:bg-red-700 text-white">Cancelar</Button>
                    <Button variant="destructive" onClick={handleConfirmDelete} className="bg-green-600 hover:bg-green-700 text-white">Excluir</Button>
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
