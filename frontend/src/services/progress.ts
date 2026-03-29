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