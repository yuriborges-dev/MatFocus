import { useEffect, useMemo, useState } from "react"
import { Award, BookOpen, CheckCircle2, Lock, Medal, Star, Trophy } from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import {
  getDashboardSummary,
  getLevelProgress,
  type DashboardSummaryResponse,
  type LevelProgressItem,
} from "../services/progress"
import { getStudentLevel } from "../utils/studentLevel"
import { useAuth } from "../contexts/AuthContext"

type Achievement = {
  title: string
  description: string
  unlocked: boolean
  icon: React.ReactNode
}

const contents = [
  { slug: "adicao", name: "Adição" },
  { slug: "subtracao", name: "Subtração" },
  { slug: "multiplicacao", name: "Multiplicação" },
  { slug: "divisao", name: "Divisão" },
  { slug: "problemas", name: "Problemas" },
]

const activityGoals = [
  1, 5, 10, 15, 20, 30, 40, 50, 75, 100, 125, 150, 175, 200, 250, 300, 350,
  400,
]

const pointGoals = [
  50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000, 7500,
  10000, 15000, 17500, 
]

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <div
      className={`rounded-[1.6rem] border px-5 py-5 shadow-sm transition ${
        achievement.unlocked
          ? "border-[#cfe9d8] bg-[#eefaf2]"
          : "border-slate-200 bg-white opacity-70"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            achievement.unlocked
              ? "bg-[#dff4e8] text-[#22b36b]"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6" />}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {achievement.title}
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {achievement.description}
          </p>

          <p
            className={`mt-3 text-sm font-bold ${
              achievement.unlocked ? "text-[#22b36b]" : "text-slate-400"
            }`}
          >
            {achievement.unlocked ? "Conquista desbloqueada" : "Bloqueada"}
          </p>
        </div>
      </div>
    </div>
  )
}

function AchievementsPage() {
  const { student } = useAuth()

  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(
    null
  )
  const [levelsByContent, setLevelsByContent] = useState<
    Record<string, LevelProgressItem[]>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!student?.id) return

    async function loadAchievementsData() {
      try {
        setLoading(true)
        setError("")

        const dashboardData = await getDashboardSummary()

        const levelResults = await Promise.all(
          contents.map(async (content) => {
            const levels = await getLevelProgress(content.slug)

            return {
              slug: content.slug,
              levels,
            }
          })
        )

        const mappedLevels = levelResults.reduce<
          Record<string, LevelProgressItem[]>
        >((acc, item) => {
          acc[item.slug] = item.levels
          return acc
        }, {})

        setDashboard(dashboardData)
        setLevelsByContent(mappedLevels)
      } catch (err) {
        console.error("Erro ao carregar conquistas:", err)
        setError("Não foi possível carregar as conquistas.")
      } finally {
        setLoading(false)
      }
    }

    loadAchievementsData()
  }, [student?.id])

  const totalPoints = dashboard?.points ?? 0
  const totalActivities = dashboard?.activities ?? 0
  const contentProgress = dashboard?.content_progress ?? []
  const studentLevel = getStudentLevel(totalPoints)

  const achievements = useMemo<Achievement[]>(() => {
    const activityAchievements: Achievement[] = activityGoals.map((goal) => ({
      title:
        goal === 1
          ? "Primeira atividade concluída"
          : `${goal} atividades concluídas`,
      description:
        goal === 1
          ? "Conclua sua primeira atividade no MatFocus."
          : `Conclua ${goal} atividades no total.`,
      unlocked: totalActivities >= goal,
      icon: <CheckCircle2 className="h-6 w-6" />,
    }))

    const pointAchievements: Achievement[] = pointGoals.map((goal) => ({
      title: `${goal} pontos`,
      description: `Alcance ${goal} pontos acumulados.`,
      unlocked: totalPoints >= goal,
      icon: <Star className="h-6 w-6" />,
    }))

    const levelAchievements: Achievement[] = contents.flatMap((content) => {
      const levels = levelsByContent[content.slug] ?? []

      return [1, 2, 3, 4].map((levelNumber) => {
        const level = levels.find(
          (item) => item.difficulty_order === levelNumber
        )

        return {
          title: `Concluiu o nível ${levelNumber} de ${content.name}`,
          description: `Complete todas as fases do nível ${levelNumber} em ${content.name}.`,
          unlocked: Boolean(level?.completed),
          icon: <Medal className="h-6 w-6" />,
        }
      })
    })

    const contentAchievements: Achievement[] = contents.map((content) => {
      const progress = contentProgress.find(
        (item) => item.content === content.name
      )

      return {
        title: `Concluiu o conteúdo ${content.name}`,
        description: `Complete 100% das fases de ${content.name}.`,
        unlocked: (progress?.progress ?? 0) >= 100,
        icon: <Trophy className="h-6 w-6" />,
      }
    })

    const explorationAchievements: Achievement[] = contents.map((content) => {
      const progress = contentProgress.find(
        (item) => item.content === content.name
      )

      return {
        title: `Iniciou ${content.name}`,
        description: `Conclua pelo menos uma fase de ${content.name}.`,
        unlocked: (progress?.progress ?? 0) > 0,
        icon: <BookOpen className="h-6 w-6" />,
      }
    })

    return [
      ...activityAchievements,
      ...pointAchievements,
      ...explorationAchievements,
      ...levelAchievements,
      ...contentAchievements,
    ]
  }, [totalActivities, totalPoints, contentProgress, levelsByContent])

  const unlockedCount = achievements.filter((item) => item.unlocked).length

  if (loading) {
    return (
      <AppLayout>
        <div className="rounded-[2rem] bg-white px-6 py-8 text-center text-slate-500 shadow-sm">
          Carregando conquistas...
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700 shadow-sm">
          {error}
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Conquistas
          </h1>
          <p className="mt-2 text-base text-slate-400 lg:text-lg">
            Acompanhe sua evolução e desbloqueie novas conquistas estudando.
          </p>
        </header>

        <section className="overflow-hidden rounded-[2rem] bg-white shadow-md">
          <div className="h-3 bg-gradient-to-r from-[#4a8fd3] via-[#6aa8e5] to-[#79c6a1]" />

          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#fff9e8] text-[#e3ad15]">
                  <Trophy className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-400">
                    Nível matemático
                  </p>

                  <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
                    {studentLevel.title}
                  </h2>

                  <p className="mt-1 text-base font-semibold text-[#4a8fd3]">
                    Nível {studentLevel.level} • {totalPoints} pontos
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-500">
                  <span>Progresso do nível</span>
                  <span>{studentLevel.progress}%</span>
                </div>

                <div className="h-4 rounded-full bg-slate-100">
                  <div
                    className="h-4 rounded-full bg-[#4a8fd3] transition-all duration-500"
                    style={{ width: `${studentLevel.progress}%` }}
                  />
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  {studentLevel.nextMin
                    ? `Faltam ${studentLevel.nextMin - totalPoints} pontos para o próximo nível.`
                    : "Você alcançou o nível máximo disponível."}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] bg-slate-50 px-5 py-4 text-center">
                <p className="text-3xl font-extrabold text-slate-900">
                  {unlockedCount}/{achievements.length}
                </p>
                <p className="mt-1 text-sm text-slate-400">Conquistas</p>
              </div>

              <div className="rounded-[1.5rem] bg-[#fff9e8] px-5 py-4 text-center">
                <p className="text-3xl font-extrabold text-[#e3ad15]">
                  {totalPoints}
                </p>
                <p className="mt-1 text-sm text-slate-400">Pontos</p>
              </div>

              <div className="rounded-[1.5rem] bg-[#eefaf2] px-5 py-4 text-center">
                <p className="text-3xl font-extrabold text-[#22b36b]">
                  {totalActivities}
                </p>
                <p className="mt-1 text-sm text-slate-400">Atividades</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.title}
              achievement={achievement}
            />
          ))}
        </section>
      </div>
    </AppLayout>
  )
}

export default AchievementsPage