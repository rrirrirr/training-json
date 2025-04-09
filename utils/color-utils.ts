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
    bg: "900", // Darkest background that still maintains color identity
    text: "50", // Very light text
    border: "800" // Dark border that's still visible
  }
};

// Special cases for color shades that need adjustment
const SPECIAL_MAPPINGS: Record<ColorName, Partial<Record<"light" | "dark", Partial<Record<"bg" | "text" | "border", string>>>>> = {
  // Yellow needs lighter text in light mode for readability
  yellow: {
    light: {
      text: "800" // Use a slightly lighter shade for better contrast
    },
    dark: {
      text: "100", // Even lighter text for better contrast in dark mode
      bg: "800"    // Not as dark as the default 900 to maintain yellowy feeling
    }
  },
  // Orange also needs adjustments for readability
  orange: {
    light: {
      text: "800" // Lighter text for better contrast
    },
    dark: {
      bg: "800", // Less dark to maintain orange feeling
      border: "700" // Lighter border for contrast
    }
  },
  // Red needs adjustments for readability in dark mode
  red: {
    dark: {
      bg: "800", // Not too dark to maintain reddish feeling
      border: "700" // Lighter border
    }
  },
  // Blue adjustments for dark mode
  blue: {
    dark: {
      border: "700" // Lighter border for better visibility
    }
  },
  // Green adjustments
  green: {
    dark: {
      bg: "800", // Not too dark to maintain green feeling
      border: "700" // Lighter border
    }
  },
  // Cyan is often too light
  cyan: {
    light: {
      text: "800" // Darker text for better contrast
    },
    dark: {
      bg: "800" // Not too dark to maintain cyan feeling
    }
  },
  // Purple adjustments
  purple: {
    dark: {
      bg: "800", // Not too dark to maintain purple feeling
      border: "700" // Lighter border
    }
  },
  // Violet adjustments
  violet: {
    dark: {
      bg: "800", // Not too dark to maintain violet feeling 
      border: "700" // Lighter border
    }
  },
  // Indigo adjustments
  indigo: {
    dark: {
      bg: "800", // Not too dark to maintain indigo feeling
      border: "700" // Lighter border
    }
  },
  // No special cases for other colors - they'll use the defaults
  slate: {}, gray: {}, zinc: {}, neutral: {}, stone: {},
  amber: {}, lime: {}, emerald: {}, teal: {}, sky: {},
  fuchsia: {}, pink: {}, rose: {}
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