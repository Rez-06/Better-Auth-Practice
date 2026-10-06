# Next.js + Better Auth + HeroUI + MongoDB: Authentication Starter

A beginner-friendly guide to how this project works, and how to build it **from scratch using Bun**.

By the end you will understand:

- What each tool does (Next.js, Better Auth, HeroUI, MongoDB, Tailwind, Bun)
- What every file in this project is for
- What happens, step by step, when someone signs up, signs in, or signs out
- Every command needed to recreate the project

---

## Table of Contents

1. [What this project does](#1-what-this-project-does)
2. [The tools, explained simply](#2-the-tools-explained-simply)
3. [Build it from scratch (all Bun commands)](#3-build-it-from-scratch-all-bun-commands)
4. [Project structure](#4-project-structure)
5. [File-by-file explanation](#5-file-by-file-explanation)
6. [How authentication flows work](#6-how-authentication-flows-work)
7. [Key concepts for beginners](#7-key-concepts-for-beginners)
8. [Running the project](#8-running-the-project)
9. [Common errors and fixes](#9-common-errors-and-fixes)
10. [Things to clean up before production](#10-things-to-clean-up-before-production)
11. [Next steps](#11-next-steps)

---

## 1. What this project does

This is a small web app with **user accounts**:

- **Sign Up page**: a new user enters name, email, and password. An account is saved in a database.
- **Sign In page**: an existing user enters email and password and gets logged in.
- **Navbar**: shows *Login / Sign Up* when you are logged out, and *Welcome, \<name\> / Sign Out* when you are logged in.
- **Show/hide password** eye icon on both forms.

---

## 2. The tools, explained simply

Think of building a website like running a restaurant. Each tool has a job.

| Tool | Restaurant analogy | What it really does |
|------|-------------------|---------------------|
| **Bun** | The kitchen supply truck | A fast JavaScript runtime and package manager. It installs libraries and runs your project. It replaces `npm` here. |
| **Next.js** | The restaurant building and staff | A React framework. It gives you pages, routing, a server, and an API in one project. |
| **React** | The recipe format | The library for building user interfaces out of reusable components. Next.js is built on it. |
| **Tailwind CSS** | The interior decorator | Styling with small utility classes like `flex`, `gap-4`, `w-96` written directly in your JSX. |
| **HeroUI** | Pre-made furniture | A component library (Button, Input, Form, Link, Spinner, and so on) already styled and accessible. |
| **Gravity UI Icons** | Pictures on the wall | A set of icons (`Check`, `Eye`, `EyeSlash`) used as React components. |
| **Better Auth** | The security guard and guest list | Handles sign up, sign in, sessions, and sign out. It creates API endpoints and a client helper. |
| **MongoDB** | The filing cabinet | The database where users, sessions, and accounts are stored. |
| **MongoDB adapter** | The translator | Lets Better Auth talk to MongoDB (`@better-auth/mongo-adapter`). |

### How they fit together

```
 Browser (user sees this)
 ┌───────────────────────────────────────────┐
 │  React components (HeroUI + Tailwind)     │
 │  sign-in page, sign-up page, navbar       │
 │          │                                │
 │          ▼                                │
 │  auth-client.js  (Better Auth client)     │
 └──────────┬────────────────────────────────┘
            │ HTTP requests to /api/auth/...
            ▼
 Next.js Server
 ┌───────────────────────────────────────────┐
 │  app/api/auth/[...all]/route.js           │
 │          │                                │
 │          ▼                                │
 │  auth.js  (Better Auth server config)     │
 └──────────┬────────────────────────────────┘
            │ via mongodb adapter
            ▼
        MongoDB database
```

---

## 3. Build it from scratch (all Bun commands)

### Step 0: Prerequisites

1. **Install Bun** (see https://bun.sh for your operating system):

   ```bash
   # macOS / Linux
   curl -fsSL https://bun.sh/install | bash

   # Windows (PowerShell)
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

   Check it worked:

   ```bash
   bun --version
   ```

2. **A MongoDB database.** The easiest option is a free cluster on **MongoDB Atlas** (https://www.mongodb.com/atlas). You will copy its **connection string**, which looks like `mongodb+srv://user:password@cluster.mongodb.net/...`.

### Step 1: Create the Next.js project

```bash
bun create next-app@latest my-app
```

(`bunx create-next-app@latest my-app` does the same thing.)

The installer asks questions. This project used these answers:

- TypeScript? **No** (plain JavaScript)
- ESLint? Your choice
- Tailwind CSS? **Yes**
- `src/` directory? Your choice (this guide assumes the `@/` import alias points to wherever `lib/` lives)
- App Router? **Yes**
- Import alias? **Yes**, keep the default `@/*`

Then move into the folder:

```bash
cd my-app
```

### Step 2: Install the libraries

```bash
# Authentication
bun add better-auth

# Database driver and the adapter that connects Better Auth to MongoDB
bun add mongodb @better-auth/mongo-adapter

# UI components, their styles, and icons
bun add @heroui/react @heroui/styles @gravity-ui/icons
```

> **Note:** HeroUI v3 is built for Tailwind CSS v4, which a fresh Next.js project already includes. If a package name or version has changed, check the official docs for [Better Auth](https://www.better-auth.com/docs) and [HeroUI](https://www.heroui.com).

What each one is for:

| Package | Purpose |
|---------|---------|
| `better-auth` | The core auth library (server and client) |
| `mongodb` | Official MongoDB driver (`MongoClient`) |
| `@better-auth/mongo-adapter` | Saves Better Auth data into MongoDB |
| `@heroui/react` | UI components |
| `@heroui/styles` | The CSS that styles HeroUI components |
| `@gravity-ui/icons` | Icon components |

### Step 3: Create the environment file

Create a file named **`.env.local`** in the project root (next to `package.json`):

```env
# Your MongoDB connection string
BETTER_AUTH_DB_URL="mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority"

# A long random string used to sign/encrypt sessions
BETTER_AUTH_SECRET="put-a-long-random-string-here"

# The URL your app runs on
BETTER_AUTH_URL="http://localhost:3000"
```

Generate a random secret with:

```bash
openssl rand -base64 32
```

> **Never commit `.env.local` to GitHub.** It contains passwords. Next.js's default `.gitignore` already ignores it.

### Step 4: Add the HeroUI styles

Open `app/globals.css` and make sure it has these two imports at the top:

```css
@import "tailwindcss";
@import "@heroui/styles";
```

### Step 5: Create the files

Create these files (the full explanation of each is in [section 5](#5-file-by-file-explanation)):

```bash
mkdir -p lib
mkdir -p app/components
mkdir -p "app/api/auth/[...all]"
mkdir -p app/sign-in
mkdir -p app/sign-up

touch lib/auth.js
touch lib/auth-client.js
touch "app/api/auth/[...all]/route.js"
touch app/components/navbar.jsx
touch app/sign-in/page.jsx
touch app/sign-up/page.jsx
```

Then paste your code into each file.

### Step 6: Run it

```bash
bun dev
```

Open http://localhost:3000.

### All Bun commands in one place

| Command | What it does |
|---------|--------------|
| `bun create next-app@latest my-app` | Creates a new Next.js project |
| `bun add <package>` | Installs a library and records it in `package.json` |
| `bun install` | Installs everything listed in `package.json` (use after cloning the repo) |
| `bun dev` | Starts the development server with hot reload |
| `bun run build` | Builds the app for production |
| `bun start` | Runs the production build |
| `bun remove <package>` | Uninstalls a library |

---

## 4. Project structure

```
my-app/
├── .env.local                      # Secrets (never share)
├── package.json                    # List of libraries and scripts
├── public/
│   └── favicon.ico                 # (favicon can also live in app/)
├── lib/
│   ├── auth.js                     # SERVER: Better Auth setup and database
│   └── auth-client.js              # CLIENT: helpers used in React components
└── app/
    ├── layout.js                   # Wraps every page (navbar goes here)
    ├── globals.css                 # Global styles (Tailwind + HeroUI)
    ├── page.js                     # Home page ( / )
    ├── components/
    │   └── navbar.jsx              # Navigation bar
    ├── sign-in/
    │   └── page.jsx                # Sign-in page ( /sign-in )
    ├── sign-up/
    │   └── page.jsx                # Sign-up page ( /sign-up )
    └── api/
        └── auth/
            └── [...all]/
                └── route.js        # Auth API endpoints ( /api/auth/... )
```

### How Next.js turns folders into URLs

In the **App Router**, the folder structure *is* your website's URL structure:

| File | URL |
|------|-----|
| `app/page.js` | `/` |
| `app/sign-in/page.jsx` | `/sign-in` |
| `app/sign-up/page.jsx` | `/sign-up` |
| `app/api/auth/[...all]/route.js` | `/api/auth/anything/here` |

- A file named **`page.js` / `page.jsx`** creates a *page* people can visit.
- A file named **`route.js`** creates an *API endpoint* (no visual page, just data).
- A folder named **`[...all]`** is a *catch-all*: it matches `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/get-session`, and so on, all with one file.

---

## 5. File-by-file explanation

### `lib/auth.js` (the server brain)

```js
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
console.log("DNS SERVERS:", dns.getServers());

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.BETTER_AUTH_DB_URL);
const db = client.db("better-auth-db");

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  database: mongodbAdapter(db, { client }),
});
```

Line by line:

- **`dns.setServers([...])`**: a workaround. `mongodb+srv://` connection strings need a DNS lookup. On some networks or ISPs this fails, so this forces Node to use Cloudflare (`1.1.1.1`) and Google (`8.8.8.8`) DNS. If your connection works without it, you can delete these lines.
- **`new MongoClient(process.env.BETTER_AUTH_DB_URL)`**: creates a connection to your database using the secret from `.env.local`.
- **`client.db("better-auth-db")`**: picks (or creates) a database named `better-auth-db`.
- **`betterAuth({...})`**: creates the auth system.
  - `emailAndPassword: { enabled: true }` turns on email and password login.
  - `database: mongodbAdapter(...)` tells Better Auth to store users and sessions in MongoDB.

Better Auth creates collections such as `user`, `session`, `account`, and `verification` automatically.

### `lib/auth-client.js` (the browser's helper)

```js
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

React components run in the **browser**, so they cannot use the server file directly. Instead they use this client, which sends HTTP requests to your auth API.

- **`signUp.email({...})`**: creates an account
- **`signIn.email({...})`**: logs in
- **`signOut()`**: logs out
- **`useSession()`**: a React hook that tells you who is logged in right now (and whether it is still loading)

> **Important:** Use `signOut` from **this file**, not from `better-auth/api`. The `better-auth/api` version is for the server and needs request headers, which causes the error *"Headers is required"*.

### `app/api/auth/[...all]/route.js` (the doorway)

```js
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

This converts the Better Auth server into a Next.js route handler. It exports `GET` and `POST` functions, which Next.js calls whenever the browser makes a GET or POST request to `/api/auth/...`. **Without this file, the client has nothing to talk to.**

### `app/layout.js` (the frame around every page)

```jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" ...>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

The layout wraps **every** page. Putting `<Navbar />` here means the navbar appears everywhere. `{children}` is replaced by whichever page you are visiting.

It also loads the **Geist** fonts via `next/font/google`.

### `app/globals.css` (global styles)

- `@import "tailwindcss";` turns on Tailwind.
- `@import "@heroui/styles";` loads HeroUI's component styles.
- The `:root` variables define light and dark colors. `prefers-color-scheme: dark` switches them automatically if the user's system is in dark mode.

### `app/components/navbar.jsx` (session-aware navigation)

Key parts:

```jsx
"use client";
const { data: session, isPending } = useSession();
```

- **`"use client"`** at the top marks this as a **Client Component**. It is required because the file uses `useState` and `useSession`, which only work in the browser.
- **`isPending`** is `true` while the app checks whether you are logged in. During that moment a `<Spinner />` is shown.
- **`session?.user`** exists only if someone is logged in.

```jsx
{session?.user ? (
  <>
    <span>Welcome, {session.user?.name}</span>
    <Button onClick={() => signOut()}>Sign Out</Button>
  </>
) : (
  <>
    <Link href="/sign-in">Login</Link>
    <Link href="/sign-up"><Button>Sign Up</Button></Link>
  </>
)}
```

This is **conditional rendering**: logged in shows the welcome message and Sign Out; logged out shows Login and Sign Up.

The rest of the navbar is layout: a hamburger menu for mobile (`isMenuOpen` state toggles it), and `hidden md:flex` classes so the full menu only shows on medium and larger screens.

### `app/sign-up/page.jsx` (create an account)

```jsx
const { data: resData, error } = await signUp.email({
  name: data.name,
  email: data.email,
  password: data.password,
});
```

How it works:

1. `<Form onSubmit={onSubmit}>` is HeroUI's form wrapper.
2. Each field is a `<TextField>` containing a `<Label>`, `<Input>`, and `<FieldError>`.
3. The **`validate`** prop runs checks (name length, email format, password rules) and returns an error message string or `null`.
4. On submit, `e.preventDefault()` stops the browser's default page reload.
5. `new FormData(e.currentTarget)` reads every field that has a `name` attribute.
6. The values are sent to Better Auth with `signUp.email(...)`.
7. The result is `{ data, error }`. If `error` is set, something went wrong. Otherwise `data` has the new user.

### `app/sign-in/page.jsx` (log in)

Same structure as sign-up, but calls:

```jsx
await signIn.email({
  email: data.email,
  password: data.password,
  rememberMe: true,
  callbackURL: "/",
});
```

- **`rememberMe: true`** keeps the user logged in after the browser closes.
- **`callbackURL: "/"`** sends the user to the home page after a successful login.

### The show/hide password toggle (both forms)

```jsx
const [showPassword, setShowPassword] = useState(false);

<TextField type={showPassword ? "text" : "password"} ...>
  <div className="relative">
    <Input className="w-full pr-10" />
    <Button
      type="button"
      isIconOnly
      onPress={() => setShowPassword((prev) => !prev)}
    >
      {showPassword ? <EyeSlash /> : <Eye />}
    </Button>
  </div>
</TextField>
```

- **State** (`useState`) remembers whether the password should be visible. It starts as `false` (hidden).
- The input's `type` switches between `"password"` (dots) and `"text"` (readable).
- The button is positioned on top of the input with `absolute right-1`, inside a `relative` wrapper.
- `type="button"` prevents the toggle from accidentally submitting the form.
- `onPress` is HeroUI's preferred click handler. It works for mouse, touch, and keyboard.

---

## 6. How authentication flows work

### Sign up

```
1. User fills the form and clicks Submit
2. sign-up/page.jsx runs onSubmit()
3. signUp.email({...}) sends POST /api/auth/sign-up/email
4. route.js hands the request to Better Auth (auth.js)
5. Better Auth HASHES the password (never stores the real one)
6. Better Auth saves a user in MongoDB and creates a session
7. A session cookie is sent back to the browser
8. useSession() in the navbar updates → "Welcome, <name>"
```

### Sign in

```
1. User enters email and password
2. signIn.email({...}) sends POST /api/auth/sign-in/email
3. Better Auth finds the user, hashes the typed password, compares hashes
4. If they match: creates a session and sets a cookie
5. User is redirected to "/" (callbackURL)
6. Navbar shows "Welcome, <name>"
```

### Staying logged in (sessions)

After login, the browser holds a **cookie**. On every later request the cookie is sent along, and Better Auth looks up the matching session in MongoDB. `useSession()` asks "who does this cookie belong to?" and the answer is what populates `session.user`.

### Sign out

```
1. User clicks Sign Out
2. signOut() sends POST /api/auth/sign-out
3. Better Auth deletes the session and clears the cookie
4. useSession() updates → navbar goes back to Login / Sign Up
```

---

## 7. Key concepts for beginners

### Server vs. client code

| | Runs where | Can use | Example here |
|---|-----------|---------|--------------|
| **Server code** | On your computer/server | Secrets, database | `lib/auth.js`, `route.js` |
| **Client code** | In the user's browser | `useState`, click handlers | `navbar.jsx`, sign-in/up pages |

The rule: **never put database passwords in client code.** Anything in a `"use client"` file is sent to the browser for anyone to read.

### `"use client"`

In Next.js, components are **Server Components** by default. If a component needs interactivity (`useState`, `onClick`, hooks like `useSession`), add `"use client";` as the very first line.

### Components and props

A component is a reusable piece of UI, like `<Button>`. **Props** are the settings you pass in:

```jsx
<Button type="submit" variant="secondary">Reset</Button>
```

### State

`useState` is how React remembers things between renders. Changing state automatically re-renders the component.

```jsx
const [showPassword, setShowPassword] = useState(false);
//     ↑ current value  ↑ function to change it   ↑ starting value
```

### Hashing passwords

Better Auth never saves the actual password. It saves a **hash**: a one-way scrambled version. When you log in, your typed password is hashed again and compared. Even someone who reads the database cannot see real passwords.

### Environment variables

Secrets live in `.env.local` and are read with `process.env.NAME`. They stay out of your code and out of Git.

---

## 8. Running the project

```bash
bun install      # only needed after cloning (installs dependencies)
bun dev          # starts at http://localhost:3000
```

Try it:

1. Go to http://localhost:3000/sign-up and create an account.
2. Go to http://localhost:3000/sign-in and log in.
3. Check that the navbar shows **Welcome, \<your name\>**.
4. Click **Sign Out** and check that the navbar goes back to Login / Sign Up.

You can also look in MongoDB Atlas (Browse Collections → `better-auth-db`) to see the `user` and `session` collections.

---

## 9. Common errors and fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ReferenceError: signIn is not defined` | `signIn` was never imported | Add `import { signIn } from "@/lib/auth-client";` |
| `APIError: Headers is required` when signing out | `signOut` imported from `better-auth/api` (server version) | Import it from `@/lib/auth-client` instead, and export it there |
| `querySrv ECONNREFUSED` / MongoDB won't connect | DNS can't resolve the `mongodb+srv` address | Keep the `dns.setServers` workaround, or switch network/DNS. Also check Atlas **Network Access** allows your IP |
| `Module not found: @/lib/auth` | `@/` alias points somewhere else (for example `src/`) | Put `lib/` where the alias points, or edit `jsconfig.json` |
| Icons don't render / import error | Icon name misspelled | Check the exact export names in `@gravity-ui/icons` |
| Styles look unstyled | Missing `@import "@heroui/styles";` | Add it to `globals.css` after the Tailwind import |
| Navbar flashes a spinner on every page load | `useSession` is checking the cookie | Normal; the spinner is only shown while `isPending` is true |
| Env variables are `undefined` | File named wrong, or server not restarted | Name it `.env.local` and restart `bun dev` |

---

## 10. Things to clean up before production

1. **Remove `console.log` of form data in the sign-in page.** Right now it logs the user's password to the browser console:
   ```js
   console.log('form er data', data)   // ← delete this
   ```
2. **Remove the `dns.setServers` and `console.log("DNS SERVERS")`** from `auth.js` if you don't need the workaround.
3. **Don't hardcode `baseURL`.** Replace `"http://localhost:3000"` with an environment variable (for example `process.env.NEXT_PUBLIC_BASE_URL`), or remove `baseURL` when client and server share the same origin.
4. **Set `BETTER_AUTH_SECRET`** to a strong random value in production.
5. **Handle errors in the UI.** Currently results are only `console.log`ged. Show `error.message` to the user, and redirect after sign-up (for example with `useRouter` from `next/navigation`).
6. **Sign-in password rules.** The sign-in form enforces the uppercase and number rules. Those belong on **sign-up** only. On sign-in, `isRequired` is enough, otherwise users with older, weaker passwords get blocked before the server checks anything.
7. **Update `metadata`** in `layout.js` (it still says "Create Next App").
8. **Use `onPress` instead of `onClick`** on HeroUI buttons (for example the Sign Out button) for the best keyboard and touch support.

---

## 11. Next steps

- Redirect to the home page after sign-up and show friendly error messages
- Protect pages (for example a `/dashboard` that only logged-in users can see)
- Add social login (Google, GitHub) via Better Auth's `socialProviders` option
- Add email verification and password reset
- Replace the starter home page (`page.js`) with real content
- Deploy to Vercel and set your environment variables in its dashboard

### Useful documentation

- Next.js: https://nextjs.org/docs
- Better Auth: https://www.better-auth.com/docs
- HeroUI: https://www.heroui.com
- Tailwind CSS: https://tailwindcss.com/docs
- Bun: https://bun.sh/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas