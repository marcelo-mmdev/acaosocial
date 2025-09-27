// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token

    // 🔹 Se não tiver token → redireciona para login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // 🔹 Se não for admin e tentar acessar qualquer rota do /dashboard que não seja /dashboard/validar
    if (
      token.role !== "admin" &&
      req.nextUrl.pathname.startsWith("/dashboard") &&
      !req.nextUrl.pathname.startsWith("/dashboard/validar")
    ) {
      return NextResponse.redirect(new URL("/dashboard/validar", req.url))
    }

    // 🔹 Caso contrário, segue normal
    return NextResponse.next()
  },
  {
    callbacks: {
      // Garante que só usuários autenticados chegam no middleware
      authorized: ({ token }) => !!token,
    },
  }
)

// 🔹 Configura o middleware para rodar só nas rotas do dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
}
