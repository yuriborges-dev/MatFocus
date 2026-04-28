export type AnimationLevel = "low" | "medium" | "high"

export function getAnimationLevel(value?: string): AnimationLevel {
  if (value === "baixo" || value === "low") return "low"
  if (value === "alto" || value === "high") return "high"
  return "medium"
}

export function getPageAnimation(level: AnimationLevel) {
  const styles = {
    low: "animate-fade-in",
    medium: "animate-fade-slide",
    high: "animate-fade-slide-scale",
  }

  return styles[level]
}

export function getCardAnimation(level: AnimationLevel) {
  const styles = {
    low: "transition",
    medium: "transition duration-200 hover:-translate-y-1 hover:shadow-md",
    high: "transition duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
  }

  return styles[level]
}

export function getModalAnimation(level: AnimationLevel) {
  const styles = {
    low: "animate-fade-in",
    medium: "animate-modal-in",
    high: "animate-modal-pop",
  }

  return styles[level]
}