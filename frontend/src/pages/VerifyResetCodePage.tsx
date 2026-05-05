import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { KeyRound } from "lucide-react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import { verifyPasswordResetCode } from "../services/auth"

function VerifyResetCodePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ""

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email) {
      navigate("/recuperar-senha")
      return
    }

    if (!code.trim()) {
      setError("Informe o código recebido.")
      return
    }

    try {
      setLoading(true)
      setError("")

      await verifyPasswordResetCode({
        email,
        code: code.trim(),
      })

      navigate("/recuperar-senha/nova-senha", {
        state: { email, code: code.trim() },
      })
    } catch {
      setError("Código inválido ou expirado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="animate-auth-page flex min-h-[100dvh] w-full items-center justify-center bg-[#eef8fb] px-4 py-6">
        <div className="w-full max-w-md rounded-[2rem] bg-white px-6 py-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
          <div className="mb-6 flex justify-center">
            <img src={logoMatFocus} alt="Logo MatFocus" className="w-32" />
          </div>

          <h1 className="text-center text-2xl font-extrabold text-slate-800">
            Código de verificação
          </h1>

          <p className="mt-2 text-center text-sm text-slate-400">
            Digite o código enviado para o e-mail.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-600">
                Código
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                <KeyRound className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Digite o código"
                  maxLength={6}
                  className="w-full bg-transparent text-center text-xl font-bold tracking-[0.3em] text-slate-700 outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-sky-400 px-6 py-3.5 text-lg font-bold text-white transition hover:bg-sky-500 disabled:opacity-70"
            >
              {loading ? "Validando..." : "Validar código"}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}

export default VerifyResetCodePage