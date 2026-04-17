import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import SuccessModal from "../components/SuccessModal"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { ArrowLeft } from "lucide-react"

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

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function ExercisePage() {
  const navigate = useNavigate()
  const { conteudo, nivel, fase } = useParams()

  const [phaseData, setPhaseData] = useState<Phase | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null)
  const [totalPausedSeconds, setTotalPausedSeconds] = useState(0)

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

  const { student } = useAuth()

  useEffect(() => {
    if (!conteudo || !nivel || !fase) {
      setError("Dados da atividade inválidos.")
      setLoading(false)
      return
    }

    if (!student?.id) return

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

        const sessionResponse = await api.post(
          `/progress/phases/${currentPhase.id}/start-session/`,
          {}
        )

        setSessionId(sessionResponse.data.session_id)
        setSessionStartedAt(sessionResponse.data.started_at)

        const questionsResponse = await api.get(
          `/activities/questions/?phase_id=${currentPhase.id}`
        )

        setQuestions(questionsResponse.data)
      } catch (err) {
        console.error(err)
        setError("Não foi possível carregar a atividade.")
      } finally {
        setLoading(false)
      }
    }

    fetchExerciseData()
  }, [conteudo, nivel, fase, student?.id])

  useEffect(() => {
    if (!sessionStartedAt || isPaused) return

    const updateTimer = () => {
      if (!sessionStartedAt) return

      const start = new Date(sessionStartedAt).getTime()
      const now = Date.now()

      const elapsed = Math.floor((now - start) / 1000) - totalPausedSeconds
      setElapsedSeconds(Math.max(0, elapsed))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [sessionStartedAt, totalPausedSeconds, isPaused])

  const currentQuestion = useMemo(
    () => questions[questionIndex],
    [questions, questionIndex]
  )

  const totalQuestions = questions.length
  const progressPercent =
    totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0

  const handlePause = () => {
    setPauseStartedAt(Date.now())
    setIsPaused(true)
  }

  const handleResume = () => {
    if (pauseStartedAt) {
      const pausedDuration = Math.floor((Date.now() - pauseStartedAt) / 1000)
      setTotalPausedSeconds((prev) => prev + pausedDuration)
    }

    setPauseStartedAt(null)
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

    if (!sessionId) {
      setFeedback("Sessão da atividade não iniciada.")
      setFeedbackType("error")
      return
    }

    if (!student?.id) {
      setFeedback("Aluno não autenticado.")
      setFeedbackType("error")
      return
    }

    try {
      const response = await api.post(
        `/activities/questions/${currentQuestion.id}/submit-answer/`,
        {
          session_id: sessionId,
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

    if (!phaseData || !sessionId) return

    navigate(
      `/atividades/${conteudo}/${nivel}/fase/${phaseData.id}/resultado?session_id=${sessionId}`
    )
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl sm:p-8">
            <h2 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
              Atividade pausada
            </h2>
            <p className="mt-3 text-base text-slate-500 sm:text-lg">
              Você pode retomar de onde parou ou sair da sessão.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-7">
              <button
                type="button"
                onClick={handleResume}
                className="rounded-[1.3rem] bg-[#4a8fd3] px-6 py-4 text-lg font-bold text-white transition hover:brightness-105 sm:text-xl"
              >
                Retomar
              </button>

              <button
                type="button"
                onClick={handleExitSession}
                className="rounded-[1.3rem] border border-slate-300 bg-white px-6 py-4 text-lg font-bold text-slate-600 transition hover:bg-slate-50 sm:text-xl"
              >
                Sair da sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mx-auto mt-5 w-full max-w-5xl rounded-[1.8rem] bg-white px-5 py-6 text-base font-semibold text-slate-500 shadow-sm sm:mt-8 sm:px-8 sm:py-8 sm:text-lg">
          Carregando atividade...
        </div>
      )}

      {error && (
        <div className="mx-auto mt-5 w-full max-w-5xl rounded-[1.8rem] border border-red-200 bg-red-50 px-5 py-6 text-base font-semibold text-red-700 shadow-sm sm:mt-8 sm:px-8 sm:py-8 sm:text-lg">
          {error}
        </div>
      )}

      {!loading && !error && phaseData && currentQuestion && (
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate(`/atividades/${conteudo}/${nivel}`)}
                className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 sm:h-12 sm:w-12"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>

              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-[2.5rem]">
                  {phaseData.content_name}
                </h1>

                <p className="mt-2 text-sm text-slate-400 sm:mt-3 sm:text-base lg:text-[1.1rem]">
                  {phaseData.level_title} • Fase {phaseData.phase_number} •
                  Questão {questionIndex + 1} de {totalQuestions}
                </p>

                <p className="mt-3 text-base font-bold text-[#4a8fd3] sm:mt-4 sm:text-lg lg:text-[1.15rem]">
                  Tempo: {formatTimer(elapsedSeconds)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePause}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:h-12 sm:w-14 sm:text-xl"
              title="Pausar atividade"
            >
              ⏸
            </button>
          </div>

          <div className="mt-5 sm:mt-7">
            <div className="h-4 w-full rounded-full bg-slate-100">
              <div
                className="h-4 rounded-full bg-[#4a8fd3] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-[2rem] bg-white px-5 py-6 text-center shadow-sm sm:mt-8 sm:min-h-[240px] sm:px-7 sm:py-8 lg:px-10 lg:py-14">
            <h2 className="text-center text-[2.4rem] font-extrabold leading-tight text-slate-900 sm:text-[3.4rem] lg:text-[4.2rem]">
              {currentQuestion.statement}
            </h2>
          </div>

          <div className="mt-5 sm:mt-7">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite sua resposta"
              className="h-20 w-full rounded-[1.8rem] border border-slate-200 bg-white px-6 text-center text-2xl font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4a8fd3] focus:ring-4 focus:ring-blue-100 sm:h-24 sm:px-8 sm:text-3xl"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-5 md:grid-cols-[250px_1fr] lg:md:grid-cols-[290px_1fr]">
            <button
              type="button"
              onClick={handleShowTip}
              className="flex h-20 items-center justify-center gap-3 rounded-[1.5rem] border border-yellow-400 bg-white px-6 text-xl font-bold text-yellow-600 transition hover:bg-yellow-50 sm:h-24 sm:text-2xl"
            >
              <span className="text-[1.5rem] sm:text-[1.8rem]">💡</span>
              Dica
            </button>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              className="flex h-20 items-center justify-center gap-3 rounded-[1.5rem] bg-[#8fb7df] px-6 text-xl font-bold text-white transition hover:brightness-105 sm:h-24 sm:text-2xl"
            >
              <span className="text-[1.4rem] sm:text-[1.6rem]">✈</span>
              Enviar
            </button>
          </div>

          {showTip && (
            <div className="mt-5 rounded-[1.6rem] border border-yellow-200 bg-yellow-50 px-5 py-5 text-yellow-700 shadow-sm sm:mt-6 sm:px-6">
              <p className="text-xl font-bold sm:text-2xl">Dica</p>
              <p className="mt-2 text-sm leading-relaxed sm:text-base">
                {currentQuestion.tip}
              </p>
            </div>
          )}

          {feedback && (
            <div
              className={`mt-5 rounded-[1.6rem] border px-5 py-5 shadow-sm sm:mt-6 sm:px-6 ${feedbackClasses[feedbackType]}`}
            >
              <p className="text-xl font-bold sm:text-2xl">{feedback}</p>

              {feedbackType === "error" && (
                <p className="mt-2 text-sm leading-relaxed opacity-80 sm:text-base">
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