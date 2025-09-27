import Link from "next/link"

export default function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold mb-4 text-red-600">404</h1>
      <p className="text-lg text-gray-700 mb-6">Página não encontrada</p>

      <Link href="/">
        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
          Ir para Login
        </button>
      </Link>
    </main>
  )
}
