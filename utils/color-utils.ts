/**
 * Color utility functions for theme-aware styling
 */

import { type Theme } from "next-themes";

// Type for valid color names
export type ColorName = 
  | "slate" | "gray" | "zinc" | "neutral" | "stone" 
  | "red" | "orange" | "amber" | "yellow" | "lime" 
  | "green" | "emerald" | "teal" | "cyan" | "sky" 
  | "blue" | "indigo" | "violet" | "purple" | "fuchsia" 
  | "pink" | "rose";

// Type for the returned style classes
export interface StyleClasses {
  bg: string;
  text: string;
  border: string;
}

// Color intensity mapping for light/dark modes
const COLOR_MAPPING = {
  light: {
    bg: "50", // Very light background
    text: "900", // Very dark text
    border: "200" // Light border
  },
  dark: {
    bg: "900", // Very dark background
    text: "50", // Very light text
    border: "800" // Dark border
  }
};

// Special cases for color shades that need adjustment
const SPECIAL_MAPPINGS: Record<ColorName, Partial<Record<"light" | "dark", Partial<Record<"bg" | "text" | "border", string>>>>> = {
  // For example, if yellow-900 is too dark for readable text in light mode:
  yellow: {
    light: {
      text: "800" // Use a slightly lighter shade for better contrast
    }
  },
  // No special cases for other colors yet
  slate: {}, gray: {}, zinc: {}, neutral: {}, stone: {},
  red: {}, orange: {}, amber: {}, lime: {},
  green: {}, emerald: {}, teal: {}, cyan: {}, sky: {},
  blue: {}, indigo: {}, violet: {}, purple: {}, fuchsia: {},
  pink: {}, rose: {}
};

/**
 * Returns theme-aware Tailwind classes for a given color name
 * 
 * @param colorName The base color name (e.g., "blue", "red")
 * @param theme The current theme (from useTheme().theme)
 * @returns Object with bg, text, and border class strings
 */
export function getThemeAwareColorClasses(
  colorName?: ColorName | string, 
  theme?: string
): StyleClasses {
  // Determine if we're in dark mode
  const isDark = theme === "dark";
  const modeKey = isDark ? "dark" : "light";
  
  // Default values if no color is specified or color is invalid
  if (!colorName || !isValidColorName(colorName)) {
    return {
      bg: "bg-card",
      text: "text-card-foreground",
      border: "border-border"
    };
  }
  
  // Get the base mappings for the current mode
  const baseMapping = COLOR_MAPPING[modeKey];
  
  // Check for special mappings for this color
  const specialMapping = (SPECIAL_MAPPINGS[colorName as ColorName]?.[modeKey]) || {};
  
  // Combine base and special mappings
  const bgShade = specialMapping.bg || baseMapping.bg;
  const textShade = specialMapping.text || baseMapping.text;
  const borderShade = specialMapping.border || baseMapping.border;
  
  // Construct the class names
  return {
    bg: `bg-${colorName}-${bgShade}`,
    text: `text-${colorName}-${textShade}`,
    border: `border-${colorName}-${borderShade}`
  };
}

/**
 * Checks if a color name is valid
 */
function isValidColorName(colorName: string): colorName is ColorName {
  const validColors: ColorName[] = [
    "slate", "gray", "zinc", "neutral", "stone",
    "red", "orange", "amber", "yellow", "lime",
    "green", "emerald", "teal", "cyan", "sky",
    "blue", "indigo", "violet", "purple", "fuchsia",
    "pink", "rose"
  ];
  
  return validColors.includes(colorName as ColorName);
}
