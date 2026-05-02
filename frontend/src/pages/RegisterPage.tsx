import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Eye, EyeOff, Lock, User, Users } from "lucide-react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import mascotefoco from "../assets/mascote - login.png"
import { useAuth } from "../contexts/AuthContext"
import { playClickSound, playSuccessSound } from "../utils/sound"

type FormData = {
  full_name: string
  age: string
  sex: string
  school_grade: string
  guardian_name: string
  username: string
  password: string
  confirm_password: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

function RegisterPage() {
  const navigate = useNavigate()
  const { registerUser } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    age: "",
    sex: "",
    school_grade: "",
    guardian_name: "",
    username: "",
    password: "",
    confirm_password: "",
  })

  function validateForm(data: FormData) {
    const errors: FormErrors = {}

    if (!data.full_name.trim()) {
      errors.full_name = "Informe o nome do aluno."
    }

    if (!data.age.trim()) {
      errors.age = "Informe a idade."
    } else if (Number(data.age) <= 0) {
      errors.age = "Informe uma idade válida."
    }

    if (!data.sex) {
      errors.sex = "Selecione o sexo."
    }

    if (!data.school_grade) {
      errors.school_grade = "Selecione a série escolar."
    }

    if (!data.guardian_name.trim()) {
      errors.guardian_name = "Informe o nome do responsável."
    }

    if (!data.username.trim()) {
      errors.username = "Informe um nome de usuário."
    }

    if (!data.password.trim()) {
      errors.password = "Informe uma senha."
    } else if (data.password.length < 4) {
      errors.password = "A senha deve ter pelo menos 4 caracteres."
    }

    if (!data.confirm_password.trim()) {
      errors.confirm_password = "Confirme a senha."
    } else if (data.password !== data.confirm_password) {
      errors.confirm_password = "As senhas não coincidem."
    }

    return errors
  }

  function traduzirErroSenha(message: string) {
    const lower = message.toLowerCase()

    if (lower.includes("too short") || lower.includes("muito curta")) {
      return "A senha deve ter pelo menos 8 caracteres."
    }

    if (
      lower.includes("entirely numeric") ||
      lower.includes("totalmente numérica")
    ) {
      return "A senha não pode conter apenas números."
    }

    if (lower.includes("too common") || lower.includes("muito comum")) {
      return "Escolha uma senha menos comum."
    }

    if (
      lower.includes("too similar") ||
      lower.includes("muito parecida")
    ) {
      return "A senha está muito parecida com os dados do aluno."
    }

    return "Senha inválida. Escolha uma senha mais segura."
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }))

    setError("")
  }

  function getFieldWrapperClass(fieldName: keyof FormData) {
    const hasError = Boolean(fieldErrors[fieldName])

    return `flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
      hasError
        ? "border-red-300 bg-red-50 focus-within:border-red-400"
        : "border-slate-200 bg-slate-50 focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-sm"
    }`
  }

  function getSelectClass(fieldName: keyof FormData) {
    const hasError = Boolean(fieldErrors[fieldName])

    return `w-full appearance-none rounded-2xl px-4 py-3 pr-12 text-base outline-none transition ${
      hasError
        ? "border border-red-300 bg-red-50 text-slate-700 focus:border-red-400"
        : "border border-slate-200 bg-slate-50 text-slate-700 focus:border-sky-300 focus:bg-white focus:shadow-sm"
    }`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setError("")
      return
    }

    try {
      setLoading(true)
      setError("")
      setFieldErrors({})

      await registerUser({
        full_name: formData.full_name.trim(),
        age: Number(formData.age),
        sex: formData.sex as "M" | "F",
        school_grade: formData.school_grade as "3" | "4" | "5" | "6",
        guardian_name: formData.guardian_name.trim(),
        username: formData.username.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      })

      playSuccessSound("medio")

      navigate("/dashboard")
    } catch (err: any) {
      console.error("Erro ao cadastrar:", err)

      const data = err?.response?.data

      if (typeof data?.full_name?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          full_name: "Verifique o nome do aluno.",
        }))
      }

      if (typeof data?.age?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          age: "Verifique a idade informada.",
        }))
      }

      if (typeof data?.sex?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          sex: "Selecione um sexo válido.",
        }))
      }

      if (typeof data?.school_grade?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          school_grade: "Selecione uma série válida.",
        }))
      }

      if (typeof data?.guardian_name?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          guardian_name: "Verifique o nome do responsável.",
        }))
      }

      if (typeof data?.username?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          username: "Este nome de usuário já está em uso.",
        }))
      }

      if (typeof data?.password?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          password: traduzirErroSenha(data.password[0]),
        }))
      }

      if (typeof data?.confirm_password?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          confirm_password: "As senhas não coincidem.",
        }))
      }

      if (typeof data?.detail === "string") {
        setError(data.detail)
      } else if (typeof data?.non_field_errors?.[0] === "string") {
        setError("Não foi possível concluir o cadastro. Verifique os dados.")
      } else {
        setError("Não foi possível realizar o cadastro.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="animate-auth-page w-full max-w-6xl lg:flex lg:min-h-[92vh] lg:overflow-hidden lg:rounded-[36px] lg:border lg:border-white/60 lg:bg-white/70 lg:shadow-[0_20px_60px_rgba(59,130,246,0.12)] lg:backdrop-blur-sm">
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
              className="animate-mascot-in w-96 object-contain drop-shadow-[0_12px_30px_rgba(255,255,255,0.35)]"
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

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="full_name"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Nome do aluno
                </label>
                <div className={getFieldWrapperClass("full_name")}>
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
                {fieldErrors.full_name && (
                  <p className="mt-2 text-sm font-medium text-red-500">
                    {fieldErrors.full_name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="age"
                    className="mb-2 block text-lg font-semibold text-slate-600"
                  >
                    Idade
                  </label>
                  <div className={getFieldWrapperClass("age")}>
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
                  {fieldErrors.age && (
                    <p className="mt-2 text-sm font-medium text-red-500">
                      {fieldErrors.age}
                    </p>
                  )}
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
                      className={getSelectClass("sex")}
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
                  {fieldErrors.sex && (
                    <p className="mt-2 text-sm font-medium text-red-500">
                      {fieldErrors.sex}
                    </p>
                  )}
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
                    className={getSelectClass("school_grade")}
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
                {fieldErrors.school_grade && (
                  <p className="mt-2 text-sm font-medium text-red-500">
                    {fieldErrors.school_grade}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="guardian_name"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Responsável
                </label>
                <div className={getFieldWrapperClass("guardian_name")}>
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
                {fieldErrors.guardian_name && (
                  <p className="mt-2 text-sm font-medium text-red-500">
                    {fieldErrors.guardian_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Usuário
                </label>
                <div className={getFieldWrapperClass("username")}>
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
                {fieldErrors.username && (
                  <p className="mt-2 text-sm font-medium text-red-500">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Senha
                </label>
                <div className={getFieldWrapperClass("password")}>
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
                {fieldErrors.password && (
                  <p className="mt-2 text-sm font-medium text-red-500">
                    {fieldErrors.password}
                  </p>
                )}
                <p className="mt-2 text-sm text-slate-400">
                  A senha deve ter pelo menos 8 caracteres e não pode conter apenas números.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="mb-2 block text-lg font-semibold text-slate-600"
                >
                  Confirmar senha
                </label>
                <div className={getFieldWrapperClass("confirm_password")}>
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
                {fieldErrors.confirm_password && (
                  <p className="mt-2 text-sm font-medium text-red-500">
                    {fieldErrors.confirm_password}
                  </p>
                )}
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
                onClick={() => {
                  playClickSound("medio")
                  navigate("/")
                }}
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