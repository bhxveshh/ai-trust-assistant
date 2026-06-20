const axios = require("axios");

const SERP_API_KEY = process.env.SERPAPI_KEY;
const SERP_API_URL = "https://serpapi.com/search.json";

/**
 * Extracts clean domain, key phrases from title, and numerical price.
 */
function extractSearchComponents(targetUrl, scrapedData) {
  const url = new URL(targetUrl);
  const domain = url.hostname.replace(/^www\./, "");

  const rawTitle = scrapedData.title || "";
  const stopWords = new Set([
    "the","a","an","and","or","for","with","in","on","at","to","of",
    "free","shipping","new","best","buy","sale","deal","offer","limited",
    "official","original","genuine","authentic","brand",
  ]);
  
  const cleanTitle = rawTitle
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()))
    .slice(0, 6)
    .join(" ");

  const rawPrice = scrapedData.price || "";
  const numericPrice = rawPrice.replace(/[^0-9.]/g, "");

  return { domain, cleanTitle, numericPrice };
}

/**
 * Creates the 5 targeted query profiles.
 */
function buildQueryPlan({ domain, cleanTitle, numericPrice }) {
  const currentYear = new Date().getFullYear(); // Evaluates dynamically (e.g., 2026)

  return [
    {
      label: "PRODUCT_REPUTATION",
      description: "Independent reviews and user experiences for this specific product",
      query: `"${cleanTitle}" review ${currentYear}`,
    },
    {
      label: "SELLER_DOMAIN_TRUST",
      description: "Reputation and legitimacy of the seller's domain/website",
      query: `${domain} legit review site:reddit.com OR site:trustpilot.com OR site:scamadviser.com`,
    },
    {
      label: "FRAUD_SIGNALS",
      description: "Direct fraud, counterfeit, or scam reports for this product or seller",
      query: `"${cleanTitle}" scam OR fake OR counterfeit OR "not as described"`,
    },
    {
      label: "MARKET_PRICE_BENCHMARK",
      description: "Typical retail price range for this product from authoritative sources",
      query: `${cleanTitle} price ${numericPrice ? `around ${numericPrice}` : ""} ${currentYear}`,
    },
    {
      label: "SELLER_COMPLAINT_HISTORY",
      description: "Customer complaints, dispute records, or poor seller behaviour reports",
      query: `${domain} complaint OR "did not receive" OR "never arrived"`,
    },
  ];
}

/**
 * Runs all 5 queries concurrently via Promise.all to save latency.
 */
async function runQueriesInParallel(queryPlan) {
  const requests = queryPlan.map(({ label, query }) =>
    axios
      .get(SERP_API_URL, {
        params: {
          api_key: SERP_API_KEY,
          engine: "google",
          q: query,
          num: 5,
          safe: "active",
          hl: "en",
        },
        timeout: 8000,
      })
      .then((res) => ({
        label,
        query,
        results: res.data.organic_results || [],
      }))
      .catch((err) => ({
        label,
        query,
        results: [],
        error: err.message,
      }))
  );

  return Promise.all(requests);
}

/**
 * Formats data into sections separated with wrappers Gemini can read natively.
 */
function formatStructuredContext(queryResults, queryPlan) {
  return queryResults.map(({ label, results, error }) => {
    const planEntry = queryPlan.find((p) => p.label === label);
    const header = `[${label}]\n// Purpose: ${planEntry.description}`;

    if (error || results.length === 0) {
      return `${header}\nNo results found. Do not penalise trust score for absence of data in this signal lane.`;
    }

    const snippets = results
      .map((r, i) => {
        const title   = r.title   || "No title";
        const snippet = r.snippet || "No snippet";
        const source  = r.link    || "Unknown source";
        return `  Result ${i + 1}:\n    Title: ${title}\n    Snippet: ${snippet}\n    Source: ${source}`;
      })
      .join("\n\n");

    return `${header}\n${snippets}`;
  }).join("\n\n" + "─".repeat(60) + "\n\n");
}

/**
 * Main Export - Drop-in replacement for the controller
 */
async function buildWebContext(targetUrl, scrapedData) {
  const components = extractSearchComponents(targetUrl, scrapedData);
  const queryPlan  = buildQueryPlan(components);
  const rawResults = await runQueriesInParallel(queryPlan);
  return formatStructuredContext(rawResults, queryPlan);
}

module.exports = { buildWebContext };