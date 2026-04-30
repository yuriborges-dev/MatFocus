import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import { getPhaseResult } from "../services/progress"
import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel, getPageAnimation, getCardAnimation } from "../utils/animation"
import { playLevelUpSound } from "../utils/sound"

const contentTitles: Record<string, string> = {
  adicao: "Adição",
  subtracao: "Subtração",
  multiplicacao: "Multiplicação",
  divisao: "Divisão",
  problemas: "Problemas",
}

const levelLabels: Record<string, string> = {
  "nivel-1": "Nível 1",
  "nivel-2": "Nível 2",
  "nivel-3": "Nível 3",
  "nivel-4": "Nível 4",
}

const motivationalMessages = [
  "Você foi muito bem! Continue assim 🌟",
  "Excelente trabalho! Cada fase concluída é uma conquista 🚀",
  "Parabéns pelo esforço! Você está evoluindo bastante 💪",
  "Muito bom! Continue praticando para ficar ainda melhor 😄",
  "Você mandou muito bem! Vamos para o próximo desafio? 🎯",
]

type PhaseResult = {
  student_id: number
  phase_id: number
  phase_number: number
  content_slug: string
  content_title: string
  level_code: string
  level_title: string
  completed: boolean
  score: number
  points_earned: number
  correct_answers: number
  wrong_answers: number
  total_questions: number
  accuracy: number
  time_spent_seconds: number
  next_phase_id: number | null
  next_phase_number: number | null
  next_phase_unlocked: boolean
}

function formatAverageTime(seconds: number) {
  if (!seconds || seconds <= 0) {
    return "0s"
  }

  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes}min`
  }

  return `${minutes}min ${remainingSeconds}s`
}

function ActivityResultPage() {
  const navigate = useNavigate()
  const { conteudo, nivel, phaseId } = useParams()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [result, setResult] = useState<PhaseResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { student } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  useEffect(() => {
    if (!phaseId || isNaN(Number(phaseId))) {
      setError("Fase não informada.")
      setLoading(false)
      return
    }

    if (!student?.id) return

    async function loadResult() {
      try {
        setLoading(true)
        setError("")

        const data = await getPhaseResult(
          Number(phaseId),
          sessionId || undefined
        )

        setResult(data)

        if (data.completed) {
          playLevelUpSound(student?.sound_level)
        }
      } catch (err) {
        console.error("Erro ao carregar resultado da fase:", err)
        setError("Não foi possível carregar o resultado da fase.")
      } finally {
        setLoading(false)
      }
    }

    loadResult()
    }, [phaseId, sessionId, student?.id])

  const contentTitle =
    result?.content_title || contentTitles[conteudo || ""] || "Conteúdo"

  const levelTitle =
    result?.level_title || levelLabels[nivel || ""] || "Nível"

  const totalScore = result?.score ?? 0
  const earnedPoints = result?.points_earned ?? 0
  const correctAnswers = result?.correct_answers ?? 0
  const wrongAnswers = result?.wrong_answers ?? 0
  const accuracy = result?.accuracy ?? 0
  const totalTime = formatAverageTime(result?.time_spent_seconds ?? 0)

  const motivationalMessage = useMemo(() => {
    const index = (correctAnswers + wrongAnswers) % motivationalMessages.length
    return motivationalMessages[index]
  }, [correctAnswers, wrongAnswers])

  if (loading) {
    return (
      <AppLayout>
        <div className="mx-auto mt-8 w-full max-w-2xl rounded-[1.8rem] bg-white px-6 py-6 text-base font-semibold text-slate-500 shadow-sm">
          Carregando resultado da fase...
        </div>
      </AppLayout>
    )
  }

  if (error || !result) {
    return (
      <AppLayout>
        <div className="mx-auto mt-8 w-full max-w-2xl rounded-[1.8rem] border border-red-200 bg-red-50 px-6 py-6 text-base font-semibold text-red-700 shadow-sm">
          <p>{error || "Não foi possível carregar o resultado."}</p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`mt-5 rounded-[1rem] bg-[#4a8fd3] px-5 py-3 text-sm font-bold text-white transition hover:brightness-105 ${getCardAnimation(animationLevel)}`}
          >
            Voltar
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div
        className={`flex min-h-[calc(100vh-110px)] items-center justify-center py-4 ${getPageAnimation(
          animationLevel
        )}`}
      >
        <div className="w-full max-w-[760px]">
          <div className="overflow-hidden rounded-[1.8rem] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <div className="h-2 bg-gradient-to-r from-[#4a8fd3] via-[#6aa8e5] to-[#79c6a1]" />

            <div className="px-6 py-7 md:px-7 md:py-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-[#eef6ff] text-[2rem] shadow-sm">
                  🏆
                </div>

                <h1 className="text-[2.2rem] font-extrabold leading-none text-slate-900">
                  Parabéns!
                </h1>

                <p className="mt-3 text-[1rem] text-slate-400">
                  {contentTitle} • {levelTitle} • Fase {result.phase_number}
                </p>

                <p className="mt-3 max-w-xl text-[0.98rem] font-medium leading-relaxed text-slate-500">
                  {motivationalMessage}
                </p>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-2">
                <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[1.3rem] bg-slate-50 px-4 py-4 text-center shadow-sm">
                  <p className="text-[2rem] font-extrabold text-slate-900">
                    {earnedPoints}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Pontos ganhos</p>
                </div>

                <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[1.3rem] bg-slate-50 px-4 py-4 text-center shadow-sm">
                  <p className="text-[2rem] font-extrabold text-slate-900">
                    {totalScore}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Pontuação acumulada</p>
                </div>

                <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[1.3rem] bg-[#eefaf2] px-4 py-4 text-center shadow-sm">
                  <p className="text-[2rem] font-extrabold text-[#79c6a1]">
                    {correctAnswers}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Acertos</p>
                </div>

                <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[1.3rem] bg-[#fff1f1] px-4 py-4 text-center shadow-sm">
                  <p className="text-[2rem] font-extrabold text-[#ff6b6b]">
                    {wrongAnswers}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Erros</p>
                </div>

                <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[1.3rem] bg-slate-50 px-4 py-4 text-center shadow-sm">
                  <p className="text-[2rem] font-extrabold text-slate-900">
                    {accuracy}%
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Taxa de acerto</p>
                </div>

                <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[1.3rem] bg-[#f6efff] px-4 py-4 text-center shadow-sm">
                  <p className="text-[2rem] font-extrabold text-[#9b5cf6]">
                    {totalTime}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Tempo total</p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/atividades/${conteudo}/${nivel}/fase/${phaseId}`)
                  }
                  className={`rounded-[1.2rem] bg-[#4a8fd3] px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:brightness-105 ${getCardAnimation(animationLevel)}`}
                >
                  ↻ Jogar novamente
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/atividades/${conteudo}/${nivel}`)}
                  className={`rounded-[1.2rem] border border-slate-200 bg-white px-6 py-3.5 text-base font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 ${getCardAnimation(animationLevel)}`}
                >
                  🗺 Voltar ao mapa de fases
                </button>

                {result.next_phase_number && result.next_phase_unlocked && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/atividades/${conteudo}/${nivel}/fase/${result.next_phase_number}`
                      )
                    }
                    className={`rounded-[1.2rem] bg-[#79c6a1] px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:brightness-105 ${getCardAnimation(animationLevel)}`}
                  >
                    ➜ Ir para próxima fase
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default ActivityResultPage