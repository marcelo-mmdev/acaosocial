import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "adminin@teste.com" &&
          credentials?.password === "123456"
        ) {
          return { id: "1", name: "Admin", email: "adminin@teste.com" }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
})
