# Salon Booking

A mobile-friendly booking page for a single stylist, plus an admin side she owns.

- **Clients** (`/`) pick a service and a free time and send a **request**.
- **She** (`/admin`) sees pending requests, confirms or declines them, keeps a
  searchable log of everything, and edits her services, weekly hours, and days off.

Nothing is ever confirmed without her, and a requested slot is held from the
moment it is asked for — which is what stops the double-booking.

## How double-booking is prevented

Three layers, because a single client-side check is not enough:

1. **Pending holds the slot.** A request occupies its time immediately, so a
   second client cannot ask for the same slot while the first is undecided.
2. **Re-check before writing.** The booking page re-reads the day right before
   submitting, in case the live listener lagged behind another client.
3. **Re-check at confirm.** `RequestsTab` re-reads the day when she taps
   Confirm and refuses if it now overlaps a confirmed appointment, naming the
   client it clashes with.

The scheduling logic lives in `src/lib/schedule.js` with no Firebase in it, and
is covered by `npm test`.

## Privacy

Clients need to see *which* times are taken, but not *who* took them. So each
appointment writes two documents:

- `appointments/{id}` — name, phone, notes. Readable only by her, and by the
  device that created it.
- `busy/{id}` — start, end, status. No personal data, publicly readable.

`firestore.rules` enforces this. The rules are the real security boundary; the
Firebase web config in `.env.local` is not a secret.

## Run it right now (no Firebase needed)

```sh
npm install
npm run dev
```

With no Firebase config present the app starts in **demo mode**: five sample
services, normal working hours, and data kept in that browser's localStorage. A
banner says so. Sign in on the stylist side with any email and password to reach
the admin tabs. Good for showing her the idea before setting anything up.

Demo mode is decided by `src/lib/config.js`; every page reads data through
`src/lib/backend.js`, which points at either Firestore or `demoBackend.js`. As
soon as `.env.local` holds a real project the banner disappears and the same
screens run on Firestore.

## Setup (all on the free Spark plan)

1. **Create the project** at <https://console.firebase.google.com> — no billing
   card needed for Spark.
2. **Enable Authentication** → Sign-in method → turn on **Anonymous** (clients)
   and **Email/Password** (her).
3. **Create her account**: Authentication → Users → Add user, with her email and
   a password.
4. **Create Firestore** in production mode, in the region closest to her.
5. **Make her the stylist**: in Firestore, create a collection `admins` with a
   document whose **ID is her Auth UID** (copy it from the Users tab). The
   document can be empty.
6. **Copy the web config**: Project settings → Your apps → Web app → Config.
   Paste the values into `.env.local` (start from `.env.example`).
7. **Install and run**:
   ```sh
   npm install
   npm run dev
   ```
8. **Publish the rules** (required — the defaults will block everything):
   ```sh
   firebase login
   firebase use --add          # pick the project you just made
   firebase deploy --only firestore:rules
   ```
9. **Seed her services and hours**: sign in at `/admin`, then use the
   **Services** and **Hours** tabs. Until at least one service exists, the
   booking page has nothing to offer.

## Deploy

```sh
npm run build
firebase deploy --only hosting
```

That gives a `https://<project>.web.app` link she can put in her Instagram bio.
Free tier covers a single stylist's traffic comfortably.

## Handing it over to her

The `admins` collection is a list, not a single owner, so adding her is one
document and no code change:

1. Authentication -> Users -> **Add user** with her email and a password she
   can change.
2. Copy her **User UID**.
3. Firestore -> `admins` -> **Add document** with that UID as the **document
   ID**. The document itself can be empty; only its existence matters
   (see `isStylist()` in `firestore.rules`).

She can then sign in at `/admin` with her own credentials. Removing your own
UID from `admins` hands it over completely -- but keep **project ownership** in
the Firebase console until she is comfortable, since that is what controls
billing and the ability to restore access if she is ever locked out.

Worth doing before you give it to her:

- Add real services and prices under the **Services** tab.
- Set her actual working hours and days off under **Hours**.
- Delete any test appointments so her log starts clean.

## What v1 deliberately leaves out

- **Notifications.** Pending requests show as a badge in her admin panel and
  clients see status when they reopen their link. Email confirmations are the
  natural next step — `setAppointmentStatus` in `src/lib/db.js` is the single
  place a send would hook into.
- **Client accounts.** Clients are anonymous, so a client who switches phones
  cannot look up their old request. Her log still has everything.
- **Recurring or multi-window days.** Each weekday has one open/close window.
  The data model (`weekly[day]` is an array) already allows more than one; only
  the Hours UI edits the first.
# salon-booking
