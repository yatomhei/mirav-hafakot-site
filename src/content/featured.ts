import type { Service, StillPhoto, Video } from "./types";

// What the homepage shows of the service galleries: the items marked `featured`, arranged by
// an order list kept with the homepage section. Items missing from the order (just marked)
// follow in gallery order; ids in the order that no longer match anything are ignored.

export const MAX_FEATURED_VIDEOS = 6;
/** The homepage stills mosaic has 9 places (3 rows of 3). */
export const MAX_FEATURED_STILLS = 9;

function byOrder<T>(items: T[], id: (item: T) => string, order: string[]): T[] {
  const rank = new Map(order.map((key, i) => [key, i]));
  return items
    .map((item, i) => ({ item, at: rank.get(id(item)) ?? order.length + i }))
    .sort((a, b) => a.at - b.at)
    .map(({ item }) => item);
}

/** Featured videos from every service, once each (a video can sit on two pages). */
type Featurable = { youtubeId: string; featured?: boolean | undefined };
function collectVideos<V extends Featurable>(services: { videos: V[] }[]): V[] {
  const seen = new Set<string>();
  const list: V[] = [];
  for (const service of services) {
    for (const video of service.videos) {
      if (!video.featured || !video.youtubeId || seen.has(video.youtubeId)) continue;
      seen.add(video.youtubeId);
      list.push(video);
    }
  }
  return list;
}

export const countFeaturedVideos = (services: { videos: Featurable[] }[]) =>
  collectVideos(services).length;

/** The homepage carousel, in order. */
export const featuredVideos = (services: Service[], order: string[]): Video[] =>
  byOrder(collectVideos(services), (v) => v.youtubeId, order).slice(0, MAX_FEATURED_VIDEOS);

/** The homepage mosaic, in order. */
export const featuredStills = (photos: StillPhoto[], order: string[]) =>
  byOrder(
    photos.filter((p) => p.featured),
    (p) => p.name,
    order,
  ).slice(0, MAX_FEATURED_STILLS);
