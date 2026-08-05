import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function TerminalPath({ user = "guest", segments = [] }) {
  // Map segments to potential links
  const getHref = (segment, index) => {
    if (segment === "dashboard" || segment === "hackathons") {
      return user === "organizer" ? "/organizer/dashboard" : "/judge/dashboard";
    }
    return null;
  };

  return (
    <div className="breadcrumb-nav">
      <span className="segment">
        <Link href={user === "organizer" ? "/organizer/dashboard" : "/judge/dashboard"} style={{ textDecoration: 'none', color: 'inherit' }}>
          Home
        </Link>
      </span>
      {segments.map((segment, i) => {
        const href = getHref(segment, i);
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="segment">
              {href ? (
                <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }} className="hover-link">
                  {segment}
                </Link>
              ) : (
                segment
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
}
