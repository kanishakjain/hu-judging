"use client";

import { useState } from "react";
import { addTeam, deleteTeam } from "@/app/organizer/hackathons/actions";
import SubmitButton from "@/components/SubmitButton";
import CsvImportTeams from "./CsvImportTeams";

export default function TeamsPanel({ hackathonId, teams }) {
  const [error, setError] = useState(null);

  async function handleAdd(formData) {
    const res = await addTeam(hackathonId, formData);
    if (res?.error) setError(res.error);
    else {
      setError(null);
      document.getElementById("add-team-form")?.reset();
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <form id="add-team-form" action={handleAdd} style={{ flex: 1, minWidth: 240 }}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="field">
              <label htmlFor="team-name">Team name</label>
              <input className="input" id="team-name" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="team-members">Members</label>
              <input className="input" id="team-members" name="members" placeholder="Comma separated" />
            </div>
            <div className="field">
              <label htmlFor="team-link">Project link</label>
              <input className="input" id="team-link" name="projectLink" placeholder="https://…" />
            </div>
            <SubmitButton pendingText="Adding…">Add team</SubmitButton>
          </form>
          <CsvImportTeams hackathonId={hackathonId} />
        </div>
      </div>

      {!teams?.length && <div className="empty">No teams yet.</div>}

      {teams?.map((t) => (
        <div key={t.id} className="list-item">
          <div>
            <div style={{ fontWeight: 600 }}>{t.name}</div>
            {t.members && <div className="muted" style={{ fontSize: 13 }}>{t.members}</div>}
            {t.project_link && (
              <a href={t.project_link} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 12, color: "var(--accent)" }}>
                {t.project_link}
              </a>
            )}
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => deleteTeam(hackathonId, t.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
