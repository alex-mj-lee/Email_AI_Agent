# AI Email Agent Backend

A Node.js backend API for an AI-powered customer support email system built with Express, TypeScript, PostgreSQL, and OpenAI.

## 🚀 Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your database URL and OpenAI API key
   ```

3. **Set up database**

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `PORT` - Server port (default: 8000)

## 📡 API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/tickets` - Get tickets with filters
- `POST /api/v1/tickets` - Submit new ticket
- `POST /api/v1/tickets/:id/classify` - Classify ticket
- `POST /api/v1/tickets/:id/draft` - Generate AI draft reply

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 for classification and responses
- **Vector Search**: pgvector for similarity search

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

# AI_Email_Agent_BE
