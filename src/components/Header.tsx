import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm py-4 px-6 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-blue-700 text-white p-2 rounded-lg">
          <Sparkles size={20} />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">VoiceGenius</h1>
      </div>
      
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Mic size={16} className="text-blue-600" />
          <span>Powered by io.net + AssemblyAI</span>
        </div>
      </div>
    </header>
  );
};

export default Header;