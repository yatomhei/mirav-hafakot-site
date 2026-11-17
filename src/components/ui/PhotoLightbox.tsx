import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef } from "react";
import type { StillPhoto } from "@/content/types";
import { photoFile } from "@/lib/asset";
import { ArrowLeft, ArrowRight, Close } from "./icons";

/**
 * Full-screen viewer for a stills gallery: the photo whole (never cropped), its label, a
 * counter, previous/next buttons, arrow keys and swipe. RTL: "next" sits on the left, the
 * left arrow key goes forward and swiping right goes forward (as in the works carousel).
 * The gallery wraps around at both ends. Esc, the close button or a click beside the photo
 * closes it; focus returns to the photo that opened it (Radix Dialog).
 */
export function PhotoLightbox({
  photos,
  index,
  onIndex,
}: {
  photos: StillPhoto[];
  /** The open photo, or null when closed. */
  index: number | null;
  onIndex: (i: number | null) => void;
}) {
  const open = index !== null;
  const photo = open ? photos[index] : undefined;
  const count = photos.length;
  const go = (d: number) => index !== null && onIndex((index + d + count) % count);
  const touchX = useRef<number | null>(null);

  // Warm the cache with the neighbours so stepping through feels instant.
  useEffect(() => {
    if (index === null) return;
    for (const d of [1, -1]) {
      const p = photos[(index + d + count) % count];
      if (p) new Image().src = photoFile(p.name, 1600);
    }
  }, [index, photos, count]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onIndex(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgb(35_38_31/0.92)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          dir="rtl"
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-3 text-cream outline-none sm:gap-4 sm:p-8"
          onClick={(e) => e.target === e.currentTarget && onIndex(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(1);
            else if (e.key === "ArrowRight") go(-1);
          }}
          onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0]!.clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
          }}
        >
          <div className="flex w-full max-w-[1400px] items-center justify-between gap-4">
            <Dialog.Title className="flex items-baseline gap-3 text-[17px] leading-snug font-normal">
              {photo?.label}
              <span className="text-[14px] font-light opacity-75" dir="ltr">
                {open && `${index + 1} / ${count}`}
              </span>
            </Dialog.Title>
            <Dialog.Close
              className="icon-btn !h-11 !w-11 shrink-0 text-cream"
              aria-label="סגירת התמונה"
            >
              <Close />
            </Dialog.Close>
          </div>

          <div
            className="relative flex min-h-0 w-full max-w-[1400px] flex-1 items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onIndex(null)}
          >
            {photo && (
              <img
                key={photo.name}
                src={photoFile(photo.name, 1600)}
                srcSet={`${photoFile(photo.name, 960)} 960w, ${photoFile(photo.name, 1600)} 1600w`}
                sizes="100vw"
                alt={photo.alt}
                className="max-h-full max-w-full rounded-[clamp(8px,1vw,14px)] object-contain animate-in fade-in-0"
                style={{ aspectRatio: photo.ratio }}
              />
            )}
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="התמונה הקודמת"
                  className="icon-btn absolute top-1/2 right-0 !h-12 !w-12 -translate-y-1/2 bg-[rgb(35_38_31/0.45)] text-cream max-[640px]:hidden sm:right-2"
                >
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="התמונה הבאה"
                  className="icon-btn absolute top-1/2 left-0 !h-12 !w-12 -translate-y-1/2 bg-[rgb(35_38_31/0.45)] text-cream max-[640px]:hidden sm:left-2"
                >
                  <ArrowLeft />
                </button>
              </>
            )}
          </div>

          {/* Phones: the arrows sit under the photo, within thumb reach; swiping works too. */}
          {count > 1 && (
            <div className="hidden items-center gap-6 max-[640px]:flex">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="התמונה הקודמת"
                className="icon-btn !h-12 !w-12 text-cream"
              >
                <ArrowRight />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="התמונה הבאה"
                className="icon-btn !h-12 !w-12 text-cream"
              >
                <ArrowLeft />
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
