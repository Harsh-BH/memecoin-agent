"use client"
import { useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchBalance = async () => {
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/api/balance', {
        params: { account }
      });
      setBalance(response.data.balance);
    } catch (err: unknown) {
      setError('Error fetching balance');
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-6 max-w-md mx-auto min-h-screen">
      <div className="mb-4">
        <label htmlFor="account" className="block text-sm font-medium text-gray-700">
          NEAR Account
        </label>
        <input
          type="text"
          id="account"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="your-account.testnet"
        />~
      </div>
      <button
        onClick={fetchBalance}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
      >
        Fetch Balance
      </button>
      {balance !== null && (
        <div className="mt-4">
          <p className="text-lg font-medium">
            Balance: <span className="font-bold">{balance}</span>
          </p>
        </div>
      )}
      {error && (
        <div className="mt-4">
          <p className="text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
