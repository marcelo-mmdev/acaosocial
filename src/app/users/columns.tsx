'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../components/ui/button";
import { Usuario } from "../../interface/user";

interface GetColumnsProps {
  onEdit?: (usuario: Usuario) => void;
  onDelete?: (usuario: Usuario) => void;
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Usuario>[] => [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Função",
    cell: ({ row }) => {
      const role = row.original.role;
      return role === "admin" ? "Administrador" : "Entregador";
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          variant="outline"
          onClick={() => onEdit?.(row.original)}
        >
          Editar
        </Button>
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          variant="destructive"
          onClick={() => onDelete?.(row.original)}
        >
          Deletar
        </Button>
      </div>
    ),
  },
];
