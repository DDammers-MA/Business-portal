# Source Directory Structure (`@/src`)

This document provides an overview of the source code organization in the Business Portal application.

## Directory Structure

```
src/
├── app/             # Next.js 13+ App Router directory
├── components/      # Reusable React components
├── context/        # React Context providers
├── scss/          # SCSS/Sass styling files
├── types/         # TypeScript type definitions
└── utils/         # Utility functions and helpers
```

## Key Directories Explained

### `app/`

The main application directory using Next.js 13+ App Router pattern. Contains:

- Page components (`page.tsx` files)
- API routes under `api/`
- Layout components
- Route groups and dynamic routes
- Middleware for authentication and routing protection

Key features:

- Authentication flows (`/login`, `/register`)
- Activity management (`/activities`, `/activity/edit/[id]`)
- Admin controls (`/settings`, `/companies`)
- Event handling (`/events`)

### `components/`

Reusable React components organized by feature:

- `Activiteiten/` - Activity-related components
- `AddNewButton/` - New item creation button
- `AdminBadge/` - Admin user indicators
- `AdminControls/` - Administrative control components
- `footer/` - Site footer component
- `modal/` - Modal dialog components
- `multiple-steps-form/` - Multi-step form components
- `password-field/` - Password input component
- `sidebar/` - Site navigation sidebar

### `context/`

React Context providers for global state management:

- Authentication context
- User session management
- Global application state

### `scss/`

Global styling and theme definitions:

- Global variables
- Mixins
- Utility classes
- Component-specific styles are co-located with their components

### `types/`

TypeScript type definitions:

- Interface definitions
- Type declarations
- Shared types across the application

### `utils/`

Utility functions and helpers:

- Authentication utilities
- Form validation
- API helpers
- Common functions

## Environment Configuration (.env)

The project requires several environment variables to function properly. Create a `.env.local` file in the root directory with the following variables:

### Firebase Configuration

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

### Firebase Admin SDK (Server-side)

```
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

### Environment Settings

```
NODE_ENV=development
```

**Note:** Never commit actual environment values to version control. The `NEXT_PUBLIC_` prefix makes variables available to the browser, while others remain server-side only.

## Prerequisites & Setup

To continue development on this project, you'll need:

### 1. Development Environment

- Node.js (v18+ recommended)
- npm or yarn package manager
- Git for version control
- Code editor (VS Code recommended with TypeScript support)

### 2. Firebase Setup

- Firebase project with Authentication enabled
- Firestore database configured
- Firebase Storage for file uploads
- Firebase Admin SDK service account key

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 4. Firebase Configuration Files

- `firestore.rules` - Database security rules
- `firestore.indexes.json` - Database indexes
- `storage.rules` - File storage security rules
- `firebase.json` - Firebase project configuration

### 5. Key Development Tools

- **TypeScript** - Type safety throughout the application
- **SCSS/Sass** - Advanced styling capabilities
- **ESLint** - Code quality and consistency
- **Next.js** - Full-stack React framework with API routes
- **Firebase** - Backend services (Auth, Database, Storage)

## Essential Files for New Developers

1. **`src/middleware.ts`** - Route protection and authentication
2. **`utils/firebase.admin.ts`** - Server-side Firebase configuration
3. **`utils/firebase.browser.ts`** - Client-side Firebase configuration
4. **`src/context/AuthContext.tsx`** - Authentication state management
5. **`src/app/layout.tsx`** - Main application layout
6. **`package.json`** - Dependencies and scripts

## Quick Start Checklist

- [ ] Clone repository
- [ ] Install Node.js and npm
- [ ] Run `npm install`
- [ ] Set up Firebase project
- [ ] Configure `.env.local` with Firebase credentials
- [ ] Run `npm run dev` to start development server
- [ ] Access application at `http://localhost:3000`
