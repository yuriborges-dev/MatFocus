import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import SuccessModal from "../components/SuccessModal"

type Question = {
  id: number
  statement: string
  answer: number
  tip: string
}

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

const mockQuestions: Question[] = [
  {
    id: 1,
    statement: "Quanto é 5 + 9?",
    answer: 14,
    tip: "Some o 5 com mais 9, contando aos poucos se precisar.",
  },
  {
    id: 2,
    statement: "Quanto é 3 + 6?",
    answer: 9,
    tip: "Comece no 6 e avance 3 passos.",
  },
  {
    id: 3,
    statement: "Quanto é 7 + 2?",
    answer: 9,
    tip: "Pense no 7 e acrescente 2 unidades.",
  },
  {
    id: 4,
    statement: "Quanto é 4 + 8?",
    answer: 12,
    tip: "Some 4 com 8 separando em partes menores.",
  },
  {
    id: 5,
    statement: "Quanto é 10 + 5?",
    answer: 15,
    tip: "Dez mais cinco resulta em quinze.",
  },
]

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

  const contentTitle = contentTitles[conteudo || ""] || "Conteúdo"
  const levelTitle = levelLabels[nivel || ""] || "Nível"
  const phaseLabel = fase || "1"

  const [questionIndex, setQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [feedbackType, setFeedbackType] = useState<"error" | "warning" | "">("")
  const [showTip, setShowTip] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(90)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const currentQuestion = useMemo(
    () => mockQuestions[questionIndex],
    [questionIndex]
  )

  const totalQuestions = mockQuestions.length
  const progressPercent = ((questionIndex + 1) / totalQuestions) * 100

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

  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      setFeedback("Digite uma resposta antes de enviar.")
      setFeedbackType("warning")
      return
    }

    const parsedAnswer = Number(answer)

    if (parsedAnswer === currentQuestion.answer) {
      const randomMessage =
        successMessages[Math.floor(Math.random() * successMessages.length)]

      setSuccessMessage(randomMessage)
      setShowSuccessModal(true)
      setFeedback("")
      setFeedbackType("")
      setScore((prev) => prev + 10)
      return
    }

    const randomErrorMesssage =
        errorMessages[Math.floor(Math.random() * errorMessages.length)]
    setFeedback(randomErrorMesssage)
    setFeedbackType("error")
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

    setFeedback("Sessão concluída com sucesso! ✅")
    setFeedbackType("")
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
            <h2 className="text-2xl font-bold text-slate-800">Atividade pausada</h2>
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
                {contentTitle}
              </h1>
              <p className="text-[1.1rem] text-slate-400">
                {levelTitle} • Fase {phaseLabel} • Questão {questionIndex + 1} de {totalQuestions}
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
    </AppLayout>
  )
}

export default ExercisePage