import { useEffect, useMemo, useState } from "react"
import BackButton from "../components/BackButton.tsx"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import PhaseNode from "../components/PhaseNode"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import {
  getAnimationLevel,
  getPageAnimation,
  getCardAnimation,
} from "../utils/animation.ts"

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

  return map[value] || value
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
  const { student } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  const [phases, setPhases] = useState<PhaseMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkScreen()
    window.addEventListener("resize", checkScreen)

    return () => window.removeEventListener("resize", checkScreen)
  }, [])

  const nodeSize = 80
  const nodeBlockHeight = 118
  const verticalGap = 92
  const topPadding = 40
  const bottomPadding = 120
  const svgWidth = isMobile ? 300 : 420

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
      wrapper: "from-blue-100 via-sky-100 to-blue-100",
      glowOne: "bg-blue-300/40",
      glowTwo: "bg-sky-300/30",
      progressBar: "bg-[#3f8ae0]",
      symbol: "+",
      symbolColor: "text-blue-300/40",
    },
    subtracao: {
      wrapper: "from-green-100 via-emerald-100 to-green-100",
      glowOne: "bg-green-300/40",
      glowTwo: "bg-emerald-300/30",
      progressBar: "bg-[#39b86a]",
      symbol: "−",
      symbolColor: "text-green-300/40",
    },
    multiplicacao: {
      wrapper: "from-yellow-50 via-amber-50 to-yellow-100",
      glowOne: "bg-yellow-200/30",
      glowTwo: "bg-amber-200/20",
      progressBar: "bg-[#e3b72b]",
      symbol: "×",
      symbolColor: "text-yellow-300/35",
    },
    divisao: {
      wrapper: "from-purple-100 via-violet-100 to-purple-100",
      glowOne: "bg-purple-300/40",
      glowTwo: "bg-violet-300/30",
      progressBar: "bg-[#9b5cf6]",
      symbol: "÷",
      symbolColor: "text-purple-300/40",
    },
    problemas: {
      wrapper: "from-red-100 via-rose-100 to-red-100",
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
    if (!conteudo || !nivel || !student?.id) return

    const fetchPhases = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await api.get(
          `/progress/phase-map/?content=${conteudo}&level=${nivel}`
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

  const getOffsetX = (index: number) => {
    if (isMobile) {
      if (index % 3 === 0) return -95
      if (index % 3 === 1) return 0
      return 95
    }

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

  const handlePhaseClick = (phase: PhaseMapItem) => {
    if (phase.phase_id !== currentPhaseId && !phase.is_completed) return

    navigate(`/atividades/${conteudo}/${nivel}/fase/${phase.phase_number}`)
  }

  return (
    <AppLayout>
      <div
        className={`relative overflow-hidden bg-gradient-to-b ${currentBackground.wrapper} ${getPageAnimation(animationLevel)}
        -mx-5 px-5 py-6
        sm:-mx-9 sm:px-9
        lg:mx-0 lg:rounded-[2rem] lg:px-6 lg:py-6
        xl:px-8 xl:py-8`}
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
            className={`absolute left-[7%] top-[16%] text-[4rem] font-black ${currentBackground.symbolColor} sm:text-[5rem]`}
          >
            {currentBackground.symbol}
          </span>
          <span
            className={`absolute right-[10%] top-[22%] text-[4.5rem] font-black ${currentBackground.symbolColor} sm:text-[6rem]`}
          >
            {currentBackground.symbol}
          </span>
          <span
            className={`absolute left-[12%] top-[46%] text-[4rem] font-black ${currentBackground.symbolColor} sm:text-[4.5rem]`}
          >
            {currentBackground.symbol}
          </span>
          <span
            className={`absolute right-[16%] top-[58%] text-[4.2rem] font-black ${currentBackground.symbolColor} sm:text-[5rem]`}
          >
            {currentBackground.symbol}
          </span>
          <span
            className={`absolute left-[30%] bottom-[10%] text-[5rem] font-black ${currentBackground.symbolColor} sm:text-[6rem]`}
          >
            {currentBackground.symbol}
          </span>
        </div>

        <div className="relative z-10">
          <div className="mb-3">
            <BackButton fallbackPath={`/atividades/${conteudo}`} />
          </div>

          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-[2.5rem]">
            {formatContentTitle(conteudo)}
          </h1>

          <p className="text-sm text-slate-500 sm:text-base lg:text-[1.1rem]">
            {formatLevelTitle(nivel)}
          </p>
        </div>

        {loading && (
          <div className="relative z-10 mt-8 rounded-[1.8rem] bg-white/90 px-5 py-6 text-slate-500 shadow-sm backdrop-blur-sm sm:px-7 sm:py-8">
            Carregando fases...
          </div>
        )}

        {error && (
          <div className="relative z-10 mt-8 rounded-[1.8rem] border border-red-200 bg-red-50 px-5 py-6 text-red-700 shadow-sm sm:px-7 sm:py-8">
            {error}
          </div>
        )}

        {!loading && !error && phases.length > 0 && (
          <>
            <div className={`relative z-10 mt-8 rounded-[1.5rem] bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm ${getCardAnimation(animationLevel)}`}>
              <div className="flex justify-between gap-4 text-sm font-semibold text-slate-600 sm:text-[1rem]">
                <span>
                  {completedPhases} de {totalPhases} fases concluídas
                </span>
                <span>{progressPercent}%</span>
              </div>

              <div className="mt-2 h-3 rounded-full bg-white/90">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${currentBackground.progressBar}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="relative z-10 mt-10 flex justify-center pb-16">
              <div
                className="relative w-full max-w-[320px] sm:max-w-3xl"
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
          <div className="relative z-10 mt-8 rounded-[1.8rem] bg-white/90 px-5 py-6 text-slate-500 shadow-sm backdrop-blur-sm sm:px-7 sm:py-8">
            Nenhuma fase encontrada para este conteúdo e nível.
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default LevelPathPage