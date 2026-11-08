import { Link } from "@tanstack/react-router";
import type { ReactNode, MouseEventHandler, CSSProperties } from "react";

/**
 * Link to a homepage section (#about, #contact…) that works from every page: on the
 * homepage it scrolls, elsewhere it navigates home first. The router scrolls to the hash.
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
  return (
    <Link to="/" hash={hash} className={className} style={style} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
