
            {/* ---------- Modal Adicionar ---------- */}
            <Dialog open={abrirAdd} onOpenChange={setAbrirAdd}>
              <DialogContent className="bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
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
                    <Button type="button" variant="outline" onClick={() => setAbrirAdd(false)} className="bg-red-600 hover:bg-red-700 text-white">
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






"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Sidebar } from "../../components/sidebar";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import imagem from "../../image/logo-horizontal.png";

type Person = {
  id: number;
  nome: string;
  cpf: string | null;
  rg: string | null;
  endereco: string | null;
  telefone: string | null;
  dataNascimento: string | null;
};

type User = {
  id: number;
  name: string;
  email: string;
};

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>("");
  const [data, setData] = useState<(Person | User)[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const fetchReport = async () => {
    if (!reportType) return;
    setLoading(true);
    setData([]);

    try {
      const params = new URLSearchParams({ type: reportType });
      if (["received", "not-received", "deliverers"].includes(reportType)) {
        params.append("month", String(month));
        params.append("year", String(year));
      }

      const res = await fetch(`/api/reports?${params.toString()}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: "pdf" | "excel") => {
    try {
      const params = new URLSearchParams({ type: reportType, format });
      if (["received", "not-received", "deliverers"].includes(reportType)) {
        params.append("month", String(month));
        params.append("year", String(year));
      }

      const res = await fetch(`/api/reports/export?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao exportar relatório");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${reportType}.${format === "pdf" ? "pdf" : "xlsx"}`;
      link.click();
    } catch (err) {
      console.error("Erro na exportação:", err);
      alert("Não foi possível exportar o relatório.");
    }
  };

  // ✅ Gera carteirinha individual (com mesmo design)
  const generateCardPDF = (pessoa: Person): ArrayBuffer => {
    const width = 100;
    const height = 70;
    const doc = new jsPDF("landscape", "mm", [height, width]);

    // Fundo e borda
    doc.setFillColor(252, 253, 255);
    doc.rect(0, 0, width, height, "F");
    doc.setDrawColor(11, 58, 97);
    doc.setLineWidth(0.8);
    doc.rect(2, 2, width - 4, height - 4);

    // Logo
    try {
      doc.addImage(imagem.src, "PNG", width / 2 - 12, 4, 24, 10);
    } catch (err) {
      console.warn("Logo não encontrada ou inválida");
    }

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(10, 10, 10);
    doc.text("SECRETARIA DE ASSISTÊNCIA SOCIAL", width / 2, 18, { align: "center" });
    doc.text("ALIMENTO DIREITO DE TODOS", width / 2, 23, { align: "center" });

    // Foto
    const photo = { x: 6, y: 27, w: 21, h: 28 };
    doc.setDrawColor(150);
    doc.rect(photo.x, photo.y, photo.w, photo.h);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text("FOTO 3x4", photo.x + photo.w / 2, photo.y + photo.h / 2 + 2, { align: "center" });

    // Dados
    let x = photo.x + photo.w + 6;
    let y = photo.y + 5;
    const lh = 4;

    const row = (label: string, value: string | null | undefined) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}: `, x, y);
      const lblW = doc.getTextWidth(`${label}: `);
      doc.setFont("helvetica", "normal");
      doc.text(value || "-", x + lblW, y);
      y += lh;
    };

    row("Código", String(101 + pessoa.id));
    row("Nome", pessoa.nome || "-");
    row("CPF", pessoa.cpf);
    row("Nascimento", pessoa.dataNascimento);
    row("Endereço", pessoa.endereco);
    row("Telefone", pessoa.telefone);

    // QR Code (opcional)
    const canvas = qrRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const qrSize = 25;
      const qrX = width - qrSize - 6;
      const qrY = height - qrSize - 14;
      doc.addImage(dataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    }

    // ✅ Corrigido: retorna ArrayBuffer (compatível com Blob)
    return doc.output("arraybuffer");
  };

  // ✅ Baixar uma carteirinha individual
  const downloadIndividualCard = (pessoa: Person) => {
    const pdfData = generateCardPDF(pessoa);
    const blob = new Blob([pdfData], { type: "application/pdf" });
    const nomeSeguro = pessoa.nome ? pessoa.nome.replace(/\s+/g, "_") : `pessoa_${pessoa.id}`;
    saveAs(blob, `carteirinha-${nomeSeguro}.pdf`);
  };

  // ✅ Gera ZIP com todas as carteirinhas
  const generateAllCardsZIP = async () => {
    if (reportType !== "people" || data.length === 0) return;
    const zip = new JSZip();

    for (const pessoa of data as Person[]) {
      const pdfData = generateCardPDF(pessoa);
      const nomeSeguro = pessoa.nome ? pessoa.nome.replace(/\s+/g, "_") : `pessoa_${pessoa.id}`;
      const fileName = `carteirinha-${nomeSeguro}.pdf`;
      zip.file(fileName, pdfData);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "carteirinhas.zip");
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, month, year]);

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 p-2">
        <Card className="shadow-md">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Relatórios</CardTitle>

            {reportType && data.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => exportReport("pdf")} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Exportar PDF
                </Button>
                <Button onClick={() => exportReport("excel")} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Exportar Excel
                </Button>
                {reportType === "people" && (
                  <Button onClick={generateAllCardsZIP} className="bg-blue-500 hover:bg-blue-600 text-white">
                    📦 Baixar Todas as Carteirinhas (ZIP)
                  </Button>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="border rounded p-2 w-[320px]"
            >
              <option value="">Selecione um relatório</option>
              <option value="people">📋 Todas as Pessoas Cadastradas</option>
              <option value="received">✅ Pessoas que Receberam no Mês</option>
              <option value="not-received">❌ Pessoas que NÃO Receberam no Mês</option>
              <option value="deliverers">👤 Usuários que Entregaram no Mês</option>
            </select>

            {["received", "not-received", "deliverers"].includes(reportType) && (
              <div className="flex gap-4 mt-4">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="border rounded p-2"
                >
                  {months.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>

                <Input
                  type="number"
                  placeholder="Ano"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
            )}

            <div className="mt-6">
              {loading && <p>Carregando...</p>}

              {!loading && data.length > 0 && reportType === "people" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data as Person[]).map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.nome || "-"}</TableCell>
                        <TableCell>{p.cpf || "-"}</TableCell>
                        <TableCell>{p.telefone || "-"}</TableCell>
                        <TableCell>{p.endereco || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadIndividualCard(p)}
                            className="text-sm"
                          >
                            📄 Baixar Carteirinha
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && reportType && data.length === 0 && (
                <p className="text-gray-500 mt-4">Nenhum dado encontrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <canvas ref={qrRef} style={{ display: "none" }} />
    </div>
  );
}
