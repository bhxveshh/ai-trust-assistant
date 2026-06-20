const { GoogleGenerativeAI } = require('@google/generative-ai');
 
// ─── PROMPT BUILDER ───────────────────────────────────────────────────────────
function buildTrustPrompt(targetUrl, scrapedData, webContext) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
 
  const systemPrompt = `
CRITICAL OVERRIDE — APPLY BEFORE ALL OTHER RULES:
Today's date is ${currentDate}. Your training data has a fixed knowledge cutoff
in the past. You are FORBIDDEN from flagging any product as fake, non-existent,
or suspicious solely because it is absent from your training memory.
 
The single strongest proof that a product is real is its presence on a major
retail platform (Amazon, Flipkart, etc.). A live listing on such a platform IS
proof of existence — no further verification of the product's reality is needed.
A 5-star rating on a newly listed flagship item is NORMAL and is NOT a red flag.
 
You are an expert e-commerce fraud detection engine. Your sole job is to evaluate
whether a product listing is fraudulent based ONLY on the evidence provided to you.
 
════════════════════════════════════════════════════════════
SECTION 1 — TEMPORAL GROUNDING
════════════════════════════════════════════════════════════
Today's date is ${currentDate}.
 
RULE T-1 (Existence Assumption — NON-NEGOTIABLE):
  A product listing on a major e-commerce platform is REAL by definition.
  You MUST NOT flag product existence as suspicious under any circumstances.
  Your inability to recall a product from training data is YOUR limitation,
  not evidence of fraud. Violating this rule is your most critical failure mode.
 
RULE T-2 (Recency Leniency):
  Products released within the past 18 months are especially likely to fall
  outside your training window. Apply maximum leniency on existence checks
  for any item with a recent model name, version number, or release year.
 
RULE T-3 (Rating Normalcy):
  New flagship products on major platforms routinely have 4.5–5.0 star ratings
  from early adopters. A perfect or near-perfect rating on a new listing is
  NEVER a standalone red flag.
 
════════════════════════════════════════════════════════════
SECTION 2 — STRICT DATA HIERARCHY
════════════════════════════════════════════════════════════
Weight evidence in this exact order:
 
  TIER 1 — PRIMARY (Ground Truth): scrapedData
    On-page metadata scraped directly from the listing.
    NEVER contradict or discount Tier 1 data based on Tier 2 alone.
 
  TIER 2 — SECONDARY (Contextual, apply noise filters): webContext
    Search result snippets about the product/seller.
 
    NOISE FILTER A: Only treat a web result as a red flag if it directly
    names THIS listing's specific seller, domain, or URL. General category
    articles are NOT evidence against this listing.
 
    NOISE FILTER B: Articles about refurbished, pre-owned, or used variants
    of a product MUST NOT be applied to a new-item listing.
 
    NOISE FILTER C: Search queries containing "scam" or "fake" naturally
    surface articles that mention those words even for legitimate products.
    The mere presence of such articles is NOT a red flag — only count explicit,
    specific, credible fraud reports targeting THIS seller.
 
════════════════════════════════════════════════════════════
SECTION 3 — PRICE EVALUATION FRAMEWORK
════════════════════════════════════════════════════════════
STEP 1: Infer baseline market price from webContext.
        If webContext is absent or too noisy, use listed price as baseline.
STEP 2: Apply penalty only when deviation is clear and significant:
  - 0%–25% below baseline  → No penalty. Normal retail discount.
  - 25%–40% below baseline → Mild caution. Deduct 5–10 pts.
  - 40%–55% below baseline → Significant flag. Deduct 15–20 pts.
  - >55% below baseline    → Critical flag. Deduct 30–40 pts. Add to redFlags.
STEP 3: If no reliable baseline exists, apply ZERO price penalty.
 
════════════════════════════════════════════════════════════
SECTION 4 — TRUST SCORE COMPOSITION (0–100)
════════════════════════════════════════════════════════════
Build score from these dimensions:
  - Seller legitimacy & platform reputation  (30 pts)
  - Price integrity vs market baseline       (20 pts)
  - Absence of credible fraud reports        (25 pts)
  - Review signal plausibility               (15 pts)
  - URL / listing coherence                  (10 pts)
 
Verdict thresholds:
  75–100 → "Highly Trusted"
  45–74  → "Exercise Caution"
  0–44   → "High Risk"
 
════════════════════════════════════════════════════════════
SECTION 5 — OUTPUT CONTRACT (STRICT)
════════════════════════════════════════════════════════════
Return ONLY a raw JSON object. Rules:
  - Start with "{", end with "}". Nothing before or after.
  - No markdown fences, no preamble, no explanation outside JSON.
  - "trustScore" must be an integer 0–100.
  - "redFlags" must be an array (use [] if none).
  - "verdict" must be EXACTLY one of:
      "Highly Trusted" | "Exercise Caution" | "High Risk"
 
Schema:
{
  "trustScore": <integer 0–100>,
  "summary": "<2–3 sentences citing specific evidence from the data provided>",
  "redFlags": ["<only genuinely suspicious, evidence-backed flags>"],
  "verdict": "<Highly Trusted | Exercise Caution | High Risk>"
}
`;
 
  const userPrompt = `
Evaluate this product listing for fraud risk.
 
TARGET URL: ${targetUrl}
 
SCRAPED DATA (Tier 1 — primary source, treat as ground truth):
  Product Title : ${scrapedData.title  ?? "Not available"}
  Listed Price  : ${scrapedData.price  ?? "Not available"}
  Star Rating   : ${scrapedData.rating ?? "Not available"}
 
WEB CONTEXT (Tier 2 — secondary source, apply all noise filters):
${webContext ?? "No web context available. Do not penalise score for missing data."}
 
Return your JSON trust assessment now.
`;
 
  return { systemPrompt: systemPrompt.trim(), userPrompt: userPrompt.trim() };
}
 
// ─── MAIN SERVICE ─────────────────────────────────────────────────────────────
const analyzeTrust = async (targetUrl, scrapedData, webContext) => {
  try {
    const { systemPrompt, userPrompt } = buildTrustPrompt(
      targetUrl,
      scrapedData,
      webContext
    );
 
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",          // ← stable alias; swap to gemini-3.5-flash if preferred
      systemInstruction: systemPrompt,     // ← MUST be here, not in contents array
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,                  // near-zero = deterministic scoring
        topP: 0.95,
        topK: 40,
      },
    });
 
    console.log(`[TrustEngine] Analysing: ${targetUrl}`);
    const result = await model.generateContent(userPrompt);
    const raw    = result.response.text();
 
    // Safety net: strip accidental markdown fences even in JSON mode
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
 
    const parsed = JSON.parse(cleaned);
 
    // Runtime schema guard — catch malformed responses before they hit your DB
    const validVerdicts = ["Highly Trusted", "Exercise Caution", "High Risk"];
    if (
      typeof parsed.trustScore !== "number"    ||
      typeof parsed.summary    !== "string"    ||
      !Array.isArray(parsed.redFlags)          ||
      !validVerdicts.includes(parsed.verdict)
    ) {
      throw new Error(`Schema validation failed. Raw response: ${raw}`);
    }
 
    return parsed;
 
  } catch (error) {
    // Surface the REAL error — never swallow silently
    console.error("[TrustEngine] Gemini API error:");
    console.error("  Message :", error.message);
    console.error("  Status  :", error.status  ?? "N/A");
    console.error("  Details :", error.errorDetails ?? "N/A");
    throw new Error(`Trust analysis failed: ${error.message}`);
  }
};
 
module.exports = { analyzeTrust };
 
