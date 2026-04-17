import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  User,
  Users,
} from "lucide-react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import mascotefoco from "../assets/mascote - login.png"
import { useAuth } from "../contexts/AuthContext"

function RegisterPage() {
  const navigate = useNavigate()
  const { registerUser } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    sex: "",
    school_grade: "",
    guardian_name: "",
    username: "",
    password: "",
    confirm_password: "",
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

      await registerUser({
        full_name: formData.full_name,
        age: Number(formData.age),
        sex: formData.sex as "M" | "F" | "O",
        school_grade: formData.school_grade as "3" | "4" | "5" | "6",
        guardian_name: formData.guardian_name,
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirm_password,
      })

      navigate("/dashboard")
    } catch (err: any) {
      console.error("Erro ao cadastrar:", err)

      const data = err?.response?.data

      if (typeof data?.detail === "string") {
        setError(data.detail)
      } else if (typeof data?.confirm_password?.[0] === "string") {
        setError(data.confirm_password[0])
      } else if (typeof data?.username?.[0] === "string") {
        setError(data.username[0])
      } else if (typeof data?.non_field_errors?.[0] === "string") {
        setError(data.non_field_errors[0])
      } else {
        setError("Não foi possível realizar o cadastro.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-6xl lg:flex lg:min-h-[92vh] lg:overflow-hidden lg:rounded-[36px] lg:border lg:border-white/60 lg:bg-white/70 lg:shadow-[0_20px_60px_rgba(59,130,246,0.12)] lg:backdrop-blur-sm">
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

        <div className="flex w-full flex-col items-center justify-center lg:w-[56%] lg:px-10">
          <div className="mb-4 flex justify-center lg:hidden">
            <img
              src={logoMatFocus}
              alt="Logo do MatFocus"
              className="w-28 object-contain sm:w-32"
            />
          </div>

          <div className="w-full max-w-xl rounded-[32px] border border-slate-100 bg-white/90 px-5 py-6 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:px-7 lg:max-h-[82vh] lg:overflow-y-auto">
            <div className="mb-5 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-700 sm:text-3xl">
                Novo aluno
              </h2>
              <p className="mt-2 text-base text-slate-400">
                Preencha para cadastrar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Nome do aluno
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                  <User size={20} className="text-slate-400" />
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Nome completo"
                    className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Ex: 9"
                      className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="sex"
                    className="mb-2 block text-lg font-semibold text-slate-600"
                  >
                    Sexo
                  </label>
                  <div className="relative">
                    <select
                      id="sex"
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-base text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white focus:shadow-sm"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="school_grade"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Série escolar
                </label>
                <div className="relative">
                  <select
                    id="school_grade"
                    name="school_grade"
                    value={formData.school_grade}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-base text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white focus:shadow-sm"
                  >
                    <option value="" disabled>
                      Selecione a série
                    </option>
                    <option value="3">3º ano</option>
                    <option value="4">4º ano</option>
                    <option value="5">5º ano</option>
                    <option value="6">6º ano</option>
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="guardian_name"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Responsável
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                  <Users size={20} className="text-slate-400" />
                  <input
                    id="guardian_name"
                    name="guardian_name"
                    type="text"
                    value={formData.guardian_name}
                    onChange={handleChange}
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
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
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
                  htmlFor="confirm_password"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Confirmar senha
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm">
                  <Lock size={20} className="text-slate-400" />
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
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

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-2xl bg-[#79c6a1] px-6 py-3.5 text-lg font-bold text-white shadow-[0_10px_24px_rgba(121,198,161,0.35)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 sm:text-xl"
              >
                {loading ? "Cadastrando..." : "Cadastrar aluno"}
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
    </AuthLayout>
  )
}

export default RegisterPage