# To-do

What's still open, grouped by what each item waits on. Updated 2026-11-26.

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

## Search phrases

- ~~**Research pass**~~ Done 2026-11-26 (Google autocomplete and the live results for each
  service). Findings: people search "סרטון תדמית לעסק" (not "סרט"), "סרטון שיווקי לעסק",
  "צילומי משפחה בטבע / בבית"; "קולולם" is mostly searched as the brand (the generic term is
  "שירת המונים"); "קליפ בר/בת מצווה" results are dominated by recording studios; "קליפ סיום"
  (יב, כיתה ו) is searched far more than "קליפ סיכום"; "צלמת אשדוד" and "צלמת רחובות" are
  searched, the smaller towns aren't.
- ~~**New titles and descriptions**~~ Applied 2026-11-26: the services in
  `src/content/seo-pages.ts`; the homepage and the landing page in the live admin (and their
  defaults in `src/content/site.ts` and `src/content/landing.ts`). Titles now fit Google's
  ~60 characters.
- ~~**Page copy**~~ Applied 2026-11-26 with the same phrases: the hero heading ("קליפים, סרטוני
  תדמית / וצילומי משפחה באור טבעי"), the six service openings, the bold sentence in "נעים
  להכיר", the FAQ's price and filming-location answers, and the footer's services heading
  ("קליפים, סרטונים וצילומים:"). The service areas in the structured data are now separate
  places.
- **Questions for Merav, FAQ ideas and the Search Console review:** moved to the handover email
  (below).

## Waiting on Merav

Everything that waits on her is now in the handover email (below, "What's waiting on her"), so
the project doesn't wait on her answers.

## Before launch

- ~~**Switch the content policy to enforced**~~ Done 2026-11-26: checked the main pages on the
  live site (home, a service page, the landing page with a clip playing, privacy, the admin)
  with no policy errors, then enforced in `src/config/security-headers.ts` and
  `public/_headers`; checked again on the live site, nothing blocked.

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

**Ready (2026-11-26), send after launch.** Outside the repo, in
`C:\Users\yatom\Projects\Mirav Hafakot\handover\`:

- **The email:** `handover-email.html` to copy into Gmail (bold and links survive the paste);
  its source is `handover-email.txt` (rebuild the page from it after a change).
- **The guide to attach:** "מדריך לממשק הניהול.pdf", 9 pages with screenshots from the live
  admin. Its source is `admin-guide.html` (screenshots embedded), printed to PDF with headless
  Chrome.
- **Before sending:** type the Cloudflare and mynames logins into the email's blanks, directly
  in Gmail (Heidi's choice to send them by email). Cloudflare also has two-factor sign-in, so
  Merav needs the second step too.

**What the email covers, kept simple** (Merav doesn't do technical tasks): the site and the
landing page links; the admin and the attached guide; what's waiting on her (read the legal
pages, click "accept" on the Google Cloud invitation); content to replace (sample
testimonials, her own wording and video names, her hero video, "מילות חיפוש בגוגל" with the
research questions, the FAQ); her responsibility (consents, the legal texts, a lawyer's review
is her decision); advertising (whoever runs her campaign follows guide section 14, then Heidi
checks); her accounts (Cloudflare with Heidi's card to replace, Heidi offers to help;
mynames renewal 22 November 2027); Heidi's phone and email.

**Kept by Heidi, not in the email:** Google Search Console (a look at the real searches after a
month or two) and the Google Cloud support email (it stays Heidi's; only its owner can set
their own address there). The code lives on GitHub and isn't mentioned to her.

## Small cleanups, any time

- ~~**Uploads and storage**~~ Done 2026-11-24: the "תמונות שהועלו" tab lists uploaded photos
  and, below them, uploaded hero videos, shows where each is used, and deletes unused ones for
  good (the server refuses one still in use).
- ~~**A deleted service's old address**~~ Done 2026-11-24: a service the site launched with,
  if deleted, forwards to the homepage (301); an address that never existed stays "not found".
  (A service Merav adds and later deletes isn't known to the code, so its address shows "not
  found".)
- ~~**Hydration warnings and `npm audit`**~~ Checked 2026-11-24: no hydration warnings on the
  main pages, and `npm audit` reports no vulnerabilities.
- ~~**Image file names**~~ Skipped (decided 2026-11-24): descriptive names would add little to
  search (descriptions and page text matter far more), and renaming changes image addresses.

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
