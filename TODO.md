# To-do

What's still open, grouped by what each item waits on. Updated 2026-11-24.

The site is live on https://hafakathamerav.co.il (kept out of Google until launch). Content is
edited only on the live admin; code goes through GitHub (work on `admin`, merging into `main`
publishes in about 2 minutes, so merge only with Heidi's go-ahead). How it's set up is at the
end of this file.

## Bar/bat mitzvah landing page

Version 2 is designed on its own canvas (https://claude.ai/artifact/Face9DiaM57eD626U2YpEU), the
design source for the build. Ortal's comments (2026-11-23): add motion effects to some elements,
no other changes.

- ~~**Build it into the site's code**~~ Built 2026-11-23, reviewed and adjusted by Heidi, live
  since 2026-11-24: `/bar-mitzvah-clips`
  (`src/routes/bar-mitzvah-clips.tsx`, `src/components/landing/`), standalone with its own footer
  (a WhatsApp call to action, the logo linking to the home page, email and phone). The clips play
  in the site's in-page player; the form opens a WhatsApp message like the site's (subject
  "קליפ לבר/בת מצווה"). Admin tab "דף נחיתה: בר/בת מצווה" edits every text, clip and photo,
  hides the testimonials, takes up to 15 testimonial screenshots (masonry), and has the page's
  Google title and description.
  - **Motion:** the opening rises in; the questions pop in one by one and the answers follow
    (pinned where it fits); "אזהרת ספוילר!" zooms down and shakes, then the rest appears (pinned);
    the process is a zigzag timeline of square cards with icons, ending in a "הקליפ שלכם מוכן!"
    card that pops in with confetti (canvas-confetti); the contact section turns brown as its
    title reaches mid-screen; Gefen's photos lift on hover. All off under reduced motion.
  - **Saved records and new fields:** a saved section missing a field the code later gained is
    completed from the launch content (`fillMissing` in `src/content/docs.ts`), so Merav's edits
    survive code changes.
  - ~~**Address `/bar-mitzvah-clips`**~~ Done: the bar/bat mitzvah card is set to "דף אחר"
    `/bar-mitzvah-clips`, so the homepage card, footer and "more services" lead there, and
    `/services/bar-bat-mitzvah` forwards to it (301).
  - **Google:** its own title and description are done (admin tab), and since the service leads
    to it, the sitemap will list it once the site is indexable. It carries the service's
    structured data (JSON-LD: the service, offered by the business, and the breadcrumb), moved
    from the service page on 2026-11-24.
  - **Ads and tracking:** built (2026-11-24), switched off until a pixel ID is entered.
    **Merav will advertise this page** (confirmed 2026-11-23). Choosing platforms, opening the ad
    accounts and entering the IDs are hers (explained in the handover email): the landing page
    tab, card "הודעת העוגיות ופיקסלי הפרסום" (Meta pixel ID, Google Ads ID and conversion label).
    - With an ID saved, the landing page shows a consent banner; the pixel loads only after
      "מאשרים", "לא, תודה" leaves the page working, the choice is kept in the browser, and
      "הגדרות עוגיות" in the page's footer changes it (taking it back clears the pixel's
      cookies). Clearing the IDs turns everything off.
    - Leads: the form and the WhatsApp button send Meta's "Lead" and the Google Ads conversion;
      a tap on the phone sends Meta's "Contact". The form's contents are never sent.
    - Pixel and banner on the landing page only (Meta's page-view tracking on navigation is
      off, so the rest of the site isn't tracked). The content policy allows Meta's and
      Google's addresses on every page (a visitor arriving through a link keeps the first
      page's policy).
    - The privacy policy's section 4 and service list change by themselves while an ID is set.
      Included in what the handover email says about a lawyer's review being her decision.
    - Once IDs are in: check on the live site that the banner shows, and that Meta's Events
      Manager and Google Ads see the page view and a test lead.
    - Only a new platform (for example TikTok) needs code.
- ~~**Check it like the rest of the site**~~ The four checkers ran on 2026-11-24 (QA, security
  and SEO 84, legal and accessibility 56 before fixes). Fixed the same day: focus ring on the
  olive buttons, visible form labels, the accessibility statement's exemption wording, Meta's
  automatic form reading off, contrast and field edges, errors tied to their field, the pinned
  "spoiler" section only where it fits, privacy policy (countries, legal basis, cookie lifetimes,
  testimonial screenshots, a date that follows the pixels), hero thumbnail first, smaller logo,
  double-submit guard and a stricter phone check, bigger tap areas, international phone in the
  structured data, og:image size, the old service address forwarding even when hidden, and
  stricter admin input (photo addresses, email, deleting, save order). Still open from them:
  - ~~**Content**~~ Done 2026-11-24: the heading's "בר.בת" stays (the period is on purpose); the
    screenshot "הוא היה קשוח..." is removed from the live page (13 left; the image is still in
    the uploads tab); the quote comes from one of the screenshots, without a name; the note under
    the form is the homepage form's note (the same admin field), plus "מעדיפים לדבר? חייגו:" and
    the phone.
  - ~~**"נעים להכיר" on the landing page:** remove the studio~~ Done 2026-11-24 (she has no
    studio): now "בטבע או בבית", live and in the built-in text.
  - **Not needed:** an accessibility widget (no law requires one, and the business is exempt).
  - **Decided 2026-11-24:** no long caching for `/images` (left as is), and no CSP report address
    (see "Before launch").
  - **At launch:** a Cloudflare 301 rule for addresses ending in "/", and check that Cloudflare
    doesn't block ChatGPT, Claude and Perplexity.
- ~~**Ortal**~~ Sent the link and reviewed it on the live site (2026-11-24).

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

- **Read the privacy policy and the accessibility statement, and the consents:** Heidi sent her a
  WhatsApp on 2026-11-24 (her responsibility from here; reminded in the handover email). Her
  questions or corrections go into `src/content/legal.ts` and the two pages.
- Accepting the Google Cloud owner invitation; switching the support email to hers.

## Before launch

- Switch the content policy from report-only to enforced (`src/config/security-headers.ts` and
  `public/_headers`). No report address (decided 2026-11-24): first open the main pages on the
  live site (home, a service page, the landing page with a clip playing, privacy, the admin) and
  check the browser console shows no policy errors, then enforce and check them again.

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
5. **Search Console** (already verified, Heidi's account, Merav is Owner): Sitemaps → submit
   `sitemap.xml`; URL inspection → homepage → Request indexing. Optional: Bing Webmaster Tools,
   imported from Search Console in one click. After a few weeks, Performance shows the real
   searches (feeds the second keyword round).

## Handover to Merav

When the site is launched, Heidi sends Merav one email (keep a copy) with everything she owns
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
    address shows "not found". The homepage's selected videos and stills mosaic are their own
    lists, so they aren't affected.
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
  - **Photos already uploaded** can be used again anywhere without uploading twice: "בחירה
    מתמונות שהועלו" next to every upload button. A photo removed from the site stays there, so
    it can be brought back the same way, until it's deleted in the "תמונות שהועלו" tab
    (deleting is for good).
- **Content that's hers to replace or keep up** (Heidi provided the starting content):
  - The landing page's 6th clip title, "[שם הקליפ]".
  - The homepage testimonials: four samples, two still with `[שם התיאטרון]` and `[שם העסק]`.
    Until she has real ones she can hide the section (admin → "המלצות" → "הסתרת אזור ההמלצות",
    it keeps them and hides the menu link too). If she hides it, the FAQ's caption number should
    change from 06 to 05.
  - Her social links (none for now), the landing page's quote, and anything else written as a
    starting point.
- **Her responsibility for what she publishes** (a reminder of Heidi's WhatsApp, 2026-11-24):
  - The privacy policy and the accessibility statement are in her name: she reads them, she is
    the contact for privacy and accessibility requests and answers them, and she fills in the
    descriptions when she adds photos.
  - Written consent from clients whose WhatsApp messages appear as testimonials (on the site
    and in ads), kept as their reply; parents' consent for children's photos, clips and names
    in paid ads.
  - The legal texts were written from how the site works, not reviewed by a lawyer: having a
    lawyer review them (and the testimonial screenshots question) is her decision.
- **Advertising:** choosing the platforms, opening Meta Business / Google Ads accounts, and
  entering the pixel IDs in the admin (landing page tab, "הודעת העוגיות ופיקסלי הפרסום"): the
  cookie banner and the privacy policy's text switch on by themselves. After she enters them,
  Heidi checks once on the live site that the banner shows and a test lead is recorded.
- **Her hero video:** the requirements (MP4, up to 8MB, a 6-15 second loop, 1080p landscape, no
  sound, calm framing with the key part in the middle), and where to upload it in the admin.
- **Cloudflare** (dash.cloudflare.com): hosting, DNS, storage. Her login, and a reminder that
  two-factor authentication is on and Heidi is a Super Administrator there. **The card on file
  is Heidi's** (added 2026-11-23 to switch on R2 storage, free tier): ask her to replace it with
  her own under Manage Account → Billing → Payment info. The site and stored files aren't
  affected.
- **mynames.co.il:** the domain registrar. Her login, the renewal date (22 November 2027,
  auto-renew on, about 74₪ a year), and that the card on file must stay valid.
- **Google Search Console** (search.google.com/search-console): with her Google account, no
  separate login. What it shows, in two lines.
- **Google Cloud** (console.cloud.google.com): the project behind the admin's Google sign-in,
  once she has accepted the owner invitation.
- **GitHub:** where the site's code lives, and who owns the repository.
- **Who to call:** Heidi's contact details for changes and problems, and what's included.

**Logins, not in the email body:** don't put passwords in plain email (anyone who gets into her
inbox gets everything). Share them through a password manager (for example a shared Bitwarden
or 1Password item), or have her set new passwords herself during a call. The email lists where
each login is kept. After handover, ask her to turn on two-factor authentication wherever it's
offered (Google, mynames).

## Small cleanups, any time

- **Unused uploads in R2:** photos are handled: the admin's "תמונות שהועלו" tab lists them,
  shows where each is used, and deletes unused ones for good (the server refuses one still in
  use). Uploaded hero videos aren't listed there yet; a replaced video stays in storage (a few
  MB each, well inside the free 10GB).
- A deleted service's old address answers "not found"; a permanent redirect to the homepage
  could be added if old links matter.
- Hydration warnings from the scroll-in animations (console noise only).
- Remaining `npm audit` items are in build and test tools only; they clear with TanStack and
  vitest updates.

## How the live site is set up (reference)

- **Cloudflare, Merav's account** (both Merav and Heidi are Super Administrators, 2FA required):
  Worker `mirav-hafakot-site` builds `main` from GitHub (`npm run build`, `npx wrangler deploy`,
  preview builds off). D1 `mirav-content` (saved sections, added admins) and R2 `mirav-uploads`
  (photos and videos, served at `/uploads/<name>`), both region EEUR. Settings in
  `wrangler.jsonc`, tables in `migrations/`. The custom domain is listed there too; `workers.dev`
  and preview addresses are off.
- **Secrets** (Worker → Settings → Variables and Secrets): `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`, `ADMIN_SESSION_SECRET` (its value is kept in
  `.local-content/live-admin-session-secret.txt`, git-ignored).
- **Domain:** `hafakathamerav.co.il` (owner Merav Verner, Heidi as technical contact, renews 22
  November 2027), nameservers at mynames point to Cloudflare. `www` is a proxied AAAA `100::`
  record plus the "Redirect from WWW to root" rule (301); "Always Use HTTPS" is on. The Google
  verification TXT record must never be deleted.
- **Google sign-in:** OAuth client in the "Merav hafakot admin" project, redirect URIs for
  localhost and `https://hafakathamerav.co.il/admin/auth/callback`; the app is published.
- **Wrangler** on Heidi's computer is signed in with access to Merav's account only.
- **Changing the admin later:** adding a field or section is safe (saved content gets the code's
  defaults); renaming or removing one needs a step that carries saved content over.
- `scripts/copy-content-to-cloudflare.mjs` did the one-time copy of local content into D1
  (2026-11-23); it refuses to run again on a database that has content.
