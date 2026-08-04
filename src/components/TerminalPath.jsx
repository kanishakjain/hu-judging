import Link from "next/link";

export default function TerminalPath({ user = "guest", segments = [] }) {
  // Map segments to potential links
  const getHref = (segment, index) => {
    if (segment === "dashboard" || segment === "hackathons") {
      return user === "organizer" ? "/organizer/dashboard" : "/judge/dashboard";
    }
    return null;
  };

  return (
    <div className="terminal-path">
      <span className="prompt">{user}@hu:~$</span>
      {segments.map((segment, i) => {
        const href = getHref(segment, i);
        return (
          <span className="segment" key={i}>
            {href ? (
              <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }} className="hover-link">
                {segment}
              </Link>
            ) : (
              segment
            )}
          </span>
        );
      })}
      <span className="terminal-cursor" aria-hidden="true" />
    </div>
  );
}
