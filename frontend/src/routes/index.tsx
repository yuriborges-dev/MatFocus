import { BrowserRouter, Route, Routes } from "react-router-dom"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import DashboardPage from "../pages/DashboardPage"
import ActivitiesPage from "../pages/ActivitiesPage"

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/atividades" element={<ActivitiesPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes