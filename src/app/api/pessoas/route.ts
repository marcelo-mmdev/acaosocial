// src/app/api/pessoas/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

function mapPersonToFront(p: any) {
  return {
    ...p,
    nome: p.name,
    id: String(p.id),
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [{ name: { contains: search, mode: "insensitive" } }, { cpf: { contains: search } }],
        }
      : undefined;

    const [raw, total] = await Promise.all([
      prisma.person.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.person.count({ where }),
    ]);

    const data = raw.map(mapPersonToFront);
    return NextResponse.json({ data, total });
  } catch (err: any) {
    console.error("GET /api/pessoas error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nome = body.nome || body.name;
    const cpf = body.cpf;
    if (!nome || !cpf) {
      return NextResponse.json({ error: "Nome e CPF são obrigatórios" }, { status: 400 });
    }

    const created = await prisma.person.create({
      data: {
        name: nome,
        cpf,
        rg: body.rg || null,
        telefone: body.telefone || null,
        endereco: body.endereco || null,
        dataNascimento: body.dataNascimento || null,
        photo: body.photo || null,
      },
    });

    return NextResponse.json({ data: mapPersonToFront(created) }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/pessoas error:", err);
    // se unique cpf falhar, err.message terá detalhe
    return NextResponse.json({ error: "Erro ao criar pessoa", details: err.message }, { status: 500 });
  }
}
