// huggingFaceStableDiffusion.ts
import { HfInference } from "@huggingface/inference";
import * as dotenv from "dotenv";
dotenv.config();

const hfApiKey = process.env.HF_API_TOKEN;
if (!hfApiKey) {
  throw new Error("Missing HF_API_TOKEN environment variable");
}

const client = new HfInference(hfApiKey);

/**
 * Generates an image using Hugging Face's Stable Diffusion 3.5 model.
 * @param prompt - The prompt text for image generation.
 * @returns A Promise that resolves with a Buffer containing the generated image.
 */
export async function generateMemeImage(prompt: string): Promise<Buffer> {
  try {
    const imageBlob = await client.textToImage({
      model: "stabilityai/stable-diffusion-3.5-large",
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
      // Removed provider parameter as it may be unnecessary or unsupported
    });
    
    // Convert the Blob into an ArrayBuffer, then to a Buffer
    const arrayBuffer = await imageBlob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.error("Error generating image:", error.response?.data || error.message);
    throw error;
  }
}
