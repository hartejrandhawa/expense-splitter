import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/auth-context";
import ToastProvider from "./components/ToastProvider";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/group/GroupDetail";
import "./App.css";

function PrivateRoute({ children }) {
  const { username } = useAuth();
  return username ? children : <Navigate to="/login" replace />;
}

/** Logged-in users skip the login/register screens. */
function PublicOnlyRoute({ children }) {
  const { username } = useAuth();
  return username ? <Navigate to="/groups" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
      <Route path="/groups/:groupId" element={<PrivateRoute><GroupDetail /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/groups" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
