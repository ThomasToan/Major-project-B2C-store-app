"use client";

import {
  createContext, //create shared state
  useContext, //access shared state
  useEffect, // run code when theme changes
  useState, // store current theme
  type PropsWithChildren, // allow nested components
} from "react";

export type Theme = "light" | "dark"; //only 2 valid values

interface ThemeContextProps {
  theme: Theme; // current theme
  toggleTheme: () => void; // function to switch theme
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({
  children, //your whole app
  initialTheme, // starting theme
}: PropsWithChildren<{ initialTheme: Theme }>) {
  const [theme, setTheme] = useState<Theme>(initialTheme); // store current theme

  useEffect(() => { //run everytime theme changes
    document.documentElement.setAttribute("data-theme", theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`; // stores theme in brower cookie
  }, [theme]);

  return (
    <ThemeContext.Provider // makes theme available to all child components
      value={{
        theme, // current theme
        toggleTheme: () => //toggle function
          setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light",
          ),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
