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
      email: "",
      password: "",
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-gray-100 px-4 sm:px-6 lg:px-8">
      {/* Card centralizado */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md">
        <div className="rounded-2xl border bg-white/90 backdrop-blur-sm p-6 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={imagem.src}
              alt="Logo"
              className="w-40 sm:w-48 md:w-56 lg:w-48 h-auto object-contain"
            />
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Usuário
              </label>
              <Input
                type="email"
                placeholder="Digite seu e-mail"
                {...register("email", { required: true })}
                className="h-11 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Senha
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  {...register("password", { required: true })}
                  className="h-11 text-base pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 text-base font-medium rounded-xl shadow-sm hover:shadow-md transition-all bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}
            
          </form>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-center mt-6">
          <h2 className="text-xs sm:text-sm text-gray-500 text-center leading-tight">
            USB tecnologia @2025 <br className="sm:hidden" />
            “Simplificando a tecnologia.”
          </h2>
        </div>
      </div>
    </div>
  );
}
