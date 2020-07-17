import { useEffect, useState } from 'react';

const hasWindow = typeof window === 'object';

function getSize() {
  return {
    width: hasWindow ? window.innerWidth : undefined,
    height: hasWindow ? window.innerHeight : undefined,
  };
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState(getSize);
  useEffect(() => {
    if (!hasWindow) return;
    function handleResize() {
      setWindowSize(getSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
}
