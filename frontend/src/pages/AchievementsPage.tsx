import { useEffect, useMemo, useRef, useState } from "react"
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
import { getAnimationLevel, getPageAnimation, getCardAnimation } from "../utils/animation"
import { playLevelUpSound, playUnlockSound } from "../utils/sound"

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

function AchievementCard({
  achievement,
  animationLevel,
}: {
  achievement: Achievement
  animationLevel: ReturnType<typeof getAnimationLevel>
}) {
  return (
    <div
        className={`group rounded-[1.8rem] border px-5 py-5 shadow-sm transition ${
        achievement.unlocked
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white opacity-75"
        } ${getCardAnimation(animationLevel)}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
            achievement.unlocked
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {achievement.unlocked ? achievement.icon : <Lock className="h-6 w-6" />}
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-extrabold leading-snug text-slate-800">
            {achievement.title}
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            {achievement.description}
          </p>

          <p
            className={`mt-3 text-sm font-bold ${
              achievement.unlocked ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {achievement.unlocked ? "Desbloqueada" : "Bloqueada"}
          </p>
        </div>
      </div>
    </div>
  )
}

function AchievementsPage() {
  const { student } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  const previousStudentLevelRef = useRef<number | null>(null)

  const [dashboard, setDashboard] = useState<DashboardSummaryResponse | null>(
    null
  )
  const [levelsByContent, setLevelsByContent] = useState<
    Record<string, LevelProgressItem[]>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [achievementFilter, setAchievementFilter] = useState<
    "all" | "unlocked" | "locked"
  >("all")

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

        const mappedLevels = levelResults.reduce<Record<string, LevelProgressItem[]>>(
          (acc, item) => {
            acc[item.slug] = item.levels
            return acc
          },
          {}
        )

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

  useEffect(() => {
    if (loading || !dashboard) return

    const previousLevel = previousStudentLevelRef.current
    const currentLevel = studentLevel.level

    if (previousLevel !== null && currentLevel > previousLevel) {
      playLevelUpSound(student?.sound_level)
    }

    previousStudentLevelRef.current = currentLevel
  }, [dashboard, loading, studentLevel.level, student?.sound_level])

  const achievements = useMemo<Achievement[]>(() => {
    const activityAchievements: Achievement[] = activityGoals.map((goal) => ({
      title:
        goal === 1
          ? "Primeira atividade"
          : `${goal} atividades`,
      description:
        goal === 1
          ? "Conclua sua primeira atividade."
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

    const explorationAchievements: Achievement[] = contents.map((content) => {
      const progress = contentProgress.find((item) => item.content === content.name)

      return {
        title: `Iniciou ${content.name}`,
        description: `Conclua pelo menos uma fase.`,
        unlocked: (progress?.progress ?? 0) > 0,
        icon: <BookOpen className="h-6 w-6" />,
      }
    })

    const levelAchievements: Achievement[] = contents.flatMap((content) => {
      const levels = levelsByContent[content.slug] ?? []

      return [1, 2, 3, 4].map((levelNumber) => {
        const level = levels.find(
          (item) => item.difficulty_order === levelNumber
        )

        return {
          title: `Nível ${levelNumber} de ${content.name}`,
          description: `Complete todas as fases desse nível.`,
          unlocked: Boolean(level?.completed),
          icon: <Medal className="h-6 w-6" />,
        }
      })
    })

    const contentAchievements: Achievement[] = contents.map((content) => {
      const progress = contentProgress.find((item) => item.content === content.name)

      return {
        title: `${content.name} completo`,
        description: `Complete 100% das fases desse conteúdo.`,
        unlocked: (progress?.progress ?? 0) >= 100,
        icon: <Trophy className="h-6 w-6" />,
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

  const filteredAchievements = achievements.filter((achievement) => {
    if (achievementFilter === "unlocked") return achievement.unlocked
    if (achievementFilter === "locked") return !achievement.unlocked
    return true
  })

  const achievementPercent =
    achievements.length > 0
      ? Math.round((unlockedCount / achievements.length) * 100)
      : 0

  function handleAchievementFilterChange(
    value: "all" | "unlocked" | "locked"
  ) {
    setAchievementFilter(value)

    if (value === "unlocked" && unlockedCount > 0) {
      playUnlockSound(student?.sound_level)
    }
  }

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
      <div className={`${getPageAnimation(animationLevel)} mx-auto max-w-6xl`}>
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Conquistas
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-400 lg:text-lg">
            Veja seus avanços e desbloqueie novos marcos.
          </p>
        </header>

        <section className={`${getCardAnimation(animationLevel)} relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-blue-100 via-sky-100 to-emerald-100 px-6 py-7 shadow-md sm:px-8`}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
                  <Trophy className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                    Nível matemático
                  </p>

                  <h2 className="mt-1 text-3xl font-black text-slate-900 sm:text-4xl">
                    {studentLevel.title}
                  </h2>

                  <p className="mt-1 text-base font-bold text-blue-600">
                    Nível {studentLevel.level} • {totalPoints} pontos
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-white/75 px-5 py-4 shadow-sm backdrop-blur-sm">
                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-500">
                  <span>Progresso do nível</span>
                  <span>{studentLevel.progress}%</span>
                </div>

                <div className="h-4 rounded-full bg-slate-100">
                  <div
                    className="h-4 rounded-full bg-blue-500 transition-all duration-500"
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
              <div className="rounded-[1.5rem] bg-white/80 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Award className="h-6 w-6" />
                </div>
                <p className="text-3xl font-black text-slate-900">
                  {unlockedCount}/{achievements.length}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Conquistas
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-white/80 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
                  <Star className="h-6 w-6" />
                </div>
                <p className="text-3xl font-black text-slate-900">
                  {totalPoints}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Pontos
                </p>
              </div>

              <div className="rounded-[1.5rem] bg-white/80 px-5 py-4 text-center shadow-sm backdrop-blur-sm">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-3xl font-black text-slate-900">
                  {totalActivities}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-400">
                  Atividades
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white px-5 py-5 shadow-sm sm:px-7 sm:py-6">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-800">
                        Todas as conquistas
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        {achievementPercent}% desbloqueadas
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                {[
                    { label: "Geral", value: "all" },
                    { label: "Concluídas", value: "unlocked" },
                    { label: "Não concluídas", value: "locked" },
                ].map((filter) => (
                    <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                        handleAchievementFilterChange(
                        filter.value as "all" | "unlocked" | "locked"
                        )
                    }
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                        achievementFilter === filter.value
                            ? "bg-blue-500 text-white shadow-sm"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    } ${getCardAnimation(animationLevel)}`}
                    >
                    {filter.label}
                    </button>
                ))}
                </div>
            </div>

            <div className="h-3 rounded-full bg-slate-100">
                <div
                className="h-3 rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${achievementPercent}%` }}
                />
            </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAchievements.map((achievement) => (
                <AchievementCard
                    key={achievement.title}
                    achievement={achievement}
                    animationLevel={animationLevel}
                />
            ))}
        </section>
      </div>
    </AppLayout>
  )
}

export default AchievementsPage