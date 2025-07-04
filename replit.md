# Push Swap Tools - Replit.md

## Overview

This is a full-stack web application for testing and visualizing push_swap algorithms. The application provides two main modes: a Tester mode for rigorous testing of push_swap executables, and a Visualizer mode for animated visualization of sorting operations. The application is built with a modern React frontend and Express.js backend, featuring a dark theme with teal/cyan accents.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js with TypeScript, handling file uploads and push_swap execution
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **UI Framework**: Shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **UI Components**: Comprehensive Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme and CSS variables
- **State Management**: TanStack Query for API state, React hooks for local state
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **File Upload**: Multer for handling push_swap and checker executable uploads
- **Process Execution**: Node.js child_process for running push_swap tests
- **Database Integration**: Drizzle ORM with PostgreSQL adapter
- **Development**: Vite integration for hot module replacement

### Database Schema
- **users**: User authentication and management
- **test_results**: Storage of test execution results and statistics
- **visualizations**: Storage of visualization data and operations

## Data Flow

### Testing Flow
1. User uploads push_swap and checker executables
2. Backend validates files and makes them executable
3. System generates random number sequences for testing
4. Push_swap executable is run with test data
5. Results are validated using checker executable
6. Statistics are calculated and stored in database
7. Results are returned to frontend for display

### Visualization Flow
1. User uploads push_swap executable and sets parameters
2. Backend generates random number sequence
3. Push_swap is executed to get operation sequence
4. Frontend receives initial stack state and operations
5. Animation engine executes operations step-by-step
6. Stack states are visualized in real-time

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router)
- UI Components (Radix UI primitives, Shadcn/ui)
- Styling (Tailwind CSS, class-variance-authority)
- State Management (TanStack Query)
- Form Handling (React Hook Form, Hookform Resolvers)
- Utilities (date-fns, clsx, lucide-react icons)

### Backend Dependencies
- Express.js for server framework
- Multer for file upload handling
- Drizzle ORM for database operations
- Neon Database serverless driver
- Development tools (tsx, esbuild, Vite)

### Development Dependencies
- TypeScript for type safety
- Vite for development server and building
- ESBuild for server bundling
- Drizzle Kit for database migrations

## Deployment Strategy

### Development
- Uses Vite development server with hot module replacement
- Express server runs with tsx for TypeScript execution
- Database schema managed with Drizzle migrations
- Replit-specific plugins for development environment

### Production
- Frontend built with Vite to static assets
- Backend bundled with ESBuild for Node.js execution
- Database operations use connection pooling
- Environment variables for database configuration

### Build Process
1. Frontend assets built to `dist/public`
2. Backend TypeScript compiled and bundled to `dist/index.js`
3. Database schema pushed using Drizzle migrations
4. Static assets served by Express in production

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 04, 2025. Initial setup