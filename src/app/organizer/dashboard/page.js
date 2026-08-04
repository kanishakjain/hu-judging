import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import OrganizerTopbar from "@/components/OrganizerTopbar";
import TerminalPath from "@/components/TerminalPath";
import SubmitButton from "@/components/SubmitButton";
import { createHackathon } from "../hackathons/actions";

export default async function OrganizerDashboard() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect("/organizer/login");

  const { data: hackathons } = await supabase
    .from("hackathons")
    .select("id, name, description, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="shell">
      <OrganizerTopbar email={userData.user.email} />
      <div className="page">
        <TerminalPath user="organizer" segments={["dashboard"]} />
        <h1 className="title" style={{ marginBottom: 24 }}>
          Hackathons
        </h1>

        <details className="card" style={{ marginBottom: 24 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>+ New hackathon</summary>
          <form action={createHackathon} style={{ marginTop: 16 }}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input className="input" id="name" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea className="textarea" id="description" name="description" />
            </div>
            <SubmitButton pendingText="Creating…">Create hackathon</SubmitButton>
          </form>
        </details>

        {!hackathons?.length && (
          <div className="empty">No hackathons yet. Create one to get started.</div>
        )}

        {hackathons?.map((h) => (
          <Link key={h.id} href={`/organizer/hackathons/${h.id}`} className="card card-link">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 17, marginBottom: 4 }}>{h.name}</h2>
                {h.description && <p className="muted" style={{ fontSize: 13 }}>{h.description}</p>}
              </div>
              <span className={`badge ${h.status === "active" ? "badge-active" : ""}`}>{h.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
            }
            
