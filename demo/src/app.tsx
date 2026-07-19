import { useEffect, useState } from "react";
import { Playground } from "./playground";
import { Showcase } from "./showcase";
import { COLOR_SCHEMES, type ColorScheme } from "./theme";

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
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  return useHashRoute() === "#playground" ? (
    <Playground theme={COLOR_SCHEMES[colorScheme]} />
  ) : (
    <Showcase
      colorScheme={colorScheme}
      onColorSchemeChange={setColorScheme}
    />
  );
}
