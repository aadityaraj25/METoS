import { NavLink } from "react-router-dom";

export default function TopNav() {
  const linkClass = ({ isActive }) => (isActive ? "active" : "");
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
        <NavLink to="/" end className={linkClass}>Explore</NavLink>
        <NavLink to="/profile" className={linkClass}>Profile</NavLink>
        <NavLink to="/create-group" className={linkClass}>Create Group</NavLink>
        <NavLink to="/workspace" className={linkClass}>Workspace</NavLink>
      </nav>
      <div className="search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        Search people, skills, or problems…
      </div>
      <div className="nav-right">
        <button className="icon-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 01-3.4 0" />
          </svg>
        </button>
        <button className="icon-btn" aria-label="Chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </button>
        <div className="avatar av-a">DR</div>
      </div>
    </header>
  );
}
