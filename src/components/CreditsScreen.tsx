import React from 'react';

interface CreditsScreenProps {
  onBack: () => void;
}

const CreditsScreen: React.FC<CreditsScreenProps> = ({ onBack }) => {
  return (
    <div 
      className="credits-screen-container fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#101820] z-50 overflow-hidden"
      style={{
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* Background with darkened overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url("https://iili.io/3kEGMib.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.7)',
        }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 bg-[#2C1E0F]/80 backdrop-blur-sm p-6 rounded-lg border-2 border-amber-800/50 w-11/12 max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-amber-200 mb-4 text-center">Credits</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-amber-300 mb-2">Entwicklung</h3>
            <p className="text-amber-100">MASTIL Team</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-amber-300 mb-2">Design</h3>
            <p className="text-amber-100">Medieval Art & Animation Studio</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-amber-300 mb-2">Musik & Sound</h3>
            <p className="text-amber-100">Medieval Melody Productions</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-amber-300 mb-2">Spezielle Danksagungen</h3>
            <ul className="list-disc list-inside text-amber-100 space-y-1">
              <li>An unsere geduldigen Tester</li>
              <li>An die Open-Source-Community</li>
              <li>An alle Fans von Strategiespielen</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-amber-300 mb-2">Technologie</h3>
            <ul className="list-disc list-inside text-amber-100 space-y-1">
              <li>React</li>
              <li>TypeScript</li>
              <li>TailwindCSS</li>
              <li>Vite</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-amber-200 mb-4">© 2025 MASTIL Team</p>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-[#8B4513]/80 hover:bg-[#8B4513] text-amber-200 rounded-md border-2 border-amber-700 shadow-md transition-all duration-300 font-medium"
            style={{ 
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 219, 88, 0.3)' 
            }}
          >
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsScreen; 