import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import formidable from "formidable";
import fs from "fs";

export const runtime = "nodejs";

// 📌 GET - Listar pessoas
export async function GET(): Promise<Response> {
  try {
    const people = await prisma.person.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(people);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📌 POST - Criar pessoa
export async function POST(req: Request): Promise<Response> {
  return new Promise((resolve) => {
    const form = new formidable.IncomingForm({ multiples: false });

    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return resolve(
          new NextResponse("Erro ao processar formulário", { status: 500 })
        );
      }

      try {
        const photo = files?.photo as formidable.File;
        let photoPath = null;

        if (photo && (photo as any).filepath) {
          const data = fs.readFileSync((photo as any).filepath);
          const filename =
            "uploads/" +
            Date.now() +
            "_" +
            ((photo as any).originalFilename || "photo.jpg");

          fs.mkdirSync("public/uploads", { recursive: true });
          fs.writeFileSync("public/" + filename, data);
          photoPath = "/" + filename;
        }

        const p = await prisma.person.create({
          data: {
            name: fields.name as string,
            cpf: fields.cpf as string,
            rg: (fields.rg as string) || null,
            dataNascimento: fields.birthDate
              ? new Date(fields.birthDate as string)
              : null,
            endereco: (fields.address as string) || null,
            telefone: (fields.phone as string) || null,
            photo: photoPath,
          },
        });

        resolve(NextResponse.json(p, { status: 201 }));
      } catch (e: any) {
        console.error(e);
        resolve(NextResponse.json({ error: e.message }, { status: 500 }));
      }
    });
  });
}

// 📌 PUT - Atualizar pessoa
export async function PUT(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { id, name, cpf, endereco, telefone, dataNascimento } = body;

    const p = await prisma.person.update({
      where: { id: Number(id) },
      data: {
        name,
        cpf,
        endereco: endereco || null,
        telefone: telefone || null,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      },
    });

    return NextResponse.json(p);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 📌 DELETE - Deletar pessoa por query (?id=)
export async function DELETE(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.person.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
