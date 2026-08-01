# Deep Focus

A complete study and time-management web app — Pomodoro timer, AI-generated flashcards, an AI study assistant, ambient sounds, and a smart planner, all in one place.

**Live app:** [deepfocus-zone.vercel.app](https://deepfocus-zone.vercel.app/)

---

## Features

- **Pomodoro Timer** — focused study sessions with per-subject time tracking
- **AI-Generated Flashcards** — automatically turns your notes into review cards using spaced repetition
- **AI Study Assistant ("Focus")** — a chatbot that analyzes your real study data (exam dates, hours studied, performance) and gives recommendations based on actual numbers, not generic advice
- **Ambient Sounds** — rain, fire, nature, and lo-fi, procedurally generated with the Web Audio API
- **Performance Analytics** — weekly stats, best study time, best day, average session length
- **Smart Planner** — subjects ranked by priority and time left until exams
- **Fully Responsive** — optimized mobile experience with bottom navigation
- **Full Arabic (RTL) Support** — the app UI itself is built for Arabic-speaking users

---

## Tech Stack

- **HTML5 / CSS3** — no framework, fully custom design
- **JavaScript (Vanilla)** — the entire app logic, no heavy libraries
- **Web Audio API** — for procedural ambient sound generation
- **[Lucide Icons](https://lucide.dev/)** — icon set
- **Cloudflare Workers** — backend proxy for AI requests (flashcard generation and chat)
- **Vercel** — hosting

---

## Project Structure

```
├── index.html            # Main page structure
├── manifest.json         # PWA manifest (name, icons, theme)
├── robots.txt             # Search engine crawling rules
├── sitemap.xml            # Sitemap for SEO
├── preview.png             # Social share preview image (og:image / twitter:image)
├── apple-touch-icon.png     # iOS home screen icon
├── favicon-16x16.png         # Browser favicon (16x16)
├── favicon-32x32.png         # Browser favicon (32x32)
├── icon-192.png                # PWA icon (192x192)
├── icon-512.png                # PWA icon (512x512)
├── css/
│   └── style.css           # All styling
├── js/
│   ├── app.js               # Core app logic (state, timer, AI, analytics...)
│   └── onboarding.js         # First-run onboarding/walkthrough flow
├── images/                    # Additional in-app images/assets
└── README.md
```

> Load order matters: `onboarding.js` must be included **before** `app.js` in `index.html`, since `app.js` expects `window.onboardingInstance` to already be defined.

---

## Running Locally

No build step required — the project runs directly in the browser:

```bash
git clone https://github.com/<your-username>/deep-focus.git
cd deep-focus
```

Open `index.html` directly in your browser, or serve it locally:

```bash
npx serve .
```

> Note: AI features (chatbot and flashcard generation) rely on an external Cloudflare Worker, so an internet connection is required even for local development.

---

## Developer

Designed and built entirely by **Islam Misbah**, a Computer Science student at the Faculty of Science, Sohag University, and a Frontend Developer focused on building smart tools for learning.

- WhatsApp: [01103023916](https://wa.me/201103023916)

---

## License

This is a personal project built as a learning tool. For usage or collaboration inquiries, please reach out directly to the developer.