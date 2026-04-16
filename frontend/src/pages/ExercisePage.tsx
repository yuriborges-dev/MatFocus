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

    const currentStudentId = student.id

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
          {
            student_id: currentStudentId,
          }
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

    const currentStudentId = student.id

    try {
      const response = await api.post(
        `/activities/questions/${currentQuestion.id}/submit-answer/`,
        {
          student_id: currentStudentId,
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
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
            <h2 className="text-3xl font-extrabold text-slate-800">
              Atividade pausada
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Você pode retomar de onde parou ou sair da sessão.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleResume}
                className="rounded-[1.3rem] bg-[#4a8fd3] px-6 py-4 text-xl font-bold text-white transition hover:brightness-105"
              >
                Retomar
              </button>

              <button
                type="button"
                onClick={handleExitSession}
                className="rounded-[1.3rem] border border-slate-300 bg-white px-6 py-4 text-xl font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Sair da sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mx-auto mt-8 w-full max-w-5xl rounded-[1.8rem] bg-white px-8 py-8 text-lg font-semibold text-slate-500 shadow-sm">
          Carregando atividade...
        </div>
      )}

      {error && (
        <div className="mx-auto mt-8 w-full max-w-5xl rounded-[1.8rem] border border-red-200 bg-red-50 px-8 py-8 text-lg font-semibold text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && phaseData && currentQuestion && (
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => navigate(`/atividades/${conteudo}/${nivel}`)}
                className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>

              <div>
                <h1 className="text-[3rem] font-extrabold leading-none text-slate-900">
                  {phaseData.content_name}
                </h1>

                <p className="mt-3 text-[1.25rem] text-slate-400">
                  {phaseData.level_title} • Fase {phaseData.phase_number} •
                  Questão {questionIndex + 1} de {totalQuestions}
                </p>

                <p className="mt-4 text-[1.15rem] font-bold text-[#4a8fd3]">
                  Tempo: {formatTimer(elapsedSeconds)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePause}
              className="flex h-14 w-16 items-center justify-center rounded-[1.3rem] border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Pausar atividade"
            >
              ⏸
            </button>
          </div>

          <div className="mt-9">
            <div className="h-4 w-full rounded-full bg-slate-100">
              <div
                className="h-4 rounded-full bg-[#4a8fd3] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-10 rounded-[2.2rem] bg-white px-10 py-14 text-center shadow-sm">
            <h2 className="text-[3rem] font-extrabold leading-snug text-slate-900">
              {currentQuestion.statement}
            </h2>
          </div>

          <div className="mt-8">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite sua resposta"
              className="w-full rounded-[1.8rem] border border-slate-200 bg-white px-8 py-7 text-center text-[2rem] font-semibold text-slate-700 outline-none transition focus:border-[#4a8fd3] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-[290px_1fr]">
            <button
              type="button"
              onClick={handleShowTip}
              className="flex items-center justify-center gap-3 rounded-[1.5rem] border border-yellow-400 bg-white px-6 py-5 text-2xl font-bold text-yellow-600 transition hover:bg-yellow-50"
            >
              <span className="text-[1.8rem]">💡</span>
              Dica
            </button>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              className="flex items-center justify-center gap-3 rounded-[1.5rem] bg-[#8fb7df] px-6 py-5 text-2xl font-bold text-white transition hover:brightness-105"
            >
              <span className="text-[1.6rem]">✈</span>
              Enviar
            </button>
          </div>

          {showTip && (
            <div className="mt-6 rounded-[1.6rem] border border-yellow-200 bg-yellow-50 px-7 py-5 text-yellow-700 shadow-sm">
              <p className="text-xl font-bold">Dica</p>
              <p className="mt-2 text-lg leading-relaxed">
                {currentQuestion.tip}
              </p>
            </div>
          )}

          {feedback && (
            <div
              className={`mt-6 rounded-[1.6rem] border px-7 py-5 shadow-sm ${feedbackClasses[feedbackType]}`}
            >
              <p className="text-xl font-bold">{feedback}</p>

              {feedbackType === "error" && (
                <p className="mt-2 text-base opacity-80">
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