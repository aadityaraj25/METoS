import { useState } from "react";
import TopNav from "@/components/TopNav";

const feed = [
  {
    kind: "problem",
    tag: "Sustainability",
    title: "Cutting campus food waste with smarter dining-hall data",
    desc: "Building a lightweight tracker so dining halls can predict demand instead of over-preparing. Early pilot data from two campuses already in hand.",
    members: [
      { initials: "AS", av: "av-b" },
      { initials: "MK", av: "av-c" },
      { initials: "RT", av: "av-d" },
    ],
    seatsMeta: "6 members · 2 seats open · needs Data Analysis, Mobile Dev",
    ctaLabel: "Request to join",
  },
  {
    kind: "person",
    name: "Priya Nandakumar",
    role: "Product Designer · 12 mutual connections",
    avatarInitials: "PN",
    avatarColor: "av-c",
    online: true,
    desc: "Designs systems, not screens. Currently shaping the onboarding flow for two early-stage climate startups.",
    skills: [
      { label: "Figma", className: "teal" },
      { label: "UX Research", className: "teal" },
      { label: "Design Systems", className: "teal" },
    ],
  },
  {
    kind: "problem",
    tag: "HealthTech",
    title: "Affordable prosthetics using open-source CAD",
    desc: "Adapting open hardware designs into a low-cost print-and-assemble kit for clinics with limited budgets.",
    members: [
      { initials: "HL", av: "av-a" },
      { initials: "JO", av: "av-e" },
    ],
    seatsMeta: "4 members · 3 seats open · needs CAD, Materials Science, Fundraising",
    ctaLabel: "Request to join",
  },
  {
    kind: "person",
    name: "Alex Kim",
    role: "Backend Engineer · 8 mutual connections",
    avatarInitials: "AK",
    avatarColor: "av-a",
    desc: "Six years building systems that stay up at 3am. Looking for a problem worth the pager duty.",
    skills: [{ label: "Go" }, { label: "PostgreSQL" }, { label: "System Design" }],
  },
  {
    kind: "problem",
    tag: "Climate",
    title: "Real-time flood alerts for rural river towns",
    desc: "Combining cheap water-level sensors with SMS alerts for towns without reliable internet. Hardware prototype already tested upstream.",
    members: [
      { initials: "DR", av: "av-c" },
      { initials: "TS", av: "av-b" },
      { initials: "NF", av: "av-d" },
    ],
    seatsMeta: "8 members · 1 seat open · needs IoT, GIS",
    ctaLabel: "You're in this group",
    ctaVariant: "ghost",
  },
  {
    kind: "person",
    name: "Maria Santos",
    role: "Data Scientist · 5 mutual connections",
    avatarInitials: "MS",
    avatarColor: "av-d",
    desc: "NLP and forecasting models, mostly for public-good projects. Free most evenings for pair-building.",
    skills: [{ label: "Python" }, { label: "ML" }, { label: "NLP" }],
  },
];

function ExplorePage() {
  const [filter, setFilter] = useState("all");
  const visible = feed.filter((f) => filter === "all" || f.kind === filter);

  return (
    <>
      <TopNav />

      <section>
        <div className="stats-band">
          <div className="stats-copy">
            <h1>Find people. Solve real problems. Ship together.</h1>
            <p>Your feed of active teammates and open problems — matched to what you can actually do.</p>
          </div>
          <div className="stats-numbers">
            <div className="stat"><b>1,240</b><span>Builders</span></div>
            <div className="stat"><b>86</b><span>Active problems</span></div>
            <div className="stat"><b>310</b><span>Teams formed</span></div>
          </div>
          <svg className="graph-svg" width="220" height="90" viewBox="0 0 220 90">
            <path className="wire-dash" d="M10 70 Q60 20 110 45 T210 20" stroke="#2E5EAA" strokeWidth="1.4" fill="none" />
            <path className="wire-dash" d="M10 70 Q60 90 110 45" stroke="#1E9C86" strokeWidth="1.4" fill="none" />
            <circle cx="10" cy="70" r="4" fill="#5B6478" />
            <circle cx="110" cy="45" r="4" fill="#2E5EAA" />
            <circle cx="210" cy="20" r="4" fill="#E2A63B" />
            <circle cx="60" cy="90" r="3" fill="#1E9C86" />
          </svg>
        </div>

        <div className="layout">
          <aside>
            <div className="panel profile-card">
              <div className="profile-top">
                <div className="avatar av-a" style={{ width: 52, height: 52, fontSize: 17 }}>DR</div>
                <div>
                  <h2>Devansh Rao</h2>
                  <p>Full-stack Developer · Delhi NCR</p>
                </div>
              </div>
              <div className="profile-stats">
                <div><b>4</b><span>Projects</span></div>
                <div><b>128</b><span>Connections</span></div>
                <div><b>3</b><span>Groups</span></div>
              </div>
              <div className="section-label">Your skills</div>
              <div className="chips">
                <span className="chip">React</span>
                <span className="chip">Node.js</span>
                <span className="chip">System Design</span>
                <span className="chip">PostgreSQL</span>
              </div>
              <div className="section-label">Your groups</div>
              <div className="trace">
                <div className="trace-item">
                  <h4>Flood alerts for river towns</h4>
                  <div className="bar"><div style={{ width: "60%" }} /></div>
                  <div className="meta"><span>Climate</span><span>60%</span></div>
                </div>
                <div className="trace-item">
                  <h4>Screen-reader course platform</h4>
                  <div className="bar"><div style={{ width: "30%" }} /></div>
                  <div className="meta"><span>Accessibility</span><span>30%</span></div>
                </div>
                <div className="trace-item">
                  <h4>Campus food-waste tracker</h4>
                  <div className="bar"><div style={{ width: "80%" }} /></div>
                  <div className="meta"><span>Sustainability</span><span>80%</span></div>
                </div>
              </div>
            </div>
          </aside>

          <main>
            <div className="feed-head">
              <div className="tabs">
                {["all", "problem", "person"].map((t) => (
                  <button
                    key={t}
                    className={`tab ${filter === t ? "active" : ""}`}
                    onClick={() => setFilter(t)}
                  >
                    {t === "all" ? "All" : t === "problem" ? "Problems" : "People"}
                  </button>
                ))}
              </div>
              <div className="sort">Sorted by · best match</div>
            </div>

            <div>
              {visible.map((item, i) =>
                item.kind === "problem" ? (
                  <div key={i} className="card problem">
                    <span className="card-tag">{item.tag}</span>
                    <h3>{item.title}</h3>
                    <p className="desc">{item.desc}</p>
                    <div className="card-foot">
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div className="avatar-stack">
                          {item.members.map((m, j) => (
                            <div key={j} className={`avatar ${m.av}`}>{m.initials}</div>
                          ))}
                        </div>
                        <span className="seats">{item.seatsMeta}</span>
                      </div>
                      <button className={`cta-btn ${item.ctaVariant === "ghost" ? "ghost" : ""}`}>{item.ctaLabel}</button>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="card person">
                    <div className="person-head">
                      <div className={`avatar ${item.avatarColor}`} style={{ width: 40, height: 40, fontSize: 14 }}>
                        {item.avatarInitials}
                        {item.online && <span className="online-dot pulse" />}
                      </div>
                      <div>
                        <div className="person-name">{item.name}</div>
                        <div className="person-role">{item.role}</div>
                      </div>
                    </div>
                    <p className="desc">{item.desc}</p>
                    <div className="card-foot">
                      <div className="chips">
                        {item.skills.map((s, j) => (
                          <span key={j} className={`chip ${s.className ?? ""}`}>{s.label}</span>
                        ))}
                      </div>
                      <button className="cta-btn outline">Connect</button>
                    </div>
                  </div>
                )
              )}
            </div>
          </main>

          <aside>
            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginTop: 0 }}>Trending skills</div>
              <div className="tagcloud">
                {["React", "Python", "Figma", "Rust", "GIS", "Accessibility", "IoT", "ML"].map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="section-label" style={{ marginTop: 0 }}>Suggested teammates</div>
              {[
                { av: "av-e", i: "JL", name: "Jordan Lee", role: "Frontend · React, TypeScript", match: "94%" },
                { av: "av-b", i: "TF", name: "Tariq Al-Farsi", role: "PM · Roadmapping", match: "88%" },
                { av: "av-c", i: "NR", name: "Nadia Reyes", role: "GIS · Mapping data", match: "81%" },
              ].map((p) => (
                <div key={p.i} className="suggest-item">
                  <div className={`avatar ${p.av}`} style={{ width: 34, height: 34, fontSize: 12 }}>{p.i}</div>
                  <div className="suggest-info">
                    <h5>{p.name}</h5>
                    <p>{p.role}</p>
                  </div>
                  <div className="match">{p.match}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default ExplorePage;
