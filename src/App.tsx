import React from "react";
import { VoiceProvider } from "./contexts/VoiceContext";
import Header from "./components/Header";
import ChatInput from "./components/VoiceRecorder";
import ConversationHistory from "./components/ConversationHistory";
import Footer from "./components/Footer";

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ConversationHistory />
        </div>

        <div className="flex justify-center border-t border-gray-200 bg-white py-4">
          <ChatInput />
        </div>
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <VoiceProvider>
      <AppContent />
    </VoiceProvider>
  );
}

export default App;
