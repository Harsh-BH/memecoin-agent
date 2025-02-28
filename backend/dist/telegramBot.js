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
// telegramBot.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const huggingFaceStableDiffusion_1 = require("./huggingFaceStableDiffusion");
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const prompt = msg.text || 'Generate a funny meme image';
    try {
        const imageBuffer = await (0, huggingFaceStableDiffusion_1.generateMemeImage)(prompt);
        // Send the generated image back to the user
        await bot.sendPhoto(chatId, imageBuffer, { caption: 'Here is your meme image!' });
    }
    catch (error) {
        console.error('Error in Telegram bot:', error);
        await bot.sendMessage(chatId, 'Sorry, an error occurred while generating your meme image.');
    }
});
