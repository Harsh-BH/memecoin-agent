import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { generateMeme } from './ai';

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
}

const bot = new Telegraf(botToken);

bot.start((ctx) => ctx.reply('Welcome to MemeCoin Agent! Send any text to generate a meme caption.'));

bot.on('text', async (ctx) => {
  const userText = ctx.message.text;
  try {
    const memeCaption = await generateMeme(userText);
    ctx.reply(`Meme caption: ${memeCaption}`);
  } catch (error) {
    console.error('Error generating meme caption:', error);
    ctx.reply('Error generating meme caption.');
  }
});

bot.launch()
  .then(() => {
    console.log('Telegram bot is running.');
  })
  .catch((err) => {
    console.error('Failed to launch Telegram bot:', err);
  });
