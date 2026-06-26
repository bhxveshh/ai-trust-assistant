🛡️ AI Trust Assistant

An enterprise-grade, AI-powered e-commerce fraud detection engine.

AI Trust Assistant evaluates the legitimacy of online product listings (e.g. Amazon) by combining real-time on-page HTML scraping, a 5-lane parallel web context search, and deterministic LLM evaluation to generate a comprehensive trust score.

Show Image
Show Image
Show Image
Show Image

Live Demo · Report Bug · Request Feature

</div>

📸 Preview

<table>
<tr>
<td align="center" width="33%"><b>Sign In</b></td>
<td align="center" width="33%"><b>New Case Intake</b></td>
<td align="center" width="33%"><b>Case File & Verdict</b></td>
</tr>
<tr>
<td><img src="screenshots/01-login.png" width="100%"/></td>
<td><img src="screenshots/02-investigate-listing.png" width="100%"/></td>
<td><img src="screenshots/03-case-result.png" width="100%"/></td>
</tr>
</table>

✨ Features


Live Data Extraction — scrapes high-res product images, real-time pricing, ratings, and technical specifications directly from e-commerce URLs using Cheerio and browser spoofing.
Parallel Context Gathering — executes a 5-lane multi-agent search pipeline via SerpAPI to extract:

Product Reputation
Seller Domain Trust
Explicit Fraud Signals
Market Price Benchmarks
Seller Complaint History



Deterministic AI Evaluation — feeds structured, pre-labeled data into Google's Gemini 2.5 Flash using a tightly constrained "Clinical Authority" system prompt, ensuring mathematically grounded risk assessment without AI hallucinations.
"Clinical Authority" UI/UX — a responsive dashboard built to feel like a hybrid between a luxury storefront and a financial diagnostic terminal.
Custom Svelte 5 Architecture — built on the latest Svelte 5 runes ($state, $derived) for flawless reactivity, alongside a mathematically calculated SVG semicircle gauge for data visualization.



🏗️ Architecture & Tech Stack

Frontend (Client)

FrameworkSvelte 5 (Vite) + TypeScriptStylingTailwind CSS (Dark Mode / Slate & Emerald theme)IconsLucide-SvelteState ManagementSvelte 5 RunesDeployed onVercel

Backend (Server)

RuntimeNode.js + Express.jsDatabaseMongoDB (via Mongoose)ScrapingCheerio, AxiosExternal APIsGoogle Gemini 2.5 Flash (@google/generative-ai), SerpAPIDeployed onRender


🗄️ Data Contract

The pipeline operates on a strict, deterministic JSON schema to ensure the UI always receives structured, predictable data:

typescriptinterface AnalysisRecord {
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


🔌 API Reference

Base URL: https://ai-trust-assistant.onrender.com/api

MethodEndpointAuth requiredDescriptionPOST/auth/register❌Create a new accountPOST/auth/login❌Sign in and receive a JWTPOST/analysis✅ (Bearer)Submit a listing URL for investigationGET/analysis/:id✅ (Bearer)Retrieve a saved case file by IDGET/status❌Health check

Authenticated requests expect:

Authorization: Bearer <token>


🚀 Getting Started

Prerequisites


Node.js (v18+)
A MongoDB connection string (Atlas or local)
A Gemini API key
A SerpAPI key


1. Clone the repo

bashgit clone https://github.com/bhxveshh/ai-trust-assistant.git
cd ai-trust-assistant

2. Backend setup

bashcd backend
npm install

Create a .env file in backend/:

envPORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
SERPAPI_KEY=your_serpapi_key

Run it:

bashnode server.js

3. Frontend setup

bashcd frontend
npm install

Create a .env file in frontend/:

envVITE_API_BASE_URL=http://localhost:5000/api

Run it:

bashnpm run dev


When deploying, set VITE_API_BASE_URL to your production backend URL (e.g. https://ai-trust-assistant.onrender.com/api) in your hosting provider's environment variable settings, then rebuild — Vite bakes env vars in at build time.




🌐 Live Deployment

ServicePlatformURLFrontendVercelai-trust-assistant.vercel.appBackendRenderai-trust-assistant.onrender.com


⚠️ The backend runs on Render's free tier, which spins down after inactivity. The first request after idling may take 30–50+ seconds while it wakes up.




📄 License

This project is open source. Add your preferred license (MIT, Apache 2.0, etc.) here.
