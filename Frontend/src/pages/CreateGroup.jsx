import { Fragment, useState } from "react";
import TopNav from "@/components/TopNav";

const CATEGORIES = ["Sustainability", "Climate", "HealthTech", "EdTech", "Accessibility", "Other"];
const SKILLS = ["Data Analysis", "Mobile Dev", "Backend", "Design", "Marketing", "Fundraising"];

function CreateGroupPage() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("Cutting campus food waste with smarter dining-hall data");
  const [desc, setDesc] = useState(
    "Building a lightweight tracker so dining halls can predict demand instead of over-preparing. Early pilot data from two campuses already in hand."
  );
  const [category, setCategory] = useState(["Sustainability"]);
  const [selectedSkills, setSelectedSkills] = useState(["Data Analysis", "Mobile Dev"]);
  const [team, setTeam] = useState(8);
  const [visibility, setVisibility] = useState("public");

  const toggle = (arr, setArr, v) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const stepNodes = ["Problem", "Team needs", "Review & post"];
  const nextLabel = step === 2 ? "Post problem" : step === 1 ? "Next: Review" : "Next";

  return (
    <>
      <TopNav />
      <div className="create-wrap">
        <div className="eyebrow">New group</div>
        <h1>Start with the problem, not the pitch</h1>

        <div className="steps">
          {stepNodes.map((label, i) => (
            <Fragment key={label}>
              <div className={`step-node ${i < step ? "done" : i === step ? "current" : ""}`}>
                <div className="step-circle">{i < step ? "✓" : i + 1}</div>
                <div className="step-label">{label}</div>
              </div>
              {i < stepNodes.length - 1 && <div className="step-connector" />}
            </Fragment>
          ))}
        </div>

        <div className="form-panel">
          {step === 0 && (
            <div className="form-step active">
              <div className="field">
                <label>Problem title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="field">
                <label>Describe the problem</label>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="field">
                <label>Category</label>
                <div className="chips">
                  {CATEGORIES.map((c) => (
                    <span
                      key={c}
                      className={`chip selectable ${category.includes(c) ? "selected" : ""}`}
                      onClick={() => toggle(category, setCategory, c)}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="form-step active">
              <div className="field">
                <label>Skills needed</label>
                <div className="chips">
                  {SKILLS.map((s) => (
                    <span
                      key={s}
                      className={`chip amber selectable ${selectedSkills.includes(s) ? "selected" : ""}`}
                      onClick={() => toggle(selectedSkills, setSelectedSkills, s)}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Team size</label>
                <div className="stepper">
                  <button onClick={() => setTeam((t) => Math.max(1, t - 1))}>−</button>
                  <span>{team}</span>
                  <button onClick={() => setTeam((t) => t + 1)}>+</button>
                </div>
              </div>
              <div className="field">
                <label>Visibility</label>
                <div className="visibility-pill">
                  <button className={visibility === "public" ? "selected" : ""} onClick={() => setVisibility("public")}>Public</button>
                  <button className={visibility === "invite" ? "selected" : ""} onClick={() => setVisibility("invite")}>Invite-only</button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step active">
              <div className="preview-label">This is how it'll appear in Explore</div>
              <div className="card problem" style={{ marginBottom: 0 }}>
                <span className="card-tag">{category[0] ?? "Other"}</span>
                <h3>{title}</h3>
                <p className="desc">{desc}</p>
                <div className="card-foot">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div className="avatar-stack">
                      <div className="avatar av-a">DR</div>
                    </div>
                    <span className="seats">
                      1 member · {Math.max(0, team - 1)} seats open · needs {selectedSkills.join(", ") || "—"}
                    </span>
                  </div>
                  <button className="cta-btn" disabled>Request to join</button>
                </div>
              </div>
            </div>
          )}

          <div className="form-nav" style={{ marginTop: 24 }}>
            <button
              className="cta-btn ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </button>
            <button className="cta-btn" onClick={() => setStep((s) => Math.min(2, s + 1))}>
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateGroupPage;
