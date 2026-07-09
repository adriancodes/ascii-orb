import { useEffect, useState } from "react";
import { Playground } from "./playground";
import { Showcase } from "./showcase";

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash;
}

export function App() {
  return useHashRoute() === "#playground" ? <Playground /> : <Showcase />;
}
