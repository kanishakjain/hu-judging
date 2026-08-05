import Link from "next/link";
import ProfileMenu from "@/components/ProfileMenu";

export default function OrganizerTopbar({ email }) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/organizer/dashboard" className="brand">
          <span className="dot" />
          HU Judging
        </Link>
        {email && <ProfileMenu label={email} loginPath="/" />}
      </div>
    </div>
  );
}
