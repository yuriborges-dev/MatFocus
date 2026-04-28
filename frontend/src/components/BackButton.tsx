import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  getAnimationLevel,
  getCardAnimation,
} from "../utils/animation.ts"

type BackButtonProps = {
  fallbackPath?: string
}

function BackButton({ fallbackPath = "/" }: BackButtonProps) {
  const navigate = useNavigate()
  const { student } = useAuth()

  const animationLevel = getAnimationLevel(student?.animation_level)

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallbackPath)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-600 shadow-sm ${getCardAnimation(
        animationLevel
      )}`}
    >
      <ArrowLeft className="h-6 w-6" />
    </button>
  )
}

export default BackButton