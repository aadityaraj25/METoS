import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TopNav from "@/components/TopNav";
import { useAuth } from "../context/AuthContext.jsx";
import * as groupsApi from "../api/groups.js";
import * as invitesApi from "../api/invites.js";
import * as joinRequestsApi from "../api/joinRequests.js";
import * as workspaceApi from "../api/workspace.js";

function WorkspacePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const groupId = searchParams.get("group");

  const [tab, setTab] = useState("overview");
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinRequests, setJoinRequests] = useState([]);
  const [myGroups, setMyGroups] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [modalConfig, setModalConfig] = useState(null);

  useEffect(() => {
    if (!groupId) {
      groupsApi.getMyGroups()
        .then(({ data }) => setMyGroups(data.data ?? []))
        .catch(console.error)
        .finally(() => setLoading(false));
      return;
    }
    groupsApi.getGroup(groupId)
      .then(({ data }) => setGroup(data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [groupId]);

  // Fix: group.leader is a populated object from the backend API, so we must compare its _id to user._id
  const isLeader = group?.leader?._id === user?._id;
  const isMember = group?.teamMembers?.some(m => m._id === user?._id);

  useEffect(() => {
    if (groupId && isLeader) {
      joinRequestsApi.getPending(groupId)
        .then(({ data }) => setJoinRequests(data.data ?? []))
        .catch(console.error);
    }
  }, [groupId, isLeader]);

  useEffect(() => {
    if (groupId && (isMember || isLeader)) {
      workspaceApi.getTasks(groupId).then(({ data }) => setTasks(data.data ?? [])).catch(console.error);
      workspaceApi.getMessages(groupId).then(({ data }) => setMessages(data.data ?? [])).catch(console.error);
    }
  }, [groupId, isMember, isLeader]);

  const handleInvite = () => {
    setModalConfig({
      type: "prompt",
      title: "Invite Teammate",
      placeholder: "Enter email or username...",
      confirmText: "Send Invite",
      onConfirm: async (identifier) => {
        try {
          await invitesApi.sendInvite(groupId, { identifier });
          toast.success("Invite sent successfully!");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to send invite.");
        }
      }
    });
  };

  const handleCloseGroup = () => {
    setModalConfig({
      type: "confirm",
      title: "Close Group",
      description: "Are you sure you want to close this group? This action will mark it as closed and reject all pending join requests.",
      confirmText: "Close Group",
      danger: true,
      onConfirm: async () => {
        try {
          await groupsApi.closeGroup(groupId);
          setGroup({ ...group, status: "CLOSED" });
          toast.success("Group closed.");
        } catch (err) {
          toast.error("Failed to close group.");
        }
      }
    });
  };

  const handleLeaveGroup = () => {
    setModalConfig({
      type: "confirm",
      title: "Leave Group",
      description: "Are you sure you want to leave this group? You will lose access to the workspace.",
      confirmText: "Leave",
      danger: true,
      onConfirm: async () => {
        try {
          await groupsApi.leaveGroup(groupId);
          navigate("/dashboard");
        } catch (err) {
          toast.error("Failed to leave group.");
        }
      }
    });
  };

  const handleRemoveUser = (userId) => {
    setModalConfig({
      type: "confirm",
      title: "Remove User",
      description: "Are you sure you want to remove this user from the group? They will lose access to this workspace.",
      confirmText: "Remove",
      danger: true,
      onConfirm: async () => {
        try {
          await groupsApi.removeUser(groupId, userId);
          setGroup(prev => ({ ...prev, teamMembers: prev.teamMembers.filter(m => m._id !== userId) }));
          toast.success("User removed.");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to remove user.");
        }
      }
    });
  };

  const handleSaveEdit = async () => {
    const minMembers = group.teamMembers?.length || 1;
    if (editFormData.teamSize !== undefined && editFormData.teamSize !== "") {
      if (editFormData.teamSize < minMembers) {
        toast.error(`Team size cannot be less than current member count (${minMembers}).`);
        return;
      }
    }

    try {
      const { data } = await groupsApi.updateGroup(groupId, editFormData);
      setGroup(data.data);
      setIsEditingMode(false);
      toast.success("Group info updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update group.");
    }
  };

  const handleAcceptJoinRequest = async (reqId) => {
    try {
      await joinRequestsApi.accept(reqId);
      setJoinRequests(prev => prev.filter(r => r._id !== reqId));
      groupsApi.getGroup(groupId).then(({ data }) => setGroup(data.data));
      toast.success("Join request accepted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept request.");
    }
  };

  const handleRejectJoinRequest = async (reqId) => {
    try {
      await joinRequestsApi.reject(reqId);
      setJoinRequests(prev => prev.filter(r => r._id !== reqId));
      toast.success("Join request rejected.");
    } catch (err) {
      toast.error("Failed to reject request.");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const { data } = await workspaceApi.createTask(groupId, { title: newTaskTitle });
      setTasks([...tasks, data.data]);
      setNewTaskTitle("");
      toast.success("Task created");
    } catch (err) {
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await workspaceApi.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success("Task updated");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const { data } = await workspaceApi.sendMessage(groupId, newMessage);
      setMessages([...messages, data.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  if (loading) return <><TopNav /><div style={{ padding: 40, textAlign: "center" }}>Loading workspace...</div></>;

  if (!groupId) {
    return (
      <>
        <TopNav />
        <div style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, color: "#161B2C", marginBottom: 24 }}>Your Workspaces</h2>
          <div style={{ display: "grid", gap: 16 }}>
            {myGroups.map(g => (
              <a href={`/workspace?group=${g._id}`} key={g._id} style={{ padding: 24, border: "1px solid #D7DCE6", borderRadius: 12, display: "block", textDecoration: "none", color: "inherit", background: "#fff", transition: "box-shadow 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 24px rgba(22,27,44,0.08)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                <h3 style={{ fontSize: 18, marginBottom: 8, color: "#2E5EAA" }}>{g.teamName}</h3>
                <p style={{ color: "#5B6478", fontSize: 14 }}>{g.problemStatement}</p>
                <div style={{ marginTop: 16, fontSize: 12, color: "#8A611C", background: "rgba(226,166,59,0.14)", padding: "4px 8px", borderRadius: 4, display: "inline-block", fontWeight: 600 }}>{g.category}</div>
              </a>
            ))}
            {myGroups.length === 0 && <p style={{ color: "#5B6478" }}>You are not a member of any groups yet.</p>}
          </div>
        </div>
      </>
    );
  }

  if (!group) return <><TopNav /><div style={{ padding: 40, textAlign: "center" }}>Group not found or you don't have access.</div></>;

  return (
    <>
      <TopNav />

      <div className="ws-hero">
        <div className="ws-header-card">
          <div className="ws-header-top">
            <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
              <span className="card-tag" style={{ background: "rgba(226,166,59,0.14)", color: "#8A611C" }}>
                {group.category?.toUpperCase() || "GENERAL"}
              </span>
              {group.status === "CLOSED" && (
                <span className="card-tag" style={{ background: "#fee2e2", color: "#991b1b", marginLeft: 8 }}>
                  CLOSED
                </span>
              )}
              
              {isEditingMode ? (
                <div style={{ marginTop: 12 }}>
                  <input type="text" value={editFormData.teamName || ""} onChange={(e) => setEditFormData({ ...editFormData, teamName: e.target.value })} style={{ boxSizing: "border-box", padding: "8px 12px", fontSize: 18, fontWeight: 600, fontFamily: "var(--font-display)", width: "100%", border: "1px solid #D7DCE6", borderRadius: 8, marginBottom: 12, color: "#161B2C", outline: "none" }} />
                  <textarea value={editFormData.problemStatement || ""} onChange={(e) => setEditFormData({ ...editFormData, problemStatement: e.target.value })} style={{ boxSizing: "border-box", padding: "12px", fontSize: 14, lineHeight: 1.6, width: "100%", border: "1px solid #D7DCE6", borderRadius: 8, marginBottom: 12, minHeight: 90, fontFamily: "inherit", color: "#5B6478", outline: "none", resize: "vertical" }} />
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#5B6478", marginBottom: 6 }}>Max Team Size</label>
                  <input type="number" min={group.teamMembers?.length || 1} value={editFormData.teamSize !== undefined ? editFormData.teamSize : (group.teamSize || "")} onChange={(e) => {
                    const val = e.target.value;
                    setEditFormData({ ...editFormData, teamSize: val === "" ? "" : parseInt(val) });
                  }} style={{ boxSizing: "border-box", padding: "8px 12px", fontSize: 14, width: "120px", border: "1px solid #D7DCE6", borderRadius: 8, marginBottom: 16, color: "#161B2C", outline: "none" }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="cta-btn" onClick={handleSaveEdit}>Save Changes</button>
                    <button className="cta-btn outline" onClick={() => setIsEditingMode(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 style={{ marginTop: 12, marginBottom: 8 }}>{group.teamName}</h1>
                  <p className="stmt">{group.problemStatement}</p>
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {isLeader && !isEditingMode && group.status !== "CLOSED" && (
                <button className="cta-btn outline" onClick={() => { setEditFormData({ teamName: group.teamName, problemStatement: group.problemStatement, teamSize: group.teamSize }); setIsEditingMode(true); }}>Edit Group</button>
              )}
              {isLeader && group.status !== "CLOSED" && (
                <button className="cta-btn outline" onClick={handleInvite}>Invite teammate</button>
              )}
              {isLeader && group.status !== "CLOSED" && (
                <button className="cta-btn outline" onClick={handleCloseGroup} style={{ borderColor: "#c0392b", color: "#c0392b" }}>Close Group</button>
              )}
              {isMember && !isLeader && (
                <button className="cta-btn outline" onClick={handleLeaveGroup} style={{ borderColor: "#c0392b", color: "#c0392b" }}>Leave Group</button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div className="avatar-stack">
              {group.teamMembers?.slice(0, 4).map((m, i) => {
                const ini = m.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                const colors = ["av-c", "av-b", "av-d", "av-a"];
                return <div key={i} className={`avatar ${colors[i % colors.length]}`}>{ini}</div>;
              })}
              {group.teamMembers?.length > 4 && (
                <div className="avatar av-a">+{group.teamMembers.length - 4}</div>
              )}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <form onSubmit={handleCreateTask} style={{ display: "flex", gap: 8 }}>
                <input type="text" placeholder="New task title..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} style={{ flex: 1, padding: 12, border: "1px solid #D7DCE6", borderRadius: 8, fontSize: 14 }} />
                <button type="submit" className="cta-btn">Add Task</button>
              </form>
              <div className="kanban">
                {["TODO", "IN_PROGRESS", "DONE"].map(status => {
                  const colTasks = tasks.filter(t => t.status === status);
                  const title = status === "TODO" ? "To do" : status === "IN_PROGRESS" ? "In progress" : "Done";
                  return (
                    <div className="kcol" key={status}>
                      <h3>{title} <span>{colTasks.length}</span></h3>
                      {colTasks.map(t => (
                        <div className="kcard tag-hw" key={t._id}>
                          <h4>{t.title}</h4>
                          <div className="kfoot">
                            <select value={t.status} onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)} style={{ padding: 4, borderRadius: 4, border: "1px solid #ccc", fontSize: 11 }}>
                              <option value="TODO">To do</option>
                              <option value="IN_PROGRESS">In progress</option>
                              <option value="DONE">Done</option>
                            </select>
                            {t.assignedTo && <div className="avatar av-b" title={t.assignedTo.fullName}>{t.assignedTo.fullName[0].toUpperCase()}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "discussion" && (
            <div className="panel" style={{ display: "flex", flexDirection: "column", height: 500 }}>
              <div style={{ flex: 1, overflowY: "auto", paddingRight: 10, display: "flex", flexDirection: "column", gap: 16 }}>
                {messages.length === 0 ? <div style={{ color: "#5B6478", textAlign: "center", padding: 20 }}>No messages yet.</div> : messages.map((m) => {
                  const ini = m.sender?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                  return (
                    <div key={m._id} className="msg">
                      <div className={`avatar av-c`}>{ini}</div>
                      <div>
                        <div className="msg-head"><b>{m.sender?.fullName || "User"}</b><span>{new Date(m.createdAt).toLocaleString()}</span></div>
                        <p>{m.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid #EEF1F6" }}>
                <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, padding: 12, border: "1px solid #D7DCE6", borderRadius: 8, fontSize: 14 }} />
                <button type="submit" className="cta-btn">Send</button>
              </form>
            </div>
          )}
        </main>

        <aside className="panel">
          <div className="section-label" style={{ marginTop: 0 }}>Team · {group.teamMembers?.length || 0} members</div>
          {group.teamMembers?.map((m, i) => {
            const ini = m.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
            const isLead = group.leader?._id === m._id;
            const colors = ["av-c", "av-b", "av-d", "av-a"];
            return (
              <div className="roster-item" key={m._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className={`avatar ${colors[i % colors.length]}`}>{ini}</div>
                  <div className="roster-info">
                    <h6>{m.fullName}</h6>
                    <p>{isLead ? "Lead" : "Member"}{m.headline ? ` · ${m.headline}` : ""}</p>
                  </div>
                </div>
                {isLeader && !isLead && (
                  <button onClick={() => handleRemoveUser(m._id)} style={{ background: "transparent", color: "#c0392b", border: "1px solid #ffcccc", padding: "4px 8px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>Remove</button>
                )}
              </div>
            );
          })}

          {isLeader && joinRequests.length > 0 && (
            <div style={{ marginTop: 24, borderTop: "1px solid #EEF1F6", paddingTop: 24 }}>
              <div className="section-label" style={{ marginTop: 0 }}>Join Requests · {joinRequests.length}</div>
              {joinRequests.map(req => {
                const ini = req.user?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                return (
                  <div className="roster-item" key={req._id} style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%" }}>
                      <div className="avatar av-a">{ini}</div>
                      <div className="roster-info">
                        <h6>{req.user?.fullName}</h6>
                        <p>{req.user?.headline || "Wants to join"}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, width: "100%" }}>
                      <button onClick={() => handleAcceptJoinRequest(req._id)} style={{ flex: 1, padding: "6px 0", background: "#1E9C86", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Accept</button>
                      <button onClick={() => handleRejectJoinRequest(req._id)} style={{ flex: 1, padding: "6px 0", background: "transparent", color: "#5B6478", border: "1px solid #D7DCE6", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      {modalConfig && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(10, 15, 30, 0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={() => setModalConfig(null)}>
          <div style={{ background: "#fff", padding: 32, borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, color: "#161B2C", marginBottom: 12 }}>{modalConfig.title}</h3>
            {modalConfig.type === "prompt" && (
              <input 
                autoFocus
                type="text" 
                placeholder={modalConfig.placeholder} 
                style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #D7DCE6", fontSize: 15, boxSizing: "border-box", outline: "none", marginBottom: 24, color: "#161B2C" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    modalConfig.onConfirm(e.target.value.trim());
                    setModalConfig(null);
                  }
                }}
                id="modal-prompt-input"
              />
            )}
            {modalConfig.type === "confirm" && (
              <p style={{ color: "#5B6478", fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>{modalConfig.description}</p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button 
                className="cta-btn outline" 
                onClick={() => setModalConfig(null)}
                style={{ borderColor: "#D7DCE6", color: "#5B6478" }}
              >
                Cancel
              </button>
              <button 
                className="cta-btn" 
                onClick={() => {
                  if (modalConfig.type === "prompt") {
                    const val = document.getElementById("modal-prompt-input")?.value?.trim();
                    if (!val) return;
                    modalConfig.onConfirm(val);
                  } else {
                    modalConfig.onConfirm();
                  }
                  setModalConfig(null);
                }}
                style={modalConfig.danger ? { background: "#c0392b", color: "#fff", border: "none" } : {}}
              >
                {modalConfig.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WorkspacePage;
