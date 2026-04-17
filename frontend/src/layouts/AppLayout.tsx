import { NavLink, useNavigate } from "react-router-dom"
import { BarChart3, BookOpen, Home, Menu, Star, X } from "lucide-react"
import logoMatFocus from "../assets/logo - matfocus.png"
import UserProfileCard from "../components/UserProfileCard"
import { useState } from "react"

type AppLayoutProps = {
  children: React.ReactNode
  showProfileCard?: boolean
}

function AppLayout({
  children,
  showProfileCard = true,
}: AppLayoutProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium transition ${
      isActive
        ? "bg-[#eef4ff] text-[#3b82d0]"
        : "text-slate-500 hover:bg-slate-50"
    }`

  const iconClass = "h-5 w-5 shrink-0"

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      {/* Overlay mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white px-8 py-6 transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        {/* botão fechar mobile */}
        <button
          className="mb-6 self-end lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X size={22} />
        </button>

        {/* logo */}
        <button className="mb-8" onClick={() => navigate("/dashboard")}>
          <img
            src={logoMatFocus}
            alt="Logo MatFocus"
            className="w-24 object-contain"
          />
        </button>

        <nav className="flex flex-1 flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <NavLink
              to="/dashboard"
              className={navItemClass}
              onClick={() => setMenuOpen(false)}
            >
              <Home className={iconClass} />
              Início
            </NavLink>

            <NavLink
              to="/atividades"
              className={navItemClass}
              onClick={() => setMenuOpen(false)}
            >
              <BookOpen className={iconClass} />
              Atividades
            </NavLink>

            <NavLink
              to="/progresso"
              className={navItemClass}
              onClick={() => setMenuOpen(false)}
            >
              <BarChart3 className={iconClass} />
              Progresso
            </NavLink>

            <NavLink
              to="/avatar"
              className={navItemClass}
              onClick={() => setMenuOpen(false)}
            >
              <Star className={iconClass} />
              Avatar
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Conteúdo */}
      <div className="flex min-h-screen flex-col lg:ml-[260px]">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 shadow-sm lg:bg-transparent lg:px-9 lg:pt-7 lg:shadow-none">
          <button
            className="shrink-0 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>

          {showProfileCard && (
            <div className="ml-auto max-w-[220px] sm:max-w-none">
              <UserProfileCard />
            </div>
          )}
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 px-5 pb-8 pt-4 lg:px-9">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout