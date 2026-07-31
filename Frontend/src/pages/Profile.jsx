import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import TopNav from "@/components/TopNav";
import { useAuth } from "../context/AuthContext.jsx";
import * as projectsApi from "../api/projects.js";
import * as groupsApi from "../api/groups.js";
import * as connectionsApi from "../api/connections.js";
import * as authApi from "../api/auth.js";
import * as usersApi from "../api/users.js";

const projectGradients = [
  "linear-gradient(135deg, #1B7B76 0%, #2E8B83 100%)",
  "linear-gradient(135deg, #D49838 0%, #3B5B98 100%)",
  "linear-gradient(135deg, #1E9C86 0%, #3D5A6C 100%)",
  "linear-gradient(135deg, #6B4EAA 0%, #2E5EAA 100%)",
];

const projectIcons = [
  <svg key="1" width="32" height="32" viewBox="0 0 40 40" fill="none">
    <path d="M12 28L20 12L28 20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="28" r="3" fill="#FFFFFF"/>
    <circle cx="20" cy="12" r="3" fill="#FFFFFF"/>
    <circle cx="28" cy="20" r="3" fill="#FFFFFF"/>
  </svg>,
  <svg key="2" width="32" height="32" viewBox="0 0 40 40" fill="none">
    <rect x="12" y="12" width="12" height="12" fill="#FFFFFF" fillOpacity="0.9" rx="1"/>
    <rect x="18" y="18" width="12" height="12" fill="#FFFFFF" fillOpacity="0.5" rx="1"/>
  </svg>,
  <svg key="3" width="32" height="32" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="10" stroke="#FFFFFF" strokeWidth="2"/>
    <circle cx="20" cy="20" r="4" fill="#FFFFFF"/>
  </svg>,
  <svg key="4" width="32" height="32" viewBox="0 0 40 40" fill="none">
    <polygon points="20,12 30,28 10,28" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinejoin="round"/>
  </svg>,
];

function ProfilePage() {
  const { user, setUser } = useAuth();
  const { userId } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [connections, setConnections] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: "", description: "", techStack: "" });

  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({ name: "", proficiency: 3 });

  const isOwnProfile = !userId || userId === user?._id;

  useEffect(() => {
    if (!user) return;

    if (isOwnProfile) {
      setProfileUser(user);
      Promise.all([
        projectsApi.getMyProjects().catch(() => ({ data: { data: [] } })),
        groupsApi.getMyGroups().catch(() => ({ data: { data: [] } })),
        connectionsApi.getConnections().catch(() => ({ data: { data: [] } })),
      ]).then(([projRes, groupRes, connRes]) => {
        setProjects(projRes.data?.data ?? []);
        setGroups(groupRes.data?.data ?? []);
        setConnections(connRes.data?.data ?? []);
      });
    } else {
      Promise.all([
        usersApi.getUserById(userId),
        connectionsApi.getConnections().catch(() => ({ data: { data: [] } })),
      ]).then(([userRes, connRes]) => {
        const u = userRes.data.data;
        setProfileUser(u);
        setProjects(u.projects ?? []);
        setGroups(u.groups ?? []);
        setConnections(connRes.data?.data ?? []);
      }).catch((err) => {
        console.error(err);
        toast.error("Failed to load profile");
      });
    }
  }, [user, userId, isOwnProfile]);

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        fullName: user?.fullName || "",
        headline: user?.headline || "",
        bio: user?.bio || "",
        location: user?.location || "",
        github: user?.socialLinks?.github || "",
        linkedin: user?.socialLinks?.linkedin || "",
        portfolio: user?.socialLinks?.portfolio || "",
        twitter: user?.socialLinks?.twitter || "",
        skills: user?.skills?.map(s => s.name).join(", ") || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedSkills = editForm.skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s)
        .map(s => ({ name: s, proficiency: 3 }));

      const { data } = await authApi.updateProfile({
        fullName: editForm.fullName,
        headline: editForm.headline,
        bio: editForm.bio,
        location: editForm.location,
        socialLinks: {
          github: editForm.github,
          linkedin: editForm.linkedin,
          portfolio: editForm.portfolio,
          twitter: editForm.twitter
        },
        skills: parsedSkills,
      });
      setUser(data.data);
      setProfileUser(data.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) return;
    try {
      const techStack = projectForm.techStack.split(",").map(s => s.trim()).filter(s => s);
      const { data } = await projectsApi.createProject({
        title: projectForm.title,
        description: projectForm.description,
        techStack
      });
      setProjects([data.data, ...projects]);
      setIsAddingProject(false);
      setProjectForm({ title: "", description: "", techStack: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.name) return;
    try {
      const newSkills = [...(user.skills || []), { name: skillForm.name.trim(), proficiency: Number(skillForm.proficiency) }];
      const { data } = await authApi.updateProfile({ skills: newSkills });
      setUser(data.data);
      setProfileUser(data.data);
      setIsAddingSkill(false);
      setSkillForm({ name: "", proficiency: 3 });
    } catch (err) {
      console.error(err);
    }
  };

  const isConnected = !isOwnProfile && connections.some(c => (c.user?._id || c._id) === userId);

  const handleConnect = async () => {
    try {
      if (isConnected) {
        await connectionsApi.remove(userId);
        setConnections(prev => prev.filter(c => (c.user?._id || c._id) !== userId));
        toast.success("Connection removed");
      } else {
        await connectionsApi.sendRequest(userId);
        toast.success("Connection request sent");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  if (!profileUser) return <><TopNav /><div style={{ padding: 40, textAlign: "center" }}>Loading...</div></>;

  const initials = profileUser?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <>
      <TopNav />
      <div className="profile-wrap">
        <div className="profile-header-card">
          {isEditing && isOwnProfile ? (
            <form onSubmit={handleSave} style={{ width: "100%" }}>
              <h2 style={{ marginBottom: 16 }}>Edit Profile</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Full Name</label>
                  <input type="text" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Location</label>
                  <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Headline</label>
                  <input type="text" value={editForm.headline} onChange={e => setEditForm({ ...editForm, headline: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Skills (comma separated)</label>
                  <input type="text" value={editForm.skills} onChange={e => setEditForm({ ...editForm, skills: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4, minHeight: 60 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>GitHub URL</label>
                  <input type="text" value={editForm.github} onChange={e => setEditForm({ ...editForm, github: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>LinkedIn URL</label>
                  <input type="text" value={editForm.linkedin} onChange={e => setEditForm({ ...editForm, linkedin: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Portfolio URL</label>
                  <input type="text" value={editForm.portfolio} onChange={e => setEditForm({ ...editForm, portfolio: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Twitter/X URL</label>
                  <input type="text" value={editForm.twitter} onChange={e => setEditForm({ ...editForm, twitter: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="cta-btn" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
                <button type="button" className="cta-btn outline" onClick={handleEditToggle}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="avatar av-a avatar-xl">{initials}</div>
              <div className="profile-header-info">
                <h1 style={{ marginBottom: 4 }}>{profileUser?.fullName || "User Name"}</h1>
                <div className="role-line">{profileUser?.headline || "No headline"} · {profileUser?.location || "Unknown"}</div>
                <p className="bio">{profileUser?.bio || "No bio available."}</p>

                <div className="profile-header-stats">
                  <div><b>{projects.length}</b><span style={{ textTransform: "uppercase" }}>Projects</span></div>
                  <div><b>{connections.length}</b><span style={{ textTransform: "uppercase" }}>Connections</span></div>
                  <div><b>{groups.length}</b><span style={{ textTransform: "uppercase" }}>Groups</span></div>
                </div>
              </div>
              <div className="profile-header-actions">
                {isOwnProfile ? (
                  <>
                    <button className="cta-btn outline" onClick={handleEditToggle}>Edit profile</button>
                    <button className="cta-btn">Share</button>
                  </>
                ) : (
                  <>
                    <button
                      className={`cta-btn ${isConnected ? "outline" : ""}`}
                      onClick={handleConnect}
                      style={isConnected ? { color: "#d9534f", borderColor: "#d9534f" } : {}}
                    >
                      {isConnected ? "Remove Connection" : "Connect"}
                    </button>
                    <button className="cta-btn outline">Message</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="profile-cols">
          <div>
            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginTop: 0, display: "flex", justifyContent: "space-between" }}>
                <span style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Skills</span>
                {isOwnProfile && (
                  <span style={{ color: "#2E5EAA", cursor: "pointer", textTransform: "none", letterSpacing: "normal" }} onClick={() => setIsAddingSkill(!isAddingSkill)}>
                    {isAddingSkill ? "Cancel" : "+ Add Skill"}
                  </span>
                )}
              </div>
              {isAddingSkill && isOwnProfile && (
                <form onSubmit={handleAddSkill} style={{ marginBottom: 16, padding: 12, background: "rgba(46,94,170,0.05)", borderRadius: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: 11, color: "#5B6478", marginBottom: 4 }}>Skill Name</label>
                      <input type="text" value={skillForm.name} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} style={{ width: "100%", padding: 6, border: "1px solid #ccc", borderRadius: 4, fontSize: 12 }} />
                    </div>
                    <div style={{ width: 80 }}>
                      <label style={{ display: "block", fontSize: 11, color: "#5B6478", marginBottom: 4 }}>Level (1-5)</label>
                      <input type="number" min="1" max="5" value={skillForm.proficiency} onChange={e => setSkillForm({ ...skillForm, proficiency: e.target.value })} style={{ width: "100%", padding: 6, border: "1px solid #ccc", borderRadius: 4, fontSize: 12 }} />
                    </div>
                    <button type="submit" className="cta-btn" style={{ padding: "6px 12px", fontSize: 12 }}>Add</button>
                  </div>
                </form>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {profileUser.skills?.length > 0 ? profileUser.skills.map((s, i) => (
                  <div key={s._id || s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i !== profileUser.skills.length - 1 ? "1px solid #EEF1F6" : "none" }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1, 2, 3, 4, 5].map(lvl => (
                        <div key={lvl} style={{ width: 6, height: 6, borderRadius: "50%", background: lvl <= (s.proficiency || 3) ? "#2E5EAA" : "#D7DCE6" }}></div>
                      ))}
                    </div>
                  </div>
                )) : <div style={{ color: "#5B6478", fontSize: 14 }}>No skills added.</div>}
              </div>
            </div>

            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginTop: 0, display: "flex", justifyContent: "space-between" }}>
                <span style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Projects</span>
                {isOwnProfile && (
                  <span style={{ color: "#2E5EAA", cursor: "pointer", textTransform: "none", letterSpacing: "normal" }} onClick={() => setIsAddingProject(!isAddingProject)}>
                    {isAddingProject ? "Cancel" : "+ Add Project"}
                  </span>
                )}
              </div>
              {isAddingProject && isOwnProfile && (
                <form onSubmit={handleCreateProject} style={{ marginBottom: 20, padding: 16, border: "1px solid #EEF1F6", borderRadius: 8 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Project Title</label>
                    <input type="text" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Description</label>
                    <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4, minHeight: 60 }} />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 12, color: "#5B6478", marginBottom: 4 }}>Tech Stack (comma separated)</label>
                    <input type="text" value={projectForm.techStack} onChange={e => setProjectForm({ ...projectForm, techStack: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
                  </div>
                  <button type="submit" className="cta-btn">Create Project</button>
                </form>
              )}
              <div className="projects-grid">
                {projects.length === 0 ? (
                  <div style={{ color: "var(--ink-soft)", gridColumn: "1/-1", padding: "12px 0" }}>No projects added.</div>
                ) : projects.map((p, i) => {
                  const gradient = projectGradients[i % projectGradients.length];
                  const icon = projectIcons[i % projectIcons.length];
                  const tags = Array.isArray(p.techStack)
                    ? p.techStack
                    : (p.techStack || "").split(",").map(s => s.trim()).filter(Boolean);
                  return (
                    <div key={p._id || i} className="project-card">
                      <div className="project-thumb" style={{ background: gradient }}>
                        {icon}
                      </div>
                      <h4>{p.title}</h4>
                      <p className="project-desc">{p.description || "No description provided."}</p>
                      <div className="project-foot">
                        <div className="project-tags">
                          {tags.slice(0, 2).map((ts, j) => (
                            <span key={j} className="project-tag">{ts}</span>
                          ))}
                        </div>
                        <a href={p.githubUrl || p.liveUrl || "#"} target="_blank" rel="noreferrer" className="project-link">View →</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginTop: 0, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Social Links</div>
              <div style={{ display: "flex", gap: 16 }}>
                {profileUser.socialLinks?.github && (
                  <a href={profileUser.socialLinks.github} target="_blank" rel="noreferrer" style={{ color: "#2E5EAA" }} title="GitHub">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                )}
                {profileUser.socialLinks?.linkedin && (
                  <a href={profileUser.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ color: "#2E5EAA" }} title="LinkedIn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {profileUser.socialLinks?.portfolio && (
                  <a href={profileUser.socialLinks.portfolio} target="_blank" rel="noreferrer" style={{ color: "#2E5EAA" }} title="Portfolio">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </a>
                )}
                {profileUser.socialLinks?.twitter && (
                  <a href={profileUser.socialLinks.twitter} target="_blank" rel="noreferrer" style={{ color: "#2E5EAA" }} title="Twitter / X">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {!profileUser.socialLinks?.github && !profileUser.socialLinks?.linkedin && !profileUser.socialLinks?.portfolio && !profileUser.socialLinks?.twitter && (
                  <div style={{ color: "#5B6478", fontSize: 13 }}>No social links added.</div>
                )}
              </div>
            </div>

            <div className="panel" style={{ marginBottom: 20 }}>
              <div className="section-label" style={{ marginTop: 0, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Groups</div>
              {groups.length === 0 ? <div style={{ color: "#5B6478" }}>Not part of any groups.</div> : groups.map((g, i) => {
                const isLead = g.leader === profileUser._id || g.leader?._id === profileUser._id;
                return (
                  <div key={g._id || g.teamName} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i !== groups.length - 1 ? "1px solid #EEF1F6" : "none" }}>
                    <div>
                      <h5 style={{ fontSize: 14, marginBottom: 4 }}>{g.teamName}</h5>
                      <div style={{ fontSize: 12, color: "#5B6478" }}>{g.category} · {g.teamMembers?.length || 1} members</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 4, background: isLead ? "rgba(226,166,59,0.15)" : "rgba(46,94,170,0.1)", color: isLead ? "#8A611C" : "#2E5EAA" }}>
                      {isLead ? "Lead" : "Member"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panel">
              <div className="section-label" style={{ marginTop: 0, textTransform: "uppercase", fontSize: 11, letterSpacing: 1 }}>Connections · {connections.length}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {connections.length === 0 ? <div style={{ color: "#5B6478", gridColumn: "1/-1" }}>No connections yet.</div> : connections.slice(0, 4).map((c, i) => {
                  const u = c.user || c;
                  const ini = u.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                  return (
                    <Link key={u._id || c._id || i} to={`/profile/${u._id}`} style={{ textDecoration: "none", color: "inherit", display: "flex", gap: 10, alignItems: "center" }}>
                      <div className="avatar av-c" style={{ width: 32, height: 32, fontSize: 11, overflow: "hidden", flexShrink: 0 }}>
                        {u.profileImage ? (
                          <img src={u.profileImage} alt={u.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          ini
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.fullName || "User"}</div>
                        <div style={{ fontSize: 11, color: "#5B6478", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.headline || "Member"}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {connections.length > 0 && (
                <button style={{ width: "100%", padding: "8px", background: "transparent", border: "1px solid #D7DCE6", borderRadius: 6, color: "#5B6478", fontWeight: 600, cursor: "pointer" }}>See all connections</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
