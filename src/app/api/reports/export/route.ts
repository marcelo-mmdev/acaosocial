import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import prisma from "../../../../lib/prisma";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
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

    // 🔹 Gerar PDF
    if (format === "pdf") {
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument();

        // 👇 Forçar uso de fonte custom
        const fontPath = path.join(process.cwd(), "src", "fonts", "Roboto-Regular.ttf");
        if (fs.existsSync(fontPath)) {
          doc.font(fontPath);
        }

        const chunks: Buffer[] = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const body = Buffer.concat(chunks);
          resolve(
            new NextResponse(body, {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="relatorio_${type}.pdf"`,
              },
            })
          );
        });
        doc.on("error", (err) => reject(err));

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
      });
    }

    // 🔹 Gerar Excel (igual já estava)
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

      return new NextResponse(new Uint8Array(buffer), {
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
