import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import mascotefoco from "../assets/mascote - login.png"

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate("/dashboard")
  }

  return (
    <AuthLayout>
      <div className="relative flex h-[92vh] w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/60 bg-white/70 shadow-[0_20px_60px_rgba(59,130,246,0.12)] backdrop-blur-sm">
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
              className="w-96 object-contain drop-shadow-[0_12px_30px_rgba(255,255,255,0.35)]"
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-6 py-6 sm:px-8 lg:w-[56%] lg:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-6 flex justify-center lg:hidden">
              <img
                src={logoMatFocus}
                alt="Logo do MatFocus"
                className="w-32 object-contain"
              />
            </div>

            <div className="rounded-[32px] border border-slate-100 bg-white/90 px-6 py-7 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:px-8">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-700">
                  Faça login
                </h2>
                <p className="mt-2 text-base text-slate-400">
                  Entre para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-lg font-semibold text-slate-600"
                  >
                    Usuário
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                    <User size={20} className="text-slate-400" />
                    <input
                      id="username"
                      type="text"
                      placeholder="Digite seu usuário"
                      className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-lg font-semibold text-slate-600"
                  >
                    Senha
                  </label>

                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                    <Lock size={20} className="text-slate-400" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 transition hover:text-sky-500"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 rounded-2xl bg-sky-400 px-6 py-3.5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(56,189,248,0.35)] transition hover:-translate-y-0.5 hover:bg-sky-500"
                >
                  Entrar
                </button>
              </form>

              <div className="mt-5 flex flex-col items-center gap-2 text-center">
                <button
                  type="button"
                  className="text-base font-medium text-slate-400 transition hover:text-sky-500"
                >
                  Esqueci minha senha
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/cadastro")}
                  className="text-base font-medium text-slate-400 transition hover:text-emerald-500"
                >
                  Cadastrar novo aluno
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default LoginPage