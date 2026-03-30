import { api } from "./api"

export async function getLevelProgress(
  studentId: number,
  contentSlug: string,
  levelCode: string
) {
  const response = await api.get("/progress/phase-map/", {
    params: {
      student_id: studentId,
      content: contentSlug,
      level: levelCode,
    },
  })

  const phases = response.data

  const total = phases.length
  const completed = phases.filter((p: any) => p.is_completed).length

  const unlocked =
    total > 0 &&
    phases.some((p: any) => p.is_unlocked)

  return {
    total,
    completed,
    unlocked,
  }
}