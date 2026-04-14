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
import ProtectedRoute from "../components/ProtectedRoute"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/atividades"
          element={
            <ProtectedRoute>
              <ActivitiesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/atividades/:conteudo"
          element={
            <ProtectedRoute>
              <DifficultyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/atividades/:conteudo/:nivel"
          element={
            <ProtectedRoute>
              <LevelPathPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/atividades/:conteudo/:nivel/fase/:fase"
          element={
            <ProtectedRoute>
              <ExercisePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/atividades/:conteudo/:nivel/fase/:phaseId/resultado"
          element={
            <ProtectedRoute>
              <ActivityResultPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progresso"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sobre"
          element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes