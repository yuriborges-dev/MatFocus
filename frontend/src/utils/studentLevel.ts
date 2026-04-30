export type StudentLevel = {
  title: string
  level: number
  currentMin: number
  nextMin: number | null
  progress: number
}

const levels = [
  { min: 0, title: "Iniciante" },
  { min: 1000, title: "Explorador Matemático" },
  { min: 3000, title: "Aprendiz dos Números" },
  { min: 6000, title: "Estrategista Matemático" },
  { min: 10000, title: "Mestre dos Números" },
]

export function getStudentLevel(points: number): StudentLevel {
  const currentIndex = levels.findIndex((level, index) => {
    const next = levels[index + 1]
    return points >= level.min && (!next || points < next.min)
  })

  const current = levels[currentIndex] || levels[0]
  const next = levels[currentIndex + 1]

  if (!next) {
    return {
      title: current.title,
      level: currentIndex + 1,
      currentMin: current.min,
      nextMin: null,
      progress: 100,
    }
  }

  const progress = Math.round(
    ((points - current.min) / (next.min - current.min)) * 100
  )

  return {
    title: current.title,
    level: currentIndex + 1,
    currentMin: current.min,
    nextMin: next.min,
    progress: Math.max(0, Math.min(progress, 100)),
  }
}