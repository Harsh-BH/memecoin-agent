import { OpenAI } from "openai";

/**
 * getBlockchainAnswer:
 *  - Checks if user query is related to blockchain.
 *  - If not, returns a short message: "Please ask something about blockchain."
 *  - If yes, calls OpenAI's GPT model to provide a detailed answer.
 */
export async function getBlockchainAnswer(query: string): Promise<string> {
  // 1. Check if user question is blockchain-related
  const isBlockchainRelated = /blockchain|crypto|smart contract|defi|nft|token|consensus|distributed ledger/i.test(query);
  if (!isBlockchainRelated) {
    return "I only answer about blockchain. Please ask a blockchain-related question.";
  }

  // 2. Create an OpenAI client with your API key
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  // In OpenAI v4, you instantiate the OpenAI class directly
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  try {
    // 3. Create a Chat Completion using v4 syntax
    //    e.g. gpt-3.5-turbo or gpt-4
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

    // 4. Extract the text from the completion
    const completion = response.choices[0]?.message?.content || "";
    return completion.trim();
  } catch (error) {
    console.error("Error calling OpenAI GPT model:", error);
    return "⚠️ Sorry, I couldn’t generate a blockchain answer at this time.";
  }
}
