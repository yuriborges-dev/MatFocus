import { Info, LogOut, Pencil, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import BackButton from "../components/BackButton"
import AppLayout from "../layouts/AppLayout"
import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel, getPageAnimation } from "../utils/animation"
import defaultProfile from "../assets/default_profile.jpg"

function getSexLabel(value?: string) {
  if (value === "M") return "Masculino"
  if (value === "F") return "Feminino"
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
  const location = useLocation()
  const { student, logoutUser } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  const [showSettingsToast, setShowSettingsToast] = useState(false)
  const [isToastLeaving, setIsToastLeaving] = useState(false)

  const fullName = student?.full_name || "Aluno"
  const username = student?.username || "-"
  const age = student?.age ? `${student.age} anos` : "-"
  const schoolGrade = getGradeLabel(student?.school_grade)
  const sexLabel = getSexLabel(student?.sex)
  const guardianName = student?.guardian_name || "-"

  useEffect(() => {
    if (!location.state?.settingsSaved) return

    setShowSettingsToast(true)
    setIsToastLeaving(false)

    const leaveTimeout = setTimeout(() => {
      setIsToastLeaving(true)
    }, 1800)

    const hideTimeout = setTimeout(() => {
      setShowSettingsToast(false)
      setIsToastLeaving(false)
    }, 2400)

    window.history.replaceState({}, document.title)

    return () => {
      clearTimeout(leaveTimeout)
      clearTimeout(hideTimeout)
    }
  }, [location.state])

  function handleLogout() {
    logoutUser()
    navigate("/")
  }

  return (
    <AppLayout>
      <div className={getPageAnimation(animationLevel)}>
        {showSettingsToast && (
          <div
            className={`fixed right-6 top-6 z-50 rounded-2xl bg-green-500 px-5 py-4 text-white shadow-lg transition-all duration-500 ${
              isToastLeaving
                ? "translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <p className="text-sm font-semibold">
              Configurações salvas com sucesso!
            </p>
          </div>
        )}

        <div className="mx-auto max-w-5xl">
          <header className="mb-5 sm:mb-6">
            <BackButton />

            <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Meu Perfil
            </h1>
            <p className="mt-1 text-sm text-slate-400 sm:mt-2 sm:text-base lg:text-lg">
              Gerencie suas informações
            </p>
          </header>

          <section className="overflow-hidden rounded-[1.8rem] bg-white shadow-md sm:rounded-[2rem]">
            <div className="relative h-[210px] w-full bg-gradient-to-r from-[#4a90d9] to-[#67ace8] sm:h-[250px] lg:h-[290px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white/20 shadow-sm backdrop-blur-sm sm:h-36 sm:w-36 lg:h-40 lg:w-40">
                  <img
                    src={student?.profile_photo || defaultProfile}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-7 md:px-8">
              <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                    {fullName}
                  </h2>
                  <p className="mt-1 text-base text-slate-400 sm:text-lg">
                    {schoolGrade} • {age}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/perfil/editar")}
                  className="inline-flex w-fit items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-[#3b82f6] transition hover:bg-blue-50 sm:px-4 sm:text-base"
                >
                  <Pencil size={18} />
                  Editar
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4">
                  <p className="mb-1 text-sm text-slate-400">Usuário</p>
                  <p className="break-words text-xl font-semibold text-slate-800 sm:text-2xl">
                    {username}
                  </p>
                </div>

                <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4">
                  <p className="mb-1 text-sm text-slate-400">Gênero</p>
                  <p className="break-words text-xl font-semibold text-slate-800 sm:text-2xl">
                    {sexLabel}
                  </p>
                </div>

                <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4 md:col-span-2">
                  <p className="mb-1 text-sm text-slate-400">Responsável</p>
                  <p className="break-words text-xl font-semibold leading-snug text-slate-800 sm:text-2xl">
                    {guardianName}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/configuracoes")}
                className="flex items-center justify-center gap-3 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-5 text-xl font-bold text-slate-700 shadow-md transition hover:bg-slate-50 sm:rounded-[1.75rem] sm:px-6 sm:py-6 sm:text-2xl"
              >
                <Settings size={22} className="text-slate-400" />
                Configurações
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 rounded-[1.6rem] border border-red-200 bg-white px-5 py-5 text-xl font-bold text-red-500 shadow-md transition hover:bg-red-50 sm:rounded-[1.75rem] sm:px-6 sm:py-6 sm:text-2xl"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Sair
              </button>
            </div>

            <div className="rounded-[1.6rem] bg-white px-5 py-5 shadow-md sm:rounded-[1.75rem] sm:px-6 sm:py-6">
              <button
                type="button"
                onClick={() => navigate("/sobre")}
                className="flex w-full items-center text-left"
              >
                <div className="flex items-center gap-3">
                  <Info className="text-[#3b82f6]" size={22} />
                  <span className="text-xl font-bold text-slate-800 sm:text-2xl">
                    Sobre
                  </span>
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}

export default ProfilePage