"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import imagem from "../image/logo-horizontal.png";
import { Eye, EyeOff } from "lucide-react";

type LoginForm = { email: string; password: string };

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>({
    defaultValues: {
      email: "usb@email.com",
      password: "123456",
    },
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (res && (res as any).error) {
      setError("Credenciais inválidas");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      {/* Card centralizado */}
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white p-6 shadow-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={imagem.src} alt="Logo" className="w-40" />
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Usuário</label>
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                {...register("email", { required: true })}
              />
            </div>

            <div className="relative">
              <label className="block text-sm mb-1">Senha</label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                {...register("password", { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-center mt-4">
          <h2 className="text-sm text-gray-500">
            USB tecnologia @2025 &quot;Simplificando a tecnologia.&quot;
          </h2>
        </div>
      </div>
    </div>
  );
}
