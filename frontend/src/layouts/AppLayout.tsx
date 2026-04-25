import { NavLink, useNavigate } from "react-router-dom"
import { BarChart3, BookOpen, Home, Menu, Star, X } from "lucide-react"
import logoMatFocus from "../assets/logo - matfocus.png"
import UserProfileCard from "../components/UserProfileCard"
import BreakReminderModal from "../components/BreakReminderModal"
import BreakPauseModal from "../components/BreakPauseModal"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../contexts/AuthContext"

type AppLayoutProps = {
  children: React.ReactNode
  showProfileCard?: boolean
}

function AppLayout({ children, showProfileCard = true }: AppLayoutProps) {
  const navigate = useNavigate()
  const { student } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const [showBreakReminder, setShowBreakReminder] = useState(false)
  const [showBreakPause, setShowBreakPause] = useState(false)

  const breakTimerRef = useRef<number | null>(null)

  const breakSuggestionsEnabled = student?.break_suggestions_enabled ?? true
  const breakIntervalMinutes = student?.break_interval_minutes ?? 20

  function clearBreakTimer() {
    if (breakTimerRef.current) {
      window.clearTimeout(breakTimerRef.current)
      breakTimerRef.current = null
    }
  }

  function startBreakTimer() {
    clearBreakTimer()

    if (!breakSuggestionsEnabled) return

    const intervalInMs = Math.max(1, breakIntervalMinutes) * 60 * 1000

    breakTimerRef.current = window.setTimeout(() => {
      setShowBreakReminder(true)
    }, intervalInMs)
  }

  useEffect(() => {
    startBreakTimer()

    return () => {
      clearBreakTimer()
    }
  }, [breakSuggestionsEnabled, breakIntervalMinutes])

  function handleContinueStudying() {
    setShowBreakReminder(false)
    startBreakTimer()
  }

  function handleStartPause() {
    setShowBreakReminder(false)
    setShowBreakPause(true)
    clearBreakTimer()
  }

  function handleReturnToStudy() {
    setShowBreakPause(false)
    startBreakTimer()
  }

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left text-[18px] font-medium transition ${
      isActive
        ? "bg-[#eef4ff] text-[#3b82d0]"
        : "text-slate-500 hover:bg-slate-50"
    }`

  const iconClass = "h-5 w-5 shrink-0"

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <BreakReminderModal
        isOpen={showBreakReminder}
        onContinue={handleContinueStudying}
        onPause={handleStartPause}
      />

      <BreakPauseModal
        isOpen={showBreakPause}
        onReturn={handleReturnToStudy}
      />

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-slate-200 bg-white px-8 py-6 transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      >
        <button
          className="mb-6 self-end lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X size={22} />
        </button>

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

      <div className="flex min-h-screen flex-col lg:ml-[260px]">
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

        <main className="flex-1 px-5 pb-8 pt-4 lg:px-9">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout