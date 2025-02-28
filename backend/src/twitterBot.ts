// twitterBot.ts
import * as dotenv from 'dotenv';
dotenv.config();

import Twit from 'twit';
import { generateMemeImage } from './huggingFaceStableDiffusion';

const T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY!,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET!,
  access_token: process.env.TWITTER_ACCESS_TOKEN!,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  timeout_ms: 60 * 1000,
  strictSSL: true,
});

// Replace '@YourTwitterBotHandle' with your actual Twitter bot handle
const stream = T.stream('statuses/filter', { track: ['@YourTwitterBotHandle'] });

stream.on('tweet', async (tweet: any) => {
  console.log(`Received tweet from @${tweet.user.screen_name}: ${tweet.text}`);
  
  try {
    // Generate a meme image based on the tweet text
    const imageBuffer: Buffer = await generateMemeImage(tweet.text);
    // Convert the image buffer to a base64-encoded string for Twitter upload
    const mediaData = imageBuffer.toString('base64');

    // Upload the media to Twitter
    const mediaUploadResponse: any = await T.post('media/upload', { media_data: mediaData });
    const mediaIdStr: string = mediaUploadResponse.data.media_id_string;

    // Construct a reply to the tweet, mentioning the user
    const status = `@${tweet.user.screen_name} Here is your generated meme image!`;
    
    // Post a tweet with the uploaded image in reply to the original tweet
    await T.post('statuses/update', {
      status,
      in_reply_to_status_id: tweet.id_str,
      media_ids: [mediaIdStr],
    });

    console.log('Replied to tweet with generated image.');
  } catch (err) {
    console.error('Error generating meme image or replying:', err);
  }
});
