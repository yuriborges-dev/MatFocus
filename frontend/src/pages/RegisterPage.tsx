import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"

function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center">
        <img
          src={logoMatFocus}
          alt="Logo do MatFocus"
          className="mb-6 w-40 max-w-full object-contain"
        />

        <div className="w-full max-w-xl rounded-[2rem] bg-white px-8 py-9 shadow-xl">
          <form className="flex flex-col gap-5">
            <p className="mb-10 text-center text-2xl font-semibold text-slate-600">
                CADASTRO DE NOVO ALUNO
            </p>
            <div>
              <label
                htmlFor="studentName"
                className="mb-2 block text-xl font-semibold text-slate-600"
              >
                Nome do aluno
              </label>
              <input
                id="studentName"
                type="text"
                placeholder="Nome completo do aluno"
                className="w-full rounded-full border border-slate-300 px-5 py-3 text-lg text-slate-600 outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="age"
                  className="mb-2 block text-xl font-semibold text-slate-600"
                >
                  Idade
                </label>
                <input
                  id="age"
                  type="number"
                  placeholder="Ex: 9"
                  className="w-full rounded-full border border-slate-300 px-5 py-3 text-lg text-slate-600 outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="mb-2 block text-xl font-semibold text-slate-600"
                >
                  Sexo
                </label>

                <div className="relative">
                  <select
                    id="gender"
                    defaultValue=""
                    className="w-full appearance-none rounded-full border border-slate-300 px-5 py-3 pr-12 text-lg text-slate-600 outline-none focus:border-sky-400"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="grade"
                className="mb-2 block text-xl font-semibold text-slate-600"
              >
                Série escolar
              </label>

              <div className="relative">
                <select
                  id="grade"
                  defaultValue=""
                  className="w-full appearance-none rounded-full border border-slate-300 px-5 py-3 pr-12 text-lg text-slate-600 outline-none focus:border-sky-400"
                >
                  <option value="" disabled>
                    Selecione a série
                  </option>
                  <option value="1-ano">1º ano</option>
                  <option value="2-ano">2º ano</option>
                  <option value="3-ano">3º ano</option>
                  <option value="4-ano">4º ano</option>
                  <option value="5-ano">5º ano</option>
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="guardianName"
                className="mb-2 block text-xl font-semibold text-slate-600"
              >
                Nome do responsável
              </label>
              <input
                id="guardianName"
                type="text"
                placeholder="Nome do pai/mãe/responsável"
                className="w-full rounded-full border border-slate-300 px-5 py-3 text-lg text-slate-600 outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xl font-semibold text-slate-600"
              >
                Nome de usuário
              </label>
              <input
                id="username"
                type="text"
                placeholder="Ex: lucas123"
                className="w-full rounded-full border border-slate-300 px-5 py-3 text-lg text-slate-600 outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xl font-semibold text-slate-600"
              >
                Senha
              </label>

              <div className="flex items-center rounded-full border border-slate-300 px-5 py-3">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha"
                  className="w-full text-lg text-slate-600 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-3 text-slate-400"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  👁
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xl font-semibold text-slate-600"
              >
                Confirmar senha
              </label>

              <div className="flex items-center rounded-full border border-slate-300 px-5 py-3">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  className="w-full text-lg text-slate-600 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="ml-3 text-slate-400"
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  👁
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 rounded-[1.4rem] bg-[#79c6a1] px-6 py-4 text-2xl font-bold text-white shadow-md transition hover:brightness-105"
            >
              Cadastrar aluno
            </button>
          </form>

          <div className="mt-7 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-lg font-medium text-slate-400 transition hover:text-slate-500"
            >
              ← Voltar à seleção de perfil
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage