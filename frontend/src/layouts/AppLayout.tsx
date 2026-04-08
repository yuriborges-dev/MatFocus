import { NavLink, useNavigate } from "react-router-dom"
import {
  BarChart3,
  BookOpen,
  Home,
  LogOut,
  Settings,
  Star,
} from "lucide-react"
import logoMatFocus from "../assets/logo - matfocus.png"
import UserProfileCard from "../components/UserProfileCard"

type AppLayoutProps = {
  children: React.ReactNode
  showProfileCard?: boolean
}

function AppLayout({
  children,
  showProfileCard = true,
}: AppLayoutProps) {
  const navigate = useNavigate()

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium transition ${
      isActive
        ? "bg-[#eef4ff] text-[#3b82d0]"
        : "text-slate-500 hover:bg-slate-50"
    }`

  const secondaryItemClass =
    "flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium text-slate-400 transition hover:bg-slate-50"

  const iconClass = "h-5 w-5 shrink-0"

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <aside className="fixed left-0 top-0 flex h-screen w-[285px] flex-col border-r border-slate-200 bg-white px-8 py-6">
        <button className="mb-8" onClick={() => navigate("/dashboard")}>
          <img
            src={logoMatFocus}
            alt="Logo MatFocus"
            className="w-24 object-contain"
          />
        </button>

        <nav className="flex flex-1 flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <NavLink to="/dashboard" className={navItemClass}>
              <Home className={iconClass} />
              <span>Início</span>
            </NavLink>

            <NavLink to="/atividades" className={navItemClass}>
              <BookOpen className={iconClass} />
              <span>Atividades</span>
            </NavLink>

            <NavLink to="/progresso" className={navItemClass}>
              <BarChart3 className={iconClass} />
              <span>Progresso</span>
            </NavLink>

            <NavLink to="/avatar" className={navItemClass}>
              <Star className={iconClass} />
              <span>Avatar</span>
            </NavLink>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <div className="space-y-3">
              <button className={secondaryItemClass}>
                <Settings className={iconClass} />
                <span>Configurações</span>
              </button>

              <button
                onClick={() => navigate("/")}
                className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-500 active:bg-red-100"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <div className="ml-[285px] flex min-h-screen flex-1 flex-col">
        {showProfileCard && (
          <header className="flex justify-end px-9 pb-2 pt-7">
            <UserProfileCard />
          </header>
        )}

        <main className="flex-1 px-9 pb-8 pt-2">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout