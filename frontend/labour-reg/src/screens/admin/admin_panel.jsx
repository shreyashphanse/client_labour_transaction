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
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [userSort, setUserSort] = useState("newest");
  const [jobSort, setJobSort] = useState("newest");

  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const openConfirm = (title, message, onConfirm) => {
    setConfirmModal({ title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal(null);
  };

  /*
confirmModal = {
   title,
   message,
   onConfirm
}
*/

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
  // const fetchMetrics = async () => {
  //   try {
  //     const res = await axios.get("/api/admin/metrics");
  //     setMetrics(res.data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

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
    let result = users.filter((u) => {
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

    if (userSort === "score_low")
      result.sort((a, b) => a.reliabilityScore - b.reliabilityScore);

    if (userSort === "score_high")
      result.sort((a, b) => b.reliabilityScore - a.reliabilityScore);

    if (userSort === "verified")
      result.sort((a, b) =>
        a.verificationStatus.localeCompare(b.verificationStatus),
      );

    if (userSort === "newest")
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [users, query, roleFilter, verifyFilter, userSort]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter((j) =>
      `${j.title} ${j.client}`.toLowerCase().includes(query.toLowerCase()),
    );

    if (jobSort === "budget_low")
      result.sort((a, b) => a.offeredPrice - b.offeredPrice);

    if (jobSort === "budget_high")
      result.sort((a, b) => b.offeredPrice - a.offeredPrice);

    if (jobSort === "newest")
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [jobs, query, jobSort]);

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

  const resolveDispute = async (id, decisionAgainst) => {
    try {
      const note = prompt("Resolution note:");

      await axios.patch(`/api/admin/disputes/${id}/resolve`, {
        adminNote: note,
        decisionAgainst,
      });

      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectDispute = async (id) => {
    try {
      const note = prompt("Rejection reason:");

      await axios.patch(`/api/admin/disputes/${id}/reject`, {
        adminNote: note,
      });

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
          <select
            value={userSort}
            onChange={(e) => setUserSort(e.target.value)}
            style={styles.input}
          >
            <option value="newest">Newest Users</option>
            <option value="score_low">Low Score First</option>
            <option value="score_high">High Score First</option>
            <option value="verified">Verification Order</option>
          </select>

          <select
            value={jobSort}
            onChange={(e) => setJobSort(e.target.value)}
            style={styles.input}
          >
            <option value="newest">Newest Jobs</option>
            <option value="budget_low">Low Budget First</option>
            <option value="budget_high">High Budget First</option>
          </select>
        </aside>

        <main style={styles.main}>
          <section>
            <h3>
              {t(lang, "users")} ({filteredUsers.length})
            </h3>

            {filteredUsers.map((u) => {
              return (
                <div key={u._id} style={styles.row}>
                  <div>
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: 12 }}>{u.phone}</div>

                    <div
                      style={{
                        ...styles.statusText,
                        ...(u.verificationStatus === "unverified"
                          ? styles.statusDanger
                          : u.verificationStatus === "basic_verified"
                            ? styles.statusWarning
                            : styles.statusSuccess),
                      }}
                    >
                      {u.verificationStatus}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color:
                          u.riskLevel === "dangerous"
                            ? "#dc2626"
                            : u.riskLevel === "risky"
                              ? "#b45309"
                              : "#16a34a",
                      }}
                    >
                      Risk: {u.riskLevel}
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <button
                      style={styles.smallBtn}
                      onClick={() => setSelectedUser(u)}
                    >
                      {t(lang, "view")}
                    </button>

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
                      onClick={() =>
                        openConfirm(
                          "Reset Verification",
                          "User will become unverified.",
                          () => updateVerification(u._id, "reset"),
                        )
                      }
                    >
                      Reset
                    </button>

                    <button
                      style={styles.smallBtn}
                      onClick={() =>
                        openConfirm(
                          u.banned ? "Unban User" : "Ban User",
                          u.banned
                            ? "Restore account access?"
                            : "User will lose system access.",
                          () => toggleBan(u._id),
                        )
                      }
                    >
                      {u.banned ? t(lang, "unban") : t(lang, "ban")}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          <section>
            <h3>
              {t(lang, "jobs")} ({filteredJobs.length})
            </h3>

            {filteredJobs.map((j) => {
              return (
                <div key={j._id} style={styles.row}>
                  <div>
                    <strong>{j.title}</strong>
                    <div style={{ fontSize: 12 }}>{j.client}</div>

                    <div
                      style={{
                        ...styles.statusText,
                        ...(j.status === "cancelled"
                          ? styles.statusDanger
                          : j.status === "completed"
                            ? styles.statusSuccess
                            : styles.statusWarning),
                      }}
                    >
                      {j.status}
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <button
                      style={styles.smallBtn}
                      onClick={() => setSelectedJob(j)}
                    >
                      {t(lang, "view")}
                    </button>

                    <button
                      style={styles.smallBtn}
                      onClick={() =>
                        openConfirm(
                          "Cancel Job",
                          "Force cancel this job?",
                          () => forceCancel(j._id),
                        )
                      }
                    >
                      Cancel
                    </button>

                    <button
                      style={styles.smallBtnDanger}
                      onClick={() =>
                        openConfirm(
                          "Delete Job",
                          "This action cannot be undone.",
                          () => deleteJob(j._id),
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          <section>
            <h3>
              {t(lang, "disputes")} ({disputes.length})
            </h3>

            {[...disputes]
              .sort((a, b) => {
                const order = { high: 3, medium: 2, low: 1 };
                return order[b.severity] - order[a.severity];
              })
              .map((d) => (
                <div key={d._id} style={styles.disputeRow}>
                  <div style={{ flex: 1 }}>
                    <strong>{d.job?.title || "Unknown Job"}</strong>

                    {d.type === "payment" && (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#059669",
                        }}
                      >
                        💰 PAYMENT DISPUTE
                      </div>
                    )}
                    {/* {d.type === "payment" && <span>💰💰</span>} */}

                    <div style={{ fontSize: 12, color: "#666" }}>
                      {d.raisedBy?.name} → {d.against?.name}
                    </div>

                    <div style={{ marginTop: 4 }}>{d.text}</div>

                    <div
                      style={{
                        ...styles.statusText,
                        ...(d.severity === "high"
                          ? styles.statusDanger
                          : d.severity === "medium"
                            ? styles.statusWarning
                            : styles.statusSuccess),
                      }}
                    >
                      {d.status} • {d.severity}
                    </div>

                    {d.adminNote && (
                      <div style={styles.adminNote}>
                        Admin Note: {d.adminNote}
                      </div>
                    )}
                  </div>

                  {d.status === "pending" && (
                    <div style={styles.actions}>
                      <button
                        style={styles.smallBtn}
                        onClick={() => {
                          const loser = prompt(
                            `Who loses?\n1 = ${d.raisedBy?.name}\n2 = ${d.against?.name}`,
                          );

                          const decisionAgainst =
                            loser === "1" ? d.raisedBy._id : d.against._id;

                          resolveDispute(d._id, decisionAgainst);
                        }}
                      >
                        Resolve
                      </button>

                      <button
                        style={styles.smallBtnDanger}
                        onClick={() => rejectDispute(d._id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </section>
        </main>
      </div>
      {confirmModal && (
        <div style={styles.modalBack}>
          <div style={styles.modal}>
            <h3>{confirmModal.title}</h3>

            <p style={{ color: "#555" }}>{confirmModal.message}</p>

            <div style={styles.modalActions}>
              <button style={styles.smallBtn} onClick={closeConfirm}>
                Cancel
              </button>

              <button
                style={styles.smallBtnDanger}
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirm();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedUser && (
        <div style={styles.modalBack}>
          <div style={styles.modal}>
            <h3>User Details</h3>

            <div style={styles.detailsGrid}>
              <div>
                <strong>Name:</strong> {selectedUser.name}
              </div>
              <div>
                <strong>Phone:</strong> {selectedUser.phone}
              </div>

              <div>
                <strong>Role:</strong> {selectedUser.role}
              </div>
              <div>
                <strong>Status:</strong> {selectedUser.verificationStatus}
              </div>
              <div>
                <strong>Reliability:</strong> {selectedUser.reliabilityScore}
              </div>
              <div>
                <strong>Station Range:</strong>{" "}
                {selectedUser.stationRange?.start &&
                selectedUser.stationRange?.end
                  ? `${selectedUser.stationRange.start} → ${selectedUser.stationRange.end}`
                  : "Not Provided"}
              </div>
              <div>
                <strong>Skills:</strong>{" "}
                {selectedUser.skills?.length
                  ? selectedUser.skills.join(", ")
                  : "None"}
              </div>
              <div>
                <strong>Banned:</strong> {selectedUser.banned ? "Yes" : "No"}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.smallBtn}
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedJob && (
        <div style={styles.modalBack}>
          <div style={styles.modal}>
            <h3>Job Details</h3>

            <div style={styles.detailsGrid}>
              <div>
                <strong>Title:</strong> {selectedJob.title}
              </div>
              <div>
                <strong>Client:</strong> {selectedJob.client}
              </div>
              <div>
                <strong>Labour:</strong> {selectedJob.labour || "Unassigned"}
              </div>
              <div>
                <strong>Status:</strong> {selectedJob.status}
              </div>
              <div>
                <strong>Budget:</strong> ₹{selectedJob.offeredPrice}
              </div>
              <div>
                <strong>Skill:</strong> {selectedJob.skill}
              </div>
              <div>
                <strong>Station:</strong> {selectedJob.stationRange?.start} →{" "}
                {selectedJob.stationRange?.end}
              </div>
              <div>
                <strong>Accepted:</strong> {selectedJob.accepted ? "Yes" : "No"}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.smallBtn}
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
  modalBack: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: 420,
    background: "#fff",
    padding: 20,
    borderRadius: 10,
  },

  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    justifyContent: "flex-end",
  },
  detailsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 12,
    fontSize: 14,
  },
  statusText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statusDanger: {
    color: "#dc2626", // red
  },

  statusWarning: {
    color: "#b45309", // yellow-greenish tone
  },

  statusSuccess: {
    color: "#16a34a", // green
  },

  disputeRow: {
    display: "flex",
    gap: 10,
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },

  adminNote: {
    marginTop: 6,
    fontSize: 12,
    background: "#f9fafb",
    padding: 6,
    borderRadius: 6,
    color: "#444",
  },
};
