import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingClient from "@/components/landing/LandingClient";

const JUDGE_AUTH_DOMAIN = process.env.JUDGE_AUTH_DOMAIN || "judge.hu.local";

export default async function Home() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData?.user) {
    const email = userData.user.email || "";
    redirect(email.endsWith(`@${JUDGE_AUTH_DOMAIN}`) ? "/judge/dashboard" : "/organizer/dashboard");
  }

  return <LandingClient />;
}
