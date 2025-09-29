"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../../components/ui/button"

export interface Pessoa {
  id: string
  nome: string
  cpf: string
  rg: string
  endereco: string
  telefone: string
  dataNascimento: string
  // opcional: entregas quando vierem do back
  deliveries?: { id: number; year: number; month: number; createdAt: string }[]
}

interface GetColumnsProps {
  onView: (pessoa: Pessoa) => void
  onEdit: (pessoa: Pessoa) => void
  onDelete: (id: string) => void
  onCarteirinha: (pessoa: Pessoa) => void
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
  onCarteirinha,
}: GetColumnsProps): ColumnDef<Pessoa>[] => [
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => {
      const pessoa = row.original
      return (
        <button
          className="text-left w-full hover:underline"
          onClick={() => onView(pessoa)}
          title="Clique para ver detalhes"
        >
          {pessoa.nome}
        </button>
      )
    },
  },
  {
    accessorKey: "cpf",
    header: "CPF",
  },
  {
    accessorKey: "rg",
    header: "RG",
  },
  {
    accessorKey: "endereco",
    header: "Endereço",
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
  },
  {
    accessorKey: "dataNascimento",
    header: "Data de Nasc.",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const pessoa = row.original
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(pessoa)}>
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(pessoa.id)}>
            Excluir
          </Button>
          <Button size="sm" onClick={() => onCarteirinha(pessoa)}>
            Carteirinha
          </Button>
        </div>
      )
    },
  },
]
