# VoiceGenius — AI Voice Agent (React + Vite + Tailwind)

Voice agent demo app: text and voice input, streaming responses from LLM via the io.net API, model selection, conversation history. Built with React 18 + TypeScript, Vite 5, and Tailwind CSS.

## Features

- Voice input via the Web Speech API (`react-speech-recognition`) and text input
- Streaming response generation (SSE) with gradual output
- Conversation history with timestamps, clear history button
- Model selection from a list (e.g. `meta-llama/Llama-3.3-70B-Instruct`)
- Status indicators: listening, processing, error

## Technologies

- React 18, TypeScript
- Vite 5, Tailwind CSS
- Zustand (storage), `lucide-react` (icons)
- `react-speech-recognition` for speech recognition
- ESLint + TypeScript ESLint

## Requirements

- Node.js ≥ 18
- Modern browser with Web Speech API support (Chrome recommended)
- io.net API key: environment variable `VITE_IO_NET_API_KEY`

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and add the key:

```bash
VITE_IO_NET_API_KEY=YOUR_IO_NET_API_KEY
```

3. Run in development mode:

```bash
npm run dev
```

Open `http://localhost:5173`. 4. Build and preview locally:

```bash
npm run build
npm run preview
```

5. Lint:

```bash
npm run lint
```

## Environment and API

- The main io.net integration is the `src/services/ioNet.ts` file. - The endpoint used is:
- `https://api.intelligence.io.solutions/api/v1/chats/{id}/messages` — if `id` is specified
- `https://api.intelligence.io.solutions/api/v1/chat/completions` — if `id = null`
- Authorization: `Authorization: Bearer ${VITE_IO_NET_API_KEY}` header.
- The response is in `text/event-stream` (SSE) format. The stream is processed line by line, lines beginning with `data:` are parsed, and then the response text is assembled.
- Error handling:
- `401` — "Authentication error. Please check your API key configuration."
- `429` — "Rate limit exceeded. Please try again in a moment."
- Network/offline errors — friendly messages for the user.

## Workflow (UX)

- At the top is the `Header` with the name VoiceGenius and the badge "Powered by io.net + AssemblyAI".
- The main part is `ConversationHistory`: a list of messages, clearing history (trash icon).
- At the bottom is the input field and model selector:
- Click the microphone icon to start/stop recording.
- Enter text and send (the "Send" icon).
- Select a model in `ChooseModel`.
- States are indicated by the messages "AI is typing..." and recognition errors.

## Project Structure

```
. ├── index.html
├── models.json # Reference list of available models (optional)
├── res.json # Sample response (demo/debug)
├── public/
│ └── logo.png
├── src/
│ ├── App.tsx # Application skeleton
│ ├── components/
│ │ ├── ChooseModel.tsx # Model selector
│ │ ├── ConversationHistory.tsx
│ │ ├── Footer.tsx
│ │ ├── Header.tsx
│ │ └── VoiceRecorder.tsx # Input field + voice actions
│ ├── contexts/
│ │ └── VoiceContext.tsx # Speech and message state
│ ├── services/
│ │ ├── ioNet.ts # io.net API calls + stream processing
│ │ ├── speechRecognition.ts# Wrapper over the Web Speech API
│ │ └── store.ts # Storage containers (model and chatId)
│ ├── types/
│ │ └── index.ts # Message and context types
│ ├── index.css # Tailwind and base styles
│ └── main.tsx # Entry point
├── vite.config.ts # Vite + React plugin
├── tailwind.config.js
├── eslint.config.js
├── tsconfig*.json
└── package.json
```

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — build the production bundle
- `npm run preview` — local preview of the built bundle
- `npm run lint` — ESLint code check

## Known Limitations and notes

- The Web Speech API is not supported in all browsers; check for support. The default recognition language is `en-US` (set in `VoiceContext.tsx` within `startListening`); change it if necessary.
- The browser requires microphone access rights for voice input to work.
- There are unresolved merge conflict markers in `src/components/VoiceRecorder.tsx` (`<<<<<<< HEAD`, `>>>>>>>...`). It is recommended to resolve the conflict and unify the file's implementation. The use of `useChatId` (from `services/store.ts`) passes the `id` to `processTranscript(...)` and adds an empty assistant message before the stream. Choose the desired logic and remove the conflicting markers.

## Additional

- `models.json` contains a large list of models and can be used to dynamically populate the drop-down list in the future. - Styles — Tailwind; design and themes can be expanded as needed.

## License

No license specified. Add a license section if needed.
