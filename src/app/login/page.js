import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <LoginForm title="Login" subtitle="Entre para continuar" />
    </main>
  );
}

