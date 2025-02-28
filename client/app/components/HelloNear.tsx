import { useEffect, useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';

const HelloNear: React.FC = () => {
  const { viewFunction } = useWalletSelector();
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const result = await viewFunction({
          contractId: 'hello-near-example.testnet',
          method: 'get_greeting',
        });
        setGreeting(result);
      } catch (error) {
        console.error('Error fetching greeting:', error);
      }
    };

    fetchGreeting();
  }, [viewFunction]);

  return <div>Current Greeting: {greeting}</div>;
};

export default HelloNear;
