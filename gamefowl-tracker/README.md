# Gamefowl Tracker

A private website for gamefowl breeders in the Philippines. It keeps your birds, pairs, eggs, hatches, sales and expenses in one place, and it works well on a cellphone.

**Record once. Connect everything.** When you add a bird, pair it, set its eggs and register the chicks, the app links all of it for you.

Built with Node.js (Express) and Supabase (login, database and photos).

---

## What you need

- A computer with **Node.js 20 or newer** (download it from nodejs.org)
- A free account at **supabase.com**

## Setup, step by step

### 1. Make a Supabase project
1. Log in to Supabase and click **New project**. Pick any name and a strong database password.
2. Wait a minute until the project is ready.

### 2. Create the tables
1. In Supabase, open **SQL Editor** and click **New query**.
2. Open the file `supabase/schema.sql` from this folder, copy everything, paste it in, and press **Run**.
3. It should say "Success". This creates all the tables and the photo storage.

### 3. Copy your keys
1. In Supabase, go to **Project Settings > API**.
2. In this folder, make a copy of `.env.example` and name the copy `.env`.
3. Fill in the three values:
   - `SUPABASE_URL`: the Project URL
   - `SUPABASE_ANON_KEY`: the `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY`: the `service_role` key

**Keep the service_role key secret.** Never share it and never post it online.

### 4. Install and create your admin login
Open a terminal in this folder and run:

```
npm install
npm run create-admin -- you@example.com YourPassword "Your Name"
```

Use your own email and a password with at least 6 characters.

### 5. Start the app
```
npm start
```
Open **http://localhost:3000** in your browser and log in.

### Using it on your phone
- At home: connect your phone to the same Wi-Fi as the computer, then open `http://YOUR-COMPUTER-IP:3000` on the phone.
- For use at the farm, put the app on a hosting service such as Render or Railway. Add the same values from your `.env` file as environment variables there. Set the start command to `npm start`.
- On the phone, use "Add to Home Screen" so it opens like an app.

---

## How the app works

| Screen | What it does |
| --- | --- |
| Dashboard | Active birds, tandang, inahin, pairs, eggs incubating, pisâ, hatch rate, sales, expenses, net income. Big buttons for the common jobs. |
| Birds | Add birds with a photo, band ID, bloodline and parents. Search by band ID, name, bloodline, pair ID, buyer or status. Filter by sex, status and bloodline. |
| Bird profile | Parents, a pedigree tree, mga anak, breeding history and sales history. |
| Pairs | Create PAIR-001, PAIR-002 and so on. Each pair shows its eggs, pisâ and hatch rate. |
| Hatch records | Record the eggs. The expected hatch date is worked out for you. Record the hatch and the rate is calculated. Then register the chicks and both parents are linked automatically. |
| Incubator | Capacity, eggs used, space left, and the batches inside. |
| Training | Log workouts, weigh-ins and condition for one bird or many at once. See which tandang have not trained this week. |
| Derbies | Add a derby, record each fight with its result, then upload the video and write what went well and what to improve. |
| Fight review | Watch the video, pause, and add timed notes (Good moment, Needs work, Note). Tap a note's time to jump to that moment. |
| Sales | Record a sale and the bird becomes **Sold**. Delete the sale and the bird goes back to **Active**. |
| Expenses | Feed, vitamins, medicine, veterinary, equipment and more. |
| Reports | Breeding, bird, sales and expense reports and a financial summary for this week, this month, this year, all time or your own dates. |
| Users | Admin only. Add users, reset passwords, change roles, remove users. |
| Settings | Farm name, incubation days (default 21), bloodline suggestions, and backup downloads. |

### Training, derbies and videos

If you set up the database before this feature, run `supabase/add-training-derbies.sql` once in the Supabase SQL Editor. New setups already get it from `schema.sql`.

- **Video size limit:** the free Supabase plan accepts files up to **50 MB**. A phone video of a whole fight can be bigger, so trim each fight into its own clip. Or paste a Facebook or YouTube link when you edit the fight.
- **Bigger videos:** on a paid Supabase plan you can raise the file size limit in Supabase (Storage settings). Then add `MAX_VIDEO_MB=200` (or your number) to your `.env` or to Render's environment variables.
- **Privacy:** derby videos are private. The app makes a short-lived link only while you watch.
- **Deleting a fight or derby** also deletes its uploaded videos.

### Good to know
- **Birds are never lost by accident.** A bird that has chicks, pairs or a sale cannot be deleted. Set it to **Deceased** or **Culled** instead, so the family history stays.
- **Backups.** In Settings you can download everything as Excel, a full JSON backup, or one list as CSV. Do this once in a while.
- **Photos** are stored in the Supabase storage bucket `bird-photos`. The links are long and hard to guess, but anyone who has a link can open that photo.
- **Season calendar.** The breeding season card on the dashboard (October 2026 to April 2027) comes from your Breeding Season Tracker sheet. To change the dates, edit the `SEASON` list in `public/js/views.js`.
- **Bloodlines.** "National" is already in the bloodline suggestions. Change the list in Settings.

## Folder guide

```
server.js            the server (login, records, export)
supabase/schema.sql  the database tables
scripts/create-admin.js   makes the first admin login
public/              the website you see in the browser
  index.html
  css/app.css
  js/core.js         shared helpers
  js/views.js        the screens
  js/actions.js      the forms and buttons
  js/main.js         menu, navigation and login
  assets/            your logo
```

## If something goes wrong
- **"Missing Supabase keys"**: your `.env` file is missing or a value is empty.
- **"Could not save the admin profile"**: run `supabase/schema.sql` first (step 2).
- **Cannot log in**: make sure you ran the `create-admin` command, and check the email and password.

---

Created by Juan Paolo Dente.
