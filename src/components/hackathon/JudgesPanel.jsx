"use client";

import { useState } from "react";
import { addJudge, deleteJudge } from "@/app/organizer/hackathons/actions";
import SubmitButton from "@/components/SubmitButton";
import CsvImportJudges from "./CsvImportJudges";

function randomCode() {
  return "J-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function randomPassword() {
  return Math.random().toString(36).slice(2, 10);
}

export default function JudgesPanel({ hackathonId, judges }) {
  const [error, setError] = useState(null);
  const [defaults, setDefaults] = useState({ code: randomCode(), password: randomPassword() });

  async function handleAdd(formData) {
    const res = await addJudge(hackathonId, formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setError(null);
      document.getElementById("add-judge-form")?.reset();
      setDefaults({ code: randomCode(), password: randomPassword() });
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <form id="add-judge-form" action={handleAdd} style={{ flex: 1, minWidth: 240 }}>
            {error && <div className="alert alert-error">{error}</div>}
          <div className="field">
            <label htmlFor="judge-name">Name</label>
            <input className="input" id="judge-name" name="name" required />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="judge-company">Company (Optional)</label>
              <input className="input" id="judge-company" name="company" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="judge-designation">Designation (Optional)</label>
              <input className="input" id="judge-designation" name="designation" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="judge-code">Judge ID</label>
              <input className="input mono" id="judge-code" name="judgeCode" defaultValue={defaults.code} required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="judge-password">Password</label>
              <input className="input mono" id="judge-password" name="password" defaultValue={defaults.password} required />
            </div>
          </div>
          <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
            Auto-generated — edit if you&apos;d rather set your own. Share these with the judge.
          </p>
            <SubmitButton pendingText="Adding…">Add judge</SubmitButton>
          </form>
          <CsvImportJudges hackathonId={hackathonId} />
        </div>
      </div>

      {!judges?.length && <div className="empty">No judges yet.</div>}

      {judges?.map((j) => (
        <div key={j.id} className="list-item">
          <div>
            <div style={{ fontWeight: 600 }}>
              {j.name || "Unnamed judge"}
              {j.company && <span className="muted" style={{ fontWeight: 400, marginLeft: 8 }}>{j.company}</span>}
              {j.designation && <span className="muted" style={{ fontWeight: 400, marginLeft: 4 }}>- {j.designation}</span>}
            </div>
            <div className="mono muted" style={{ fontSize: 12 }}>
              ID: {j.judge_code} · Password: {j.password}
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => deleteJudge(hackathonId, j.id, j.auth_user_id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
