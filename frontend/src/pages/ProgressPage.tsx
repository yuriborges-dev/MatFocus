import AppLayout from "../layouts/AppLayout"
import ProgressCircle from "../components/ProgressCircle"

function ProgressPage() {
  return (
    <AppLayout>
      <div>
        <h1 className="text-[2.5rem] font-extrabold text-slate-900">
          Meu Progresso
        </h1>
        <p className="mt-1 text-[1.1rem] text-slate-400">
          Acompanhe seu desempenho
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eefaf2] text-2xl">
              ✓
            </div>
            <div>
              <p className="text-[1.1rem] text-slate-400">Acertos</p>
              <p className="text-[2rem] font-bold text-slate-800">0</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] bg-white px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0f0] text-2xl">
              ⊗
            </div>
            <div>
              <p className="text-[1.1rem] text-slate-400">Erros</p>
              <p className="text-[2rem] font-bold text-slate-800">0</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] bg-white px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6efff] text-2xl">
              🕘
            </div>
            <div>
              <p className="text-[1.1rem] text-slate-400">Tempo médio</p>
              <p className="text-[2rem] font-bold text-slate-800">0s</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
        <h2 className="text-[1.2rem] font-bold text-slate-800">
          Taxa de acerto geral
        </h2>

        <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-center">
          <ProgressCircle value={0} />

          <div>
            <p className="text-[1.2rem] font-semibold text-slate-700">
              0 acertos de 0 questões
            </p>
            <p className="mt-1 text-[1.05rem] text-slate-400">
              0 atividades realizadas
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
        <h2 className="text-[1.2rem] font-bold text-slate-800">
          Histórico de atividades
        </h2>

        <div className="flex min-h-[220px] items-center justify-center">
          <p className="text-[1.15rem] text-slate-400">
            Nenhuma atividade realizada ainda.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}

export default ProgressPage