import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock } from "lucide-react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import { resetPassword } from "../services/auth"

function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email || ""
  const code = location.state?.code || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !code) {
      navigate("/recuperar-senha")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    try {
      setLoading(true)
      setError("")

      await resetPassword({
        email,
        code,
        password,
        confirm_password: confirmPassword,
      })

      navigate("/", {
        state: { passwordReset: true },
      })
    } catch {
      setError("Não foi possível redefinir a senha.")
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
            Nova senha
          </h1>

          <p className="mt-2 text-center text-sm text-slate-400">
            Crie uma nova senha para acessar sua conta.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <Lock className="h-5 w-5 text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova senha"
                className="w-full bg-transparent text-slate-700 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
              <Lock className="h-5 w-5 text-slate-400" />

              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nova senha"
                className="w-full bg-transparent text-slate-700 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-slate-400"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#79c6a1] px-6 py-3.5 text-lg font-bold text-white transition hover:brightness-105 disabled:opacity-70"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}

export default ResetPasswordPage