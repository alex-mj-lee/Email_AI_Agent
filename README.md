# 🤖 AI Email Agent

AI-powered customer support system that automatically classifies tickets and generates intelligent responses.

## ✨ What it does

- **Smart Classification**: AI automatically categorizes customer emails (Refund, Payment, Account, etc.)
- **Auto-Response**: Generates professional customer service replies
- **Admin Dashboard**: Manage and track all support tickets
- **Customer Portal**: Easy ticket submission form

## 🚀 Quick Demo (2 minutes)

### 1. Clone & Setup
```bash
git clone https://github.com/alex-mj-lee/Email_AI_Agent.git
cd Email_AI_Agent
cp env.example .env
```

### 2. Add your OpenAI API key
```bash
# Edit .env file and add your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start with Docker
```bash
docker compose up --build
```

### 4. Open the app
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

That's it! 🎉

## 🎯 Try it out

1. **Submit a ticket** at http://localhost:3000/submit
2. **View tickets** at http://localhost:3000/dashboard
3. **Watch AI classify** and generate responses automatically

## 🛠️ Built with

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Next.js + React + Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI GPT-4 + pgvector
- **Deployment**: Docker

## 📡 API Endpoints

- `GET /api/v1/tickets` - Get all tickets
- `POST /api/v1/tickets` - Submit new ticket
- `POST /api/v1/tickets/:id/classify` - AI classification
- `POST /api/v1/tickets/:id/draft` - Generate AI response

## 🔧 Development

```bash
# Stop services
docker compose down

# View logs
docker compose logs -f

# Clean restart
docker compose down -v
docker compose up --build
```

## 📄 License

MIT License - Alex Lee
