# HandSpeak: Sign Language Learning Platform

HandSpeak is a comprehensive Learning Management System (LMS) designed for learning sign languages, featuring real-time hand gesture recognition using TensorFlow.js and computer vision technologies.

![HandSpeak](generated-icon.png)

## 🌟 Features

- **Multi-Language Support**: Learn American Sign Language (ASL), British Sign Language (BSL), and Indian Sign Language (ISL)
- **Real-time Hand Sign Recognition**: Practice and get immediate feedback using your webcam
- **Structured Learning Path**: Progressive courses from beginner to advanced levels
- **Interactive Lessons**: Videos, practice exercises, and assessments
- **Progress Tracking**: Monitor your learning journey
- **User Authentication**: Secure login and personalized learning experience

## 🚀 Technologies Used

### Frontend
- React (with TypeScript)
- TensorFlow.js & Handpose for gesture recognition
- Fingerpose for hand sign detection
- Tailwind CSS & ShadCN UI components
- React Query for data fetching
- Wouter for routing

### Backend
- Express.js
- Drizzle ORM with PostgreSQL
- Passport.js for authentication
- Zod for validation

## 📋 Project Structure

```
client/              # Frontend React application
├── src/
│   ├── components/  # UI components
│   │   ├── handsigns/  # Hand sign gesture definitions
│   │   ├── handimage/  # SVG images for hand signs
│   ├── hooks/       # Custom React hooks
│   ├── lib/         # Utility functions and services
│   ├── pages/       # Application pages
server/              # Backend Express application
├── migrations/      # Database migrations
├── seed/            # Seed data for courses and lessons
shared/              # Shared types and schemas
```

## 🎓 Learning Content

The platform offers courses in three sign languages, each covering:

1. **Alphabets**: Learn to sign individual letters
2. **Numbers**: Master numeric signs from 0-10+
3. **Greetings**: Common expressions and emotions
4. **Basic Phrases**: Everyday communication

Each lesson includes:
- Video demonstrations
- Key points and common mistakes to avoid
- Practice exercises with real-time feedback
- Supplementary resources

## 💡 Hand Sign Recognition System

The platform uses TensorFlow.js with the Handpose model to detect hand landmarks, and Fingerpose to interpret these landmarks as specific sign language gestures. This enables:

- Real-time detection through your webcam
- Visual feedback showing hand tracking
- Immediate recognition of correct/incorrect gestures
- Practice mode with confidence scoring

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/HandSpeak_Innovators_LMS.git
   cd HandSpeak_Innovators_LMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Usage

1. **Create an account** or log in
2. **Browse available courses** by sign language and category
3. **Enroll in courses** that match your learning goals
4. **Complete lessons** and practice exercises
5. **Track your progress** as you advance through courses

## � Creator

HandSpeak was built entirely from scratch by a single developer. This project demonstrates comprehensive full-stack development skills including:

- Frontend development with React and TypeScript
- Machine learning integration with TensorFlow.js
- Backend API development with Express
- Database design and implementation
- UI/UX design and implementation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Roadmap

- Mobile application for on-the-go learning
- Additional sign languages (JSL, CSL, etc.)
- Advanced vocabulary and phrase courses
- Community features for practice partners
- Gamification elements for enhanced engagement
- AI-powered personalized learning paths

---

Developed with ❤️ by <a href="https://github.com/Harsh-Jingar">Harsh Jingar</a>
