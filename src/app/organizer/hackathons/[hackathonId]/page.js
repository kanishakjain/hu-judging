import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import OrganizerTopbar from "@/components/OrganizerTopbar";
import TerminalPath from "@/components/TerminalPath";
import HackathonTabs from "@/components/hackathon/HackathonTabs";
import { setHackathonStatus } from "@/app/organizer/hackathons/actions";

export default async function HackathonDetailPage({ params }) {
  const { hackathonId } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/organizer/login");

  const { data: hackathon } = await supabase
    .from("hackathons")
    .select("id, name, description, status, created_by")
    .eq("id", hackathonId)
    .single();

  if (!hackathon) notFound();
  
  if (hackathon.created_by !== userData.user.id) {
    redirect("/organizer/dashboard");
  }

  const [{ data: teams }, { data: judges }, { data: rounds }] = await Promise.all([
    supabase.from("teams").select("id, name, members, team_code").eq("hackathon_id", hackathonId).order("created_at"),
    supabase.from("judges").select("id, name, judge_code, company, designation").eq("hackathon_id", hackathonId).order("created_at"),
    supabase.from("rounds").select("id, name, status, order_index").eq("hackathon_id", hackathonId).order("order_index"),
  ]);

  return (
    <div className="shell">
      <OrganizerTopbar email={userData.user.email} />
      <div className="page">
        <TerminalPath user="organizer" segments={["hackathons", hackathon.name]} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="title">{hackathon.name}</h1>
            {hackathon.description && <p className="muted">{hackathon.description}</p>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
          </div>
        </div>

        <HackathonTabs hackathonId={hackathonId} teams={teams || []} judges={judges || []} rounds={rounds || []} />
      </div>
    </div>
  );
  }
