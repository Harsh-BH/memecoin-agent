import { useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';

const SetGreeting: React.FC = () => {
  const { callFunction, viewFunction } = useWalletSelector();
  const [newGreeting, setNewGreeting] = useState<string>('');
  const [currentGreeting, setCurrentGreeting] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const updateGreeting = async () => {
    setLoading(true);
    try {
      await callFunction({
        contractId: 'hello-near-example.testnet',
        method: 'set_greeting',
        args: { greeting: newGreeting },
        gas: '30000000000000', // Specify GAS as needed (example: 30 TGas)
        deposit: '0', // No deposit needed for non-payable methods
      });

      // Refresh the greeting after updating
      const updatedGreeting = await viewFunction({
        contractId: 'hello-near-example.testnet',
        method: 'get_greeting',
      });
      setCurrentGreeting(updatedGreeting);
    } catch (err) {
      console.error('Error updating greeting:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={newGreeting}
        onChange={(e) => setNewGreeting(e.target.value)}
        placeholder="Enter new greeting"
      />
      <button onClick={updateGreeting} disabled={loading}>
        {loading ? 'Updating...' : 'Update Greeting'}
      </button>
      <div>Current Greeting: {currentGreeting}</div>
    </div>
  );
};

export default SetGreeting;
