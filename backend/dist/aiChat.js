"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockchainAnswer = void 0;
const openai_1 = require("openai");
/**
 * getBlockchainAnswer:
 *  - Uses OpenAI to determine if the question is related to blockchain.
 *  - If relevant, it provides a detailed answer.
 *  - If not, it returns a message guiding the user to ask blockchain-related questions.
 */
async function getBlockchainAnswer(query) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        throw new Error("Missing OPENAI_API_KEY environment variable");
    }
    const openai = new openai_1.OpenAI({
        apiKey: OPENAI_API_KEY,
    });
    try {
        // First, ask OpenAI if the question is related to blockchain
        const relevanceCheck = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Determine if the following user query is related to blockchain. Reply with 'YES' or 'NO' only.",
                },
                {
                    role: "user",
                    content: query,
                },
            ],
            max_tokens: 5,
            temperature: 0,
        });
        const isBlockchainRelated = relevanceCheck.choices?.[0]?.message?.content?.trim() === "YES";
        if (!isBlockchainRelated) {
            return "I only answer about blockchain. Please ask a blockchain-related question.";
        }
        // If the query is related to blockchain, proceed with answering it
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a knowledgeable blockchain assistant. Provide a thorough, easy-to-understand answer to the user’s question.",
                },
                {
                    role: "user",
                    content: query,
                },
            ],
            max_tokens: 200,
            temperature: 0.7,
        });
        return response.choices?.[0]?.message?.content?.trim() || "⚠️ Sorry, I couldn’t generate a blockchain answer at this time.";
    }
    catch (error) {
        console.error("Error calling OpenAI GPT model:", error);
        return "⚠️ Sorry, I couldn’t generate a blockchain answer at this time.";
    }
}
exports.getBlockchainAnswer = getBlockchainAnswer;
