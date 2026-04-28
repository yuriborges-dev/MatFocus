import { AlertCircle, Lightbulb } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel, getModalAnimation } from "../utils/animation.ts"

type FeedbackType = "tip" | "error" | "warning"

type FeedbackModalProps = {
  isOpen: boolean
  type: FeedbackType
  title: string
  message: string
  description?: string
  onClose: () => void
}

function FeedbackModal({
  isOpen,
  type,
  title,
  message,
  description,
  onClose,
}: FeedbackModalProps) {
  const { student } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  if (!isOpen) return null

  const styles = {
    tip: {
      bg: "bg-yellow-50",
      ring: "ring-yellow-100",
      text: "text-yellow-500",
      button: "bg-yellow-400 hover:brightness-105",
      icon: <Lightbulb className="h-12 w-12" />,
    },
    error: {
      bg: "bg-red-50",
      ring: "ring-red-100",
      text: "text-red-500",
      button: "bg-red-500 hover:brightness-105",
      icon: <AlertCircle className="h-12 w-12" />,
    },
    warning: {
      bg: "bg-sky-50",
      ring: "ring-sky-100",
      text: "text-sky-500",
      button: "bg-[#4a8fd3] hover:brightness-105",
      icon: <AlertCircle className="h-12 w-12" />,
    },
  }

  const current = styles[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-[3px]">
      <div
        className={`w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.18)] ${getModalAnimation(
          animationLevel
        )}`}
      >
        <div className="mb-6 flex justify-center">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full ${current.bg} ${current.text} ring-4 ${current.ring}`}
          >
            {current.icon}
          </div>
        </div>

        <h2 className="text-[2rem] font-extrabold leading-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-3 text-lg font-medium text-slate-600">{message}</p>

        {description && (
          <p className="mt-2 text-base text-slate-400">{description}</p>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`mt-8 inline-flex items-center justify-center rounded-[1.4rem] px-10 py-4 text-xl font-bold text-white shadow-sm transition ${current.button}`}
        >
          Entendi
        </button>
      </div>
    </div>
  )
}

export default FeedbackModal