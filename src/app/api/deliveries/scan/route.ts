import { NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"

export async function POST(req: Request) {
  try {
    const { personId, delivererId } = await req.json()
    if (!personId) {
      return NextResponse.json({ error: "personId obrigatório" }, { status: 400 })
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Verifica se já tem entrega registrada no mês/ano
    const existing = await prisma.delivery.findFirst({
      where: { personId: Number(personId), year, month },
    })

    if (existing) {
      return NextResponse.json(
        { status: "already_received", message: "Essa pessoa já recebeu este mês." },
        { status: 200 }
      )
    }

    // Registra nova entrega
    const delivery = await prisma.delivery.create({
      data: {
        personId: Number(personId),
        delivererId: delivererId ? Number(delivererId) : null,
        year,
        month,
      },
    })

    return NextResponse.json(
      { status: "success", message: "Entrega registrada com sucesso!", delivery },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Erro no scan:", err)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
