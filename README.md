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
| Live | Zoom only. Admin pastes the Zoom link (plus optional meeting ID and passcode) and members click "Join on Zoom". Includes Zoom instructions for automatic cloud recording, backgrounds and keeping it private. |
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

### Stripe (when the course launches)

1. Create a Stripe account and copy the secret key into `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint `https://YOUR-SITE/api/stripe/webhook` for the event `checkout.session.completed`
   and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.

Without Stripe, students who enroll show as "awaiting payment" in Admin → Course and you click
**Mark paid and open course** after receiving payment another way.

## Changing the name or wording

The site name, Hebrew name, tagline and the Rav's name live in `src/lib/site.ts`. The About page text is in
`src/app/about/page.tsx` (there is a placeholder paragraph for the Rav's background).
