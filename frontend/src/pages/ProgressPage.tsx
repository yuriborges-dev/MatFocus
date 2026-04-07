import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import ProgressCircle from "../components/ProgressCircle"
import { CheckCircle2, CircleX } from "lucide-react"
import {
  getProgressSummary,
  type ProgressPeriod,
  type ProgressSummaryResponse,
} from "../services/progress"

const contentColors: Record<string, string> = {
  Adição: "bg-blue-500",
  Subtração: "bg-green-500",
  Multiplicação: "bg-yellow-400",
  Divisão: "bg-purple-500",
  Problemas: "bg-red-500",
}

const contentOrder = [
  "Adição",
  "Subtração",
  "Multiplicação",
  "Divisão",
  "Problemas",
]

const periodOptions: { value: ProgressPeriod; label: string }[] = [
  { value: "all", label: "Geral" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "14d", label: "Últimos 14 dias" },
  { value: "30d", label: "Últimos 30 dias" },
]

function formatSeconds(seconds: number) {
  if (!seconds || seconds <= 0) return "0s"
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes}min`
  }

  return `${minutes}min ${remainingSeconds}s`
}

function ProgressPage() {
  const [period, setPeriod] = useState<ProgressPeriod>("all")
  const [summary, setSummary] = useState<ProgressSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const studentId = 1

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true)
        setError("")

        const data = await getProgressSummary(studentId, period)
        setSummary(data)
      } catch (err) {
        console.error("Erro ao carregar progresso:", err)
        setError("Não foi possível carregar o progresso.")
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [period])

  const totalCorrect = summary?.correct_answers ?? 0
  const totalWrong = summary?.wrong_answers ?? 0
  const totalQuestions = totalCorrect + totalWrong
  const totalActivities = summary?.total_activities ?? 0
  const accuracyRate = summary?.accuracy ?? 0

  const contentProgress = useMemo(() => {
    const rawItems = summary?.content_progress ?? []

    const mapped = rawItems.map((item) => ({
      ...item,
      color: contentColors[item.content] || "bg-slate-400",
    }))

    return [...mapped].sort(
      (a, b) => contentOrder.indexOf(a.content) - contentOrder.indexOf(b.content)
    )
  }, [summary])

  const activityHistory = useMemo(() => {
    return (summary?.history ?? []).map((activity) => ({
      title: activity.title,
      details: `${activity.correct}/${activity.total} acertos • ${formatSeconds(activity.seconds)}`,
      points: `+${activity.correct * 10} pts`,
    }))
  }, [summary])

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[2.5rem] font-extrabold text-slate-900">
            Meu Progresso
          </h1>
          <p className="mt-1 text-[1.1rem] text-slate-400">
            Acompanhe seu desempenho
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => {
            const isActive = period === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPeriod(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#4a8fd3] text-white shadow-sm"
                    : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading && (
        <div className="mt-7 rounded-[2rem] bg-white px-7 py-10 text-center text-slate-500 shadow-sm">
          Carregando progresso...
        </div>
      )}

      {error && (
        <div className="mt-7 rounded-[2rem] border border-red-200 bg-red-50 px-7 py-10 text-center text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
            <h2 className="text-[1.2rem] font-bold text-slate-800">
              Taxa de acerto geral
            </h2>

            <div className="mt-7 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <ProgressCircle value={accuracyRate} />

                <div>
                  <p className="text-[1.2rem] font-semibold text-slate-700">
                    {totalCorrect} acertos de {totalQuestions} questões
                  </p>
                  <p className="mt-1 text-[1.05rem] text-slate-400">
                    {totalActivities} atividades realizadas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:min-w-[340px]">
                <div className="rounded-[1.4rem] bg-[#eefaf2] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff4e8] text-[#49b67f]">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-[1rem] font-medium text-slate-400">
                        Acertos
                      </p>
                      <p className="text-[1.8rem] font-bold text-slate-800">
                        {totalCorrect}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.4rem] bg-[#fff2f2] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe3e3] text-[#ef6262]">
                      <CircleX className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-[1rem] font-medium text-slate-400">
                        Erros
                      </p>
                      <p className="text-[1.8rem] font-bold text-slate-800">
                        {totalWrong}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
            <h2 className="text-[1.2rem] font-bold text-slate-800">
              Progresso por conteúdo
            </h2>
            <p className="mt-1 text-[1rem] text-slate-400">
              Veja sua evolução em cada conteúdo
            </p>

            <div className="mt-6 space-y-5">
              {contentProgress.map((item) => (
                <div key={item.content}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[1.05rem] font-semibold text-slate-700">
                      {item.content}
                    </span>

                    <span className="text-[1rem] text-slate-400">
                      {item.progress}%
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}

              {contentProgress.length === 0 && (
                <div className="flex min-h-[120px] items-center justify-center rounded-[1.4rem] bg-slate-50">
                  <p className="text-[1rem] text-slate-400">
                    Ainda não há progresso por conteúdo para exibir.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
            <h2 className="text-[1.2rem] font-bold text-slate-800">
              Histórico de atividades
            </h2>

            {activityHistory.length > 0 ? (
              <div className="mt-6 space-y-4">
                {activityHistory.map((activity, index) => (
                  <div
                    key={`${activity.title}-${index}`}
                    className="flex flex-col gap-3 rounded-[1.4rem] bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-[1.1rem] font-bold text-slate-800">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-[1rem] text-slate-400">
                        {activity.details}
                      </p>
                    </div>

                    <span className="text-[1.2rem] font-bold text-[#79c6a1]">
                      {activity.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[220px] items-center justify-center">
                <p className="text-[1.15rem] text-slate-400">
                  Nenhuma atividade realizada neste período.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  )
}

export default ProgressPage