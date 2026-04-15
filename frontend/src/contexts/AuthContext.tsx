import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  getMe,
  login,
  register,
  type LoginPayload,
  type RegisterPayload,
  type Student,
} from "../services/auth"

type UpdateStudentPayload = Partial<Student>

type AuthContextType = {
  student: Student | null
  isAuthenticated: boolean
  loading: boolean
  loginUser: (payload: LoginPayload) => Promise<void>
  registerUser: (payload: RegisterPayload) => Promise<void>
  logoutUser: () => void
  updateStudentData: (payload: UpdateStudentPayload) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("matfocus_access")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await getMe()
        setStudent(data)
        localStorage.setItem("matfocus_student", JSON.stringify(data))
      } catch {
        localStorage.removeItem("matfocus_access")
        localStorage.removeItem("matfocus_refresh")
        localStorage.removeItem("matfocus_student")
        setStudent(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  async function loginUser(payload: LoginPayload) {
    const data = await login(payload)

    localStorage.setItem("matfocus_access", data.access)
    localStorage.setItem("matfocus_refresh", data.refresh)
    localStorage.setItem("matfocus_student", JSON.stringify(data.student))

    setStudent(data.student)
  }

  async function registerUser(payload: RegisterPayload) {
    const data = await register(payload)

    localStorage.setItem("matfocus_access", data.access)
    localStorage.setItem("matfocus_refresh", data.refresh)
    localStorage.setItem("matfocus_student", JSON.stringify(data.student))

    setStudent(data.student)
  }

  function updateStudentData(payload: UpdateStudentPayload) {
    setStudent((prev) => {
      if (!prev) return prev

      const updatedStudent = {
        ...prev,
        ...payload,
      }

      localStorage.setItem("matfocus_student", JSON.stringify(updatedStudent))
      return updatedStudent
    })
  }

  function logoutUser() {
    localStorage.removeItem("matfocus_access")
    localStorage.removeItem("matfocus_refresh")
    localStorage.removeItem("matfocus_student")
    setStudent(null)
  }

  const value = useMemo(
    () => ({
      student,
      isAuthenticated: !!student,
      loading,
      loginUser,
      registerUser,
      logoutUser,
      updateStudentData,
    }),
    [student, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }

  return context
}