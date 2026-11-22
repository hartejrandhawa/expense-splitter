import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/auth-context";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import "./App.css";

function PrivateRoute({ children }) {
  const { username } = useAuth();
  return username ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/groups"
        element={
          <PrivateRoute>
            <Groups />
          </PrivateRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <PrivateRoute>
            <GroupDetail />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/groups" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
