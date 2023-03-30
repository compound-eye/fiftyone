import { useCallback, useEffect, useState } from "react";

export default function useHashLocation(): {
  changeHash: (newHash: string) => void;
  hash: string;
} {
  const [hash, setHash] = useState<string>(window.location.hash);

  const changeHash = useCallback((newHash: string) => {
    window.location.hash = newHash;
  }, []);

  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", onChange, false);

    return () => window.removeEventListener("hashchange", onChange, false);
  }, []);

  return { hash, changeHash };
}
