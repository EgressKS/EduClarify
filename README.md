# 📘 EduClarify AI – Intelligent Doubt Solving Platform

EduClarify AI is an interactive AI-powered learning platform that helps students understand concepts through intelligent explanations, visual aids, and AI avatar teaching.

## ✨ Core Features

- **Voice & Text Input** - Ask doubts naturally using voice or text
- **AI Avatar Explanations** - Interactive avatar teacher powered by HeyGen
- **AI-Powered Solutions** - Step-by-step explanations with Google Gemini Pro
- **Automatic Diagrams** - Relevant visual aids from Wikimedia Commons
- **Modern UI** - Fast, responsive interface built with Next.js + Tailwind CSS
- **Scalable Backend** - Robust API powered by Express.js

## 🏗️ Tech Stack

### Frontend (`client/`)
- **Next.js 13+** (App Router)
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **KaTeX** - Mathematical equation rendering
- **Web Speech API** - Voice input processing

### Backend (`server/`)
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework

### AI & External Services
- **Google Gemini Pro** - AI explanation generation
- **HeyGen Interactive Avatar API** - Avatar video generation
- **Wikimedia Commons API** - Diagram sourcing

## 📂 Project Structure

```
root
├── client/                    # Next.js frontend
│   ├── app/                   # Pages & layouts
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Helper functions & utilities
│   └── solver/                # Doubt solver workspace
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── routes/            # API routes
│   │   └── services/          # Business logic
│   └── index.js               # Entry point
│
└── README.md                  # Documentation
```

## 🚀 Setup Instructions

### 1️⃣ Install Dependencies

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2️⃣ Configure Environment Variables

Create `server/.env`:
```env
HEYGEN_API_KEY=your_heygen_api_key
NEXT_PUBLIC_BASE_API_URL=https://api.heygen.com
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### 3️⃣ Run the Project

**Start Backend:**
```bash
cd server
npm run dev
```

**Start Frontend (in another terminal):**
```bash
cd client
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🧠 How It Works

1. **Student Input** - User asks a question via voice or text input
2. **AI Processing** - Backend sends query to Google Gemini Pro API
3. **Response Generation** - Gemini returns structured response with:
   - Avatar dialog script
   - Step-by-step explanation
4. **Avatar Creation** - Script is sent to HeyGen for video generation
5. **Visual Aids** - App extracts keywords from explanation
6. **Diagram Search** - Searches Wikimedia Commons for relevant diagrams
7. **Complete Response** - Displays diagrams, explanations, and avatar video

## 🔌 API Endpoints

### Base URL: `http://localhost:5000`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ask` | POST | Process a question with Gemini AI |
| `/api/get-avatar-response` | POST | Generate avatar speech and video |
| `/api/commons-search` | GET | Search for diagrams on Wikimedia Commons |

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---
### Author
**Krishna Sumit**

If you like this project, don't forget to ⭐ the repository!
