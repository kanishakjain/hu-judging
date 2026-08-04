import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const JUDGE_AUTH_DOMAIN = process.env.JUDGE_AUTH_DOMAIN || "judge.hu.local";

export default async function Home() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (userData?.user) {
    const email = userData.user.email || "";
    redirect(email.endsWith(`@${JUDGE_AUTH_DOMAIN}`) ? "/judge/dashboard" : "/organizer/dashboard");
  }

  return (
    <div className="shell">
      <div className="page-narrow" style={{ paddingTop: 80 }}>
        <div className="eyebrow">hacker&apos;s unity</div>
        <h1 className="title" style={{ marginBottom: 8 }}>
          Judging Platform
        </h1>
        <p className="muted" style={{ marginBottom: 32 }}>
          Score teams, track feedback, run the leaderboard — all in one place.
        </p>

        <div className="card" style={{ marginBottom: 12 }}>
          <h2 className="subtitle" style={{ fontSize: 16, marginBottom: 6 }}>
            I&apos;m a judge
          </h2>
          <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
            Log in with the ID and password your organizer gave you.
          </p>
          <Link href="/judge/login" className="btn btn-primary">
            Judge login
          </Link>
        </div>

        <div className="card">
          <h2 className="subtitle" style={{ fontSize: 16, marginBottom: 6 }}>
            I&apos;m an organizer
          </h2>
          <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
            Create hackathons, manage judges and teams, view results.
          </p>
          <Link href="/organizer/login" className="btn btn-secondary">
            Organizer login
          </Link>
        </div>
      </div>
    </div>
  );
              }
