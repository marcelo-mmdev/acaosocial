// src/app/pessoas/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { jsPDF } from "jspdf";

type Pessoa = {
  id: number;
  name: string;
  cpf: string;
  telefone?: string;
  endereco?: string;
  rg?: string;
  dataNascimento?: string;
  photo?: string;
};

export default function PessoasPage() {
  const { data: session } = useSession();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [openForm, setOpenForm] = useState(false);
  const [openEdit, setOpenEdit] = useState<Pessoa | null>(null);
  const [openDelete, setOpenDelete] = useState<Pessoa | null>(null);
  const [openCard, setOpenCard] = useState<Pessoa | null>(null);

  const [form, setForm] = useState<Omit<Pessoa, "id">>({
    name: "",
    cpf: "",
    rg: "",
    telefone: "",
    endereco: "",
    dataNascimento: "",
    photo: "",
  });

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function fetchList() {
    try {
      const res = await fetch(
        `/api/pessoas?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&sort=name`
      );
      const j = await res.json();
      setPessoas(j.data || []);
    } catch (err) {
      console.error("Erro ao carregar pessoas:", err);
    }
  }

  async function createPessoa(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/pessoas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json();
        alert("Erro: " + (j?.error || res.statusText));
        return;
      }
      setForm({ name: "", cpf: "", rg: "", telefone: "", endereco: "", dataNascimento: "", photo: "" });
      setOpenForm(false);
      fetchList();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar pessoa");
    }
  }

  async function updatePessoa(e: React.FormEvent) {
    e.preventDefault();
    if (!openEdit) return;
    try {
      const res = await fetch(`/api/pessoas/${openEdit.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(openEdit),
      });
      if (!res.ok) { alert("Erro ao editar"); return; }
      setOpenEdit(null);
      fetchList();
    } catch (err) {
      console.error(err);
      alert("Erro ao editar");
    }
  }

  async function deletePessoa() {
    if (!openDelete) return;
    try {
      const res = await fetch(`/api/pessoas/${openDelete.id}`, { method: "DELETE" });
      if (!res.ok) { alert("Erro ao deletar"); return; }
      setOpenDelete(null);
      fetchList();
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar");
    }
  }

  async function gerarCarteirinha(p: Pessoa) {
    try {
      const q = await fetch(`/api/pessoas/${p.id}/qrcode`);
      const { dataUrl } = await q.json();
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: [300, 180] });
      doc.setFontSize(14);
      doc.text(p.name, 20, 40);
      doc.text("CPF: " + p.cpf, 20, 60);
      if (p.photo) doc.addImage(p.photo, "JPEG", 200, 20, 70, 70);
      doc.addImage(dataUrl, "PNG", 20, 80, 80, 80);
      doc.save(`carteirinha_${p.cpf}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar carteirinha:", err);
      alert("Erro ao gerar carteirinha");
    }
  }

  if (!session) return <div className="p-4">Acesso restrito. Faça login.</div>;
  if ((session.user as any)?.role !== "admin") return <div className="p-4">Acesso negado. Só admin.</div>;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Pessoas</h1>
        <Button onClick={() => setOpenForm(true)}>+ Nova Pessoa</Button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquisar por nome ou CPF"
        className="border p-2 w-full sm:w-1/3 mb-4"
      />

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Nome</th>
            <th className="p-2">CPF</th>
            <th className="p-2">Telefone</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.cpf}</td>
              <td className="p-2">{p.telefone}</td>
              <td className="p-2 flex justify-center gap-2">
                <Button onClick={() => setOpenEdit(p)}>Editar</Button>
                <Button variant="destructive" onClick={() => setOpenDelete(p)}>Deletar</Button>
                <Button onClick={() => setOpenCard(p)}>Carteirinha</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Criar */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastrar Pessoa</DialogTitle></DialogHeader>
          <form onSubmit={createPessoa} className="grid gap-2">
            <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} placeholder="Nome" className="border p-2" />
            <input value={form.cpf} onChange={(e)=>setForm({...form, cpf: e.target.value})} placeholder="CPF" className="border p-2" />
            <input value={form.telefone} onChange={(e)=>setForm({...form, telefone: e.target.value})} placeholder="Telefone" className="border p-2" />
            <Button type="submit">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!openEdit} onOpenChange={()=>setOpenEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Pessoa</DialogTitle></DialogHeader>
          {openEdit && (
            <form onSubmit={updatePessoa} className="grid gap-2">
              <input value={openEdit.name} onChange={(e)=>setOpenEdit({...openEdit, name: e.target.value})} className="border p-2" />
              <input value={openEdit.cpf} onChange={(e)=>setOpenEdit({...openEdit, cpf: e.target.value})} className="border p-2" />
              <input value={openEdit.telefone||""} onChange={(e)=>setOpenEdit({...openEdit, telefone: e.target.value})} className="border p-2" />
              <Button type="submit">Salvar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!openDelete} onOpenChange={()=>setOpenDelete(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Deletar Pessoa</DialogTitle></DialogHeader>
          {openDelete && (
            <div className="space-y-4">
              <p>Tem certeza que deseja deletar {openDelete.name}?</p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={deletePessoa}>Confirmar</Button>
                <Button onClick={()=>setOpenDelete(null)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Carteirinha */}
      <Dialog open={!!openCard} onOpenChange={()=>setOpenCard(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Carteirinha</DialogTitle></DialogHeader>
          {openCard && (
            <div className="space-y-4">
              <p>{openCard.name}</p>
              <p>CPF: {openCard.cpf}</p>
              <Button onClick={()=>gerarCarteirinha(openCard)}>Gerar PDF</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
