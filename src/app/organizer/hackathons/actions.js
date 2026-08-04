"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const JUDGE_AUTH_DOMAIN = process.env.JUDGE_AUTH_DOMAIN || "judge.hu.local";

function judgeEmail(judgeCode) {
  return `${judgeCode.trim().toLowerCase()}@${JUDGE_AUTH_DOMAIN}`;
}

// Basic sanitization
function sanitize(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Hackathons ──────────────────────────────────────────────
export async function createHackathon(formData) {
  const name = sanitize(formData.get("name")?.toString().trim());
  const description = sanitize(formData.get("description")?.toString().trim());

  if (!name) return { error: "Hackathon name is required." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("hackathons")
    .insert({ name, description, created_by: userData.user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  redirect(`/organizer/hackathons/${data.id}`);
}

export async function setHackathonStatus(hackathonId, status) {
  if (!["draft", "active", "completed"].includes(status)) return { error: "Invalid status." };
  
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  // Verify ownership
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  await supabase.from("hackathons").update({ status }).eq("id", hackathonId);
  revalidatePath(`/organizer/hackathons/${hackathonId}`);
  return { error: null };
}

// ── Teams ───────────────────────────────────────────────────
export async function addTeam(hackathonId, formData) {
  const name = sanitize(formData.get("name")?.toString().trim());
  const members = sanitize(formData.get("members")?.toString().trim());
  const projectLink = sanitize(formData.get("projectLink")?.toString().trim());

  if (!name) return { error: "Team name is required." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  const { error } = await supabase
    .from("teams")
    .insert({ hackathon_id: hackathonId, name, members, project_link: projectLink });

  if (error) return { error: error.message };
  revalidatePath(`/organizer/hackathons/${hackathonId}`);
  return { error: null };
}

export async function importTeamsCSV(hackathonId, rows) {
  if (!rows?.length) return { error: "No rows to import." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  const payload = rows
    .filter((r) => r.name?.trim())
    .map((r) => ({
      hackathon_id: hackathonId,
      name: sanitize(r.name.trim()),
      members: sanitize(r.members || ""),
      project_link: sanitize(r.projectLink || ""),
    }));

  if (payload.length === 0) return { error: "No valid rows found." };

  const { error } = await supabase.from("teams").insert(payload);
  if (error) return { error: error.message };

  revalidatePath(`/organizer/hackathons/${hackathonId}`);
  return { error: null, count: payload.length };
}

export async function deleteTeam(hackathonId, teamId) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  await supabase.from("teams").delete().eq("id", teamId);
  revalidatePath(`/organizer/hackathons/${hackathonId}`);
  return { error: null };
}

// ── Judges ──────────────────────────────────────────────────
export async function addJudge(hackathonId, formData) {
  const name = sanitize(formData.get("name")?.toString().trim());
  const judgeCode = sanitize(formData.get("judgeCode")?.toString().trim());
  const password = formData.get("password")?.toString().trim();

  if (!judgeCode || !password || !name) return { error: "Name, Judge ID, and password are required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  const admin = createAdminClient();
  const email = judgeEmail(judgeCode);

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "judge", judge_code: judgeCode },
  });

  if (authError) return { error: authError.message };

  const { error } = await supabase.from("judges").insert({
    hackathon_id: hackathonId,
    judge_code: judgeCode,
    password,
    auth_user_id: authUser.user.id,
    name,
  });

  if (error) {
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { error: error.message };
  }

  revalidatePath(`/organizer/hackathons/${hackathonId}`);
  return { error: null };
}

export async function deleteJudge(hackathonId, judgeId, authUserId) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  await supabase.from("judges").delete().eq("id", judgeId);

  if (authUserId) {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(authUserId);
  }

  revalidatePath(`/organizer/hackathons/${hackathonId}`);
  return { error: null };
}

// ── Rounds ──────────────────────────────────────────────────
export async function createRound(hackathonId, formData) {
  const name = sanitize(formData.get("name")?.toString().trim());
  const orderIndex = Number(formData.get("orderIndex")) || 1;

  if (!name) return { error: "Round name is required." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  const { data, error } = await supabase
    .from("rounds")
    .insert({ hackathon_id: hackathonId, name, order_index: orderIndex })
    .select()
    .single();

  if (error) return { error: error.message };

  redirect(`/organizer/hackathons/${hackathonId}/rounds/${data.id}`);
}

export async function setRoundStatus(hackathonId, roundId, status) {
  if (!["upcoming", "active", "completed"].includes(status)) return { error: "Invalid status." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  await supabase.from("rounds").update({ status }).eq("id", roundId);
  revalidatePath(`/organizer/hackathons/${hackathonId}/rounds/${roundId}`);
  return { error: null };
}

// ── Criteria ────────────────────────────────────────────────
export async function addCriterion(hackathonId, roundId, formData) {
  const name = sanitize(formData.get("name")?.toString().trim());
  const maxScore = Number(formData.get("maxScore")) || 10;

  if (!name) return { error: "Criterion name is required." };
  if (maxScore <= 0) return { error: "Max score must be positive." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  const { error } = await supabase.from("criteria").insert({ round_id: roundId, name, max_score: maxScore });

  if (error) return { error: error.message };
  revalidatePath(`/organizer/hackathons/${hackathonId}/rounds/${roundId}`);
  return { error: null };
}

export async function deleteCriterion(hackathonId, roundId, criterionId) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  await supabase.from("criteria").delete().eq("id", criterionId);
  revalidatePath(`/organizer/hackathons/${hackathonId}/rounds/${roundId}`);
  return { error: null };
}

// ── Round team selection (advancement) ────────────────────
export async function setRoundTeams(hackathonId, roundId, teamIds) {
  if (!Array.isArray(teamIds)) return { error: "Invalid teams array." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  await supabase.from("round_teams").delete().eq("round_id", roundId);

  if (teamIds.length) {
    const rows = teamIds.map((teamId) => ({ round_id: roundId, team_id: String(teamId) }));
    const { error } = await supabase.from("round_teams").insert(rows);
    if (error) return { error: error.message };
  }

  revalidatePath(`/organizer/hackathons/${hackathonId}/rounds/${roundId}`);
  return { error: null };
}

export async function autoAdvanceTopN(hackathonId, roundId, previousRoundId, topN) {
  if (topN <= 0) return { error: "Top N must be a positive number." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("team_id, score_details(value)")
    .eq("round_id", previousRoundId);

  if (error) return { error: error.message };

  const totalsByTeam = {};
  for (const sub of submissions) {
    const total = (sub.score_details || []).reduce((sum, s) => sum + Number(s.value), 0);
    if (!totalsByTeam[sub.team_id]) totalsByTeam[sub.team_id] = [];
    totalsByTeam[sub.team_id].push(total);
  }

  const ranked = Object.entries(totalsByTeam)
    .map(([teamId, totals]) => ({
      teamId,
      finalScore: totals.reduce((a, b) => a + b, 0) / totals.length,
    }))
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, topN)
    .map((r) => r.teamId);

  return setRoundTeams(hackathonId, roundId, ranked);
}

// ── Judge ↔ team assignment ────────────────────────────────
export async function setJudgeAssignments(hackathonId, roundId, judgeId, teamIds) {
  if (!Array.isArray(teamIds)) return { error: "Invalid teams array." };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Unauthorized" };
  
  const { data: hackathon } = await supabase.from("hackathons").select("created_by").eq("id", hackathonId).single();
  if (hackathon?.created_by !== userData.user.id) return { error: "Forbidden" };

  await supabase.from("round_judge_assignments").delete().eq("round_id", roundId).eq("judge_id", judgeId);

  if (teamIds.length) {
    const rows = teamIds.map((teamId) => ({ round_id: roundId, judge_id: judgeId, team_id: String(teamId) }));
    const { error } = await supabase.from("round_judge_assignments").insert(rows);
    if (error) return { error: error.message };
  }

  revalidatePath(`/organizer/hackathons/${hackathonId}/rounds/${roundId}`);
  return { error: null };
}
