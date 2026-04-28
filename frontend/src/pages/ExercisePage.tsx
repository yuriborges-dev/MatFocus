import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import SuccessModal from "../components/SuccessModal"
import FeedbackModal from "../components/FeedbackModal"
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

type StartSessionResponse = {
  session_id: number
  student_id: number
  phase_id: number
  correct_answers: number
  wrong_answers: number
  is_finished: boolean
  started_at: string
  finished_at: string | null
  total_paused_seconds?: number
  paused_at?: string | null
  answered_correctly_question_ids?: number[]
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
  const [persistedPausedSeconds, setPersistedPausedSeconds] = useState(0)
  const [sessionFinished, setSessionFinished] = useState(false)

  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "tip" as "tip" | "error" | "warning",
    title: "",
    message: "",
    description: "",
  })
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  function openFeedbackModal(
    type: "tip" | "error" | "warning",
    title: string,
    message: string,
    description = ""
  ) {
    setFeedbackModal({
      isOpen: true,
      type,
      title,
      message,
      description,
    })
  }

  const sessionIdRef = useRef<number | null>(null)
  const phaseIdRef = useRef<number | null>(null)
  const sessionFinishedRef = useRef(false)

  const { student } = useAuth()

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  useEffect(() => {
    phaseIdRef.current = phaseData?.id ?? null
  }, [phaseData])

  useEffect(() => {
    sessionFinishedRef.current = sessionFinished
  }, [sessionFinished])

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

        const sessionResponse = await api.post<StartSessionResponse>(
          `/progress/phases/${currentPhase.id}/start-session/`,
          {}
        )

        const sessionData = sessionResponse.data

        setSessionId(sessionData.session_id)
        setSessionStartedAt(sessionData.started_at)
        setPersistedPausedSeconds(sessionData.total_paused_seconds || 0)
        setTotalPausedSeconds(0)
        setPauseStartedAt(null)
        setCorrectAnswers(sessionData.correct_answers)
        setWrongAnswers(sessionData.wrong_answers)
        setSessionFinished(false)

        const questionsResponse = await api.get<Question[]>(
          `/activities/questions/?phase_id=${currentPhase.id}`
        )

        const fetchedQuestions = questionsResponse.data
        setQuestions(fetchedQuestions)

        const answeredCorrectlyIds = sessionData.answered_correctly_question_ids || []

        const nextQuestionIndex = fetchedQuestions.findIndex(
          (question) => !answeredCorrectlyIds.includes(question.id)
        )

        setQuestionIndex(nextQuestionIndex === -1 ? 0 : nextQuestionIndex)
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

      const elapsed =
        Math.floor((now - start) / 1000) -
        persistedPausedSeconds -
        totalPausedSeconds

      setElapsedSeconds(Math.max(0, elapsed))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [sessionStartedAt, persistedPausedSeconds, totalPausedSeconds, isPaused])

  useEffect(() => {
    return () => {
      const currentSessionId = sessionIdRef.current
      const currentPhaseId = phaseIdRef.current
      const finished = sessionFinishedRef.current
      const token = localStorage.getItem("matfocus_access")

      if (!currentSessionId || !currentPhaseId || finished || !token) return

      fetch(`http://127.0.0.1:8000/api/progress/phases/${currentPhaseId}/pause-session/`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: currentSessionId,
        }),
      }).catch(() => {})
    }
  }, [])

  const currentQuestion = useMemo(
    () => questions[questionIndex],
    [questions, questionIndex]
  )

  const totalQuestions = questions.length
  const progressPercent =
    totalQuestions > 0 ? ((questionIndex + 1) / totalQuestions) * 100 : 0

  const handlePause = async () => {
    if (!sessionId || !phaseData) return

    try {
      await api.post(`/progress/phases/${phaseData.id}/pause-session/`, {
        session_id: sessionId,
      })

      setPauseStartedAt(Date.now())
      setIsPaused(true)
    } catch (error) {
      console.error("Erro ao pausar sessão:", error)
    }
  }

  const handleResume = async () => {
    if (!sessionId || !phaseData) return

    try {
      const response = await api.post(
        `/progress/phases/${phaseData.id}/resume-session/`,
        {
          session_id: sessionId,
        }
      )

      setPersistedPausedSeconds(response.data.total_paused_seconds || 0)
      setPauseStartedAt(null)
      setIsPaused(false)
    } catch (error) {
      console.error("Erro ao retomar sessão:", error)
    }
  }

  const handleExitSession = async () => {
    if (sessionId && phaseData) {
      try {
        await api.post(`/progress/phases/${phaseData.id}/pause-session/`, {
          session_id: sessionId,
        })
      } catch (error) {
        console.error("Erro ao pausar sessão ao sair:", error)
      }
    }

    navigate(`/atividades/${conteudo}/${nivel}`)
  }

  const handleShowTip = () => {
    if (!currentQuestion?.tip) return

    openFeedbackModal(
      "tip",
      "Dica",
      currentQuestion.tip,
      "Use essa dica para pensar com calma."
    )
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      openFeedbackModal(
        "warning",
        "Atenção",
        "Digite uma resposta antes de enviar.",
        "Depois clique em enviar."
      )
      return
    }

    if (!currentQuestion || !phaseData) return

    if (!sessionId) {
      openFeedbackModal(
        "error",
        "Ops!",
        "Sessão da atividade não iniciada.",
        "Volte e tente iniciar a fase novamente."
      )
      return
    }

    if (!student?.id) {
      openFeedbackModal(
        "error",
        "Ops!",
        "Aluno não autenticado.",
        "Entre novamente na sua conta."
      )
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

        setFeedbackModal((prev) => ({
          ...prev,
          isOpen: false,
        }))

        setScore(data.score)
        setCorrectAnswers(data.correct_answers)

        if (data.session_finished) {
          setSessionFinished(true)
        }

        return
      }

      const randomErrorMessage =
        errorMessages[Math.floor(Math.random() * errorMessages.length)]

      openFeedbackModal(
        "error",
        randomErrorMessage,
        "Leia a questão com calma e tente novamente."
      )

      setWrongAnswers(data.wrong_answers)
    } catch (error) {
      console.error("Erro ao enviar resposta:", error)

      openFeedbackModal(
        "error",
        "Ops!",
        "Erro ao validar resposta.",
        "Tente novamente em alguns instantes."
      )
    }
  }

  const handleNextQuestion = () => {
    setShowSuccessModal(false)

    setFeedbackModal((prev) => ({
      ...prev,
      isOpen: false,
    }))

    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex((prev) => prev + 1)
      setAnswer("")
      return
    }

    if (!phaseData || !sessionId) return

    navigate(
      `/atividades/${conteudo}/${nivel}/fase/${phaseData.id}/resultado?session_id=${sessionId}`
    )
  }

  return (
    <AppLayout>
      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onContinue={handleNextQuestion}
      />

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        description={feedbackModal.description}
        onClose={() =>
          setFeedbackModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
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
        </div>
      )}
    </AppLayout>
  )
}

export default ExercisePage