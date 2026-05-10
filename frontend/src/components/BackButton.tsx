import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  getAnimationLevel,
  getCardAnimation,
} from "../utils/animation.ts"

type BackButtonProps = {
  fallbackPath?: string
  state?: {
    from?: string
  }
}

function BackButton({ fallbackPath = "/", state }: BackButtonProps) {
  const navigate = useNavigate()
  const { student } = useAuth()

  const animationLevel = getAnimationLevel(student?.animation_level)

  function handleBack() {
    navigate(fallbackPath, { state })
  }

  return (
    <button
      type="button"
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