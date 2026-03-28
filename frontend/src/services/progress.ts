import { api } from "./api"

export async function getPhaseResult(phaseId: number | string, studentId: number | string) {
  const response = await api.get(`/progress/phases/${phaseId}/result/`, {
    params: {
      student_id: studentId,
    },
  })

  return response.data
}