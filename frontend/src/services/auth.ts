import { api } from "./api"

export type IntensityLevel = "baixo" | "medio" | "alto"

export type Student = {
  id: number
  username: string
  email: string
  full_name: string
  age: number
  sex: string
  school_grade: string
  guardian_name: string
  profile_photo?: string | null
  sound_level?: IntensityLevel
  animation_level?: IntensityLevel
  break_suggestions_enabled?: boolean
  break_interval_minutes?: number
}

export type AuthResponse = {
  access: string
  refresh: string
  student: Student
}

export type RegisterPayload = {
  full_name: string
  age: number
  sex: "M" | "F"
  school_grade: "3" | "4" | "5" | "6"
  guardian_name: string
  username: string
  email: string
  password: string
  confirm_password: string
}

export type LoginPayload = {
  username: string
  password: string
}

export type UpdateMePayload = {
  username?: string
  email?: string
  full_name?: string
  age?: number
  sex?: "M" | "F"
  school_grade?: "3" | "4" | "5" | "6"
  guardian_name?: string
  password?: string
  profile_photo?: File | null
  sound_level?: IntensityLevel
  animation_level?: IntensityLevel
  break_suggestions_enabled?: boolean
  break_interval_minutes?: number
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>("/auth/register/", payload)
  return response.data
}

export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>("/auth/login/", payload)
  return response.data
}

export async function getMe() {
  const response = await api.get<Student>("/auth/me/")
  return response.data
}

export async function updateMe(payload: UpdateMePayload) {
  const formData = new FormData()

  if (payload.username !== undefined) {
    formData.append("username", payload.username)
  }

  if (payload.email !== undefined) {
    formData.append("email", payload.email)
  }

  if (payload.full_name !== undefined) {
    formData.append("full_name", payload.full_name)
  }

  if (payload.age !== undefined) {
    formData.append("age", String(payload.age))
  }

  if (payload.sex !== undefined) {
    formData.append("sex", payload.sex)
  }

  if (payload.school_grade !== undefined) {
    formData.append("school_grade", payload.school_grade)
  }

  if (payload.guardian_name !== undefined) {
    formData.append("guardian_name", payload.guardian_name)
  }

  if (payload.password !== undefined) {
    formData.append("password", payload.password)
  }

  if (payload.sound_level !== undefined) {
    formData.append("sound_level", payload.sound_level)
  }

  if (payload.animation_level !== undefined) {
    formData.append("animation_level", payload.animation_level)
  }

  if (payload.break_suggestions_enabled !== undefined) {
    formData.append(
      "break_suggestions_enabled",
      String(payload.break_suggestions_enabled)
    )
  }

  if (payload.break_interval_minutes !== undefined) {
    formData.append(
      "break_interval_minutes",
      String(payload.break_interval_minutes)
    )
  }

  if (payload.profile_photo instanceof File) {
    formData.append("profile_photo", payload.profile_photo)
  }

  if (payload.profile_photo === null) {
    formData.append("profile_photo", "")
  }

  const response = await api.patch<Student>("/auth/me/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export type RequestPasswordResetPayload = {
  email: string
}

export type VerifyPasswordResetCodePayload = {
  email: string
  code: string
}

export type ResetPasswordPayload = {
  email: string
  code: string
  password: string
  confirm_password: string
}

export async function requestPasswordReset(
  payload: RequestPasswordResetPayload
) {
  const response = await api.post<{ detail: string }>(
    "/auth/password-reset/request/",
    payload
  )

  return response.data
}

export async function verifyPasswordResetCode(
  payload: VerifyPasswordResetCodePayload
) {
  const response = await api.post<{ detail: string }>(
    "/auth/password-reset/verify/",
    payload
  )

  return response.data
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await api.post<{ detail: string }>(
    "/auth/password-reset/confirm/",
    payload
  )

  return response.data
}