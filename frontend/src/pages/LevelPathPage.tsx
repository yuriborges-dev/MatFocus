import { useEffect, useMemo, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import PhaseNode from "../components/PhaseNode"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"

type PhaseMapItem = {
  phase_id: number
  phase_number: number
  is_active: boolean
  is_unlocked: boolean
  is_completed: boolean
  score: number
  total_questions: number
}

function formatContentTitle(value?: string) {
  if (!value) return "Conteúdo"

  const map: Record<string, string> = {
    adicao: "Adição",
    subtracao: "Subtração",
    multiplicacao: "Multiplicação",
    divisao: "Divisão",
    problemas: "Problemas",
  }

  return map[value] || value.charAt(0).toUpperCase() + value.slice(1)
}

function formatLevelTitle(value?: string) {
  if (!value) return ""

  const map: Record<string, string> = {
    "nivel-1": "Nível 1",
    "nivel-2": "Nível 2",
    "nivel-3": "Nível 3",
    "nivel-4": "Nível 4",
  }

  return map[value] || value
}

function LevelPathPage() {
  const navigate = useNavigate()
  const { conteudo, nivel } = useParams()

  const [phases, setPhases] = useState<PhaseMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { student } = useAuth()

  const nodeSize = 80
  const nodeBlockHeight = 118
  const verticalGap = 92
  const topPadding = 40
  const bottomPadding = 120
  const svgWidth = 420

  const backgroundStyles: Record<
    string,
    {
      wrapper: string
      glowOne: string
      glowTwo: string
      progressBar: string
      symbol: string
      symbolColor: string
    }
  > = {
    adicao: {
      wrapper: "from-blue-100 via-sky-100 to-white",
      glowOne: "bg-blue-300/40",
      glowTwo: "bg-sky-300/30",
      progressBar: "bg-[#3f8ae0]",
      symbol: "+",
      symbolColor: "text-blue-300/40",
    },
    subtracao: {
      wrapper: "from-green-100 via-emerald-100 to-white",
      glowOne: "bg-green-300/40",
      glowTwo: "bg-emerald-300/30",
      progressBar: "bg-[#39b86a]",
      symbol: "−",
      symbolColor: "text-green-300/40",
    },
    multiplicacao: {
      wrapper: "from-yellow-50 via-amber-50 to-white",
      glowOne: "bg-yellow-200/30",
      glowTwo: "bg-amber-200/20",
      progressBar: "bg-[#e3b72b]",
      symbol: "×",
      symbolColor: "text-yellow-300/35",
    },
    divisao: {
      wrapper: "from-purple-100 via-violet-100 to-white",
      glowOne: "bg-purple-300/40",
      glowTwo: "bg-violet-300/30",
      progressBar: "bg-[#9b5cf6]",
      symbol: "÷",
      symbolColor: "text-purple-300/40",
    },
    problemas: {
      wrapper: "from-red-100 via-rose-100 to-white",
      glowOne: "bg-red-300/40",
      glowTwo: "bg-rose-300/30",
      progressBar: "bg-[#ef4444]",
      symbol: "?",
      symbolColor: "text-red-300/40",
    },
  }

  const currentBackground =
    backgroundStyles[conteudo || ""] || {
      wrapper: "from-slate-50 via-white to-slate-50",
      glowOne: "bg-slate-200/20",
      glowTwo: "bg-slate-200/10",
      progressBar: "bg-[#4a8fd3]",
      symbol: "•",
      symbolColor: "text-slate-200/30",
    }

  useEffect(() => {
    if (!conteudo || !nivel) {
      setError("Conteúdo ou nível inválido.")
      setLoading(false)
      return
    }

    if (!student?.id) return

    const currentStudentId = student.id

    const fetchPhases = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await api.get(
          `/progress/phase-map/?student_id=${currentStudentId}&content=${conteudo}&level=${nivel}`
        )

        setPhases(response.data)
      } catch (err) {
        console.error(err)
        setError("Não foi possível carregar as fases.")
      } finally {
        setLoading(false)
      }
    }

    fetchPhases()
  }, [conteudo, nivel, student?.id])

  const completedPhases = useMemo(
    () => phases.filter((p) => p.is_completed).length,
    [phases]
  )

  const totalPhases = phases.length

  const progressPercent = useMemo(() => {
    if (!totalPhases) return 0
    return Math.round((completedPhases / totalPhases) * 100)
  }, [completedPhases, totalPhases])

  const currentPhaseId = useMemo(() => {
    const currentPhase = phases.find(
      (phase) => phase.is_unlocked && !phase.is_completed
    )

    return currentPhase?.phase_id ?? null
  }, [phases])

  const handlePhaseClick = (phase: PhaseMapItem) => {
    if (phase.phase_id !== currentPhaseId && !phase.is_completed) return

    navigate(`/atividades/${conteudo}/${nivel}/fase/${phase.phase_number}`)
  }

  const getOffsetX = (index: number) => {
    if (index % 3 === 0) return -160
    if (index % 3 === 1) return 0
    return 160
  }

  const getNodeCenterX = (index: number) => {
    return svgWidth / 2 + getOffsetX(index)
  }

  const getNodeTop = (index: number) => {
    return topPadding + index * (nodeBlockHeight + verticalGap)
  }

  const getNodeCenterY = (index: number) => {
    return getNodeTop(index) + nodeSize / 2
  }

  const mapHeight = useMemo(() => {
    if (phases.length === 0) return 700

    const lastNodeTop = getNodeTop(phases.length - 1)
    return lastNodeTop + nodeBlockHeight + bottomPadding
  }, [phases.length])

  const renderConnection = (index: number) => {
    const startX = getNodeCenterX(index)
    const endX = getNodeCenterX(index + 1)
    const startY = getNodeCenterY(index)
    const endY = getNodeCenterY(index + 1)
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
  }

  const getPhaseStatus = (phase: PhaseMapItem) => {
    if (phase.is_completed) return "completed"
    if (phase.phase_id === currentPhaseId) return "current"
    if (phase.is_unlocked) return "unlocked"
    return "locked"
  }

  return (
    <AppLayout>
      <div
        className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-b ${currentBackground.wrapper} px-6 py-6 md:px-8 md:py-8`}
      >
        <div
          className={`pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full blur-3xl ${currentBackground.glowOne}`}
        />
        <div
          className={`pointer-events-none absolute right-0 top-[28%] h-64 w-64 rounded-full blur-3xl ${currentBackground.glowTwo}`}
        />
        <div
          className={`pointer-events-none absolute bottom-10 left-1/3 h-52 w-52 rounded-full blur-3xl ${currentBackground.glowTwo}`}
        />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className={`absolute left-[7%] top-[16%] text-[5rem] font-black ${currentBackground.symbolColor}`}
          >
            {currentBackground.symbol}
          </span>
          <span
            className={`absolute right-[10%] top-[22%] text-[6rem] font-black ${currentBackground.symbolColor}`}
          >
            {currentBackground.symbol}
          </span>
          <span
            className={`absolute left-[12%] top-[46%] text-[4.5rem] font-black ${currentBackground.symbolColor}`}
          >
            {currentBackground.symbol}
          </span>
          <span
            className={`absolute right-[16%] top-[58%] text-[5rem] font-black ${currentBackground.symbolColor}`}
          >
            {currentBackground.symbol}
          </span>
          <span
            className={`absolute left-[30%] bottom-[10%] text-[6rem] font-black ${currentBackground.symbolColor}`}
          >
            {currentBackground.symbol}
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate(`/atividades/${conteudo}`)}
            className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
            aria-label="Voltar para dificuldades"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <h1 className="text-[2.5rem] font-extrabold text-slate-900">
            {formatContentTitle(conteudo)}
          </h1>

          <p className="text-[1.1rem] font-medium text-slate-500">
            {formatLevelTitle(nivel)}
          </p>
        </div>

        {loading && (
          <div className="relative z-10 mt-8 rounded-[1.8rem] bg-white/90 px-7 py-8 text-slate-500 shadow-sm backdrop-blur-sm">
            Carregando fases...
          </div>
        )}

        {error && (
          <div className="relative z-10 mt-8 rounded-[1.8rem] border border-red-200 bg-red-50 px-7 py-8 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && phases.length > 0 && (
          <>
            <div className="relative z-10 mt-8 w-full rounded-[1.5rem] bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between text-[1rem] font-semibold text-slate-600">
                <span>
                  {completedPhases} de {totalPhases} fases concluídas
                </span>
                <span>{progressPercent}%</span>
              </div>

              <div className="h-3 w-full rounded-full bg-white/90">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${currentBackground.progressBar}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="relative z-10 mt-10 flex justify-center pb-16">
              <div
                className="relative w-full max-w-3xl"
                style={{ height: `${mapHeight}px` }}
              >
                <svg
                  className="absolute left-1/2 top-0 -translate-x-1/2"
                  width={svgWidth}
                  height={mapHeight}
                  viewBox={`0 0 ${svgWidth} ${mapHeight}`}
                  fill="none"
                >
                  {phases.slice(0, -1).map((_, index) => renderConnection(index))}
                </svg>

                <div className="relative z-10 h-full w-full">
                  {phases.map((phase, index) => {
                    const status = getPhaseStatus(phase)
                    const nodeTop = getNodeTop(index)
                    const offsetX = getOffsetX(index)

                    return (
                      <div
                        key={phase.phase_id}
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                          top: `${nodeTop}px`,
                          transform: `translateX(calc(-50% + ${offsetX}px))`,
                        }}
                      >
                        <PhaseNode
                          number={phase.phase_number}
                          status={status}
                          score={phase.score}
                          onClick={() => handlePhaseClick(phase)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && phases.length === 0 && (
          <div className="relative z-10 mt-8 rounded-[1.8rem] bg-white/90 px-7 py-8 text-slate-500 shadow-sm backdrop-blur-sm">
            Nenhuma fase encontrada para este conteúdo e nível.
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default LevelPathPage