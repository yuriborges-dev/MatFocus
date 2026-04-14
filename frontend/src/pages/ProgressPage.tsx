import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import ProgressCircle from "../components/ProgressCircle"
import { CheckCircle2, CircleX, FileText } from "lucide-react"
import {
  getProgressSummary,
  getProgressReport,
  downloadProgressReportPdf,
  type ProgressPeriod,
  type ProgressSummaryResponse,
  type ProgressReportPeriod,
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

  const [reportPeriod, setReportPeriod] = useState<ProgressReportPeriod | null>(null)
  const [reportText, setReportText] = useState("")
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState("")

  const [downloadingPdf, setDownloadingPdf] = useState(false)

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

  async function handleGenerateReport(selectedPeriod: ProgressReportPeriod) {
    try {
      setReportPeriod(selectedPeriod)
      setReportLoading(true)
      setReportError("")

      const data = await getProgressReport(studentId, selectedPeriod)
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
    if (!reportPeriod) return

    try {
      setDownloadingPdf(true)
      await downloadProgressReportPdf(studentId, reportPeriod)
    } catch (err) {
      console.error("Erro ao baixar PDF:", err)
    } finally {
      setDownloadingPdf(false)
    }
  }

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

          <div className="mt-7 rounded-[2rem] border border-[#dceeed] bg-[#eef7f6] px-7 py-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#4a8fd3] shadow-sm">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-[1.2rem] font-bold text-slate-800">
                  Gerar relatório simplificado
                </h2>
                <p className="mt-2 text-[1rem] text-slate-500">
                  Escolha o período para gerar um relatório para o responsável:
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                type="button"
                onClick={() => handleGenerateReport("7d")}
                className={`rounded-[1.1rem] border px-6 py-4 text-[1.05rem] font-semibold shadow-sm transition ${
                  reportPeriod === "7d"
                    ? "border-[#4a8fd3] bg-[#4a8fd3] text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                7 dias
              </button>

              <button
                type="button"
                onClick={() => handleGenerateReport("14d")}
                className={`rounded-[1.1rem] border px-6 py-4 text-[1.05rem] font-semibold shadow-sm transition ${
                  reportPeriod === "14d"
                    ? "border-[#4a8fd3] bg-[#4a8fd3] text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                14 dias
              </button>

              <button
                type="button"
                onClick={() => handleGenerateReport("30d")}
                className={`rounded-[1.1rem] border px-6 py-4 text-[1.05rem] font-semibold shadow-sm transition ${
                  reportPeriod === "30d"
                    ? "border-[#4a8fd3] bg-[#4a8fd3] text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                30 dias
              </button>
            </div>

            {reportLoading && (
              <div className="mt-6 rounded-[1.4rem] bg-white px-5 py-4 text-[1rem] text-slate-500 shadow-sm">
                Gerando relatório...
              </div>
            )}

            {reportError && (
              <div className="mt-6 rounded-[1.4rem] border border-red-200 bg-red-50 px-5 py-4 text-[1rem] text-red-700 shadow-sm">
                {reportError}
              </div>
            )}

            {!reportLoading && reportText && (
              <div className="mt-6 rounded-[1.6rem] bg-white px-6 py-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-[1.1rem] font-bold text-slate-800">
                    Relatório gerado
                  </h3>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="rounded-full bg-[#4a8fd3] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3b7fc2] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {downloadingPdf ? "Baixando PDF..." : "Baixar PDF"}
                  </button>
                </div>

                <div className="mt-4 whitespace-pre-line text-[1rem] leading-7 text-slate-700">
                  {reportText.replace(/\*\*/g, "")}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  )
}

export default ProgressPage