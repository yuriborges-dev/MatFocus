import { BrowserRouter, Route, Routes } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import DashboardPage from "../pages/DashboardPage"
import ActivitiesPage from "../pages/ActivitiesPage"
import ProgressPage from "../pages/ProgressPage"
import DifficultyPage from "../pages/DifficultyPage"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/atividades" element={<ActivitiesPage />} />
        <Route path="/atividades/:conteudo" element={<DifficultyPage />} />
        <Route
          path="/atividades/:conteudo/:nivel"
          element={<div className="p-10 text-2xl">Tela do nível</div>}
        />
        <Route path="/progresso" element={<ProgressPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes