import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import SuccessModal from "../components/SuccessModal"
import { api } from "../services/api"

type Phase = {
  id: number
  phase_number: number
  is_active: boolean
  content: number
  level: number
  content_name: string
  level_code: string
  level_title: string
}

type Question = {
  id: number
  phase: number
  statement: string
  tip: string
  order: number
}

const successMessages = [
  "Parabéns! 💪",
  "Muito bem! 🌟",
  "Você acertou! 🎉",
  "Excelente trabalho! 🚀",
  "Mandou bem! 😄",
  "Boa resposta! 👏",
  "Você foi incrível! ⭐",
]

const errorMessages = [
  "Quase lá! Tente mais uma vez 💛",
  "Não foi dessa vez, mas você consegue 😊",
  "Boa tentativa! Vamos de novo?",
  "Continue tentando, você está aprendendo 🌟",
  "Vamos com calma! Tente outra vez ✨",
]

function ExercisePage() {
  const navigate = useNavigate()
  const { conteudo, nivel, fase } = useParams()

  const [phaseData, setPhaseData] = useState<Phase | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [feedbackType, setFeedbackType] = useState<"error" | "warning" | "">("")
  const [showTip, setShowTip] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setLoading(true)

        const phasesResponse = await api.get(
          `/activities/phases/?content=${conteudo}&level=${nivel}`
        )

        const phases: Phase[] = phasesResponse.data
        const currentPhase = phases.find(
          (item) => item.phase_number === Number(fase)
        )

        if (!currentPhase) {
          setError("Fase não encontrada.")
          setLoading(false)
          return
        }

        setPhaseData(currentPhase)

        const questionsResponse = await api.get(
          `/activities/questions/?phase_id=${currentPhase.id}`
        )

        setQuestions(questionsResponse.data)
      } catch {
        setError("Não foi possível carregar a atividade.")
      } finally {
        setLoading(false)
      }
    }

    fetchExerciseData()
  }, [conteudo, nivel, fase])

  const currentQuestion = useMemo(
    () => questions[questionIndex],
    [questions, questionIndex]
  )

  const totalQuestions = questions.length
  const progressPercent =
    totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
  }

  const handleExitSession = () => {
    navigate(`/atividades/${conteudo}/${nivel}`)
  }

  const handleShowTip = () => {
    setShowTip(true)
    setFeedback("")
    setFeedbackType("")
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setFeedback("Digite uma resposta antes de enviar.")
      setFeedbackType("warning")
      return
    }

    if (!currentQuestion || !phaseData) return

    try {
      const studentId = 1

      const response = await api.post(
        `/activities/questions/${currentQuestion.id}/submit-answer/`,
        {
          student_id: studentId,
          answer: answer.trim(),
        }
      )

      const data = response.data

      if (data.is_correct) {
        const randomMessage =
          successMessages[Math.floor(Math.random() * successMessages.length)]

        setSuccessMessage(randomMessage)
        setShowSuccessModal(true)
        setFeedback("")
        setFeedbackType("")

        setScore(data.score)
        setCorrectAnswers(data.correct_answers)

        return
      }

      const randomErrorMessage =
        errorMessages[Math.floor(Math.random() * errorMessages.length)]

      setFeedback(randomErrorMessage)
      setFeedbackType("error")

      setWrongAnswers(data.wrong_answers)
    } catch (error) {
      console.error("Erro ao enviar resposta:", error)

      setFeedback("Erro ao validar resposta.")
      setFeedbackType("error")
    }
  }

  const handleNextQuestion = () => {
    setShowSuccessModal(false)

    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((prev) => prev + 1)
      setAnswer("")
      setFeedback("")
      setFeedbackType("")
      setShowTip(false)
      return
    }

    if (!phaseData) return

    navigate(`/atividades/${conteudo}/${nivel}/fase/${phaseData.id}/resultado`)
  }

  const feedbackClasses = {
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
    "": "",
  }

  return (
    <AppLayout>
      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onContinue={handleNextQuestion}
      />

      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-800">
              Atividade pausada
            </h2>
            <p className="mt-2 text-slate-500">
              Você pode retomar de onde parou ou sair da sessão.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResume}
                className="rounded-2xl bg-[#4a8fd3] px-6 py-3 text-lg font-semibold text-white"
              >
                Retomar
              </button>

              <button
                type="button"
                onClick={handleExitSession}
                className="rounded-2xl border border-slate-300 px-6 py-3 text-lg font-semibold text-slate-600"
              >
                Sair da sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mx-auto mt-8 w-full max-w-4xl rounded-[1.8rem] bg-white px-7 py-8 text-slate-500 shadow-sm">
          Carregando atividade...
        </div>
      )}

      {error && (
        <div className="mx-auto mt-8 w-full max-w-4xl rounded-[1.8rem] border border-red-200 bg-red-50 px-7 py-8 text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && phaseData && currentQuestion && (
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate(`/atividades/${conteudo}/${nivel}`)}
                className="mt-1 text-2xl text-slate-600 transition hover:text-slate-800"
              >
                ←
              </button>

              <div>
                <h1 className="text-[2.3rem] font-extrabold text-slate-900">
                  {phaseData.content_name}
                </h1>
                <p className="text-[1.1rem] text-slate-400">
                  {phaseData.level_title} • Fase {phaseData.phase_number} •
                  Questão {questionIndex + 1} de {totalQuestions}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePause}
              className="flex h-10 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Pausar atividade"
            >
              ⏸
            </button>
          </div>

          <div className="mt-7">
            <div className="h-3 w-full rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-[#4a8fd3] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-7 rounded-[2rem] bg-white px-8 py-10 text-center shadow-sm">
            <h2 className="text-[2.1rem] font-bold text-slate-900">
              {currentQuestion.statement}
            </h2>
          </div>

          <div className="mt-6">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite sua resposta"
              className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-6 py-6 text-center text-xl font-semibold text-slate-700 outline-none transition focus:border-[#4a8fd3]"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[250px_1fr]">
            <button
              type="button"
              onClick={handleShowTip}
              className="rounded-[1.3rem] border border-yellow-400 bg-white px-6 py-4 text-xl font-bold text-yellow-600 transition hover:bg-yellow-50"
            >
              💡 Dica
            </button>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              className="rounded-[1.3rem] bg-[#8fb7df] px-6 py-4 text-xl font-bold text-white transition hover:brightness-105"
            >
              ✈ Enviar
            </button>
          </div>

          {showTip && (
            <div className="mt-5 rounded-[1.5rem] border border-yellow-200 bg-yellow-50 px-6 py-4 text-yellow-700 shadow-sm">
              <p className="text-lg font-semibold">Dica</p>
              <p className="mt-1 text-base">{currentQuestion.tip}</p>
            </div>
          )}

          {feedback && (
            <div
              className={`mt-5 rounded-[1.5rem] border px-6 py-4 shadow-sm ${feedbackClasses[feedbackType]}`}
            >
              <p className="text-lg font-semibold">{feedback}</p>

              {feedbackType === "error" && (
                <p className="mt-2 text-sm opacity-80">
                  Leia a questão com calma e tente novamente.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}

export default ExercisePage