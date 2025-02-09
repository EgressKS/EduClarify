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
EduClarify/
├── client/                    # Next.js Frontend Application
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── components/        # React Components
│   │   ├── lib/               # Utility functions
│   │   ├── profile/           # Profile page
│   │   ├── settings/          # Settings page
│   │   └── solver/            # Doubt solver page
│   └── package.json
│
├── server/                    # Express Backend API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   └── services/          # Business logic
│   └── package.json
│
├── LICENSE
└── README.md
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

**Server (create `server/.env`):**
```env
# Environment
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=your_postgresql_connection_string

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# HeyGen Streaming Avatar API
HEYGEN_API_KEY=your_heygen_api_key

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback/google
```

**Client (create `client/.env.local`):**
```env
# Google OAuth 2.0
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Ready Player Me 3D Avatar
NEXT_PUBLIC_RPM_AVATAR_URL=your_ready_player_me_avatar_url
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
