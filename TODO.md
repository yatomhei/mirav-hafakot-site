# To-do

What's left before and after launch, grouped by what each item waits on. Updated 2026-11-18.

## Next up: Merav can add, delete and edit services

Today the site has exactly seven services, fixed in code: Merav can edit and hide them but not
add or remove one. The plan below lets her manage the list herself from the admin. It doesn't
change the design: the homepage grid is two columns (one on phones) and already handles any
number of cards.

### What Merav gets

1. **Add:** a "הוספת שירות" button under "שירותים". A new service appears **hidden**, so nothing
   goes public half-finished. She fills it in like the existing ones: name, subtitle, card
   photo, opening paragraph, videos. The Google title and description fill in automatically from
   the name and her paragraph, and she can change them in "איך העמוד מופיע בגוגל".
2. **Page address:** she types a short address in English letters (for example `wedding-clips`),
   with a hint and an example beside the field. It stays editable while the service is hidden
   and **locks once she publishes it**, so links already shared, and Google's results, never
   break. English rather than Hebrew, because Hebrew addresses turn into long `%D7%A7…` codes
   when copied into WhatsApp or email.
3. **Publish:** she un-hides it. The card appears on the homepage, in the footer and in the menus,
   and the page goes live and into the sitemap.
4. **Edit:** everything she can edit today, for every service, including ones she added.
5. **Delete:** any service, including the original seven, with a confirmation that names it. At
   least one visible service must remain (already a rule today).
6. **Order:** the existing arrows keep working for the full list.

### Search and the sitemap

- `/sitemap.xml` is built from the live content on every request, so a new service is listed
  automatically and a deleted one disappears. Nothing to update by hand.
- After launch, submit the sitemap address to Google Search Console **once**; Google keeps
  re-reading it. New pages are also found through the homepage and footer links.
- A deleted service's address answers "not found". Optional: send it to the homepage instead
  (a permanent redirect) so old links and Google results land somewhere useful. Decide when
  building.

### What changes in the code (where to start)

- `src/content/schema.ts`: the `services` rule says exactly seven, with the addresses from code
  (`length(7)` and the `SERVICE_SLUGS` check). Replace it with:
  - between 1 and 12 services, at least one visible (already checked);
  - each address unique and in the form `^[a-z0-9]+(-[a-z0-9]+)*$`, up to 40 characters;
  - addresses that can't be used, because they would clash with other pages (`admin`, `privacy`,
    `accessibility`, and so on);
  - the featured-videos limits stay as they are.
- `src/content/docs.ts`: today each saved service is matched to the code by its address, which
  restores its linked gallery (the stills page). Keep that for the original seven; a new service
  has no gallery, only videos.
- `src/routes/services.$slug.tsx`: the page looks the service up in the code (`getService`), so
  a new one would answer "not found". Look it up in the saved content instead, as the hidden check
  already does.
- Add a field to `Service` recording that it was published once (for example `published: true`,
  set on first un-hide), so the admin knows to lock the address.
- `src/admin/tabs.tsx`, "שירותים" tab: the add and delete buttons (the `List` component already
  supports `editable` with create/min/max, as used for videos), plus the address field with
  its lock.
- `src/content/seo-pages.ts`: nothing needed. A service with no written entry already falls back
  to its name + area, and to Merav's own wording when she types it.
- Footer, menu and homepage grid read the list from content: check they all pick up new
  services, and that a deleted one disappears everywhere.
- At deploy, the same rules apply to the Cloudflare storage (D1); nothing extra.
- Tests: add, rename, publish (address locks), delete (including an original), refusing a
  duplicate or reserved address, refusing to delete the last visible service, and the sitemap
  listing.

Estimated: a few hours including tests.

## Bar/bat mitzvah landing page: finish it, then build it into the site

A dedicated page for "קליפים לבר ובת מצווה", designed separately from the site.

- **Where it stands:** version 2 is designed on its own canvas
  (https://claude.ai/artifact/Face9DiaM57eD626U2YpEU), with a shareable static preview
  (https://claude.ai/artifact/LSZyrYKDazftJi6to4cde3, 15 November 2026). Version 1 has an older
  preview (https://claude.ai/artifact/Jcsu8kSwvJDobw9Mvcqdc7). The canvas is the source of
  truth; the preview is rebuilt from it.
- **1. Finish the design:** review version 2 with Merav, settle the remaining copy, photos and
  clips, and get her approval on the canvas.
- **2. Build it into the site's code:** a real page in this project (React + Tailwind, the
  site's own colours, fonts and components), not a copy of the static preview. Decisions to
  make first:
  - **Address:** for example `/bar-bat-mitzvah`. Not the same as the existing service page
    `/services/bar-bat-mitzvah`, which stays.
  - **Header and footer:** the site's own (visitors can reach the rest of the site), or a
    stripped-down version focused on one action (typical for ad campaigns).
  - **Google:** indexed alongside the service page, or `noindex` if it's only for ads and
    shared links, so the two pages don't compete in search.
  - **Editing:** whether Merav edits its texts, photos and clips in the admin (a new tab, like
    the homepage sections) or it stays fixed in code.
  - **Contact:** the same WhatsApp form as the rest of the site, or a version tuned for this
    page (for example, the interest preset to bar/bat mitzvah).
  - **Ads and tracking (ask Merav: "Will you advertise this page with paid ads on Facebook,
    Instagram or Google?"):**
    - **No ads** (she shares the link herself, on WhatsApp or her Instagram bio): no pixel, no
      consent banner, no privacy policy change. The page can have the full header and footer
      and be indexed like any other page.
    - **Ads:** she'll probably want a Facebook or Google pixel to see which ads brought
      inquiries. Suggested setup: the pixel and its consent banner **on the landing page only**,
      so the rest of the site stays without tracking and without a banner. The form is on the
      page, so it still measures what matters. The pixel loads only after the visitor
      approves. The choice is remembered so the banner doesn't come back, and declining
      leaves the page fully working. Add a section to the privacy policy (one policy for the
      whole site) about the landing page's pixel and consent. Ad pages usually keep visitors
      focused on contacting her, with fewer links away.
    - **Not sure yet:** build it without tracking, and add the pixel and banner if and when she
      starts advertising.
- **3. Check it like the rest of the site:** the four checkers (QA, security, legal and
  accessibility, SEO) on the new page, plus the sitemap and the structured data if it's
  indexed.

## Waiting on Merav

- Her business number (מספר עוסק): replaces `[להשלים: מספר עוסק]` on the privacy policy and
  the accessibility statement (`src/content/legal.ts`).
- Real testimonials to replace the four sample ones (two still contain `[שם התיאטרון]` and
  `[שם העסק]`), or remove them.
- Her own hero video (requirements: MP4, up to 8MB, 6-15 second loop, 1080p landscape, no
  sound, calm framing with the key part in the middle).
- Whether the music in her clips is licensed.
- Accepting the Google Cloud owner invitation; switching the support email to hers.

## Before launch

- A lawyer reviews the privacy policy and the accessibility statement.
- Decide the domain (with or without www).

## Deploy (needs Merav's Cloudflare account)

- Create her Cloudflare account and invite Yatom as Super Administrator.
- Admin storage on Cloudflare: D1 for content and the admins list, R2 for photos and the hero
  video (streamed with range requests). Upload checks: sign-in before reading the upload, size
  limits, file signature, fixed content type. Clean up uploads nothing refers to.
- Google sign-in on the live site: Worker secrets `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `ADMIN_EMAILS`, `ADMIN_SESSION_SECRET`; add `https://<domain>/admin/auth/callback` to the
  Google OAuth client.
- Connect the GitHub repository in Cloudflare; test on a preview address: a real sign-in, a
  refused save, the security headers, trailing-slash redirects (308).
- Switch the content policy from report-only to enforced once the live site shows no reports.

## At launch

- `src/config/site.ts`: `indexable: true` and the domain in `url` (this turns on canonical
  tags, the sitemap and robots.txt).
- `public/_headers`: remove the two "keep images and video out of search" blocks.
- Merge `admin` into `main` (this publishes the site).
- Google Search Console: verify the domain and submit the sitemap. Google Business profile as
  a service-area business with the address hidden.

## Small cleanups, any time

- Hydration warnings from the scroll-in animations (console noise only).
- Remaining `npm audit` items are in build and test tools only; they clear with TanStack and
  vitest updates.
