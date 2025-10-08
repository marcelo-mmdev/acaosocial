"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../../components/ui/button"

interface Delivery {
  id: string
  month: string
  year: number
  deliveredAt: string | null
  createdAt: string 
}

export interface Pessoa {
  id: string
  nome: string
  cpf: string
  rg: string
  endereco: string
  telefone: string
  dataNascimento: string
  deliveries: Delivery[]
}

interface GetColumnsProps {
  onView: (pessoa: Pessoa) => void
  onEdit: (pessoa: Pessoa) => void
  onDelete: (pessoa: Pessoa) => void
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
          className="text-left w-full hover:underline text-blue-700"
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
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onEdit(pessoa)}
          >
            Editar
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onDelete(pessoa)}
          >
            Excluir
          </Button>
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => onCarteirinha(pessoa)}
          >
            Carteirinha
          </Button>
        </div>
      )
    },
  },
]
