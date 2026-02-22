"use server";

import { z } from "zod";
import { auth, signIn, signOut } from "@/lib/auth";

const loginSchema = z.object({
  email: z.email({
    message: "Email inválido",
  }),
  password: z.string().min(6, {
    message: "Senha deve ter no mínimo 6 caracteres",
  }),
});

export async function login(credentials) {
  try {
    const validation = loginSchema.safeParse(credentials);
    
    if (!validation.success) {
      return {
        error: "Dados inválidos. Verifique email e senha.",
      };
    }

    const { email, password } = validation.data;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        error: "Email ou senha inválidos",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: "Erro ao fazer login. Tente novamente.",
    };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}


export async function getSession() {
  const session = await auth();

  if (!session) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  return {
    isAuthenticated: true,
    user: session.user,
  };
}
