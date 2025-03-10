import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import Image from 'next/image';
import NearLogo from '../public/near-logo.svg'; // Ensure you have a logo image in your public folder

const Navigation: React.FC = () => {
  const [action, setAction] = useState<() => void>(() => {});
  const [label, setLabel] = useState<string>('Loading...');
  const { signedAccountId, signIn, signOut } = useWalletSelector();

  useEffect(() => {
    if (signedAccountId) {
      setAction(() => signOut);
      setLabel(`Logout ${signedAccountId}`);
    } else {
      setAction(() => signIn);
      setLabel('Login');
    }
  }, [signedAccountId, signIn, signOut]);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link href="/" passHref legacyBehavior>
          <a>
            <Image
              priority
              src={NearLogo}
              alt="NEAR Logo"
              width={30}
              height={24}
              className="d-inline-block align-text-top"
            />
          </a>
        </Link>
        <div className="navbar-nav pt-1">
          <button className="btn btn-secondary" onClick={action}>
            {label}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
