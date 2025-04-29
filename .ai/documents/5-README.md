# AI-Powered Language Learning Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description
The AI-Powered Language Learning Platform is an interactive educational tool designed to enhance language learning through AI-driven personalization. It generates customized intermediate-level texts on predefined topics such as Daily routines and Travel conversations. Based on the generated content, the platform automatically creates comprehension questions and provides immediate, actionable feedback on user responses. The seamless, user-friendly interface is built to make language learning engaging and effective.

## Tech Stack
**Frontend:**
- Astro 5
- React 19
- TypeScript 5
- Tailwind 4
- Shadcn/ui

**Backend:**
- Supabase (PostgreSQL and authentication)

**AI Integration:**
- Communication with models via Openrouter.ai for text generation and assessment

**CI/CD and Hosting:**
- GitHub Actions
- DigitalOcean (using Docker images)

## Getting Started Locally
To set up the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-powered-language-learning-platform.git
   cd ai-powered-language-learning-platform
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Use the Node version specified in `.nvmrc`:
   ```bash
   nvm use
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts
In the project directory, you can run:

- `npm run dev`  
  Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

- `npm run build`  
  Builds the app for production to the `dist` folder.

- `npm start`  
  Runs the built app in production mode.

## Project Scope
This MVP focuses on validating the core concept of an AI-powered language learning platform. The initial implementation includes:

- **Text Generation:** Automatically generate intermediate-level texts (100-200 words) on predefined topics (Daily routines and Travel conversations).
- **Question Generation:** Create 4 open-ended comprehension questions based on the generated text.
- **Answer System:** Provide a text input interface for learners to submit answers.
- **Assessment & Feedback:** Evaluate responses as correct or incorrect and offer basic feedback for improvement.

**Out of Scope:**
- User authentication and profiles
- Multi-language support beyond English
- Voice input/output functionality
- Advanced grammar correction and detailed analytics
- Mobile optimization and gamification features

## Project Status
The project is currently in the MVP stage. Core functionalities are implemented to validate the concept, with plans for further enhancements based on user feedback and testing.

## License
Distributed under the MIT License. See `LICENSE` for more information.
