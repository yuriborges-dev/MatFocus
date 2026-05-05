import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Mail } from "lucide-react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import { requestPasswordReset } from "../services/auth"

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      setError("Informe o e-mail cadastrado.")
      return
    }

    try {
      setLoading(true)
      setError("")

      await requestPasswordReset({ email: email.trim() })

      navigate("/recuperar-senha/codigo", {
        state: { email: email.trim() },
      })
    } catch {
      setError("Não foi possível solicitar a recuperação.")
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
            Recuperar senha
          </h1>

          <p className="mt-2 text-center text-sm text-slate-400">
            Informe o e-mail cadastrado para receber o código.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-base font-semibold text-slate-600">
                E-mail
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full bg-transparent text-slate-700 outline-none"
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
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 w-full text-center text-sm font-medium text-slate-400 hover:text-sky-500"
          >
            Voltar para login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage