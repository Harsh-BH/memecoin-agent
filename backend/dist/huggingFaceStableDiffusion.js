"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMemeImage = void 0;
// huggingFaceStableDiffusion.ts
const inference_1 = require("@huggingface/inference");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const hfApiKey = process.env.HF_API_TOKEN;
if (!hfApiKey) {
    throw new Error("Missing HF_API_TOKEN environment variable");
}
const client = new inference_1.HfInference(hfApiKey);
/**
 * Generates an image using Hugging Face's Stable Diffusion 3.5 model.
 * @param prompt - The prompt text for image generation.
 * @returns A Promise that resolves with a Buffer containing the generated image.
 */
async function generateMemeImage(prompt) {
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
    }
    catch (error) {
        console.error("Error generating image:", error.response?.data || error.message);
        throw error;
    }
}
exports.generateMemeImage = generateMemeImage;
