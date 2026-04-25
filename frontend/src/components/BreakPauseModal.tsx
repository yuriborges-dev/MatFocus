type BreakPauseModalProps = {
  isOpen: boolean
  onReturn: () => void
}

function BreakPauseModal({ isOpen, onReturn }: BreakPauseModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[4px]">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#eef6ff] text-[3rem]">
          😊
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900">
          Hora da pausa
        </h2>

        <p className="mt-3 text-lg leading-relaxed text-slate-500">
          Respire fundo, alongue-se um pouco ou descanse os olhos antes de
          continuar estudando.
        </p>

        <button
          type="button"
          onClick={onReturn}
          className="mt-8 w-full rounded-[1.3rem] bg-[#4a90d9] px-6 py-4 text-lg font-bold text-white transition hover:bg-[#3f84cc]"
        >
          Voltar aos estudos
        </button>
      </div>
    </div>
  )
}

export default BreakPauseModal