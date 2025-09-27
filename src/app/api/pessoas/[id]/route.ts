// src/app/api/pessoas/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

function mapPersonToFront(p: any) {
  return { ...p, nome: p.name, id: String(p.id) };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    const p = await prisma.person.findUnique({ where: { id } });
    if (!p) return NextResponse.json({ error: "Pessoa não encontrada" }, { status: 404 });
    return NextResponse.json({ data: mapPersonToFront(p) });
  } catch (err: any) {
    console.error("GET /api/pessoas/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const pessoa = await prisma.person.update({
      where: { id },
      data: {
        name: body.nome || body.name,
        cpf: body.cpf,
        rg: body.rg,
        telefone: body.telefone,
        endereco: body.endereco,
        dataNascimento: body.dataNascimento,
        photo: body.photo || null,
      },
    });
    return NextResponse.json({ data: mapPersonToFront(pessoa) });
  } catch (err: any) {
    console.error("PUT /api/pessoas/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.person.delete({ where: { id } });
    return NextResponse.json({ message: "Pessoa deletada com sucesso" });
  } catch (err: any) {
    console.error("DELETE /api/pessoas/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
