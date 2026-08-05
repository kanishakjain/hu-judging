"use client";

import { useState } from "react";
import { setRoundTeams, autoAdvanceTopN } from "@/app/organizer/hackathons/actions";
import SubmitButton from "@/components/SubmitButton";

export default function TeamSelectionPanel({ hackathonId, roundId, allTeams, selectedTeamIds, previousRoundId }) {
  const [selected, setSelected] = useState(new Set(selectedTeamIds));
  const [status, setStatus] = useState(null);
  const [topN, setTopN] = useState(15);
  const [busy, setBusy] = useState(false);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function save() {
    setBusy(true);
    const res = await setRoundTeams(hackathonId, roundId, Array.from(selected));
    setBusy(false);
    setStatus(res.error ? { error: res.error } : { success: "Saved." });
  }

  async function handleAutoAdvance() {
    if (!previousRoundId) return;
    setBusy(true);
    const res = await autoAdvanceTopN(hackathonId, roundId, previousRoundId, Number(topN));
    setBusy(false);
    if (res.error) {
      setStatus({ error: res.error });
    } else {
      setStatus({ success: `Advanced top ${topN}.` });
      window.location.reload();
    }
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 className="subtitle">Teams in this round</h2>

      {previousRoundId && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <span className="muted" style={{ fontSize: 13 }}>Auto-advance top</span>
          <input
            className="input mono"
            style={{ width: 70 }}
            type="number"
            value={topN}
            onChange={(e) => setTopN(e.target.value)}
          />
          <span className="muted" style={{ fontSize: 13 }}>from the previous round</span>
          <button className="btn btn-secondary btn-sm" onClick={handleAutoAdvance} disabled={busy}>
            Advance
          </button>
        </div>
      )}

      {status?.error && <div className="alert alert-error">{status.error}</div>}
      {status?.success && <div className="alert alert-success">{status.success}</div>}

      {!allTeams?.length && <div className="empty">No teams in this hackathon yet.</div>}

      <div style={{ maxHeight: 320, overflowY: "auto", marginBottom: 16 }}>
        {allTeams?.map((t) => (
          <label key={t.id} className="list-item" style={{ cursor: "pointer" }}>
            <span>{t.name} {t.project_link ? `(ID: ${t.project_link})` : ""}</span>
            <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />
          </label>
        ))}
      </div>

      <button className="btn btn-primary" onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save team list"}
      </button>
    </div>
  );
}
