// src/app/dashboard/usuarios/types.ts
export interface Usuario {
  role: any
  id: string
  nome: string
  email: string
  senha: string
  tipo: "adminin" | "entregador"
}
