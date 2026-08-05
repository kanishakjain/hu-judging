"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importTeamsCSV } from "@/app/organizer/hackathons/actions";

// Expects a CSV with headers: name, members, projectLink
export default function CsvImportTeams({ hackathonId }) {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setStatus(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data.map((r) => ({
          name: r.name?.trim(),
          members: r.members?.trim(),
          projectLink: r.projectLink?.trim(),
        }));
        const res = await importTeamsCSV(hackathonId, rows);
        setBusy(false);
        setStatus(res.error ? { error: res.error } : { success: `Imported ${res.count} teams.` });
        e.target.value = "";
      },
      error: (err) => {
        setBusy(false);
        setStatus({ error: err.message });
      },
    });
  }

  return (
    <div>
      <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
        {busy ? "Importing…" : "Import CSV"}
        <input type="file" accept=".csv" onChange={handleFile} disabled={busy} style={{ display: "none" }} />
      </label>
      <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
        Headers: name, members, projectLink (use for Team ID / Table Number)
      </p>
      {status?.error && <div className="alert alert-error" style={{ marginTop: 8 }}>{status.error}</div>}
      {status?.success && <div className="alert alert-success" style={{ marginTop: 8 }}>{status.success}</div>}
    </div>
  );
}
