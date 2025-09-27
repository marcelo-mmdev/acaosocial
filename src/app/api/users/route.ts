import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"
import { hash } from "bcryptjs"

// 🔹 GET: listar usuários
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ data: users });
  } catch (err: any) {
    console.error("GET /api/users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 🔹 POST: criar usuário
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email e password obrigatórios" }, { status: 400 });
    }
    const hashed = await hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "user" },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 🔹 PUT: editar usuário
export async function PUT(req: Request) {
  try {
    const { id, name, email, password, role } = await req.json()

    const data: any = { name, email, role }
    if (password) data.password = await hash(password, 10)

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data,
    })

    return NextResponse.json({ data: updated })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao atualizar usuário", details: err.message },
      { status: 500 }
    )
  }
}

// 🔹 DELETE: excluir usuário
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await prisma.user.delete({ where: { id: Number(id) } })
    return NextResponse.json({ message: "Usuário deletado" })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao excluir usuário", details: err.message },
      { status: 500 }
    )
  }
}
