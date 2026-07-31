import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import TopNav from "@/components/TopNav";
import { useAuth } from "../context/AuthContext.jsx";
import * as groupsApi from "../api/groups.js";
import * as usersApi from "../api/users.js";
import * as connectionsApi from "../api/connections.js";
import * as projectsApi from "../api/projects.js";
import * as joinRequestsApi from "../api/joinRequests.js";

function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [filter, setFilter] = useState("all");
  const [feed, setFeed] = useState([]);
  const [stats, setStats] = useState({ projects: 0, connections: 0, groups: 0 });
  const [myGroups, setMyGroups] = useState([]);
  const [reqStatus, setReqStatus] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    if (!user) return;
    Promise.all([
      groupsApi.listGroups(q ? { q } : {}).catch(() => ({ data: { data: [] } })),
      usersApi.searchUsers(q ? { q } : {}).catch(() => ({ data: { data: [] } })),
      projectsApi.getMyProjects().catch(() => ({ data: { data: [] } })),
      groupsApi.getMyGroups().catch(() => ({ data: { data: [] } })),
      connectionsApi.getConnections().catch(() => ({ data: { data: [] } })),
      connectionsApi.getSent().catch(() => ({ data: { data: [] } })),
    ]).then(([allGroupsRes, allUsersRes, myProjRes, myGrpRes, myConnRes, mySentRes]) => {
      const g = allGroupsRes.data?.data?.groups || [];
      const u = allUsersRes.data?.data?.users || [];
      const mGroups = myGrpRes.data?.data || [];
      setMyGroups(mGroups);

      const mConn = myConnRes.data?.data || [];
      setStats({
        projects: myProjRes.data?.data?.length || 0,
        connections: mConn.length,
        groups: mGroups.length,
      });

      const mConnIds = mConn.map(c => c.user?._id || c._id);
      const mSentIds = (mySentRes.data?.data || []).map(c => c.receiver?._id || c.receiver);
      const mGroupIds = mGroups.map(g => g._id);

      const items = [];
      g.forEach(group => {
        const inGroup = mGroupIds.includes(group._id);
        if (!inGroup || q) {
          items.push({ kind: "problem", data: group, inGroup });
        }
      });
      u.filter(x => x._id !== user._id).forEach(usr => {
        const isConnected = mConnIds.includes(usr._id);
        const isSent = mSentIds.includes(usr._id);
        if (!isConnected && !isSent || q) {
          items.push({ kind: "person", data: usr, isConnected, isSent });
        }
      });

      setFeed(items);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchData();

    const handleConnUpdate = () => {
      fetchData();
    };

    window.addEventListener("connectionUpdated", handleConnUpdate);
    return () => window.removeEventListener("connectionUpdated", handleConnUpdate);
  }, [user, q]);

  const visible = feed.filter((f) => filter === "all" || f.kind === filter);

  const handleConnect = async (userId) => {
    try {
      await connectionsApi.sendRequest(userId);
      setReqStatus(p => ({ ...p, [userId]: "Sent" }));
      setFeed(f => f.filter(item => item.data._id !== userId || q));
      toast.success("Connection request sent");
    } catch {
      setReqStatus(p => ({ ...p, [userId]: "Failed" }));
      toast.error("Failed to send request");
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await joinRequestsApi.create(groupId);
      setReqStatus(p => ({ ...p, [groupId]: "Requested" }));
      setFeed(f => f.filter(item => item.data._id !== groupId || q));
      toast.success("Join request sent");
    } catch (err) {
      setReqStatus(p => ({ ...p, [groupId]: "Failed" }));
      toast.error(err.response?.data?.message || "Failed to send join request");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await groupsApi.leaveGroup(groupId);
      setFeed(f => f.map(item => item.data._id === groupId ? { ...item, inGroup: false } : item).filter(item => item.data._id !== groupId || q));
      toast.success("Left the group");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave group");
    }
  };

  const handleRemoveConnection = async (userId) => {
    try {
      await connectionsApi.remove(userId);
      setReqStatus(p => {
        const next = { ...p };
        delete next[userId];
        return next;
      });
      setFeed(f => f.map(item => item.data._id === userId ? { ...item, isConnected: false, isSent: false } : item).filter(item => item.data._id !== userId || q));
      toast.success("Connection removed");
    } catch (err) {
      toast.error("Failed to remove connection");
    }
  };

  if (loading) return <div className="explore-page"><TopNav /><div style={{ padding: 40, textAlign: "center" }}>Loading feed...</div></div>;

  return (
    <div className="explore-page">
      <TopNav />
    
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
        <svg className="graph-svg" width="220" height="60" viewBox="0 0 220 90">
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
          <div className="panel profile-card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 15 }}>
                <div className="avatar av-a" style={{ width: 48, height: 48, minWidth: 48, fontSize: 16, fontWeight: 700, background: "#2E5EAA", color: "#FFFFFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    user?.fullName ? (
                      user.fullName.trim().includes(" ")
                        ? user.fullName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()
                        : user.fullName.slice(0, 2).toUpperCase()
                    ) : "DR"
                  )}
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#161B2C", margin: 0, wordBreak: "break-word", lineHeight: 1.25 }}>
                  {user?.fullName || "Devansh Rao"}
                </h2>
              </div>
              <p style={{ color: "#5B6478", fontSize: 13, lineHeight: 1.35, margin: 0, wordBreak: "break-word" }}>
                {user?.headline || "Full-stack Developer"}{user?.location ? ` · ${user.location}` : ""}
              </p>
            </div>
            <div className="profile-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, paddingTop: 14, borderTop: "1px solid #EEF1F6", paddingBottom: 14, borderBottom: "1px solid #EEF1F6", marginBottom: 16, textAlign: "left" }}>
              <div><b style={{ display: "block", fontSize: 16, color: "#161B2C", fontWeight: 700 }}>{stats.projects}</b><span style={{ fontSize: 9.5, color: "#5B6478", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4, display: "block" }}>Projects</span></div>
              <div><b style={{ display: "block", fontSize: 16, color: "#161B2C", fontWeight: 700 }}>{stats.connections}</b><span style={{ fontSize: 9.5, color: "#5B6478", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4, display: "block" }}>Connections</span></div>
              <div><b style={{ display: "block", fontSize: 16, color: "#161B2C", fontWeight: 700 }}>{stats.groups}</b><span style={{ fontSize: 9.5, color: "#5B6478", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4, display: "block" }}>Groups</span></div>
            </div>
            <div className="section-label" style={{ fontSize: 10.5, letterSpacing: 0.8, color: "#5B6478", fontWeight: 600, marginBottom: 10 }}>YOUR SKILLS</div>
            <div className="chips" style={{ marginBottom: 18 }}>
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map(s => <span key={typeof s === 'string' ? s : s.name} className="chip">{typeof s === 'string' ? s : s.name}</span>)
              ) : (
                <>
                  <span className="chip">React</span>
                  <span className="chip">Node.js</span>
                  <span className="chip">System Design</span>
                  <span className="chip">PostgreSQL</span>
                </>
              )}
            </div>
            <div className="section-label" style={{ fontSize: 10.5, letterSpacing: 0.8, color: "#5B6478", fontWeight: 600, marginBottom: 12 }}>YOUR GROUPS</div>
            <div className="trace">
              {myGroups.length === 0 ? (
                <>
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
                </>
              ) : (
                myGroups.slice(0, 4).map(g => (
                  <div className="trace-item" key={g._id}>
                    <h4>{g.teamName}</h4>
                    <div className="bar"><div style={{ width: `${g.progress || 60}%` }} /></div>
                    <div className="meta"><span>{g.category || "Development"}</span><span>{g.progress || 60}%</span></div>
                  </div>
                ))
              )}
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

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {loading ? (
              <>
                {[1, 2, 3].map(n => (
                  <div key={n} className="card" style={{ animation: "pulse 1.5s infinite ease-in-out" }}>
                    <div style={{ height: 20, background: "#EEF1F6", width: "40%", marginBottom: 12, borderRadius: 4 }}></div>
                    <div style={{ height: 16, background: "#EEF1F6", width: "80%", marginBottom: 8, borderRadius: 4 }}></div>
                    <div style={{ height: 16, background: "#EEF1F6", width: "70%", borderRadius: 4 }}></div>
                  </div>
                ))}
                <style>{`
                    @keyframes pulse {
                      0% { opacity: 0.6; }
                      50% { opacity: 1; }
                      100% { opacity: 0.6; }
                    }
                  `}</style>
              </>
            ) : visible.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#5B6478" }}>No items found.</div>
            ) : visible.map((item, i) => {
              if (item.kind === "problem") {
                const g = item.data;
                const inGroup = item.inGroup;
                const isLeader = g.leader?._id === user._id || g.leader === user._id;
                const btnLabel = inGroup ? (isLeader ? "You're the Leader" : "Leave") : (reqStatus[g._id] || "Request to join");
                return (
                  <div key={i} className="card problem">
                    <span className="card-tag">{g.category || "General"}</span>
                    <h3>{g.teamName}</h3>
                    <p className="desc">{g.problemStatement || "No description provided."}</p>
                    <div className="card-foot" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar-stack">
                          {g.teamMembers?.slice(0, 3).map((m, j) => {
                            const ini = m.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                            const colors = ["av-b", "av-c", "av-d"];
                            return <div key={j} className={`avatar ${colors[j % colors.length]}`}>{ini}</div>;
                          })}
                        </div>
                        <span className="seats" style={{ fontSize: 13, color: "#5B6478", fontFamily: "var(--font-mono)" }}>
                          {g.teamMembers?.length || 0} members · {Math.max(0, g.teamSize - (g.teamMembers?.length || 0))} seats open {g.skills ? `· needs ${g.skills}` : ""}
                        </span>
                      </div>
                      <button
                        className={`cta-btn ${inGroup ? "ghost" : ""}`}
                        onClick={() => inGroup ? (!isLeader && handleLeaveGroup(g._id)) : handleJoinGroup(g._id)}
                        disabled={isLeader || reqStatus[g._id] === "Requested"}
                        style={!inGroup ? { background: "#2E5EAA", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer" } : { padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500 }}
                      >
                        {btnLabel}
                      </button>
                    </div>
                  </div>
                );
              } else {
                const u = item.data;
                const isConnected = item.isConnected;
                const isSent = item.isSent;
                const ini = u.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                const btnLabel = isConnected ? "Remove" : (reqStatus[u._id] || (isSent ? "Sent" : "Connect"));
                return (
                  <div
                    key={i}
                    className="card person"
                    onClick={() => navigate(`/profile/${u._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="person-head">
                      <div style={{ position: "relative", display: "inline-flex" }}>
                        <div className="avatar av-a" style={{ width: 34, height: 34, fontSize: 12, overflow: "hidden" }}>
                          {u.profileImage ? (
                            <img src={u.profileImage} alt={u.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            ini
                          )}
                        </div>
                        {u.isOnline && <span className="online-dot pulse" />}
                      </div>
                      <div>
                        <div className="person-name">{u.fullName}</div>
                        <div className="person-role">{u.headline || "Member"}</div>
                      </div>
                    </div>
                    <p className="desc">{u.bio || u.headline || "No bio available."}</p>
                    <div className="card-foot">
                      <div className="chips">
                        {u.skills?.slice(0, 3).map((s, j) => (
                          <span key={j} className="chip">{s.name}</span>
                        ))}
                      </div>
                      <button
                        className={isConnected ? "btn-remove" : "btn-connect"}
                        onClick={(e) => {
                          e.stopPropagation();
                          isConnected ? handleRemoveConnection(u._id) : handleConnect(u._id);
                        }}
                        disabled={(!isConnected && !!reqStatus[u._id]) || isSent}
                      >
                        {btnLabel}
                      </button>
                    </div>
                  </div>
                );
              }
            })}
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
    </div>
  );
}

export default ExplorePage;
