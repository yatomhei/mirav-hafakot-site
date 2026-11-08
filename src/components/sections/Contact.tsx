import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { contact } from "@/content/home";
import { site } from "@/content/site";
import { telHref, whatsappHref } from "@/lib/contact";
import { Phone, WhatsApp } from "@/components/ui/icons";

/** The message Merav receives: one line per filled field. */
function buildMessage(f: { name: string; phone: string; service: string; message: string }) {
  return [
    "היי מרב, הגעתי מהאתר",
    `שם: ${f.name}`,
    `טלפון: ${f.phone}`,
    f.service && `מתעניינ/ת ב: ${f.service}`,
    f.message && `\n${f.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function CallButton({ className = "" }: { className?: string }) {
  return (
    <a href={telHref()} className={`btn call-btn !min-h-[54px] ${className}`}>
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
  const [error, setError] = useState("");

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
    setError("");
    window.open(whatsappHref(buildMessage(f)), "_blank", "noopener");
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
