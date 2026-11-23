import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProtectedRoute from "./ProtectedRoute";
import Loading from "../components/Loading";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Categories from "../pages/Categories";
import Expenses from "../pages/Expenses";
import Children from "../pages/Children";
import ChildSummary from "../pages/ChildSummary";
import RequireAccess from "./RequireAccess";

// Rotas públicas não devem ser acessadas por quem já está logado.
function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <Register />
            </PublicOnly>
          }
        />

        {/* Rotas protegidas (compartilham o Layout com sidebar) */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <RequireAccess permission="expenses">
                <Dashboard />
              </RequireAccess>
            }
          />
          <Route
            path="/expenses"
            element={
              <RequireAccess permission="expenses">
                <Expenses />
              </RequireAccess>
            }
          />
          <Route path="/categories" element={<Categories />} />
          <Route
            path="/children"
            element={
              <RequireAccess ownerOnly>
                <Children />
              </RequireAccess>
            }
          />
          <Route
            path="/children/:id"
            element={
              <RequireAccess ownerOnly>
                <ChildSummary />
              </RequireAccess>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
