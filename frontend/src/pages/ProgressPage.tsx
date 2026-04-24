import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import ProgressCircle from "../components/ProgressCircle"
import { CheckCircle2, CircleX, FileText } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import {
  getProgressSummary,
  getProgressReport,
  downloadProgressReportPdf,
  type ProgressPeriod,
  type ProgressSummaryResponse,
  type ProgressReportPeriod,
} from "../services/progress"

const contentStyles: Record<
  string,
  {
    bar: string
    badge: string
    text: string
  }
> = {
  Adição: {
    bar: "bg-[#3B82F6]",
    badge: "bg-[#EFF6FF]",
    text: "text-[#2563EB]",
  },
  Subtração: {
    bar: "bg-[#22C55E]",
    badge: "bg-[#F0FDF4]",
    text: "text-[#16A34A]",
  },
  Multiplicação: {
    bar: "bg-[#FACC15]",
    badge: "bg-[#FEFCE8]",
    text: "text-[#CA8A04]",
  },
  Divisão: {
    bar: "bg-[#A855F7]",
    badge: "bg-[#FAF5FF]",
    text: "text-[#9333EA]",
  },
  Problemas: {
    bar: "bg-[#EF4444]",
    badge: "bg-[#FEF2F2]",
    text: "text-[#EF4444]",
  },
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

function formatDateTime(value: string | null) {
  if (!value) return "Data não informada"

  const date = new Date(value)

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ProgressPage() {
  const [period, setPeriod] = useState<ProgressPeriod>("all")
  const [summary, setSummary] = useState<ProgressSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [reportPeriod, setReportPeriod] = useState<ProgressReportPeriod | null>(null)
  const [reportText, setReportText] = useState("")
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState("")

  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const { student } = useAuth()

  useEffect(() => {
    if (!student?.id) return

    async function loadProgress() {
      try {
        setLoading(true)
        setError("")
        setReportText("")
        setReportError("")
        setReportPeriod(null)

        const data = await getProgressSummary(period)
        setSummary(data)
      } catch (err) {
        console.error("Erro ao carregar progresso:", err)
        setError("Não foi possível carregar o progresso.")
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [period, student?.id])

  const totalCorrect = summary?.correct_answers ?? 0
  const totalWrong = summary?.wrong_answers ?? 0
  const totalQuestions = totalCorrect + totalWrong
  const totalActivities = summary?.total_activities ?? 0
  const hasProgressData = totalActivities > 0
  const accuracyRate = summary?.accuracy ?? 0

  async function handleGenerateReport(selectedPeriod: ProgressReportPeriod) {
    if (!student?.id || !hasProgressData) return

    try {
      setReportPeriod(selectedPeriod)
      setReportLoading(true)
      setReportError("")

      const data = await getProgressReport(selectedPeriod)
      setReportText(data.report)
    } catch (err) {
      console.error("Erro ao gerar relatório:", err)
      setReportError("Não foi possível gerar o relatório.")
      setReportText("")
    } finally {
      setReportLoading(false)
    }
  }

  async function handleDownloadPdf() {
    if (!reportPeriod || !student?.id) return

    try {
      setDownloadingPdf(true)
      await downloadProgressReportPdf(reportPeriod)
    } catch (err) {
      console.error("Erro ao baixar PDF:", err)
    } finally {
      setDownloadingPdf(false)
    }
  }

  const contentProgress = useMemo(() => {
    const rawItems = summary?.content_progress ?? []

    const mapped = rawItems.map((item) => ({
      ...item,
      barColor: contentStyles[item.content]?.bar || "bg-slate-400",
      badgeColor: contentStyles[item.content]?.badge || "bg-slate-100",
      textColor: contentStyles[item.content]?.text || "text-slate-600",
    }))

    return [...mapped].sort(
      (a, b) => contentOrder.indexOf(a.content) - contentOrder.indexOf(b.content)
    )
  }, [summary])

  const activityHistory = useMemo(() => {
    return (summary?.history ?? []).map((activity) => ({
      title: activity.title,
      details: `${activity.correct}/${activity.total} acertos • ${formatSeconds(activity.seconds)}`,
      date: `Realizada em ${formatDateTime(activity.finished_at)}`,
      points: `+${activity.points} pts`,
    }))
  }, [summary])

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-[1.9rem] font-extrabold leading-tight text-slate-900 sm:text-[2.2rem] lg:text-[2.5rem]">
              Meu Progresso
            </h1>
            <p className="mt-1 text-[0.98rem] text-slate-400 sm:text-[1.05rem] lg:text-[1.1rem]">
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
                  className={`rounded-full px-3.5 py-2 text-[0.86rem] font-semibold transition sm:px-4 sm:text-sm ${
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
          <div className="rounded-[1.6rem] bg-white px-5 py-8 text-center text-sm text-slate-500 shadow-sm sm:rounded-[2rem] sm:px-7 sm:py-10 sm:text-base">
            Carregando progresso...
          </div>
        )}

        {error && (
          <div className="rounded-[1.6rem] border border-red-200 bg-red-50 px-5 py-8 text-center text-sm text-red-700 shadow-sm sm:rounded-[2rem] sm:px-7 sm:py-10 sm:text-base">
            {error}
          </div>
        )}

        {!loading && !error && summary && (
          <>
            <div className="rounded-[1.6rem] bg-white px-4 py-6 shadow-sm sm:rounded-[2rem] sm:px-6 sm:py-7 lg:px-7 lg:py-8">
              <h2 className="text-[1.05rem] font-bold text-slate-800 sm:text-[1.15rem] lg:text-[1.2rem]">
                Taxa de acerto geral
              </h2>

              <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left md:gap-6">
                  <ProgressCircle value={accuracyRate} />

                  <div className="min-w-0">
                    <p className="text-[1.05rem] font-semibold leading-snug text-slate-700 sm:text-[1.12rem] lg:text-[1.2rem]">
                      {totalCorrect} acertos de {totalQuestions} questões
                    </p>
                    <p className="mt-1 text-[0.95rem] text-slate-400 sm:text-[1rem] lg:text-[1.05rem]">
                      {totalActivities} atividades realizadas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:min-w-[340px]">
                  <div className="rounded-[1.25rem] bg-[#eefaf2] px-4 py-4 sm:rounded-[1.4rem] sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dff4e8] text-[#49b67f] sm:h-12 sm:w-12">
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[0.95rem] font-medium text-slate-400 sm:text-[1rem]">
                          Acertos
                        </p>
                        <p className="text-[1.55rem] font-bold leading-none text-slate-800 sm:text-[1.8rem]">
                          {totalCorrect}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] bg-[#fff2f2] px-4 py-4 sm:rounded-[1.4rem] sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ffe3e3] text-[#ef6262] sm:h-12 sm:w-12">
                        <CircleX className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[0.95rem] font-medium text-slate-400 sm:text-[1rem]">
                          Erros
                        </p>
                        <p className="text-[1.55rem] font-bold leading-none text-slate-800 sm:text-[1.8rem]">
                          {totalWrong}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.6rem] bg-white px-4 py-6 shadow-sm sm:rounded-[2rem] sm:px-6 sm:py-7 lg:px-7 lg:py-8">
              <h2 className="text-[1.05rem] font-bold text-slate-800 sm:text-[1.15rem] lg:text-[1.2rem]">
                Progresso por conteúdo
              </h2>
              <p className="mt-1 text-[0.95rem] text-slate-400 sm:text-[1rem]">
                Veja sua evolução em cada conteúdo
              </p>

              <div className="mt-6 space-y-5">
                {contentProgress.map((item) => (
                  <div
                    key={item.content}
                    className="rounded-[1.4rem] border border-slate-100 bg-white p-4 sm:p-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-[0.95rem] font-bold sm:text-[1rem] ${item.badgeColor} ${item.textColor}`}
                      >
                        {item.content}
                      </span>

                      <span className="shrink-0 text-[0.92rem] text-slate-400 sm:text-[1rem]">
                        {item.progress}%
                      </span>
                    </div>

                    <div className="h-4 w-full rounded-full bg-slate-200">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${item.barColor}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}

                {contentProgress.length === 0 && (
                  <div className="flex min-h-[120px] items-center justify-center rounded-[1.25rem] bg-slate-50 px-4 text-center sm:rounded-[1.4rem]">
                    <p className="text-[0.95rem] text-slate-400 sm:text-[1rem]">
                      Ainda não há progresso por conteúdo para exibir.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.6rem] bg-white px-4 py-6 shadow-sm sm:rounded-[2rem] sm:px-6 sm:py-7 lg:px-7 lg:py-8">
              <h2 className="text-[1.05rem] font-bold text-slate-800 sm:text-[1.15rem] lg:text-[1.2rem]">
                Histórico de atividades
              </h2>

              {activityHistory.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {activityHistory.map((activity, index) => (
                    <div
                      key={`${activity.title}-${index}`}
                      className="flex flex-col gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-4 sm:rounded-[1.4rem] sm:px-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-[1rem] font-bold leading-snug text-slate-800 sm:text-[1.05rem] lg:text-[1.1rem]">
                          {activity.title}
                        </p>
                        <p className="mt-1 text-[0.94rem] text-slate-400 sm:text-[1rem]">
                          {activity.details}
                        </p>
                        <p className="mt-1 text-[0.85rem] text-slate-400 sm:text-[0.92rem]">
                          {activity.date}
                        </p>
                      </div>

                      <span className="shrink-0 text-[1.05rem] font-bold text-[#79c6a1] sm:text-[1.15rem] lg:text-[1.2rem]">
                        {activity.points}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[180px] items-center justify-center px-4 text-center sm:min-h-[220px]">
                  <p className="text-[1rem] text-slate-400 sm:text-[1.1rem] lg:text-[1.15rem]">
                    Nenhuma atividade realizada neste período.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[1.6rem] border border-[#dceeed] bg-[#eef7f6] px-4 py-6 shadow-sm sm:rounded-[2rem] sm:px-6 sm:py-7 lg:px-7 lg:py-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#4a8fd3] shadow-sm sm:h-11 sm:w-11">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-[1.05rem] font-bold text-slate-800 sm:text-[1.15rem] lg:text-[1.2rem]">
                    Gerar relatório simplificado
                  </h2>
                  <p className="mt-2 text-[0.95rem] text-slate-500 sm:text-[1rem]">
                    Escolha o período para gerar um relatório para o responsável.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                <button
                  type="button"
                  disabled={!hasProgressData}
                  onClick={() => handleGenerateReport("7d")}
                  className={`rounded-[1rem] border px-4 py-3.5 text-[0.98rem] font-semibold shadow-sm transition sm:rounded-[1.1rem] sm:px-6 sm:py-4 sm:text-[1.02rem] ${
                    !hasProgressData
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 shadow-none"
                      : reportPeriod === "7d"
                        ? "border-[#4a8fd3] bg-[#4a8fd3] text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  7 dias
                </button>

                <button
                  type="button"
                  disabled={!hasProgressData}
                  onClick={() => handleGenerateReport("14d")}
                  className={`rounded-[1rem] border px-4 py-3.5 text-[0.98rem] font-semibold shadow-sm transition sm:rounded-[1.1rem] sm:px-6 sm:py-4 sm:text-[1.02rem] ${
                    !hasProgressData
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 shadow-none"
                      : reportPeriod === "14d"
                        ? "border-[#4a8fd3] bg-[#4a8fd3] text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  14 dias
                </button>

                <button
                  type="button"
                  disabled={!hasProgressData}
                  onClick={() => handleGenerateReport("30d")}
                  className={`rounded-[1rem] border px-4 py-3.5 text-[0.98rem] font-semibold shadow-sm transition sm:rounded-[1.1rem] sm:px-6 sm:py-4 sm:text-[1.02rem] ${
                    !hasProgressData
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 shadow-none"
                      : reportPeriod === "30d"
                        ? "border-[#4a8fd3] bg-[#4a8fd3] text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  30 dias
                </button>
              </div>

              {!hasProgressData && (
                <div className="mt-5 rounded-[1.1rem] border border-slate-200 bg-white px-4 py-4 text-[0.94rem] text-slate-500 shadow-sm sm:rounded-[1.2rem] sm:px-5 sm:text-[0.98rem]">
                  O relatório será liberado após a realização das primeiras atividades.
                </div>
              )}

              {reportLoading && (
                <div className="mt-6 rounded-[1.25rem] bg-white px-4 py-4 text-[0.96rem] text-slate-500 shadow-sm sm:rounded-[1.4rem] sm:px-5 sm:text-[1rem]">
                  Gerando relatório...
                </div>
              )}

              {reportError && (
                <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-4 text-[0.96rem] text-red-700 shadow-sm sm:rounded-[1.4rem] sm:px-5 sm:text-[1rem]">
                  {reportError}
                </div>
              )}

              {!reportLoading && reportText && hasProgressData && (
                <div className="mt-6 rounded-[1.35rem] bg-white px-4 py-5 shadow-sm sm:rounded-[1.6rem] sm:px-6 sm:py-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-[1rem] font-bold text-slate-800 sm:text-[1.1rem]">
                      Relatório gerado
                    </h3>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                      className="w-full rounded-full bg-[#4a8fd3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3b7fc2] disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
                    >
                      {downloadingPdf ? "Baixando PDF..." : "Baixar PDF"}
                    </button>
                  </div>

                  <div className="mt-4 whitespace-pre-line break-words text-[0.96rem] leading-7 text-slate-700 sm:text-[1rem]">
                    {reportText.replace(/\*\*/g, "")}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default ProgressPage