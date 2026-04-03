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

export type LevelProgressSummaryItem = {
  level_id: number
  level_code: string
  level_title: string
  difficulty_order: number
  total_phases: number
  completed_phases: number
  total_score: number
  unlocked: boolean
  completed: boolean
}

export type DifficultyOptionWithProgress = {
  id: number
  code: string
  title: string
  difficulty_order: number
  totalPhases: number
  hasPhases: boolean
  completedPhases: number
  unlocked: boolean
  isCompleted: boolean
  totalScore: number
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
  const response = await api.get<LevelProgressSummaryItem[]>(
    "/progress/level-progress/",
    {
      params: {
        student_id: studentId,
        content: contentSlug,
      },
    }
  )

  return response.data.map((level) => ({
    id: level.level_id,
    code: level.level_code,
    title: level.level_title,
    difficulty_order: level.difficulty_order,
    totalPhases: level.total_phases,
    hasPhases: level.total_phases > 0,
    completedPhases: level.completed_phases,
    unlocked: level.unlocked,
    isCompleted: level.completed,
    totalScore: level.total_score,
  }))
}