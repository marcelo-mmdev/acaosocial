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
