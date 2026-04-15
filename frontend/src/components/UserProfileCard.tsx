import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { getDashboardSummary } from "../services/progress"

function UserProfileCard() {
  const navigate = useNavigate()
  const { student } = useAuth()

  const [score, setScore] = useState<number>(0)

  const firstName = student?.full_name?.split(" ")[0] || "Aluno"

  useEffect(() => {
    if (!student?.id) return

    const fetchScore = async () => {
      try {
        const data = await getDashboardSummary()
        setScore(data.points ?? 0)
      } catch (error) {
        console.error("Erro ao carregar pontuação:", error)
        setScore(0)
      }
    }

    fetchScore()
  }, [student?.id])

  return (
    <button
      type="button"
      onClick={() => navigate("/perfil")}
      className="flex items-center gap-4 rounded-3xl bg-white px-5 py-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7e7c8] text-xl">
        👦🏽
      </div>

      <div className="text-left leading-tight">
        <p className="text-[1.05rem] font-semibold text-slate-700">
          {firstName}
        </p>
        <p className="text-sm text-slate-400">{score} pts</p>
      </div>
    </button>
  )
}

export default UserProfileCard