import { useState } from "react"
import {
  Bell,
  RotateCcw,
  Save,
  Sparkles,
  Volume2,
  ArrowLeft,
} from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import { useNavigate } from "react-router-dom"

type IntensityLevel = "baixo" | "medio" | "alto"

function LevelSelector({
  value,
  onChange,
}: {
  value: IntensityLevel
  onChange: (value: IntensityLevel) => void
}) {
  const options: { label: string; value: IntensityLevel }[] = [
    { label: "Baixo", value: "baixo" },
    { label: "Médio", value: "medio" },
    { label: "Alto", value: "alto" },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((option) => {
        const selected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-3 py-3 text-base font-semibold transition sm:px-4 sm:text-lg ${
              selected
                ? "border-[#3b82d0] bg-[#eef4ff] text-[#3b82d0]"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function SettingsPage() {
  const [soundLevel, setSoundLevel] = useState<IntensityLevel>("medio")
  const [animationLevel, setAnimationLevel] = useState<IntensityLevel>("medio")
  const [breakSuggestionsEnabled, setBreakSuggestionsEnabled] = useState(false)
  const [breakInterval, setBreakInterval] = useState(20)
  const navigate = useNavigate()

  function handleResetDefaults() {
    setSoundLevel("medio")
    setAnimationLevel("medio")
    setBreakSuggestionsEnabled(false)
    setBreakInterval(20)
  }

  function handleBreakIntervalChange(value: string) {
    const numericValue = Number(value)

    if (Number.isNaN(numericValue)) {
      setBreakInterval(0)
      return
    }

    setBreakInterval(numericValue)
  }

  function handleSave() {
    console.log({
      soundLevel,
      animationLevel,
      breakSuggestionsEnabled,
      breakInterval,
    })
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate("/perfil")}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 sm:mb-4 sm:px-3"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Configurações
          </h1>
          <p className="mt-1 text-sm text-slate-400 sm:mt-2 sm:text-base lg:text-lg">
            Personalize sua experiência
          </p>
        </header>

        <section className="space-y-5 sm:space-y-6">
          <div className="rounded-[1.6rem] bg-white p-5 shadow-md sm:rounded-[1.75rem] sm:p-7">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eaf3ff] text-[#3b82d0] sm:h-12 sm:w-12">
                <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold leading-tight text-slate-800 sm:text-[1.9rem]">
                  Sons
                </h2>
                <p className="text-sm text-slate-400 sm:text-base">
                  Intensidade dos efeitos sonoros
                </p>
              </div>
            </div>

            <LevelSelector value={soundLevel} onChange={setSoundLevel} />
          </div>

          <div className="rounded-[1.6rem] bg-white p-5 shadow-md sm:rounded-[1.75rem] sm:p-7">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4ecff] text-[#a855f7] sm:h-12 sm:w-12">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold leading-tight text-slate-800 sm:text-[1.9rem]">
                  Animações
                </h2>
                <p className="text-sm text-slate-400 sm:text-base">
                  Velocidade e intensidade das animações
                </p>
              </div>
            </div>

            <LevelSelector
              value={animationLevel}
              onChange={setAnimationLevel}
            />
          </div>

          <div className="rounded-[1.6rem] bg-white p-5 shadow-md sm:rounded-[1.75rem] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f9ef] text-[#67c18c] sm:h-12 sm:w-12">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-2xl font-bold leading-tight text-slate-800 sm:text-[1.9rem]">
                    Sugerir pausas
                  </h2>
                  <p className="text-sm text-slate-400 sm:text-base">
                    Lembrete para descansar durante os estudos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBreakSuggestionsEnabled((current) => !current)
                }
                className={`relative mt-1 h-8 w-14 shrink-0 rounded-full transition ${
                  breakSuggestionsEnabled ? "bg-slate-900" : "bg-slate-200"
                }`}
                aria-pressed={breakSuggestionsEnabled}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    breakSuggestionsEnabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            {breakSuggestionsEnabled && (
              <div className="mt-5 border-t border-slate-200 pt-5 sm:mt-6 sm:pt-6">
                <div className="flex flex-wrap items-center gap-3 text-base text-slate-600 sm:gap-4 sm:text-[1.05rem]">
                  <span className="font-medium text-slate-700">
                    Sugerir pausa a cada
                  </span>

                  <input
                    type="number"
                    min={1}
                    value={breakInterval}
                    onChange={(e) => handleBreakIntervalChange(e.target.value)}
                    className="h-12 w-20 rounded-2xl border border-slate-200 bg-white px-3 text-center text-lg font-bold text-slate-900 outline-none transition focus:border-[#3b82d0] sm:h-14 sm:w-24 sm:px-4 sm:text-xl"
                  />

                  <span className="text-slate-500">minutos</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center justify-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-6 py-4 text-lg font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 sm:py-5 sm:text-xl"
          >
            <RotateCcw className="h-5 w-5" />
            Restaurar padrão
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-3 rounded-[1.4rem] bg-[#4a90d9] px-6 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-[#3f84cc] sm:py-5 sm:text-xl"
          >
            <Save className="h-5 w-5" />
            Salvar
          </button>
        </div>
      </div>
    </AppLayout>
  )
}

export default SettingsPage