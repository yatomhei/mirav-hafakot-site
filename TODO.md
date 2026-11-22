# To-do

What's left before and after launch, grouped by what each item waits on. Updated 2026-11-22.

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
    - **Decided 2026-11-22: build the consent banner in, ready for ads.** It stays switched off
      while there is no pixel (a banner with nothing to approve only bothers visitors, and no
      cookies means no consent is needed). It turns on by itself once a pixel ID is set (Facebook
      / Meta, Google Ads, or both), and the pixel loads only after the visitor approves. Write the
      privacy policy section for the landing page's pixel at the same time, published together
      with the pixel.
      **Ready in advance, so advertising after launch needs no code change or deploy:**
      - A pixel ID field (Meta, Google Ads ID and label) in the admin settings. Saving an ID
        turns on the banner and the pixel; clearing it turns both off.
      - The privacy policy's pixel section is written now, reviewed by the lawyer with the
        rest of the policy, and shown automatically only while a pixel ID is set.
      - The content policy (security headers) on the landing page allows Meta's and Google's
        addresses from the start; nothing loads from them without an ID and the visitor's
        approval.
      - Only a new platform (for example TikTok) or a different kind of tracking needs code.
- **3. Check it like the rest of the site:** the four checkers (QA, security, legal and
  accessibility, SEO) on the new page, plus the sitemap and the structured data if it's
  indexed.

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
- **Result:** suggested adjustments to the homepage and the seven service titles and
  descriptions, one main phrase per page, written for people, plus FAQ ideas. Apply after the
  user approves.
- **Then optimize the site's copy** with the phrases the research settles on: headings, service
  pages' opening paragraphs, the homepage and the FAQ, so they use the words her clients search
  for, naturally and written for people. Suggest the changes first; apply after approval. Copy
  Merav edits in the admin goes in as new defaults or as suggestions for her.
- **After launch:** Google Search Console shows the real searches that bring visitors. Revisit
  the titles after a month or two of data.

## Waiting on Merav

- Real testimonials to replace the four sample ones (two still contain `[שם התיאטרון]` and
  `[שם העסק]`), or remove them.
- Whether the music in her clips is licensed.
- Accepting the Google Cloud owner invitation; switching the support email to hers.
- At launch, her own task: a Google Business profile, from her Google account, as a
  service-area business with the address hidden (areas only), linking to the site. Yatom can
  send her a short how-to; she does the sign-up and Google's verification herself.

## Before launch

- A lawyer reviews the privacy policy and the accessibility statement.
- **Domain: bought 2026-11-22: `hafakathamerav.co.il`** (owner "Merav Verner", Yatom as
  technical and DNS contact, renews 22 November 2027). Added to her Cloudflare (Free), nameservers
  at mynames switched to `aida.ns.cloudflare.com` and `greg.ns.cloudflare.com`. Left: wait for
  **Active**, then Search Console steps 1-4. The original plan, for reference: buy a `.co.il` at mynames.co.il, in Merav's name (spelling as on her ID) and with
  her email (Meravi2340@gmail.com), with auto-renew on and the owner's details hidden if
  offered. Skip the add-ons. Then:
  1. Merav's Cloudflare → Add a domain → the domain → **Free** plan. Note the two nameservers.
  2. At mynames.co.il, replace the nameservers with Cloudflare's (the Israeli registry checks
     that they already know the domain, which is why step 1 comes first).
  3. Wait until Cloudflare shows the domain as **Active** (minutes to a day for `.il`).
  4. Then Search Console steps 1-4 (under "At launch") can be done right away.
  Decide whether the site lives on the domain with or without www (the other redirects to it).

## Deploy (needs Merav's Cloudflare account)

- ~~Create her Cloudflare account and invite Yatom as Super Administrator.~~ Done 2026-11-22:
  both are Super Administrators. Her account requires two-factor authentication, so every
  member needs 2FA on their own login (Yatom uses email codes and signs in with Google).
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
- Google Search Console. Yatom sets it up from **his own Google account** and adds Merav as
  Owner, so nobody shares a password. Whoever proves control of the domain becomes a verified
  owner, and Yatom has that control through her Cloudflare account. Can be done as soon as the
  domain is active in Cloudflare (steps 1-4); the sitemap waits for launch.
  1. search.google.com/search-console (Yatom's account) → Add property → **Domain** (the bare
     domain, no www or https; it covers every version).
  2. Verify: add the TXT record Google shows (`google-site-verification=...`) in Merav's
     Cloudflare account → the domain → DNS → Add record → type TXT, name `@`. Or use Google's
     one-click "verify with Cloudflare". Then click **Verify**.
  3. Settings → Users and permissions → Add user → `Meravi2340@gmail.com` → **Owner**. Access
     works right away: she gets a notification email (tell her it's coming) but doesn't need to
     accept anything; the site appears when she opens Search Console with her Gmail.
  4. Optional: Merav can also verify herself later (a TXT record of her own), so her ownership
     never depends on Yatom's.
  5. **At launch:** Sitemaps → submit `sitemap.xml`. URL inspection → homepage → Request
     indexing.
  6. Optional: Bing Webmaster Tools, imported from Search Console in one click.
  After a few weeks, Performance shows the real searches (feeds the second keyword round).

## Small cleanups, any time

- Hydration warnings from the scroll-in animations (console noise only).
- Remaining `npm audit` items are in build and test tools only; they clear with TanStack and
  vitest updates.
