import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import TerminalPath from "@/components/TerminalPath";

const JUDGE_AUTH_DOMAIN = process.env.JUDGE_AUTH_DOMAIN || "judge.hu.local";

export default async function OrganizerLoginPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData?.user) {
    const email = userData.user.email || "";
    redirect(email.endsWith(`@${JUDGE_AUTH_DOMAIN}`) ? "/judge/dashboard" : "/organizer/dashboard");
  }

  return (
    <div className="shell">
      <div className="page-narrow" style={{ paddingTop: 60 }}>
        <TerminalPath segments={["organizer", "login"]} />
        <h1 className="title" style={{ marginBottom: 24 }}>
          Organizer login
        </h1>

        {params?.error && <div className="alert alert-error">{params.error}</div>}

        <div className="card">
          <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Sign in with your Google account to create and manage hackathons.
          </p>
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
