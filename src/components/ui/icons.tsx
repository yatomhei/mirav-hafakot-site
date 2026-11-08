/**
 * The canvas's own line icons (1.6px stroke, 24px grid), kept as-is so the site matches the
 * approved design. Arrows point left: in RTL, "forward" is to the left.
 */
type P = { size?: number; className?: string };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const ArrowLeft = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const ArrowRight = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ArrowUpLeft = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M17 17L7 7M7 16V7h9" />
  </svg>
);
export const ArrowUp = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
export const Play = ({ size = 18, className }: P) => (
  <svg {...base(size)} strokeWidth={1.5} className={className}>
    <path d="M17 12L8 6.5v11z" />
  </svg>
);
export const Plus = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Minus = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14" />
  </svg>
);
export const Menu = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
export const Close = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const Phone = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
export const WhatsApp = ({
  size = 20,
  className,
  strokeWidth = 1.6,
}: P & { strokeWidth?: number }) => (
  <svg {...base(size)} strokeWidth={strokeWidth} className={className}>
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.3z" />
    <path d="M9 9.2c.3 2.4 2.4 4.6 4.9 5l1.2-1.2 1.7.8-.4 1.6c-3.9.3-7.6-3.3-7.4-7.2l1.6-.4.8 1.7z" />
  </svg>
);
export const YouTube = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
  </svg>
);
export const Facebook = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M14.5 21v-8h2.7l.4-3.2h-3.1V7.9c0-.9.3-1.6 1.6-1.6h1.7V3.5c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.2H8.5V13h2.7v8" />
  </svg>
);
