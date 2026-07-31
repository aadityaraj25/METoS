import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const steps = [
  {
    n: "01",
    title: "Create your profile",
    desc: "Share your skills, interests, and hackathon goals. Let the right people find you.",
    accent: "#2E5EAA",
    accentBg: "rgba(46,94,170,0.08)",
  },
  {
    n: "02",
    title: "Browse open problems",
    desc: "Explore real challenges posted by builders. Filter by domain, skill need, or team size.",
    accent: "#E2A63B",
    accentBg: "rgba(226,166,59,0.10)",
  },
  {
    n: "03",
    title: "Connect and ship",
    desc: "Send a connection request, join a group workspace, and start building immediately.",
    accent: "#1E9C86",
    accentBg: "rgba(30,156,134,0.10)",
  },
];

const stats = [
  { value: "1,240+",  label: "Builders registered" },
  { value: "86",      label: "Active problems" },
  { value: "310",     label: "Teams formed" },
  { value: "SIH 2026", label: "Target hackathon" },
];

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E5EAA" strokeWidth="2">
        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
      </svg>
    ),
    title: "Skill-based matching",
    desc: "The feed surfaces builders and problems based on your skill stack, not just keywords.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E9C86" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Team workspaces",
    desc: "Every group gets a shared workspace with a kanban board, message thread, and roster.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E2A63B" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Idea validation",
    desc: "Post a problem statement, gather interest, and validate your approach before committing.",
  },
];

/* ─── Styles ─── */
const NAV_H = 57; // px — approximate nav height

const s = {
  page: {
    fontFamily: "'Inter', sans-serif",
    color: "#161B2C",
    background:
      "radial-gradient(circle at 1px 1px, rgba(46,94,170,0.10) 1px, transparent 0) 0 0/24px 24px, #EEF1F6",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    height: NAV_H,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 48px",
    background: "rgba(238,241,246,0.90)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #D7DCE6",
    boxSizing: "border-box",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    color: "#161B2C",
  },
  navLinks: { display: "flex", gap: 32 },
  navLink: { fontSize: 14, fontWeight: 500, color: "#5B6478", textDecoration: "none" },
  btnGhost: {
    fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
    border: "1px solid #D7DCE6", color: "#161B2C", background: "transparent", textDecoration: "none",
  },
  btnPrimary: {
    fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
    border: "1px solid #2E5EAA", color: "#FFFFFF", background: "#2E5EAA", textDecoration: "none",
  },

  /* First screen wrapper — exactly fills what remains after the nav */
  firstScreen: {
    height: `calc(100vh - ${NAV_H}px)`,
    display: "flex",
    flexDirection: "column",
  },

  /* Hero — grows to push stats to the bottom */
  hero: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    padding: "0 48px",
    boxSizing: "border-box",
  },
  heroDecor: {
    position: "absolute",
    top: 40,
    right: 48,
    pointerEvents: "none",
  },
  heroInner: { maxWidth: 640, position: "relative", zIndex: 1 },
  heroBadge: {
    display: "inline-block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, fontWeight: 500,
    textTransform: "uppercase", letterSpacing: "0.1em",
    color: "#2E5EAA",
    background: "rgba(46,94,170,0.10)",
    border: "1px solid rgba(46,94,170,0.20)",
    borderRadius: 999,
    padding: "4px 12px",
    marginBottom: 24,
  },
  heroH1: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 52, fontWeight: 700,
    lineHeight: 1.15, letterSpacing: "-0.02em",
    color: "#161B2C", margin: 0,
  },
  heroSub: {
    fontSize: 16, lineHeight: 1.75, color: "#5B6478",
    marginTop: 20, maxWidth: 520,
  },
  heroCta: {
    display: "inline-flex", alignItems: "center",
    padding: "12px 28px", borderRadius: 10,
    background: "#2E5EAA", color: "#FFFFFF",
    fontWeight: 600, fontSize: 14, textDecoration: "none",
    border: "1px solid #2E5EAA",
  },
  heroCtaOutline: {
    display: "inline-flex", alignItems: "center",
    padding: "12px 28px", borderRadius: 10,
    background: "#FFFFFF", color: "#161B2C",
    fontWeight: 600, fontSize: 14, textDecoration: "none",
    border: "1px solid #D7DCE6",
  },

  /* Stats band — pinned at the bottom of the first screen */
  statsBand: {
    display: "flex",
    borderTop: "1px solid #D7DCE6",
    borderBottom: "1px solid #D7DCE6",
    background: "#FFFFFF",
    flexShrink: 0,
  },
  statBox: {
    flex: 1,
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "24px 0",
    borderRight: "1px solid #D7DCE6",
  },
  statVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 26, fontWeight: 600,
    color: "#1F3E77", lineHeight: 1, marginBottom: 6,
  },
  statLbl: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, textTransform: "uppercase",
    letterSpacing: "0.07em", color: "#5B6478",
  },

  section: {
    background:
      "radial-gradient(circle at 1px 1px, rgba(46,94,170,0.07) 1px, transparent 0) 0 0/24px 24px, #EEF1F6",
    padding: "80px 48px",
  },
  sectionInner: { maxWidth: 1100, margin: "0 auto" },
  sectionEyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.1em",
    color: "#2E5EAA", marginBottom: 10, marginTop: 0,
  },
  sectionH2: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 34, fontWeight: 700,
    letterSpacing: "-0.02em", color: "#161B2C",
    marginTop: 0, marginBottom: 48,
  },

  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  stepCard: { background: "#FFFFFF", border: "1px solid #D7DCE6", borderRadius: 14, padding: 28 },
  stepNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
    borderRadius: 8, display: "inline-block",
    padding: "4px 10px", marginBottom: 18,
  },
  stepTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 17, fontWeight: 600, color: "#161B2C",
    marginTop: 0, marginBottom: 10,
  },
  stepDesc: { fontSize: 13.5, lineHeight: 1.65, color: "#5B6478", margin: 0 },

  featGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  featCard: { background: "#EEF1F6", border: "1px solid #D7DCE6", borderRadius: 14, padding: 28 },
  featIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: "#FFFFFF", border: "1px solid #D7DCE6",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 18,
  },
  featTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 16, fontWeight: 600, color: "#161B2C",
    marginTop: 0, marginBottom: 8,
  },
  featDesc: { fontSize: 13.5, lineHeight: 1.65, color: "#5B6478", margin: 0 },

  ctaBanner: { background: "#1F3E77", padding: "80px 48px", textAlign: "center" },
  ctaBannerBtn: {
    display: "inline-flex", padding: "12px 32px", borderRadius: 10,
    background: "#FFFFFF", color: "#1F3E77",
    fontWeight: 700, fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    textDecoration: "none", border: "none", cursor: "pointer",
  },

  footer: {
    display: "flex", alignItems: "center", justifyContent: "center",
    flexWrap: "wrap", gap: 16,
    padding: "24px 48px",
    background: "#FFFFFF",
    borderTop: "1px solid #D7DCE6",
  },
};

export default function Landing() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // wait for auth state before rendering landing
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={s.page}>
      {/* ── Sticky nav ── */}
      <header style={s.nav}>
        <div style={s.logo}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6"  cy="6"  r="3" fill="#2E5EAA" />
            <circle cx="20" cy="6"  r="3" fill="#E2A63B" />
            <circle cx="13" cy="20" r="3" fill="#1E9C86" />
            <path d="M8.5 7.5L11 17.5M17.5 7.5L15 17.5" stroke="#161B2C" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>
            METoS
          </span>
        </div>
        <nav style={s.navLinks}>
          <a href="#how"      style={s.navLink}>How it works</a>
          <a href="#features" style={s.navLink}>Features</a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/login"    style={s.btnGhost}>Log in</Link>
          <Link to="/register" style={s.btnPrimary}>Sign up free</Link>
        </div>
      </header>

      {/* ── First screen: hero fills remaining height, stats pinned at bottom ── */}
      <div style={s.firstScreen}>

        {/* Hero — flex: 1 so it expands to push stats down */}
        <section style={s.hero}>
          <div style={s.heroDecor}>
            <svg width="320" height="200" viewBox="0 0 320 200" fill="none" opacity="0.35">
              <path className="wire-dash" d="M10 160 Q80 60 160 100 T310 40"
                stroke="#2E5EAA" strokeWidth="1.4" fill="none" strokeDasharray="6 6" />
              <path className="wire-dash" d="M10 160 Q80 190 160 100"
                stroke="#1E9C86" strokeWidth="1.4" fill="none" strokeDasharray="6 6" />
              <circle cx="10"  cy="160" r="5" fill="#5B6478" />
              <circle cx="160" cy="100" r="5" fill="#2E5EAA" />
              <circle cx="310" cy="40"  r="5" fill="#E2A63B" />
              <circle cx="80"  cy="190" r="3" fill="#1E9C86" />
            </svg>
          </div>

          <div style={s.heroInner}>
            <span style={s.heroBadge}>Smart India Hackathon 2026</span>
            <h1 style={s.heroH1}>
              Find the perfect team match<br />
              <span style={{ color: "#2E5EAA" }}>for your hackathon idea.</span>
            </h1>
            <p style={s.heroSub}>
              METoS connects builders, designers, and domain experts — so you spend less time
              searching and more time shipping.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 36 }}>
              <Link to="/register" style={s.heroCta}>Get started</Link>
              <a href="#how" style={s.heroCtaOutline}>See how it works</a>
            </div>
          </div>
        </section>

        {/* Stats band — always visible at bottom of first screen */}
        <div style={s.statsBand}>
          {stats.map((st) => (
            <div key={st.label} style={s.statBox}>
              <span style={s.statVal}>{st.value}</span>
              <span style={s.statLbl}>{st.label}</span>
            </div>
          ))}
        </div>

      </div>{/* end first screen */}

      {/* ── Sections below the fold ── */}

      <section id="how" style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>How it works</p>
          <h2 style={s.sectionH2}>Three steps to your dream team</h2>
          <div style={s.stepsGrid}>
            {steps.map((step) => (
              <div key={step.n} style={s.stepCard}>
                <div style={{ ...s.stepNum, color: step.accent, background: step.accentBg }}>
                  {step.n}
                </div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={{ ...s.section, background: "#FFFFFF" }}>
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>Platform features</p>
          <h2 style={s.sectionH2}>Everything a hackathon team needs</h2>
          <div style={s.featGrid}>
            {features.map((f) => (
              <div key={f.title} style={s.featCard}>
                <div style={s.featIcon}>{f.icon}</div>
                <h3 style={s.featTitle}>{f.title}</h3>
                <p style={s.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={s.ctaBanner}>
        <div style={s.sectionInner}>
          <h2 style={{ ...s.sectionH2, color: "#FFFFFF", marginBottom: 12 }}>
            Ready to find your team?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
            Join hundreds of builders already on METoS preparing for SIH 2026.
          </p>
          <Link to="/register" style={s.ctaBannerBtn}>Create your profile</Link>
        </div>
      </section>

      <footer style={s.footer}>
        <p style={{ fontSize: 12, color: "#5B6478", margin: 0 }}>
          Made for Smart India Hackathon teams. Minimal, fast, and ready for collaboration.
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @media (prefers-reduced-motion: no-preference) {
          .wire-dash { stroke-dasharray: 6 6; animation: dashflow 6s linear infinite; }
        }
        @keyframes dashflow { to { stroke-dashoffset: -120; } }
      `}</style>
    </div>
  );
}
