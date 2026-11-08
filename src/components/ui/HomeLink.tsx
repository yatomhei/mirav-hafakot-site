import { Link } from "@tanstack/react-router";
import type { ReactNode, MouseEventHandler, CSSProperties } from "react";

/**
 * Link to a homepage section (#about, #clips…) that works from every page: on the
 * homepage it scrolls, elsewhere it navigates home first. The router scrolls to the hash.
 * #contact is on every page (see PageShell), so it always stays on the current page.
 */
export function HomeLink({
  hash,
  className,
  style,
  children,
  onClick,
  ...rest
}: {
  hash: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
}) {
  if (hash === "contact") {
    return (
      <a href="#contact" className={className} style={style} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to="/" hash={hash} className={className} style={style} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
