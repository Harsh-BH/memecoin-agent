import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { initNear, getContractBalance } from './blockchain';
import './telegram';  // Importing to start the Telegram bot.
import { postTweet } from './twitter';

dotenv.config();

const app = express();
app.use(express.json());

// API endpoint to retrieve NEAR account balance using the deployed contract.
app.get('/api/balance', async (req: Request, res: Response) => {
  const account = req.query.account as string;
  if (!account) {
    return res.status(400).json({ error: 'Account query parameter is required.' });
  }
  
  try {
    const balance = await getContractBalance(account);
    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to post a tweet.
app.get('/api/tweet', async (req: Request, res: Response) => {
  const { status } = req.query;
  if (!status) {
    return res.status(400).json({ error: 'Status query parameter is required.' });
  }
  
  try {
    const result = await postTweet(status as string);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize NEAR on startup (for demonstration).
initNear()
  .then(() => {
    console.log('NEAR initialized');
  })
  .catch((err) => {
    console.error('Error initializing NEAR:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
