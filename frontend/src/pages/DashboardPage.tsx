import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  BookOpen,
  BarChart3,
  Sparkles,
  Star,
  Target,
} from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import { useAuth } from "../contexts/AuthContext"
import {
  getDashboardSummary,
  type DashboardSummaryResponse,
} from "../services/progress"

type ContentKey =
  | "Adição"
  | "Subtração"
  | "Multiplicação"
  | "Divisão"
  | "Problemas"

const contentOrder: ContentKey[] = [
  "Adição",
  "Subtração",
  "Multiplicação",
  "Divisão",
  "Problemas",
]

function DashboardPage() {
  const navigate = useNavigate()
  const { student } = useAuth()

  const [selectedContent, setSelectedContent] = useState<ContentKey>("Adição")
  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!student?.id) return

    async function loadDashboard() {
      try {
        setLoading(true)
        setError("")

        const data = await getDashboardSummary()
        setDashboard(data)
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err)
        setError("Não foi possível carregar a dashboard.")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [student?.id])

  const contentProgress = useMemo(() => {
    const mapped = (dashboard?.content_progress ?? []).map((item) => ({
      ...item,
      content: item.content as ContentKey,
    }))

    return [...mapped].sort(
      (a, b) => contentOrder.indexOf(a.content) - contentOrder.indexOf(b.content)
    )
  }, [dashboard])

  const selected = contentProgress.find(
    (item) => item.content === selectedContent
  ) || {
    content: selectedContent,
    progress: 0,
  }

  const fullName = dashboard?.student_name || student?.full_name || ""
  const studentName = fullName.split(" ")[0] || ""
  const totalPoints = dashboard?.points ?? 0
  const totalAccuracy = dashboard?.accuracy ?? 0
  const totalActivities = dashboard?.activities ?? 0
  const recentActivities = dashboard?.recent_activities ?? []
  const continueSection = dashboard?.continue_section

  const continueAvailable =
    continueSection?.content_slug &&
    continueSection?.level_code &&
    continueSection?.phase

  const currentHour = new Date().getHours()

  const greeting =
    currentHour >= 6 && currentHour < 12
      ? "Bom dia"
      : currentHour >= 12 && currentHour < 18
        ? "Boa tarde"
        : "Boa noite"

  if (loading) {
    return (
      <AppLayout>
        <div className="rounded-[2rem] bg-white px-5 py-8 text-center text-slate-500 shadow-sm sm:px-7 sm:py-10">
          Carregando dashboard...
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-8 text-center text-red-700 shadow-sm sm:px-7 sm:py-10">
          {error}
        </div>
      </AppLayout>
    )
  }

  function formatDateTime(value: string | null) {
    if (!value) return ""

    const date = new Date(value)

    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-[2.7rem]">
            {greeting}, {studentName}! 
          </h1>
          <p className="mt-1 max-w-xl text-base text-slate-400 sm:text-[1.1rem]">
            Você já avançou bastante hoje. Continue assim!
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#4a8fd3] to-[#68b1eb] px-5 py-5 text-white shadow-lg sm:mt-8 sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 rounded-[1.8rem] bg-white/10 px-5 py-5 backdrop-blur-sm sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/85 sm:text-[1rem]">
                Continue de onde parou
              </p>

              <h2 className="mt-2 break-words text-2xl font-extrabold leading-tight sm:text-[2rem]">
                {continueAvailable
                  ? continueSection.content
                  : "Nenhuma atividade iniciada"}
              </h2>

              <p className="mt-1 text-base text-white/85 sm:text-[1.1rem]">
                {continueAvailable
                  ? `${continueSection.level} • Fase ${continueSection.phase}`
                  : "Comece uma nova atividade"}
              </p>
            </div>

            <button
              className="inline-flex w-full items-center justify-center rounded-[1.2rem] bg-white px-6 py-3 text-base font-bold text-[#3b82d0] shadow-md transition hover:scale-[1.02] sm:w-auto sm:px-7 sm:py-4 sm:text-[1.05rem]"
              onClick={() => {
                if (continueAvailable) {
                  navigate(
                    `/atividades/${continueSection.content_slug}/${continueSection.level_code}/fase/${continueSection.phase}`
                  )
                  return
                }

                navigate("/atividades")
              }}
            >
              {continueAvailable ? "Continuar" : "Começar"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.8rem] border border-[#f1e3a3] bg-[#fff9e8] px-5 py-5 shadow-sm sm:px-7 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1b8] text-[#e3ad15]">
              <Star className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base text-slate-400 sm:text-[1.05rem]">Pontos</p>
              <p className="text-[1.8rem] font-bold text-slate-800 sm:text-[2rem]">
                {totalPoints}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-[#cfe9d8] bg-[#eefaf2] px-5 py-5 shadow-sm sm:px-7 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff4e8] text-[#22b36b]">
              <Target className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base text-slate-400 sm:text-[1.05rem]">Taxa geral</p>
              <p className="text-[1.8rem] font-bold text-slate-800 sm:text-[2rem]">
                {totalAccuracy}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-[#e7d8fb] bg-[#f7efff] px-5 py-5 shadow-sm sm:px-7 sm:py-6 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eedfff] text-[#9b5cf6]">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base text-slate-400 sm:text-[1.05rem]">Atividades</p>
              <p className="text-[1.8rem] font-bold text-slate-800 sm:text-[2rem]">
                {totalActivities}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[2rem] bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-8">
        <h3 className="text-[1.1rem] font-bold text-slate-800 sm:text-[1.15rem]">
          Progresso por conteúdo
        </h3>
        <p className="mt-1 text-[0.98rem] text-slate-400 sm:text-[1rem]">
          Veja sua evolução geral em cada conteúdo
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {contentOrder.map((content) => (
            <button
              key={content}
              onClick={() => setSelectedContent(content)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition sm:text-[1rem] ${
                selectedContent === content
                  ? "bg-[#3f86d1] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {content}
            </button>
          ))}
        </div>

        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between gap-4 text-sm font-medium text-slate-500 sm:text-[1rem]">
            <span className="inline-flex min-w-0 items-center gap-2">
              <BookOpen className="h-5 w-5 shrink-0 text-[#79c6a1]" />
              <span className="truncate">Fases concluídas</span>
            </span>
            <span>{selected.progress}%</span>
          </div>

          <div className="h-4 w-full rounded-full bg-slate-100">
            <div
              className="h-4 rounded-full bg-[#79c6a1] transition-all duration-500"
              style={{ width: `${selected.progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-[1.2rem] font-bold text-slate-800 sm:text-[1.35rem]">
          Acesso rápido
        </h3>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => navigate("/atividades")}
            className="flex min-h-[110px] flex-col items-center justify-center rounded-[2rem] bg-[#eef4ff] px-6 py-7 text-center shadow-sm transition hover:scale-[1.01] sm:min-h-[130px] sm:py-8"
          >
            <div className="mb-4 text-[#3f86d1]">
              <BookOpen className="h-9 w-9" />
            </div>
            <h3 className="text-[1.05rem] font-bold text-slate-800 sm:text-[1.1rem]">
              Atividades
            </h3>
          </button>

          <button
            onClick={() => navigate("/progresso")}
            className="flex min-h-[110px] flex-col items-center justify-center rounded-[2rem] bg-[#eefaf2] px-6 py-7 text-center shadow-sm transition hover:scale-[1.01] sm:min-h-[130px] sm:py-8"
          >
            <div className="mb-4 text-[#22b36b]">
              <BarChart3 className="h-9 w-9" />
            </div>
            <h3 className="text-[1.05rem] font-bold text-slate-800 sm:text-[1.1rem]">
              Progresso
            </h3>
          </button>

          <button
            onClick={() => navigate("/avatar")}
            className="flex min-h-[110px] flex-col items-center justify-center rounded-[2rem] bg-[#f7efff] px-6 py-7 text-center shadow-sm transition hover:scale-[1.01] sm:min-h-[130px] sm:py-8 sm:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 text-[#9b5cf6]">
              <Sparkles className="h-9 w-9" />
            </div>
            <h3 className="text-[1.05rem] font-bold text-slate-800 sm:text-[1.1rem]">
              Avatar
            </h3>
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[1.6rem] bg-white px-4 py-6 shadow-sm sm:rounded-[2rem] sm:px-6 sm:py-7 lg:px-7 lg:py-8">
        <h3 className="text-[1.05rem] font-bold text-slate-800 sm:text-[1.15rem] lg:text-[1.2rem]">
          Atividades recentes
        </h3>

        {recentActivities.length > 0 ? (
          <div className="mt-6 space-y-4">
            {recentActivities.slice(0, 3).map((activity, index) => (
              <div
                key={`${activity.title}-${index}`}
                className="flex flex-col gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-4 sm:rounded-[1.4rem] sm:px-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[1rem] font-bold leading-snug text-slate-800 sm:text-[1.05rem] lg:text-[1.1rem]">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-[0.94rem] text-slate-400 sm:text-[1rem]">
                    {activity.detail}
                  </p>

                  <p className="mt-1 text-[0.85rem] text-slate-400 sm:text-[0.92rem]">
                    Realizada em {formatDateTime(activity.finished_at)}
                  </p>
                </div>

                <span className="shrink-0 text-[1.05rem] font-bold text-[#79c6a1] sm:text-[1.15rem] lg:text-[1.2rem]">
                  {activity.points}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[160px] items-center justify-center px-4 text-center sm:min-h-[180px]">
            <p className="text-[1rem] text-slate-400 sm:text-[1.1rem]">
              Nenhuma atividade recente encontrada.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default DashboardPage