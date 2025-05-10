import React, { useState } from 'react';

interface PlayerNameInputPopupProps {
  onSubmit: (name: string) => void;
}

const PlayerNameInputPopup: React.FC<PlayerNameInputPopupProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name.trim() || 'Spieler');
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Euer Name..."
            className="w-full px-4 py-2 rounded-lg bg-[var(--mastil-bg-primary)] 
                     text-[var(--mastil-text-primary)] border border-[var(--mastil-border)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--mastil-accent)]"
            autoFocus
          />
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