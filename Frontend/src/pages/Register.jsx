import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";

const SpinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B6478" strokeWidth="2.5" style={{ animation: "auth-spin 0.8s linear infinite" }}>
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);
const GreenCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E9C86" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const RedXIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SKILLS = ["Frontend", "Backend", "Mobile Dev", "Data Analysis", "Design", "ML / AI", "DevOps", "Research"];

export default function Register() {
  const navigate = useNavigate();
  const authCtx = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
    bio: "",
  });
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle|checking|available|taken
  const usernameTimer = useRef(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleSkill = (s) =>
    setSelectedSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const handleUsernameChange = (e) => {
    set("username")(e);
    const val = e.target.value.trim();
    clearTimeout(usernameTimer.current);
    if (!val || val.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    usernameTimer.current = setTimeout(async () => {
      try {
        const { data } = await authApi.checkUsername(val);
        setUsernameStatus(data.data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
  };

  const validateStep0 = () => {
    if (!form.name.trim()) return "Full name is required.";
    if (!form.username.trim() || form.username.length < 3) return "Username must be at least 3 characters.";
    if (usernameStatus === "taken") return "That username is already taken.";
    if (usernameStatus === "checking") return "Please wait for username check to complete.";
    if (!form.email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Please enter a valid email.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleNext = () => {
    const err = validateStep0();
    if (err) { setError(err); return; }
    setError("");
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Register
      await authApi.register({
        username: form.username,
        fullName: form.name,
        email: form.email,
        password: form.password,
      });

      // 2. Login to get cookies and token
      const loginRes = await authApi.login({
        emailOrUsername: form.username,
        password: form.password,
      });

      // Set auth context so we have the token for the next request
      const { user, accessToken } = loginRes.data.data;
      authCtx.login({ user, accessToken });

      // 3. Update profile with extra info (skills, bio, college)
      const skills = selectedSkills.map((s) => ({ name: s, proficiency: 3 }));
      await authApi.updateProfile({
        bio: form.bio,
        skills,
        headline: form.college ? `Student at ${form.college}` : undefined,
      });

      // 4. Redirect
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = form.password.length >= 12 ? "strong" : form.password.length >= 8 ? "fair" : "weak";
  const pwColor = { strong: "#1E9C86", fair: "#8A611C", weak: "#c0392b" }[pwStrength];
  const pwWidth = { strong: "100%", fair: "66%", weak: "33%" }[pwStrength];

  const stepLabels = ["Account", "Profile"];

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
          <span style={styles.navHint}>Have an account?</span>
          <Link to="/login" style={styles.btnOutline}>Log in</Link>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <p style={styles.eyebrow}>Join METoS</p>
          <h1 style={styles.heading}>Create your account</h1>

          {/* Step indicator */}
          <div style={styles.steps}>
            {stepLabels.map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600,
                    flexShrink: 0,
                    background: i < step ? "#1E9C86" : i === step ? "#2E5EAA" : "#FFFFFF",
                    border: `2px solid ${i < step ? "#1E9C86" : i === step ? "#2E5EAA" : "#D7DCE6"}`,
                    color: i <= step ? "#fff" : "#5B6478",
                    transition: "all 0.2s",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span style={{
                    fontSize: 12.5, fontWeight: 500,
                    color: i === step ? "#161B2C" : "#5B6478",
                    whiteSpace: "nowrap",
                  }}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: "#D7DCE6", margin: "0 12px" }} />
                )}
              </div>
            ))}
          </div>

          <div style={styles.formBox}>
            {error && <div style={styles.errorBox}>{error}</div>}

            {step === 0 && (
              <div>
                <div style={styles.field}>
                  <label htmlFor="reg-name" style={styles.label}>Full name</label>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="What should we call you?"
                    value={form.name}
                    onChange={set("name")}
                    autoComplete="name"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label htmlFor="reg-username" style={styles.label}>Username</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="reg-username"
                      type="text"
                      placeholder="e.g. aditya25"
                      value={form.username}
                      onChange={handleUsernameChange}
                      autoComplete="username"
                      style={styles.input}
                    />
                    <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
                      {usernameStatus === "checking" && <SpinIcon />}
                      {usernameStatus === "available" && <GreenCheckIcon />}
                      {usernameStatus === "taken" && <RedXIcon />}
                    </div>
                  </div>
                  {usernameStatus === "taken" && (
                    <span style={{ fontSize: 11, color: "#c0392b", marginTop: 4, display: "block" }}>Username is already taken</span>
                  )}
                </div>

                <div style={styles.field}>
                  <label htmlFor="reg-email" style={styles.label}>Email address</label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label htmlFor="reg-password" style={styles.label}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={set("password")}
                      autoComplete="new-password"
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
                  {/* Strength bar */}
                  {form.password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 3, borderRadius: 2, background: "#D7DCE6", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          width: pwWidth, background: pwColor,
                          transition: "width 0.25s ease, background 0.25s ease",
                        }} />
                      </div>
                      <span style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", color: pwColor, marginTop: 4, display: "block" }}>
                        {pwStrength.charAt(0).toUpperCase() + pwStrength.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div style={styles.field}>
                  <label htmlFor="reg-confirm" style={styles.label}>Confirm password</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    autoComplete="new-password"
                    style={styles.input}
                  />
                </div>

                <button id="reg-next" type="button" onClick={handleNext} style={styles.btnPrimary}>
                  Continue →
                </button>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSubmit} noValidate>
                <div style={styles.field}>
                  <label htmlFor="reg-college" style={styles.label}>College / Institution</label>
                  <input
                    id="reg-college"
                    type="text"
                    placeholder="e.g. IIT Bombay"
                    value={form.college}
                    onChange={set("college")}
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label htmlFor="reg-bio" style={styles.label}>Short bio</label>
                  <textarea
                    id="reg-bio"
                    placeholder="What are you working on? What's your superpower?"
                    value={form.bio}
                    onChange={set("bio")}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Your skills</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {SKILLS.map((s) => (
                      <span
                        key={s}
                        onClick={() => toggleSkill(s)}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11.5,
                          padding: "4px 10px",
                          borderRadius: 6,
                          cursor: "pointer",
                          userSelect: "none",
                          transition: "all 0.12s ease",
                          background: selectedSkills.includes(s) ? "#2E5EAA" : "rgba(46,94,170,0.08)",
                          color: selectedSkills.includes(s) ? "#fff" : "#1F3E77",
                          border: `1px solid ${selectedSkills.includes(s) ? "#2E5EAA" : "rgba(46,94,170,0.14)"}`,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#5B6478", marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                    Pick at least one to help others find you.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => { setError(""); setStep(0); }}
                    style={styles.btnGhost}
                  >
                    Back
                  </button>
                  <button
                    id="reg-submit"
                    type="submit"
                    disabled={loading}
                    style={loading ? { ...styles.btnPrimary, flex: 2, opacity: 0.7 } : { ...styles.btnPrimary, flex: 2 }}
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
                        Creating account…
                      </>
                    ) : "Create account"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p style={styles.switchText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.switchLink}>Sign in →</Link>
          </p>
        </div>
      </main>

      <footer style={styles.footer}>
        Made for Smart India Hackathon teams. Minimal, fast, and ready for collaboration.
      </footer>

      <style>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        #reg-next:hover { background: #1F3E77 !important; }
        #reg-submit:hover:not(:disabled) { background: #1F3E77 !important; }
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
    maxWidth: 460,
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
    marginBottom: 24,
    marginTop: 0,
    color: "#161B2C",
  },
  steps: {
    display: "flex",
    alignItems: "center",
    marginBottom: 24,
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
  },
  textarea: {
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
    minHeight: 80,
    resize: "vertical",
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
  },
  btnPrimary: {
    width: "100%",
    padding: "11px 0",
    fontSize: 14,
    fontWeight: 600,
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
    boxSizing: "border-box",
  },
  btnGhost: {
    flex: 1,
    padding: "11px 0",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    color: "#5B6478",
    border: "1px solid #D7DCE6",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
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
