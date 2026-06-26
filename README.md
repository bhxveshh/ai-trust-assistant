# 🛡️ AI Trust Assistant

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)

An enterprise-grade, AI-powered e-commerce fraud detection engine.

**AI Trust Assistant** evaluates the legitimacy of online product listings (e.g., Amazon) by combining real-time on-page HTML scraping, a 5-lane parallel web context search, and deterministic LLM evaluation to generate a comprehensive trust score — all surfaced through a "Clinical Authority" dashboard built in Svelte 5.

<!-- 📸 Replace this with a real screenshot or GIF of your app — see "Adding Images" at the bottom of this README -->
![AI Trust Assistant UI](docs/screenshot-dashboard.png)

---

## 📑 Table of Contents

- [Features](#-features)
- [How It Works](#-how-it-works)
- [Architecture & Tech Stack](#%EF%B8%8F-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Data Contract](#%EF%B8%8F-data-contract)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Adding Images to This README](#-adding-images-to-this-readme-next-steps)

---

## ✨ Features

- **Live Data Extraction** — Scrapes high-res product images, real-time pricing, ratings, and technical specifications directly from e-commerce URLs using Cheerio and browser-header spoofing (to avoid bot-blocking).
- **Parallel Context Gathering** — Executes a 5-lane multi-agent search pipeline via SerpAPI, each lane returning structured signal for one dimension of trust:

  | Lane | Purpose |
  |---|---|
  | 🏷️ Product Reputation | General sentiment / review consensus for the product itself |
  | 🌐 Seller Domain Trust | Age, reputation, and history of the seller/domain |
  | 🚩 Explicit Fraud Signals | Scam reports, counterfeit warnings, takedown notices |
  | 💰 Market Price Benchmarks | Cross-references listed price against market average to flag "too good to be true" pricing |
  | 📣 Seller Complaint History | Aggregated complaints, chargebacks, and unresolved disputes |

- **Deterministic AI Evaluation** — Feeds the structured, pre-labeled data from the steps above into Google's **Gemini 2.5 Flash** using a tightly constrained "Clinical Authority" system prompt, so the model scores risk against fixed rules instead of free-associating — minimizing hallucinated verdicts.
- **"Clinical Authority" UI/UX** — A responsive dashboard that splits the difference between a luxury storefront and a financial diagnostic terminal: dark slate background, emerald accent for "safe," amber/red for risk tiers.
- **Custom Svelte 5 Architecture** — Built on Svelte 5 runes (`$state`, `$derived`) for fine-grained reactivity, with a hand-calculated SVG semicircle gauge driving the trust-score visualization (no charting library overhead).

## 🔄 How It Works

The analysis pipeline runs in four stages, end-to-end, per submitted URL:

```
 ┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐     ┌──────────────┐
 │  1. Scrape  │ ──▶ │ 2. Parallel Search│ ──▶ │ 3. AI Evaluation    │ ──▶ │ 4. Score &   │
 │  (Cheerio)  │     │ (5-lane SerpAPI)  │     │ (Gemini 2.5 Flash)  │     │ Verdict      │
 └─────────────┘     └──────────────────┘     └────────────────────┘     └──────────────┘
```

1. **Scrape** — The backend fetches the target URL and parses title, price, rating, image, and spec table from the raw HTML.
2. **Parallel Search** — The five context lanes above fire concurrently against SerpAPI so total latency is bounded by the slowest single lane, not the sum of all five.
3. **AI Evaluation** — All scraped + searched data is compiled into one structured payload and sent to Gemini under a constrained prompt that enforces a fixed scoring rubric and output schema.
4. **Score & Verdict** — Gemini's structured JSON response (trust score, red flags, verdict) is persisted to MongoDB and streamed to the dashboard, where the SVG gauge animates to the final value.

## 🏗️ Architecture & Tech Stack

### Frontend (Client)
| Layer | Choice |
|---|---|
| Framework | Svelte 5 (Vite) + TypeScript |
| Styling | Tailwind CSS — dark mode, Slate & Emerald theme |
| Icons | lucide-svelte |
| State | Svelte 5 runes (`$state`, `$derived`, `$effect`) |
| Visualization | Hand-built SVG semicircle gauge (no chart library) |

### Backend (Server)
| Layer | Choice |
|---|---|
| Runtime | Node.js + Express.js |
| Database | MongoDB via Mongoose |
| Scraping | Cheerio + Axios |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Web Context | SerpAPI (Google Search aggregation) |
| Auth | JWT (`jsonwebtoken`) |

## 📁 Project Structure

A typical layout for this repo — adjust to match your actual folder names if they differ:

```
ai-trust-assistant/
├── client/                      # Svelte 5 + Vite frontend
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/      # Gauge, ScanForm, ResultCard, etc.
│   │   │   └── stores/          # Svelte 5 runes-based state
│   │   ├── routes/ (or App.svelte)
│   │   └── app.css              # Tailwind entry
│   ├── public/
│   ├── index.html
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── routes/              # /api/scan, /api/history, /api/auth
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── scraper.service.js     # Cheerio/Axios scraping logic
│   │   │   ├── search.service.js      # 5-lane SerpAPI pipeline
│   │   │   └── ai.service.js          # Gemini prompt + parsing
│   │   ├── models/
│   │   │   └── AnalysisRecord.js      # Mongoose schema (see Data Contract)
│   │   └── middleware/
│   ├── .env                     # Local secrets (never commit this)
│   └── package.json
│
├── docs/                        # Screenshots, diagrams, demo GIFs (see below)
├── .gitignore
└── README.md
```

## 🗄️ Data Contract

The pipeline operates on a strict, deterministic JSON schema so the UI always receives structured, predictable data:

```typescript
interface AnalysisRecord {
  user: string; // MongoDB ObjectId
  targetUrl: string;
  scrapedData: {
    title: string;
    price: string;
    rating: string;
    imageUrl: string;
    specs: Record<string, string>;
  };
  aiAssessment: {
    trustScore: number; // 0 to 100
    summary: string;
    redFlags: string[];
    verdict: "Highly Trusted" | "Exercise Caution" | "High Risk";
  };
}
```

**Verdict thresholds** (suggested — tune to your prompt's actual rubric):

| Trust Score | Verdict |
|---|---|
| 75–100 | ✅ Highly Trusted |
| 40–74 | ⚠️ Exercise Caution |
| 0–39 | 🚨 High Risk |

## 🚀 Getting Started

Follow these steps to get a copy of the project running locally for development and testing.

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **MongoDB** — local instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **Gemini API Key** — [get one here](https://aistudio.google.com/)
- **SerpAPI Key** — [get one here](https://serpapi.com/)
- **Git** ([download](https://git-scm.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-trust-assistant.git
cd ai-trust-assistant
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (use the table in [Environment Variables](#-environment-variables) below):

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
SERPAPI_KEY=your_serpapi_key
JWT_SECRET=your_jwt_secret_for_auth
```

Start the backend in dev mode:

```bash
npm run dev
```

### 3. Frontend Setup

Open a **new terminal tab**:

```bash
cd client
npm install
npm run dev
```

### 4. Run the Application

Open your browser at **http://localhost:5173**, paste an Amazon (or other supported) product URL into the scan interface, and run your first trust analysis.

## 🔑 Environment Variables

Create `server/.env` with the following keys. **Never commit this file** — make sure `.env` is listed in `.gitignore`.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (defaults to `5000`) | Port the Express server listens on |
| `MONGO_URI` | ✅ | MongoDB connection string (local or Atlas) |
| `GEMINI_API_KEY` | ✅ | API key for Google Gemini 2.5 Flash |
| `SERPAPI_KEY` | ✅ | API key for SerpAPI search lanes |
| `JWT_SECRET` | ✅ | Secret used to sign/verify auth tokens |

> 💡 Tip: ship a `server/.env.example` file with the same keys but no real values, so contributors know exactly what to fill in.

## 🖥️ Usage

1. Launch both the client and server as described above.
2. Paste a product URL (e.g., an Amazon listing) into the input field.
3. The app scrapes the listing, runs the 5-lane search, and sends everything to Gemini for scoring.
4. Review the result: trust score gauge, verdict badge, AI-generated summary, and any red flags surfaced during analysis.
5. Past scans are persisted to MongoDB and viewable from your scan history (if authenticated).

## 🗺️ Roadmap

Some natural next steps for the project:

- [ ] Support for additional marketplaces (eBay, Walmart, Etsy)
- [ ] Browser extension for one-click scans from any product page
- [ ] Confidence intervals on the trust score, not just a point estimate
- [ ] Caching layer to avoid re-scraping/re-searching identical URLs within a TTL window
- [ ] Public read-only "shareable report" links for scan results

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Feel free to check the [issues page](https://github.com/yourusername/ai-trust-assistant/issues) for open tasks.

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for the evaluation model
- [SerpAPI](https://serpapi.com/) for search aggregation
- [Svelte](https://svelte.dev/) for the reactive frontend framework

---
