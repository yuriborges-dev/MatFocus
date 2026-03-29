type PhaseStatus = "completed" | "current" | "unlocked" | "locked"

type PhaseNodeProps = {
  number: number
  status: PhaseStatus
  onClick?: () => void
}

function PhaseNode({ number, status, onClick }: PhaseNodeProps) {
  const isClickable =
    status === "current" || status === "unlocked" || status === "completed"

  const baseClasses =
    "relative flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-bold shadow-sm transition"

  const statusClasses: Record<PhaseStatus, string> = {
    completed:
      "border-[#79c6a1] bg-[#79c6a1] text-white hover:scale-105",
    current:
      "border-[#4a8fd3] bg-white text-[#4a8fd3] hover:scale-105",
    unlocked:
      "border-[#b7d7f5] bg-[#eef4ff] text-[#4a8fd3] hover:scale-105",
    locked:
      "border-slate-200 bg-slate-100 text-slate-400 opacity-80",
  }

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`${baseClasses} ${statusClasses[status]} ${
        isClickable ? "cursor-pointer" : "cursor-not-allowed"
      }`}
    >
      {status === "locked" ? "🔒" : status === "completed" ? "✓" : number}

      {status === "current" && (
        <span className="absolute -right-1 -top-1 text-lg">⭐</span>
      )}
    </button>
  )
}

export default PhaseNode