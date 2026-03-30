import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import {
  getDifficultyOptionsWithProgress,
  type DifficultyOptionWithProgress,
} from "../services/activities"

const levelStyles: Record<
  string,
  {
    accent: string
    activeBadge: string
    lockedBadge: string
    lockedBadgeText: string
  }
> = {
  "nivel-1": {
    accent: "bg-blue-500",
    activeBadge: "bg-blue-500 text-white",
    lockedBadge: "bg-slate-200",
    lockedBadgeText: "text-slate-500",
  },
  "nivel-2": {
    accent: "bg-green-300",
    activeBadge: "bg-green-400 text-white",
    lockedBadge: "bg-slate-200",
    lockedBadgeText: "text-slate-500",
  },
  "nivel-3": {
    accent: "bg-yellow-300",
    activeBadge: "bg-yellow-400 text-white",
    lockedBadge: "bg-slate-200",
    lockedBadgeText: "text-slate-500",
  },
  "nivel-4": {
    accent: "bg-purple-300",
    activeBadge: "bg-purple-400 text-white",
    lockedBadge: "bg-slate-200",
    lockedBadgeText: "text-slate-500",
  },
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

function getDifficultyLabel(order: number) {
  if (order === 1) return "Fácil"
  if (order === 2) return "Médio"
  if (order === 3) return "Difícil"
  return "Avançado"
}

function DifficultyPage() {
  const { conteudo } = useParams()
  const navigate = useNavigate()

  const [levels, setLevels] = useState<DifficultyOptionWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const studentId = 1

  useEffect(() => {
    const fetchLevels = async () => {
      if (!conteudo) {
        setError("Conteúdo inválido.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const data = await getDifficultyOptionsWithProgress(conteudo, studentId)
        setLevels(data)
      } catch {
        setError("Não foi possível carregar os níveis.")
      } finally {
        setLoading(false)
      }
    }

    fetchLevels()
  }, [conteudo])

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
          {formatContentTitle(conteudo)}
        </h1>

        <p className="mt-1 text-[1.1rem] text-slate-400">
          Escolha o nível de dificuldade
        </p>
      </div>

      {loading && (
        <div className="mt-8 rounded-[1.8rem] bg-white px-7 py-8 text-slate-500 shadow-sm">
          Carregando níveis...
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-[1.8rem] border border-red-200 bg-red-50 px-7 py-8 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {levels.map((level) => {
            const styles = levelStyles[level.code] || {
              accent: "bg-slate-300",
              activeBadge: "bg-slate-500 text-white",
              lockedBadge: "bg-slate-200",
              lockedBadgeText: "text-slate-500",
            }

            const isLocked = !level.unlocked
            const isCompleted =
              level.totalPhases > 0 && level.completedPhases === level.totalPhases

            return (
              <button
                key={level.id}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return
                  navigate(`/atividades/${conteudo}/${level.code}`)
                }}
                className={`relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white px-6 py-6 text-left shadow-sm transition ${
                  isLocked
                    ? "cursor-not-allowed opacity-70"
                    : "hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className={`absolute left-0 top-0 h-3 w-full ${styles.accent}`} />

                <div className="mt-4 flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] text-xl font-extrabold ${
                      isLocked
                        ? `${styles.lockedBadge} ${styles.lockedBadgeText}`
                        : styles.activeBadge
                    }`}
                  >
                    {isLocked ? "🔒" : level.difficulty_order}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[1.8rem] font-bold leading-none text-slate-800">
                      {level.title}
                    </h3>

                    <p className="mt-2 text-[1rem] text-slate-400">
                      {isLocked
                        ? "Bloqueado"
                        : `${level.completedPhases}/${level.totalPhases} fases • ${getDifficultyLabel(level.difficulty_order)}`}
                    </p>

                    {!isLocked && isCompleted && (
                      <p className="mt-1 text-sm font-semibold text-green-600">
                        Concluído
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}

export default DifficultyPage