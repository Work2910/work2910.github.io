# Shoumik Chakravarty · Portfolio

One website with two sides:

| Side | Address | Who |
|---|---|---|
| Public site | `https://YOURNAME.github.io/` | Everyone. Read-only. |
| Owner login + editor | `https://YOURNAME.github.io/admin.html` | Only you, with your email and password. |

When you press **Save** on the admin page, the public site updates by itself within a second or two, even for people who already have it open.

Hosting is free: GitHub Pages serves the files, and Firebase (Spark plan, no card needed) handles the login and stores your content.

---

## One-time setup (about 20 minutes)

### Part A: Firebase

1. Go to **https://console.firebase.google.com**, click **Create a project**, name it (for example `shoumik-portfolio`). You can turn Google Analytics off.
2. **Turn on email login.** Left menu → **Build → Authentication → Get started** → **Sign-in method** tab → **Email/Password** → Enable → Save.
3. **Create your owner account.** **Users** tab → **Add user** → your email and a strong password. Then copy the **User UID** shown in the list (a long code like `kR3x...`). You need it twice below.
4. **Create the database.** Left menu → **Build → Firestore Database → Create database** → pick a location close to you (for India, `asia-south1 (Mumbai)`) → **Start in production mode** → Create.
5. **Lock it down.** In Firestore, open the **Rules** tab, delete what is there, paste the contents of `firestore.rules` from this folder, replace `PASTE_YOUR_OWNER_UID` with your UID from step 3, and click **Publish**.
   This is what stops anyone else from changing your site.
6. **Get the web config.** Click the gear icon → **Project settings** → scroll to **Your apps** → click the web icon `</>` → give it a nickname → **Register app**. Firebase shows a `firebaseConfig = { ... }` block.
7. Open `js/firebase-config.js` in this folder and replace each `PASTE_...` value with the matching value from that block. Also paste your UID into `OWNER_UID`. Save the file.
   These values are safe to publish; the security rules from step 5 protect your data.

### Part B: GitHub Pages

8. On **https://github.com**, create a new **public** repository named exactly `YOURNAME.github.io` (your GitHub username).
9. In the new repository click **uploading an existing file**, then drag in **everything inside this folder** (`index.html`, `admin.html`, and the `css`, `js` and `assets` folders). Click **Commit changes**.
10. Repository **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main**, folder **/ (root)** → Save. After a minute or two the site is live at `https://YOURNAME.github.io/`.

### Part C: Connect the two

11. Back in Firebase: **Authentication → Settings → Authorized domains → Add domain** → `YOURNAME.github.io`.
12. Optional but recommended: in **Authentication → Settings → User actions**, untick **Enable create (sign-up)** if you see it, so nobody else can register accounts.
13. Open `https://YOURNAME.github.io/admin.html`, log in, and press **Save** once. This copies your starting content into Firebase. From now on the public site shows whatever you save.

---

## Everyday use

- **Edit:** go to `/admin.html`, log in, change anything in the panel on the right (the page on the left previews your changes), press **Save**.
- **Images:** use *Upload image* on the photo or any certificate. Images are resized automatically. For a PDF certificate, upload a screenshot of it.
- **Log out:** the *Log out* button at the top of the editor. On shared computers, always log out.
- **Forgot password:** type your email on the login page and click *Forgot password?*.
- **Test the visitor view:** open the public address in a private / incognito window.

You do not need to re-upload files to GitHub after edits. Only upload again if you change the code itself.

## What is in this folder

```
index.html            public site (also works with the built-in content if Firebase is unreachable)
admin.html            owner login + editor
css/site.css          all styles
js/render.js          builds the page from your content (shared by both sides)
js/public.js          public side: live updates from Firebase
js/admin.js           login, editor, saving
js/content-default.js starting content, used until your first Save
js/firebase-config.js your Firebase keys + owner UID (fill in during setup)
firestore.rules       security rules to paste into Firebase
assets/               photo and certificate images
```

## Limits of the free plan

Firebase Spark allows 50,000 database reads per day. Each visit uses about 1 read per document (your content plus each uploaded image), so this covers thousands of visitors a day.
