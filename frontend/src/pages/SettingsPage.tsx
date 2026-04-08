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
            className={`rounded-2xl border px-4 py-3 text-lg font-semibold transition ${
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
        <header className="mb-8">
            <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="mb-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700"
            >
                <ArrowLeft className="h-6 w-6" />
            </button>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Configurações
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Personalize sua experiência
          </p>
        </header>

        <section className="space-y-7">
          <div className="rounded-[1.75rem] bg-white p-7 shadow-md">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ff] text-[#3b82d0]">
                <Volume2 className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-[1.9rem] font-bold text-slate-800">Sons</h2>
                <p className="text-base text-slate-400">
                  Intensidade dos efeitos sonoros
                </p>
              </div>
            </div>

            <LevelSelector value={soundLevel} onChange={setSoundLevel} />
          </div>

          <div className="rounded-[1.75rem] bg-white p-7 shadow-md">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ecff] text-[#a855f7]">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-[1.9rem] font-bold text-slate-800">
                  Animações
                </h2>
                <p className="text-base text-slate-400">
                  Velocidade e intensidade das animações
                </p>
              </div>
            </div>

            <LevelSelector
              value={animationLevel}
              onChange={setAnimationLevel}
            />
          </div>

          <div className="rounded-[1.75rem] bg-white p-7 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f9ef] text-[#67c18c]">
                  <Bell className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-[1.9rem] font-bold text-slate-800">
                    Sugerir pausas
                  </h2>
                  <p className="text-base text-slate-400">
                    Lembrete para descansar durante os estudos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBreakSuggestionsEnabled((current) => !current)
                }
                className={`relative h-8 w-14 rounded-full transition ${
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
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="flex flex-wrap items-center gap-4 text-[1.1rem] text-slate-600">
                  <span className="font-medium text-slate-700">
                    Sugerir pausa a cada
                  </span>

                  <input
                    type="number"
                    min={1}
                    value={breakInterval}
                    onChange={(e) => handleBreakIntervalChange(e.target.value)}
                    className="h-14 w-24 rounded-2xl border border-slate-200 bg-white px-4 text-center text-xl font-bold text-slate-900 outline-none transition focus:border-[#3b82d0]"
                  />

                  <span className="text-slate-500">minutos</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center justify-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-6 py-5 text-xl font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <RotateCcw className="h-5 w-5" />
            Restaurar padrão
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-3 rounded-[1.4rem] bg-[#4a90d9] px-6 py-5 text-xl font-bold text-white shadow-sm transition hover:bg-[#3f84cc]"
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