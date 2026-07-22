import { useState } from "react";
import TopNav from "@/components/TopNav";

function WorkspacePage() {
  const [tab, setTab] = useState("overview");

  return (
    <>
      <TopNav />

      <div className="ws-hero">
        <div className="ws-header-card">
          <div className="ws-header-top">
            <div>
              <span className="card-tag" style={{ background: "rgba(226,166,59,0.14)", color: "#8A611C" }}>Climate</span>
              <h1>Real-time flood alerts for rural river towns</h1>
              <p className="stmt">
                Combining cheap water-level sensors with SMS alerts for towns without reliable internet. Hardware prototype
                already tested upstream — now building the alert dashboard and expanding sensor coverage.
              </p>
            </div>
            <button className="cta-btn outline">Invite teammate</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div className="avatar-stack">
              <div className="avatar av-c">DR</div>
              <div className="avatar av-b">TS</div>
              <div className="avatar av-d">NF</div>
              <div className="avatar av-a">+5</div>
            </div>
            <div className="ws-progress-wrap">
              <span>Progress</span>
              <div className="bar"><div style={{ width: "60%" }} /></div>
              <span>60%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ws-layout">
        <main>
          <div className="wtabs">
            {["overview", "board", "discussion"].map((t) => (
              <button key={t} className={`wtab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t === "overview" ? "Overview" : t === "board" ? "Board" : "Discussion"}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="panel">
              <div className="section-label" style={{ marginTop: 0 }}>Recent activity</div>
              <div className="activity-item"><b>Nadia Reyes</b> moved "Field-test water sensor" to In Progress</div>
              <div className="activity-item"><b>Tariq Sen</b> uploaded the sensor housing CAD file</div>
              <div className="activity-item"><b>Devansh Rao</b> merged the alert-dashboard backend</div>
              <div className="activity-item">3 new members joined this week</div>
            </div>
          )}

          {tab === "board" && (
            <div className="kanban">
              <div className="kcol">
                <h3>To do <span>2</span></h3>
                <div className="kcard tag-hw">
                  <h4>Design sensor housing for monsoon exposure</h4>
                  <div className="kfoot"><span className="ktag">Hardware</span><div className="avatar av-b">TS</div></div>
                </div>
                <div className="kcard tag-content">
                  <h4>Draft SMS alert copy in 3 local languages</h4>
                  <div className="kfoot"><span className="ktag">Content</span><div className="avatar av-d">NF</div></div>
                </div>
              </div>
              <div className="kcol">
                <h3>In progress <span>2</span></h3>
                <div className="kcard tag-sw">
                  <h4>Build real-time alert dashboard</h4>
                  <div className="kfoot"><span className="ktag">Software</span><div className="avatar av-c">DR</div></div>
                </div>
                <div className="kcard tag-hw">
                  <h4>Field-test water-level sensor upstream</h4>
                  <div className="kfoot"><span className="ktag">Hardware</span><div className="avatar av-d">NF</div></div>
                </div>
              </div>
              <div className="kcol">
                <h3>Done <span>2</span></h3>
                <div className="kcard tag-hw">
                  <h4>Select GSM module for remote areas</h4>
                  <div className="kfoot"><span className="ktag">Hardware</span><div className="avatar av-b">TS</div></div>
                </div>
                <div className="kcard tag-content">
                  <h4>Write project brief for local council</h4>
                  <div className="kfoot"><span className="ktag">Content</span><div className="avatar av-c">DR</div></div>
                </div>
              </div>
            </div>
          )}

          {tab === "discussion" && (
            <div className="panel">
              {[
                { av: "av-d", i: "NF", name: "Nadia Reyes", time: "Yesterday, 6:40 PM", msg: "Sensor held up fine through last night's test — readings synced every 4 minutes with no drops." },
                { av: "av-c", i: "DR", name: "Devansh Rao", time: "Yesterday, 7:02 PM", msg: "Nice. I'll wire that feed into the dashboard tomorrow — should have alerts live by Friday." },
                { av: "av-b", i: "TS", name: "Tariq Sen", time: "Today, 9:15 AM", msg: "Housing prototype is printing now. Should hold up to the exposure numbers Nadia sent." },
              ].map((m) => (
                <div key={m.name} className="msg">
                  <div className={`avatar ${m.av}`}>{m.i}</div>
                  <div>
                    <div className="msg-head"><b>{m.name}</b><span>{m.time}</span></div>
                    <p>{m.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <aside className="panel">
          <div className="section-label" style={{ marginTop: 0 }}>Team · 8 members</div>
          <div className="roster-item">
            <div className="avatar av-c">DR<span className="online-dot pulse" style={{ width: 9, height: 9 }} /></div>
            <div className="roster-info"><h6>Devansh Rao</h6><p>Lead · Backend</p></div>
          </div>
          <div className="roster-item">
            <div className="avatar av-b">TS</div>
            <div className="roster-info"><h6>Tariq Sen</h6><p>Hardware</p></div>
          </div>
          <div className="roster-item">
            <div className="avatar av-d">NF<span className="online-dot pulse" style={{ width: 9, height: 9 }} /></div>
            <div className="roster-info"><h6>Nadia Reyes</h6><p>GIS · Field testing</p></div>
          </div>
          <div className="roster-item">
            <div className="avatar av-a">+5</div>
            <div className="roster-info"><h6>5 more members</h6><p>See full roster</p></div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default WorkspacePage;
