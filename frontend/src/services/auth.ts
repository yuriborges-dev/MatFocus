import { api } from "./api"

export type Student = {
  id: number
  username: string
  full_name: string
  age: number
  sex: string
  school_grade: string
  guardian_name: string
  profile_photo?: string | null
}

export type AuthResponse = {
  access: string
  refresh: string
  student: Student
}

export type RegisterPayload = {
  full_name: string
  age: number
  sex: "M" | "F" | "O"
  school_grade: "3" | "4" | "5" | "6"
  guardian_name: string
  username: string
  password: string
  confirm_password: string
}

export type LoginPayload = {
  username: string
  password: string
}

export type UpdateMePayload = {
  username?: string
  full_name?: string
  age?: number
  sex?: "M" | "F"
  school_grade?: "3" | "4" | "5" | "6"
  guardian_name?: string
  password?: string
  profile_photo?: File | null
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