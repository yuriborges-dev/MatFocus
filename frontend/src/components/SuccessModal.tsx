import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel, getModalAnimation } from "../utils/animation.ts"

type SuccessModalProps = {
  isOpen: boolean
  message: string
  onContinue: () => void
}

function SuccessModal({ isOpen, message, onContinue }: SuccessModalProps) {
  const { student } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-[3px]">
      <div
        className={`w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.18)] ${getModalAnimation(
          animationLevel
        )}`}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-100">
            <span className="text-[2.6rem] font-bold text-green-500">✓</span>
          </div>
        </div>

        <h2 className="text-[2.2rem] font-extrabold leading-tight text-slate-900">
          {message}
        </h2>

        <p className="mt-3 text-lg text-slate-400">
          Vamos seguir para a próxima etapa.
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 inline-flex items-center justify-center rounded-[1.4rem] bg-[#4a8fd3] px-10 py-4 text-xl font-bold text-white shadow-sm transition hover:brightness-105"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default SuccessModal