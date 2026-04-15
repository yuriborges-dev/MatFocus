import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import { useAuth } from "../contexts/AuthContext"

type SexOption = "M" | "F" | "O"
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      updateStudentData({
        full_name: formData.nome.trim(),
        username: formData.usuario.trim(),
        age: Number(formData.idade),
        school_grade: formData.serie,
        sex: formData.genero,
        guardian_name: formData.responsavel.trim(),
      })

      alert("Perfil salvo com sucesso!")
      navigate("/perfil")
    } catch (error) {
      console.error(error)
      alert("Não foi possível salvar as alterações.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppLayout showProfileCard={false}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Editar Perfil
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Atualize suas informações
          </p>
        </header>

        <section className="overflow-hidden rounded-[2rem] bg-white shadow-md">
          <div className="relative h-[320px] w-full bg-gradient-to-r from-[#4a90d9] to-[#67ace8]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/20 text-6xl shadow-sm backdrop-blur-sm">
                👦🏽
              </div>
            </div>
          </div>

          <div className="px-7 py-8 md:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900">
                {formData.nome || "Aluno"}
              </h2>
              <p className="mt-1 text-lg text-slate-400">
                {getGradeLabel(formData.serie)} •{" "}
                {formData.idade ? `${formData.idade} anos` : "-"}
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Informações gerais
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Edite os dados pessoais do aluno
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 px-5 py-4">
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
                      className="w-full border-none bg-transparent text-2xl font-semibold text-slate-800 outline-none"
                    />
                  </div>

                  <div className="rounded-3xl bg-slate-50 px-5 py-4">
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
                      className="w-full border-none bg-transparent text-2xl font-semibold text-slate-800 outline-none"
                    />
                  </div>

                  <div className="rounded-3xl bg-slate-50 px-5 py-4">
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
                      className="w-full bg-transparent text-2xl font-semibold text-slate-800 outline-none"
                    >
                      <option value="3">3º ano</option>
                      <option value="4">4º ano</option>
                      <option value="5">5º ano</option>
                      <option value="6">6º ano</option>
                    </select>
                  </div>

                  <div className="rounded-3xl bg-slate-50 px-5 py-4">
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
                      className="w-full bg-transparent text-2xl font-semibold text-slate-800 outline-none"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="O">Outro</option>
                    </select>
                  </div>

                  <div className="rounded-3xl bg-slate-50 px-5 py-4 md:col-span-2">
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
                      className="w-full border-none bg-transparent text-2xl font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-slate-800">
                    Dados de acesso
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Altere o nome de usuário e a senha, se necessário
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 px-5 py-4">
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
                      className="w-full border-none bg-transparent text-2xl font-semibold text-slate-800 outline-none"
                    />
                  </div>

                  <div className="rounded-3xl bg-slate-50 px-5 py-4">
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
                        className="w-full border-none bg-transparent text-2xl font-semibold text-slate-800 outline-none placeholder:text-slate-300"
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
                    <div className="rounded-3xl bg-slate-50 px-5 py-4 md:col-span-2">
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
                          className="w-full border-none bg-transparent text-2xl font-semibold text-slate-800 outline-none placeholder:text-slate-300"
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

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/perfil")}
                className="flex w-full items-center justify-center gap-2 rounded-[1.4rem] border border-slate-200 bg-white px-6 py-5 text-lg font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-3 rounded-[1.4rem] bg-[#4a90d9] px-6 py-5 text-lg font-bold text-white shadow-sm transition hover:bg-[#3f84cc] disabled:cursor-not-allowed disabled:opacity-70"
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