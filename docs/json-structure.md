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
      "backgroundColor": "blue-50",
      "borderColor": "blue-200",
      "textColor": "blue-800"
    }
  },
  {
    "id": "barmark",
    "name": "Barmark",
    "defaultStyle": {
      "backgroundColor": "green-50",
      "borderColor": "green-200",
      "textColor": "green-800"
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
      "backgroundColor": "violet-50",
      "borderColor": "violet-200",
      "textColor": "violet-900"
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
    "blockId": "block-1", // Reference to block
    "gymDays": 3,
    "sessions": [
      {
        "sessionName": "Gympass 1",
        "sessionTypeId": "gym", // Reference to session type
        "exercises": [
          {
            "exerciseId": "sq", // Reference to exercise definition
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

The new structure allows for consistent styling through multiple levels:

1. **Block-level styles**: Defined in `blocks[].style`
2. **Session-type styles**: Defined in `sessionTypes[].defaultStyle`
3. **Session-specific styles**: Override defaults using `sessions[].sessionStyle`
4. **Week-specific styles**: Override block styles using `weeks[].weekStyle`

Styles can be specified using Tailwind class names (like `blue-50`) or direct color values (`#e6f0ff`, `rgb(230, 240, 255)`).

## Backward Compatibility

For backward compatibility, the system maintains:

- Legacy `blockInfo` field alongside new `blockId` references
- Legacy `sessionType` field alongside new `sessionTypeId` references
- Legacy `monthBlocks` section for timeline organization

The UI components check for both new and old fields to support plans in either format.
