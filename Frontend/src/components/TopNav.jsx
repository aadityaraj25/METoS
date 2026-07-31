import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";
import * as invitesApi from "../api/invites.js";
import * as joinRequestsApi from "../api/joinRequests.js";
import * as connectionsApi from "../api/connections.js";
import * as authApi from "../api/auth.js";
import { useSocket } from "../context/SocketContext.jsx";

export default function TopNav() {
  const navigate = useNavigate();
  const { user, logout: ctxLogout } = useAuth();
  const socket = useSocket();
  const [menuOpen, setMenuOpen] = useState(false);
  const [invitesOpen, setInvitesOpen] = useState(false);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [pendingJoinRequests, setPendingJoinRequests] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const menuRef = useRef(null);
  const invitesRef = useRef(null);
  const connectionsRef = useRef(null);

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  const fetchPending = () => {
    if (!user) return;
    Promise.all([
      invitesApi.getPendingInvites().catch(() => ({ data: { data: [] } })),
      joinRequestsApi.getMyPending().catch(() => ({ data: { data: [] } })),
      connectionsApi.getPending().catch(() => ({ data: { data: [] } }))
    ]).then(([invRes, joinRes, connRes]) => {
      setPendingInvites(invRes.data?.data ?? []);
      setPendingJoinRequests(joinRes.data?.data ?? []);
      setPendingConnections(connRes.data?.data ?? []);
    });
  };

  useEffect(() => {
    fetchPending();

    window.addEventListener("connectionUpdated", fetchPending);

    if (socket) {
      const handleNewNotification = (data) => {
        fetchPending();
        window.dispatchEvent(new Event("connectionUpdated"));
      };
      socket.on("new_notification", handleNewNotification);

      return () => {
        window.removeEventListener("connectionUpdated", fetchPending);
        socket.off("new_notification", handleNewNotification);
      };
    }

    return () => {
      window.removeEventListener("connectionUpdated", fetchPending);
    };
  }, [user, socket]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (invitesRef.current && !invitesRef.current.contains(e.target)) setInvitesOpen(false);
      if (connectionsRef.current && !connectionsRef.current.contains(e.target)) setConnectionsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await ctxLogout();
    navigate("/");
  };

  const handleToggleDarkMode = async () => {
    try {
      await authApi.toggleDarkMode();
      document.body.classList.toggle("dark-mode");
    } catch (err) {
      toast.error("Failed to toggle dark mode");
    }
  };

  const handleAcceptInvite = async (token) => {
    try {
      const { data } = await invitesApi.acceptInvite({ token });
      setPendingInvites((prev) => prev.filter((inv) => inv.token !== token));
      setInvitesOpen(false);
      window.dispatchEvent(new Event("connectionUpdated"));
      if (data.data?.groupId) {
        navigate(`/workspace?group=${data.data.groupId}`);
      }
      toast.success("Invite accepted");
    } catch (err) {
      toast.error("Failed to accept invite");
    }
  };

  const handleRejectInvite = async (token) => {
    try {
      await invitesApi.rejectInvite({ token });
      setPendingInvites((prev) => prev.filter((inv) => inv.token !== token));
      window.dispatchEvent(new Event("connectionUpdated"));
      toast.success("Invite rejected");
    } catch (err) {
      toast.error("Failed to reject invite");
    }
  };

  const handleAcceptConnection = async (connId) => {
    try {
      await connectionsApi.accept(connId);
      setPendingConnections((prev) => prev.filter((c) => c._id !== connId));
      window.dispatchEvent(new Event("connectionUpdated"));
      toast.success("Connection request accepted");
    } catch (err) {
      toast.error("Failed to accept connection");
    }
  };

  const handleRejectConnection = async (connId) => {
    try {
      await connectionsApi.reject(connId);
      setPendingConnections((prev) => prev.filter((c) => c._id !== connId));
      window.dispatchEvent(new Event("connectionUpdated"));
      toast.success("Connection request rejected");
    } catch (err) {
      toast.error("Failed to reject connection");
    }
  };

  const handleAcceptJoinRequest = async (reqId) => {
    try {
      await joinRequestsApi.accept(reqId);
      setPendingJoinRequests((prev) => prev.filter((r) => r._id !== reqId));
      window.dispatchEvent(new Event("connectionUpdated"));
      toast.success("User added to group");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept join request");
    }
  };

  const handleRejectJoinRequest = async (reqId) => {
    try {
      await joinRequestsApi.reject(reqId);
      setPendingJoinRequests((prev) => prev.filter((r) => r._id !== reqId));
      window.dispatchEvent(new Event("connectionUpdated"));
      toast.success("Join request rejected");
    } catch (err) {
      toast.error("Failed to reject join request");
    }
  };

  const notifications = [
    ...pendingInvites.map(inv => ({ type: 'invite', data: inv, id: inv._id })),
    ...pendingJoinRequests.map(req => ({ type: 'join_request', data: req, id: req._id }))
  ];

  const initials = user?.fullName
    ?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <header className="topnav">
      <div className="logo">
        <svg className="logo-mark" viewBox="0 0 26 26" fill="none">
          <circle cx="6" cy="6" r="3" fill="#2E5EAA" />
          <circle cx="20" cy="6" r="3" fill="#E2A63B" />
          <circle cx="13" cy="20" r="3" fill="#1E9C86" />
          <path d="M8.5 7.5L11 17.5M17.5 7.5L15 17.5" stroke="#161B2C" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <button>METoS</button>
      </div>
      <nav className="nav-links">
        <NavLink to="/dashboard" className={linkClass}>Explore</NavLink>
        <NavLink to="/profile" className={linkClass}>Profile</NavLink>
        <NavLink to="/create-group" className={linkClass}>Create Group</NavLink>
        <NavLink to="/workspace" className={linkClass}>Workspace</NavLink>
      </nav>
      <form className="search" onSubmit={(e) => {
        e.preventDefault();
        const q = e.target.elements.q.value.trim();
        if (q) navigate(`/dashboard?q=${encodeURIComponent(q)}`);
        else navigate(`/dashboard`);
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input name="q" type="text" placeholder="Search people, skills, or problems..." style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "14px" }} />
      </form>
      <div className="nav-right">
        <div ref={connectionsRef} style={{ position: "relative" }}>
          <button
            className="icon-btn"
            aria-label="Connections"
            onClick={() => setConnectionsOpen((v) => !v)}
            style={{ position: "relative" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {pendingConnections.length > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2,
                background: "#E2A63B", color: "#161B2C",
                fontSize: 10, fontWeight: 700,
                width: 16, height: 16, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {pendingConnections.length}
              </span>
            )}
          </button>
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: -10,
            background: "#FFFFFF", border: "1px solid #D7DCE6", borderRadius: 12,
            boxShadow: "0 12px 32px rgba(22,27,44,0.12)", minWidth: 280, maxWidth: 320,
            zIndex: 100, opacity: connectionsOpen ? 1 : 0, pointerEvents: connectionsOpen ? "auto" : "none",
            transform: connectionsOpen ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}>
            <div style={{
              position: "absolute", top: -6, right: 18, width: 10, height: 10,
              background: "#FFFFFF", border: "1px solid #D7DCE6", borderBottom: "none", borderRight: "none", transform: "rotate(45deg)",
            }} />
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #EEF1F6", fontWeight: 600, fontSize: 13, color: "#161B2C" }}>
              Connection Requests
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", padding: 8 }}>
              {pendingConnections.length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "#5B6478", fontSize: 13 }}>No pending requests.</div>
              ) : (
                pendingConnections.map((conn) => (
                  <div key={conn._id} style={{ padding: 12, background: "#EEF1F6", borderRadius: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#161B2C", marginBottom: 2 }}>{conn.sender?.fullName || "A User"}</div>
                    <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 8 }}>{conn.sender?.headline || "Wants to connect"}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleAcceptConnection(conn._id)} style={{ flex: 1, padding: "6px 0", background: "#1E9C86", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Accept</button>
                      <button onClick={() => handleRejectConnection(conn._id)} style={{ flex: 1, padding: "6px 0", background: "transparent", color: "#5B6478", border: "1px solid #D7DCE6", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div ref={invitesRef} style={{ position: "relative" }}>
          <button
            className="icon-btn"
            aria-label="Notifications"
            onClick={() => setInvitesOpen((v) => !v)}
            style={{ position: "relative" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 01-3.4 0" />
            </svg>
            {notifications.length > 0 && (
              <span style={{
                position: "absolute", top: -2, right: -2,
                background: "#E2A63B", color: "#161B2C",
                fontSize: 10, fontWeight: 700,
                width: 16, height: 16, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {notifications.length}
              </span>
            )}
          </button>
          {/* Invites Dropdown */}
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: -10,
            background: "#FFFFFF", border: "1px solid #D7DCE6", borderRadius: 12,
            boxShadow: "0 12px 32px rgba(22,27,44,0.12)", minWidth: 280, maxWidth: 320,
            zIndex: 100, opacity: invitesOpen ? 1 : 0, pointerEvents: invitesOpen ? "auto" : "none",
            transform: invitesOpen ? "translateY(0)" : "translateY(-6px)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}>
            <div style={{
              position: "absolute", top: -6, right: 18, width: 10, height: 10,
              background: "#FFFFFF", border: "1px solid #D7DCE6", borderBottom: "none", borderRight: "none", transform: "rotate(45deg)",
            }} />
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #EEF1F6", fontWeight: 600, fontSize: 13, color: "#161B2C" }}>
              Notifications
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", padding: 8 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "#5B6478", fontSize: 13 }}>No new notifications.</div>
              ) : (
                notifications.map((notif) => {
                  if (notif.type === "invite") {
                    const inv = notif.data;
                    return (
                      <div key={`inv_${inv._id}`} style={{ padding: 12, background: "#EEF1F6", borderRadius: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#161B2C", marginBottom: 2 }}>{inv.group?.teamName || "A Group"}</div>
                        <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 8 }}>Invited by {inv.invitedBy?.fullName}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleAcceptInvite(inv.token)} style={{ flex: 1, padding: "6px 0", background: "#1E9C86", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Accept</button>
                          <button onClick={() => handleRejectInvite(inv.token)} style={{ flex: 1, padding: "6px 0", background: "transparent", color: "#5B6478", border: "1px solid #D7DCE6", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                        </div>
                      </div>
                    );
                  } else {
                    const req = notif.data;
                    return (
                      <div key={`req_${req._id}`} style={{ padding: 12, background: "#EEF1F6", borderRadius: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#161B2C", marginBottom: 2 }}>{req.user?.fullName}</div>
                        <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 8 }}>Wants to join {req.group?.teamName}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleAcceptJoinRequest(req._id)} style={{ flex: 1, padding: "6px 0", background: "#1E9C86", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Accept</button>
                          <button onClick={() => handleRejectJoinRequest(req._id)} style={{ flex: 1, padding: "6px 0", background: "transparent", color: "#5B6478", border: "1px solid #D7DCE6", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                        </div>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </div>
        </div>
        <button className="icon-btn" aria-label="Chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </button>

        {/* Avatar with click-toggle dropdown */}
        <div
          ref={menuRef}
          style={{ position: "relative" }}
        >
          <div
            className="avatar av-a"
            style={{ cursor: "pointer", userSelect: "none" }}
            aria-label="User menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {initials}
          </div>

          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "#FFFFFF",
              border: "1px solid #D7DCE6",
              borderRadius: 10,
              boxShadow: "0 8px 24px rgba(22,27,44,0.12)",
              minWidth: 140,
              zIndex: 100,
              overflow: "hidden",
              opacity: menuOpen ? 1 : 0,
              pointerEvents: menuOpen ? "auto" : "none",
              transform: menuOpen ? "translateY(0)" : "translateY(-6px)",
              transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
          >
            {/* Arrow pointer */}
            <div
              style={{
                position: "absolute",
                top: -6,
                right: 12,
                width: 10,
                height: 10,
                background: "#FFFFFF",
                border: "1px solid #D7DCE6",
                borderBottom: "none",
                borderRight: "none",
                transform: "rotate(45deg)",
              }}
            />
            <button
              onClick={handleToggleDarkMode}
              style={{
                width: "100%", padding: "11px 16px", background: "transparent", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500, color: "#161B2C", fontFamily: "var(--font-body)",
                display: "flex", alignItems: "center", gap: 10, textAlign: "left",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#EEF1F6"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
              </svg>
              Dark Mode
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "11px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                color: "#161B2C",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#EEF1F6"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
