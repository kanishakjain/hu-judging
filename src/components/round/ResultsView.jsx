"use client";

import { useMemo, useState } from "react";

function submissionTotal(sub) {
  return (sub.score_details || []).reduce((sum, s) => sum + Number(s.value), 0);
}

export default function ResultsView({ teams, judges, criteria, assignments, submissions }) {
  const [tab, setTab] = useState("overall");
  const [judgeFilter, setJudgeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const maxTotal = useMemo(() => criteria.reduce((sum, c) => sum + Number(c.max_score), 0), [criteria]);

  const subByJudgeTeam = useMemo(() => {
    const map = {};
    submissions.forEach((s) => {
      map[`${s.judge_id}:${s.team_id}`] = s;
    });
    return map;
  }, [submissions]);

  // ── Judge view rows: one row per (judge, assigned team) ──
  const judgeRows = useMemo(() => {
    return assignments
      .map((a) => {
        const judge = judges.find((j) => j.id === a.judge_id);
        const team = teams.find((t) => t.id === a.team_id);
        const sub = subByJudgeTeam[`${a.judge_id}:${a.team_id}`];
        return {
          judgeId: a.judge_id,
          judgeName: judge?.name || judge?.judge_code || "—",
          teamId: a.team_id,
          teamName: team?.name || "—",
          submitted: !!sub?.submitted,
          total: sub ? submissionTotal(sub) : null,
          feedback: sub?.feedback || "",
        };
      })
      .filter((r) => (judgeFilter === "all" ? true : r.judgeId === judgeFilter))
      .filter((r) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "submitted") return r.submitted;
        return !r.submitted;
      });
  }, [assignments, judges, teams, subByJudgeTeam, judgeFilter, statusFilter]);

  // ── Overall leaderboard: aggregate submitted scores per team ──
  const leaderboard = useMemo(() => {
    const byTeam = {};
    submissions
      .filter((s) => s.submitted)
      .forEach((s) => {
        if (!byTeam[s.team_id]) byTeam[s.team_id] = [];
        byTeam[s.team_id].push(submissionTotal(s));
      });

    return teams
      .map((t) => {
        const totals = byTeam[t.id] || [];
        const finalScore = totals.length ? totals.reduce((a, b) => a + b, 0) / totals.length : null;
        return { teamId: t.id, teamName: t.name, judgeCount: totals.length, finalScore };
      })
      .sort((a, b) => (b.finalScore ?? -1) - (a.finalScore ?? -1));
  }, [teams, submissions]);

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${tab === "overall" ? "active" : ""}`} onClick={() => setTab("overall")}>
          overall leaderboard
        </button>
        <button className={`tab ${tab === "judges" ? "active" : ""}`} onClick={() => setTab("judges")}>
          judge view
        </button>
      </div>

      {tab === "overall" && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Judges scored</th>
              <th>Final score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, i) => (
              <tr key={row.teamId}>
                <td><span className="rank">#{i + 1}</span></td>
                <td>{row.teamName}</td>
                <td className="muted">{row.judgeCount}</td>
                <td className="score-big">
                  {row.finalScore === null ? "—" : `${row.finalScore.toFixed(1)} / ${maxTotal}`}
                </td>
              </tr>
            ))}
            {!leaderboard.length && (
              <tr>
                <td colSpan={4} className="empty">No teams in this round yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {tab === "judges" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <select className="input" style={{ width: 200 }} value={judgeFilter} onChange={(e) => setJudgeFilter(e.target.value)}>
              <option value="all">All judges</option>
              {judges.map((j) => (
                <option key={j.id} value={j.id}>{j.name || j.judge_code}</option>
              ))}
            </select>
            <select className="input" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Judge</th>
                <th>Team</th>
                <th>Status</th>
                <th>Score</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {judgeRows.map((r, i) => (
                <tr key={i}>
                  <td>{r.judgeName}</td>
                  <td>{r.teamName}</td>
                  <td>
                    <span className={`badge ${r.submitted ? "badge-active" : "badge-warn"}`}>
                      {r.submitted ? "submitted" : "pending"}
                    </span>
                  </td>
                  <td className="mono">{r.total === null ? "—" : `${r.total} / ${maxTotal}`}</td>
                  <td className="muted" style={{ maxWidth: 280 }}>{r.feedback}</td>
                </tr>
              ))}
              {!judgeRows.length && (
                <tr>
                  <td colSpan={5} className="empty">No matching rows.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
