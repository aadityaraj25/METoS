import TopNav from "@/components/TopNav";

const skills = [
  { name: "React", level: 4 },
  { name: "Node.js", level: 5 },
  { name: "System Design", level: 3 },
  { name: "PostgreSQL", level: 4 },
];

const projects = [
  {
    title: "River Watch Sensor Kit",
    desc: "Solar-powered water-level sensor + SMS alert pipeline for the Flood Alerts group.",
    chips: ["IoT", "Go"],
    grad: "linear-gradient(135deg,#2E5EAA,#1E9C86)",
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="10" cy="10" r="3" fill="#fff" opacity="0.8" />
        <circle cx="30" cy="14" r="3" fill="#fff" opacity="0.8" />
        <circle cx="20" cy="30" r="3" fill="#fff" opacity="0.8" />
        <path d="M10 10L20 30M30 14L20 30" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: "Dine-Predict",
    desc: "Demand-forecasting dashboard for campus dining halls, cutting prep waste ~18% in pilot.",
    chips: ["React", "Python"],
    grad: "linear-gradient(135deg,#E2A63B,#2E5EAA)",
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <rect x="8" y="8" width="10" height="10" fill="#fff" opacity="0.8" />
        <rect x="22" y="22" width="10" height="10" fill="#fff" opacity="0.8" />
        <path d="M18 13L22 27" stroke="#fff" strokeWidth="1.2" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: "Junction API",
    desc: "Public API powering the matching engine behind teammate suggestions.",
    chips: ["Node.js", "Postgres"],
    grad: "linear-gradient(135deg,#1E9C86,#5B6478)",
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="10" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.8" />
        <circle cx="20" cy="20" r="4" fill="#fff" opacity="0.8" />
      </svg>
    ),
  },
  {
    title: "Access-First Course Player",
    desc: "Screen-reader-native video player component for the EdTech accessibility group.",
    chips: ["React", "a11y"],
    grad: "linear-gradient(135deg,#7A5FBF,#2E5EAA)",
    svg: (
      <svg width="40" height="40" viewBox="0 0 40 40">
        <path d="M8 30L20 10L32 30Z" fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.8" />
      </svg>
    ),
  },
];

function ProfilePage() {
  return (
    <>
      <TopNav />
      <div className="profile-wrap">
        <div className="profile-header-card">
          <div className="avatar av-a avatar-xl">DR</div>
          <div className="profile-header-info">
            <h1>Devansh Rao</h1>
            <div className="role-line">Full-stack Developer · Delhi NCR · Building since 2021</div>
            <p className="bio">
              I build the backend nobody notices until it breaks — then ship the frontend so people forget it exists. Into
              IoT-for-good and anything with a real deadline attached.
            </p>
            <div className="profile-header-stats">
              <div><b>4</b><span>Projects</span></div>
              <div><b>128</b><span>Connections</span></div>
              <div><b>3</b><span>Groups</span></div>
            </div>
          </div>
          <div className="profile-header-actions">
            <button className="cta-btn outline">Edit profile</button>
            <button className="cta-btn">Share</button>
          </div>
        </div>

        <div className="profile-cols">
          <div>
            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginTop: 0 }}>Skills</div>
              {skills.map((s) => (
                <div className="skill-row" key={s.name}>
                  <span className="sname">{s.name}</span>
                  <div className="dots">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className={i < s.level ? "filled" : ""} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="section-label" style={{ marginTop: 0 }}>Projects</div>
              <div className="projects-grid">
                {projects.map((p) => (
                  <div key={p.title} className="project-card">
                    <div className="project-thumb" style={{ background: p.grad }}>{p.svg}</div>
                    <h4>{p.title}</h4>
                    <p>{p.desc}</p>
                    <div className="project-foot">
                      <div className="chips">
                        {p.chips.map((c) => <span key={c} className="chip">{c}</span>)}
                      </div>
                      <span className="project-link">View →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginTop: 0 }}>Groups</div>
              {[
                { name: "Flood alerts for river towns", meta: "Climate · 8 members", role: "Lead", cls: "lead" },
                { name: "Screen-reader course platform", meta: "Accessibility · 5 members", role: "Member", cls: "member" },
                { name: "Campus food-waste tracker", meta: "Sustainability · 6 members", role: "Member", cls: "member" },
              ].map((g) => (
                <div className="group-row" key={g.name}>
                  <div>
                    <h5>{g.name}</h5>
                    <div className="meta-line">{g.meta}</div>
                  </div>
                  <span className={`role-chip ${g.cls}`}>{g.role}</span>
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="section-label" style={{ marginTop: 0 }}>Connections · 128</div>
              <div className="connections-grid">
                {[
                  { av: "av-c", i: "PN", n: "Priya N.", r: "Designer" },
                  { av: "av-a", i: "AK", n: "Alex K.", r: "Backend" },
                  { av: "av-d", i: "MS", n: "Maria S.", r: "Data Sci." },
                  { av: "av-e", i: "JL", n: "Jordan L.", r: "Frontend" },
                ].map((c) => (
                  <div className="conn-mini" key={c.i}>
                    <div className={`avatar ${c.av}`} style={{ width: 30, height: 30, fontSize: 11 }}>{c.i}</div>
                    <div>
                      <h6>{c.n}</h6>
                      <p>{c.r}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="cta-btn ghost" style={{ width: "100%", marginTop: 14 }}>See all connections</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
