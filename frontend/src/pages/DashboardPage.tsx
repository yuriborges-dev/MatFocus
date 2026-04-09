import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  BookOpen,
  BarChart3,
  Sparkles,
  Star,
  Trophy,
  Target,
} from "lucide-react"
import AppLayout from "../layouts/AppLayout"
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

  const [selectedContent, setSelectedContent] = useState<ContentKey>("Adição")
  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const studentId = 1

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError("")

        const data = await getDashboardSummary(studentId)
        setDashboard(data)
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err)
        setError("Não foi possível carregar a dashboard.")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

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

  const studentName = dashboard?.student_name || "Yuri"
  const totalPoints = dashboard?.points ?? 0
  const totalAccuracy = dashboard?.accuracy ?? 0
  const totalActivities = dashboard?.activities ?? 0
  const recentActivities = dashboard?.recent_activities ?? []
  const continueSection = dashboard?.continue_section

  const continueAvailable =
    continueSection?.content_slug &&
    continueSection?.level_code &&
    continueSection?.phase

  if (loading) {
    return (
      <AppLayout>
        <div className="rounded-[2rem] bg-white px-7 py-10 text-center text-slate-500 shadow-sm">
          Carregando dashboard...
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="rounded-[2rem] border border-red-200 bg-red-50 px-7 py-10 text-center text-red-700 shadow-sm">
          {error}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[2.7rem] font-extrabold text-slate-900">
            Boa tarde, {studentName}! 👋
          </h1>
          <p className="mt-1 text-[1.1rem] text-slate-400">
            Você já avançou bastante hoje. Continue assim!
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#4a8fd3] to-[#68b1eb] px-8 py-7 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-center justify-between gap-6 rounded-[1.8rem] bg-white/10 px-6 py-5 backdrop-blur-sm">
            <div>
              <p className="text-[1rem] font-medium text-white/85">
                Continue de onde parou
              </p>

              <h2 className="mt-2 text-[2rem] font-extrabold leading-tight">
                {continueAvailable ? continueSection.content : "Nenhuma atividade iniciada"}
              </h2>

              <p className="mt-1 text-[1.1rem] text-white/85">
                {continueAvailable
                  ? `${continueSection.level} • Fase ${continueSection.phase}`
                  : "Comece uma nova atividade"}
              </p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-[1.2rem] bg-white px-7 py-4 text-[1.05rem] font-bold text-[#3b82d0] shadow-md transition hover:scale-[1.02]"
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

      <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.8rem] border border-[#f1e3a3] bg-[#fff9e8] px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff1b8] text-[#e3ad15]">
              <Star className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[1.05rem] text-slate-400">Pontos</p>
              <p className="text-[2rem] font-bold text-slate-800">{totalPoints}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-[#cfe9d8] bg-[#eefaf2] px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff4e8] text-[#22b36b]">
              <Target className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[1.05rem] text-slate-400">Taxa geral</p>
              <p className="text-[2rem] font-bold text-slate-800">{totalAccuracy}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-[#e7d8fb] bg-[#f7efff] px-7 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eedfff] text-[#9b5cf6]">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[1.05rem] text-slate-400">Atividades</p>
              <p className="text-[2rem] font-bold text-slate-800">{totalActivities}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
        <h3 className="text-[1.15rem] font-bold text-slate-800">
          Progresso por conteúdo
        </h3>
        <p className="mt-1 text-[1rem] text-slate-400">
          Veja sua evolução geral em cada conteúdo
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {contentOrder.map((content) => (
            <button
              key={content}
              onClick={() => setSelectedContent(content)}
              className={`rounded-xl px-4 py-2 text-[1rem] font-semibold transition ${
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
          <div className="mb-2 flex items-center justify-between text-[1rem] font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#79c6a1]" />
              Fases concluídas
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

      <div className="mt-7">
        <h3 className="text-[1.35rem] font-bold text-slate-800">Acesso rápido</h3>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          <button
            onClick={() => navigate("/atividades")}
            className="flex min-h-[130px] flex-col items-center justify-center rounded-[2rem] bg-[#eef4ff] px-6 py-8 text-center shadow-sm transition hover:scale-[1.01]"
          >
            <div className="mb-4 text-[#3f86d1]">
              <BookOpen className="h-9 w-9" />
            </div>
            <h3 className="text-[1.1rem] font-bold text-slate-800">Atividades</h3>
          </button>

          <button
            onClick={() => navigate("/progresso")}
            className="flex min-h-[130px] flex-col items-center justify-center rounded-[2rem] bg-[#eefaf2] px-6 py-8 text-center shadow-sm transition hover:scale-[1.01]"
          >
            <div className="mb-4 text-[#22b36b]">
              <BarChart3 className="h-9 w-9" />
            </div>
            <h3 className="text-[1.1rem] font-bold text-slate-800">Progresso</h3>
          </button>

          <button
            onClick={() => navigate("/avatar")}
            className="flex min-h-[130px] flex-col items-center justify-center rounded-[2rem] bg-[#f7efff] px-6 py-8 text-center shadow-sm transition hover:scale-[1.01]"
          >
            <div className="mb-4 text-[#9b5cf6]">
              <Sparkles className="h-9 w-9" />
            </div>
            <h3 className="text-[1.1rem] font-bold text-slate-800">Avatar</h3>
          </button>
        </div>
      </div>

      <div className="mt-7 rounded-[2rem] bg-white px-7 py-8 shadow-sm">
        <h3 className="text-[1.2rem] font-bold text-slate-800">
          Atividades recentes
        </h3>

        <div className="mt-5 space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.slice(0, 3).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-[1.2rem] bg-slate-50 px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-800">{activity.title}</p>
                  <p className="text-[0.95rem] text-slate-400">{activity.detail}</p>
                </div>

                <span className="font-bold text-[#3f86d1]">{activity.points}</span>
              </div>
            ))
          ) : (
            <div className="rounded-[1.2rem] bg-slate-50 px-5 py-8 text-center text-slate-400">
              Nenhuma atividade recente encontrada.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default DashboardPage