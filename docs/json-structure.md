# Training Plan JSON Structure

This document provides an overview of the normalized JSON structure used for training plans in this application.

## Overview

The training plan JSON structure has been updated to a more normalized format with clear references between sections:

1. **Top-level sections:**
   - `metadata`: Contains plan-wide information
   - `sessionTypes`: Defines available session types
   - `blocks`: Defines training blocks
   - `exerciseDefinitions`: Defines exercises
   - `weeks`: Contains weekly training plans
   - `monthBlocks`: Defines month groupings

2. **References between sections:**
   - weeks reference blocks via `blockId`
   - sessions reference sessionTypes via `sessionTypeId`
   - exercises reference exerciseDefinitions via `exerciseId`

## Theme-Aware Styling with colorName

The application now supports theme-aware styling using a simplified `colorName` property. Instead of specifying individual colors for background, text, and borders, you can simply specify a base color name:

```json
"style": {
  "colorName": "blue"
}
```

### Available Color Names
You can use any of the following color names:
- **Grays:** slate, gray, zinc, neutral, stone
- **Colors:** red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

### How it Works
When you specify a `colorName`, the application automatically selects appropriate color shades for:
- Background colors (lighter in light mode, darker in dark mode)
- Text colors (darker in light mode, lighter in dark mode)
- Border colors (medium shades in both modes)

The system ensures proper contrast and readability in both light and dark themes.

## Detailed Structure

### Metadata

```json
"metadata": {
  "planName": "5x5 Strength Program",
  "creationDate": "2025-04-08T10:00:00Z",
  "description": "A 20-week strength training program based on 5x5 methodology",
  "author": "Training Plan App Team",
  "version": "1.0.0"
}
```

### Session Types

```json
"sessionTypes": [
  {
    "id": "gym",
    "name": "Gym",
    "defaultStyle": {
      "colorName": "blue"
    }
  },
  {
    "id": "barmark",
    "name": "Barmark",
    "defaultStyle": {
      "colorName": "green"
    }
  }
]
```

### Training Blocks

```json
"blocks": [
  {
    "id": "block-1",
    "name": "Foundation Phase",
    "focus": "Grund & Volym",
    "durationWeeks": 4,
    "description": "Månad 1 (Vecka 1-4): 3 Gympass/vecka - Block 1: Grund & Volym",
    "style": {
      "colorName": "violet"
    }
  }
]
```

### Exercise Definitions

```json
"exerciseDefinitions": [
  {
    "id": "sq",
    "name": "Knäböj (SQ)",
    "isMainLift": true,
    "targetMuscles": ["Quads", "Glutes", "Core"],
    "generalTips": "Håll ryggen rak, knäna i linje med tårna"
  }
]
```

### Weeks and Sessions

```json
"weeks": [
  {
    "weekNumber": 1,
    "weekType": "A",
    "blockId": "block-1",
    "gymDays": 3,
    "weekStyle": {
      "colorName": "violet"
    },
    "sessions": [
      {
        "sessionName": "Gympass 1",
        "sessionTypeId": "gym",
        "sessionStyle": {
          "colorName": "blue"
        },
        "exercises": [
          {
            "exerciseId": "sq",
            "sets": 3,
            "reps": "8",
            "load": "90 kg (~78%)",
            "comment": "Startvikt. Teknik!"
          }
        ]
      }
    ]
  }
]
```

## Style Handling

The new structure allows for consistent styling through multiple levels using `colorName`:

1. **Block-level styles**: Defined in `blocks[].style.colorName`
2. **Session-type styles**: Defined in `sessionTypes[].defaultStyle.colorName` 
3. **Session-specific styles**: Override defaults using `sessions[].sessionStyle.colorName`
4. **Week-specific styles**: Override block styles using `weeks[].weekStyle.colorName`

Special cases:
- Deload weeks automatically use a "yellow" color scheme
- Test weeks automatically use a "green" color scheme

## Month Blocks

```json
"monthBlocks": [
  { 
    "id": 1, 
    "name": "Månad 1 (Vecka 1-4)", 
    "weeks": [1, 2, 3, 4],
    "style": {
      "colorName": "violet"
    }
  }
]
```
