"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Sidebar } from "../../components/sidebar";

type Person = {
  id: number;
  name: string;
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
              <div className="flex gap-2">
                <Button onClick={() => exportReport("pdf")}>Exportar PDF</Button>
                <Button onClick={() => exportReport("excel")}>Exportar Excel</Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Select de relatórios */}
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

            {/* Inputs de mês/ano (quando necessário) */}
            {["received", "not-received", "deliverers"].includes(reportType) && (
              <div className="flex gap-4 mt-4">
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="border rounded p-2"
                >
                  {months.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
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

            {/* Tabela */}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data as Person[]).map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.cpf || "-"}</TableCell>
                        <TableCell>{p.telefone || "-"}</TableCell>
                        <TableCell>{p.endereco || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading &&
                data.length > 0 &&
                ["received", "not-received"].includes(reportType) && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Telefone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data as Person[]).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell>{p.cpf || "-"}</TableCell>
                          <TableCell>{p.telefone || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

              {!loading && data.length > 0 && reportType === "deliverers" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data as User[]).map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
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
    </div>
  );
}
