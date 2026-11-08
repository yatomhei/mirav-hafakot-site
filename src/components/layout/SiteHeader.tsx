import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";
import { image } from "@/lib/asset";
import { telHref, whatsappHref } from "@/lib/contact";
import { HomeLink } from "@/components/ui/HomeLink";
import { Close, Menu, Phone, WhatsApp } from "@/components/ui/icons";

/**
 * Fixed cream header (85% + blur). Slides away while scrolling down and returns on the way
 * up. At ≤820px the nav collapses into a numbered menu that drops down under the bar.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < 6) return;
      lastY = y;
      setHidden(y > 120 && dy > 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const close = () => window.matchMedia("(min-width: 821px)").matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className="hdr fixed inset-x-0 top-0 z-30 bg-[rgb(250_240_235/0.85)] backdrop-blur-[12px] transition-transform duration-[400ms] ease-[var(--ease-soft)]"
        style={{ transform: hidden && !open ? "translateY(-100%)" : undefined }}
      >
        <div className="flex items-center justify-between gap-6 px-[var(--gutter)] py-[14px]">
          <Link
            to="/"
            aria-label={`${site.name} — לדף הבית`}
            className="block leading-none"
            onClick={close}
          >
            <img
              src={image("logo-color.webp")}
              alt={site.name}
              width={96}
              height={48}
              className="h-12 w-auto"
            />
          </Link>

          <nav
            aria-label="ניווט ראשי"
            className="hidden gap-[clamp(18px,2.2vw,40px)] text-[15px] font-normal tracking-[0.04em] nav:flex"
          >
            {nav.map((item) => (
              <HomeLink key={item.hash} hash={item.hash} className="nav-link text-ink">
                {item.label}
              </HomeLink>
            ))}
          </nav>

          <div className="flex gap-2.5">
            <HomeLink
              hash="contact"
              className="btn btn-primary !min-h-11 !h-11 !px-5 !text-[15px]"
              onClick={close}
            >
              דברו איתי
            </HomeLink>
            <button
              type="button"
              className="icon-btn !h-11 !w-11 border-olive text-ink nav:hidden"
              aria-label={open ? "סגירת תפריט" : "פתיחת תפריט"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-menu"
            aria-label="תפריט נייד"
            className="mt-5 flex max-h-[calc(100dvh-96px)] flex-col overflow-y-auto border-t border-beige px-[var(--gutter)] pt-2 pb-7 nav:hidden"
          >
            {nav.map((item, i) => (
              <HomeLink
                key={item.hash}
                hash={item.hash}
                onClick={close}
                className="flex min-h-[60px] items-center justify-between gap-4 border-b border-beige text-[26px] font-light text-ink no-underline"
              >
                <span>{item.label}</span>
                <span
                  aria-hidden="true"
                  className="text-[13px] font-medium tracking-[0.14em] text-brown tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </HomeLink>
            ))}
            <div className="mt-7 flex flex-col gap-3">
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener"
                onClick={close}
                className="btn btn-primary !min-h-14 !text-[18px]"
              >
                <WhatsApp />
                דברו איתי בוואטסאפ
              </a>
              <a
                href={telHref()}
                onClick={close}
                className="btn btn-outline !min-h-14 !text-[18px]"
              >
                <Phone />
                <span>
                  חייגו:&nbsp;<span dir="ltr">{site.phone}</span>
                </span>
              </a>
            </div>
          </nav>
        )}
      </header>
      <div id="top" aria-hidden="true" className="h-[var(--header-h)]" />
    </>
  );
}
