import { api } from "./api"

export async function getPhaseResult(
  phaseId: number | string,
  sessionId?: number | string
) {
  const response = await api.get(`/progress/phases/${phaseId}/result/`, {
    params: {
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
    content: string
    level: string
    phase_number: number
    correct: number
    total: number
    seconds: number
    points: number
    finished_at: string | null
  }[]
}

export async function getProgressSummary(
  period: ProgressPeriod = "all"
) {
  const response = await api.get<ProgressSummaryResponse>(
    "/progress/summary/",
    {
      params: {
        period,
      },
    }
  )

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
    finished_at: string | null
  }[]
}

export type LevelProgressItem = {
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

export async function getLevelProgress(contentSlug: string) {
  const response = await api.get<LevelProgressItem[]>(
    "/progress/level-progress/",
    {
      params: {
        content: contentSlug,
      },
    }
  )

  return response.data
}

export async function getDashboardSummary() {
  const response = await api.get<DashboardSummaryResponse>(
    "/progress/dashboard/"
  )

  return response.data
}

export type ProgressReportPeriod = "7d" | "14d" | "30d"

export type ProgressReportResponse = {
  report: string
}

export async function getProgressReport(
  period: ProgressReportPeriod
) {
  const response = await api.get<ProgressReportResponse>(
    "/progress/report/",
    {
      params: {
        period,
      },
    }
  )

  return response.data
}

export async function downloadProgressReportPdf(
  period: ProgressReportPeriod
) {
  const response = await api.get(
    "/progress/report/pdf/",
    {
      params: {
        period,
      },
      responseType: "blob",
    }
  )

  const blob = new Blob([response.data], { type: "application/pdf" })
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `relatorio-${period}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

export async function getAllLevelProgress() {
  const response = await api.get<Record<string, LevelProgressItem[]>>(
    "/progress/all-level-progress/"
  )

  return response.data
}