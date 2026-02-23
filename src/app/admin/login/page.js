import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <LoginForm title="Admin" subtitle="Faça login para acessar o painel" />
    </main>
  );
}

