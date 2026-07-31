import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as authApi from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const authCtx = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.login({ emailOrUsername: identifier, password });
      authCtx.login(data.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top nav */}
      <header style={styles.nav}>
        <Link to="/" style={styles.logo}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6" cy="6" r="3" fill="#2E5EAA" />
            <circle cx="20" cy="6" r="3" fill="#E2A63B" />
            <circle cx="13" cy="20" r="3" fill="#1E9C86" />
            <path d="M8.5 7.5L11 17.5M17.5 7.5L15 17.5" stroke="#161B2C" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          METoS
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={styles.navHint}>No account?</span>
          <Link to="/register" style={styles.btnOutline}>Sign up</Link>
        </div>
      </header>

      {/* Auth card */}
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={styles.eyebrow}>Welcome back</p>
          <h1 style={styles.heading}>Log in to METoS</h1>

          {resetSuccess && (
            <div style={{ background: "rgba(30, 156, 134, 0.1)", border: "1px solid rgba(30, 156, 134, 0.3)", color: "#1E9C86", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px", textAlign: "center" }}>
              Password reset successfully. Please log in with your new password.
            </div>
          )}

          <div style={styles.formBox}>
            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div style={styles.field}>
                <label htmlFor="login-email" style={styles.label}>Email or username</label>
                <input
                  id="login-email"
                  type="text"
                  placeholder="you@example.com or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="login-password" style={styles.label}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ ...styles.input, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={styles.eyeBtn}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B6478" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B6478" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div style={{ textAlign: "right", marginTop: 6 }}>
                  <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={loading ? { ...styles.btnPrimary, opacity: 0.7 } : styles.btnPrimary}
              >
                {loading ? (
                  <>
                    <svg
                      width="15" height="15" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: "auth-spin 0.8s linear infinite", display: "block" }}
                    >
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Signing in…
                  </>
                ) : "Sign in"}
              </button>
            </form>
          </div>

          <p style={styles.switchText}>
            New to METoS?{" "}
            <Link to="/register" style={styles.switchLink}>Create an account →</Link>
          </p>
        </div>
      </main>

      <footer style={styles.footer}>
        Made for Smart India Hackathon teams. Minimal, fast, and ready for collaboration.
      </footer>

      <style>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        #login-submit:hover:not(:disabled) { background: #1F3E77 !important; }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
    background:
      "radial-gradient(circle at 1px 1px, rgba(46,94,170,0.10) 1px, transparent 0) 0 0/24px 24px, #EEF1F6",
    color: "#161B2C",
    boxSizing: "border-box",
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 32px",
    background: "rgba(238,241,246,0.88)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #D7DCE6",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 20,
    letterSpacing: "-0.02em",
    color: "#161B2C",
    textDecoration: "none",
  },
  navHint: {
    fontSize: 13,
    color: "#5B6478",
  },
  btnOutline: {
    fontSize: 13,
    fontWeight: 600,
    padding: "7px 16px",
    borderRadius: 8,
    border: "1px solid #2E5EAA",
    color: "#2E5EAA",
    background: "transparent",
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 420,
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#5B6478",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
    marginTop: 0,
  },
  heading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 26,
    fontWeight: 600,
    marginBottom: 28,
    marginTop: 0,
    color: "#161B2C",
  },
  formBox: {
    background: "#FFFFFF",
    border: "1px solid #D7DCE6",
    borderRadius: 16,
    padding: 28,
  },
  errorBox: {
    background: "rgba(226,59,59,0.08)",
    border: "1px solid rgba(226,59,59,0.25)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#c0392b",
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#5B6478",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    border: "1px solid #D7DCE6",
    borderRadius: 8,
    padding: "11px 14px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    color: "#161B2C",
    background: "#EEF1F6",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s, background 0.15s",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    color: "#5B6478",
  },
  forgotLink: {
    fontSize: 12,
    color: "#2E5EAA",
    fontFamily: "'JetBrains Mono', monospace",
    textDecoration: "none",
  },
  btnPrimary: {
    width: "100%",
    padding: "11px 0",
    fontSize: 14,
    fontWeight: 600,
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#2E5EAA",
    color: "#fff",
    border: "1px solid #2E5EAA",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    transition: "background 0.15s",
  },
  switchText: {
    textAlign: "center",
    fontSize: 13,
    color: "#5B6478",
    marginTop: 20,
  },
  switchLink: {
    color: "#2E5EAA",
    fontWeight: 600,
    textDecoration: "none",
  },
  footer: {
    textAlign: "center",
    padding: "20px 16px",
    fontSize: 12,
    color: "#5B6478",
    borderTop: "1px solid #D7DCE6",
  },
};
