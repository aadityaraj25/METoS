import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Wraps private routes. While the session is being restored (loading = true)
 * renders nothing to avoid a flash-redirect. Once loaded, redirects to /login
 * if there is no authenticated user.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Minimal full-screen loader — keeps the dot-grid background consistent
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 1px 1px, rgba(46,94,170,0.10) 1px, transparent 0) 0 0/24px 24px, #EEF1F6",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
        color: "#5B6478",
        letterSpacing: "0.06em",
      }}>
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
