import { api } from "./api"

export type Level = {
  id: number
  code: string
  title: string
  difficulty_order: number
}

export type Phase = {
  id: number
  phase_number: number
  is_active: boolean
  content: number
  level: number
  content_name: string
  level_code: string
  level_title: string
}

export type DifficultyOption = Level & {
  totalPhases: number
  hasPhases: boolean
}

export type PhaseMapItem = {
  phase_id: number
  phase_number: number
  is_active: boolean
  is_unlocked: boolean
  is_completed: boolean
  score: number
  total_questions: number
}

export type DifficultyOptionWithProgress = DifficultyOption & {
  completedPhases: number
  unlocked: boolean
  isCompleted: boolean
}

export async function getDifficultyOptions(
  contentSlug: string
): Promise<DifficultyOption[]> {
  const [levelsResponse, phasesResponse] = await Promise.all([
    api.get<Level[]>("/activities/levels/"),
    api.get<Phase[]>("/activities/phases/", {
      params: { content: contentSlug },
    }),
  ])

  const activePhases = phasesResponse.data.filter((phase) => phase.is_active)

  const totalPhasesByLevel = activePhases.reduce<Record<string, number>>(
    (acc, phase) => {
      acc[phase.level_code] = (acc[phase.level_code] || 0) + 1
      return acc
    },
    {}
  )

  return levelsResponse.data.map((level) => ({
    ...level,
    totalPhases: totalPhasesByLevel[level.code] || 0,
    hasPhases: (totalPhasesByLevel[level.code] || 0) > 0,
  }))
}

export async function getDifficultyOptionsWithProgress(
  contentSlug: string,
  studentId: number
): Promise<DifficultyOptionWithProgress[]> {
  const baseLevels = await getDifficultyOptions(contentSlug)

  const levelsWithProgress = await Promise.all(
    baseLevels.map(async (level) => {
      if (!level.hasPhases) {
        return {
          ...level,
          completedPhases: 0,
          unlocked: false,
          isCompleted: false,
        }
      }

      try {
        const response = await api.get<PhaseMapItem[]>("/progress/phase-map/", {
          params: {
            student_id: studentId,
            content: contentSlug,
            level: level.code,
          },
        })

        const phases = response.data
        const completedPhases = phases.filter((phase) => phase.is_completed).length
        const isCompleted =
          phases.length > 0 && completedPhases === phases.length

        return {
          ...level,
          completedPhases,
          unlocked: false,
          isCompleted,
        }
      } catch {
        return {
          ...level,
          completedPhases: 0,
          unlocked: false,
          isCompleted: false,
        }
      }
    })
  )

  return levelsWithProgress.map((level, index, array) => {
    if (!level.hasPhases) {
      return {
        ...level,
        unlocked: false,
      }
    }

    if (index === 0) {
      return {
        ...level,
        unlocked: true,
      }
    }

    const previousLevel = array[index - 1]

    return {
      ...level,
      unlocked: previousLevel.isCompleted,
    }
  })
}