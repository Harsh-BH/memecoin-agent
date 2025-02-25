import Twitter from 'twitter-lite';
import dotenv from 'dotenv';

dotenv.config();

const {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET
} = process.env;

if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET || !TWITTER_ACCESS_TOKEN_KEY || !TWITTER_ACCESS_TOKEN_SECRET) {
  throw new Error('Twitter API keys are not set in environment variables');
}

const client = new Twitter({
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token_key: TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
});

export async function postTweet(status: string): Promise<any> {
  try {
    const response = await client.post("statuses/update", { status });
    console.log('Tweet posted:', response);
    return response;
  } catch (error: any) {
    console.error('Error posting tweet:', error);
    throw error;
  }
}
