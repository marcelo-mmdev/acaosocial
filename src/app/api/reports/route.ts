import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // tipo de relatório
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (type === "people") {
      // Todas as pessoas cadastradas
      const people = await prisma.person.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json({ data: people });
    }

    if (type === "received" && month && year) {
      // Pessoas que receberam cesta no mês
      const deliveries = await prisma.delivery.findMany({
        where: { month, year },
        include: { person: true },
      });
      const people = deliveries.map((d) => d.person);
      return NextResponse.json({ data: people });
    }

    if (type === "not-received" && month && year) {
      // Pessoas que NÃO receberam cesta no mês
      const deliveries = await prisma.delivery.findMany({
        where: { month, year },
        select: { personId: true },
      });
      const receivedIds = deliveries.map((d) => d.personId);

      const people = await prisma.person.findMany({
        where: { id: { notIn: receivedIds } },
        orderBy: { name: "asc" },
      });
      return NextResponse.json({ data: people });
    }

if (type === "deliverers" && month && year) {
  const deliveries = await prisma.delivery.findMany({
    where: { month, year },
    include: { deliverer: true },
  });

  const delivererMap = new Map<number, typeof deliveries[0]["deliverer"]>();
for (const d of deliveries) {
  if (d.deliverer) {
    delivererMap.set(d.deliverer.id, d.deliverer);
  }
}
const uniqueDeliverers = Array.from(delivererMap.values());

  return NextResponse.json({ data: uniqueDeliverers });
}

    return NextResponse.json(
      { error: "Parâmetros inválidos" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro ao gerar relatório", details: err.message },
      { status: 500 }
    );
  }
}
