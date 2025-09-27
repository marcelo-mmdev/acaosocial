// src/app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // retornar sem a senha
    const { password, ...safe } = user as any;
    return NextResponse.json({ data: safe });
  } catch (err: any) {
    console.error("GET /api/users/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    const body = await req.json();
    const data: any = {
      name: body.name,
      email: body.email,
      role: body.role,
    };
    if (body.password) data.password = await bcrypt.hash(body.password, 10);

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    console.error("PUT /api/users/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (err: any) {
    console.error("DELETE /api/users/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
