"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

type LoginForm = { email: string; password: string };

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email: data.email, password: data.password });
    setLoading(false);
    // res can be undefined in some setups; check via window.location or fetch session
    // if signIn returned ok, redirect to dashboard
    // next-auth returns an object with error if failed
    if (res && (res as any).error) {
      alert("Credenciais inválidas");
    } else {
      // successful - navigate
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md sm:max-w-md md:max-w-lg bg-white p-6 sm:p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <Input {...register("email", { required: true })} type="email" />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha</label>
            <Input {...register("password", { required: true })} type="password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
