import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    // Total de pessoas
    const totalPessoas = await prisma.person.count();

    // Novos no mês
    const novosNoMes = await prisma.person.count({
      where: {
        deliveries: {
          some: {
            year,
            month,
          },
        },
      },
    });

    // Total de cestas no mês atual
    const cestasDistribuidas = await prisma.delivery.count({
      where: { year, month },
    });

    // Pessoas que não receberam neste mês
    const naoReceberam = await prisma.person.count({
      where: {
        deliveries: {
          none: {
            year,
            month,
          },
        },
      },
    });

    // Distribuição por mês (ano atual)
    const entregasPorMes = await prisma.delivery.groupBy({
      by: ["month"],
      where: { year },
      _count: { id: true },
    });

    const pessoasPorMes = Array.from({ length: 12 }, (_, i) => {
      const found = entregasPorMes.find((e) => e.month === i + 1);
      return {
        mes: new Date(year, i).toLocaleString("pt-BR", { month: "short" }),
        total: found?._count.id || 0,
      };
    });

    return NextResponse.json({
      totalPessoas,
      novosNoMes,
      cestasDistribuidas,
      naoReceberam,
      pessoasPorMes,
    });
  } catch (err: any) {
    console.error("GET /api/dashboard error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
