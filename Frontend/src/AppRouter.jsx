import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Explore from "./pages/Explore.jsx";
import Profile from "./pages/Profile.jsx";
import CreateGroup from "./pages/CreateGroup.jsx";
import Workspace from "./pages/Workspace.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ErrorUrl from "./components/ErrorUrl.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages — no shared layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* App shell */}
        <Route element={<App />}>
          <Route index element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
          <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
          <Route path="*" element={<ErrorUrl />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
