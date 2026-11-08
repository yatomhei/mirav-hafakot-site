import { Link } from "@tanstack/react-router";
import type { Service, Video } from "@/content/types";
import { servicePage, services } from "@/content/services";
import { Picture } from "@/components/ui/Picture";
import { HomeLink } from "@/components/ui/HomeLink";
import { useVideoLink } from "@/components/ui/VideoPlayer";
import { StillsGrid } from "@/components/sections/Stills";
import { ArrowLeft, Play } from "@/components/ui/icons";

function VideoCard({ video }: { video: Video }) {
  const link = useVideoLink(video);
  const playable = !!video.youtubeId;
  return (
    <li className="flex flex-col gap-3.5">
      <div className="car-slide relative aspect-video overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige">
        {video.thumb && (
          <Picture photo={video.thumb} decorative sizes="(max-width: 640px) 92vw, 46vw" />
        )}
        {playable && (
          <>
            <span
              aria-hidden="true"
              className="play-ring absolute top-1/2 left-1/2 z-[1] flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream bg-[rgb(72_80_60/0.35)] text-cream"
            >
              <Play />
            </span>
            <a
              {...link}
              aria-label={`צפייה: ${video.title}`}
              className="absolute inset-0 z-[2] rounded-[inherit]"
            />
          </>
        )}
      </div>
      <p className="px-0.5 text-[clamp(16px,1.3vw,19px)] leading-[1.5] font-normal">
        {video.title}
      </p>
    </li>
  );
}

/** Service page: title + lead, the work (videos, or photos for stills), CTA, other services. */
export function ServicePage({ service }: { service: Service }) {
  const others = services.filter((s) => s.slug !== service.slug);
  const isPhotos = !!service.photos?.length;

  return (
    <>
      <section
        data-reveal
        aria-labelledby="svc-title"
        className="px-[clamp(16px,4vw,48px)] pt-[clamp(64px,9vw,130px)] pb-[clamp(40px,5vw,72px)] text-center"
      >
        <h1 id="svc-title" className="page-title mb-[22px]">
          {service.title}
        </h1>
        <p className="lead mx-auto max-w-[680px]">{service.lead}</p>
      </section>

      <section
        aria-label={isPhotos ? "תמונות" : "סרטונים"}
        className="px-[var(--gutter)] pb-[clamp(56px,7vw,96px)]"
      >
        <div data-reveal className="mx-auto max-w-[var(--content-max)]">
          {isPhotos ? (
            <StillsGrid />
          ) : (
            <ul className="m-0 grid list-none grid-cols-2 gap-x-[clamp(16px,2vw,28px)] gap-y-[clamp(36px,4vw,56px)] p-0 max-[640px]:grid-cols-1">
              {service.videos.map((v, k) => (
                <VideoCard key={v.youtubeId || `ph-${k}`} video={v} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-label="יצירת קשר" className="px-[var(--gutter)] pb-[clamp(88px,11vw,150px)]">
        <div data-reveal className="flex flex-col items-center gap-5 text-center">
          <p className="text-[clamp(22px,2.2vw,30px)] leading-[1.3] font-light">
            {isPhotos ? servicePage.ctaPhotos : servicePage.cta}
          </p>
          <HomeLink hash="contact" className="btn btn-primary !font-normal">
            {servicePage.ctaButton}
            <ArrowLeft />
          </HomeLink>
        </div>
      </section>

      <section
        aria-labelledby="more-svc-title"
        className="bg-olive-soft px-[var(--gutter)] py-[clamp(72px,9vw,120px)]"
      >
        <div data-reveal className="mx-auto max-w-[var(--content-max)]">
          <div className="mx-auto mb-[clamp(36px,5vw,64px)] max-w-[720px] text-center">
            <p className="caption mb-[18px]">{servicePage.moreCaption}</p>
            <h2 id="more-svc-title" className="heading-section !leading-[1.1] !tracking-[-0.01em]">
              {servicePage.moreTitle}
            </h2>
          </div>
          <ul className="more-list mx-auto grid max-w-[1000px] list-none grid-cols-2 gap-x-[clamp(24px,5vw,72px)] border-t border-[rgb(46_49_40/0.18)] p-0">
            {others.map((s) => (
              <li key={s.slug} className="border-b border-[rgb(46_49_40/0.18)]">
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="more-link flex min-h-16 items-center justify-between gap-4 py-2 text-ink no-underline"
                >
                  <span className="text-[25px] font-light">{s.title}</span>
                  <span className="more-go inline-flex flex-none" aria-hidden="true">
                    <ArrowLeft size={20} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
