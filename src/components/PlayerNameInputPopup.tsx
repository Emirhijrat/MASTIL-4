import React, { useState } from 'react';
import { ElementType, ELEMENTS } from '../types/gameTypes';
import './PlayerNameInputPopup.css';

interface PlayerNameInputPopupProps {
  onSubmit: (name: string, element: ElementType) => void;
}

const PlayerNameInputPopup: React.FC<PlayerNameInputPopupProps> = ({ onSubmit }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType>(ELEMENTS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && selectedElement) {
      console.log('=== PLAYER INPUT SUBMIT ===');
      console.log('Name:', playerName.trim());
      console.log('Element:', selectedElement);
      onSubmit(playerName.trim(), selectedElement);
    } else {
      alert('Please enter your name and select an element.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--mastil-bg-secondary)] rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--mastil-text-primary)] mb-6 text-center">
          Wie lautet Euer Name, Majestät?
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Euer Name..."
            className="w-full px-4 py-2 rounded-lg bg-[var(--mastil-bg-primary)] 
                     text-[var(--mastil-text-primary)] border border-[var(--mastil-border)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--mastil-accent)]"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            {ELEMENTS.map((element) => (
              <button
                key={element}
                type="button"
                className={`px-4 py-2 rounded-lg border transition-colors
                          ${selectedElement === element 
                            ? 'bg-[var(--mastil-accent)] text-white' 
                            : 'bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-primary)]'}`}
                onClick={() => setSelectedElement(element)}
              >
                {element.charAt(0).toUpperCase() + element.slice(1)}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-[var(--mastil-accent)] hover:bg-[var(--mastil-accent-hover)]
                     active:bg-[var(--mastil-accent-active)] text-white font-semibold
                     py-2 px-4 rounded-lg transition-colors duration-150"
          >
            Bestätigen
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameInputPopup;
