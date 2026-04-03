import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  School,
  User,
  Users,
} from "lucide-react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import mascotefoco from "../assets/mascote - login.png"

function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
                Cadastre-se e veja como matemática pode ser divertido.
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

        <div className="flex w-full items-center justify-center px-5 py-5 sm:px-8 lg:w-[56%] lg:px-10">
          <div className="w-full max-w-xl">
            <div className="mb-4 flex justify-center lg:hidden">
              <img
                src={logoMatFocus}
                alt="Logo do MatFocus"
                className="w-28 object-contain"
              />
            </div>

            <div className="max-h-[82vh] overflow-y-auto rounded-[32px] border border-slate-100 bg-white/90 px-6 py-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:px-8">
              <div className="mb-5 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-700">
                  Novo aluno
                </h2>
                <p className="mt-2 text-base text-slate-400">
                  Preencha para cadastrar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="studentName"
                    className="mb-2 block text-lg font-semibold text-slate-600"
                  >
                    Nome do aluno
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                    <User size={20} className="text-slate-400" />
                    <input
                      id="studentName"
                      type="text"
                      placeholder="Nome completo"
                      className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="age"
                      className="mb-2 block text-lg font-semibold text-slate-600"
                    >
                      Idade
                    </label>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                      <input
                        id="age"
                        type="number"
                        placeholder="Ex: 9"
                        className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="mb-2 block text-lg font-semibold text-slate-600"
                    >
                      Sexo
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        defaultValue=""
                        className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-base text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white focus:shadow-sm"
                      >
                        <option value="" disabled>
                          Selecione
                        </option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outro">Outro</option>
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="grade"
                    className="mb-2 block text-lg font-semibold text-slate-600"
                  >
                    Série escolar
                  </label>
                  <div className="relative">
                    <select
                      id="grade"
                      defaultValue=""
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-base text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white focus:shadow-sm"
                    >
                      <option value="" disabled>
                        Selecione a série
                      </option>
                      <option value="1-ano">1º ano</option>
                      <option value="2-ano">2º ano</option>
                      <option value="3-ano">3º ano</option>
                      <option value="4-ano">4º ano</option>
                      <option value="5-ano">5º ano</option>
                      <option value="6-ano">6º ano</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="guardianName"
                    className="mb-2 block text-lg font-semibold text-slate-600"
                  >
                    Responsável
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                    <Users size={20} className="text-slate-400" />
                    <input
                      id="guardianName"
                      type="text"
                      placeholder="Nome do responsável"
                      className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

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
                      placeholder="Ex: lucas123"
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
                      placeholder="Crie uma senha"
                      className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-slate-400 transition hover:text-sky-500"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-lg font-semibold text-slate-600"
                  >
                    Confirmar senha
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                    <Lock size={20} className="text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-slate-400 transition hover:text-sky-500"
                      aria-label={
                        showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 rounded-2xl bg-[#79c6a1] px-6 py-3.5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(121,198,161,0.35)] transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  Cadastrar aluno
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-base font-medium text-slate-400 transition hover:text-sky-500"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage