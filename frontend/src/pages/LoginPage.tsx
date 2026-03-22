import { useState } from "react"
import AuthLayout from "../layouts/AuthLayout"
import logoMatFocus from "../assets/logo - matfocus.png"
import { useNavigate } from "react-router-dom"

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center">
        <img
          src={logoMatFocus}
          alt="Logo do MatFocus"
          className="mb-8 w-48 max-w-full object-contain"
        />

        <div className="w-full max-w-2xl rounded-3xl bg-white px-8 py-10 shadow-xl">
          <form className="flex flex-col gap-6">
            <p className="mb-10 text-center text-2xl font-semibold text-slate-600">
                FAÇA LOGIN PARA CONTINUAR
            </p>
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xl font-semibold text-slate-600"
              >
                Usuário
              </label>

              <input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
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
                  placeholder="Digite sua senha"
                  className="w-full text-lg text-slate-600 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-3 text-slate-400"
                >
                  👁
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 rounded-3xl bg-sky-400 px-6 py-4 text-2xl font-bold text-white shadow-md hover:bg-sky-500"
            >
              Entrar
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              className="text-lg font-medium text-slate-400 hover:text-slate-500"
            >
              Esqueci minha senha
            </button>
            <button
              type="button"
              onClick={() => navigate("/cadastro")}
              className="text-lg font-medium text-slate-400 hover:text-[#79c6a1]"
            >
              Cadastrar novo aluno
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}

export default LoginPage