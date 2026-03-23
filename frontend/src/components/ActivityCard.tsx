import { useNavigate } from "react-router-dom"

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

  return (
    <div
      className={`flex items-center justify-between rounded-[1.8rem] border-2 ${borderColor} bg-white px-7 py-6 transition hover:shadow-md`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bgColor} text-2xl`}
        >
          {icon}
        </div>

        <div>
          <h3 className="text-[1.3rem] font-bold text-slate-800">{title}</h3>
          <p className="text-[1rem] text-slate-400">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(path)}
        className={`text-[1.1rem] font-bold ${textColor}`}
      >
        Iniciar
      </button>
    </div>
  )
}

export default ActivityCard