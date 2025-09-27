/* eslint-disable @typescript-eslint/no-explicit-any */
export type Pessoa = {
  status: any
  id: string
  nome: string
  cpf: string
  rg: string
  telefone: string
  endereco: string
  dataNascimento: string
}

let pessoas: any[] = []

export function getPessoasStore() {
  return pessoas
}

export function setPessoasStore(data: any[]) {
  pessoas = data
}