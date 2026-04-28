import { Lock, Star } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel } from "../utils/animation.ts"

type PhaseStatus = "completed" | "current" | "unlocked" | "locked"

type PhaseNodeProps = {
  number: number
  status: PhaseStatus
  score?: number
  onClick?: () => void
}

function PhaseNode({ number, status, score = 0, onClick }: PhaseNodeProps) {
  const { student } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  const isClickable =
    status === "current" || status === "unlocked" || status === "completed"

  const baseClasses =
    "relative flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-bold shadow-sm transition"

  const animationClasses = {
    low: {
      completed: "",
      current: "",
      unlocked: "",
      locked: "",
      clickable: "hover:brightness-105",
      ping: "hidden",
      star: "",
    },
    medium: {
      completed: "hover:scale-105",
      current: "hover:scale-105 animate-[pulseNode_2.4s_ease-in-out_infinite]",
      unlocked: "hover:scale-105",
      locked: "",
      clickable: "active:scale-95",
      ping: "animate-ping",
      star: "",
    },
    high: {
      completed: "hover:scale-110 active:scale-95",
      current:
        "hover:scale-110 animate-[pulseNode_1.8s_ease-in-out_infinite]",
      unlocked: "hover:scale-110 active:scale-95",
      locked: "",
      clickable: "hover:shadow-lg",
      ping: "animate-ping",
      star: "animate-[starBounce_1.4s_ease-in-out_infinite]",
    },
  }

  const statusClasses: Record<PhaseStatus, string> = {
    completed: "border-[#79c6a1] bg-[#79c6a1] text-white",
    current: "border-[#4a8fd3] bg-white text-[#4a8fd3]",
    unlocked: "border-[#b7d7f5] bg-[#eef4ff] text-[#4a8fd3]",
    locked: "border-slate-200 bg-slate-100 text-slate-400 opacity-80",
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={isClickable ? onClick : undefined}
        disabled={!isClickable}
        className={`${baseClasses} ${statusClasses[status]} ${
          animationClasses[animationLevel][status]
        } ${isClickable ? `cursor-pointer ${animationClasses[animationLevel].clickable}` : "cursor-not-allowed"}`}
      >
        {status === "locked" ? (
          <Lock className="h-7 w-7" />
        ) : status === "completed" ? (
          <span className="text-[2rem] leading-none">✓</span>
        ) : (
          number
        )}

        {status === "current" && (
          <>
            <span
              className={`absolute inset-0 rounded-full border-4 border-[#4a8fd3]/30 ${animationClasses[animationLevel].ping}`}
            />
            <span
              className={`absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#fff4cc] shadow-sm ${animationClasses[animationLevel].star}`}
            >
              <Star className="h-4 w-4 fill-[#f4c542] text-[#f4c542]" />
            </span>
          </>
        )}
      </button>

      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
        {score} pts
      </span>

      <style>
        {`
          @keyframes pulseNode {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 4px 10px rgba(74, 143, 211, 0.10);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 8px 22px rgba(74, 143, 211, 0.20);
            }
          }

          @keyframes starBounce {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-3px) rotate(8deg);
            }
          }
        `}
      </style>
    </div>
  )
}

export default PhaseNode