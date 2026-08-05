import Link from "next/link";
import ProfileMenu from "@/components/ProfileMenu";

export default function JudgeTopbar({ judgeName, company }) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/judge/dashboard" className="brand">
          <span className="dot" />
          HU Judging
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {company && <span className="muted text-sm" style={{ display: "none" }} >{company}</span>}
          {judgeName && <ProfileMenu label={judgeName + (company ? ` (${company})` : "")} loginPath="/" />}
        </div>
      </div>
    </div>
  );
}
