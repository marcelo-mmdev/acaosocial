"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../lib/utils"
import { Home, Users, QrCode, LogOut, Menu, User, Files } from "lucide-react"
import { Button } from "./ui/button"
import { signOut } from "next-auth/react"
import { useState } from "react"
import imagem from '../image/logo-horizontal.png';

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    { label: "Dashboard", icon: Home, href: "/dashboard", exact: true },
    { label: "Beneficiários", icon: Users, href: "/dashboard/pessoas" },
    { label: "Entrega via QRCode", icon: QrCode, href: "/dashboard/validar" },
    { label: "Usuários", icon: User, href: "/users" },
    { label: "Relatórios", icon: Files, href: "/reports" },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(!open)}
          className="bg-white shadow-md"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static top-0 left-0 h-screen w-64 bg-white border-r flex flex-col shadow-sm transform transition-transform duration-300 z-40",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 font-bold text-xl border-b">
          <img src={imagem.src} alt="Descrição da imagem" className="w-13 h-13" />          
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {routes.map((route) => {
            const Icon = route.icon

            // Se for "exact", compara só igualdade
            const isActive = route.exact
              ? pathname === route.href
              : pathname.startsWith(route.href)

            return (
              <Link key={route.href} href={route.href} onClick={() => setOpen(false)}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-gray-100 text-blue-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {route.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            variant="destructive"
            className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700 rounded-xl border px-4 py-2 text-white text-sm"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
          <p className="flex items-center justify-center text-xs text-gray-500 mt-2">
            Sistema Caterpie 1.0.1
          </p>
        </div>
      </aside>
    </>
  )
}
