"use client";

import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { DataTable } from "../../components/data-table";
import { getColumns } from "../users/columns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Sidebar } from "../../components/sidebar";
import { MobileSidebar } from "../../components/mobileSidebar";
import type { Usuario } from "../../interface/user";

export default function UsersPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<Usuario | null>(null);
  const [openDelete, setOpenDelete] = useState<Usuario | null>(null);
  const [users, setUsers] = useState<Usuario[]>([]);

  // 🔹 Buscar usuários
  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const json = await res.json();
    const data: Usuario[] = (json.data || []).map((u: any) => ({
      id: String(u.id),
      name: u.name,
      email: u.email,
      role: u.role,
    }));
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Criar usuário
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      role: String(fd.get("role") || "user"),
    };
    await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setOpenCreate(false);
    fetchUsers();
  };

  // 🔹 Editar usuário
  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openEdit) return;
    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const payload: any = {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      role: String(fd.get("role") || "user"),
    };
    const pass = fd.get("password");
    if (pass) payload.password = String(pass);

    await fetch(`/api/users/${openEdit.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setOpenEdit(null);
    fetchUsers();
  };

  // 🔹 Deletar usuário
  const confirmDelete = async () => {
    if (!openDelete) return;
    await fetch(`/api/users/${openDelete.id}`, { method: "DELETE" });
    setOpenDelete(null);
    fetchUsers();
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-4 bg-white shadow-sm">
          <MobileSidebar />
          <h1 className="ml-4 font-semibold">Gerenciar Usuários</h1>
        </header>

        <main className="flex-1 p-6 bg-gray-50">
          <div className="p-6 space-y-6 w-full">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lista de Usuários</CardTitle>

                {/* Criar */}
                <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Novo Usuário
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-w-lg bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
                    <DialogHeader>
                      <DialogTitle className="--foreground">Cadastrar Usuário</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createUser} className="grid gap-2">
                      <input name="name" placeholder="Nome" className="border p-2" required />
                      <input name="email" placeholder="Email" className="border p-2" required />
                      <input
                        name="password"
                        placeholder="Senha"
                        type="password"
                        className="border p-2"
                        required
                      />
                      <select name="role" className="border p-2">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Salvar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>

              <CardContent>
                <DataTable
                  columns={getColumns({
                    onEdit: (usuario) => setOpenEdit(usuario),
                    onDelete: (usuario) => setOpenDelete(usuario),
                  })}
                  data={users}
                />
              </CardContent>
            </Card>

            {/* Edit Modal */}
            <Dialog open={!!openEdit} onOpenChange={() => setOpenEdit(null)}>
              <DialogContent className="max-w-lg bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
                <DialogHeader>
                  <DialogTitle className="--foreground">Editar Usuário</DialogTitle>
                </DialogHeader>
                {openEdit && (
                  <form onSubmit={submitEdit} className="grid gap-2">
                    <input
                      name="name"
                      defaultValue={openEdit.name}
                      className="border p-2"
                      required
                    />
                    <input
                      name="email"
                      defaultValue={openEdit.email}
                      className="border p-2"
                      required
                    />
                    <input
                      name="password"
                      placeholder="Nova senha (opcional)"
                      type="password"
                      className="border p-2"
                    />
                    <select
                      name="role"
                      defaultValue={openEdit.role}
                      className="border p-2"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Salvar</Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {/* Delete confirm */}
            <Dialog open={!!openDelete} onOpenChange={() => setOpenDelete(null)}>
              <DialogContent className="max-w-sm bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
                <DialogHeader>
                  <DialogTitle className="--foreground">Excluir Usuário</DialogTitle>
                </DialogHeader>
                {openDelete && (
                  <div>
                    <p>
                      Confirma remover <strong>{openDelete.name}</strong>?
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="destructive" onClick={confirmDelete} className="bg-green-600 hover:bg-green-700 text-white">
                        Confirmar
                      </Button>
                      <Button onClick={() => setOpenDelete(null)} className="bg-red-600 hover:bg-red-700 text-white">Cancelar</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
