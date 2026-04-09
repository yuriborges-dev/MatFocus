import { BrowserRouter, Route, Routes } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import DashboardPage from "../pages/DashboardPage"
import ActivitiesPage from "../pages/ActivitiesPage"
import ProgressPage from "../pages/ProgressPage"
import DifficultyPage from "../pages/DifficultyPage"
import LevelPathPage from "../pages/LevelPathPage"
import ExercisePage from "../pages/ExercisePage"
import ActivityResultPage from "../pages/ActivityResultPage"
import ProfilePage from "../pages/ProfilePage"
import SettingsPage from "../pages/SettingsPage"
import AboutPage from "../pages/AboutPage"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/atividades" element={<ActivitiesPage />} />
        <Route path="/atividades/:conteudo" element={<DifficultyPage />} />
        <Route path="/atividades/:conteudo/:nivel" element={<LevelPathPage />} />
        <Route path="/atividades/:conteudo/:nivel/fase/:fase" element={<ExercisePage />}/>
        <Route path="/atividades/:conteudo/:nivel/fase/:phaseId/resultado" element={<ActivityResultPage />}/>
        <Route path="/progresso" element={<ProgressPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/sobre" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes