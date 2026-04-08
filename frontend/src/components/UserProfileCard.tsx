import { useNavigate } from "react-router-dom"

function UserProfileCard() {
  const navigate = useNavigate()

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
          Yuri Borges
        </p>
        <p className="text-sm text-slate-400">0 pts</p>
      </div>
    </button>
  )
}

export default UserProfileCard