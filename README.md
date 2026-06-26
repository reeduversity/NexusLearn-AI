# 🎓 NexusLearn AI

![NexusLearn AI Banner](https://via.placeholder.com/1200x300?text=NexusLearn+AI+-+Next+Gen+Education)

**NexusLearn AI** is a comprehensive, AI-powered educational ecosystem designed to revolutionize how students learn, manage time, and prepare for their careers. By integrating cutting-edge artificial intelligence, this platform offers personalized tutoring, intelligent study planning, and professional career coaching all in one place.

---

## ✨ Core Features

🚀 **Intelligent Study Management**
- **Digital Study Planner**: AI-driven schedule and time management that syncs across devices.
- **Course Material Aggregator**: Centralized repository for all course documents and links.
- **Personalised Productivity Coach**: Analyzes study patterns to recommend optimal learning sessions.

🧠 **AI-Powered Learning**
- **AI Concept Tutor & Explainer**: Context-aware generative AI tutor for step-by-step explanations.
- **AI Exam & Practice Test Generator**: Custom mock tests (MCQs, short answers) generated from PDFs and OCR.
- **Visual Study Canvas**: AI organizes notes and mind maps into a visual board.
- **AI Note & Lecture Summarizer**: Transforms recordings and slide decks into structured summaries and flashcards.

💼 **Career & Research**
- **Career Portfolio & Interview Coach**: Resume optimization and simulated AI mock interviews.
- **Research Synthesizer**: Connects to academic databases, summarizes findings, and auto-generates citations (APA, MLA).
- **AI Student Budget Coach**: Financial literacy support and expense tracking for students.
- **AI Academic Integrity Coach**: Provides feedback on grammar, clarity, and ensures proper referencing.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database/Auth**: [Supabase](https://supabase.com/)
- **AI Integrations**: Groq / Specialized NLP services

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- npm or yarn or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/reeduversity/NexusLearn-AI.git
   cd NexusLearn-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` or `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   *Fill in your specific API keys and Supabase credentials in the `.env.local` file.*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

---

## 📂 Project Structure

- `/app` - Next.js App Router pages and API routes.
- `/components` - Reusable UI components.
- `/services` - Business logic and AI integration services.
- `/supabase` - Database migrations and configurations.
- `/types` - TypeScript type definitions.

---

## 🤝 Contributing

Contributions are always welcome! Please feel free to submit a Pull Request if you'd like to improve the project.

## 📄 License

This project is licensed under the MIT License.
