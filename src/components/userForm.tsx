"use client";

import { useState } from "react";

export default function UserForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "entregador" });


  


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Nome"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        className="border p-2 w-full rounded"
        required
      />
      <select
        value={form.role}
        onChange={e => setForm({ ...form, role: e.target.value })}
        className="border p-2 w-full rounded"
      >
        <option value="entregador">Entregador</option>
        <option value="adminin">Admin</option>
      </select>
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
        Salvar
      </button>
    </form>
  );
}
