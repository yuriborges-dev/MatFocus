import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import mascotefoco from "../assets/mascote - login.png"
import { useAuth } from "../contexts/AuthContext"

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { loginUser } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      await loginUser({ username, password })
      navigate("/dashboard")
    } catch (err) {
      console.error(err)
      setError("Usuário ou senha inválidos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="relative flex min-h-[100dvh] w-full items-center justify-center bg-[#eef8fb] px-4 py-5 sm:px-5 sm:py-6 lg:px-0 lg:py-0">
        <div className="animate-auth-page relative flex w-full max-w-6xl overflow-hidden rounded-none bg-transparent shadow-none lg:h-[92vh] lg:rounded-[32px] lg:border lg:border-white/60 lg:bg-white/70 lg:shadow-[0_20px_60px_rgba(59,130,246,0.12)] lg:backdrop-blur-sm">
          <div className="hidden w-[44%] flex-col justify-between bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-300 p-10 text-white lg:flex">
            <div>
              <img
                src={logoMatFocus}
                alt="Logo do MatFocus"
                className="mb-4 w-36 object-contain drop-shadow-md"
              />

              <div className="mt-6 max-w-xs">
                <h1 className="text-3xl font-black leading-tight tracking-wide drop-shadow-md">
                  Aprender pode ser simples e divertido.
                </h1>
              </div>
            </div>

            <div className="mt-auto flex justify-center pt-6 pb-10">
              <img
                src={mascotefoco}
                alt="Mascote do MatFocus com elementos matemáticos"
                className="animate-mascot-in w-96 object-contain drop-shadow-[0_12px_30px_rgba(255,255,255,0.35)]"
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-center px-0 py-0 sm:px-2 lg:w-[56%] lg:px-12">
            <div className="w-full max-w-xl">
              <div className="mb-5 flex flex-col items-center justify-center lg:hidden">
                <img
                  src={logoMatFocus}
                  alt="Logo do MatFocus"
                  className="w-28 object-contain sm:w-32"
                />
              </div>

              <div className="rounded-[30px] bg-transparent px-1 py-1 shadow-none sm:px-2 lg:rounded-[32px] lg:border lg:border-slate-100 lg:bg-white/90 lg:px-8 lg:py-8 lg:shadow-[0_10px_40px_rgba(15,23,42,0.08)] lg:backdrop-blur-sm">
                <div className="mb-6 text-center sm:mb-7">
                  <h2 className="text-[2rem] font-extrabold tracking-tight text-slate-700 sm:text-[2.2rem] lg:text-3xl">
                    Faça login
                  </h2>

                  <p className="mt-2 text-[1rem] text-slate-400 sm:text-[1.05rem]">
                    Entre para continuar
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-[1.2rem] font-semibold text-slate-600 sm:text-lg"
                    >
                      Usuário
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                      <User size={20} className="shrink-0 text-slate-400" />

                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Digite seu usuário"
                        className="w-full bg-transparent text-[1rem] text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[1.2rem] font-semibold text-slate-600 sm:text-lg"
                    >
                      Senha
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                      <Lock size={20} className="shrink-0 text-slate-400" />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        className="w-full bg-transparent text-[1rem] text-slate-700 outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="shrink-0 text-slate-400 transition hover:text-sky-500"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
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
                    className="mt-2 rounded-2xl bg-sky-400 px-6 py-3.5 text-[1.3rem] font-bold text-white shadow-[0_10px_24px_rgba(56,189,248,0.28)] transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70 sm:py-4 sm:text-[1.4rem] lg:text-xl"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-2 text-center sm:mt-7">
                  <button
                    type="button"
                    className="text-[1rem] font-medium text-slate-400 transition hover:text-sky-500"
                  >
                    Esqueci minha senha
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/cadastro")}
                    className="text-[1rem] font-medium text-slate-400 transition hover:text-emerald-500"
                  >
                    Cadastrar novo aluno
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default LoginPage