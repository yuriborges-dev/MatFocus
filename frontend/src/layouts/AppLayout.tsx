import { NavLink, useNavigate } from "react-router-dom"
import logoMatFocus from "../assets/logo - matfocus.png"
import UserProfileCard from "../components/UserProfileCard"

type AppLayoutProps = {
  children: React.ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium transition ${
    isActive
      ? "bg-[#eef4ff] text-[#3b82d0]"
      : "text-slate-500 hover:bg-slate-50"
  }`

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <div className="flex min-h-screen">
        <aside className="flex w-[285px] flex-col border-r border-slate-200 bg-white px-8 py-6">
          <button className="mb-10" onClick={() => navigate("/dashboard")}>
            <img
              src={logoMatFocus}
              alt="Logo MatFocus"
              className="w-24 object-contain"
            />
          </button>

          <nav className="flex flex-1 flex-col justify-between">
            <div className="space-y-3">
              <NavLink to="/dashboard" className={navItemClass}>
                <span>⌂</span>
                Início
              </NavLink>

              <NavLink to="/atividades" className={navItemClass}>
                <span>📖</span>
                Atividades
              </NavLink>

              <NavLink to="/progresso" className={navItemClass}>
                <span>📊</span>
                Progresso
              </NavLink>

              <NavLink to="/avatar" className={navItemClass}>
                <span>⭐</span>
                Avatar
              </NavLink>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="space-y-3">
                <button className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium text-slate-400 transition hover:bg-slate-50">
                  <span>⚙</span>
                  Configurações
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium text-slate-400 transition hover:bg-slate-50"
                >
                  <span>↪</span>
                  Sair
                </button>
              </div>
            </div>
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex justify-end px-9 pb-2 pt-7">
            <UserProfileCard />
          </header>

          <main className="flex-1 px-9 pb-8 pt-2">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout