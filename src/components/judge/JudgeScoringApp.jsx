"use client";

import { useMemo, useState, useEffect } from "react";
import { submitScore } from "@/app/judge/actions";

export default function JudgeScoringApp({ roundsData }) {
  const activeRounds = roundsData.filter((r) => r.round.status !== "completed");
  const list = activeRounds.length ? activeRounds : roundsData;

  const [roundIndex, setRoundIndex] = useState(0);
  const [teamId, setTeamId] = useState(list[0]?.teams[0]?.id || "");

  const current = list[roundIndex];

  if (!list.length) {
    return <div className="empty">You don&apos;t have any teams assigned yet. Check back once your organizer sets up assignments.</div>;
  }

  function handleRoundChange(index) {
    setRoundIndex(index);
    setTeamId(list[index]?.teams[0]?.id || "");
  }

  function handleNextTeam() {
    const currentIndex = current.teams.findIndex(t => t.id === teamId);
    if (currentIndex < current.teams.length - 1) {
      setTeamId(current.teams[currentIndex + 1].id);
    }
  }

  function handlePrevTeam() {
    const currentIndex = current.teams.findIndex(t => t.id === teamId);
    if (currentIndex > 0) {
      setTeamId(current.teams[currentIndex - 1].id);
    }
  }

  const selectedTeam = current.teams.find((t) => t.id === teamId);
  const existingSubmission = current.submissions.find((s) => s.team_id === teamId);
  const currentIndex = current.teams.findIndex(t => t.id === teamId);

  return (
    <div>
      {list.length > 1 && (
        <div className="field" style={{ maxWidth: 320, marginBottom: 24 }}>
          <label htmlFor="round-select">Round</label>
          <select
            id="round-select"
            className="input"
            value={roundIndex}
            onChange={(e) => handleRoundChange(Number(e.target.value))}
          >
            {list.map((r, i) => (
              <option key={r.round.id} value={i}>
                {r.round.name} ({r.round.status})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="scoring-layout">
        <div className="scoring-sidebar">
          <h3 className="eyebrow" style={{ padding: "0 4px" }}>Teams ({current.teams.length})</h3>
          {!current.teams.length && <div className="muted" style={{ fontSize: 13, padding: "0 4px" }}>No teams assigned</div>}
          {current.teams.map((t) => {
            const sub = current.submissions.find((s) => s.team_id === t.id);
            const isDone = sub?.submitted;
            const isActive = t.id === teamId;
            return (
              <button 
                key={t.id} 
                className={`team-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => setTeamId(t.id)}
              >
                <span>{t.name}</span>
                {isDone && <span className="status-dot done" title="Evaluated"></span>}
              </button>
            );
          })}
        </div>

        <div className="scoring-main">
          {selectedTeam ? (
            <ScoreForm
              key={`${current.round.id}-${teamId}`}
              roundId={current.round.id}
              team={selectedTeam}
              criteria={current.criteria}
              existingSubmission={existingSubmission}
              onNext={currentIndex < current.teams.length - 1 ? handleNextTeam : null}
              onPrev={currentIndex > 0 ? handlePrevTeam : null}
            />
          ) : (
            <div className="empty">Select a team to score</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreForm({ roundId, team, criteria, existingSubmission, onNext, onPrev }) {
  const initialScores = useMemo(() => {
    const map = {};
    criteria.forEach((c) => {
      const existing = existingSubmission?.score_details?.find((s) => s.criterion_id === c.id);
      map[c.id] = existing ? existing.value : "";
    });
    return map;
  }, [criteria, existingSubmission]);

  const [scores, setScores] = useState(initialScores);
  const [feedback, setFeedback] = useState(existingSubmission?.feedback || "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [saveIndicator, setSaveIndicator] = useState("");

  const total = criteria.reduce((sum, c) => sum + (Number(scores[c.id]) || 0), 0);
  const maxTotal = criteria.reduce((sum, c) => sum + Number(c.max_score), 0);

  // Auto-clear success message
  useEffect(() => {
    if (status?.success || saveIndicator) {
      const timer = setTimeout(() => {
        setStatus(null);
        setSaveIndicator("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, saveIndicator]);

  async function handleSubmit(e, goNext = false) {
    if (e && e.preventDefault) e.preventDefault();
    setBusy(true);
    setStatus(null);
    const res = await submitScore({ roundId, teamId: team.id, feedback, scores });
    setBusy(false);
    
    if (res.error) {
      setStatus({ error: res.error });
    } else {
      if (goNext && onNext) {
        onNext();
      } else {
        setSaveIndicator(existingSubmission?.submitted ? "Updated successfully!" : "Submitted successfully!");
      }
    }
  }

  if (!criteria.length) {
    return <div className="alert alert-error">This round has no judging criteria yet — ask your organizer to add some.</div>;
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 className="title" style={{ fontSize: 24, marginBottom: 8 }}>{team.name}</h2>
          {team.members && <p className="muted" style={{ fontSize: 14, marginBottom: 8 }}>{team.members}</p>}
          {team.project_link && (
            <a href={team.project_link} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 13, color: "var(--accent)" }}>
              {team.project_link} ↗
            </a>
          )}
        </div>
        {existingSubmission?.submitted && <span className="badge badge-active">submitted — editable</span>}
      </div>

      {status?.error && <div className="alert alert-error">{status.error}</div>}
      {status?.success && <div className="alert alert-success">{status.success}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 24 }}>
        {criteria.map((c) => {
          const maxVal = Math.floor(Number(c.max_score));
          // Generate an array [0, 1, ..., maxVal] for the bubbles
          const bubbleOptions = Array.from({ length: maxVal + 1 }, (_, i) => i);
          
          return (
            <div key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label className="eyebrow" style={{ margin: 0 }}>{c.name}</label>
                <span className="mono muted" style={{ fontSize: 12 }}>Score: {scores[c.id] || 0} / {c.max_score}</span>
              </div>
              
              <div className="bubbles">
                {bubbleOptions.map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`bubble-btn ${Number(scores[c.id]) === val && scores[c.id] !== "" ? 'active' : ''}`}
                    onClick={() => setScores((prev) => ({ ...prev, [c.id]: val }))}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="field">
        <label htmlFor="feedback" className="eyebrow">Feedback (Optional)</label>
        <textarea
          id="feedback"
          className="textarea"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What stood out, what could improve…"
          style={{ minHeight: 100 }}
        />
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span className="score-big">Total: {total} / {maxTotal}</span>
          {saveIndicator && <span className="muted" style={{ fontSize: 13, color: "var(--accent)" }}>{saveIndicator}</span>}
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onPrev} disabled={!onPrev || busy}>
              &larr; Prev
            </button>
            <button type="button" className="btn btn-secondary" onClick={(e) => handleSubmit(e, false)} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={(e) => handleSubmit(e, true)} 
            disabled={busy}
          >
            {busy ? "Saving…" : (onNext ? "Save & Next &rarr;" : "Save (Done)")}
          </button>
        </div>
      </div>
    </form>
  );
}
