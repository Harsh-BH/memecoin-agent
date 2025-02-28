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
// twitterBot.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const twit_1 = __importDefault(require("twit"));
const huggingFaceStableDiffusion_1 = require("./huggingFaceStableDiffusion");
const T = new twit_1.default({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000,
    strictSSL: true,
});
// Replace '@YourTwitterBotHandle' with your actual Twitter bot handle
const stream = T.stream('statuses/filter', { track: ['@YourTwitterBotHandle'] });
stream.on('tweet', async (tweet) => {
    console.log(`Received tweet from @${tweet.user.screen_name}: ${tweet.text}`);
    try {
        // Generate a meme image based on the tweet text
        const imageBuffer = await (0, huggingFaceStableDiffusion_1.generateMemeImage)(tweet.text);
        // Convert the image buffer to a base64-encoded string for Twitter upload
        const mediaData = imageBuffer.toString('base64');
        // Upload the media to Twitter
        const mediaUploadResponse = await T.post('media/upload', { media_data: mediaData });
        const mediaIdStr = mediaUploadResponse.data.media_id_string;
        // Construct a reply to the tweet, mentioning the user
        const status = `@${tweet.user.screen_name} Here is your generated meme image!`;
        // Post a tweet with the uploaded image in reply to the original tweet
        await T.post('statuses/update', {
            status,
            in_reply_to_status_id: tweet.id_str,
            media_ids: [mediaIdStr],
        });
        console.log('Replied to tweet with generated image.');
    }
    catch (err) {
        console.error('Error generating meme image or replying:', err);
    }
});
