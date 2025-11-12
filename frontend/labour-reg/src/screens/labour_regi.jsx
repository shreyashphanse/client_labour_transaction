import React, { useRef } from "react";
import FormCard from "../components/FormCard";
import { ensureMobileFocus } from "../utils/mobileFocus";

export default function LabourRegi() {
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const name = document.getElementById("name").value.trim();
    const dob = document.getElementById("dob").value.trim();


    if (!phone) {
      alert("Phone number required");
      document.getElementById("phone").focus();
      return;
    }
    if (!dob) {
  alert("Date of birth is required");
  document.getElementById("dob").focus();
  return;
}

// Validate age ≥ 18
const birthDate = new Date(dob);
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  age--;
}

if (isNaN(age)) {
  alert("Please select a valid date of birth");
  document.getElementById("dob").focus();
  return;
}

if (age < 18) {
  alert("You must be at least 18 years old to register");
  document.getElementById("dob").focus();
  return;
}


    console.log({ phone, email, name, dob });
    alert("Form logged — backend connection coming next.");
  };

  return (
    <div className="page-root">
      <FormCard title="Registration for labour">
        <form ref={formRef} className="form" onSubmit={handleSubmit}>

          <label className="field">
            <span className="label-text">Name</span>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter full name"
              onFocus={ensureMobileFocus}
              required
              className="input"
            />
          </label>

          <label className="field">
            <span className="label-text">Phone no.</span>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="Enter phone number"
              onFocus={ensureMobileFocus}
              required
              className="input"
            />
          </label>

          <label className="field">
            <span className="label-text">Email (optional)</span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email (optional)"
              onFocus={ensureMobileFocus}
              className="input"
            />
          </label>

          

          <label className="field">
  <span className="label-text">Date of Birth</span>
  <input
    id="dob"
    name="dob"
    type="date"
    onFocus={ensureMobileFocus}
    required
    className="input"
  />
</label>


          <button id="registerBtn" className="submit-btn" type="submit">
            Register
          </button>
        </form>

        <style jsx>{`
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
          .input:focus {
            box-shadow: 0 0 0 4px rgba(43, 110, 246, 0.08);
            border-color: #2b6ef6;
          }
          .submit-btn {
            margin-top: 6px;
            height: 46px;
            border-radius: 10px;
            border: none;
            background: #2b6ef6;
            color: white;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
          }
          @media (max-width: 480px) {
            .page-root {
              padding-bottom: env(safe-area-inset-bottom, 24px);
            }
          }
        `}</style>
      </FormCard>
    </div>
  );
}
