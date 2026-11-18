import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useHome } from "@/content/context";
import { useContactLinks } from "@/lib/contact";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { contact as launchContact } from "@/content/home";
import { DEFAULT_MESSAGE_TEMPLATE, fillMessage } from "@/content/whatsapp-message";

const defaultSent = launchContact.sent;

function CallButton({ className = "" }: { className?: string }) {
  const { contact } = useHome();
  const { site, tel } = useContactLinks();
  return (
    <a href={tel} className={`btn call-btn !min-h-[54px] ${className}`}>
      <Phone />
      <span>
        {contact.call}&nbsp;<span dir="ltr">{site.phone}</span>
      </span>
    </a>
  );
}

/**
 * Brown contact section, ink-deep text. Nothing is sent to a server: the form composes a
 * WhatsApp message and opens the chat, so the visitor sees and sends it themselves.
 */
export function Contact() {
  const { contact } = useHome();
  const links = useContactLinks();
  const [error, setError] = useState("");
  // After sending: the thank-you line, and when the browser blocked the new tab, the WhatsApp
  // link to tap instead.
  const [sent, setSent] = useState(false);
  const [fallback, setFallback] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const f = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      service: String(data.get("service") ?? ""),
      message: String(data.get("message") ?? "").trim(),
    };
    if (!f.name || !f.phone) {
      setError("נא למלא שם וטלפון כדי שאוכל לחזור אליכם.");
      (e.currentTarget.elements.namedItem(f.name ? "phone" : "name") as HTMLInputElement)?.focus();
      return;
    }
    // At least 9 digits: a landline (02-1234567) or a mobile (050-1234567), with or without +972.
    if (f.phone.replace(/\D/g, "").length < 9) {
      setError("נא להזין מספר טלפון תקין, למשל 050-1234567.");
      (e.currentTarget.elements.namedItem("phone") as HTMLInputElement)?.focus();
      return;
    }
    setError("");
    const href = links.whatsapp(fillMessage(contact.message ?? DEFAULT_MESSAGE_TEMPLATE, f));
    // No "noopener" feature here: with it, window.open always returns null and we could not
    // tell a blocked tab from an opened one. Cut the link back to this page instead.
    const win = window.open(href, "_blank");
    if (win) win.opener = null;
    setFallback(win ? "" : href);
    setSent(true);
  };

  return (
    <section id="contact" className="relative bg-brown text-ink-deep">
      <div
        data-reveal
        className="mx-auto grid max-w-[var(--content-max)] grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start gap-[clamp(40px,7vw,120px)] px-[clamp(16px,4vw,48px)] pt-[clamp(72px,12vw,160px)] pb-[clamp(42px,12vw,80px)] text-right max-[820px]:grid-cols-1"
      >
        <div>
          <p className="caption mb-[18px] !text-ink-deep">{contact.caption}</p>
          <h2 className="heading-contact mb-7">{contact.title}</h2>
          <p className="lead max-w-[560px]">{contact.text}</p>
          <CallButton className="mt-9 max-[820px]:hidden" />
        </div>

        <div>
          <form
            noValidate
            onSubmit={onSubmit}
            className="grid grid-cols-2 gap-3 text-right max-[640px]:grid-cols-1"
            aria-describedby="contact-note"
          >
            <label>
              <span className="sr-only-he">שם מלא (חובה)</span>
              <input
                className="field"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="שם מלא *"
                required
                aria-required="true"
              />
            </label>
            <label>
              <span className="sr-only-he">טלפון (חובה)</span>
              <input
                className="field"
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                placeholder="טלפון *"
                required
                aria-required="true"
              />
            </label>
            <label className="col-span-full">
              <span className="sr-only-he">במה אתם מתעניינים?</span>
              <select className="field field-select" name="service" defaultValue="">
                <option value="">במה אתם מתעניינים?</option>
                {contact.interests.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="col-span-full">
              <span className="sr-only-he">ספרו לי קצת על הפרויקט שלכם</span>
              <textarea
                className="field field-area"
                name="message"
                rows={4}
                placeholder="ספרו לי קצת על הפרויקט שלכם"
              />
            </label>
            <span id="contact-note" className="col-span-full text-center text-[13px]">
              {contact.note}
            </span>
            {error && (
              <p role="alert" className="col-span-full text-center text-[15px] font-medium">
                {error}
              </p>
            )}
            <p role="status" className="col-span-full text-center text-[15px] empty:hidden">
              {sent && (contact.sent ?? defaultSent)}
              {fallback && (
                <>
                  {" "}
                  <a
                    href={fallback}
                    target="_blank"
                    rel="noopener"
                    className="font-medium underline underline-offset-4"
                  >
                    פתיחת וואטסאפ
                  </a>
                </>
              )}
            </p>
            <button
              type="submit"
              className="btn btn-primary submit-btn col-span-full mt-2 !min-h-14 !px-9 !text-[18px]"
            >
              <WhatsApp />
              {contact.submit}
            </button>
            <div className="col-span-full mt-1 text-center">
              <p className="mb-6 text-[clamp(17px,1.4vw,20px)] font-medium">{contact.after}</p>
              <p className="text-[15px] leading-[1.6] font-light">
                {contact.privacy}
                <Link to="/privacy" className="underline underline-offset-4">
                  מדיניות הפרטיות
                </Link>
                .
              </p>
            </div>
          </form>
          <div className="mt-8 hidden justify-center max-[820px]:flex">
            <CallButton />
          </div>
        </div>
      </div>
    </section>
  );
}
