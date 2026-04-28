import { useEffect, useMemo, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import ActivityCard from "../components/ActivityCard"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel, getPageAnimation } from "../utils/animation.ts"

type Content = {
  id: number
  name: string
  slug: string
  description: string
}

const cardStyles: Record<
  string,
  {
    icon: string
    borderColor: string
    bgColor: string
    textColor: string
  }
> = {
  adicao: {
    icon: "+",
    borderColor: "border-blue-400",
    bgColor: "bg-blue-100",
    textColor: "text-blue-500",
  },
  subtracao: {
    icon: "-",
    borderColor: "border-green-400",
    bgColor: "bg-green-100",
    textColor: "text-green-500",
  },
  multiplicacao: {
    icon: "×",
    borderColor: "border-yellow-400",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-500",
  },
  divisao: {
    icon: "÷",
    borderColor: "border-purple-400",
    bgColor: "bg-purple-100",
    textColor: "text-purple-500",
  },
  problemas: {
    icon: "?",
    borderColor: "border-red-400",
    bgColor: "bg-red-100",
    textColor: "text-red-500",
  },
}

const contentOrder = [
  "adicao",
  "subtracao",
  "multiplicacao",
  "divisao",
  "problemas",
]

function ActivitiesPage() {
  const { student } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await api.get("/activities/contents/")
        setContents(response.data)
      } catch {
        setError("Não foi possível carregar os conteúdos.")
      } finally {
        setLoading(false)
      }
    }

    fetchContents()
  }, [])

  const orderedContents = useMemo(() => {
    return [...contents].sort((a, b) => {
      const indexA = contentOrder.indexOf(a.slug)
      const indexB = contentOrder.indexOf(b.slug)

      const safeIndexA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA
      const safeIndexB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB

      return safeIndexA - safeIndexB
    })
  }, [contents])

  return (
    <AppLayout>
      <div className={getPageAnimation(animationLevel)}>
        <div>
          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-[2.5rem]">
            Escolha o conteúdo
          </h1>

          <p className="mt-1 text-sm text-slate-400 sm:text-base lg:text-[1.1rem]">
            O que vamos praticar hoje?
          </p>
        </div>

        {loading && (
          <div className="mt-8 rounded-[1.8rem] bg-white px-7 py-8 text-slate-500 shadow-sm">
            Carregando conteúdos...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-[1.8rem] border border-red-200 bg-red-50 px-7 py-8 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {orderedContents.map((content) => {
              const style = cardStyles[content.slug] || {
                icon: "•",
                borderColor: "border-slate-300",
                bgColor: "bg-slate-100",
                textColor: "text-slate-500",
              }

              return (
                <ActivityCard
                  key={content.id}
                  title={content.name}
                  description={content.description || "Conteúdo matemático"}
                  icon={style.icon}
                  borderColor={style.borderColor}
                  bgColor={style.bgColor}
                  textColor={style.textColor}
                  path={`/atividades/${content.slug}`}
                />
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default ActivitiesPage