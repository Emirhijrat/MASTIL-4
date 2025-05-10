import React, { useState } from 'react';
import { ElementType, ELEMENTS } from '../types/gameTypes';
import './PlayerNameInputPopup.css';

interface PlayerNameInputPopupProps {
  onSubmit: (name: string, element: ElementType) => void;
}

const PlayerNameInputPopup: React.FC<PlayerNameInputPopupProps> = ({ onSubmit }) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType | ''>(ELEMENTS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && selectedElement) {
      onSubmit(playerName.trim(), selectedElement);
    } else {
      alert('Please enter your name and select an element.');
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container medieval-popup">
        <h2 className="popup-title">Greetings, Noble Commander!</h2>
        <p className="popup-description">Before the banners are raised, tell us your name and choose your allegiance:</p>
        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label htmlFor="playerName" className="form-label">Your Name:</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="form-input medieval-input"
              placeholder="e.g., Sir Reginald"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Choose Your Element:</label>
            <div className="element-selection">
              {ELEMENTS.map((element) => (
                <button
                  key={element}
                  type="button"
                  className={`element-button medieval-button element-${element} ${selectedElement === element ? 'selected' : ''}`}
                  onClick={() => setSelectedElement(element)}
                >
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="submit-button medieval-button medieval-button-primary">Begin Conquest</button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameInputPopup;
