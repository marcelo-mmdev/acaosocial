// src/app/dashboard/usuarios/types.ts
export interface Usuario {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}