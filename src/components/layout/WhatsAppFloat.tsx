import { whatsappHref } from "@/lib/contact";
import { WhatsApp } from "@/components/ui/icons";

/** Always-visible WhatsApp button, bottom-left (the trailing corner in RTL). */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener"
      aria-label="שליחת הודעה בוואטסאפ"
      className="wa-float fixed bottom-[clamp(16px,3vw,32px)] left-[clamp(16px,3vw,32px)] z-40 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-btn text-btn-ink shadow-[0_8px_24px_rgb(46_49_40/0.18)]"
    >
      <WhatsApp size={26} strokeWidth={1.5} />
    </a>
  );
}
