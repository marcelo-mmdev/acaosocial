import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"
import { hash } from "bcryptjs"

// 🔹 GET: listar usuários
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ data: users })
  } catch (err: any) {
    console.error("GET /api/users error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// 🔹 POST: criar usuário
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email e password obrigatórios" }, { status: 400 })
    }
    const hashed = await hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "user" },
      select: { id: true, name: true, email: true, role: true },
    })
    return NextResponse.json({ data: user }, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/users error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
