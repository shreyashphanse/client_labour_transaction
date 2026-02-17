import { useState } from "react";
import api from "../../utils/api";

const COMMON_SKILLS = [
  "Plumbing",
  "Electrician",
  "Carpenter",
  "Painter",
  "Cleaning",
  "AC Repair",
  "Welder",
  "Mechanic",
  "Driver",
  "Helper",
];

const STATIONS = ["Vasai", "Nalasopara", "Virar"];

export default function PostJob() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    skillRequired: "",
    from: "",
    to: "",
    budget: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  /* ✅ FILTERED SKILLS */
  const filteredSkills = COMMON_SKILLS.filter((skill) =>
    skill.toLowerCase().includes(skillInput.toLowerCase()),
  );

  const selectSkill = (skill) => {
    setForm({ ...form, skillRequired: skill });
    setSkillInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, skillRequired, from, to, budget } = form;

    if (!title.trim()) return alert("Title required");
    if (!description.trim()) return alert("Description required");
    if (!skillRequired) return alert("Skill required");
    if (!from) return alert("From station required");
    if (!to) return alert("To station required");
    if (!budget) return alert("Budget required");

    try {
      setLoading(true);

      await api.post("/jobs/create", {
        title,
        description,
        skillRequired,
        from,
        to,
        budget: Number(budget),
      });

      alert("Job posted successfully");

      setForm({
        title: "",
        description: "",
        skillRequired: "",
        from: "",
        to: "",
        budget: "",
      });
    } catch (err) {
      console.error(err);
      alert("Job creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-root">
      <form className="post-card" onSubmit={handleSubmit}>
        <h2>Post Job</h2>

        <input
          placeholder="Job Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Job Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* ✅ SKILL SELECTOR 🔥 */}

        <div className="field">
          <input
            placeholder="Search Skill..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
          />

          {skillInput && (
            <div className="skills-dropdown">
              {filteredSkills.map((skill) => (
                <div
                  key={skill}
                  onClick={() => selectSkill(skill)}
                  className="dropdown-item"
                >
                  {skill}
                </div>
              ))}
            </div>
          )}

          {form.skillRequired && (
            <div className="selected-skill">
              Selected: <b>{form.skillRequired}</b>
            </div>
          )}
        </div>

        {/* ✅ STATION DROPDOWN 🔥 */}

        <div className="stations">
          <select
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
          >
            <option value="">From Station</option>
            {STATIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
          >
            <option value="">To Station</option>
            {STATIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <input
          type="number"
          placeholder="Budget"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        />

        <button disabled={loading}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>

      <style jsx>{`
        .post-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0fdf4;
          padding: 16px;
        }

        .post-card {
          width: 100%;
          max-width: 500px;
          background: white;
          border-radius: 18px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid rgba(16, 185, 129, 0.15);
          position: relative;
        }

        h2 {
          margin: 0 0 8px;
          color: #065f46;
        }

        input,
        textarea,
        select {
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.25);
          padding: 0 12px;
          outline: none;
          font-size: 14px;
        }

        textarea {
          height: 80px;
          padding-top: 10px;
          resize: none;
        }

        .stations {
          display: flex;
          gap: 10px;
        }

        button {
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #10b981;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        button:hover {
          background: #059669;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ✅ SKILL DROPDOWN */

        .field {
          position: relative;
        }

        .skills-dropdown {
          position: absolute;
          width: 100%;
          background: white;
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.25);
          margin-top: 4px;
          max-height: 160px;
          overflow-y: auto;
          z-index: 10;
        }

        .dropdown-item {
          padding: 10px 12px;
          cursor: pointer;
          font-size: 14px;
        }

        .dropdown-item:hover {
          background: #f0fdf4;
        }

        .selected-skill {
          font-size: 13px;
          color: #065f46;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}
