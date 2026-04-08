import { ArrowLeft, Info, LogOut, Pencil, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"

function ProfilePage() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Meu Perfil
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Gerencie suas informações
          </p>
        </header>

        <section className="overflow-hidden rounded-[2rem] bg-white shadow-md">
          <div className="relative h-[320px] w-full bg-gradient-to-r from-[#4a90d9] to-[#67ace8]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/20 text-6xl shadow-sm backdrop-blur-sm">
                👦🏽
              </div>
            </div>
          </div>

          <div className="px-7 py-8 md:px-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  Yuri Borges
                </h2>
                <p className="mt-1 text-lg text-slate-400">
                  6º ano • 13 anos
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-base font-semibold text-[#3b82f6] transition hover:bg-blue-50"
              >
                <Pencil size={18} />
                Editar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 px-5 py-4">
                <p className="mb-1 text-sm text-slate-400">Usuário</p>
                <p className="text-2xl font-semibold text-slate-800">yuri22</p>
              </div>

              <div className="rounded-3xl bg-slate-50 px-5 py-4">
                <p className="mb-1 text-sm text-slate-400">Gênero</p>
                <p className="text-2xl font-semibold text-slate-800">
                  Masculino
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 px-5 py-4 md:col-span-2">
                <p className="mb-1 text-sm text-slate-400">Responsável</p>
                <p className="text-2xl font-semibold text-slate-800">Dark</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/configuracoes")}
              className="flex items-center justify-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-6 py-6 text-2xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Settings size={22} className="text-slate-400" />
              Configurações
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
                className="flex items-center justify-center gap-3 rounded-[1.75rem] border border-red-200 bg-white px-6 py-6 text-2xl font-bold text-red-500 shadow-sm transition hover:bg-red-50"
              >
                <LogOut className="h-5 w-5 shrink-0" />
              Sair
            </button>
          </div>

          <div className="rounded-[1.75rem] bg-white px-6 py-6 shadow-md">
            <button
              type="button"
              className="flex w-full items-center text-left"
            >
              <div className="flex items-center gap-3">
                <Info className="text-[#3b82f6]" size={22} />
                <span className="text-2xl font-bold text-slate-800">
                  Sobre
                </span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default ProfilePage