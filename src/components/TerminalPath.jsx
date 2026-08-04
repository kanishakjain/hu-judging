// Signature element: a breadcrumb styled as a terminal prompt, e.g.
// judge@hu:~/round-2$ scoring
export default function TerminalPath({ user = "guest", segments = [] }) {
  return (
    <div className="terminal-path">
      <span className="prompt">{user}@hu:~$</span>
      {segments.map((segment, i) => (
        <span className="segment" key={i}>
          {segment}
        </span>
      ))}
      <span className="terminal-cursor" aria-hidden="true" />
    </div>
  );
}
