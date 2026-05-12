"use client";

import { Button } from "@repo/ui/button";

const ThemeSwitch = () => {
  const theme = "light"; // <- TODO: Get the theme from the context

  return (
    <Button>{theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}</Button>
  );
};

export default ThemeSwitch;
