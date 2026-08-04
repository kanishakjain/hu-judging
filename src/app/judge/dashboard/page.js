import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JudgeTopbar from "@/components/JudgeTopbar";
import TerminalPath from "@/components/TerminalPath";
import JudgeScoringApp from "@/components/judge/JudgeScoringApp";

export default async function JudgeDashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/judge/login");

  const { data: judge } = await supabase
    .from("judges")
    .select("id, name, judge_code, hackathon_id")
    .eq("auth_user_id", userData.user.id)
    .single();

  if (!judge) redirect("/judge/login");

  const { data: hackathon } = await supabase
    .from("hackathons")
    .select("name")
    .eq("id", judge.hackathon_id)
    .single();

  const { data: assignmentRows } = await supabase
    .from("round_judge_assignments")
    .select("round_id, team_id")
    .eq("judge_id", judge.id);

  const roundIds = [...new Set((assignmentRows || []).map((a) => a.round_id))];

  let roundsData = [];
  if (roundIds.length) {
    const { data: rounds } = await supabase
      .from("rounds")
      .select("id, name, status, order_index")
      .in("id", roundIds)
      .order("order_index");

    roundsData = await Promise.all(
      (rounds || []).map(async (round) => {
        const teamIds = assignmentRows.filter((a) => a.round_id === round.id).map((a) => a.team_id);

        const [{ data: teams }, { data: criteria }, { data: submissions }] = await Promise.all([
          supabase.from("teams").select("id, name, members, project_link").in("id", teamIds),
          supabase.from("criteria").select("id, name, max_score").eq("round_id", round.id).order("order_index"),
          supabase
            .from("submissions")
            .select("team_id, feedback, submitted, score_details(criterion_id, value)")
            .eq("round_id", round.id)
            .eq("judge_id", judge.id),
        ]);

        return { round, teams: teams || [], criteria: criteria || [], submissions: submissions || [] };
      })
    );
  }

  return (
    <div className="shell">
      <JudgeTopbar judgeName={judge.name || judge.judge_code} />
      <div className="page">
        <TerminalPath user={judge.judge_code} segments={[hackathon?.name || "hackathon", "scoring"]} />
        <h1 className="title" style={{ marginBottom: 24 }}>
          Score your teams
        </h1>

        <JudgeScoringApp roundsData={roundsData} />
      </div>
    </div>
  );
}
