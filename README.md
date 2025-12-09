# Polyglot Code

**Polyglot Code** is an intelligent web application that converts code between 21 different programming languages using AI. Powered by Google's Gemini AI through Genkit, this tool automatically detects the source language and converts it to your target language while preserving the original logic and intent.

---

## Features

- **Multi-Language Support**: Convert code between 21 programming languages including JavaScript, Python, Java, C#, C++, Go, Ruby, Rust, Kotlin, Swift, PHP, TypeScript, Dart, Scala, Lua, Bash, SQL, R, MATLAB, and Julia
- **Automatic Language Detection**: AI automatically detects the source language of your code
- **Syntax Highlighting**: Beautiful code highlighting with light and dark theme support
- **Real-time Conversion**: Get instant conversion results powered by Google Gemini AI
- **Conversion History**: Track your recent conversions with Firebase Firestore integration (optional)
- **Responsive Design**: Modern, clean UI that works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Copy to Clipboard**: One-click copy functionality for converted code
- **Error Handling**: Comprehensive error handling with user-friendly toast notifications
- **Input Validation**: Smart validation to ensure code quality before conversion

---

## Technologies Used

### Frontend
- **Framework**: [Next.js 15.3.3](https://nextjs.org/) (App Router with Turbopack)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [React 18.3.1](https://react.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)

### AI & Backend
- **AI Framework**: [Google Genkit 1.20](https://firebase.google.com/docs/genkit)
- **AI Model**: Google Gemini AI (@genkit-ai/google-genai)
- **Database**: [Firebase Firestore](https://firebase.google.com/) (for conversion history)

### Additional Libraries
- **Code Highlighting**: [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) with Prism
- **Form Handling**: [React Hook Form 7.54](https://react-hook-form.com/)
- **Validation**: [Zod 3.24](https://zod.dev/)
- **Date Formatting**: [date-fns 3.6](https://date-fns.org/)
- **Utilities**: clsx, tailwind-merge, class-variance-authority

---

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Google Gemini API key (for AI-powered conversions)
- Firebase project (optional, for conversion history feature)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/macshashwat/polyglot.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd polyglot-code
    ```

3.  **Install the dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    
    Create a `.env.local` file in the root directory and add your API keys:
    ```bash
    GOOGLE_GENAI_API_KEY=your_gemini_api_key_here

    ```

### Usage

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Start Genkit development server (optional):**
    ```bash
    npm run genkit:dev
    ```

3.  **Open your browser:**
    
    Navigate to [http://localhost:9002](http://localhost:9002) to see the application in action.

4.  **Convert your code:**
    - Paste your code into the "Source Code" text area
    - Select your target language from the dropdown
    - Click the "Convert with Gemini" button
    - View the converted code with syntax highlighting
    - Copy the result or check your conversion history

### Available Scripts

- `npm run dev` - Start Next.js development server with Turbopack on port 9002
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit in watch mode

---

## Supported Languages

Polyglot Code supports conversion between the following 21 programming languages:

JavaScript, Python, Java, C#, C++, Go, Ruby, Rust, Kotlin, Swift, PHP, TypeScript, Dart, Scala, Lua, Bash, SQL, R, MATLAB, Julia

---

## Project Structure

```
├── src/
│   ├── ai/              # Genkit AI flows and configuration
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components (UI + code converter)
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions and language definitions
├── public/              # Static assets
└── package.json         # Project dependencies and scripts
```

---

## Contributing

Contributions are welcome! If you'd like to improve Polyglot Code:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---


## Acknowledgments

- Powered by Google Gemini AI through Genkit
- UI components from ShadCN UI and Radix UI
- Code highlighting by React Syntax Highlighter

---

**Made with ❤️ by Shashwat Mishra**
