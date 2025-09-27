"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Users, UserPlus, Calendar } from "lucide-react"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts"
import { MobileSidebar } from "../../components/mobileSidebar"
import { Sidebar } from "../../components/sidebar"

const pessoasPorMes = [
  { mes: "Jan", total: 12 },
  { mes: "Fev", total: 19 },
  { mes: "Mar", total: 8 },
  { mes: "Abr", total: 15 },
]

const pessoasPorGenero = [
  { name: "Masculino", value: 60 },
  { name: "Feminino", value: 40 },
]

const cores = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"]

export default function DashboardPage() {
  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar fixa em desktop */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="h-14 border-b flex items-center px-4 bg-white shadow-sm">
            <MobileSidebar />
            <h1 className="ml-4 font-semibold">Painel de Controle</h1>
          </header>

          {/* Conteúdo principal */}
          <main className="flex-1 p-6 bg-gray-50">
            <div className="p-6 space-y-6 w-full">
              {/* Botão fora dos cards */}
              <div className="flex justify-end">
                <Link href="/dashboard/pessoas">
                  <Button>Gerenciar Pessoas</Button>
                </Link>
              </div>

              {/* Cards pequenos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total de Pessoas</CardTitle>
                    <Users className="h-5 w-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">134</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Novos no mês</CardTitle>
                    <UserPlus className="h-5 w-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">23</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Cestas Distribuídas</CardTitle>
                    <Calendar className="h-5 w-5 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">32</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Não pegaram a cesta</CardTitle>
                    <Users className="h-5 w-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">12</p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cestas Distribuídas por Mês</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pessoasPorMes}>
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total">
                          {pessoasPorMes.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Ano</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pessoasPorGenero}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={100}
                          label
                        >
                          {pessoasPorGenero.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
