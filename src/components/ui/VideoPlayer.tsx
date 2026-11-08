import * as Dialog from "@radix-ui/react-dialog";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Video } from "@/content/types";
import { youtubeUrl } from "@/lib/contact";
import { Close } from "./icons";

/**
 * Plays portfolio videos in a lightbox (YouTube, privacy-enhanced embed) instead of sending
 * the visitor away. Each trigger is a real link to youtu.be, so it still works without JS
 * or when opened in a new tab.
 */
const Ctx = createContext<(v: Video) => void>(() => {});

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<Video | null>(null);
  const open = useCallback((v: Video) => setVideo(v), []);

  return (
    <Ctx.Provider value={open}>
      {children}
      <Dialog.Root open={!!video} onOpenChange={(o) => !o && setVideo(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgb(35_38_31/0.88)] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            dir="rtl"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 outline-none sm:p-10"
            onClick={(e) => e.target === e.currentTarget && setVideo(null)}
          >
            <div className="flex w-full max-w-[1200px] items-center justify-between gap-4 text-cream">
              <Dialog.Title className="text-[17px] font-normal leading-snug">
                {video?.title}
              </Dialog.Title>
              <Dialog.Close
                className="icon-btn !h-11 !w-11 shrink-0 text-cream"
                aria-label="סגירת הסרטון"
              >
                <Close />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only-he">נגן וידאו של יוטיוב</Dialog.Description>
            {video && (
              <div className="relative aspect-video w-full max-w-[1200px] overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-ink-deep">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={video.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Ctx.Provider>
  );
}

export function useOpenVideo() {
  return useContext(Ctx);
}

/** Props for an <a> that opens `video` in the lightbox (or on YouTube with a modifier key). */
export function useVideoLink(video: Video) {
  const open = useOpenVideo();
  return {
    href: youtubeUrl(video.youtubeId),
    target: "_blank",
    rel: "noopener",
    onClick: (e: React.MouseEvent) => {
      // The shareable preview runs where YouTube can't be embedded: just follow the link.
      if ((window as { __NO_VIDEO_EMBED__?: boolean }).__NO_VIDEO_EMBED__) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(video);
    },
  };
}
