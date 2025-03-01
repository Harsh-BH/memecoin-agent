// huggingFaceStableDiffusion.js
import { HfInference } from "@huggingface/inference";
import * as dotenv from "dotenv";
dotenv.config();

const hfApiKey = process.env.HF_API_TOKEN;
if (!hfApiKey) {
  throw new Error("Missing HF_API_TOKEN environment variable");
}

const client = new HfInference(hfApiKey);

export async function generateMemeImage(prompt) {
  try {
    // Instead of client.textToImage(...), use client.request
    const response = await client.request({
      method: "POST",
      url: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large",
      headers: {
        Authorization: `Bearer ${hfApiKey}`,
        // Indicate you want binary data
        Accept: "application/octet-stream",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { num_inference_steps: 5 },
      }),
    });

    // If successful, `response.blob()` should give you the image
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
