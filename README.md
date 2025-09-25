# AI Email Agent

A full-stack AI-powered customer support email system with intelligent ticket classification and automated response generation.

## 🏗️ Project Structure

This is a monorepo containing both frontend and backend applications:

```
Ai_Agent_Email/
├── apps/
│   ├── backend/     # Node.js/Express API server
│   └── frontend/    # Next.js React application
├── package.json     # Root workspace configuration
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Backend Setup

```bash
cd apps/backend

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and OpenAI API key

# Set up database
npm run db:generate
npm run db:migrate
npm run seed

# Start backend development server
npm run dev
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd apps/frontend

# Set up environment variables
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1" > .env.local

# Start frontend development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🛠️ Tech Stack

### Backend (`apps/backend/`)

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 for classification and responses
- **Vector Search**: pgvector for similarity search

### Frontend (`apps/frontend/`)

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI + Heroicons
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: SWR

## 📡 API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/tickets` - Get tickets with filters
- `POST /api/v1/tickets` - Submit new ticket
- `POST /api/v1/tickets/:id/classify` - Classify ticket
- `POST /api/v1/tickets/:id/draft` - Generate AI draft reply

## 🎯 Features

- **Intelligent Classification**: AI-powered ticket categorization
- **Auto-Response Generation**: AI-generated response drafts
- **Admin Dashboard**: Ticket management interface
- **Customer Portal**: Ticket submission form
- **Real-time Updates**: Live statistics and status tracking
- **Responsive Design**: Mobile and desktop support

## 📦 Available Scripts

### Root Level

```bash
npm install          # Install all dependencies
```

### Backend (`apps/backend/`)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run seed          # Seed database with sample data
npm run db:studio     # Open Prisma Studio
```

### Frontend (`apps/frontend/`)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🔧 Environment Variables

### Backend

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `PORT` - Server port (default: 8000)

### Frontend

- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL

## 📄 License

MIT License

## 👨‍💻 Author

Alex Lee
