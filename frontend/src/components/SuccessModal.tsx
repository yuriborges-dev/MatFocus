type SuccessModalProps = {
  isOpen: boolean
  message: string
  onContinue: () => void
}

function SuccessModal({
  isOpen,
  message,
  onContinue,
}: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-[2rem] border border-[#b7ebcf] bg-[#f3fff8] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="mb-5 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#79c6a1] text-[2.8rem] text-[#79c6a1]">
            ✓
          </div>
        </div>

        <h2 className="text-[2rem] font-extrabold text-slate-800">
          {message}
        </h2>

        <button
          type="button"
          onClick={onContinue}
          className="mt-8 rounded-[1.2rem] bg-[#79c6a1] px-10 py-4 text-xl font-bold text-white shadow-md transition hover:brightness-105"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

export default SuccessModal