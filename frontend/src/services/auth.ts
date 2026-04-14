import { api } from "./api"

export type Student = {
  id: number
  username: string
  full_name: string
  age: number
  sex: string
  school_grade: string
  guardian_name: string
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