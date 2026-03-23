import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"

const contentTitles: Record<string, string> = {
  adicao: "Adição",
  subtracao: "Subtração",
  multiplicacao: "Multiplicação",
  divisao: "Divisão",
  problemas: "Problemas",
}

function DifficultyPage() {
  const navigate = useNavigate()
  const { conteudo } = useParams()

  const title = contentTitles[conteudo || ""] || "Conteúdo"

  const handleGoToLevel = (level: string) => {
    navigate(`/atividades/${conteudo}/${level}`)
  }

  return (
    <AppLayout>
      <div>
        <button
          type="button"
          onClick={() => navigate("/atividades")}
          className="mb-3 text-2xl text-slate-600 transition hover:text-slate-800"
        >
          ←
        </button>

        <h1 className="text-[2.5rem] font-extrabold text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-[1.1rem] text-slate-400">
          Escolha o nível de dificuldade
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        <button
          type="button"
          onClick={() => handleGoToLevel("nivel-1")}
          className="overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:shadow-md active:scale-[0.99]"
        >
          <div className="h-2 bg-[#4a8fd3]" />

          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4a8fd3] text-lg font-bold text-white">
              1
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">Nível 1</h2>
              <p className="text-sm text-slate-400">0/20 fases • Fácil</p>
            </div>
          </div>
        </button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm opacity-50">
          <div className="h-2 bg-[#8adfb2]" />

          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-base text-slate-400">
              🔒
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-500">Nível 2</h2>
              <p className="text-sm text-slate-400">Bloqueado</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm opacity-50">
          <div className="h-2 bg-[#f0d76d]" />

          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-base text-slate-400">
              🔒
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-500">Nível 3</h2>
              <p className="text-sm text-slate-400">Bloqueado</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm opacity-50">
          <div className="h-2 bg-[#d3a8ff]" />

          <div className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-base text-slate-400">
              🔒
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-500">Nível 4</h2>
              <p className="text-sm text-slate-400">Bloqueado</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default DifficultyPage