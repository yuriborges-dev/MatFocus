import { ArrowLeft, Info, LogOut, Pencil, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import { useAuth } from "../contexts/AuthContext"
import defaultProfile from "../assets/default_profile.jpg"

function getSexLabel(value?: string) {
  if (value === "M") return "Masculino"
  if (value === "F") return "Feminino"
  if (value === "O") return "Outro"
  return "-"
}

function getGradeLabel(value?: string) {
  if (value === "3") return "3º ano"
  if (value === "4") return "4º ano"
  if (value === "5") return "5º ano"
  if (value === "6") return "6º ano"
  return "-"
}

function ProfilePage() {
  const navigate = useNavigate()
  const { student, logoutUser } = useAuth()

  const fullName = student?.full_name || "Aluno"
  const firstName = fullName.split(" ")[0] || "Aluno"
  const username = student?.username || "-"
  const age = student?.age ? `${student.age} anos` : "-"
  const schoolGrade = getGradeLabel(student?.school_grade)
  const sexLabel = getSexLabel(student?.sex)
  const guardianName = student?.guardian_name || "-"

  function handleLogout() {
    logoutUser()
    navigate("/")
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Meu Perfil
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Gerencie suas informações
          </p>
        </header>

        <section className="overflow-hidden rounded-[2rem] bg-white shadow-md">
          <div className="relative h-[320px] w-full bg-gradient-to-r from-[#4a90d9] to-[#67ace8]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-white/20 shadow-sm backdrop-blur-sm">
                <img
                  src={student?.profile_photo || defaultProfile}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="px-7 py-8 md:px-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  {fullName}
                </h2>
                <p className="mt-1 text-lg text-slate-400">
                  {schoolGrade} • {age}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/perfil/editar")}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-base font-semibold text-[#3b82f6] transition hover:bg-blue-50"
              >
                <Pencil size={18} />
                Editar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 px-5 py-4">
                <p className="mb-1 text-sm text-slate-400">Usuário</p>
                <p className="text-2xl font-semibold text-slate-800">
                  {username}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 px-5 py-4">
                <p className="mb-1 text-sm text-slate-400">Gênero</p>
                <p className="text-2xl font-semibold text-slate-800">
                  {sexLabel}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 px-5 py-4 md:col-span-2">
                <p className="mb-1 text-sm text-slate-400">Responsável</p>
                <p className="text-2xl font-semibold text-slate-800">
                  {guardianName}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/configuracoes")}
              className="flex items-center justify-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-6 py-6 text-2xl font-bold text-slate-700 shadow-md transition hover:bg-slate-50"
            >
              <Settings size={22} className="text-slate-400" />
              Configurações
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 rounded-[1.75rem] border border-red-200 bg-white px-6 py-6 text-2xl font-bold text-red-500 shadow-md transition hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Sair
            </button>
          </div>

          <div className="rounded-[1.75rem] bg-white px-6 py-6 shadow-md">
            <button
              type="button"
              onClick={() => navigate("/sobre")}
              className="flex w-full items-center text-left"
            >
              <div className="flex items-center gap-3">
                <Info className="text-[#3b82f6]" size={22} />
                <span className="text-2xl font-bold text-slate-800">
                  Sobre
                </span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default ProfilePage