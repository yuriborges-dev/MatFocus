import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import { getPhaseResult } from "../services/progress"

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
  correct_answers: number
  wrong_answers: number
  total_questions: number
  accuracy: number
  average_time_seconds: number
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

  const studentId = 1

  useEffect(() => {
    async function loadResult() {
      if (!phaseId) {
        setError("Fase não informada.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const data = await getPhaseResult(
          phaseId,
          studentId,
          sessionId || undefined
        )
        setResult(data)
      } catch (err) {
        console.error("Erro ao carregar resultado da fase:", err)
        setError("Não foi possível carregar o resultado da fase.")
      } finally {
        setLoading(false)
      }
    }

    loadResult()
  }, [phaseId, sessionId])

  const contentTitle =
    result?.content_title || contentTitles[conteudo || ""] || "Conteúdo"

  const levelTitle =
    result?.level_title || levelLabels[nivel || ""] || "Nível"

  const totalScore = result?.score ?? 0
  const correctAnswers = result?.correct_answers ?? 0
  const wrongAnswers = result?.wrong_answers ?? 0
  const accuracy = result?.accuracy ?? 0
  const averageTime = formatAverageTime(result?.average_time_seconds ?? 0)

  const motivationalMessage = useMemo(() => {
    const index = (correctAnswers + wrongAnswers) % motivationalMessages.length
    return motivationalMessages[index]
  }, [correctAnswers, wrongAnswers])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center pt-6">
          <div className="w-full max-w-[520px] rounded-[2.2rem] border border-[#c7efd8] bg-white p-10 text-center shadow-[0_20px_50px_rgba(121,198,161,0.18)]">
            <p className="text-lg font-semibold text-slate-700">
              Carregando resultado da fase...
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !result) {
    return (
      <AppLayout>
        <div className="flex justify-center pt-6">
          <div className="w-full max-w-[520px] rounded-[2.2rem] border border-[#ffd6d6] bg-white p-10 text-center shadow-[0_20px_50px_rgba(255,107,107,0.10)]">
            <p className="text-lg font-semibold text-red-500">
              {error || "Não foi possível carregar o resultado."}
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 rounded-[1.2rem] bg-[#4a8fd3] px-5 py-3 text-base font-bold text-white transition hover:brightness-105"
            >
              Voltar
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex justify-center pt-6">
        <div className="w-full max-w-[520px] rounded-[2.2rem] border border-[#c7efd8] bg-white shadow-[0_20px_50px_rgba(121,198,161,0.18)]">
          <div className="h-3 rounded-t-[2.2rem] bg-[#79c6a1]" />

          <div className="px-9 py-10 text-center">
            <div className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-[#eefaf2] text-[3rem] text-[#79c6a1]">
              🏆
            </div>

            <h1 className="text-[2.4rem] font-extrabold text-slate-900">
              Parabéns!
            </h1>

            <p className="mt-2 text-[1.2rem] text-slate-400">
              {contentTitle} • {levelTitle} • Fase {result.phase_number}
            </p>

            <p className="mt-4 text-[1.05rem] font-medium text-slate-500">
              {motivationalMessage}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-5">
                <p className="text-[2rem] font-extrabold text-slate-900">
                  {totalScore}
                </p>
                <p className="mt-1 text-sm text-slate-400">Pontuação total</p>
              </div>

              <div className="rounded-[1.4rem] bg-slate-50 px-4 py-5">
                <p className="text-[2rem] font-extrabold text-slate-900">
                  {accuracy}%
                </p>
                <p className="mt-1 text-sm text-slate-400">Taxa de acerto</p>
              </div>

              <div className="rounded-[1.4rem] bg-[#eefaf2] px-4 py-5">
                <p className="text-[2rem] font-extrabold text-[#79c6a1]">
                  {correctAnswers}
                </p>
                <p className="mt-1 text-sm text-slate-400">Acertos</p>
              </div>

              <div className="rounded-[1.4rem] bg-[#fff1f1] px-4 py-5">
                <p className="text-[2rem] font-extrabold text-[#ff6b6b]">
                  {wrongAnswers}
                </p>
                <p className="mt-1 text-sm text-slate-400">Erros</p>
              </div>

              <div className="col-span-2 rounded-[1.4rem] bg-[#f6efff] px-4 py-5">
                <p className="text-[2rem] font-extrabold text-[#9b5cf6]">
                  {averageTime}
                </p>
                <p className="mt-1 text-sm text-slate-400">Tempo médio</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <button
                type="button"
                onClick={() => navigate(`/atividades/${conteudo}/${nivel}/fase/${phaseId}`)}
                className="rounded-[1.3rem] bg-[#4a8fd3] px-6 py-4 text-xl font-bold text-white shadow-md transition hover:brightness-105"
              >
                ↻ Jogar novamente
              </button>

              <button
                type="button"
                onClick={() => navigate(`/atividades/${conteudo}/${nivel}`)}
                className="rounded-[1.3rem] border border-slate-200 bg-white px-6 py-4 text-xl font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                🗺 Voltar ao mapa de fases
              </button>

              {result.next_phase_id && result.next_phase_unlocked && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/atividades/${conteudo}/${nivel}/fase/${result.next_phase_id}`)
                  }
                  className="rounded-[1.3rem] bg-[#79c6a1] px-6 py-4 text-xl font-bold text-white shadow-md transition hover:brightness-105"
                >
                  ➜ Ir para próxima fase
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default ActivityResultPage