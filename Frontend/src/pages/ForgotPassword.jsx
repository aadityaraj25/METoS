import { useState } from "react";
import { Link } from "react-router-dom";
import * as authApi from "../api/auth.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to send reset link.");
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
          <span style={styles.navHint}>Remember your password?</span>
          <Link to="/login" style={styles.btnOutline}>Log in</Link>
        </div>
      </header>

      {/* Auth card */}
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={styles.eyebrow}>Recovery</p>
          <h1 style={styles.heading}>Reset your password</h1>

          <div style={styles.formBox}>
            {error && <div style={styles.errorBox}>{error}</div>}
            
            {success ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1E9C86" strokeWidth="2" style={{ marginBottom: 16 }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h3 style={{ margin: "0 0 8px 0", color: "#161B2C", fontFamily: "'Space Grotesk', sans-serif" }}>Check your inbox</h3>
                <p style={{ color: "#5B6478", fontSize: 14, margin: 0 }}>
                  We've sent a password reset link to <strong>{email}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={styles.field}>
                  <label htmlFor="reset-email" style={styles.label}>Email address</label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    style={styles.input}
                  />
                </div>

                <button
                  id="reset-submit"
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
                      Sending…
                    </>
                  ) : "Send reset link"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        Made for Smart India Hackathon teams. Minimal, fast, and ready for collaboration.
      </footer>

      <style>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        #reset-submit:hover:not(:disabled) { background: #1F3E77 !important; }
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
  footer: {
    textAlign: "center",
    padding: "20px 16px",
    fontSize: 12,
    color: "#5B6478",
    borderTop: "1px solid #D7DCE6",
  },
};
