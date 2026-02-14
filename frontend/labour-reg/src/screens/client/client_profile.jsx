import React, { useEffect, useState, useRef } from "react";
import FormCard from "../../components/FormCard";
import { t } from "../../utils/i18n";

const styles = `
  :root {
    --bg-100: #0f1720;
    --panel: #1a1f24;
    --muted: #72797c;
    --accent: #696969;
    --accent-strong: #6e6e6e;
    --input-bg: #101418;
    --border: rgba(230, 230, 230, 0.06);
    --text: #5a5c5f;
  }

  .profile-root {
    padding: 28px;
    background: linear-gradient(180deg, #0b0d0f, #0f1316);
    min-height: 100vh;
    color: var(--text);
    max-width: 1100px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .welcome {
    margin: 0;
    font-size: 20px;
    color: var(--accent-strong);
  }

  .sub {
    margin-top: 6px;
    color: var(--muted);
    font-size: 13px;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .btn {
    background: linear-gradient(180deg, #32373b, #1f2427);
    color: var(--accent-strong);
    border: 1px solid rgba(255, 255, 255, 0.04);
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  .btn.cancel {
    background: transparent;
    color: var(--muted);
  }

  .profile-row {
    display: flex;
    gap: 20px;
  }

  .left {
    width: 34%;
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .avatar-wrap {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    overflow: hidden;
    background: radial-gradient(circle, #2b2f33, #111315);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.6);
    border: 2px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
  }

  .avatar-wrap.editable {
    cursor: pointer;
    outline: 2px dashed rgba(255, 255, 255, 0.12);
  }

  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .display-name {
    font-weight: 700;
    font-size: 18px;
    color: var(--accent-strong);
  }

  .email {
    margin-top: 6px;
    font-size: 13px;
    color: var(--muted);
  }

  .status-note {
    margin-top: 8px;
    font-size: 13px;
    color: var(--muted);
    font-weight: 600;
  }

  .right {
    flex: 1;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 22px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label-text {
    font-size: 12px;
    color: var(--muted);
  }

  .input {
    height: 44px;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    font-size: 14px;
    outline: none;
    color: var(--text);
  }

  .input.locked {
    background: #0c0f10;
    color: var(--muted);
  }

  .tc-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 6px;
  }

  .tc-label {
    font-size: 13px;
    color: var(--muted);
  }

  .muted-note {
    font-size: 12px;
    color: var(--muted);
    margin-top: 6px;
  }

  @media (max-width: 900px) {
    .profile-row {
      flex-direction: column;
    }

    .left {
      width: 100%;
    }

    .grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default function ClientProfileTop({ lang }) {
  const [editing, setEditing] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const [fullName, setFullName] = useState("Jane Client");
  const [phone] = useState("+91-9876543210");

  // ✅ Email locked
  const [email] = useState("janec@example.com");

  // ✅ New compulsory address
  const [address, setAddress] = useState("");

  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("1998-05-10");

  const [verificationStatus] = useState("unverified");

  const [tcConsented, setTcConsented] = useState(false);
  const [tcTimestamp, setTcTimestamp] = useState("");

  const fileInputRef = useRef(null);
  const PLACEHOLDER = "/src/assets/default_profile.png";

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(PLACEHOLDER);

  useEffect(() => {
    if (!profilePhotoFile) return;
    const url = URL.createObjectURL(profilePhotoFile);
    setProfilePhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profilePhotoFile]);

  const handleSave = () => {
    if (!fullName.trim()) return alert(t(lang, "fullNameRequired"));
    if (!address.trim()) return alert(t(lang, "addressRequired"));
    if (!tcConsented) return alert(t(lang, "tcRequired"));

    setEditing(false);
    alert(t(lang, "profileSaved"));
  };

  const handleCancel = () => {
    if (!originalData) return;

    setFullName(originalData.fullName);
    setAddress(originalData.address);
    setGender(originalData.gender);
    setDob(originalData.dob);
    setProfilePhotoPreview(originalData.profilePhotoPreview);

    setEditing(false);
  };

  const onAvatarClick = () => {
    if (editing) fileInputRef.current?.click();
  };

  const onSelectProfilePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return alert(t(lang, "invalidImage"));
    setProfilePhotoFile(f);
  };

  const onTcToggle = (checked) => {
    setTcConsented(checked);
    setTcTimestamp(checked ? new Date().toISOString() : "");
  };

  return (
    <div className="profile-root">
      <style>{styles}</style>

      <div className="page-header">
        <div>
          <h2 className="welcome">{t(lang, "profile")}</h2>
          <div className="sub">{t(lang, "manageAccount")}</div>
        </div>

        <div className="actions">
          <button
            className="btn"
            onClick={() => {
              if (editing) handleSave();
              else {
                setOriginalData({
                  fullName,
                  address,
                  gender,
                  dob,
                  profilePhotoPreview,
                });

                setEditing(true);
              }
            }}
          >
            {editing ? t(lang, "save") : t(lang, "edit")}
          </button>

          {editing && (
            <button className="btn cancel" onClick={() => handleCancel()}>
              {t(lang, "cancel")}
            </button>
          )}
        </div>
      </div>

      <FormCard>
        <div className="profile-row">
          <div className="left">
            <div
              className={`avatar-wrap ${editing ? "editable" : ""}`}
              onClick={onAvatarClick}
            >
              <img src={profilePhotoPreview} className="avatar" />
            </div>

            <div className="identity">
              <div className="display-name">{fullName}</div>
              <div className="email">{email}</div>
              <div className="status-note">
                {t(lang, "status")}: {verificationStatus}
              </div>
            </div>
          </div>

          <div className="right">
            <div className="grid">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onSelectProfilePhoto}
                style={{ display: "none" }}
              />

              <label className="field">
                <span className="label-text">{t(lang, "fullName")}</span>
                <input
                  value={fullName}
                  readOnly={!editing}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                />
              </label>

              <label className="field">
                <span className="label-text">{t(lang, "phoneRegistered")}</span>
                <input value={phone} readOnly className="input locked" />
              </label>

              {/* ✅ Locked Email */}
              <label className="field">
                <span className="label-text">{t(lang, "email")}</span>
                <input value={email} readOnly className="input locked" />
              </label>

              {/* ✅ Primary Address */}
              <label className="field">
                <span className="label-text">{t(lang, "primaryAddress")}</span>
                <input
                  value={address}
                  readOnly={!editing}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input"
                />
              </label>

              <label className="field">
                <span className="label-text">{t(lang, "gender")}</span>
                <select
                  value={gender}
                  disabled={!editing}
                  onChange={(e) => setGender(e.target.value)}
                  className="input"
                >
                  <option value="">{t(lang, "select")}</option>
                  <option value="male">{t(lang, "male")}</option>
                  <option value="female">{t(lang, "female")}</option>
                </select>
              </label>

              <label className="field">
                <span className="label-text">{t(lang, "dob")}</span>
                <input
                  type="date"
                  value={dob}
                  readOnly={!editing}
                  onChange={(e) => setDob(e.target.value)}
                  className="input"
                />
              </label>

              {/* TERMS */}
              <div className="field">
                <div className="tc-row">
                  <input
                    type="checkbox"
                    checked={tcConsented}
                    onChange={(e) => onTcToggle(e.target.checked)}
                    disabled={!editing}
                  />
                  <label className="tc-label">{t(lang, "acceptTc")}</label>
                </div>

                <div className="muted-note">
                  {tcTimestamp
                    ? `${t(lang, "consentedOn")}: ${new Date(
                        tcTimestamp,
                      ).toLocaleString()}`
                    : t(lang, "notConsented")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormCard>
    </div>
  );
}
