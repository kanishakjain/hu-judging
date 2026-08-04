"use client";

import { useState } from "react";
import TeamsPanel from "./TeamsPanel";
import JudgesPanel from "./JudgesPanel";
import RoundsPanel from "./RoundsPanel";

const TABS = [
  { key: "teams", label: "teams" },
  { key: "judges", label: "judges" },
  { key: "rounds", label: "rounds" },
];

export default function HackathonTabs({ hackathonId, teams, judges, rounds }) {
  const [active, setActive] = useState("teams");

  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${active === t.key ? "active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label} ({t.key === "teams" ? teams.length : t.key === "judges" ? judges.length : rounds.length})
          </button>
        ))}
      </div>

      {active === "teams" && <TeamsPanel hackathonId={hackathonId} teams={teams} />}
      {active === "judges" && <JudgesPanel hackathonId={hackathonId} judges={judges} />}
      {active === "rounds" && <RoundsPanel hackathonId={hackathonId} rounds={rounds} />}
    </div>
  );
}
