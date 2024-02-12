import { useEffect, useState } from 'react';
import { setupBlockChain } from '../domain/utils/setupBlockChain';

const useSetupBlockChain = () => {
  const [momijiBlockChain, setMomijiBlockChain] = useState(null);
  const [symbolBlockChain, setSymbolBlockChain] = useState(null);

  useEffect(() => {
    const initializeBlockChains = async () => {
      const momiji = await setupBlockChain('momiji');
      const symbol = await setupBlockChain('symbol');
      setMomijiBlockChain(momiji);
      setSymbolBlockChain(symbol);
    };

    initializeBlockChains();
  }, []);

  return { momijiBlockChain, symbolBlockChain };
};

export default useSetupBlockChain;
