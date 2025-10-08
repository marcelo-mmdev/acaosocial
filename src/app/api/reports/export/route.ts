// 🚀 Corrige erro de build estático (Next tenta pré-renderizar esta rota)
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import prisma from "../../../../lib/prisma";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const format = searchParams.get("format") || "pdf";
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!type) {
      return NextResponse.json(
        { error: "Tipo de relatório não informado" },
        { status: 400 }
      );
    }

    let data: any[] = [];

    if (type === "people") {
      data = await prisma.person.findMany();
    } else if (type === "received") {
      data = await prisma.person.findMany({
        where: {
          deliveries: {
            some: {
              createdAt: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          },
        },
      });
    } else if (type === "not-received") {
      data = await prisma.person.findMany({
        where: {
          deliveries: {
            none: {
              createdAt: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          },
        },
      });
    } else if (type === "deliverers") {
      data = await prisma.user.findMany({
        where: {
          deliveries: {
            some: {
              createdAt: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          },
        },
      });
    }

    // 🔹 Geração de PDF
    if (format === "pdf") {
      const doc = new PDFDocument();
      const fontPath = path.join(process.cwd(), "src", "fonts", "Roboto-Regular.ttf");
      if (fs.existsSync(fontPath)) doc.font(fontPath);

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));

      doc.fontSize(16).text("Relatório", { align: "center" });
      doc.moveDown();

      if (type === "people" || type === "received" || type === "not-received") {
        data.forEach((p: any) => {
          doc.fontSize(12).text(`Nome: ${p.name}`);
          doc.text(`CPF: ${p.cpf || "-"}`);
          doc.text(`Telefone: ${p.telefone || "-"}`);
          doc.text(`Endereço: ${p.endereco || "-"}`);
          doc.moveDown();
        });
      } else if (type === "deliverers") {
        data.forEach((u: any) => {
          doc.fontSize(12).text(`Nome: ${u.name}`);
          doc.text(`Email: ${u.email}`);
          doc.moveDown();
        });
      }

      doc.end();

      const buffer = await new Promise<Buffer>((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
      });

      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

      // ✅ Garante tipo compatível (usa Uint8Array como corpo)
      return new Response(new Uint8Array(arrayBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="relatorio_${type}.pdf"`,
        },
      });
    }

    // 🔹 Geração de Excel
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Relatório");

      if (type === "people" || type === "received" || type === "not-received") {
        worksheet.columns = [
          { header: "Nome", key: "name", width: 30 },
          { header: "CPF", key: "cpf", width: 20 },
          { header: "Telefone", key: "telefone", width: 20 },
          { header: "Endereço", key: "endereco", width: 30 },
        ];
        data.forEach((p: any) => {
          worksheet.addRow({
            name: p.name,
            cpf: p.cpf || "-",
            telefone: p.telefone || "-",
            endereco: p.endereco || "-",
          });
        });
      } else if (type === "deliverers") {
        worksheet.columns = [
          { header: "Nome", key: "name", width: 30 },
          { header: "Email", key: "email", width: 30 },
        ];
        data.forEach((u: any) => {
          worksheet.addRow({
            name: u.name,
            email: u.email,
          });
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();

      return new Response(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="relatorio_${type}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  } catch (err) {
    console.error("Erro no export:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
