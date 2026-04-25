type BreakReminderModalProps = {
  isOpen: boolean
  onContinue: () => void
  onPause: () => void
}

function BreakReminderModal({
  isOpen,
  onContinue,
  onPause,
}: BreakReminderModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f9ef] text-[2.5rem]">
          🌿
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900">
          Que tal uma pausa?
        </h2>

        <p className="mt-3 text-lg leading-relaxed text-slate-500">
          Você já estudou por alguns minutos. Uma pequena pausa pode ajudar você
          a voltar com mais foco.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onPause}
            className="rounded-[1.3rem] bg-[#79c6a1] px-5 py-4 text-lg font-bold text-white transition hover:brightness-105"
          >
            Fazer pausa
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="rounded-[1.3rem] border border-slate-200 bg-white px-5 py-4 text-lg font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

export default BreakReminderModal