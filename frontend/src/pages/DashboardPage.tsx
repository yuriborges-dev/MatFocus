import { useNavigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"

function DashboardPage() {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[2.7rem] font-extrabold text-slate-900">
            Olá, Yuri! 👋
          </h1>
          <p className="mt-1 text-[1.1rem] text-slate-400">
            Pronto para aprender hoje?
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-[2rem] bg-gradient-to-r from-[#4a8fd3] to-[#68b1eb] px-9 py-10 text-white shadow-lg">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-[2rem] font-bold">Iniciar atividade</h2>
            <p className="mt-1 text-[1.1rem] text-white/90">
              Continue de onde parou!
            </p>
          </div>

          <button 
            className="rounded-[1.5rem] bg-white px-10 py-5 text-[1.2rem] font-bold text-[#3b82d0] shadow-md"
            onClick={() => navigate("/atividades")}
          >
            ▷ Começar
          </button>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.8rem] bg-white px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef4ff] text-2xl">
              🏆
            </div>
            <div>
              <p className="text-[1.1rem] text-slate-400">Nível</p>
              <p className="text-[2rem] font-bold text-slate-800">1</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] bg-white px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff7e8] text-2xl">
              ⭐
            </div>
            <div>
              <p className="text-[1.1rem] text-slate-400">Pontos</p>
              <p className="text-[2rem] font-bold text-slate-800">0</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] bg-white px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eefaf2] text-2xl">
              ↗
            </div>
            <div>
              <p className="text-[1.1rem] text-slate-400">Acertos</p>
              <p className="text-[2rem] font-bold text-slate-800">0%</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] bg-white px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6efff] text-2xl">
              🕘
            </div>
            <div>
              <p className="text-[1.1rem] text-slate-400">Atividades</p>
              <p className="text-[2rem] font-bold text-slate-800">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
        <h3 className="text-[1.15rem] font-bold text-slate-800">Seu progresso</h3>

        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between text-[1rem] font-medium text-slate-500">
            <span>Nível 1 de 4</span>
            <span>25%</span>
          </div>

          <div className="h-4 w-full rounded-full bg-slate-100">
            <div className="h-4 w-1/4 rounded-full bg-[#3f86d1]" />
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-[1rem] font-medium text-slate-500">
            <span>Taxa de acerto</span>
            <span>0%</span>
          </div>

          <div className="h-4 w-full rounded-full bg-slate-100">
            <div className="h-4 w-0 rounded-full bg-[#79c6a1]" />
          </div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
        <button>
        <div className="flex min-h-[150px] flex-col items-center justify-center rounded-[2rem] bg-white px-6 py-8 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6efff] text-3xl">
            ✨
          </div>
          <h3 className="text-[1.15rem] font-bold text-slate-800">Meu Avatar</h3>
        </div>
        </button>

        <button>
        <div className="flex min-h-[150px] flex-col items-center justify-center rounded-[2rem] bg-white px-6 py-8 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eefaf2] text-3xl">
            📊
          </div>
          <h3 className="text-[1.15rem] font-bold text-slate-800">Histórico</h3>
        </div>
        </button>
      </div>
    </AppLayout>
  )
}

export default DashboardPage