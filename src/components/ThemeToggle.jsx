"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Navbar theme toggle — sun/moon crossfade, no rotation, same position.
 *
 * Rewritten to NOT depend on daisyUI's `swap`/`swap-off`/`swap-on` classes.
 * Those only work if daisyUI's plugin is actually registered (on Tailwind
 * v4 that means `@plugin "daisyui";` in your global CSS, not the old
 * tailwind.config.js `plugins: [...]` syntax) — if that registration is
 * ever missing, `swap` silently does nothing and both icons show stacked
 * on top of each other with no fade at all. Using plain Tailwind utilities
 * here instead means the crossfade always works, regardless of daisyUI.
 */
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors duration-200"
    >
      {/* Sun icon — visible in light mode, fades out (no rotation) when dark */}
      <svg
        className={`absolute h-6 w-6 fill-current text-amber-500 transition-opacity duration-200 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
      </svg>

      {/* Moon icon — visible in dark mode, fades out (no rotation) when light */}
      <svg
        className={`absolute h-6 w-6 fill-current text-blue-400 transition-opacity duration-200 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
      </svg>
    </button>
  );
};

export default ThemeToggle;