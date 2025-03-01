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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMemeImage = void 0;
// huggingFaceStableDiffusion.ts
const node_fetch_1 = __importDefault(require("node-fetch")); // For Node <18. If on Node 18+, you can use global fetch
const dotenv = __importStar(require("dotenv"));
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
async function generateMemeImage(prompt) {
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
        const response = await (0, node_fetch_1.default)(url, {
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
    }
    catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
}
exports.generateMemeImage = generateMemeImage;
