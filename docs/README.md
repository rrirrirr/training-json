# T-JSON Documentation

This directory contains documentation for the T-JSON application. Each file focuses on a specific aspect of the application.

## Available Documentation

### For Developers

- [**JSON Structure**](./json-structure.md) - Detailed explanation of the training plan JSON data format
- [**Plan Storage System**](./plan-storage-system.md) - How plan data is stored, cached, and retrieved
- [**Plan Mode Architecture**](./plan-mode-architecture.md) - Architecture of plan editing, viewing, and normal modes
- [**Local Development**](./local-development.md) - Setting up and using Supabase locally for development

### For Testers

- [**Test Setup**](./test-setup.md) - How to set up and run tests

## Key Concepts

- **Multi-layered Storage**: Plans are stored in Supabase (backend), localStorage (metadata only), and session memory (full plans during a session)
- **Normalized JSON Structure**: Clear separation of data with references between sections
- **Theme-aware Styling**: Dynamic color adaptations between light and dark mode
- **Plan Modes**: Different modes for viewing, editing, and normal operation
