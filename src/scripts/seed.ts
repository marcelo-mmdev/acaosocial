import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@teste.com" }, // ✅ Ajuste para bater com o que você vai usar no login
    update: {},
    create: {
      name: "Administrador",
      email: "admin@teste.com",
      password: passwordHash, // ✅ Senha hashada
      role: "admin",
    },
  });

  console.log("Usuário seed criado/atualizado:", user);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
