import { api } from "./api"

export async function getPhaseResult(
  phaseId: number | string,
  studentId: number | string,
  sessionId?: number | string
) {
  const response = await api.get(`/progress/phases/${phaseId}/result/`, {
    params: {
      student_id: studentId,
      session_id: sessionId,
    },
  })

  return response.data
}

export type ProgressPeriod = "all" | "7d" | "14d" | "30d"

export type ProgressSummaryResponse = {
  accuracy: number
  correct_answers: number
  wrong_answers: number
  total_activities: number
  content_progress: {
    content: string
    progress: number
  }[]
  history: {
    title: string
    correct: number
    total: number
    seconds: number
  }[]
}

export async function getProgressSummary(
  studentId: number | string,
  period: ProgressPeriod = "all"
) {
  const response = await api.get<ProgressSummaryResponse>("/progress/summary/", {
    params: {
      student_id: studentId,
      period,
    },
  })

  return response.data
}