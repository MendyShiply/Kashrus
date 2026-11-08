# Mishmeres HaKashrus · משמרת הכשרות

A private, members only video community for people who care about kashrus, under the guidance of
**Rabbi Yosef Dan Kirszenberg (ר׳ יוסף דן קירשנברג)**. Independent, not affiliated with any kashrus agency.

## What it does

| Area | Details |
| --- | --- |
| Join requests | Visitors fill in a sign up form (name, email, city, why they want to join). They wait on a "pending" page until an admin clicks **Accept** or **Reject**. |
| Videos | Long form videos and vertical shorts. Post by pasting a link (YouTube unlisted, Vimeo, Google Drive, Zoom recording) or by uploading a file with a progress bar. Uploaded videos only play for approved members. |
| Pages | Home, Categories, each category, Videos, Shorts, Live, Course, About, Contact, plus login and sign up. |
| Categories | Seeded with the first eight topics: Bug Awareness, Home Checking System, Bakeries, Dairy Restaurants, Meat Restaurants, Supermarket, Catering Kitchens, Off Site Events. Editable in the admin. |
| Live | Zoom only. With the Zoom Meeting SDK connected, members watch the shiur inside the Live page under their own name; there is always an "Open in Zoom app" button too. Includes Zoom instructions for automatic cloud recording, transcripts, AI summaries, backgrounds and keeping it private. |
| Zoom recordings | Admin → Zoom recordings lists the last 30 days of cloud recordings. One click imports the video, the word for word transcript and the AI Companion summary as a draft video. |
| Transcripts and summaries | Every video can have a summary and a full transcript (upload Zoom's .vtt file or paste text). Members see them under the video. |
| Articles | Shiur write ups, articles and newsletters. "Start a write up from this shiur" opens the editor next to the transcript so you can copy snippets. |
| Contact | Messages are saved and shown in the admin panel. |
| Course (for later) | Turn on enrollment and set a price when the community is ready. Two tracks: Home Kashrus and Professional Mashgiach. Lessons, progress tracking, Stripe card payments (or mark paid by hand). |
| Haskamos | Add rabbanim who approve the course, with their haskama text and signature image. They appear on the course page and sign the certificate. |
| Certificates | When a student finishes all lessons they get a printable certificate signed by the Rav and the approving rabbanim, with a public verification link. |

## Running it on your computer

Needs Node.js 20 or newer.

```bash
npm install
cp .env.example .env      # then edit .env: set AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run setup             # creates the database, the 8 categories and the admin account
npm run dev               # open http://localhost:3000
```

Log in with the admin email and password from `.env`, then go to **Admin**.

## Putting it online

The site stores its database (SQLite) and uploaded videos on disk, so host it somewhere with a
persistent disk, for example Railway, Render (with a disk), Fly.io, or any small VPS.

```bash
npm install
npm run setup
npm run build
npm start
```

Set these environment variables on the host: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `ADMIN_NAME`, `UPLOAD_DIR`, `SITE_URL`, and optionally `STRIPE_SECRET_KEY` and
`STRIPE_WEBHOOK_SECRET`. Point `DATABASE_URL` and `UPLOAD_DIR` at the persistent disk.

**Video storage tip:** uploading files is simplest, but videos take a lot of space. For long shiurim it is
often cheaper to upload to YouTube as **Unlisted** (or Vimeo with privacy set to "hide from Vimeo") and paste
the link. Only approved members see those pages.

### Zoom

Everything works without these, but they unlock the automatic parts. Create both apps at
[marketplace.zoom.us](https://marketplace.zoom.us) → Develop → Build App, **using the same Zoom account that hosts the shiurim**.

1. **Watch inside the site:** create a *General App*, turn on the **Meeting SDK** feature, and copy its Client ID and
   Client Secret into `ZOOM_SDK_KEY` and `ZOOM_SDK_SECRET`.
2. **Import recordings, transcripts and summaries:** create a *Server-to-Server OAuth* app, add the scopes
   `cloud_recording:read:list_user_recordings:admin`, `cloud_recording:read:list_recording_files:admin` and
   `meeting:read:summary:admin`, activate it, and copy the Account ID, Client ID and Client Secret into
   `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET`.
3. In Zoom settings turn on cloud recording, "Create audio transcript", and "Meeting summary with AI Companion".
   These need a paid Zoom plan (Pro or higher).

### Stripe (when the course launches)

1. Create a Stripe account and copy the secret key into `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint `https://YOUR-SITE/api/stripe/webhook` for the event `checkout.session.completed`
   and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.

Without Stripe, students who enroll show as "awaiting payment" in Admin → Course and you click
**Mark paid and open course** after receiving payment another way.

## Changing the name or wording

The site name, Hebrew name, tagline and the Rav's name live in `src/lib/site.ts`. The About page text is in
`src/app/about/page.tsx` (there is a placeholder paragraph for the Rav's background).
