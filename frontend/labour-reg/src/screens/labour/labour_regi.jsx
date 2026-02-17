import React, { useRef, useState } from "react";
import FormCard from "../../components/FormCard";
import { ensureMobileFocus } from "../../utils/mobileFocus";
import { useNavigate } from "react-router-dom";
import { t } from "../../utils/i18n";
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

export default function LabourRegi({ lang }) {
  const formRef = useRef(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    dob: "",
    stationFrom: "",
    stationTo: "",
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredSkills = COMMON_SKILLS.filter((skill) =>
    skill.toLowerCase().includes(skillInput.toLowerCase()),
  );

  const addSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, phone, password, dob, stationFrom, stationTo } = form;

    if (!phone.trim()) return alert(t(lang, "phoneRequired"));
    if (!dob) return alert(t(lang, "dobRequired"));

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (isNaN(age)) return alert(t(lang, "invalidDob"));
    if (age < 18) return alert(t(lang, "ageRestriction"));

    if (!name.trim()) return alert(t(lang, "nameRequired"));
    if (!password.trim()) return alert("Password required");

    if (!stationFrom || !stationTo) return alert("Select station range");

    if (skills.length === 0) return alert("Select at least one skill");

    try {
      setLoading(true);

      await api.post("/auth/register/labour", {
        name,
        phone,
        password,
        dob,
        stationFrom,
        stationTo,
        skills,
      });

      alert(t(lang, "registrationSuccess"));
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <FormCard title={t(lang, "providerRegistration")}>
        <form ref={formRef} className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label-text">{t(lang, "name")}</span>
            <input
              type="text"
              placeholder={t(lang, "enterName")}
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="label-text">{t(lang, "phone")}</span>
            <input
              type="tel"
              placeholder={t(lang, "enterPhone")}
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>

          {/* ✅ STATION RANGE 🔥 */}

          <div className="row">
            <label className="field">
              <span className="label-text">Station From</span>
              <select
                value={form.stationFrom}
                onChange={(e) =>
                  setForm({ ...form, stationFrom: e.target.value })
                }
                className="input"
              >
                <option value="">Select</option>
                {STATIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label-text">Station To</span>
              <select
                value={form.stationTo}
                onChange={(e) =>
                  setForm({ ...form, stationTo: e.target.value })
                }
                className="input"
              >
                <option value="">Select</option>
                {STATIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {/* ✅ SKILL SELECTOR 🔥 */}

          <label className="field">
            <span className="label-text">Skills</span>

            <div className="skills-box">
              {skills.map((skill) => (
                <div key={skill} className="skill-tag">
                  {skill}
                  <span onClick={() => removeSkill(skill)}>✕</span>
                </div>
              ))}

              <input
                type="text"
                placeholder="Search skills..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="skill-input"
              />
            </div>

            {skillInput && (
              <div className="skills-dropdown">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill}
                    onClick={() => addSkill(skill)}
                    className="dropdown-item"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </label>

          <label className="field">
            <span className="label-text">Password</span>
            <input
              type="password"
              placeholder="Enter Password"
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="label-text">{t(lang, "dob")}</span>
            <input
              type="date"
              onFocus={ensureMobileFocus}
              required
              className="input"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </label>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Registering..." : t(lang, "register")}
          </button>
        </form>

        <style>{`
          .page-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #f3f6ff;
          }

          .form {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
          }

          .label-text {
            font-size: 13px;
            color: #6b7280;
          }

          .input {
            height: 44px;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid rgba(15, 23, 42, 0.06);
            background: #f8fafc;
            font-size: 15px;
            outline: none;
          }

          .submit-btn {
            height: 46px;
            border-radius: 10px;
            border: none;
            background: #2b6ef6;
            color: white;
            font-weight: 600;
            cursor: pointer;
          }

          .row {
            display: flex;
            gap: 10px;
          }

          .skills-box {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 8px 10px;
            border-radius: 10px;
            border: 1px solid rgba(15, 23, 42, 0.06);
            background: #f8fafc;
            min-height: 44px;
            align-items: center;
          }

          .skill-tag {
            background: #2b6ef6;
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .skill-input {
            border: none;
            outline: none;
            background: transparent;
            font-size: 14px;
            flex: 1;
          }

          .skills-dropdown {
            border-radius: 10px;
            border: 1px solid rgba(15, 23, 42, 0.06);
            margin-top: 6px;
            background: white;
          }

          .dropdown-item {
            padding: 10px 12px;
            cursor: pointer;
          }

          .dropdown-item:hover {
            background: #f1f5f9;
          }
        `}</style>
      </FormCard>
    </div>
  );
}
