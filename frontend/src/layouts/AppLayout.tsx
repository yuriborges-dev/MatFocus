import logoMatFocus from "../assets/logo - matfocus.png"
import { useNavigate } from "react-router-dom"

type AppLayoutProps = {
  children: React.ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
    const navigate = useNavigate()
    return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <div className="flex min-h-screen">
        <aside className="flex w-[285px] flex-col border-r border-slate-200 bg-white px-8 py-6">
          <div className="mb-10">
            <img
              src={logoMatFocus}
              alt="Logo MatFocus"
              className="w-24 object-contain"
            />
          </div>

          <nav className="flex flex-1 flex-col justify-between">
            <div className="space-y-3">
              <button className="flex w-full items-center gap-4 rounded-2xl bg-[#eef4ff] px-5 py-4 text-left text-[18px] font-medium text-[#3b82d0]">
                <span>⌂</span>
                Início
              </button>

              <button
                onClick={() => navigate("/atividades")}
                className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium text-slate-500 transition hover:bg-slate-50"
              >
                <span>📖</span>
                Atividades
              </button>

              <button className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium text-slate-500 transition hover:bg-slate-50">
                <span>📊</span>
                Progresso
              </button>

              <button className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium text-slate-500 transition hover:bg-slate-50">
                <span>⭐</span>
                Avatar
              </button>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="space-y-3">
                <button className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium text-slate-400 transition hover:bg-slate-50">
                  <span>⚙</span>
                  Configurações
                </button>

                <button
                    type="button"
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

        <main className="flex-1 px-9 py-8">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout