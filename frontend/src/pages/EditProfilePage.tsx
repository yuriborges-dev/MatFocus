import { ArrowLeft, Eye, EyeOff, Save, Trash2, Upload } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import { useAuth } from "../contexts/AuthContext"
import { updateMe } from "../services/auth"
import defaultProfile from "../assets/default_profile.jpg"

type SexOption = "M" | "F"
type GradeOption = "3" | "4" | "5" | "6"

function getGradeLabel(value: string) {
  if (value === "3") return "3º ano"
  if (value === "4") return "4º ano"
  if (value === "5") return "5º ano"
  if (value === "6") return "6º ano"
  return "-"
}

function EditProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { student, updateStudentData } = useAuth()

  const initialData = useMemo(
    () => ({
      nome: student?.full_name || "",
      idade: student?.age ? String(student.age) : "",
      serie: (student?.school_grade as GradeOption | undefined) || "6",
      genero: (student?.sex as SexOption | undefined) || "M",
      responsavel: student?.guardian_name || "",
      usuario: student?.username || "",
      senha: "",
      confirmarSenha: "",
    }),
    [student]
  )

  const [formData, setFormData] = useState(initialData)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    student?.profile_photo || null
  )
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null | undefined>(
    undefined
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [isToastLeaving, setIsToastLeaving] = useState(false)

  useEffect(() => {
    setFormData(initialData)
    setProfilePhotoPreview(student?.profile_photo || null)
    setProfilePhotoFile(undefined)
  }, [initialData, student?.profile_photo])

  const isChangingPassword = formData.senha.trim().length > 0

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "senha" && value.trim() === ""
        ? { confirmarSenha: "" }
        : {}),
    }))
  }

  function handleSelectPhoto() {
    fileInputRef.current?.click()
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.")
      return
    }

    setProfilePhotoFile(file)

    const previewUrl = URL.createObjectURL(file)
    setProfilePhotoPreview(previewUrl)
  }

  function handleRemovePhoto() {
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

  async function handleSave() {
    if (!formData.nome.trim()) {
      alert("Preencha o nome.")
      return
    }

    if (!formData.usuario.trim()) {
      alert("Preencha o nome de usuário.")
      return
    }

    if (!formData.idade.trim()) {
      alert("Preencha a idade.")
      return
    }

    if (isChangingPassword && formData.senha !== formData.confirmarSenha) {
      alert("As senhas não coincidem.")
      return
    }

    setIsSaving(true)

    try {
      const updatedStudent = await updateMe({
        full_name: formData.nome.trim(),
        username: formData.usuario.trim(),
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

      triggerSuccessToast()

      setTimeout(() => {
        navigate("/perfil")
      }, 2800)
    } catch (error) {
      console.error(error)
      alert("Não foi possível salvar as alterações.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout showProfileCard={false}>
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
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 rounded-2xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700 sm:px-3"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

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
                  className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Upload className="h-4 w-4" />
                  Alterar foto
                </button>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-red-500 shadow-sm transition hover:bg-red-50"
                >
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
                  <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4">
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
                  </div>

                  <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4">
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
                      <option value="O">Outro</option>
                    </select>
                  </div>

                  <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4 md:col-span-2">
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
                  <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4">
                    <label
                      htmlFor="usuario"
                      className="mb-2 block text-sm text-slate-400"
                    >
                      Nome de usuário
                    </label>
                    <input
                      id="usuario"
                      name="usuario"
                      type="text"
                      value={formData.usuario}
                      onChange={handleChange}
                      className="w-full border-none bg-transparent text-xl font-semibold text-slate-800 outline-none sm:text-2xl"
                    />
                  </div>

                  <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4">
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

                  {isChangingPassword && (
                    <div className="rounded-[1.8rem] bg-slate-50 px-5 py-4 md:col-span-2">
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
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:mt-8 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="flex w-full items-center justify-center gap-2 rounded-[1.4rem] border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-600 transition hover:bg-slate-50 sm:py-5 sm:text-lg"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-3 rounded-[1.4rem] bg-[#4a90d9] px-6 py-4 text-base font-bold text-white shadow-sm transition hover:bg-[#3f84cc] disabled:cursor-not-allowed disabled:opacity-70 sm:py-5 sm:text-lg"
              >
                <Save className="h-5 w-5" />
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default EditProfilePage