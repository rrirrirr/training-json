# Training Plan Manager

A comprehensive web application for managing and tracking personalized training plans. Built with Next.js, React, Typescript, Tailwind CSS, and Shadcn UI.

![Training Plan Manager Screenshot](public/placeholder.jpg)

## Features

- **Monthly & Weekly Views**: Switch between full month overviews and detailed weekly schedules
- **Multiple Training Plans**: Create, edit, and manage multiple training plans
- **Detailed Exercise Tracking**: View complete exercise details including sets, reps, load, and comments
- **Session Management**: Group exercises into logical training sessions
- **Custom Styling**: Special visual indicators for deload weeks, test weeks, and different session types
- **Data Import/Export**: Import and export training plans as JSON
- **Mobile Responsive**: Fully responsive design that works on all devices
- **Local Storage**: Plans are saved in the browser's local storage

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rrirrirr/training-json.git
   cd training-plan-manager
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

### Plan JSON Structure

The application uses a structured JSON format to represent training plans. See the "Info" button in the app for detailed JSON structure information, or use the "Generate with AI" feature to create a new plan with AI assistance.

## Project Structure

```
training-plan-manager/
├── app/                  # Next.js app structure
├── components/           # React components
│   ├── ui/               # Shadcn UI components
│   └── ...               # Application-specific components
├── contexts/             # React context providers
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
