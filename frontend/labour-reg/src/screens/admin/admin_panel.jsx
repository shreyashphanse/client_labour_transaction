import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { t } from "../../utils/i18n";

export default function AdminPanel({ lang }) {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [roleFilter, setRoleFilter] = useState("all");
  const [verifyFilter, setVerifyFilter] = useState("all");
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);

  const updateVerification = async (id, action) => {
    const oldUsers = users;

    setUsers((prev) =>
      prev.map((u) => {
        if (u._id !== id) return u;

        let newStatus = u.verificationStatus;

        if (action === "promote") {
          if (u.verificationStatus === "unverified")
            newStatus = "basic_verified";
          else if (u.verificationStatus === "basic_verified")
            newStatus = "trusted_verified";
        }

        if (action === "demote") {
          if (u.verificationStatus === "trusted_verified")
            newStatus = "basic_verified";
          else if (u.verificationStatus === "basic_verified")
            newStatus = "unverified";
        }

        if (action === "reset") {
          newStatus = "unverified";
        }

        return { ...u, verificationStatus: newStatus };
      }),
    );

    try {
      await axios.patch(`/api/admin/users/${id}/verification`, { action });
    } catch (err) {
      console.error(err);
      setUsers(oldUsers);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [usersRes, jobsRes, disputesRes, metricsRes] = await Promise.all([
        axios.get("/api/admin/users"),
        axios.get("/api/admin/jobs"),
        axios.get("/api/admin/disputes"),
        axios.get("/api/admin/metrics"),
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setDisputes(Array.isArray(disputesRes.data) ? disputesRes.data : []);
      setMetrics(metricsRes.data);
    } catch (err) {
      console.error("Admin fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ✅ FIXED LOGIC */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = `${u.name} ${u.phone}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      const isVerified = u.verificationStatus !== "unverified";

      const matchesVerify =
        verifyFilter === "all" ||
        (verifyFilter === "verified" && isVerified) ||
        (verifyFilter === "unverified" && !isVerified);

      return matchesSearch && matchesRole && matchesVerify;
    });
  }, [users, query, roleFilter, verifyFilter]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) =>
      `${j.title} ${j.client}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [jobs, query]);

  const toggleBan = async (id) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, banned: !u.banned } : u)),
    );

    try {
      await axios.patch(`/api/admin/users/${id}/ban`);
    } catch (err) {
      console.error(err);
      fetchDashboard();
    }
  };

  const forceCancel = async (id) => {
    setJobs((prev) =>
      prev.map((j) => (j._id === id ? { ...j, status: "cancelled" } : j)),
    );

    try {
      await axios.patch(`/api/admin/jobs/${id}/cancel`);
    } catch (err) {
      console.error(err);
      fetchDashboard();
    }
  };

  const deleteJob = async (id) => {
    const oldJobs = jobs;

    setJobs((prev) => prev.filter((j) => j._id !== id));

    try {
      await axios.delete(`/api/admin/jobs/${id}`);
    } catch (err) {
      console.error(err);
      setJobs(oldJobs);
    }
  };

  const resolveDispute = async (id) => {
    try {
      await axios.patch(`/api/admin/disputes/${id}/resolve`);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    navigate("/admin", { replace: true });
  };

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: 40 }}>Loading admin data...</div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>{t(lang, "adminPanel")}</h2>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btn} onClick={fetchDashboard}>
            {t(lang, "refresh")}
          </button>

          <button style={styles.btnDanger} onClick={handleLogout}>
            {t(lang, "logout")}
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <strong>{t(lang, "metrics")}</strong>

          {metrics && (
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
          )}

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
              <div key={u._id} style={styles.row}>
                <div>
                  <strong>{u.name}</strong>
                  <div style={{ fontSize: 12 }}>{u.phone}</div>
                </div>

                <div style={styles.actions}>
                  <button style={styles.smallBtn}>{t(lang, "view")}</button>

                  <button
                    style={styles.smallBtn}
                    onClick={() => updateVerification(u._id, "promote")}
                  >
                    Promote
                  </button>

                  <button
                    style={styles.smallBtn}
                    onClick={() => updateVerification(u._id, "demote")}
                  >
                    Demote
                  </button>

                  <button
                    style={styles.smallBtnDanger}
                    onClick={() => updateVerification(u._id, "reset")}
                  >
                    Reset
                  </button>

                  <button
                    style={styles.smallBtn}
                    onClick={() => toggleBan(u._id)}
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
              <div key={j._id} style={styles.row}>
                <div>
                  <strong>{j.title}</strong>
                  <div style={{ fontSize: 12 }}>{j.client}</div>
                </div>

                <div style={styles.actions}>
                  <button style={styles.smallBtn}>{t(lang, "view")}</button>

                  <button
                    style={styles.smallBtn}
                    onClick={() => forceCancel(j._id)}
                  >
                    Cancel
                  </button>

                  <button
                    style={styles.smallBtnDanger}
                    onClick={() => deleteJob(j._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h3>{t(lang, "disputes")}</h3>

            {disputes.map((d) => (
              <div key={d._id} style={styles.row}>
                <div>{d.text}</div>

                <button
                  style={styles.smallBtn}
                  onClick={() => resolveDispute(d._id)}
                  disabled={d.resolved}
                >
                  {d.resolved ? t(lang, "resolved") : t(lang, "resolve")}
                </button>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 20, minHeight: "100vh", background: "#0f1723" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    color: "#fff",
    marginBottom: 16,
  },
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
    alignItems: "center",
  },
  actions: { display: "flex", gap: 6 },
  btn: {
    background: "#0b1220",
    color: "#fff",
    border: "none",
    padding: 8,
    borderRadius: 6,
    cursor: "pointer",
  },
  btnDanger: {
    background: "#8b1a1a",
    color: "#fff",
    border: "none",
    padding: 8,
    borderRadius: 6,
    cursor: "pointer",
  },
  smallBtn: {
    padding: 6,
    background: "#f3f4f6",
    border: "1px solid #ddd",
    borderRadius: 6,
    cursor: "pointer",
  },
  smallBtnDanger: {
    padding: 6,
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 6,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    height: 42,
    padding: "10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    boxSizing: "border-box",
    fontSize: 14,
    marginTop: 10,
  },
};
