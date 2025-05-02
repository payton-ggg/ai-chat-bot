import React from 'react';
import { Info } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-6 text-sm text-gray-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Info size={14} />
          <span>AI Voice Agent Demo</span>
        </div>
        <div>
          <span>Powered by io.net & AssemblyAI</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;