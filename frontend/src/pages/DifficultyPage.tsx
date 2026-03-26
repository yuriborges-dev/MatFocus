import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import { api } from "../services/api"

type Level = {
  id: number
  code: string
  title: string
  difficulty_order: number
}

function DifficultyPage() {
  const { conteudo } = useParams()
  const navigate = useNavigate()

  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await api.get("/activities/levels/")
        setLevels(response.data)
      } catch {
        setError("Não foi possível carregar os níveis.")
      } finally {
        setLoading(false)
      }
    }

    fetchLevels()
  }, [])

  return (
    <AppLayout>
      <div>
        <h1 className="text-[2.5rem] font-extrabold text-slate-900">
          Escolha o nível
        </h1>
        <p className="mt-1 text-[1.1rem] text-slate-400">
          Selecione a dificuldade
        </p>
      </div>

      {loading && (
        <div className="mt-8">Carregando níveis...</div>
      )}

      {error && (
        <div className="mt-8 text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() =>
                navigate(`/atividades/${conteudo}/${level.code}`)
              }
              className="rounded-[1.8rem] border border-slate-200 bg-white px-7 py-6 text-left shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-[1.4rem] font-bold text-slate-800">
                {level.title}
              </h3>

              <p className="text-slate-400">
                Dificuldade {level.difficulty_order}
              </p>
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  )
}

export default DifficultyPage