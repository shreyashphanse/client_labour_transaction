import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { t } from "../../utils/i18n";

const sampleUsers = [
  {
    id: 1,
    name: "John Provider",
    role: "provider",
    phone: "9876543210",
    verified: false,
    banned: false,
    idPhoto: null,
    workPhotos: [],
  },
  {
    id: 2,
    name: "Jane Customer",
    role: "customer",
    phone: "8097142445",
    verified: false,
    banned: false,
    idPhoto: null,
    workPhotos: [],
  },
];

const sampleJobs = [
  {
    id: 101,
    title: "Fix sink",
    client: "Jane Customer",
    labour: "John Provider",
    status: "posted",
    accepted: false,
  },
];

export default function AdminPanel({ lang }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState(sampleUsers);
  const [jobs] = useState(sampleJobs);
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifyFilter, setVerifyFilter] = useState("all");

  const [photoModalSrc, setPhotoModalSrc] = useState(null);
  const [query, setQuery] = useState("");
  const [disputes, setDisputes] = useState([
    { id: 1, jobId: 101, text: "Provider didn't show up", resolved: false },
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = `${u.name} ${u.phone}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      const matchesVerify =
        verifyFilter === "all" ||
        (verifyFilter === "verified" && u.verified) ||
        (verifyFilter === "unverified" && !u.verified);

      return matchesSearch && matchesRole && matchesVerify;
    });
  }, [users, query, roleFilter, verifyFilter]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) =>
      `${j.title} ${j.client}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [jobs, query]);

  const toggleVerify = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, verified: !u.verified } : u)),
    );
  };

  const toggleBan = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, banned: !u.banned } : u)),
    );
  };

  const resolveDispute = (id) => {
    setDisputes((d) =>
      d.map((x) => (x.id === id ? { ...x, resolved: true } : x)),
    );
  };

  const metrics = useMemo(() => {
    return {
      verifiedProviders: users.filter((u) => u.verified).length,
      jobsPosted: jobs.length,
      acceptanceRate: 60,
    };
  }, [users, jobs]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    navigate("/admin", { replace: true });
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>{t(lang, "adminPanel")}</h2>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btn}>{t(lang, "refresh")}</button>
          <button style={styles.btnDanger} onClick={handleLogout}>
            {t(lang, "logout")}
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <strong>{t(lang, "metrics")}</strong>
          <div style={{ marginTop: 8 }}>
            <div>
              {t(lang, "verifiedProviders")}: {metrics.verifiedProviders}
            </div>
            <div>
              {t(lang, "jobsPosted")}: {metrics.jobsPosted}
            </div>
            <div>
              {t(lang, "acceptanceRate")}: {metrics.acceptanceRate}%
            </div>
          </div>

          <input
            placeholder="search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">All Roles</option>
            <option value="provider">Providers</option>
            <option value="customer">Customers</option>
          </select>

          <select
            value={verifyFilter}
            onChange={(e) => setVerifyFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">All Users</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </aside>

        <main style={styles.main}>
          <section>
            <h3>
              {t(lang, "users")} ({filteredUsers.length})
            </h3>

            {filteredUsers.map((u) => (
              <div key={u.id} style={styles.row}>
                <div>
                  <strong>{u.name}</strong>
                  <div style={{ fontSize: 12 }}>{u.phone}</div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button style={styles.smallBtn}>{t(lang, "view")}</button>

                  <button
                    style={styles.smallBtn}
                    onClick={() => toggleVerify(u.id)}
                  >
                    {u.verified ? t(lang, "revoke") : t(lang, "verify")}
                  </button>

                  <button
                    style={styles.smallBtn}
                    onClick={() => toggleBan(u.id)}
                  >
                    {u.banned ? t(lang, "unban") : t(lang, "ban")}
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h3>
              {t(lang, "jobs")} ({filteredJobs.length})
            </h3>

            {filteredJobs.map((j) => (
              <div key={j.id} style={styles.row}>
                <div>
                  <strong>{j.title}</strong>
                  <div style={{ fontSize: 12 }}>{j.client}</div>
                </div>

                <button style={styles.smallBtn}>{t(lang, "view")}</button>
              </div>
            ))}
          </section>

          <section>
            <h3>{t(lang, "disputes")}</h3>

            {disputes.map((d) => (
              <div key={d.id} style={styles.row}>
                <div>{d.text}</div>

                <button
                  style={styles.smallBtn}
                  onClick={() => resolveDispute(d.id)}
                  disabled={d.resolved}
                >
                  {d.resolved ? t(lang, "resolved") : t(lang, "resolve")}
                </button>
              </div>
            ))}
          </section>
        </main>
      </div>

      {photoModalSrc !== null && (
        <div style={styles.modalBack}>
          <div style={styles.modal}>
            <button style={styles.btn} onClick={() => setPhotoModalSrc(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 20, minHeight: "100vh", background: "#0f1723" },
  header: { display: "flex", justifyContent: "space-between", color: "#fff" },
  container: { display: "flex", gap: 16 },
  sidebar: { width: 250, background: "#fff", padding: 12, borderRadius: 8 },
  main: { flex: 1, background: "#fff", padding: 12, borderRadius: 8 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    border: "1px solid #eee",
    borderRadius: 6,
    marginBottom: 8,
  },
  btn: { background: "#0b1220", color: "#fff", border: "none", padding: 8 },
  btnDanger: {
    background: "#8b1a1a",
    color: "#fff",
    border: "none",
    padding: 8,
  },
  smallBtn: { padding: 6, background: "#f3f4f6", border: "1px solid #ddd" },
  input: {
    width: "100%",
    height: 42, // ← CRITICAL
    padding: "10px", // ← SAME for input & select
    borderRadius: 6,
    border: "1px solid #ddd",
    boxSizing: "border-box", // ← Prevent weird sizing
    fontSize: 14,
  },
  modalBack: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: { background: "#fff", padding: 20 },
};
