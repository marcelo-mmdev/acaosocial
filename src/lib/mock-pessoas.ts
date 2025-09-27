export type Pessoa = {
  id: string
  nome: string
  cpf: string
  endereco: string
  telefone: string
  dataNascimento: string
  rg: string
  genero?: "Masculino" | "Feminino"
}

export const pessoasMock: Pessoa[] = [
  {
    id: "1",
    nome: "João Silva",
    cpf: "123.456.789-00",
    endereco: "Rua A, 123",
    telefone: "(11) 99999-9999",
    dataNascimento: "1990-05-15",
    rg: "12.345.678-9",
    genero: "Masculino",
  },
  {
    id: "2",
    nome: "Maria Souza",
    cpf: "987.654.321-00",
    endereco: "Av. B, 456",
    telefone: "(11) 98888-8888",
    dataNascimento: "1985-08-20",
    rg: "98.765.432-1",
    genero: "Feminino",
  },
]
