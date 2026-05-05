import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
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
import EditProfilePage from "../pages/EditProfilePage"
import ProtectedRoute from "../components/ProtectedRoute"
import AchievementsPage from "../pages/AchievementsPage"
import ForgotPasswordPage from "../pages/ForgotPasswordPage"
import VerifyResetCodePage from "../pages/VerifyResetCodePage"
import ResetPasswordPage from "../pages/ResetPasswordPage"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route path="/recuperar-senha/codigo" element={<VerifyResetCodePage />} />
        <Route path="/recuperar-senha/nova-senha" element={<ResetPasswordPage />} />

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

        <Route 
          path="/perfil/editar" 
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/conquistas"
          element={
            <ProtectedRoute>
              <AchievementsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes