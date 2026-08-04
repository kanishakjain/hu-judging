import Link from "next/link";
import ProfileMenu from "@/components/ProfileMenu";

export default function JudgeTopbar({ judgeName }) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link href="/judge/dashboard" className="brand">
          <span className="dot" />
          HU Judging
        </Link>
        {judgeName && <ProfileMenu label={judgeName} loginPath="/" />}
      </div>
    </div>
  );
}
