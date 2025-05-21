/**
 * Color utility functions for theme-aware styling
 */

import { type Theme } from "next-themes"

// Type for valid color names
export type ColorName =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"

// Type for the returned style classes
export interface StyleClasses {
  bg: string
  text: string
  border: string
  grid: string // grid element bg
}

// Color intensity mapping for light/dark modes
const COLOR_MAPPING = {
  light: {
    bg: "50", // Very light background
    text: "900", // Very dark text
    border: "200", // Light border
  },
  dark: {
    bg: "900", // Darkest background that still maintains color identity
    text: "50", // Very light text
    border: "800", // Dark border that's still visible
  },
}

// Special cases for color shades that need adjustment
const SPECIAL_MAPPINGS: Record<
  ColorName,
  Partial<Record<"light" | "dark", Partial<Record<"bg" | "text" | "border", string>>>>
> = {
  slate: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  gray: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  zinc: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  neutral: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  stone: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  red: {
    light: {
      // Existing light mode settings preserved
    },
    dark: {
      // bg was "800", border was "700"
      bg: "950",
      border: "700",
    },
  },
  orange: {
    light: {
      text: "800", // Existing light mode settings preserved
    },
    dark: {
      // bg was "800", border was "700"
      bg: "950",
      border: "700",
    },
  },
  amber: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  yellow: {
    light: {
      text: "800", // Existing light mode settings preserved
    },
    dark: {
      text: "100", // Existing dark mode text preserved
      // bg was "800"
      bg: "950",
      border: "700", // New border setting
    },
  },
  lime: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  green: {
    light: {
      // Existing light mode settings preserved (if any)
    },
    dark: {
      // bg was "950", border was "700" - remains the same
      bg: "950",
      border: "700",
    },
  },
  emerald: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  teal: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  cyan: {
    light: {
      text: "800", // Existing light mode settings preserved
    },
    dark: {
      // bg was "800"
      bg: "950",
      border: "700", // New border setting
    },
  },
  sky: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  blue: {
    light: {
      // Existing light mode settings preserved (if any)
    },
    dark: {
      // bg was "950", border was "700" - remains the same
      bg: "950",
      border: "700",
    },
  },
  indigo: {
    light: {
      // Existing light mode settings preserved (if any)
    },
    dark: {
      // bg was "800", border was "700"
      bg: "950",
      border: "700",
    },
  },
  violet: {
    light: {
      // Existing light mode settings preserved (if any)
    },
    dark: {
      // bg was "950", border was "700" - remains the same
      bg: "950",
      border: "700",
    },
  },
  purple: {
    light: {
      // Existing light mode settings preserved (if any)
    },
    dark: {
      // bg was "800", border was "700"
      bg: "950",
      border: "700",
    },
  },
  fuchsia: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  pink: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
  rose: {
    dark: {
      bg: "950",
      border: "700",
    },
  },
}

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
  const isDark = theme === "dark"
  const modeKey = isDark ? "dark" : "light"

  // Default values if no color is specified or color is invalid
  if (!colorName || !isValidColorName(colorName)) {
    return {
      bg: "bg-card",
      text: "text-card-foreground",
      border: "border-border",
      grid: "bg-card",
    }
  }

  // Get the base mappings for the current mode
  const baseMapping = COLOR_MAPPING[modeKey]

  // Check for special mappings for this color
  const specialMapping = SPECIAL_MAPPINGS[colorName as ColorName]?.[modeKey] || {}

  // Combine base and special mappings
  const bgShade = specialMapping.bg || baseMapping.bg
  const textShade = specialMapping.text || baseMapping.text
  const borderShade = specialMapping.border || baseMapping.border

  // Construct the class names
  return {
    bg: `bg-${colorName}-${bgShade}`,
    text: `text-${colorName}-${textShade}`,
    border: `border-${colorName}-${borderShade}`,
    grid: `bg-${colorName}-${borderShade}`,
  }
}

/**
 * Checks if a color name is valid
 */
function isValidColorName(colorName: string): colorName is ColorName {
  const validColors: ColorName[] = [
    "slate",
    "gray",
    "zinc",
    "neutral",
    "stone",
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
  ]

  return validColors.includes(colorName as ColorName)
}
