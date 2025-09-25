# AI Email Agent Frontend

A Next.js 14 application for AI-powered email support ticket management with a clean, modern interface.

## Features

- **Admin Dashboard**: View, filter, and manage support tickets with AI-generated response drafts
- **Ticket Submission**: Customer-facing form for submitting support requests
- **Real-time Updates**: Live ticket statistics and status tracking
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Headless UI + Heroicons
- React Hook Form + Zod
- SWR for data fetching

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                # Utilities and types
├── hooks/              # Custom React hooks
└── package.json
```

## Environment Variables

Create a `.env.local` file for environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT License

# AI_Email_Agent_FE
