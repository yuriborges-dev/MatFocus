import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel, getCardAnimation } from "../utils/animation.ts"

type ActivityCardProps = {
  title: string
  description: string
  icon: string
  borderColor: string
  bgColor: string
  textColor: string
  path: string
}

function ActivityCard({
  title,
  description,
  icon,
  borderColor,
  bgColor,
  textColor,
  path,
}: ActivityCardProps) {
  const navigate = useNavigate()
  const { student } = useAuth()

  const animationLevel = getAnimationLevel(student?.animation_level)

  return (
    <button
      onClick={() => navigate(path)}
      className={`flex w-full items-center justify-between rounded-[2rem] border-2 ${borderColor} bg-white px-8 py-7 text-left ${getCardAnimation(
        animationLevel
      )}`}
    >
      <div className="flex items-center gap-6">
        <div
          className={`flex h-[72px] w-[72px] items-center justify-center rounded-[1.4rem] ${bgColor} ${textColor}`}
        >
          <span className="text-[2rem] font-bold leading-none">{icon}</span>
        </div>

        <div>
          <h3 className="text-[1.05rem] font-extrabold text-slate-900 md:text-[1.1rem]">
            {title}
          </h3>
          <p className="mt-1 text-[1rem] text-slate-400">{description}</p>
        </div>
      </div>

      <span className={`text-[1rem] font-bold ${textColor} md:text-[1.1rem]`}>
        Iniciar
      </span>
    </button>
  )
}

export default ActivityCard