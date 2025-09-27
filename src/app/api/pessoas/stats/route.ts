import { NextResponse } from "next/server"

// Tipagem da pessoa (igual no /api/pessoas)
type Pessoa = {
  id: string
  nome: string
  cpf: string
  rg?: string
  endereco: string
  telefone: string
  dataNascimento: string
}

// Aqui simulamos dados. 
// Depois você troca por consulta no Prisma ou outra fonte.
const pessoas: Pessoa[] = [
  {
    id: "1",
    nome: "Maria Silva",
    cpf: "12345678900",
    rg: "MG123456",
    endereco: "Rua A, 123",
    telefone: "31999999999",
    dataNascimento: "1995-03-15",
  },
  {
    id: "2",
    nome: "João Souza",
    cpf: "98765432100",
    rg: "SP987654",
    endereco: "Av B, 456",
    telefone: "11988888888",
    dataNascimento: "1978-07-22",
  },
]

function calcularIdade(dataNasc: string) {
  const hoje = new Date()
  const nascimento = new Date(dataNasc)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const m = hoje.getMonth() - nascimento.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

export async function GET() {
  const total = pessoas.length

  const faixaEtaria = {
    "0-17": 0,
    "18-30": 0,
    "31-50": 0,
    "51+": 0,
  }

  pessoas.forEach(p => {
    const idade = calcularIdade(p.dataNascimento)
    if (idade <= 17) faixaEtaria["0-17"]++
    else if (idade <= 30) faixaEtaria["18-30"]++
    else if (idade <= 50) faixaEtaria["31-50"]++
    else faixaEtaria["51+"]++
  })

  return NextResponse.json({
    total,
    faixaEtaria,
  })
}
