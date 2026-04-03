import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import PhaseNode from "../components/PhaseNode"
import { api } from "../services/api"

type PhaseMapItem = {
  phase_id: number
  phase_number: number
  is_active: boolean
  is_unlocked: boolean
  is_completed: boolean
  score: number
  total_questions: number
}

function LevelPathPage() {
  const navigate = useNavigate()
  const { conteudo, nivel } = useParams()

  const [phases, setPhases] = useState<PhaseMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const studentId = 1

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        setLoading(true)

        const response = await api.get(
          `/progress/phase-map/?student_id=${studentId}&content=${conteudo}&level=${nivel}`
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
  }, [conteudo, nivel])

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

  const getOffsetClass = (index: number) => {
    if (index % 3 === 0) return "-translate-x-28"
    if (index % 3 === 1) return "translate-x-0"
    return "translate-x-28"
  }

  const getPositionType = (index: number) => {
    if (index % 3 === 0) return 90
    if (index % 3 === 1) return 210
    return 330
  }

  const renderConnection = (index: number) => {
    const startX = getPositionType(index)
    const endX = getPositionType(index + 1)
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
  }

  const getPhaseStatus = (phase: PhaseMapItem) => {
    if (phase.is_completed) return "completed"
    if (phase.phase_id === currentPhaseId) return "current"
    return "locked"
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

        <h1 className="text-[2.5rem] font-extrabold text-slate-900">
          {conteudo}
        </h1>
        <p className="mt-1 text-[1.1rem] text-slate-400">
          {nivel}
        </p>
      </div>

      {loading && (
        <div className="mt-8 rounded-[1.8rem] bg-white px-7 py-8 text-slate-500 shadow-sm">
          Carregando fases...
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-[1.8rem] border border-red-200 bg-red-50 px-7 py-8 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && phases.length > 0 && (
        <>
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
                {phases.slice(0, -1).map((_, index) => renderConnection(index))}
              </svg>

              <div className="relative z-10 flex flex-col items-center gap-[70px]">
                {phases.map((phase, index) => {
                  const status = getPhaseStatus(phase)

                  return (
                    <div
                      key={phase.phase_id}
                      className={`transform ${getOffsetClass(index)}`}
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
        <div className="mt-8 rounded-[1.8rem] bg-white px-7 py-8 text-slate-500 shadow-sm">
          Nenhuma fase encontrada para este conteúdo e nível.
        </div>
      )}
    </AppLayout>
  )
}

export default LevelPathPage