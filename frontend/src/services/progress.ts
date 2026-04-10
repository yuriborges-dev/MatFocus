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

export type DashboardSummaryResponse = {
  student_name: string
  accuracy: number
  points: number
  activities: number
  continue_section: {
    content: string | null
    content_slug: string | null
    level: string | null
    level_code: string | null
    phase: number | null
  }
  content_progress: {
    content: string
    progress: number
  }[]
  recent_activities: {
    title: string
    detail: string
    points: string
  }[]
}

export async function getDashboardSummary(studentId: number | string) {
  const response = await api.get<DashboardSummaryResponse>("/progress/dashboard/", {
    params: {
      student_id: studentId,
    },
  })

  return response.data
}

export type ProgressReportPeriod = "7d" | "14d" | "30d"

export type ProgressReportResponse = {
  report: string
}

export async function getProgressReport(
  studentId: number | string,
  period: ProgressReportPeriod
) {
  const response = await api.get<ProgressReportResponse>("/progress/report/", {
    params: {
      student_id: studentId,
      period,
    },
  })

  return response.data
}