import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import PhaseNode from "../components/PhaseNode"

const contentTitles: Record<string, string> = {
  adicao: "Adição",
  subtracao: "Subtração",
  multiplicacao: "Multiplicação",
  divisao: "Divisão",
  problemas: "Problemas",
}

const levelLabels: Record<string, string> = {
  "nivel-1": "Nível 1 — Fácil",
  "nivel-2": "Nível 2 — Médio",
  "nivel-3": "Nível 3 — Difícil",
  "nivel-4": "Nível 4 — Avançado",
}

const phases = Array.from({ length: 10 }, (_, index) => {
  if (index === 0) return { number: index + 1, status: "current" as const }
  return { number: index + 1, status: "locked" as const }
})

function LevelPathPage() {
  const navigate = useNavigate()
  const { conteudo, nivel } = useParams()

  const title = contentTitles[conteudo || ""] || "Conteúdo"
  const subtitle = levelLabels[nivel || ""] || "Nível"

  const completedPhases = 0
  const totalPhases = 10
  const progressPercent = 0

  const handlePhaseClick = (phaseNumber: number) => {
    navigate(`/atividades/${conteudo}/${nivel}/fase-${phaseNumber}`)
  }

  const getOffsetClass = (index: number) => {
    if (index % 3 === 0) return "-translate-x-28"
    if (index % 3 === 1) return "translate-x-0"
    return "translate-x-28"
  }

  return (
    <AppLayout>
      <div>
        <button
          type="button"
          onClick={() => navigate(`/atividades/${conteudo}`)}
          className="mb-3 text-2xl text-slate-600 transition hover:text-slate-800"
        >
          ←
        </button>

        <h1 className="text-[2.5rem] font-extrabold text-slate-900">{title}</h1>
        <p className="mt-1 text-[1.1rem] text-slate-400">{subtitle}</p>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-[1rem] font-semibold text-slate-600">
          <span>
            {completedPhases} de {totalPhases} fases concluídas
          </span>
          <span>{progressPercent}%</span>
        </div>

        <div className="h-3 w-full rounded-full bg-slate-100">
          <div
            className="h-3 rounded-full bg-[#4a8fd3]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-10 flex justify-center pb-12">
        <div className="relative w-full max-w-3xl">
          <svg
            className="absolute left-1/2 top-0 -translate-x-1/2"
            width="420"
            height={phases.length * 150}
            viewBox={`0 0 420 ${phases.length * 150}`}
            fill="none"
          >
            {phases.slice(0, -1).map((_, index) => {
              const xPositions = [90, 210, 330]
              const startX = xPositions[index % 3]
              const endX = xPositions[(index + 1) % 3]
              const startY = 40 + index * 150
              const endY = 40 + (index + 1) * 150
              const controlY = (startY + endY) / 2

              return (
                <path
                  key={index}
                  d={`M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`}
                  stroke="#dbe2ea"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
              )
            })}
          </svg>

          <div className="relative z-10 flex flex-col items-center gap-[70px]">
            {phases.map((phase, index) => (
              <div
                key={phase.number}
                className={`transform ${getOffsetClass(index)}`}
              >
                <PhaseNode
                  number={phase.number}
                  status={phase.status}
                  onClick={() => handlePhaseClick(phase.number)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default LevelPathPage