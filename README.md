# T-JSON

A comprehensive web application for managing and tracking personalized training plans. Built with Next.js, React, Typescript, Tailwind CSS, and Shadcn UI.

![T-JSON Screenshot](public/placeholder.jpg)

## Features

- **Monthly & Weekly Views**: Switch between full month overviews and detailed weekly schedules
- **Multiple Training Plans**: Create, edit, and manage multiple training plans
- **Detailed Exercise Tracking**: View complete exercise details including sets, reps, load, and comments
- **Session Management**: Group exercises into logical training sessions
- **Custom Styling**: Special visual indicators for deload weeks, test weeks, and different session types
- **Data Import/Export**: Import and export training plans as JSON
- **Mobile Responsive**: Fully responsive design that works on all devices
- **Local Storage**: Plans are saved in the browser's local storage
- **Normalized JSON Structure**: Well-organized data structure with references between sections

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/t-json.git
   cd t-json
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Creating a New Plan

1. Click the "New Plan" button in the header
2. Enter a name for your plan
3. Start adding exercises or import existing data

### Loading Example Data

- Click the "Load Example" button to see a pre-configured training plan

### Importing a Custom Plan

1. Click the "Import Plan" button
2. Either paste JSON data or upload a JSON file
3. Review the imported plan and make any necessary adjustments

## Plan JSON Structure

The application uses a normalized JSON structure to represent training plans. This structure has clear references between sections:

### Top-level Sections:

- `metadata`: Contains plan-wide information like name and creation date
- `sessionTypes`: Defines available session types with consistent styling
- `blocks`: Defines training blocks with focus, duration, and styling
- `exerciseDefinitions`: Defines exercises with IDs and details
- `weeks`: Contains weekly training plans with references to blocks
- `monthBlocks`: Defines month groupings for navigation

### References Between Sections:

- Weeks reference blocks via `blockId`
- Sessions reference sessionTypes via `sessionTypeId`
- Exercises reference exerciseDefinitions via `exerciseId`

Example snippet:
```json
{
  "metadata": {
    "planName": "5x5 Strength Program",
    "creationDate": "2025-04-08T10:00:00Z"
  },
  "sessionTypes": [
    {
      "id": "gym",
      "name": "Gym",
      "defaultStyle": {
        "backgroundColor": "blue-50",
        "borderColor": "blue-200"
      }
    }
  ],
  "blocks": [
    {
      "id": "block-1",
      "name": "Foundation Phase",
      "focus": "Grund & Volym",
      "durationWeeks": 4
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "blockId": "block-1",
      "sessions": [
        {
          "sessionName": "Gympass 1",
          "sessionTypeId": "gym",
          "exercises": [...]
        }
      ]
    }
  ]
}
```

For detailed documentation on the JSON structure, see [docs/json-structure.md](docs/json-structure.md).

## Project Structure

```
t-json/
├── app/                  # Next.js app structure
├── components/           # React components
│   ├── ui/               # Shadcn UI components
│   └── ...               # Application-specific components
├── contexts/             # React context providers
├── docs/                 # Documentation
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and libraries
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## Local Development

This project uses:
- **Next.js**: For the React framework and routing
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **Shadcn UI**: For component library
- **Context API**: For state management

### Commands

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm start`: Start the production server after building

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)