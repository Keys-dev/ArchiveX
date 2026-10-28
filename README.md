# ArchiveX 📦

ArchiveX is a premium physical file and asset management system. It helps you keep track of where your physical documents, folders, and boxes are stored.

## Features
- **Smart Tracking**: Easily add and categorize physical items.
- **Advanced Search**: Search by name, location, or notes.
- **Dynamic Filtering**: Filter by item type or category.
- **Premium UI**: Modern design with fluid animations and responsive layout.
- **User Accounts**: Secure authentication with JWT tokens.
- **Cloud Storage**: Data persisted in a PostgreSQL database.

## Architecture
- **Frontend**: React 19 + Vite 8 (this repository)
- **Backend**: Express + Drizzle ORM + Neon PostgreSQL (separate `server/` folder or separate repository)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: Modern CSS with glassmorphism and custom design tokens.

## Project Structure
```
ArchiveX/
├── src/                 # Frontend React application
│   ├── lib/api.ts       # API client for backend communication
│   ├── context/         # Auth context (JWT-based)
│   ├── components/      # React components
│   ├── pages/           # Page components
│   └── types/           # Shared TypeScript types
├── server/              # Backend API (Express + Drizzle)
│   ├── src/
│   │   ├── routes/      # API routes (auth, items)
│   │   ├── db/          # Database schema and connection
│   │   ├── middleware/  # Auth middleware
│   │   └── validators/  # Zod validation schemas
│   └── drizzle.config.ts
├── .env.development     # Frontend environment variables
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier available)

### Backend Setup (`server/`)
1. Create a Neon database at [neon.tech](https://neon.tech) and copy the connection string.
2. Copy `server/.env.example` to `server/.env` and fill in your `DATABASE_URL` and a random `JWT_SECRET`.
3. Install dependencies: `cd server && npm install`
4. Push the database schema: `npx drizzle-kit push`
5. Start the server: `npm run dev` (runs on port 3000)

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. The `.env.development` file is already configured to point to `http://localhost:3000/api`.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

### Environment Variables
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (default: `http://localhost:3000/api`) |
