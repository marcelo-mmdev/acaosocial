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
}

interface GetColumnsProps {
  onEdit: (pessoa: Pessoa) => void
  onDelete: (id: string) => void
  onCarteirinha: (pessoa: Pessoa) => void
}

export const getColumns = ({
  onEdit,
  onDelete,
  onCarteirinha,
}: GetColumnsProps): ColumnDef<Pessoa>[] => [
  {
    accessorKey: "nome",
    header: "Nome",
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
    header: "Data de Nascimento",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const pessoa = row.original
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(pessoa)}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(pessoa.id)}
          >
            Excluir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCarteirinha(pessoa)}
          >
            Carteirinha
          </Button>
        </div>
      )
    },
  },
]
