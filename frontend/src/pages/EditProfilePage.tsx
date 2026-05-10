import { Eye, EyeOff, Mail, Save, Trash2, Upload } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import BackButton from "../components/BackButton"
import AppLayout from "../layouts/AppLayout"
import { useAuth } from "../contexts/AuthContext"
import { getAnimationLevel, getPageAnimation, getCardAnimation } from "../utils/animation"
import { updateMe } from "../services/auth"
import defaultProfile from "../assets/default_profile.jpg"
import { playClickSound, playSuccessSound } from "../utils/sound"

type SexOption = "M" | "F"
type GradeOption = "3" | "4" | "5" | "6"

type FormData = {
  nome: string
  idade: string
  serie: GradeOption
  genero: SexOption
  responsavel: string
  usuario: string
  email: string
  senha: string
  confirmarSenha: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

function getGradeLabel(value: string) {
  if (value === "3") return "3º ano"
  if (value === "4") return "4º ano"
  if (value === "5") return "5º ano"
  if (value === "6") return "6º ano"
  return "-"
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

  if (lower.includes("too similar") || lower.includes("muito parecida")) {
    return "A senha está muito parecida com os dados do aluno."
  }

  return "Senha inválida. Escolha uma senha mais segura."
}

function EditProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { student, updateStudentData } = useAuth()
  const animationLevel = getAnimationLevel(student?.animation_level)

  const initialData = useMemo<FormData>(
    () => ({
      nome: student?.full_name || "",
      idade: student?.age ? String(student.age) : "",
      serie: (student?.school_grade as GradeOption | undefined) || "6",
      genero: (student?.sex as SexOption | undefined) || "M",
      responsavel: student?.guardian_name || "",
      usuario: student?.username || "",
      email: student?.email || "",
      senha: "",
      confirmarSenha: "",
    }),
    [student]
  )

  const [formData, setFormData] = useState<FormData>(initialData)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    student?.profile_photo || null
  )
  const [profilePhotoFile, setProfilePhotoFile] = useState<
    File | null | undefined
  >(undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [isToastLeaving, setIsToastLeaving] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})

  useEffect(() => {
    setFormData(initialData)
    setProfilePhotoPreview(student?.profile_photo || null)
    setProfilePhotoFile(undefined)
    setFieldErrors({})
    setError("")
  }, [initialData, student?.profile_photo])

  const isChangingPassword = formData.senha.trim().length > 0

  function validateForm(data: FormData) {
    const errors: FormErrors = {}

    if (!data.nome.trim()) {
      errors.nome = "Preencha o nome."
    }

    if (!data.usuario.trim()) {
      errors.usuario = "Preencha o nome de usuário."
    }

    if (!data.email.trim()) {
      errors.email = "Preencha o e-mail."
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Informe um e-mail válido."
    }

    if (!data.idade.trim()) {
      errors.idade = "Preencha a idade."
    } else if (Number(data.idade) <= 0) {
      errors.idade = "Informe uma idade válida."
    }

    if (!data.responsavel.trim()) {
      errors.responsavel = "Preencha o nome do responsável."
    }

    if (isChangingPassword) {
      if (data.senha.length < 8) {
        errors.senha = "A senha deve ter pelo menos 8 caracteres."
      }

      if (!data.confirmarSenha.trim()) {
        errors.confirmarSenha = "Confirme a nova senha."
      } else if (data.senha !== data.confirmarSenha) {
        errors.confirmarSenha = "As senhas não coincidem."
      }
    }

    return errors
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "senha" && value.trim() === "" ? { confirmarSenha: "" } : {}),
    }))

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }))

    if (name === "senha") {
      setFieldErrors((prev) => ({
        ...prev,
        senha: "",
        confirmarSenha: "",
      }))
    }

    setError("")
  }

  function handleSelectPhoto() {
    playClickSound(student?.sound_level)
    fileInputRef.current?.click()
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido.")
      return
    }

    setProfilePhotoFile(file)

    const previewUrl = URL.createObjectURL(file)
    setProfilePhotoPreview(previewUrl)
    setError("")
  }

  function handleRemovePhoto() {
    playClickSound(student?.sound_level)

    setProfilePhotoPreview(null)
    setProfilePhotoFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function triggerSuccessToast() {
    setShowSuccessToast(true)
    setIsToastLeaving(false)

    setTimeout(() => {
      setIsToastLeaving(true)
    }, 2200)

    setTimeout(() => {
      setShowSuccessToast(false)
      setIsToastLeaving(false)
    }, 2800)
  }

  function getFieldCardClass(fieldName: keyof FormData) {
    const hasError = Boolean(fieldErrors[fieldName])

    return `rounded-[1.8rem] px-5 py-4 ${
      hasError ? "border border-red-300 bg-red-50" : "bg-slate-50"
    }`
  }

  async function handleSave() {
    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setError("")
      return
    }

    setIsSaving(true)
    setError("")
    setFieldErrors({})

    try {
      const updatedStudent = await updateMe({
        full_name: formData.nome.trim(),
        username: formData.usuario.trim(),
        email: formData.email.trim(),
        age: Number(formData.idade),
        school_grade: formData.serie as GradeOption,
        sex: formData.genero as SexOption,
        guardian_name: formData.responsavel.trim(),
        ...(isChangingPassword ? { password: formData.senha } : {}),
        ...(profilePhotoFile !== undefined
          ? { profile_photo: profilePhotoFile }
          : {}),
      })

      updateStudentData(updatedStudent)

      playSuccessSound(student?.sound_level)

      triggerSuccessToast()

      setTimeout(() => {
        navigate("/perfil")
      }, 2800)
    } catch (err: any) {
      console.error(err)

      const data = err?.response?.data

      if (typeof data?.full_name?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          nome: "Verifique o nome informado.",
        }))
      }

      if (typeof data?.age?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          idade: "Verifique a idade informada.",
        }))
      }

      if (typeof data?.guardian_name?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          responsavel: "Verifique o nome do responsável.",
        }))
      }

      if (typeof data?.username?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          usuario: "Este nome de usuário já está em uso.",
        }))
      }

      if (typeof data?.email?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Este e-mail já está em uso.",
        }))
      }

      if (typeof data?.password?.[0] === "string") {
        setFieldErrors((prev) => ({
          ...prev,
          senha: traduzirErroSenha(data.password[0]),
        }))
      }

      if (typeof data?.detail === "string") {
        setError(data.detail)
      } else if (typeof data?.non_field_errors?.[0] === "string") {
        setError("Não foi possível salvar as alterações. Verifique os dados.")
      } else {
        setError("Não foi possível salvar as alterações.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout showProfileCard={false}>
      <div className={getPageAnimation(animationLevel)}>
        {showSuccessToast && (
          <div
            className={`fixed right-4 top-4 z-50 rounded-2xl bg-green-500 px-4 py-3 text-white shadow-lg transition-all duration-500 sm:right-6 sm:top-6 sm:px-5 sm:py-4 ${
              isToastLeaving
                ? "translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <p className="text-sm font-semibold">Alterações salvas com sucesso!</p>
          </div>
        )}

        <div className="mx-auto max-w-5xl">
          <header className="mb-5 sm:mb-6">
            <BackButton fallbackPath="/perfil" />

            <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Editar Perfil
            </h1>
            <p className="mt-1 text-sm text-slate-400 sm:mt-2 sm:text-base lg:text-lg">
              Atualize suas informações
            </p>
          </header>

          <section className="overflow-hidden rounded-[1.8rem] bg-white shadow-md sm:rounded-[2rem]">
            <div className="relative h-[250px] w-full bg-gradient-to-r from-[#4a90d9] to-[#67ace8] sm:h-[290px] lg:h-[320px]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white/20 shadow-sm backdrop-blur-sm sm:h-36 sm:w-36 lg:h-40 lg:w-40">
                  <img
                    src={profilePhotoPreview || defaultProfile}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleSelectPhoto}
                    className={`flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 ${getCardAnimation(animationLevel)}`}>
                    <Upload className="h-4 w-4" />
                    Alterar foto
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className={`flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-red-500 shadow-sm transition hover:bg-red-50 ${getCardAnimation(animationLevel)}`}>
                    <Trash2 className="h-4 w-4" />
                    Remover foto
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="px-5 py-6 sm:px-7 sm:py-7 md:px-8">
              <div className="mb-6 sm:mb-7">
                <h2 className="break-words text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
                  {formData.nome || "Aluno"}
                </h2>
                <p className="mt-1 text-base text-slate-400 sm:text-lg">
                  {getGradeLabel(formData.serie)} •{" "}
                  {formData.idade ? `${formData.idade} anos` : "-"}
                </p>
              </div>

              <div className="space-y-7 sm:space-y-8">
                <section>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 sm:text-2xl">
                      Informações gerais
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Edite os dados pessoais do aluno
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={getFieldCardClass("nome")}>
                      <label
                        htmlFor="nome"
                        className="mb-2 block text-sm text-slate-400"
                      >
                        Nome
                      </label>
                      <input
                        id="nome"
                        name="nome"
                        type="text"
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full border-none bg-transparent text-xl font-semibold text-slate-800 outline-none sm:text-2xl"
                      />
                      {fieldErrors.nome && (
                        <p className="mt-2 text-sm font-medium text-red-500">
                          {fieldErrors.nome}
                        </p>
                      )}
                    </div>

                    <div className={getFieldCardClass("idade")}>
                      <label
                        htmlFor="idade"
                        className="mb-2 block text-sm text-slate-400"
                      >
                        Idade
                      </label>
                      <input
                        id="idade"
                        name="idade"
                        type="number"
                        min={1}
                        value={formData.idade}
                        onChange={handleChange}
                        className="w-full border-none bg-transparent text-xl font-semibold text-slate-800 outline-none sm:text-2xl"
                      />
                      {fieldErrors.idade && (
                        <p className="mt-2 text-sm font-medium text-red-500">
                          {fieldErrors.idade}
                        </p>
                      )}
                    </div>

                    <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4">
                      <label
                        htmlFor="serie"
                        className="mb-2 block text-sm text-slate-400"
                      >
                        Série
                      </label>
                      <select
                        id="serie"
                        name="serie"
                        value={formData.serie}
                        onChange={handleChange}
                        className="w-full bg-transparent text-xl font-semibold text-slate-800 outline-none sm:text-2xl"
                      >
                        <option value="3">3º ano</option>
                        <option value="4">4º ano</option>
                        <option value="5">5º ano</option>
                        <option value="6">6º ano</option>
                      </select>
                    </div>

                    <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4">
                      <label
                        htmlFor="genero"
                        className="mb-2 block text-sm text-slate-400"
                      >
                        Gênero
                      </label>
                      <select
                        id="genero"
                        name="genero"
                        value={formData.genero}
                        onChange={handleChange}
                        className="w-full bg-transparent text-xl font-semibold text-slate-800 outline-none sm:text-2xl"
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    </div>

                    <div className={`${getFieldCardClass("responsavel")} md:col-span-2`}>
                      <label
                        htmlFor="responsavel"
                        className="mb-2 block text-sm text-slate-400"
                      >
                        Responsável
                      </label>
                      <input
                        id="responsavel"
                        name="responsavel"
                        type="text"
                        value={formData.responsavel}
                        onChange={handleChange}
                        className="w-full border-none bg-transparent text-xl font-semibold leading-snug text-slate-800 outline-none sm:text-2xl"
                      />
                      {fieldErrors.responsavel && (
                        <p className="mt-2 text-sm font-medium text-red-500">
                          {fieldErrors.responsavel}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 sm:text-2xl">
                      Dados de acesso
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Altere o nome de usuário e a senha, se necessário
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className={getFieldCardClass("usuario")}>
                        <label
                          htmlFor="usuario"
                          className="mb-2 block text-sm text-slate-400"
                        >
                          Nome de usuário
                        </label>

                        <div className="flex min-h-[34px] items-center gap-3">
                          <input
                            id="usuario"
                            name="usuario"
                            type="text"
                            value={formData.usuario}
                            onChange={handleChange}
                            className="w-full border-none bg-transparent text-xl font-semibold text-slate-800 outline-none sm:text-2xl"
                          />
                        </div>
                      </div>

                      {fieldErrors.usuario && (
                        <p className="mt-2 px-2 text-sm font-medium text-red-500">
                          {fieldErrors.usuario}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className={getFieldCardClass("email")}>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm text-slate-400"
                        >
                          E-mail do responsável
                        </label>

                        <div className="flex min-h-[34px] items-center gap-3">
                          <Mail className="h-5 w-5 text-slate-400" />

                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border-none bg-transparent text-xl font-semibold text-slate-800 outline-none sm:text-2xl"
                          />
                        </div>
                      </div>

                      {fieldErrors.email && (
                        <p className="mt-2 px-2 text-sm font-medium text-red-500">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="min-h-[120px]">
                      <div className={getFieldCardClass("senha")}>
                        <label
                          htmlFor="senha"
                          className="mb-2 block text-sm text-slate-400"
                        >
                          Nova senha
                        </label>

                        <div className="flex items-center gap-3">
                          <input
                            id="senha"
                            name="senha"
                            type={showPassword ? "text" : "password"}
                            value={formData.senha}
                            onChange={handleChange}
                            placeholder="Digite uma nova senha"
                            className="w-full border-none bg-transparent text-xl font-semibold text-slate-800 outline-none placeholder:text-slate-300 sm:text-2xl"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="text-slate-400 transition hover:text-slate-600"
                            aria-label={
                              showPassword ? "Ocultar senha" : "Mostrar senha"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {fieldErrors.senha ? (
                        <p className="mt-2 px-2 text-sm font-medium text-red-500">
                          {fieldErrors.senha}
                        </p>
                      ) : (
                        <p className="mt-2 px-2 text-sm text-slate-400">
                          A senha deve ter pelo menos 8 caracteres e não pode conter apenas números.
                        </p>
                      )}
                    </div>

                    {isChangingPassword && (
                      <div className="min-h-[120px]">
                        <div className={getFieldCardClass("confirmarSenha")}>
                          <label
                            htmlFor="confirmarSenha"
                            className="mb-2 block text-sm text-slate-400"
                          >
                            Confirmar nova senha
                          </label>

                          <div className="flex items-center gap-3">
                            <input
                              id="confirmarSenha"
                              name="confirmarSenha"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmarSenha}
                              onChange={handleChange}
                              placeholder="Confirme a nova senha"
                              className="w-full border-none bg-transparent text-xl font-semibold text-slate-800 outline-none placeholder:text-slate-300 sm:text-2xl"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                              }
                              className="text-slate-400 transition hover:text-slate-600"
                              aria-label={
                                showConfirmPassword
                                  ? "Ocultar confirmação de senha"
                                  : "Mostrar confirmação de senha"
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>

                          {fieldErrors.confirmarSenha && (
                            <p className="mt-2 text-sm font-medium text-red-500">
                              {fieldErrors.confirmarSenha}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-7 flex flex-col gap-4 sm:mt-8 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(student?.sound_level)
                    navigate("/perfil")
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-[1.4rem] border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-600 transition hover:bg-slate-50 sm:py-5 sm:text-lg ${getCardAnimation(animationLevel)}`}>
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex w-full items-center justify-center gap-3 rounded-[1.4rem] bg-[#4a90d9] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#3f84cc] disabled:cursor-not-allowed disabled:opacity-70 sm:py-5 sm:text-lg ${getCardAnimation(animationLevel)}`} 
                >
                  <Save className="h-5 w-5" />
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}

export default EditProfilePage