import Head from 'next/head';
import ChatUI from '../components/ChatUI';

export default function Home() {
  return (
    <>
      <Head>
        <title>Knowledge Engine — AI Document Intelligence</title>
        <meta name="description" content="Upload any PDF and ask questions powered by Mistral AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <ChatUI />
    </>
  );
}
```

---

### 📄 FILE 10 of 10 — `components/ChatUI.js`

**Where to type in Name field:** `components/ChatUI.js`

**Paste the entire ChatUI.js code** from the previous response (the large file with `TypingDots`, `MessageBubble`, `DocumentBadge`, `UploadZone`, and `ChatUI` components).

---

## PHASE 6 — Verify Your Repository

After creating all files, your GitHub repo should look like this:
```
✅ .env.local.example
✅ next.config.js
✅ package.json
✅ postcss.config.js
✅ tailwind.config.js
✅ components/
    └── ChatUI.js
✅ pages/
    ├── index.js
    └── api/
        └── chat.js
✅ styles/
    └── globals.css
✅ utils/
    └── pdfParser.js
```

If anything is missing → repeat the "Create new file" steps.

---

## PHASE 7 — Deploy to Vercel (Free, Automatic)

**Step 1.** Go to → **vercel.com**

**Step 2.** Click **"Sign Up"** → choose **"Continue with GitHub"** → authorize it

**Step 3.** Click **"Add New Project"**

**Step 4.** Find your `ai-knowledge-engine` repo → click **"Import"**

**Step 5.** Before clicking Deploy, scroll down to **"Environment Variables"**

**Step 6.** Add this variable:
```
Name:   HUGGINGFACE_API_TOKEN
Value:  hf_your_actual_token_here
```

> Get your free token at → **huggingface.co/settings/tokens** → New Token → Read access → Copy it

**Step 7.** Click **"Deploy"**

**Step 8.** Wait 2–3 minutes → Vercel gives you a live URL like:
```
https://ai-knowledge-engine-yourusername.vercel.app
```

---

## PHASE 8 — Every Time You Update Code

When you want to edit any file later:

1. Go to your GitHub repo
2. Click the file you want to edit
3. Click the **pencil icon** (✏️) top right
4. Make your changes
5. Scroll down → click **"Commit changes"**
6. Vercel **auto-deploys** within 1–2 minutes — no manual work needed

---

## Quick Checklist Before You Start
```
□ GitHub account created
□ Repository created (Public, with README)
□ All 10 files created in correct folders
□ HuggingFace account created
□ HuggingFace token generated (Read access)
□ Vercel account connected to GitHub
□ HUGGINGFACE_API_TOKEN added in Vercel
□ Deploy clicked → live URL received
