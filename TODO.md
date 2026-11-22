# To-do

What's left before and after launch, grouped by what each item waits on. Updated 2026-11-22.

## Next: put the site on Cloudflare for Ortal's review (start 2026-11-23)

Ortal reviews the site and the landing page on the real domain, not the preview link. The site
goes up early, kept out of Google until launch (`indexable: false`, the image-blocking rules
stay). Nothing is created in Cloudflare without Yatom's OK; Yatom clicks through the screens.

**Phase 1: Ortal's link (a few hours)**
1. **Content snapshot:** a script copies the content saved on this computer
   (`.local-content/site-content.json`) and the uploaded photos (`public/local-uploads`) into the
   code, and the live site reads them from there. The live admin shows "editing isn't available
   yet". The testimonials stay visible.
2. **Landing page:** version 2 as one standalone static page at `/bar-mitzvah` (noindex, no
   links to it). Ortal's changes, including added, removed or reordered sections, are made
   directly in that file from now on: the canvas is no longer the source.
3. **Merge `admin` into `main`.** `main` is what the live site publishes; everyday work stays on
   `admin` and is merged when ready. (This replaces "merge only at launch".)
4. **Cloudflare (Merav's account):** create the Worker, connect the GitHub repository (builds
   from `main`), connect `hafakathamerav.co.il`, decide www or not.
5. **Check the live site** (pages, landing page, phone sizes, headers, nothing indexable), then
   send Ortal the link.
6. **During the review:** content: local admin → snapshot script → commit and push. Code and
   landing page: commit and push. The live site updates about two minutes after a push.

**Phase 2: the live admin (in parallel, about 1-2 days)**
1. **Cloudflare:** a D1 database (content, admins) and an R2 bucket (photos, hero video), each
   with Yatom's OK.
2. **Code, on its own branch**, tested on that branch's Cloudflare test address, not the live
   site: read and save content in D1, uploads to R2 with their checks, Google sign-in on the
   live site (details under "Deploy" below).
3. **Security check** of the live admin before it's switched on.
4. **The switch:** pause content edits, fill D1 from the latest snapshot, merge into `main`. The
   content is identical, so Ortal sees no change.
5. **After the switch:** content is edited only on the live admin (instant, no push); only code
   goes through GitHub. Remove the snapshot script. The local copy is for testing only.
- The admin can keep changing after the switch. Adding a field or section is safe (saved
  content gets the code's defaults); renaming or removing one needs a step that carries saved
  content over.

## Done 2026-11-22: Merav can add, delete and edit services

In the admin's "שירותים" tab: add (up to 12, a new one starts hidden), a page address in English
that locks once the service is first shown, delete any service (at least one visible remains),
reorder, and edit as before. Pages, homepage cards, footer links and the sitemap follow the saved
list. Left open: a deleted service's old address answers "not found"; a permanent redirect to the
homepage could be added later if old links matter.

## Bar/bat mitzvah landing page: finish it, then build it into the site

A dedicated page for "קליפים לבר ובת מצווה", designed separately from the site.

- **Where it stands:** version 2 is designed on its own canvas
  (https://claude.ai/artifact/Face9DiaM57eD626U2YpEU), with a shareable static preview
  (https://claude.ai/artifact/LSZyrYKDazftJi6to4cde3, 15 November 2026). Version 1 has an older
  preview (https://claude.ai/artifact/Jcsu8kSwvJDobw9Mvcqdc7). The canvas is the source of
  truth; the preview is rebuilt from it.
- **1. Finish the design:** review version 2 with Merav, settle the remaining copy, photos and
  clips, and get her approval on the canvas.
- **Meanwhile (from 2026-11-23):** the static version is on the live site at `/bar-mitzvah` for
  Ortal's review (see "Next" above), and her changes are made in that file.
- **2. Build it into the site's code, once Ortal approves and its sections are settled:** a real
  page in this project (React + Tailwind, the site's own colours, fonts and components), built
  from the approved static version. Most likely with its own admin tab so Merav can edit its
  texts, photos and clips (Yatom confirms with Ortal). Decisions to make first:
  - **Address:** for example `/bar-mitzvah`. It replaces the service page: once it's live,
    choose "דף אחר" in the admin (שירותים > the service's card) and type its address. The
    homepage card, the footer and "more services" then lead there, and
    `/services/bar-bat-mitzvah` forwards to it permanently (301). The option is built and
    works for any service (done 2026-11-22). Until the page exists, leave the field empty. The
    admin warns if the address isn't a page of the site.
  - **Header and footer:** the site's own (visitors can reach the rest of the site), or a
    stripped-down version focused on one action (typical for ad campaigns).
  - **Google:** once the service leads to it, the sitemap lists the landing page in place of
    the service page automatically (done 2026-11-22). Give it its own title, description,
    canonical and service structured data (moved from the service page). Indexed, not
    `noindex`, since it now is the service's page in search.
  - **A landing page no service leads to** (the site only hosts it, and visitors arrive from
    outside links such as ads, WhatsApp or Instagram): nothing lists it automatically. If Google
    should find it, add its address by hand to `STANDALONE_PAGES` in `src/lib/sitemap.ts`. If
    it's only for ads or shared links, leave it out of the sitemap and give it `noindex`.
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
- **Result:** suggested adjustments to the homepage and all the service titles and
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
- As soon as the site is deployed: Merav reads the privacy policy (/privacy) and the
  accessibility statement (/accessibility) on the live site, so she knows what she commits to
  in her own name: she is the contact for privacy and accessibility requests and has to answer
  them, what happens to inquiries sent through the form and WhatsApp, and keeping what she adds
  in the admin accessible (for example alt text for photos). Her questions or corrections go
  back into `src/content/legal.ts` and the two pages before the lawyer's review.

## Before launch

- A lawyer reviews the privacy policy and the accessibility statement. Also ask: may Merav
  publish testimonials as screenshots of clients' WhatsApp messages with the name removed, or
  does she need each client's consent (the plan meanwhile: ask on WhatsApp and keep the reply,
  blur the profile photo, number and identifying details; many messages concern minors)?
- **Domain: bought 2026-11-22: `hafakathamerav.co.il`** (owner "Merav Verner", Yatom as
  technical and DNS contact, renews 22 November 2027). Added to her Cloudflare (Free), nameservers
  at mynames switched to `aida.ns.cloudflare.com` and `greg.ns.cloudflare.com`. Active in Cloudflare and verified in Search Console (Yatom's account, TXT record added by Google; never delete it) 2026-11-22. Left:
  nothing; Merav added as Owner 2026-11-22. At launch: submit the sitemap (step 5). The original plan, for reference: buy a `.co.il` at mynames.co.il, in Merav's name (spelling as on her ID) and with
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
- Merge `admin` into `main` (the site is already live from Phase 1; this publishes the launch
  changes).
- **Test that the sitemap follows the admin, before submitting it to Google (step 5 below).**
  Locally it stays empty until launch, so this is its first real check, and on the live site
  it reads the saved content from the database, not from this computer.
  1. Open `https://hafakathamerav.co.il/sitemap.xml`: the homepage, every visible service,
     `/privacy` and `/accessibility`, each with the full domain (no localhost, no `/admin`).
  2. In the admin, hide one service and save: reload the sitemap, it's gone. Show it again and
     save: it's back.
  3. Choose "דף אחר" for a service with a page of the site (for example `/privacy`) and save:
     the sitemap lists that page and not `/services/<slug>`, and the old address forwards to it
     (301). With an `https://` address, the service is left out. Switch back to "עמוד השירות"
     and save.
  4. If the sitemap didn't change, look for caching (Cloudflare, or the Worker serving an old
     copy) before anything else.
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

## Handover to Merav

When the site is live, Yatom sends Merav one email (keep a copy) with everything she owns and how
to reach it:

- **The site:** https://hafakathamerav.co.il (or the www version, whichever is chosen).
- **The admin:** https://hafakathamerav.co.il/admin. She signs in with her Google account
  (Meravi2340@gmail.com), no password of its own. A short guide: editing texts, photos, videos
  and services, hiding a service, adding another admin, and the reminders the admin shows.
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
- **Her hero video:** the requirements (MP4, up to 8MB, a 6-15 second loop, 1080p landscape, no
  sound, calm framing with the key part in the middle), and where to upload it in the admin.
- **Cloudflare** (dash.cloudflare.com): hosting, DNS, storage. Her login, and a reminder that
  two-factor authentication is on and Yatom is a Super Administrator there.
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

- Hydration warnings from the scroll-in animations (console noise only).
- Remaining `npm audit` items are in build and test tools only; they clear with TanStack and
  vitest updates.
