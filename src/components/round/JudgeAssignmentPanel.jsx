"use client";

import { useState, useTransition } from "react";
import { setJudgeAssignments } from "@/app/organizer/hackathons/actions";

function JudgeRow({ hackathonId, roundId, judge, roundTeams, initialTeamIds }) {
  const [selected, setSelected] = useState(new Set(initialTeamIds));
  const [isPending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  function toggle(id) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
    setJustSaved(false);

    startTransition(async () => {
      await setJudgeAssignments(hackathonId, roundId, judge.id, Array.from(next));
      setJustSaved(true);
    });
  }

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 600 }}>{judge.name || judge.judge_code}</div>
          <div className="mono muted" style={{ fontSize: 12 }}>{judge.judge_code}</div>
        </div>
        <span className="muted" style={{ fontSize: 12 }}>
          {isPending ? "Saving…" : justSaved ? "Saved ✓" : ""}
        </span>
      </div>

      {!roundTeams?.length && <p className="muted" style={{ fontSize: 13 }}>Add teams to this round first.</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {roundTeams?.map((t) => {
          const active = selected.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className={`badge ${active ? "badge-active" : ""}`}
              style={{ cursor: "pointer", background: active ? undefined : "transparent" }}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function JudgeAssignmentPanel({ hackathonId, roundId, judges, roundTeams, assignments }) {
  return (
    <div>
      <h2 className="subtitle">Assign teams to judges</h2>
      <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
        Tap a team to toggle it for that judge — saves automatically.
      </p>
      {!judges?.length && <div className="empty">No judges added to this hackathon yet.</div>}
      {judges?.map((j) => {
        const initialTeamIds = assignments.filter((a) => a.judge_id === j.id).map((a) => a.team_id);
        return (
          <JudgeRow
            key={j.id}
            hackathonId={hackathonId}
            roundId={roundId}
            judge={j}
            roundTeams={roundTeams}
            initialTeamIds={initialTeamIds}
          />
        );
      })}
    </div>
  );
}
