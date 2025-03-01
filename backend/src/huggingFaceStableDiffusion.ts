// huggingFaceStableDiffusion.ts
import fetch from "node-fetch"; // For Node <18. If on Node 18+, you can use global fetch
import * as dotenv from "dotenv";
dotenv.config();

const hfApiKey = process.env.HF_API_TOKEN;
if (!hfApiKey) {
  throw new Error("Missing HF_API_TOKEN environment variable");
}

/**
 * Generates an image using Hugging Face's Stable Diffusion 3.5 model.
 * @param prompt - The prompt text for image generation.
 * @returns A Promise that resolves with a Buffer containing the generated image.
 */
export async function generateMemeImage(prompt: string): Promise<Buffer> {
  try {
    const url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large";
    const headers = {
      "Authorization": `Bearer ${hfApiKey}`,
      "Content-Type": "application/json",
    };

    // We'll pass our prompt in JSON format
    const body = JSON.stringify({
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
    });

    // Make a raw POST request with fetch
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      // If the request failed, parse the error text (likely JSON) to see the reason
      const errorMsg = await response.text();
      throw new Error(`Hugging Face error: ${errorMsg}`);
    }

    // If success, the response is binary image data. Convert to ArrayBuffer -> Buffer.
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
