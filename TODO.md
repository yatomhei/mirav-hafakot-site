# To-do

What's still open, grouped by what each item waits on. Updated 2026-11-23.

The site is live on https://hafakathamerav.co.il (kept out of Google until launch). Content is
edited only on the live admin; code goes through GitHub (work on `admin`, merging into `main`
publishes in about 2 minutes, so merge only with Yatom's go-ahead). How it's set up is at the
end of this file.

## Now

- **Send Ortal the link** to the live site.

## Bar/bat mitzvah landing page

Version 2 is designed on its own canvas (https://claude.ai/artifact/Face9DiaM57eD626U2YpEU), the
design source for the build. Ortal's comments (2026-11-23): add motion effects to some elements,
no other changes.

- **Build it into the site's code:** a real page (React + Tailwind, the site's colours, fonts and
  components) from version 2, plus Ortal's motion effects.
  - **Standalone:** without the site's header and footer (decided 2026-11-23).
  - **Its own admin tab** so Merav edits its texts, photos and clips (decided 2026-11-23).
  - **Address:** for example `/bar-mitzvah`. Once it's live, choose "דף אחר" in the admin
    (שירותים > the service's card) and type its address: the homepage card, footer and "more
    services" lead there, and `/services/bar-bat-mitzvah` forwards to it (301). Until then
    leave the field empty.
  - **Google:** once the service leads to it, the sitemap lists it automatically. Give it its
    own title, description, canonical and the service's structured data (moved from the service
    page), indexed. (A landing page no service leads to isn't listed automatically: add it to
    `STANDALONE_PAGES` in `src/lib/sitemap.ts` if Google should find it, otherwise `noindex`.)
  - **Contact:** the site's WhatsApp form, or a version tuned for this page (interest preset to
    bar/bat mitzvah).
  - **Ads and tracking:** build the consent banner in, ready for ads (decided 2026-11-22). Ask
    Merav: "Will you advertise this page with paid ads on Facebook, Instagram or Google?"
    - Off while no pixel ID is set (no banner, no cookies). Saving a pixel ID (Meta, Google Ads
      ID and label) in the admin settings turns on the banner and the pixel; the pixel loads
      only after the visitor approves, declining leaves the page working, the choice is
      remembered. Clearing the ID turns both off.
    - Pixel and banner on the landing page only; the rest of the site stays without tracking.
    - The privacy policy's pixel section is written now, reviewed by the lawyer with the rest,
      and shown only while a pixel ID is set.
    - The landing page's content policy allows Meta's and Google's addresses from the start.
    - Only a new platform (for example TikTok) needs code.
- **Check it like the rest of the site:** the four checkers (QA, security, legal and
  accessibility, SEO), plus the sitemap and structured data.
- **Then Ortal reviews it** on the live site.

## Search phrases: a research pass before launch

The current Google titles and descriptions (homepage in the admin's "גוגל ושיתוף ברשתות",
services in `src/content/seo-pages.ts`) come from a first keyword plan, not from research.

- **Ask Merav** which words her clients use when they contact her (for example "סרטון לבת
  מצווה", "קליפ בטבע", "צלמת לברית"), and whether she works in more towns (גן יבנה, בני עי"ש,
  קריית עקרון, רחובות).
- **Google's suggestions:** autocomplete, "related searches" and "people also ask" for the main
  phrase of each page. The questions are also material for the FAQ.
- **Who ranks now:** search each main phrase with her towns (for example "צלמת בר מצווה
  אשדוד") and note how the top local businesses word their titles.
- **Compare wording:** Google Trends for close variants (for example "קליפ בת מצווה" vs "סרט
  בת מצווה"). Optional: Google Keyword Planner for monthly volumes (needs a Google Ads
  account; skip the campaign and payment steps).
- **Result:** suggested adjustments to the homepage and all the service titles and
  descriptions, one main phrase per page, written for people, plus FAQ ideas. Apply after the
  user approves.
- **Then optimize the site's copy** with those phrases: headings, service pages' opening
  paragraphs, the homepage and the FAQ. Suggest first, apply after approval. Copy Merav edits in
  the admin goes in as suggestions for her.
- **After launch:** Search Console shows the real searches. Revisit the titles after a month or
  two of data.

## Waiting on Merav

- **Now that the site is live:** she reads the privacy policy (/privacy) and the accessibility
  statement (/accessibility), so she knows what she commits to in her own name: she is the
  contact for privacy and accessibility requests and has to answer them, what happens to
  inquiries sent through the form and WhatsApp, and keeping what she adds in the admin
  accessible (for example alt text for photos). Her questions or corrections go into
  `src/content/legal.ts` and the two pages before the lawyer's review.
- Real testimonials to replace the four sample ones (two still contain `[שם התיאטרון]` and
  `[שם העסק]`). Until she has them, she hides the section: admin → "המלצות" → "הסתרת אזור
  ההמלצות" (added 2026-11-23; hides the section and its menu link, keeps the testimonials).
  Then update the FAQ caption number (06 to 05).
- Whether the music in her clips is licensed.
- Accepting the Google Cloud owner invitation; switching the support email to hers.
- At launch, her own task: a Google Business profile, from her Google account, as a
  service-area business with the address hidden (areas only), linking to the site. Yatom can
  send her a short how-to; she does the sign-up and Google's verification herself.

## Before launch

- A lawyer reviews the privacy policy and the accessibility statement. Also ask: may Merav
  publish testimonials as screenshots of clients' WhatsApp messages with the name removed, or
  does she need each client's consent (the plan meanwhile: ask on WhatsApp and keep the reply,
  blur the profile photo, number and identifying details; many messages concern minors)?
- Switch the content policy from report-only to enforced once the live site shows no reports
  (`src/config/security-headers.ts` and `public/_headers`).

## At launch

1. `src/config/site.ts`: `indexable: true` and `url: "https://hafakathamerav.co.il"` (turns on
   canonical tags, the sitemap and robots.txt).
2. `public/_headers`: remove the two "keep images and video out of search" blocks.
3. Merge `admin` into `main`.
4. **Test that the sitemap follows the admin** (its first real check):
   1. Open `https://hafakathamerav.co.il/sitemap.xml`: the homepage, every visible service,
      `/privacy` and `/accessibility`, each with the full domain (no `/admin`).
   2. In the admin, hide one service and save: reload the sitemap, it's gone. Show it again and
      save: it's back.
   3. Choose "דף אחר" for a service with a page of the site (for example `/privacy`) and save:
      the sitemap lists that page and not `/services/<slug>`, and the old address forwards to it
      (301). With an `https://` address, the service is left out. Switch back to "עמוד השירות"
      and save.
   4. If the sitemap didn't change, look for caching (Cloudflare, or the Worker) first.
5. **Search Console** (already verified, Yatom's account, Merav is Owner): Sitemaps → submit
   `sitemap.xml`; URL inspection → homepage → Request indexing. Optional: Bing Webmaster Tools,
   imported from Search Console in one click. After a few weeks, Performance shows the real
   searches (feeds the second keyword round).

## Handover to Merav

When the site is launched, Yatom sends Merav one email (keep a copy) with everything she owns
and how to reach it:

- **The site:** https://hafakathamerav.co.il
- **The admin:** https://hafakathamerav.co.il/admin. She signs in with her Google account
  (Meravi2340@gmail.com), no password of its own. A short guide: editing texts, photos, videos
  and services, hiding a service, adding another admin, and the reminders the admin shows.
- **Accessibility texts are mandatory** (state it clearly in the guide): the accessibility
  statement promises alternative text for every photo that carries information, so whenever she
  adds or replaces one she must fill in **"תיאור התמונה"** (what the photo shows; the stills,
  service pages, photo strip and her portrait), **"סוג הצילום"** (stills and service page
  photos: it names the "enlarge photo" button), and **"שם הסרטון"** for every video (it names the
  play button). The admin doesn't block a save without them, so an empty one is a gap against
  the statement. Not needed: the service card photos, video covers and backgrounds are
  decorative (the card's name or the video's title says what they are). Checked 2026-11-23:
  all filled in on the live site.
- **Services: best practices** (part of the guide, in plain words):
  - **Adding:** a new service starts hidden. Fill in everything (name, card photo, opening
    paragraph, videos and/or photos), check it, then untick "hidden" and save.
  - **The address:** choose it carefully, short, in English, and describing the service
    (`wedding-clips`, not `new-service-2`). It locks the first time the service is shown, so
    shared links and Google results keep working.
  - **Hide rather than delete** when a service pauses (a season, a break): hiding keeps
    everything and it comes back with one click. Delete only when it's gone for good.
  - **Deleting:** the card, the page, its videos and photos are gone after saving, and the old
    address shows "not found". A video marked for the homepage disappears from there too.
  - **Reusing an old address:** fine for an address that was never shown. For one that was live,
    only for a closely related service: old links and Google results will lead to it.
  - **Renaming:** only to reword the same service (for example "סרטי תדמית" to "סרטי תדמית
    לעסקים"). The address stays, and Google's title follows the new name unless she wrote her
    own in "איך העמוד מופיע בגוגל". **Never turn a service into a different one** (rename it and
    swap its photos and videos): the old, locked address wouldn't match (wedding clips at
    `/services/kululam`), old links and Google results would lead to the wrong service, and the
    old service would be lost. For a new service: add a new one, then hide or delete the old.
  - **Photos and videos of people:** only with their consent, and the parents' for children.
  - **One admin tab at a time:** saving from an old tab can overwrite newer changes. Reload
    before editing if a tab was left open.
  - **Testimonials:** the section can be hidden (and shown again) in the "המלצות" tab, for
    example until she has real ones. Only real testimonials, with the client's permission.
  - **A photo removed and saved** can't be brought back in the admin: upload it again, or ask
    Yatom to restore it from storage.
- **Her hero video:** the requirements (MP4, up to 8MB, a 6-15 second loop, 1080p landscape, no
  sound, calm framing with the key part in the middle), and where to upload it in the admin.
- **Cloudflare** (dash.cloudflare.com): hosting, DNS, storage. Her login, and a reminder that
  two-factor authentication is on and Yatom is a Super Administrator there. **The card on file
  is Yatom's** (added 2026-11-23 to switch on R2 storage, free tier): ask her to replace it with
  her own under Manage Account → Billing → Payment info. The site and stored files aren't
  affected.
- **mynames.co.il:** the domain registrar. Her login, the renewal date (22 November 2027,
  auto-renew on, about 74₪ a year), and that the card on file must stay valid.
- **Google Search Console** (search.google.com/search-console): with her Google account, no
  separate login. What it shows, in two lines.
- **Google Cloud** (console.cloud.google.com): the project behind the admin's Google sign-in,
  once she has accepted the owner invitation.
- **GitHub:** where the site's code lives, and who owns the repository.
- **Google Business profile** (if she made it) and **Meta Business / Google Ads** (if she
  advertises): where the pixel IDs go in the admin.
- **Who to call:** Yatom's contact details for changes and problems, and what's included.

**Logins, not in the email body:** don't put passwords in plain email (anyone who gets into her
inbox gets everything). Share them through a password manager (for example a shared Bitwarden
or 1Password item), or have her set new passwords herself during a call. The email lists where
each login is kept. After handover, ask her to turn on two-factor authentication wherever it's
offered (Google, mynames).

## Small cleanups, any time

- **Unused uploads in R2:** nothing deletes a photo or video from storage when it's removed,
  replaced, or uploaded and never saved. A small script (or admin button) lists R2, compares it
  with every `/uploads/...` address the saved content uses, and deletes the unused files after
  a grace period (for example 30 days since upload), so a file removed by mistake can still be
  found and put back by hand. Not urgent: the free tier is 10GB and a photo set is under 1MB.
  (Decided 2026-11-23: no "uploaded photos" library in the admin.)
- A deleted service's old address answers "not found"; a permanent redirect to the homepage
  could be added if old links matter.
- Hydration warnings from the scroll-in animations (console noise only).
- Remaining `npm audit` items are in build and test tools only; they clear with TanStack and
  vitest updates.

## How the live site is set up (reference)

- **Cloudflare, Merav's account** (both Merav and Yatom are Super Administrators, 2FA required):
  Worker `mirav-hafakot-site` builds `main` from GitHub (`npm run build`, `npx wrangler deploy`,
  preview builds off). D1 `mirav-content` (saved sections, added admins) and R2 `mirav-uploads`
  (photos and videos, served at `/uploads/<name>`), both region EEUR. Settings in
  `wrangler.jsonc`, tables in `migrations/`. The custom domain is listed there too; `workers.dev`
  and preview addresses are off.
- **Secrets** (Worker → Settings → Variables and Secrets): `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`, `ADMIN_SESSION_SECRET` (its value is kept in
  `.local-content/live-admin-session-secret.txt`, git-ignored).
- **Domain:** `hafakathamerav.co.il` (owner Merav Verner, Yatom as technical contact, renews 22
  November 2027), nameservers at mynames point to Cloudflare. `www` is a proxied AAAA `100::`
  record plus the "Redirect from WWW to root" rule (301); "Always Use HTTPS" is on. The Google
  verification TXT record must never be deleted.
- **Google sign-in:** OAuth client in the "Merav hafakot admin" project, redirect URIs for
  localhost and `https://hafakathamerav.co.il/admin/auth/callback`; the app is published.
- **Wrangler** on Yatom's computer is signed in with access to Merav's account only.
- **Changing the admin later:** adding a field or section is safe (saved content gets the code's
  defaults); renaming or removing one needs a step that carries saved content over.
- `scripts/copy-content-to-cloudflare.mjs` did the one-time copy of local content into D1
  (2026-11-23); it refuses to run again on a database that has content.
