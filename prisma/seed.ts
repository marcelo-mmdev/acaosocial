import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 🧹 Apaga todos os usuários existentes
  await prisma.user.deleteMany();
  console.log("🗑️ Todos os usuários foram removidos!");

  // 🔑 Cria um novo usuário admin
  const passwordHash = await bcrypt.hash("USBtec/*-", 10);

  await prisma.user.create({
    data: {
      name: "Administrador",
      email: "usb@usbtecnologia.com.br",
      password: passwordHash,
      role: "admin",
    },
  });

  console.log("✅ Usuário criado com sucesso!");
  console.log("👉 Email: admin@teste.com");
  console.log("👉 Senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
