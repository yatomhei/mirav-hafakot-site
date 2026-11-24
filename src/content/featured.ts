import type { StillPhoto, Video } from "./types";

// The homepage's selected works are their own lists: the videos in "home.works" (up to
// MAX_FEATURED_VIDEOS) and the stills mosaic in "home.stills" (MAX_FEATURED_STILLS places).
// Both used to be picked in the galleries (items marked `featured`, arranged by an order list
// of ids); worksFromGalleries and mosaicFromGallery convert a record saved that way. Items
// missing from the order follow in gallery order; ids that match nothing are ignored.

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

type SavedVideo = Video & { featured?: boolean };

/**
 * The selected works as they were picked before they had their own list: the gallery videos
 * marked `featured` (once each), in the saved carousel order, without the old mark.
 */
export function worksFromGalleries(services: { videos: SavedVideo[] }[], order: string[]): Video[] {
  const seen = new Set<string>();
  const picked: SavedVideo[] = [];
  for (const service of services) {
    for (const video of service.videos ?? []) {
      if (!video.featured || !video.youtubeId || seen.has(video.youtubeId)) continue;
      seen.add(video.youtubeId);
      picked.push(video);
    }
  }
  return byOrder(picked, (v) => v.youtubeId, order)
    .slice(0, MAX_FEATURED_VIDEOS)
    .map(({ featured: _featured, ...video }) => video);
}

type SavedStill = StillPhoto & { featured?: boolean };

/** The mosaic as it was picked before it had its own places: the marked gallery photos. */
export const mosaicFromGallery = (photos: SavedStill[], order: string[]): StillPhoto[] =>
  byOrder(
    photos.filter((p) => p.featured),
    (p) => p.name,
    order,
  )
    .slice(0, MAX_FEATURED_STILLS)
    .map(({ featured: _featured, ...photo }) => photo);
