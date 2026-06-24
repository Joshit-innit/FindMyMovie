const axios = require("axios");

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const advisorInstructions = [
    "You are AIDA, a movie search assistant for a streaming finder app.",
    "Return JSON only. No markdown.",
    "Understand spelling mistakes, partial names, transliteration, and Indian movie title variants.",
    "Examples: bahubali -> Baahubali, bahubali 2 -> Baahubali 2, intersteller -> Interstellar, avtar -> Avatar.",
    "Do not invent movie results. Only produce search queries and a short friendly reply.",
    "Schema: {\"searchQueries\": string[], \"platform\": string, \"language\": string, \"region\": string, \"reply\": string}"
].join("\n");

const fallbackIntent = (message) => {
    const text = String(message || "").toLowerCase();
    const platform =
        text.includes("netflix") ? "netflix" :
        text.includes("disney") ? "disney" :
        text.includes("prime") ? "prime" :
        text.includes("apple") ? "apple" :
        text.includes("hbo") || text.includes("max") ? "hbo" :
        "";

    return {
        searchQueries: [String(message || "").trim()].filter(Boolean),
        platform,
        language: "",
        region: "US",
        reply: "I searched the movie catalog for your request."
    };
};

const extractText = (responseData) => {
    if (responseData.output_text) {
        return responseData.output_text;
    }

    return (responseData.output || [])
        .flatMap((item) => item.content || [])
        .map((content) => content.text || "")
        .join("")
        .trim();
};

const extractGeminiText = (responseData) =>
    (responseData.candidates || [])
        .flatMap((candidate) => candidate.content?.parts || [])
        .map((part) => part.text || "")
        .join("")
        .trim();

const parseJson = (value) => {
    const text = String(value || "").trim();
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
        return null;
    }

    try {
        return JSON.parse(match[0]);
    } catch {
        return null;
    }
};

const normalizeIntent = (intent, fallbackMessage) => {
    const fallback = fallbackIntent(fallbackMessage);
    const searchQueries = Array.isArray(intent?.searchQueries)
        ? intent.searchQueries
        : [];

    return {
        searchQueries: [...new Set([...searchQueries, ...fallback.searchQueries])]
            .map((query) => String(query || "").trim())
            .filter(Boolean)
            .slice(0, 6),
        platform: String(intent?.platform || fallback.platform || "").trim(),
        language: String(intent?.language || "").trim(),
        region: String(intent?.region || "US").trim(),
        reply: String(intent?.reply || fallback.reply).trim()
    };
};

const getAdvisorIntent = async (message) => {
    if (process.env.GEMINI_API_KEY) {
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `${advisorInstructions}\n\nUser message: ${String(message || "")}`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: "application/json"
                    }
                },
                {
                    timeout: 12000,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const parsed = parseJson(extractGeminiText(response.data));
            return normalizeIntent(parsed, message);
        } catch (error) {
            console.warn("Gemini advisor skipped:", error.response?.data?.error?.message || error.message);
        }
    }

    if (!process.env.OPENAI_API_KEY) {
        return fallbackIntent(message);
    }

    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: DEFAULT_MODEL,
                instructions: advisorInstructions,
                input: String(message || "")
            },
            {
                timeout: 12000,
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const parsed = parseJson(extractText(response.data));
        return normalizeIntent(parsed, message);
    } catch (error) {
        console.warn("OpenAI advisor skipped:", error.response?.data?.error?.message || error.message);
        return fallbackIntent(message);
    }
};

const getSearchCorrections = async (query) => {
    const intent = await getAdvisorIntent(`Correct this movie search query and give likely movie title variants: ${query}`);
    return intent.searchQueries;
};

module.exports = {
    getAdvisorIntent,
    getSearchCorrections
};
