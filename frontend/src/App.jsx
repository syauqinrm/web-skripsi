import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import DashboardPage from "./pages/DashboardPage";
import PredictionPage from "./pages/PredictionPage";
import ReportsPage from "./pages/ReportsPage";
import MainLayout from "./components/layout/MainLayout";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<WelcomePage />} />

        {/* Rute yang menggunakan MainLayout (dengan Sidebar dan Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/prediction" element={<PredictionPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
