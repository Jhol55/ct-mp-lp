import { auth } from "@/lib/auth";
import { logout } from "@/actions/auth";

export default async function AdminHomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Home (Admin)</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.email ? `Logado como ${user.email}` : "Sessão ativa"}
            </p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="h-10 rounded-xl border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

